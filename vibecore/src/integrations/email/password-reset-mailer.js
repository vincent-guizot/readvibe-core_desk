import nodemailer from 'nodemailer';
import { ENV } from '../../config/env';
import { AppError } from '../../errors/app-error';

export class PasswordResetMailer {
  static getConfiguration() {
    const smtp = ENV.SMTP;
    let base;
    try { base = new URL(ENV.READVIBE_URL); } catch { /* Rejected below. */ }
    if (!smtp.HOST || !smtp.FROM || !Number.isInteger(smtp.PORT) || smtp.PORT < 1 || smtp.PORT > 65535 ||
        (!!smtp.USER !== !!smtp.PASSWORD) || !base || base.username || base.password ||
        !['http:', 'https:'].includes(base.protocol) || (ENV.NODE_ENV === 'production' && base.protocol !== 'https:')) {
      throw new AppError('Layanan email reset password belum dikonfigurasi.', 503, 'EMAIL_UNAVAILABLE');
    }
    return { smtp, base };
  }

  static async send(email, token) {
    const { smtp, base } = this.getConfiguration();
    const url = new URL('/forgot-password', base);
    url.hash = `token=${token}`;
    const transport = nodemailer.createTransport({
      host: smtp.HOST, port: smtp.PORT, secure: smtp.SECURE,
      requireTLS: ENV.NODE_ENV === 'production' && !smtp.SECURE,
      ...(smtp.USER ? { auth: { user: smtp.USER, pass: smtp.PASSWORD } } : {}),
      connectionTimeout: 5000, greetingTimeout: 5000, socketTimeout: 10000,
      disableFileAccess: true, disableUrlAccess: true,
    });
    try {
      const result = await transport.sendMail({
        from: smtp.FROM, to: email, subject: 'Reset password ReadVibe',
        text: `Buka tautan berikut untuk mengganti password ReadVibe Anda:\n\n${url.href}\n\nTautan berlaku selama 30 menit dan hanya dapat dipakai sekali. Jika Anda tidak meminta reset password, abaikan email ini.`,
      });
      if (!result.accepted?.length) throw new Error('Recipient rejected');
    } catch {
      throw new AppError('Email reset password tidak dapat dikirim. Coba lagi nanti.', 503, 'EMAIL_UNAVAILABLE');
    } finally {
      transport.close();
    }
  }
}
