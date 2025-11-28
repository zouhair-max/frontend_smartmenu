import React from 'react';

const BestSellingProducts = ({ products = [] }) => {
  return (
    <div className="bg-white rounded-lg shadow">
      <div className="p-6 border-b border-gray-200">
        <h2 className="text-lg font-semibold text-gray-900">Best Selling Products</h2>
      </div>
      <div className="overflow-hidden">
        {products.length === 0 ? (
          <div className="p-6 text-center text-gray-500">
            No sales data available
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {products.map((product, index) => (
              <div key={product.id} className="p-4 hover:bg-gray-50">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                      <span className="text-sm font-medium text-blue-600">
                        #{index + 1}
                      </span>
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{product.name}</p>
                      <p className="text-sm text-gray-600">
                        €{product.price} × {product.total_sold} sold
                      </p>a
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-green-600">
                      €{product.revenue.toFixed(2)}
                    </p>
                    <p className="text-sm text-gray-600">
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