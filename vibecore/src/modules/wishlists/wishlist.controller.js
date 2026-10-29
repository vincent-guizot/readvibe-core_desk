import { WishlistService } from './wishlist.service';
import { ApiResponse } from '../../utils/api-response';

export class WishlistController {
  static async getMyWishlist(req, res, next) {
    try {
      const data = await WishlistService.getMyWishlist(req.user.id);
      return ApiResponse.success(res, data, 'Wishlist berhasil dimuat.');
    } catch (err) {
      next(err);
    }
  }

  static async getUserPublicWishlist(req, res, next) {
    try {
      const data = await WishlistService.getUserPublicWishlist(req.params.userId);
      return ApiResponse.success(res, data, 'Wishlist publik berhasil dimuat.');
    } catch (err) {
      next(err);
    }
  }

  static async add(req, res, next) {
    try {
      const item = await WishlistService.add(req.user.id, req.body);
      return ApiResponse.created(res, item, 'Buku berhasil ditambahkan ke wishlist.');
    } catch (err) {
      next(err);
    }
  }

  static async update(req, res, next) {
    try {
      const item = await WishlistService.update(req.params.id, req.user.id, req.body);
      return ApiResponse.success(res, item, 'Item wishlist berhasil diperbarui.');
    } catch (err) {
      next(err);
    }
  }

  static async remove(req, res, next) {
    try {
      await WishlistService.remove(req.params.id, req.user.id);
      return ApiResponse.success(res, null, 'Buku berhasil dihapus dari wishlist.');
    } catch (err) {
      next(err);
    }
  }
}
