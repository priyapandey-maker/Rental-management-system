import { Request, Response, NextFunction } from 'express';
import { ProductService } from '../services/product.service';
import { validateString, validateOptionalString, validateOptionalEnum } from '../utils/validators';

const productService = new ProductService();

export const createProduct = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const orgId = req.context.organizationId!;
    const category_id = validateString(req.body.category_id, 'category_id', 3, 36);
    const name = validateString(req.body.name, 'name', 1, 255);
    const sku = validateString(req.body.sku, 'sku', 1, 100);
    const description = validateOptionalString(req.body.description, 'description', 65535);
    const image_url = validateOptionalString(req.body.image_url, 'image_url', 1024);
    const rental_type = validateOptionalEnum(req.body.rental_type, 'rental_type', ['rentable', 'consumable', 'service']);
    const status = validateOptionalEnum(req.body.status, 'status', ['active', 'archived', 'draft']);

    const product = await productService.createProduct(orgId, {
      category_id,
      name,
      sku,
      description,
      image_url,
      rental_type: rental_type ?? undefined,
      status: status ?? undefined
    });
    res.status(201).json(product);
  } catch (error) {
    next(error);
  }
};

export const getProduct = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const orgId = req.context.organizationId!;
    const id = validateString(req.params.id, 'id', 1, 36);
    const product = await productService.getProductById(id, orgId);
    res.json(product);
  } catch (error) {
    next(error);
  }
};

export const updateProduct = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const orgId = req.context.organizationId!;
    const id = validateString(req.params.id, 'id', 1, 36);
    const category_id = validateOptionalString(req.body.category_id, 'category_id', 36) ?? undefined;
    const name = validateOptionalString(req.body.name, 'name', 255) ?? undefined;
    const description = validateOptionalString(req.body.description, 'description', 65535);
    const image_url = validateOptionalString(req.body.image_url, 'image_url', 1024);
    const rental_type = validateOptionalEnum(req.body.rental_type, 'rental_type', ['rentable', 'consumable', 'service']) ?? undefined;
    const status = validateOptionalEnum(req.body.status, 'status', ['active', 'archived', 'draft']) ?? undefined;

    const product = await productService.updateProduct(id, orgId, {
      category_id,
      name,
      description,
      image_url,
      rental_type,
      status
    });
    res.json(product);
  } catch (error) {
    next(error);
  }
};

export const listProducts = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const orgId = req.context.organizationId!;
    const page = Math.max(1, parseInt(req.query.page as string) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit as string) || 20));
    const search = (req.query.search as string) || undefined;
    const status = (req.query.status as string) || undefined;
    const result = await productService.listProductsPaginated(orgId, page, limit, search, status);
    res.json({
      data: result.data,
      pagination: {
        page,
        limit,
        totalItems: result.total,
        totalPages: Math.ceil(result.total / limit),
      },
    });
  } catch (error) {
    next(error);
  }
};

export const deleteProduct = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const orgId = req.context.organizationId!;
    const id = validateString(req.params.id, 'id', 1, 36);
    await productService.deleteProduct(id, orgId);
    res.status(204).end();
  } catch (error) {
    next(error);
  }
};
