import { DashboardRepository } from '../repositories/dashboard.repository';

export class DashboardService {
  constructor(private dashboardRepo = new DashboardRepository()) {}

  async getDashboardSummary(orgId?: string) {
    const [revenue, activeRentals, assetAvailability, outstandingPayments] = await Promise.all([
      this.dashboardRepo.getRevenueSummary(orgId),
      this.dashboardRepo.getActiveRentalsCount(orgId),
      this.dashboardRepo.getAssetAvailability(orgId),
      this.dashboardRepo.getOutstandingPaymentsCount(orgId)
    ]);

    return {
      revenue,
      activeRentals,
      assetAvailability,
      outstandingPayments
    };
  }
}
