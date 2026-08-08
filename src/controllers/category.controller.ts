import { Request, Response, NextFunction } from 'express';
import { CategoryService } from '../services/category.service';
import { validateString, validateOptionalString, validateOptionalEnum } from '../utils/validators';
import { ValidationError } from '../errors';

const categoryService = new CategoryService();

export const createCategory = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const orgId = req.context.organizationId!;
    const name = validateString(req.body.name, 'name', 1, 100);
    const code = validateString(req.body.code, 'code', 1, 50);
    const parent_id = validateOptionalString(req.body.parent_id, 'parent_id', 36);
    const description = validateOptionalString(req.body.description, 'description', 65535);
    const status = validateOptionalEnum(req.body.status, 'status', ['active', 'inactive']);

    if (parent_id && req.body.id && parent_id === req.body.id) {
      throw new ValidationError('A category cannot be its own parent');
    }

    const category = await categoryService.createCategory(orgId, {
      name,
      code,
      parent_id,
      description,
      status: status ?? undefined
    });
    res.status(201).json(category);
  } catch (error) {
    next(error);
  }
};

export const getCategory = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const orgId = req.context.organizationId!;
    const id = validateString(req.params.id, 'id', 1, 36);
    const category = await categoryService.getCategoryById(id, orgId);
    res.json(category);
  } catch (error) {
    next(error);
  }
};

export const listCategories = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const orgId = req.context.organizationId!;
    const categories = await categoryService.listCategories(orgId);
    res.json(categories);
  } catch (error) {
    next(error);
  }
};
