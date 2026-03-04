import {
  Injectable,
  UnauthorizedException,
  ConflictException,
  BadRequestException,
  ForbiddenException,
  Logger,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcryptjs';
import { randomInt } from 'node:crypto';
import { v4 as uuidv4 } from 'uuid';
import { PrismaService } from '../../common/prisma/prisma.service';
import { RedisService } from '../../common/redis/redis.service';
import { JwtPayload } from '../../common/decorators/current-user.decorator';
import {
  RegisterEmailDto,
  RegisterPhoneDto,
  VerifyPhoneDto,
  LoginEmailDto,
} from './dto/auth.dto';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);
  private readonly BCRYPT_ROUNDS = 12;
  private readonly OTP_TTL = 300; // 5 minutes
  private readonly OTP_MAX_ATTEMPTS = 3;

  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly redis: RedisService,
  ) {}

  async registerEmail(dto: RegisterEmailDto) {
    if (!dto.privacyAccepted || !dto.termsAccepted) {
      throw new BadRequestException(
        'Privacy policy and terms must be accepted',
      );
    }

    const existing = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });
    if (existing) {
      throw new ConflictException('Email is already registered');
    }

    const passwordHash = await bcrypt.hash(dto.password, this.BCRYPT_ROUNDS);
    const user = await this.prisma.user.create({
      data: {
        email: dto.email,
        passwordHash,
        role: dto.role,
        firstName: dto.firstName,
        authProvider: 'EMAIL',
        privacyAcceptedAt: new Date(),
        termsAcceptedAt: new Date(),
      },
    });

    // Generate email verification token
    const verificationToken = uuidv4();
    await this.redis.set(
      `email_verify:${verificationToken}`,
      user.id,
      86400, // 24 hours
    );

    // In production, send verification email here
    this.logger.log(`Email verification link sent to ${dto.email}`);

    return {
      userId: user.id,
      email: user.email,
      emailVerified: false,
      message: `Verification email sent to ${dto.email}`,
    };
  }

  async registerPhone(dto: RegisterPhoneDto) {
    const existing = await this.prisma.user.findUnique({
      where: { phone: dto.phone },
    });
    if (existing) {
      throw new ConflictException('Phone number is already registered');
    }

    // Rate limit check
    const rateLimitKey = `otp_rate:${dto.phone}`;
    const attempts = await this.redis.get(rateLimitKey);
    if (attempts && parseInt(attempts) >= this.OTP_MAX_ATTEMPTS) {
      throw new BadRequestException('Too many OTP requests. Try again later.');
    }

    // Generate 6-digit OTP
    const code = randomInt(100000, 999999).toString();
    await this.redis.set(`otp:${dto.phone}`, code, this.OTP_TTL);
    await this.redis.setJson(
      `otp_meta:${dto.phone}`,
      { role: dto.role },
      this.OTP_TTL,
    );

    // Increment rate limit counter
    const newAttempts = attempts ? parseInt(attempts) + 1 : 1;
    await this.redis.set(rateLimitKey, newAttempts.toString(), 300);

    // In production, send SMS here
    this.logger.log(`OTP sent to ***${dto.phone.slice(-4)}`);

    return {
      phone: dto.phone,
      codeSentAt: new Date().toISOString(),
      retryAfter: 60,
    };
  }

  async verifyPhone(dto: VerifyPhoneDto) {
    const storedCode = await this.redis.get(`otp:${dto.phone}`);
    if (!storedCode || storedCode !== dto.code) {
      throw new BadRequestException('Invalid or expired verification code');
    }

    await this.redis.del(`otp:${dto.phone}`);
    const meta = await this.redis.getJson<{ role: string }>(
      `otp_meta:${dto.phone}`,
    );

    let user = await this.prisma.user.findUnique({
      where: { phone: dto.phone },
    });
    let isNewUser = false;

    if (!user) {
      isNewUser = true;
      user = await this.prisma.user.create({
        data: {
          phone: dto.phone,
          phoneVerified: true,
          role: (meta?.role as any) || 'CLIENT',
          authProvider: 'PHONE',
          privacyAcceptedAt: new Date(),
          termsAcceptedAt: new Date(),
        },
      });
    } else {
      await this.prisma.user.update({
        where: { id: user.id },
        data: { phoneVerified: true, lastLoginAt: new Date() },
      });
    }

    const tokens = await this.generateTokens(user.id, user.role, user.email);

    return {
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
      user: {
        id: user.id,
        phone: user.phone,
        role: user.role,
        isNewUser,
      },
    };
  }

  async verifyEmail(token: string) {
    const userId = await this.redis.get(`email_verify:${token}`);
    if (!userId) {
      throw new BadRequestException('Invalid or expired verification token');
    }

    await this.redis.del(`email_verify:${token}`);
    const user = await this.prisma.user.update({
      where: { id: userId },
      data: { emailVerified: true, lastLoginAt: new Date() },
    });

    const tokens = await this.generateTokens(user.id, user.role, user.email);

    return {
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
      user: {
        id: user.id,
        email: user.email,
        emailVerified: true,
      },
    };
  }

  async loginEmail(dto: LoginEmailDto) {
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });

    if (!user || !user.passwordHash) {
      throw new UnauthorizedException('Invalid email or password');
    }

    const isPasswordValid = await bcrypt.compare(
      dto.password,
      user.passwordHash,
    );
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid email or password');
    }

    if (user.isBanned) {
      throw new UnauthorizedException('Account is suspended');
    }

    if (!user.emailVerified) {
      throw new UnauthorizedException('Email not verified. Please check your inbox for the verification link.');
    }

    await this.prisma.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() },
    });

    const tokens = await this.generateTokens(user.id, user.role, user.email);

    return {
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        firstName: user.firstName,
      },
    };
  }

  async loginPhone(phone: string) {
    const user = await this.prisma.user.findUnique({ where: { phone } });
    if (!user) {
      throw new UnauthorizedException('Phone number not registered');
    }

    // Generate 6-digit OTP
    const code = randomInt(100000, 999999).toString();
    await this.redis.set(`otp:${phone}`, code, this.OTP_TTL);
    this.logger.log(`Login OTP sent to ***${phone.slice(-4)}`);

    return {
      phone,
      codeSentAt: new Date().toISOString(),
      retryAfter: 60,
    };
  }

  async refreshTokens(refreshTokenValue: string) {
    if (!refreshTokenValue) {
      throw new UnauthorizedException('Refresh token is required');
    }

    const tokenHash = this.hashToken(refreshTokenValue);
    const storedToken = await this.prisma.refreshToken.findUnique({
      where: { token: tokenHash },
      include: { user: true },
    });

    if (
      !storedToken ||
      storedToken.revokedAt ||
      storedToken.expiresAt < new Date()
    ) {
      throw new UnauthorizedException('Invalid or expired refresh token');
    }

    // Revoke old token
    await this.prisma.refreshToken.update({
      where: { id: storedToken.id },
      data: { revokedAt: new Date() },
    });

    const tokens = await this.generateTokens(
      storedToken.user.id,
      storedToken.user.role,
      storedToken.user.email,
    );

    return {
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
    };
  }

  async logout(refreshTokenValue: string) {
    if (!refreshTokenValue) return;

    const tokenHash = this.hashToken(refreshTokenValue);
    await this.prisma.refreshToken
      .update({
        where: { token: tokenHash },
        data: { revokedAt: new Date() },
      })
      .catch(() => {
        // Token may not exist, ignore
      });
  }

  async oauthGoogle(idToken: string) {
    if (process.env.NODE_ENV !== 'development') {
      throw new ForbiddenException('OAuth stubs disabled in non-development environments');
    }
    // Stub: in production, verify the Google ID token and extract user info
    this.logger.warn('Google OAuth stub: token verification skipped');
    const mockEmail = `google_user_${Date.now()}@gmail.com`;
    return this.oauthUpsert(mockEmail, 'GOOGLE', 'Google', 'User');
  }

  async oauthVk(code: string, redirectUri: string) {
    if (process.env.NODE_ENV !== 'development') {
      throw new ForbiddenException('OAuth stubs disabled in non-development environments');
    }
    // Stub: in production, exchange code for VK access token and get user info
    this.logger.warn('VK OAuth stub: code exchange skipped');
    const mockEmail = `vk_user_${Date.now()}@vk.com`;
    return this.oauthUpsert(mockEmail, 'VK', 'VK', 'User');
  }

  private async oauthUpsert(
    email: string,
    provider: 'GOOGLE' | 'VK',
    firstName: string,
    lastName: string,
  ) {
    let user = await this.prisma.user.findUnique({ where: { email } });
    let isNewUser = false;

    if (!user) {
      isNewUser = true;
      user = await this.prisma.user.create({
        data: {
          email,
          emailVerified: true,
          role: 'CLIENT',
          authProvider: provider,
          firstName,
          lastName,
          privacyAcceptedAt: new Date(),
          termsAcceptedAt: new Date(),
        },
      });
    } else {
      await this.prisma.user.update({
        where: { id: user.id },
        data: { lastLoginAt: new Date() },
      });
    }

    const tokens = await this.generateTokens(user.id, user.role, user.email);

    return {
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        role: user.role,
        isNewUser,
      },
    };
  }

  private async generateTokens(
    userId: string,
    role: string,
    email: string | null,
  ) {
    const payload: JwtPayload = { sub: userId, role, email: email || undefined };
    const accessToken = this.jwtService.sign(payload);

    const refreshTokenValue = uuidv4();
    const refreshTokenHash = this.hashToken(refreshTokenValue);
    const refreshExpiration = this.configService.get<string>(
      'JWT_REFRESH_EXPIRATION',
      '7d',
    );
    // Parse refreshExpiration (e.g., '7d', '30d')
    const match = refreshExpiration.match(/^(\d+)d$/);
    const days = match ? parseInt(match[1], 10) : 7;
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + days);

    await this.prisma.refreshToken.create({
      data: {
        userId,
        token: refreshTokenHash,
        expiresAt,
      },
    });

    return { accessToken, refreshToken: refreshTokenValue };
  }

  private hashToken(token: string): string {
    const crypto = require('crypto');
    return crypto.createHash('sha256').update(token).digest('hex');
  }
}
