import React, { useState, useEffect } from 'react';
import { adminService } from '../../../services/adminService';
import StatCard from '../Restaurant_owner/components/StatCard';
import LoadingSpinner from '../Restaurant_owner/components/LoadingSpinner';
import CustomSelect from '../Restaurant_owner/components/CustomSelect';
import { TrendingUp, Store, Users, ShoppingCart, DollarSign, Activity, Calendar } from 'lucide-react';

const AdminDashboard = () => {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [period, setPeriod] = useState('all');

  useEffect(() => {
    fetchDashboardData();
  }, [period]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await adminService.getDashboard(period);
      
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
            className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded"
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

  const { summary, top_restaurants, orders_by_status, chart_data, recent_orders } = dashboardData;

  return (
    <div className="w-full">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6 sm:mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Admin Dashboard</h1>
            <p className="text-sm sm:text-base text-gray-600 mt-1 sm:mt-2">
              System overview and analytics
            </p>
          </div>
          
          {/* Period Selector */}
          <div className="mt-4 sm:mt-0 w-48">
            <CustomSelect
              value={period}
              onChange={(value) => setPeriod(value)}
              options={[
                { value: 'all', label: 'All Time' },
                { value: 'today', label: 'Today' },
                { value: 'week', label: 'Last Week' },
                { value: 'month', label: 'Last Month' },
                { value: 'year', label: 'Last Year' },
              ]}
              placeholder="Select Period"
              icon={Calendar}
            />
          </div>
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-6 sm:mb-8">
          <StatCard
            title="Total Restaurants"
            value={`${summary.restaurants.total} (${summary.restaurants.active} active)`}
            icon={<Store className="w-8 h-8" />}
            color="orange"
          />
          <StatCard
            title="Total Users"
            value={`${summary.users.total} (${summary.users.active} active)`}
            icon={<Users className="w-8 h-8" />}
            color="purple"
          />
          <StatCard
            title="Total Orders"
            value={summary.orders.total}
            icon={<ShoppingCart className="w-8 h-8" />}
            color="green"
          />
          <StatCard
            title="Total Sales"
            value={`${summary.orders.total_sales.toFixed(2)} MAD`}
            icon={<DollarSign className="w-8 h-8" />}
            color="orange"
          />
        </div>

        {/* Additional Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-6 sm:mb-8">
          <div className="bg-white rounded-lg shadow p-4 sm:p-6">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-base sm:text-lg font-semibold text-gray-900">Blocked Restaurants</h3>
              <Activity className="w-5 h-5 text-red-500" />
            </div>
            <p className="text-2xl sm:text-3xl font-bold text-red-600">
              {summary.restaurants.blocked}
            </p>
          </div>
          
          <div className="bg-white rounded-lg shadow p-4 sm:p-6">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-base sm:text-lg font-semibold text-gray-900">Blocked Users</h3>
              <Activity className="w-5 h-5 text-red-500" />
            </div>
            <p className="text-2xl sm:text-3xl font-bold text-red-600">
              {summary.users.blocked}
            </p>
          </div>
          
          <div className="bg-white rounded-lg shadow p-4 sm:p-6">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-base sm:text-lg font-semibold text-gray-900">Avg Order Value</h3>
              <TrendingUp className="w-5 h-5 text-orange-500" />
            </div>
            <p className="text-2xl sm:text-3xl font-bold text-orange-600">
              {summary.orders.average_order_value.toFixed(2)} MAD
            </p>
          </div>
        </div>

        {/* Top Restaurants and Orders by Status */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 mb-6 sm:mb-8">
          {/* Top Restaurants */}
          <div className="bg-white rounded-lg shadow p-4 sm:p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Top Restaurants by Sales</h3>
            <div className="space-y-3">
              {top_restaurants && top_restaurants.length > 0 ? (
                top_restaurants.slice(0, 5).map((restaurant, index) => (
                  <div
                    key={restaurant.id}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                  >
                    <div className="flex items-center space-x-3">
                      <span className="flex items-center justify-center w-8 h-8 rounded-full bg-orange-100 text-orange-600 font-semibold">
                        {index + 1}
                      </span>
                      <div>
                        <p className="font-medium text-gray-900">{restaurant.name}</p>
                        <p className="text-sm text-gray-500">{restaurant.owner}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-gray-900">
                        {restaurant.total_sales.toFixed(2)} MAD
                      </p>
                      <p className="text-xs text-gray-500">{restaurant.orders_count} orders</p>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-gray-500 text-center py-4">No restaurants data available</p>
              )}
            </div>
          </div>

          {/* Orders by Status */}
          <div className="bg-white rounded-lg shadow p-4 sm:p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Orders by Status</h3>
            <div className="space-y-3">
              {orders_by_status && Object.keys(orders_by_status).length > 0 ? (
                Object.entries(orders_by_status).map(([status, count]) => (
                  <div
                    key={status}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                  >
                    <span className="font-medium text-gray-900 capitalize">{status}</span>
                    <span className="px-3 py-1 bg-orange-100 text-orange-600 rounded-full font-semibold">
                      {count}
                    </span>
                  </div>
                ))
              ) : (
                <p className="text-gray-500 text-center py-4">No orders data available</p>
              )}
            </div>
          </div>
        </div>

        {/* Sales Chart Data */}
        {chart_data && chart_data.length > 0 && (
          <div className="bg-white rounded-lg shadow p-4 sm:p-6 mb-6 sm:mb-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Sales Over Last 30 Days</h3>
            <div className="overflow-x-auto">
              <div className="flex gap-2 min-w-[900px]">
                {chart_data.map((day, index) => {
                  const maxSales = Math.max(...chart_data.map(d => d.sales));
                  const height = maxSales > 0 ? (day.sales / maxSales) * 100 : 0;
                  
                  return (
                    <div key={index} className="flex-1 flex flex-col items-center">
                      <div className="w-full bg-gray-200 rounded-t" style={{ height: '120px', display: 'flex', flexDirection: 'column', justifyContent: 'flex-end' }}>
                        <div
                          className="w-full bg-orange-500 rounded-t transition-all"
                          style={{ height: `${height}%` }}
                          title={`${day.date}: ${day.sales.toFixed(2)} MAD`}
                        />
                      </div>
                      <span className="text-xs text-gray-500 mt-1">
                        {new Date(day.date).getDate()}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
            <div className="mt-4 flex justify-between text-sm text-gray-600">
              <span>Total Sales: {chart_data.reduce((sum, day) => sum + day.sales, 0).toFixed(2)} MAD</span>
              <span>Total Orders: {chart_data.reduce((sum, day) => sum + day.orders, 0)}</span>
            </div>
          </div>
        )}

        {/* Recent Orders */}
        <div className="bg-white rounded-lg shadow p-4 sm:p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Orders</h3>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Restaurant
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Table
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Total
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {recent_orders && recent_orders.length > 0 ? (
                  recent_orders.map((order) => (
                    <tr key={order.id} className="hover:bg-gray-50">
                      <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {order.restaurant}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                        {order.table}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                        {order.total.toFixed(2)} MAD
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                          order.status === 'completed' ? 'bg-green-100 text-green-800' :
                          order.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                          'bg-yellow-100 text-yellow-800'
                        }`}>
                          {order.status}
                        </span>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(order.created_at).toLocaleDateString()}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="5" className="px-4 py-8 text-center text-gray-500">
                      No recent orders
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;

