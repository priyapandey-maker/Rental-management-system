import React from 'react';
import { ChartBarIcon, ArrowTrendingUpIcon, DocumentChartBarIcon } from '@heroicons/react/24/outline';

export const VendorAnalytics = () => {
  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Vendor Analytics</h1>
        <p className="text-sm text-gray-500 mt-1">
          Performance overview, rental reports, and catalog analytics for your organization.
        </p>
      </div>

      {/* Analytics Info Card */}
      <div className="bg-white rounded-xl border border-gray-200 p-8 shadow-sm text-center max-w-2xl mx-auto space-y-6">
        <div className="w-16 h-16 bg-indigo-50 rounded-2xl flex items-center justify-center mx-auto">
          <ChartBarIcon className="h-8 w-8 text-indigo-600" />
        </div>
        <div className="space-y-2">
          <h2 className="text-xl font-bold text-gray-800">Advanced Analytics Coming Soon</h2>
          <p className="text-sm text-gray-500 max-w-md mx-auto">
            We are currently building automated charting, dynamic revenue analytics, and exportable inventory spreadsheets.
          </p>
        </div>
        <div className="grid grid-cols-2 gap-4 max-w-md mx-auto pt-4">
          <div className="p-4 bg-gray-50 rounded-xl border border-gray-150 text-left">
            <ArrowTrendingUpIcon className="h-6 w-6 text-indigo-600 mb-2" />
            <p className="text-sm font-semibold text-gray-800">Growth Tracking</p>
            <p className="text-xs text-gray-400 mt-0.5">Monthly revenue charts and rental growth rates.</p>
          </div>
          <div className="p-4 bg-gray-50 rounded-xl border border-gray-150 text-left">
            <DocumentChartBarIcon className="h-6 w-6 text-indigo-600 mb-2" />
            <p className="text-sm font-semibold text-gray-800">Export Reports</p>
            <p className="text-xs text-gray-400 mt-0.5">Download CSV inventory and customer lists.</p>
          </div>
        </div>
      </div>
    </div>
  );
};
