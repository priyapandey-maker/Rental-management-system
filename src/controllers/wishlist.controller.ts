import { Request, Response } from 'express';
import crypto from 'crypto';
import { WishlistRepository, WishlistInsert } from '../repositories/wishlist.repository';
import { ProductRepository } from '../repositories/product.repository';

const wishlistRepo = new WishlistRepository();
const productRepo = new ProductRepository();

export const addWishlist = async (req: Request, res: Response) => {
  try {
    const orgId = req.context?.organizationId || '';
    // Assuming auth middleware puts user details in req.context.userId
    const customerId = req.context?.userId || '';
    const { product_id: productId } = req.body;

    if (!productId) {
      return res.status(400).json({ error: 'product_id is required' });
    }

    // Verify product exists
    const product = await productRepo.findById(productId, orgId);
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    const newWishlist: WishlistInsert = {
      id: crypto.randomUUID(),
      organization_id: orgId,
      customer_id: customerId,
      product_id: productId
    };

    await wishlistRepo.add(newWishlist);
    res.status(201).json({ message: 'Added to wishlist', data: newWishlist });
  } catch (error) {
    console.error('Error adding to wishlist:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const removeWishlist = async (req: Request, res: Response) => {
  try {
    const orgId = req.context?.organizationId || '';
    const customerId = req.context?.userId || '';
    const { productId } = req.params;

    if (!productId) {
      return res.status(400).json({ error: 'productId is required' });
    }

    await wishlistRepo.remove(customerId, productId as string, orgId);
    res.status(200).json({ message: 'Removed from wishlist' });
  } catch (error) {
    console.error('Error removing from wishlist:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getWishlist = async (req: Request, res: Response) => {
  try {
    const orgId = req.context?.organizationId || '';
    const customerId = req.context?.userId || '';

    const wishlistRows = await wishlistRepo.listByCustomer(customerId, orgId);
    // Return an array of productIds to the frontend
    const productIds = wishlistRows.map(row => row.product_id);
    
    res.status(200).json({ data: productIds });
  } catch (error) {
    console.error('Error fetching wishlist:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
