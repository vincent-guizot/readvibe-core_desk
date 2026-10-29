import db from '../../../models';
import { AppError } from '../../errors/app-error';
import { ErrorCodes } from '../../contracts/error-codes';

export class MoodService {
  static async list() {
    return await db.mood_tag.findAll({
      order: [['name', 'ASC']],
    });
  }

  static async getById(id) {
    const mood = await db.mood_tag.findByPk(id, {
      include: [
        {
          model: db.book,
          as: 'books',
          through: { attributes: [] },
        },
      ],
    });
    if (!mood) {
      throw AppError.notFound('Mood tag tidak ditemukan.', ErrorCodes.NOT_FOUND);
    }
    return mood;
  }

  static async create({ name, description, color, icon }) {
    const existing = await db.mood_tag.findOne({ where: { name } });
    if (existing) {
      throw AppError.conflict(`Mood tag "${name}" sudah ada.`, ErrorCodes.RESOURCE_ALREADY_EXISTS);
    }

    return await db.mood_tag.create({
      name,
      description,
      color: color || '#EF786B',
      icon: icon || 'Sparkles',
    });
  }

  static async update(id, { name, description, color, icon }) {
    const mood = await db.mood_tag.findByPk(id);
    if (!mood) {
      throw AppError.notFound('Mood tag tidak ditemukan.', ErrorCodes.NOT_FOUND);
    }

    if (name && name !== mood.name) {
      const existing = await db.mood_tag.findOne({ where: { name } });
      if (existing) {
        throw AppError.conflict(`Mood tag "${name}" sudah ada.`, ErrorCodes.RESOURCE_ALREADY_EXISTS);
      }
    }

    await mood.update({
      name: name !== undefined ? name : mood.name,
      description: description !== undefined ? description : mood.description,
      color: color !== undefined ? color : mood.color,
      icon: icon !== undefined ? icon : mood.icon,
    });

    return mood;
  }

  static async delete(id) {
    const mood = await db.mood_tag.findByPk(id);
    if (!mood) {
      throw AppError.notFound('Mood tag tidak ditemukan.', ErrorCodes.NOT_FOUND);
    }
    await mood.destroy();
    return mood;
  }
}
