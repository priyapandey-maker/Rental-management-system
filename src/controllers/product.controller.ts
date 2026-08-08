import { Request, Response, NextFunction } from 'express';
import { ProductService } from '../services/product.service';
import { validateString, validateOptionalString, validateOptionalEnum } from '../utils/validators';

const productService = new ProductService();

export const createProduct = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const orgId = req.context.organizationId!;
    const category_id = validateString(req.body.category_id, 'category_id', 36, 36);
    const name = validateString(req.body.name, 'name', 1, 255);
    const sku = validateString(req.body.sku, 'sku', 1, 100);
    const description = validateOptionalString(req.body.description, 'description', 65535);
    const rental_type = validateOptionalEnum(req.body.rental_type, 'rental_type', ['rentable', 'consumable', 'service']);
    const status = validateOptionalEnum(req.body.status, 'status', ['active', 'archived', 'draft']);

    const product = await productService.createProduct(orgId, {
      category_id,
      name,
      sku,
      description,
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
    const rental_type = validateOptionalEnum(req.body.rental_type, 'rental_type', ['rentable', 'consumable', 'service']) ?? undefined;
    const status = validateOptionalEnum(req.body.status, 'status', ['active', 'archived', 'draft']) ?? undefined;

    const product = await productService.updateProduct(id, orgId, {
      category_id,
      name,
      description,
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
    const products = await productService.listProducts(orgId);
    res.json(products);
  } catch (error) {
    next(error);
  }
};
