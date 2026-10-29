import db from '../models';

class UserController {
  static async getAllUsers(req, res) {
    try {
      const { role } = req.query;
      const where = {};
      if (role) where.role = role;

      const users = await db.user.findAll({
        where,
        attributes: ['id', 'username', 'email', 'role', 'createdAt', 'updatedAt'],
        include: [{ model: db.profile, as: 'profile' }],
        order: [['createdAt', 'DESC']],
      });
      return res.status(200).json({ data: users });
    } catch (error) {
      return res.status(500).json({ message: 'Gagal memuat daftar pengguna.', error: error.message });
    }
  }

  static async findById(req, res) {
    try {
      const { id } = req.params;
      const user = await db.user.findByPk(id, {
        attributes: ['id', 'username', 'email', 'role', 'createdAt'],
        include: [{ model: db.profile, as: 'profile' }],
      });
      if (!user) {
        return res.status(404).json({ message: 'Pengguna tidak ditemukan.' });
      }
      return res.status(200).json({ data: user });
    } catch (error) {
      return res.status(500).json({ message: 'Gagal memuat profil pengguna.', error: error.message });
    }
  }

  static async updateUserRole(req, res) {
    try {
      const { id } = req.params;
      const { role } = req.body;

      if (!['Member', 'Librarian', 'Admin'].includes(role)) {
        return res.status(400).json({ message: 'Peran tidak valid. Pilihan: Member, Librarian, Admin.' });
      }

      const user = await db.user.findByPk(id);
      if (!user) {
        return res.status(404).json({ message: 'Pengguna tidak ditemukan.' });
      }

      // Prevent self demotion of the last admin if needed
      await user.update({ role });
      return res.status(200).json({ message: `Peran pengguna berhasil diubah menjadi "${role}".`, data: user });
    } catch (error) {
      return res.status(500).json({ message: 'Gagal memperbarui peran pengguna.', error: error.message });
    }
  }

  static async delete(req, res) {
    try {
      const { id } = req.params;
      const user = await db.user.findByPk(id);
      if (!user) {
        return res.status(404).json({ message: 'Pengguna tidak ditemukan.' });
      }
      await user.destroy();
      return res.status(200).json({ message: 'Pengguna berhasil dihapus.' });
    } catch (error) {
      return res.status(500).json({ message: 'Gagal menghapus pengguna.', error: error.message });
    }
  }
}

export default UserController;
