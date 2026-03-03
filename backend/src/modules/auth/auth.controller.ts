import {
  Controller,
  Post,
  Body,
  Res,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { Response } from 'express';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { Public } from '../../common/decorators/public.decorator';
import {
  RegisterEmailDto,
  RegisterPhoneDto,
  VerifyPhoneDto,
  VerifyEmailDto,
  LoginEmailDto,
  LoginPhoneDto,
  OAuthGoogleDto,
  OAuthVkDto,
} from './dto/auth.dto';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @Post('register/email')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Register with email and password' })
  async registerEmail(@Body() dto: RegisterEmailDto) {
    return this.authService.registerEmail(dto);
  }

  @Public()
  @Post('register/phone')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Start phone registration (sends SMS code)' })
  async registerPhone(@Body() dto: RegisterPhoneDto) {
    return this.authService.registerPhone(dto);
  }

  @Public()
  @Post('verify/phone')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Verify phone with SMS code' })
  async verifyPhone(
    @Body() dto: VerifyPhoneDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const result = await this.authService.verifyPhone(dto);
    this.setRefreshTokenCookie(res, result.refreshToken);
    return {
      accessToken: result.accessToken,
      user: result.user,
    };
  }

  @Public()
  @Post('verify/email')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Verify email with token' })
  async verifyEmail(
    @Body() dto: VerifyEmailDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const result = await this.authService.verifyEmail(dto.token);
    this.setRefreshTokenCookie(res, result.refreshToken);
    return {
      accessToken: result.accessToken,
      user: result.user,
    };
  }

  @Public()
  @Post('login/email')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Login with email and password' })
  async loginEmail(
    @Body() dto: LoginEmailDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const result = await this.authService.loginEmail(dto);
    this.setRefreshTokenCookie(res, result.refreshToken);
    return {
      accessToken: result.accessToken,
      user: result.user,
    };
  }

  @Public()
  @Post('login/phone')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Start phone login (sends SMS code)' })
  async loginPhone(@Body() dto: LoginPhoneDto) {
    return this.authService.loginPhone(dto.phone);
  }

  @Public()
  @Post('oauth/google')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'OAuth login via Google' })
  async oauthGoogle(
    @Body() dto: OAuthGoogleDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const result = await this.authService.oauthGoogle(dto.idToken);
    this.setRefreshTokenCookie(res, result.refreshToken);
    return {
      accessToken: result.accessToken,
      user: result.user,
    };
  }

  @Public()
  @Post('oauth/vk')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'OAuth login via VK' })
  async oauthVk(
    @Body() dto: OAuthVkDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const result = await this.authService.oauthVk(dto.code, dto.redirectUri);
    this.setRefreshTokenCookie(res, result.refreshToken);
    return {
      accessToken: result.accessToken,
      user: result.user,
    };
  }

  @Public()
  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Refresh access token' })
  async refresh(@Res({ passthrough: true }) res: Response) {
    const refreshToken = res.req.cookies?.['refresh_token'];
    const result = await this.authService.refreshTokens(refreshToken);
    this.setRefreshTokenCookie(res, result.refreshToken);
    return { accessToken: result.accessToken };
  }

  @Post('logout')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Logout (revoke refresh token)' })
  async logout(@Res({ passthrough: true }) res: Response) {
    const refreshToken = res.req.cookies?.['refresh_token'];
    await this.authService.logout(refreshToken);
    res.clearCookie('refresh_token', { path: '/v1/auth' });
  }

  private setRefreshTokenCookie(res: Response, token: string) {
    res.cookie('refresh_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      path: '/v1/auth',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });
  }
}
