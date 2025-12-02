import React from 'react';

const BestSellingProducts = ({ products = [] }) => {
  return (
    <div className="bg-white rounded-lg shadow">
      <div className="p-4 sm:p-6 border-b border-gray-200">
        <h2 className="text-base sm:text-lg font-semibold text-gray-900">Best Selling Products</h2>
      </div>
      <div className="overflow-hidden">
        {products.length === 0 ? (
          <div className="p-4 sm:p-6 text-center text-gray-500 text-sm sm:text-base">
            No sales data available
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {products.map((product, index) => (
              <div key={product.id} className="p-3 sm:p-4 hover:bg-gray-50">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 sm:gap-0">
                  <div className="flex items-center space-x-2 sm:space-x-3 flex-1 min-w-0">
                    <div className="flex-shrink-0 w-7 h-7 sm:w-8 sm:h-8 bg-blue-100 rounded-full flex items-center justify-center">
                      <span className="text-xs sm:text-sm font-medium text-blue-600">
                        #{index + 1}
                      </span>
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="font-medium text-sm sm:text-base text-gray-900 truncate">{product.name}</p>
                      <p className="text-xs sm:text-sm text-gray-600">
                        €{product.price} × {product.total_sold} sold
                      </p>
                    </div>
                  </div>
                  <div className="text-left sm:text-right w-full sm:w-auto">
                    <p className="font-semibold text-sm sm:text-base text-green-600">
                      €{product.revenue.toFixed(2)}
                    </p>
                    <p className="text-xs sm:text-sm text-gray-600">
                      Revenue
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default BestSellingProducts;