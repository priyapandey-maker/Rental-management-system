import crypto from 'crypto';
import { AttributeRepository, AttributeRow, AttributeValueRow } from '../repositories/attribute.repository';
import { ConflictError, NotFoundError } from '../errors';

export class AttributeService {
  constructor(private attrRepo = new AttributeRepository()) {}

  async createAttribute(
    orgId: string,
    data: {
      name: string;
      code: string;
    }
  ): Promise<AttributeRow> {
    const existing = await this.attrRepo.findAttributeByCode(data.code, orgId);
    if (existing) {
      throw new ConflictError(`Attribute with code '${data.code}' already exists in this organization`);
    }

    const id = crypto.randomUUID();
    const attr = {
      id,
      organization_id: orgId,
      name: data.name,
      code: data.code
    };

    await this.attrRepo.createAttribute(attr);
    const created = await this.attrRepo.findAttributeById(id, orgId);
    if (!created) {
      throw new Error('Failed to retrieve created attribute');
    }
    return created;
  }

  async getAttributeById(id: string, orgId: string): Promise<AttributeRow> {
    const attr = await this.attrRepo.findAttributeById(id, orgId);
    if (!attr) {
      throw new NotFoundError(`Attribute with ID '${id}' not found`);
    }
    return attr;
  }

  async listAttributes(orgId: string): Promise<AttributeRow[]> {
    return this.attrRepo.listAttributes(orgId);
  }

  async createAttributeValue(
    orgId: string,
    attributeId: string,
    data: {
      value: string;
      code: string;
    }
  ): Promise<AttributeValueRow> {
    await this.getAttributeById(attributeId, orgId);

    const existing = await this.attrRepo.findAttributeValueByCode(attributeId, data.code);
    if (existing) {
      throw new ConflictError(`Attribute value with code '${data.code}' already exists for this attribute`);
    }

    const id = crypto.randomUUID();
    const val = {
      id,
      attribute_id: attributeId,
      value: data.value,
      code: data.code
    };

    await this.attrRepo.createAttributeValue(val);
    const created = await this.attrRepo.findAttributeValueById(id);
    if (!created) {
      throw new Error('Failed to retrieve created attribute value');
    }
    return created;
  }

  async getValuesByAttributeId(attributeId: string, orgId: string): Promise<AttributeValueRow[]> {
    await this.getAttributeById(attributeId, orgId);
    return this.attrRepo.findValuesByAttributeId(attributeId);
  }
}
