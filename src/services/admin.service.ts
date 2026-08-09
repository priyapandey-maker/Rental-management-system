import { DashboardService } from './dashboard.service';
import { OrganizationRepository } from '../repositories/organization.repository';
import { AdminRepository } from '../repositories/admin.repository';

export class AdminService {
  private dashboardService = new DashboardService();
  private orgRepo = new OrganizationRepository();
  private adminRepo = new AdminRepository();

  async getPlatformDashboard() {
    return this.dashboardService.getDashboardSummary(undefined);
  }

  async listVendors() {
    return this.orgRepo.listAll();
  }

  async listVendorsPaginated(page: number, limit: number, search?: string) {
    return this.adminRepo.listVendorsPaginated(page, limit, search);
  }

  async updateVendorStatus(id: string, status: 'active' | 'inactive' | 'suspended') {
    await this.orgRepo.updateStatus(id, status);
  }

  async listCustomers() {
    return this.adminRepo.listCustomers();
  }

  async listCustomersPaginated(page: number, limit: number, search?: string) {
    return this.adminRepo.listCustomersPaginated(page, limit, search);
  }

  async listProducts() {
    return this.adminRepo.listProducts();
  }

  async listProductsPaginated(page: number, limit: number, search?: string, status?: string) {
    return this.adminRepo.listProductsPaginated(page, limit, search, status);
  }

  async listAssets() {
    return this.adminRepo.listAssets();
  }

  async listAssetsPaginated(page: number, limit: number, search?: string, lifecycleStatus?: string) {
    return this.adminRepo.listAssetsPaginated(page, limit, search, lifecycleStatus);
  }

  async listTransactions() {
    return this.adminRepo.listTransactions();
  }

  async listTransactionsPaginated(page: number, limit: number, status?: string) {
    return this.adminRepo.listTransactionsPaginated(page, limit, status);
  }
}
