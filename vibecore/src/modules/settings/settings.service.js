import db from '../../../models';
import { ENV } from '../../config/env';
import { AppError } from '../../errors/app-error';
import { GoogleBooksClient } from '../../integrations/google-books/google-books.client';
import { CandidateSelector } from '../recommendations/candidate-selector';
import { Ranker } from '../recommendations/ranker';
import {
  settingDefaults as defaults,
  validateSettingsPayload,
} from './settings.validator';

export class SettingsService {
  static async getSettings() {
    const saved = await db.application_setting.findByPk('backoffice');
    return {
      ...defaults,
      ...saved?.value,
      updatedAt: saved?.updatedAt || null,
      updatedBy: saved?.updatedBy || null,
    };
  }
  static validate(input) {
    const error = validateSettingsPayload({ body: input });
    if (error) throw AppError.badRequest(error);
    const updates = { ...input };
    if (updates.enableGeminiExplanations && !ENV.GEMINI_API_KEY)
      throw AppError.badRequest(
        'Integrasi Gemini belum dikonfigurasi di server.',
      );
    return updates;
  }
  static async updateSettings(input, actorId) {
    const updates = this.validate(input);
    return db.sequelize.transaction(async (transaction) => {
      const [record] = await db.application_setting.findOrCreate({
        where: { id: 'backoffice' },
        defaults: { value: defaults, updatedBy: actorId },
        transaction,
      });
      await record.reload({ transaction, lock: transaction.LOCK.UPDATE });
      await record.update(
        {
          value: { ...defaults, ...record.value, ...updates },
          updatedBy: actorId,
        },
        { transaction },
      );
      return {
        ...record.value,
        updatedAt: record.updatedAt,
        updatedBy: record.updatedBy,
      };
    });
  }
  static async health() {
    let database = 'unavailable';
    try {
      await db.sequelize.authenticate();
      database = 'healthy';
    } catch {
      /* Report only safe service state. */
    }
    let googleBooks = 'unavailable';
    try {
      await GoogleBooksClient.searchVolumes('isbn:9780735211292', 1);
      googleBooks = 'reachable';
    } catch {
      /* Provider details remain server-side. */
    }
    return {
      api: 'healthy',
      database,
      googleBooks,
      checkedAt: new Date().toISOString(),
      googleBooksKeyConfigured: !!ENV.GOOGLE_BOOKS_API_KEY,
    };
  }
  static async preview(input) {
    const settings = { ...defaults, ...this.validate(input.settings || {}) };
    const moods = Array.isArray(input.moods)
      ? input.moods.filter((m) => typeof m === 'string').slice(0, 10)
      : [];
    return Ranker.rank(
      await CandidateSelector.selectCandidates(),
      moods,
      '',
      settings,
    ).map(({ book, matchScore }) => ({
      id: book.id,
      title: book.title,
      matchScore,
    }));
  }
}
