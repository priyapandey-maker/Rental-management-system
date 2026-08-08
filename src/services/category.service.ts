import crypto from 'crypto';
import { CategoryRepository, CategoryRow } from '../repositories/category.repository';
import { ConflictError, NotFoundError } from '../errors';

export class CategoryService {
  constructor(private categoryRepo = new CategoryRepository()) {}

  async createCategory(
    orgId: string,
    data: {
      name: string;
      code: string;
      parent_id?: string | null;
      description?: string | null;
      status?: 'active' | 'inactive';
    }
  ): Promise<CategoryRow> {
    const existingCode = await this.categoryRepo.findByCode(data.code, orgId);
    if (existingCode) {
      throw new ConflictError(`Category with code '${data.code}' already exists in this organization`);
    }

    if (data.parent_id) {
      const parent = await this.categoryRepo.findById(data.parent_id, orgId);
      if (!parent) {
        throw new NotFoundError(`Parent category with ID '${data.parent_id}' not found in this organization`);
      }
    }

    const id = crypto.randomUUID();
    const category = {
      id,
      organization_id: orgId,
      parent_id: data.parent_id ?? null,
      name: data.name,
      code: data.code,
      description: data.description ?? null,
      status: data.status ?? 'active'
    };

    await this.categoryRepo.create(category);
    const created = await this.categoryRepo.findById(id, orgId);
    if (!created) {
      throw new Error('Failed to retrieve created category');
    }
    return created;
  }

  async getCategoryById(id: string, orgId: string): Promise<CategoryRow> {
    const category = await this.categoryRepo.findById(id, orgId);
    if (!category) {
      throw new NotFoundError(`Category with ID '${id}' not found`);
    }
    return category;
  }

  async listCategories(orgId: string): Promise<CategoryRow[]> {
    return this.categoryRepo.list(orgId);
  }
}
