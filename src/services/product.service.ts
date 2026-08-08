import crypto from 'crypto';
import { ProductRepository, ProductRow } from '../repositories/product.repository';
import { CategoryRepository } from '../repositories/category.repository';
import { ConflictError, NotFoundError } from '../errors';

export class ProductService {
  constructor(
    private productRepo = new ProductRepository(),
    private categoryRepo = new CategoryRepository()
  ) {}

  async createProduct(
    orgId: string,
    data: {
      category_id: string;
      name: string;
      sku: string;
      description?: string | null;
      rental_type?: 'rentable' | 'consumable' | 'service';
      status?: 'active' | 'archived' | 'draft';
    }
  ): Promise<ProductRow> {
    const existingSku = await this.productRepo.findBySku(data.sku, orgId);
    if (existingSku) {
      throw new ConflictError(`Product with SKU '${data.sku}' already exists in this organization`);
    }

    const category = await this.categoryRepo.findById(data.category_id, orgId);
    if (!category) {
      throw new NotFoundError(`Category with ID '${data.category_id}' not found in this organization`);
    }

    const id = crypto.randomUUID();
    const product = {
      id,
      organization_id: orgId,
      category_id: data.category_id,
      name: data.name,
      sku: data.sku,
      description: data.description ?? null,
      rental_type: data.rental_type ?? 'rentable',
      status: data.status ?? 'active'
    };

    await this.productRepo.create(product);
    const created = await this.productRepo.findById(id, orgId);
    if (!created) {
      throw new Error('Failed to retrieve created product');
    }
    return created;
  }

  async getProductById(id: string, orgId: string): Promise<ProductRow> {
    const product = await this.productRepo.findById(id, orgId);
    if (!product) {
      throw new NotFoundError(`Product with ID '${id}' not found`);
    }
    return product;
  }

  async updateProduct(
    id: string,
    orgId: string,
    data: {
      category_id?: string;
      name?: string;
      description?: string | null;
      rental_type?: 'rentable' | 'consumable' | 'service';
      status?: 'active' | 'archived' | 'draft';
    }
  ): Promise<ProductRow> {
    const product = await this.getProductById(id, orgId);

    if (data.category_id && data.category_id !== product.category_id) {
      const category = await this.categoryRepo.findById(data.category_id, orgId);
      if (!category) {
        throw new NotFoundError(`Category with ID '${data.category_id}' not found in this organization`);
      }
    }

    await this.productRepo.update(id, orgId, data);
    return this.getProductById(id, orgId);
  }

  async listProducts(orgId: string): Promise<ProductRow[]> {
    return this.productRepo.list(orgId);
  }

  async deleteProduct(id: string, orgId: string): Promise<void> {
    await this.getProductById(id, orgId); // checks ownership/existence
    await this.productRepo.delete(id, orgId);
  }
}
