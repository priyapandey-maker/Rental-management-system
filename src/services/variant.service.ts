import crypto from 'crypto';
import { VariantRepository, VariantRow } from '../repositories/variant.repository';
import { ProductRepository } from '../repositories/product.repository';
import { AttributeRepository } from '../repositories/attribute.repository';
import { ConflictError, NotFoundError, ValidationError } from '../errors';
import { runInTransaction } from '../db/transaction';

export class VariantService {
  constructor(
    private variantRepo = new VariantRepository(),
    private productRepo = new ProductRepository(),
    private attrRepo = new AttributeRepository()
  ) {}

  async createVariant(
    orgId: string,
    data: {
      product_id: string;
      sku: string;
      name: string;
      barcode?: string | null;
      attribute_value_ids: string[];
      status?: 'active' | 'inactive' | 'archived';
    }
  ): Promise<VariantRow> {
    const product = await this.productRepo.findById(data.product_id, orgId);
    if (!product) {
      throw new NotFoundError(`Product with ID '${data.product_id}' not found in this organization`);
    }

    const existingSku = await this.variantRepo.findBySku(data.sku, orgId);
    if (existingSku) {
      throw new ConflictError(`Variant SKU '${data.sku}' already exists in this organization`);
    }

    if (!data.attribute_value_ids || data.attribute_value_ids.length === 0) {
      throw new ValidationError('At least one attribute value is required to create a variant');
    }

    const seenAttributes = new Set<string>();
    for (const valId of data.attribute_value_ids) {
      const val = await this.attrRepo.findAttributeValueById(valId);
      if (!val) {
        throw new NotFoundError(`Attribute value with ID '${valId}' not found`);
      }
      
      const attr = await this.attrRepo.findAttributeById(val.attribute_id, orgId);
      if (!attr) {
        throw new ValidationError(`Attribute value '${valId}' belongs to an attribute not found in this organization`);
      }

      if (seenAttributes.has(val.attribute_id)) {
        throw new ValidationError(`Variant cannot contain multiple values for the same attribute: '${attr.name}'`);
      }
      seenAttributes.add(val.attribute_id);
    }

    const id = crypto.randomUUID();
    const variant = {
      id,
      organization_id: orgId,
      product_id: data.product_id,
      sku: data.sku,
      name: data.name,
      barcode: data.barcode ?? null,
      status: data.status ?? 'active'
    };

    return runInTransaction(async (conn) => {
      await this.variantRepo.create(variant, conn);
      for (const valId of data.attribute_value_ids) {
        await this.variantRepo.addAttributeValue(id, valId, conn);
      }
      const created = await this.variantRepo.findById(id, orgId, conn);
      if (!created) {
        throw new Error('Failed to retrieve created variant');
      }
      return created;
    });
  }

  async getVariantById(id: string, orgId: string): Promise<VariantRow> {
    const variant = await this.variantRepo.findById(id, orgId);
    if (!variant) {
      throw new NotFoundError(`Variant with ID '${id}' not found`);
    }
    return variant;
  }

  async listVariantsByProductId(productId: string, orgId: string): Promise<VariantRow[]> {
    const product = await this.productRepo.findById(productId, orgId);
    if (!product) {
      throw new NotFoundError(`Product with ID '${productId}' not found in this organization`);
    }
    return this.variantRepo.listByProductId(productId, orgId);
  }
}
