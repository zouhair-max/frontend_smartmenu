import React from 'react';

const RecentOrders = ({ orders = [] }) => {
  const getStatusColor = (status) => {
    const colors = {
      pending: 'bg-yellow-100 text-yellow-800',
      confirmed: 'bg-blue-100 text-blue-800',
      preparing: 'bg-orange-100 text-orange-800',
      ready: 'bg-green-100 text-green-800',
      completed: 'bg-gray-100 text-gray-800',
      cancelled: 'bg-red-100 text-red-800',
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="bg-white rounded-lg shadow">
      <div className="p-6 border-b border-gray-200">
        <h2 className="text-lg font-semibold text-gray-900">Recent Orders</h2>
      </div>
      <div className="overflow-hidden">
        {orders.length === 0 ? (
          <div className="p-6 text-center text-gray-500">
            No recent orders
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {orders.map((order) => (
              <div key={order.id} className="p-4 hover:bg-gray-50">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-gray-900">
                      #{order.order_number}
                    </p>
                    <p className="text-sm text-gray-600">
                      {order.customer_name} • {order.table_name}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-gray-900">
                      €{order.total_price}
                    </p>
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                      {order.status}
                    </span>
                  </div>
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  {order.time_ago}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default RecentOrders;