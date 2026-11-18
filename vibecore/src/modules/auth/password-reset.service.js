import { randomBytes, createHash } from 'node:crypto';
import db from '../../../models';
import bcrypt from 'bcryptjs';
import { AppError } from '../../errors/app-error';
import { PasswordResetMailer } from '../../integrations/email/password-reset-mailer';

const hashToken = (token) => createHash('sha256').update(token).digest('hex');
const invalidToken = () => AppError.badRequest('Tautan reset tidak valid atau sudah kedaluwarsa.', 'INVALID_RESET_TOKEN');

export class PasswordResetService {
  static async requestReset({ email }) {
    PasswordResetMailer.getConfiguration();
    const token = randomBytes(32).toString('hex');
    const record = await db.sequelize.transaction(async (transaction) => {
      const user = await db.user.findOne({ where: { email: email.trim() }, transaction, lock: transaction.LOCK.UPDATE });
      if (!user || user.status !== 'Active') return null;
      await db.password_reset_token.destroy({ where: { userId: user.id }, transaction });
      return db.password_reset_token.create({
        userId: user.id, tokenHash: hashToken(token), expiresAt: new Date(Date.now() + 30 * 60 * 1000),
      }, { transaction });
    });
    if (!record) return;
    try {
      await PasswordResetMailer.send(email.trim(), token);
    } catch (error) {
      await db.password_reset_token.destroy({ where: { id: record.id } });
      throw error;
    }
  }

  static async resetPassword({ token, password }) {
    const tokenHash = hashToken(token);
    const candidate = await db.password_reset_token.findOne({ where: { tokenHash }, attributes: ['userId'] });
    if (!candidate) throw invalidToken();
    const passwordHash = await bcrypt.hash(password, 12);
    await db.sequelize.transaction(async (transaction) => {
      const user = await db.user.findByPk(candidate.userId, { transaction, lock: transaction.LOCK.UPDATE });
      const record = await db.password_reset_token.findOne({ where: { tokenHash }, transaction, lock: transaction.LOCK.UPDATE });
      if (!user || user.status !== 'Active' || !record || record.usedAt || record.expiresAt.getTime() <= Date.now()) throw invalidToken();
      await user.update({ password: passwordHash, tokenVersion: user.tokenVersion + 1 }, { transaction });
      await db.password_reset_token.update({ usedAt: new Date() }, { where: { userId: user.id, usedAt: null }, transaction });
    });
  }
}
