import { Request, Response, NextFunction } from 'express';
import { AssetService } from '../services/asset.service';
import { validateString, validateOptionalString, validateOptionalNumber, validateOptionalDate } from '../utils/validators';

const assetService = new AssetService();

export const createAsset = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const orgId = req.context.organizationId!;
    const product_variant_id = validateString(req.body.product_variant_id, 'product_variant_id', 3, 36);
    const asset_tag = validateString(req.body.asset_tag, 'asset_tag', 1, 80);
    const serial_number = validateOptionalString(req.body.serial_number, 'serial_number', 150);
    const qr_code = validateOptionalString(req.body.qr_code, 'qr_code', 150);
    const acquisition_date = validateOptionalDate(req.body.acquisition_date, 'acquisition_date');
    const acquisition_cost = validateOptionalNumber(req.body.acquisition_cost, 'acquisition_cost', 0);
    const condition_status = validateOptionalString(req.body.condition_status, 'condition_status', 30);
    const lifecycle_status = validateOptionalString(req.body.lifecycle_status, 'lifecycle_status', 30);
    const location = validateOptionalString(req.body.location, 'location', 200);

    const asset = await assetService.createAsset(orgId, {
      product_variant_id,
      asset_tag,
      serial_number,
      qr_code,
      acquisition_date,
      acquisition_cost: acquisition_cost ?? undefined,
      condition_status: condition_status as any ?? undefined,
      lifecycle_status: lifecycle_status as any ?? undefined,
      location
    });
    res.status(201).json(asset);
  } catch (error) {
    next(error);
  }
};

export const getAsset = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const orgId = req.context.organizationId!;
    const id = validateString(req.params.id, 'id', 1, 36);
    const asset = await assetService.getAssetById(id, orgId);
    res.json(asset);
  } catch (error) {
    next(error);
  }
};

export const listAssets = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const orgId = req.context.organizationId!;
    const assets = await assetService.listAssets(orgId);
    res.json(assets);
  } catch (error) {
    next(error);
  }
};

export const updateAsset = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const orgId = req.context.organizationId!;
    const id = validateString(req.params.id, 'id', 1, 36);
    const product_variant_id = validateOptionalString(req.body.product_variant_id, 'product_variant_id', 36) ?? undefined;
    const asset_tag = validateOptionalString(req.body.asset_tag, 'asset_tag', 80) ?? undefined;
    const serial_number = validateOptionalString(req.body.serial_number, 'serial_number', 150);
    const qr_code = validateOptionalString(req.body.qr_code, 'qr_code', 150);
    const acquisition_date = validateOptionalDate(req.body.acquisition_date, 'acquisition_date');
    const acquisition_cost = validateOptionalNumber(req.body.acquisition_cost, 'acquisition_cost', 0);
    const condition_status = validateOptionalString(req.body.condition_status, 'condition_status', 30);
    const lifecycle_status = validateOptionalString(req.body.lifecycle_status, 'lifecycle_status', 30);
    const location = validateOptionalString(req.body.location, 'location', 200);

    const asset = await assetService.updateAsset(id, orgId, {
      product_variant_id,
      asset_tag,
      serial_number,
      qr_code,
      acquisition_date,
      acquisition_cost: acquisition_cost ?? undefined,
      condition_status: condition_status as any ?? undefined,
      lifecycle_status: lifecycle_status as any ?? undefined,
      location
    });
    res.json(asset);
  } catch (error) {
    next(error);
  }
};

export const deleteAsset = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const orgId = req.context.organizationId!;
    const id = validateString(req.params.id, 'id', 1, 36);
    await assetService.deleteAsset(id, orgId);
    res.status(204).end();
  } catch (error) {
    next(error);
  }
};
