import { ReadRepository } from '../repositories/read.repository';

export class ReadService {
  constructor(private readRepo = new ReadRepository()) {}

  async listTransactions(orgId: string, page: number, limit: number) {
    const offset = (page - 1) * limit;
    const [items, total] = await Promise.all([
      this.readRepo.listTransactionsWithPagination(orgId, limit, offset),
      this.readRepo.countTransactions(orgId)
    ]);

    return {
      data: items,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit)
      }
    };
  }

  async listInvoices(orgId: string, page: number, limit: number) {
    const offset = (page - 1) * limit;
    const [items, total] = await Promise.all([
      this.readRepo.listInvoicesWithPagination(orgId, limit, offset),
      this.readRepo.countInvoices(orgId)
    ]);

    return {
      data: items,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit)
      }
    };
  }
}
