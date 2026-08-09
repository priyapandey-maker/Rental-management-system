import { DashboardService } from './dashboard.service';
import { OrganizationRepository } from '../repositories/organization.repository';
import { AdminRepository } from '../repositories/admin.repository';

export class AdminService {
  private dashboardService = new DashboardService();
  private orgRepo = new OrganizationRepository();
  private adminRepo = new AdminRepository();

  async getPlatformDashboard() {
    // Calling without orgId returns platform-wide metrics
    return this.dashboardService.getDashboardSummary(undefined);
  }

  async listVendors() {
    return this.orgRepo.listAll();
  }

  async updateVendorStatus(id: string, status: 'active' | 'inactive' | 'suspended') {
    await this.orgRepo.updateStatus(id, status);
  }

  async listCustomers() {
    return this.adminRepo.listCustomers();
  }

  async listProducts() {
    return this.adminRepo.listProducts();
  }

  async listAssets() {
    return this.adminRepo.listAssets();
  }

  async listTransactions() {
    return this.adminRepo.listTransactions();
  }
}
