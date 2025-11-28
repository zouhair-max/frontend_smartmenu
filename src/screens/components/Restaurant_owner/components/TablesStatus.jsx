import React from 'react';

const TablesStatus = ({ tables = [] }) => {
  const getStatusInfo = (status) => {
    const statusMap = {
      available: { color: 'bg-green-100 text-green-800', label: 'Available' },
      occupied: { color: 'bg-red-100 text-red-800', label: 'Occupied' },
      reserved: { color: 'bg-yellow-100 text-yellow-800', label: 'Reserved' },
      maintenance: { color: 'bg-gray-100 text-gray-800', label: 'Maintenance' },
    };
    return statusMap[status] || { color: 'bg-gray-100 text-gray-800', label: status };
  };

  const statusCounts = tables.reduce((acc, table) => {
    acc[table.status] = (acc[table.status] || 0) + 1;
    return acc;
  }, {});

  return (
    <div className="bg-white rounded-lg shadow">
      <div className="p-6 border-b border-gray-200">
        <h2 className="text-lg font-semibold text-gray-900">Tables Status</h2>
        <p className="text-sm text-gray-600 mt-1">
          {tables.length} total tables
        </p>
      </div>
      
      {/* Status Summary */}
      <div className="p-4 border-b border-gray-200">
        <div className="grid grid-cols-2 gap-2">
          {Object.entries(statusCounts).map(([status, count]) => {
            const statusInfo = getStatusInfo(status);
            return (
              <div key={status} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium ${statusInfo.color}`}>
                  {statusInfo.label}
                </span>
                <span className="font-semibold text-gray-900">{count}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Tables List */}
      <div className="max-h-64 overflow-y-auto">
        {tables.length === 0 ? (
          <div className="p-6 text-center text-gray-500">
            No tables configured
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {tables.map((table) => {
              const statusInfo = getStatusInfo(table.status);
              return (
                <div key={table.id} className="p-4 hover:bg-gray-50">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-gray-900">{table.name}</p>
                      <p className="text-sm text-gray-600">
                        Capacity: {table.capacity} people
                      </p>
                    </div>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusInfo.color}`}>
                      {statusInfo.label}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default TablesStatus;