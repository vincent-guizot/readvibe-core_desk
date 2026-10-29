import bcrypt from 'bcryptjs';
import db from '../models';
import { generateToken } from '../middleware/auth';

class AuthController {
  static async register(req, res) {
    try {
      const { username, email, password, fullname, role = 'Member' } = req.body;

      if (!username || !email || !password) {
        return res.status(400).json({ message: 'Username, email, dan password wajib diisi.' });
      }

      const existingUser = await db.user.findOne({
        where: { email },
      });
      if (existingUser) {
        return res.status(409).json({ message: 'Email sudah terdaftar.' });
      }

      const existingUsername = await db.user.findOne({
        where: { username },
      });
      if (existingUsername) {
        return res.status(409).json({ message: 'Username sudah digunakan.' });
      }

      const hashedPassword = await bcrypt.hash(password, 10);

      // Create profile first
      const newProfile = await db.profile.create({
        fullname: fullname || username,
        image: `https://api.dicebear.com/7.x/bottts/svg?seed=${username}`,
      });

      // Create user
      const newUser = await db.user.create({
        username,
        email,
        password: hashedPassword,
        role: role === 'Admin' || role === 'Librarian' ? role : 'Member',
        profileId: newProfile.id,
      });

      const token = generateToken(newUser);

      return res.status(201).json({
        message: 'Registrasi berhasil.',
        token,
        user: {
          id: newUser.id,
          username: newUser.username,
          email: newUser.email,
          role: newUser.role,
          profile: newProfile,
        },
      });
    } catch (error) {
      return res.status(500).json({ message: 'Gagal melakukan registrasi.', error: error.message });
    }
  }

  static async login(req, res) {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        return res.status(400).json({ message: 'Email dan password wajib diisi.' });
      }

      const user = await db.user.findOne({
        where: { email },
        include: [{ model: db.profile, as: 'profile' }],
      });

      if (!user) {
        return res.status(401).json({ message: 'Email atau password salah.' });
      }

      const isValidPassword = await bcrypt.compare(password, user.password);
      if (!isValidPassword) {
        return res.status(401).json({ message: 'Email atau password salah.' });
      }

      const token = generateToken(user);

      return res.status(200).json({
        message: 'Login berhasil.',
        token,
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          role: user.role,
          profile: user.profile,
        },
      });
    } catch (error) {
      return res.status(500).json({ message: 'Gagal login.', error: error.message });
    }
  }

  static async me(req, res) {
    try {
      return res.status(200).json({
        user: {
          id: req.user.id,
          username: req.user.username,
          email: req.user.email,
          role: req.user.role,
          profile: req.user.profile,
        },
      });
    } catch (error) {
      return res.status(500).json({ message: 'Gagal mengambil data profil.', error: error.message });
    }
  }

  static async updateProfile(req, res) {
    try {
      const { fullname, image, age, nationality, gender } = req.body;
      const profile = await db.profile.findByPk(req.user.profileId);
      if (!profile) {
        return res.status(404).json({ message: 'Profil tidak ditemukan.' });
      }

      await profile.update({ fullname, image, age, nationality, gender });

      return res.status(200).json({
        message: 'Profil berhasil diperbarui.',
        profile,
      });
    } catch (error) {
      return res.status(500).json({ message: 'Gagal memperbarui profil.', error: error.message });
    }
  }
}

export default AuthController;
