import React, { useState, useEffect } from 'react';
import { dashboardService } from '../../../services/dashboardService';
import StatCard from './components/StatCard';
import RecentOrders from './components/RecentOrders';
import BestSellingProducts from './components/BestSellingProducts';
import TablesStatus from './components/TablesStatus';
import OrdersChart from './components/OrdersChart';
import LoadingSpinner from './components/LoadingSpinner';

const Dashboard = () => {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await dashboardService.getDashboardData();
      
      if (response.success) {
        setDashboardData(response.data);
      } else {
        setError(response.message || 'Failed to load dashboard data');
      }
    } catch (err) {
      setError('Unable to connect to server. Please try again.');
      console.error('Dashboard error:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 text-xl mb-4">Error</div>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={fetchDashboardData}
            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (!dashboardData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-amber-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-gray-500 text-xl">No data available</div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Restaurant Dashboard</h1>
          <p className="text-sm sm:text-base text-gray-600 mt-1 sm:mt-2">Welcome back! Here's what's happening today.</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-6 sm:mb-8">
          <StatCard
            title="Orders Today"
            value={dashboardData.orders_today}
            icon="📦"
            color="blue"
          />
          <StatCard
            title="Earnings Today"
            value={`€${dashboardData.earnings_today.toFixed(2)}`}
            icon="💰"
            color="green"
          />
          <StatCard
            title="QR Scans"
            value={dashboardData.total_qr_scans}
            icon="📱"
            color="purple"
          />
          <StatCard
            title="Active Tables"
            value={dashboardData.summary_stats?.active_tables || 0}
            icon="🍽️"
            color="orange"
          />
        </div>

        {/* Charts and Tables */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 mb-6 sm:mb-8">
          {/* Orders Chart */}
          <div className="lg:col-span-2">
            <OrdersChart data={dashboardData.orders_graph} />
          </div>

          {/* Tables Status */}
          <div>
            <TablesStatus tables={dashboardData.tables} />
          </div>
        </div>

        {/* Recent Orders and Best Selling */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
          <RecentOrders orders={dashboardData.recent_orders} />
          <BestSellingProducts products={dashboardData.best_selling} />
        </div>

        {/* Additional Summary Stats */}
        <div className="mt-6 sm:mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          <div className="bg-white rounded-lg shadow p-4 sm:p-6">
            <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-2">Total Orders</h3>
            <p className="text-2xl sm:text-3xl font-bold text-blue-600">
              {dashboardData.summary_stats?.total_orders || 0}
            </p>
          </div>
          <div className="bg-white rounded-lg shadow p-4 sm:p-6">
            <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-2">Total Earnings</h3>
            <p className="text-2xl sm:text-3xl font-bold text-green-600">
              €{(dashboardData.summary_stats?.total_earnings || 0).toFixed(2)}
            </p>
          </div>
          <div className="bg-white rounded-lg shadow p-4 sm:p-6 sm:col-span-2 lg:col-span-1">
            <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-2">Avg Order Value</h3>
            <p className="text-2xl sm:text-3xl font-bold text-purple-600">
              €{(dashboardData.summary_stats?.average_order_value || 0).toFixed(2)}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;