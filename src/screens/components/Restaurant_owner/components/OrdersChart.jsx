import React from 'react';

const OrdersChart = ({ data = [] }) => {
  if (!data || data.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow p-4 sm:p-6">
        <h2 className="text-base sm:text-lg font-semibold text-gray-900 mb-3 sm:mb-4">Orders Overview</h2>
        <div className="text-center text-gray-500 py-6 sm:py-8 text-sm sm:text-base">
          No chart data available
        </div>
      </div>
    );
  }

  const maxOrders = Math.max(...data.map(item => item.orders_count));
  const maxRevenue = Math.max(...data.map(item => item.revenue));

  return (
    <div className="bg-white rounded-lg shadow">
      <div className="p-4 sm:p-6 border-b border-gray-200">
        <h2 className="text-base sm:text-lg font-semibold text-gray-900">Orders Overview (Last 7 Days)</h2>
      </div>
      <div className="p-3 sm:p-4 md:p-6">
        {/* Chart Bars */}
        <div className="flex items-end justify-between space-x-1 sm:space-x-2 h-40 sm:h-48 overflow-x-auto pb-2">
          {data.map((day, index) => (
            <div key={index} className="flex flex-col items-center flex-1 min-w-[50px] sm:min-w-0">
              {/* Revenue Bar */}
              <div 
                className="w-full bg-green-200 rounded-t mb-1 relative group cursor-pointer"
                style={{ height: `${(day.revenue / maxRevenue) * 70}%` }}
                title={`Revenue: ${day.revenue.toFixed(2)} MAD`}
              >
                <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-gray-900 text-white text-xs rounded px-2 py-1 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">
                  {day.revenue.toFixed(2)} MAD
                </div>
              </div>
              
              {/* Orders Bar */}
              <div 
                className="w-full bg-blue-200 rounded-t relative group cursor-pointer"
                style={{ height: `${(day.orders_count / maxOrders) * 70}%` }}
                title={`Orders: ${day.orders_count}`}
              >
                <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-gray-900 text-white text-xs rounded px-2 py-1 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">
                  {day.orders_count} orders
                </div>
              </div>
              
              {/* Day Label */}
              <div className="text-xs text-gray-600 mt-1 sm:mt-2 text-center">
                <div className="font-medium truncate w-full">{day.day_name}</div>
                <div className="text-gray-500">{day.date.split('-')[2]}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Legend */}
        <div className="flex justify-center space-x-4 sm:space-x-6 mt-4 sm:mt-6">
          <div className="flex items-center">
            <div className="w-3 h-3 sm:w-4 sm:h-4 bg-blue-200 rounded mr-1.5 sm:mr-2"></div>
            <span className="text-xs sm:text-sm text-gray-600">Orders</span>
          </div>
          <div className="flex items-center">
            <div className="w-3 h-3 sm:w-4 sm:h-4 bg-green-200 rounded mr-1.5 sm:mr-2"></div>
            <span className="text-xs sm:text-sm text-gray-600">Revenue</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrdersChart;