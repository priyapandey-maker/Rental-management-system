import { Request, Response, NextFunction } from 'express';
import { VariantService } from '../services/variant.service';
import { validateString, validateOptionalString, validateOptionalEnum } from '../utils/validators';
import { ValidationError } from '../errors';

const variantService = new VariantService();

export const createVariant = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const orgId = req.context.organizationId!;
    const product_id = validateString(req.body.product_id, 'product_id', 3, 36);
    const sku = validateString(req.body.sku, 'sku', 1, 100);
    const name = validateString(req.body.name, 'name', 1, 255);
    const barcode = validateOptionalString(req.body.barcode, 'barcode', 100);
    const status = validateOptionalEnum(req.body.status, 'status', ['active', 'inactive', 'archived']);

    const attribute_value_ids = req.body.attribute_value_ids;
    if (!Array.isArray(attribute_value_ids) || attribute_value_ids.length === 0 || attribute_value_ids.some(x => typeof x !== 'string')) {
      throw new ValidationError("Field 'attribute_value_ids' must be a non-empty array of strings");
    }

    const variant = await variantService.createVariant(orgId, {
      product_id,
      sku,
      name,
      barcode,
      attribute_value_ids,
      status: status ?? undefined
    });
    res.status(201).json(variant);
  } catch (error) {
    next(error);
  }
};

export const getVariant = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const orgId = req.context.organizationId!;
    const id = validateString(req.params.id, 'id', 1, 36);
    const variant = await variantService.getVariantById(id, orgId);
    res.json(variant);
  } catch (error) {
    next(error);
  }
};

export const listVariantsByProduct = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const orgId = req.context.organizationId!;
    const productId = validateString(req.params.productId, 'productId', 1, 36);
    const variants = await variantService.listVariantsByProductId(productId, orgId);
    res.json(variants);
  } catch (error) {
    next(error);
  }
};
