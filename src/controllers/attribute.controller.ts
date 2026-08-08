import { Request, Response, NextFunction } from 'express';
import { AttributeService } from '../services/attribute.service';
import { validateString } from '../utils/validators';

const attrService = new AttributeService();

export const createAttribute = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const orgId = req.context.organizationId!;
    const name = validateString(req.body.name, 'name', 1, 100);
    const code = validateString(req.body.code, 'code', 1, 50);

    const attr = await attrService.createAttribute(orgId, { name, code });
    res.status(201).json(attr);
  } catch (error) {
    next(error);
  }
};

export const getAttribute = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const orgId = req.context.organizationId!;
    const id = validateString(req.params.id, 'id', 1, 36);
    const attr = await attrService.getAttributeById(id, orgId);
    res.json(attr);
  } catch (error) {
    next(error);
  }
};

export const listAttributes = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const orgId = req.context.organizationId!;
    const attrs = await attrService.listAttributes(orgId);
    res.json(attrs);
  } catch (error) {
    next(error);
  }
};

export const createAttributeValue = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const orgId = req.context.organizationId!;
    const id = validateString(req.params.id, 'id', 1, 36);
    const value = validateString(req.body.value, 'value', 1, 100);
    const code = validateString(req.body.code, 'code', 1, 50);

    const attrValue = await attrService.createAttributeValue(orgId, id, { value, code });
    res.status(201).json(attrValue);
  } catch (error) {
    next(error);
  }
};

export const listAttributeValues = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const orgId = req.context.organizationId!;
    const id = validateString(req.params.id, 'id', 1, 36);
    const values = await attrService.getValuesByAttributeId(id, orgId);
    res.json(values);
  } catch (error) {
    next(error);
  }
};
