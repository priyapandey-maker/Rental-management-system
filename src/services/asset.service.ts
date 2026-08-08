import crypto from 'crypto';
import { AssetRepository, AssetRow } from '../repositories/asset.repository';
import { VariantRepository } from '../repositories/variant.repository';
import { ConflictError, NotFoundError } from '../errors';

export class AssetService {
  constructor(
    private assetRepo = new AssetRepository(),
    private variantRepo = new VariantRepository()
  ) {}

  async createAsset(
    orgId: string,
    data: {
      product_variant_id: string;
      asset_tag: string;
      serial_number?: string | null;
      qr_code?: string | null;
      acquisition_date?: string | null;
      acquisition_cost?: number | null;
      condition_status?: 'NEW' | 'GOOD' | 'FAIR' | 'DAMAGED' | 'CRITICAL';
      lifecycle_status?: 'AVAILABLE' | 'RESERVED' | 'ALLOCATED' | 'RENTED' | 'UNDER_MAINTENANCE' | 'DAMAGED' | 'LOST' | 'RETIRED';
      location?: string | null;
    }
  ): Promise<AssetRow> {
    const variant = await this.variantRepo.findById(data.product_variant_id, orgId);
    if (!variant) {
      throw new NotFoundError(`Product variant with ID '${data.product_variant_id}' not found in this organization`);
    }

    const existingTag = await this.assetRepo.findByTag(data.asset_tag, orgId);
    if (existingTag) {
      throw new ConflictError(`Asset tag '${data.asset_tag}' already exists in this organization`);
    }

    if (data.serial_number) {
      const existingSn = await this.assetRepo.findBySerialNumber(data.serial_number, orgId);
      if (existingSn) {
        throw new ConflictError(`Asset with serial number '${data.serial_number}' already exists in this organization`);
      }
    }

    if (data.qr_code) {
      const existingQr = await this.assetRepo.findByQrCode(data.qr_code, orgId);
      if (existingQr) {
        throw new ConflictError(`Asset with QR code '${data.qr_code}' already exists in this organization`);
      }
    }

    const id = crypto.randomUUID();
    const asset = {
      id,
      organization_id: orgId,
      product_variant_id: data.product_variant_id,
      asset_tag: data.asset_tag,
      serial_number: data.serial_number ?? null,
      qr_code: data.qr_code ?? null,
      acquisition_date: data.acquisition_date ?? null,
      acquisition_cost: data.acquisition_cost ?? null,
      condition_status: data.condition_status ?? 'GOOD',
      lifecycle_status: data.lifecycle_status ?? 'AVAILABLE',
      location: data.location ?? null
    };

    await this.assetRepo.create(asset);
    const created = await this.assetRepo.findById(id, orgId);
    if (!created) {
      throw new Error('Failed to retrieve created asset');
    }
    return created;
  }

  async getAssetById(id: string, orgId: string): Promise<AssetRow> {
    const asset = await this.assetRepo.findById(id, orgId);
    if (!asset) {
      throw new NotFoundError(`Asset with ID '${id}' not found`);
    }
    return asset;
  }

  async listAssets(orgId: string): Promise<AssetRow[]> {
    return this.assetRepo.list(orgId);
  }

  async updateAsset(
    id: string,
    orgId: string,
    data: {
      product_variant_id?: string;
      asset_tag?: string;
      serial_number?: string | null;
      qr_code?: string | null;
      acquisition_date?: string | null;
      acquisition_cost?: number | null;
      condition_status?: 'NEW' | 'GOOD' | 'FAIR' | 'DAMAGED' | 'CRITICAL';
      lifecycle_status?: 'AVAILABLE' | 'RESERVED' | 'ALLOCATED' | 'RENTED' | 'UNDER_MAINTENANCE' | 'DAMAGED' | 'LOST' | 'RETIRED';
      location?: string | null;
    }
  ): Promise<AssetRow> {
    const asset = await this.getAssetById(id, orgId);

    if (data.product_variant_id && data.product_variant_id !== asset.product_variant_id) {
      const variant = await this.variantRepo.findById(data.product_variant_id, orgId);
      if (!variant) {
        throw new NotFoundError(`Product variant with ID '${data.product_variant_id}' not found in this organization`);
      }
    }

    if (data.asset_tag && data.asset_tag !== asset.asset_tag) {
      const existingTag = await this.assetRepo.findByTag(data.asset_tag, orgId);
      if (existingTag) {
        throw new ConflictError(`Asset tag '${data.asset_tag}' already exists in this organization`);
      }
    }

    if (data.serial_number && data.serial_number !== asset.serial_number) {
      const existingSn = await this.assetRepo.findBySerialNumber(data.serial_number, orgId);
      if (existingSn) {
        throw new ConflictError(`Asset with serial number '${data.serial_number}' already exists in this organization`);
      }
    }

    if (data.qr_code && data.qr_code !== asset.qr_code) {
      const existingQr = await this.assetRepo.findByQrCode(data.qr_code, orgId);
      if (existingQr) {
        throw new ConflictError(`Asset with QR code '${data.qr_code}' already exists in this organization`);
      }
    }

    await this.assetRepo.update(id, orgId, data);
    return this.getAssetById(id, orgId);
  }

  async deleteAsset(id: string, orgId: string): Promise<void> {
    await this.getAssetById(id, orgId); // checks ownership/existence
    await this.assetRepo.delete(id, orgId);
  }
}
