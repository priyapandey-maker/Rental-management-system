import crypto from 'crypto';
import { AddressRepository, AddressRow } from '../repositories/address.repository';
import { CustomerRepository } from '../repositories/customer.repository';
import { NotFoundError } from '../errors';
import { runInTransaction } from '../db/transaction';

export class AddressService {
  constructor(
    private addressRepo = new AddressRepository(),
    private customerRepo = new CustomerRepository()
  ) {}

  async createAddress(
    orgId: string,
    customerId: string,
    data: {
      type: 'billing' | 'shipping' | 'primary' | 'other';
      address_line1: string;
      address_line2?: string | null;
      city: string;
      state: string;
      postal_code: string;
      country?: string;
      is_default?: boolean;
    }
  ): Promise<AddressRow> {
    const customer = await this.customerRepo.findById(customerId, orgId);
    if (!customer) {
      throw new NotFoundError(`Customer with ID '${customerId}' not found in this organization`);
    }

    const id = crypto.randomUUID();
    const existingAddresses = await this.addressRepo.findByCustomerId(customerId, orgId);
    const isFirstAddress = existingAddresses.length === 0;
    const shouldBeDefault = isFirstAddress || !!data.is_default;

    return runInTransaction(async (conn) => {
      if (shouldBeDefault) {
        await this.addressRepo.clearDefaultsForCustomer(customerId, orgId, conn);
      }

      const newAddress = {
        id,
        organization_id: orgId,
        customer_id: customerId,
        type: data.type,
        address_line1: data.address_line1,
        address_line2: data.address_line2 ?? null,
        city: data.city,
        state: data.state,
        postal_code: data.postal_code,
        country: data.country ?? 'India',
        is_default: shouldBeDefault ? 1 : 0
      };

      await this.addressRepo.create(newAddress, conn);
      const created = await this.addressRepo.findById(id, orgId, conn);
      if (!created) {
        throw new Error('Failed to retrieve created address');
      }
      return created;
    });
  }

  async getAddressById(id: string, orgId: string): Promise<AddressRow> {
    const address = await this.addressRepo.findById(id, orgId);
    if (!address) {
      throw new NotFoundError(`Address with ID '${id}' not found`);
    }
    return address;
  }

  async updateAddress(
    id: string,
    orgId: string,
    data: {
      type?: 'billing' | 'shipping' | 'primary' | 'other';
      address_line1?: string;
      address_line2?: string | null;
      city?: string;
      state?: string;
      postal_code?: string;
      country?: string;
      is_default?: boolean;
    }
  ): Promise<AddressRow> {
    const address = await this.getAddressById(id, orgId);

    return runInTransaction(async (conn) => {
      const updates: any = { ...data };

      if (data.is_default !== undefined) {
        const shouldBeDefault = !!data.is_default;
        if (shouldBeDefault) {
          await this.addressRepo.clearDefaultsForCustomer(address.customer_id, orgId, conn);
          updates.is_default = 1;
        } else {
          updates.is_default = 0;
        }
      }

      await this.addressRepo.update(id, orgId, updates, conn);
      const updated = await this.addressRepo.findById(id, orgId, conn);
      if (!updated) {
        throw new Error('Failed to retrieve updated address');
      }
      return updated;
    });
  }

  async listAddresses(customerId: string, orgId: string): Promise<AddressRow[]> {
    const customer = await this.customerRepo.findById(customerId, orgId);
    if (!customer) {
      throw new NotFoundError(`Customer with ID '${customerId}' not found in this organization`);
    }
    return this.addressRepo.findByCustomerId(customerId, orgId);
  }
}
