import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Save, X, Table as TableIcon } from 'lucide-react';
import { tableService } from '../../../../services/tableService';

// Enhanced Loading Spinner
const LoadingSpinner = () => {
  return (
    <div className="fixed inset-0 bg-white bg-opacity-95 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="text-center">
        <div className="relative w-24 h-24 mx-auto mb-6">
          <div className="absolute inset-0 rounded-full border-4 border-orange-200 border-t-orange-500 animate-spin"></div>
          <div className="absolute inset-0 flex items-center justify-center">
            <TableIcon className="w-10 h-10 text-orange-500" />
          </div>
        </div>
        <h3 className="text-xl font-semibold text-gray-800 mb-2">Saving Table</h3>
        <p className="text-gray-600 mb-4">Please wait while we process your request</p>
        <div className="flex items-center justify-center gap-2 mb-6">
          <div className="w-3 h-3 bg-orange-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
          <div className="w-3 h-3 bg-amber-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
          <div className="w-3 h-3 bg-orange-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
        </div>
        <div className="w-64 h-2 bg-gray-200 rounded-full mx-auto overflow-hidden">
          <div className="h-full bg-gradient-to-r from-orange-400 via-amber-400 to-orange-500 rounded-full animate-pulse"></div>
        </div>
      </div>
    </div>
  );
};

const TableForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = Boolean(id);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    capacity: 4,
    status: 'available'
  });

  useEffect(() => {
    if (isEdit) {
      fetchTable();
    }
  }, [id]);

  const fetchTable = async () => {
    try {
      setLoading(true);
      const response = await tableService.getTable(id);
      if (response.success && response.data) {
        const table = response.data;
        setFormData({
          name: table.name || '',
          capacity: table.capacity || 4,
          status: table.status || 'available'
        });
      }
    } catch (err) {
      setError(err.message || 'Failed to fetch table');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'capacity' ? parseInt(value) || 4 : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isEdit) {
        const response = await tableService.updateTable(id, formData);
        if (response.success) {
          navigate('/Restaurant_Tables');
        } else {
          setError(response.message || 'Failed to update table');
        }
      } else {
        const response = await tableService.createTable(formData);
        if (response.success) {
          navigate('/Restaurant_Tables');
        } else {
          setError(response.message || 'Failed to create table');
        }
      }
    } catch (err) {
      setError(err.message || 'Operation failed');
    } finally {
      setLoading(false);
    }
  };

  const statusColors = {
    available: 'bg-green-100 text-green-800 border-green-200',
    occupied: 'bg-red-100 text-red-800 border-red-200',
    reserved: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    maintenance: 'bg-gray-100 text-gray-800 border-gray-200'
  };

  return (
    <>
      {loading && <LoadingSpinner />}
      
      <div className="min-h-screen bg-gray-50 py-4 sm:py-6 md:py-8 px-3 sm:px-4 md:px-6">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="mb-6 sm:mb-8 text-center">
            <div className="flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-3 mb-3 sm:mb-4">
              <div className="p-2 sm:p-3 bg-orange-500 rounded-full shadow-lg">
                <TableIcon className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
              </div>
              <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-800">
                {isEdit ? 'Edit Table' : 'Create New Table'}
              </h1>
            </div>
            <p className="text-gray-600 text-sm sm:text-base md:text-lg px-4">
              {isEdit ? 'Update table information' : 'Add a new table to your restaurant'}
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-6 bg-red-50 border border-red-200 rounded-xl p-4 flex items-start space-x-3 animate-fade-in">
              <div className="flex-shrink-0">
                <X className="w-5 h-5 text-red-400" />
              </div>
              <p className="text-red-800 text-sm flex-1">{error}</p>
              <button onClick={() => setError('')} className="text-red-500 hover:text-red-700">
                <X className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* Form Card */}
          <div className="bg-white rounded-xl sm:rounded-2xl shadow-xl overflow-hidden border border-gray-100">
            <form onSubmit={handleSubmit} className="p-4 sm:p-6 md:p-8">
              <div className="space-y-6 sm:space-y-8">
                {/* Basic Information */}
                <div className="bg-gradient-to-r from-orange-50 to-amber-50 p-4 sm:p-6 rounded-xl border border-orange-100">
                  <h2 className="text-lg sm:text-xl font-semibold text-gray-800 mb-4 sm:mb-6 flex items-center gap-2">
                    <TableIcon className="w-4 h-4 sm:w-5 sm:h-5 text-orange-500" />
                    Basic Information
                  </h2>

                  {/* Table Name */}
                  <div className="mb-4 sm:mb-6">
                    <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2 sm:mb-3">
                      Table Name *
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      required
                      className="w-full p-3 sm:p-4 border-2 border-gray-200 rounded-lg sm:rounded-xl focus:border-orange-500 focus:ring-2 focus:ring-orange-200 transition-all duration-200 bg-white shadow-sm text-sm sm:text-base"
                      placeholder="e.g., Table 1, VIP Table"
                    />
                  </div>

                  {/* Capacity */}
                  <div className="mb-4 sm:mb-6">
                    <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2 sm:mb-3">
                      Capacity *
                    </label>
                    <input
                      type="number"
                      name="capacity"
                      value={formData.capacity}
                      onChange={handleInputChange}
                      min="1"
                      required
                      className="w-full p-3 sm:p-4 border-2 border-gray-200 rounded-lg sm:rounded-xl focus:border-orange-500 focus:ring-2 focus:ring-orange-200 transition-all duration-200 bg-white shadow-sm text-sm sm:text-base"
                      placeholder="Number of persons"
                    />
                    <p className="mt-2 text-xs sm:text-sm text-gray-500">Maximum number of persons this table can accommodate</p>
                  </div>

                  {/* Status */}
                  <div className="mb-6">
                    <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2 sm:mb-3">
                      Status *
                    </label>
                    <select
                      name="status"
                      value={formData.status}
                      onChange={handleInputChange}
                      className="w-full p-3 sm:p-4 border-2 border-gray-200 rounded-lg sm:rounded-xl focus:border-orange-500 focus:ring-2 focus:ring-orange-200 transition-all duration-200 bg-white shadow-sm text-sm sm:text-base"
                    >
                      <option value="available">Available</option>
                      <option value="occupied">Occupied</option>
                      <option value="reserved">Reserved</option>
                      <option value="maintenance">Maintenance</option>
                    </select>
                    {formData.status && (
                      <div className="mt-3">
                        <span className={`inline-flex items-center px-3 py-1 text-xs font-semibold rounded-full border ${statusColors[formData.status] || statusColors.maintenance}`}>
                          Current Status: {formData.status}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Form Actions */}
              <div className="flex flex-col sm:flex-row justify-end gap-3 sm:gap-4 mt-6 sm:mt-8 pt-6 sm:pt-8 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => navigate('/Restaurant_Tables')}
                  className="w-full sm:w-auto px-6 sm:px-8 py-2.5 sm:py-3 border-2 border-gray-300 text-gray-700 rounded-lg sm:rounded-xl hover:bg-gray-50 hover:border-gray-400 transition-all duration-200 font-semibold flex items-center justify-center gap-2 text-sm sm:text-base"
                >
                  <X className="w-4 h-4 sm:w-5 sm:h-5" />
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full sm:w-auto px-6 sm:px-8 py-2.5 sm:py-3 bg-gradient-to-r from-orange-500 to-amber-500 text-white rounded-lg sm:rounded-xl hover:from-orange-600 hover:to-amber-600 transform hover:scale-105 transition-all duration-200 font-semibold shadow-lg flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none text-sm sm:text-base"
                >
                  <Save className="w-4 h-4 sm:w-5 sm:h-5" />
                  {loading ? 'Saving...' : (isEdit ? 'Update Table' : 'Create Table')}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </>
  );
};

export default TableForm;



