import crypto from 'crypto';
import { CustomerRepository, CustomerRow } from '../repositories/customer.repository';
import { ConflictError, NotFoundError } from '../errors';

export class CustomerService {
  constructor(private customerRepo = new CustomerRepository()) {}

  async createCustomer(
    orgId: string,
    data: {
      customer_number: string;
      first_name: string;
      last_name: string;
      email: string;
      phone?: string | null;
      company_name?: string | null;
      tax_id?: string | null;
      status?: 'active' | 'inactive' | 'blacklisted';
    }
  ): Promise<CustomerRow> {
    const existingEmail = await this.customerRepo.findByEmail(data.email, orgId);
    if (existingEmail) {
      throw new ConflictError(`Customer with email '${data.email}' already exists in this organization`);
    }

    const existingNum = await this.customerRepo.findByNumber(data.customer_number, orgId);
    if (existingNum) {
      throw new ConflictError(`Customer with number '${data.customer_number}' already exists in this organization`);
    }

    const id = crypto.randomUUID();
    const customer = {
      id,
      organization_id: orgId,
      customer_number: data.customer_number,
      first_name: data.first_name,
      last_name: data.last_name,
      email: data.email,
      phone: data.phone ?? null,
      company_name: data.company_name ?? null,
      tax_id: data.tax_id ?? null,
      status: data.status ?? 'active'
    };

    await this.customerRepo.create(customer);
    const created = await this.customerRepo.findById(id, orgId);
    if (!created) {
      throw new Error('Failed to retrieve created customer');
    }
    return created;
  }

  async getCustomerById(id: string, orgId: string): Promise<CustomerRow> {
    const customer = await this.customerRepo.findById(id, orgId);
    if (!customer) {
      throw new NotFoundError(`Customer with ID '${id}' not found`);
    }
    return customer;
  }

  async updateCustomer(
    id: string,
    orgId: string,
    data: {
      first_name?: string;
      last_name?: string;
      email?: string;
      phone?: string | null;
      company_name?: string | null;
      tax_id?: string | null;
      status?: 'active' | 'inactive' | 'blacklisted';
    }
  ): Promise<CustomerRow> {
    const customer = await this.getCustomerById(id, orgId);

    if (data.email && data.email !== customer.email) {
      const existingEmail = await this.customerRepo.findByEmail(data.email, orgId);
      if (existingEmail) {
        throw new ConflictError(`Customer with email '${data.email}' already exists in this organization`);
      }
    }

    await this.customerRepo.update(id, orgId, data);
    return this.getCustomerById(id, orgId);
  }

  async listCustomers(orgId: string): Promise<CustomerRow[]> {
    return this.customerRepo.list(orgId);
  }
}
