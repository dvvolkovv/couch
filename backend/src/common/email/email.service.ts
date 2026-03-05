import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);
  private transporter: nodemailer.Transporter;

  constructor(private readonly config: ConfigService) {
    this.transporter = nodemailer.createTransport({
      host: config.get<string>('SMTP_HOST', 'mail.hearty.pro'),
      port: config.get<number>('SMTP_PORT', 587),
      secure: false, // STARTTLS
      auth: {
        user: config.get<string>('SMTP_USER', 'noreply@mail.hearty.pro'),
        pass: config.get<string>('SMTP_PASS'),
      },
      tls: { rejectUnauthorized: false },
    });
  }

  async sendVerificationEmail(to: string, token: string): Promise<void> {
    const appUrl = this.config.get<string>('APP_URL', 'http://138.124.61.221:8080');
    const link = `${appUrl}/auth/verify-email?token=${token}`;
    try {
      await this.transporter.sendMail({
        from: `"Hearty" <${this.config.get('SMTP_USER', 'noreply@mail.hearty.pro')}>`,
        to,
        subject: 'Подтвердите email — Hearty',
        html: `
          <div style="font-family:sans-serif;max-width:480px;margin:0 auto">
            <h2 style="color:#7c3aed">Добро пожаловать в Hearty!</h2>
            <p>Для подтверждения email перейдите по ссылке:</p>
            <a href="${link}" style="display:inline-block;padding:12px 24px;background:#7c3aed;color:#fff;border-radius:8px;text-decoration:none">Подтвердить email</a>
            <p style="color:#999;margin-top:24px;font-size:12px">Ссылка действительна 24 часа.</p>
          </div>
        `,
      });
      this.logger.log(`Verification email sent to ${to}`);
    } catch (err) {
      this.logger.error(`Failed to send verification email to ${to}: ${err}`);
    }
  }

  async sendPasswordResetEmail(to: string, token: string): Promise<void> {
    const appUrl = this.config.get<string>('APP_URL', 'http://138.124.61.221:8080');
    const link = `${appUrl}/auth/reset-password?token=${token}`;
    try {
      await this.transporter.sendMail({
        from: `"Hearty" <${this.config.get('SMTP_USER', 'noreply@mail.hearty.pro')}>`,
        to,
        subject: 'Сброс пароля — Hearty',
        html: `
          <div style="font-family:sans-serif;max-width:480px;margin:0 auto">
            <h2 style="color:#7c3aed">Сброс пароля</h2>
            <p>Для сброса пароля перейдите по ссылке:</p>
            <a href="${link}" style="display:inline-block;padding:12px 24px;background:#7c3aed;color:#fff;border-radius:8px;text-decoration:none">Сбросить пароль</a>
            <p style="color:#999;margin-top:24px;font-size:12px">Ссылка действительна 1 час. Если вы не запрашивали сброс — проигнорируйте письмо.</p>
          </div>
        `,
      });
      this.logger.log(`Password reset email sent to ${to}`);
    } catch (err) {
      this.logger.error(`Failed to send password reset email to ${to}: ${err}`);
    }
  }
}
