import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../../contexts/AuthContext';
import { Save, X, Plus, UtensilsCrossed, Table, ShoppingCart } from 'lucide-react';
import orderService from '../../../../services/OrderService';
import mealService from '../../../../services/mealsService';
import { tableService } from '../../../../services/tableService';
import CustomSelect from '../components/CustomSelect';
import { getMealName } from '../../../../utils/translations';

// Enhanced Loading Spinner
const LoadingSpinner = () => {
  return (
    <div className="fixed inset-0 bg-white bg-opacity-95 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="text-center">
        <div className="relative w-24 h-24 mx-auto mb-6">
          <div className="absolute inset-0 rounded-full border-4 border-orange-200 border-t-orange-500 animate-spin"></div>
          <div className="absolute inset-0 flex items-center justify-center">
            <ShoppingCart className="w-10 h-10 text-orange-500" />
          </div>
        </div>
        <h3 className="text-xl font-semibold text-gray-800 mb-2">Creating Your Order</h3>
        <p className="text-gray-600 mb-4">Please wait while we process your order</p>
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

const OrderForm = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const restaurantId = user?.restaurant_id;

  const [loading, setLoading] = useState(false);
  const [dataLoading, setDataLoading] = useState(false);
  const [error, setError] = useState('');
  const [meals, setMeals] = useState([]);
  const [tables, setTables] = useState([]);
  const [formData, setFormData] = useState({
    restaurant_id: restaurantId,
    table_id: '',
    order_items: [{ meal_id: '', quantity: 1, price: '' }]
  });

  useEffect(() => {
    if (restaurantId) {
      fetchMeals();
      fetchTables();
    }
  }, [restaurantId]);

  const normalizeApiResult = (payload) => {
    if (!payload) {
      return { success: false, data: [] };
    }

    if (typeof payload === 'object' && Object.prototype.hasOwnProperty.call(payload, 'success')) {
      const dataField =
        payload.data ??
        payload.tables ??
        payload.meals ??
        payload.orders ??
        payload.items ??
        payload.results ??
        payload;

      return {
        success: payload.success,
        message: payload.message,
        data: dataField ?? [],
      };
    }

    if (payload.data !== undefined) {
      return { success: true, data: payload.data };
    }

    return {
      success: true,
      data: Array.isArray(payload) ? payload : [],
    };
  };

  const extractArrayData = (payload) => {
    if (Array.isArray(payload)) {
      return payload;
    }
    if (payload && typeof payload === 'object') {
      // Handle Laravel paginated response: { success: true, data: { data: [...], current_page: 1, ... } }
      if (payload.data && typeof payload.data === 'object' && Array.isArray(payload.data.data)) {
        return payload.data.data;
      }
      
      const candidateKeys = ['data', 'tables', 'meals', 'orders', 'items', 'results'];
      for (const key of candidateKeys) {
        const value = payload[key];
        if (Array.isArray(value)) {
          return value;
        }
        if (value && typeof value === 'object' && Array.isArray(value.data)) {
          return value.data;
        }
      }
      if (Array.isArray(payload.data)) {
        return payload.data;
      }
    }
    return [];
  };

  const fetchMeals = async () => {
    if (!restaurantId) return;
    
    setDataLoading(true);
    try {
      console.log('Fetching meals for restaurant:', restaurantId);
      const response = await mealService.getMealsByRestaurant(restaurantId);
      console.log('Meals API response:', response);
      
      // Handle Laravel paginated response directly
      let mealsData = [];
      if (response && response.success && response.data) {
        // Check if it's a paginated response: { success: true, data: { data: [...], ... } }
        if (response.data.data && Array.isArray(response.data.data)) {
          mealsData = response.data.data;
          console.log('Found paginated meals data:', mealsData.length, 'meals');
        } else if (Array.isArray(response.data)) {
          mealsData = response.data;
          console.log('Found direct array meals data:', mealsData.length, 'meals');
        }
      } else if (Array.isArray(response)) {
        mealsData = response;
        console.log('Response is direct array:', mealsData.length, 'meals');
      } else {
        // Try normalizeApiResult as fallback
        const result = normalizeApiResult(response);
        if (result.success) {
          mealsData = extractArrayData(result.data);
          console.log('Extracted meals from normalized result:', mealsData.length, 'meals');
        }
      }
      
      setMeals(Array.isArray(mealsData) ? mealsData : []);
      console.log('Final meals set:', Array.isArray(mealsData) ? mealsData.length : 0, 'meals');
    } catch (err) {
      console.error('Error fetching meals:', err);
      setMeals([]);
    } finally {
      setDataLoading(false);
    }
  };

  const fetchTables = async () => {
    if (!restaurantId) return;
    
    setDataLoading(true);
    try {
      const response = await tableService.getTables();
      if (response.success) {
        const tablesData = response.tables || [];
        setTables(Array.isArray(tablesData) ? tablesData : []);
      } else {
        setTables([]);
      }
    } catch (err) {
      console.error('Error fetching tables:', err);
      setTables([]);
    } finally {
      setDataLoading(false);
    }
  };

  const getCategoryLabel = (category) => {
    if (!category) return 'Uncategorized';
    if (typeof category === 'string') return category;
    if (typeof category === 'object') {
      return category.name || category.title || 'Uncategorized';
    }
    return String(category);
  };

  const isTableAvailable = (table) => {
    if (!table) return false;
    return table.available !== false;
  };

  const addOrderItem = () => {
    setFormData(prev => ({
      ...prev,
      order_items: [...prev.order_items, { meal_id: '', quantity: 1, price: '' }]
    }));
  };

  const removeOrderItem = (index) => {
    if (formData.order_items.length === 1) return;
    
    setFormData(prev => ({
      ...prev,
      order_items: prev.order_items.filter((_, i) => i !== index)
    }));
  };

  const updateOrderItem = (index, field, value) => {
    setFormData(prev => ({
      ...prev,
      order_items: prev.order_items.map((item, i) => {
        if (i === index) {
          const updatedItem = { ...item, [field]: value };
          
          if (field === 'meal_id' && value) {
            const selectedMeal = Array.isArray(meals) ? meals.find(meal => meal.id === parseInt(value)) : null;
            if (selectedMeal) {
              updatedItem.price = selectedMeal.price;
            }
          }
          
          return updatedItem;
        }
        return item;
      })
    }));
  };

  const calculateTotal = (items) => {
    return items.reduce((total, item) => {
      const itemTotal = (item.quantity || 0) * (item.price || 0);
      return total + itemTotal;
    }, 0);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!restaurantId) {
      setError('No restaurant associated with user');
      return;
    }

    setLoading(true);
    setError('');
    
    try {
      const validOrderItems = formData.order_items.filter(item => 
        item.meal_id && item.quantity > 0 && item.price
      );

      if (validOrderItems.length === 0) {
        setError('Please add at least one valid order item');
        setLoading(false);
        return;
      }

      if (!formData.table_id) {
        setError('Please select a table');
        setLoading(false);
        return;
      }

      const orderData = {
        restaurant_id: restaurantId,
        table_id: formData.table_id,
        order_items: validOrderItems
      };

      const result = await orderService.createOrder(orderData);
      
      if (result.success) {
        navigate('/orders');
      } else {
        setError(result.message || 'Failed to create order');
      }
    } catch (err) {
      setError(err.message || 'An error occurred while creating order');
    } finally {
      setLoading(false);
    }
  };

  if (!restaurantId) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-xl shadow-lg p-6 max-w-md w-full">
          <div className="flex items-center justify-center w-12 h-12 mx-auto bg-red-100 rounded-full">
            <X className="w-6 h-6 text-red-600" />
          </div>
          <h3 className="mt-4 text-lg font-medium text-gray-900 text-center">Restaurant Not Found</h3>
          <p className="mt-2 text-sm text-gray-500 text-center">
            No restaurant associated with your account. Please contact administrator.
          </p>
        </div>
      </div>
    );
  }

  return (
    <>
      {loading && <LoadingSpinner />}
      
      <div className="min-h-screen bg-gray-50 py-4 sm:py-6 md:py-8 px-3 sm:px-4 md:px-6">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="mb-6 sm:mb-8 text-center">
            <div className="flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-3 mb-3 sm:mb-4">
              <div className="p-2 sm:p-3 bg-orange-500 rounded-full shadow-lg">
                <ShoppingCart className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
              </div>
              <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-800">
                Create New Order
              </h1>
            </div>
            <p className="text-gray-600 text-sm sm:text-base md:text-lg px-4">
              Add a new order for your restaurant
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
                {/* Table Selection */}
                <div className="bg-gradient-to-r from-orange-50 to-amber-50 p-4 sm:p-6 rounded-xl border border-orange-100">
                  <h2 className="text-lg sm:text-xl font-semibold text-gray-800 mb-4 sm:mb-6 flex items-center gap-2">
                    <Table className="w-4 h-4 sm:w-5 sm:h-5 text-orange-500" />
                    Table Selection
                  </h2>
                  
                  <CustomSelect
                    label="Table"
                    icon={Table}
                    required
                    value={formData.table_id ? formData.table_id.toString() : ''}
                    onChange={(value) => setFormData(prev => ({ ...prev, table_id: value || '' }))}
                    placeholder="Select a Table"
                    options={Array.isArray(tables) ? tables.filter(isTableAvailable).map(table => ({
                      value: table.id.toString(),
                      label: `${table.name} (Capacity: ${table.capacity})`
                    })) : []}
                  />
                  <p className="mt-2 text-sm text-gray-500">
                    {Array.isArray(tables) ? tables.filter(isTableAvailable).length : 0} tables available
                    {(!Array.isArray(tables) || tables.length === 0) && dataLoading && ' - Loading tables...'}
                  </p>
                </div>

                {/* Order Items */}
                <div className="bg-gradient-to-r from-red-50 to-orange-50 p-4 sm:p-6 rounded-xl border border-red-100">
                  <div className="flex items-center justify-between mb-4 sm:mb-6">
                    <h2 className="text-lg sm:text-xl font-semibold text-gray-800 flex items-center gap-2">
                      <UtensilsCrossed className="w-4 h-4 sm:w-5 sm:h-5 text-orange-500" />
                      Order Items
                    </h2>
                    <button 
                      type="button" 
                      className="bg-green-50 hover:bg-green-100 text-green-700 px-4 py-2 rounded-lg font-medium transition-colors duration-200 flex items-center space-x-2 text-sm"
                      onClick={addOrderItem}
                    >
                      <Plus className="w-4 h-4" />
                      <span>Add Item</span>
                    </button>
                  </div>
                  
                  <div className="space-y-4">
                    {formData.order_items.map((item, index) => (
                      <div key={index} className="bg-white rounded-lg p-4 border border-gray-200">
                        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-end">
                          <div className="lg:col-span-5">
                            <CustomSelect
                              label="Meal"
                              icon={UtensilsCrossed}
                              required
                              value={item.meal_id ? item.meal_id.toString() : ''}
                              onChange={(value) => updateOrderItem(index, 'meal_id', value || '')}
                              placeholder="Select a Meal"
                              options={Array.isArray(meals) ? meals.filter(meal => meal.available !== false).map(meal => {
                                const mealName = getMealName(meal, 'en') || meal.name || `Meal #${meal.id}`;
                                return {
                                  value: meal.id.toString(),
                                  label: `${mealName} - ${meal.price || 0} MAD (${getCategoryLabel(meal.category)})`
                                };
                              }) : []}
                            />
                            {(!Array.isArray(meals) || meals.length === 0) && dataLoading && <p className="mt-1 text-sm text-gray-500">Loading meals...</p>}
                            {Array.isArray(meals) && meals.length === 0 && !dataLoading && <p className="mt-1 text-sm text-orange-600">No meals available. Please create meals first.</p>}
                            {Array.isArray(meals) && meals.length > 0 && (
                              <p className="mt-1 text-xs text-gray-500">{meals.filter(meal => meal.available !== false).length} available meals</p>
                            )}
                          </div>
                          
                          <div className="lg:col-span-3">
                            <label className="block text-sm font-medium text-gray-700 mb-2">Quantity</label>
                            <input
                              type="number"
                              min="1"
                              max="99"
                              required
                              value={item.quantity}
                              onChange={(e) => updateOrderItem(index, 'quantity', parseInt(e.target.value) || 1)}
                              className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg focus:border-orange-500 focus:ring-2 focus:ring-orange-200 transition-all duration-200 bg-white shadow-sm"
                            />
                          </div>
                          
                          <div className="lg:col-span-3">
                            <label className="block text-sm font-medium text-gray-700 mb-2">Price</label>
                            <input
                              type="number"
                              step="0.01"
                              min="0"
                              required
                              value={item.price}
                              onChange={(e) => updateOrderItem(index, 'price', parseFloat(e.target.value) || 0)}
                              className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg focus:border-orange-500 focus:ring-2 focus:ring-orange-200 transition-all duration-200 bg-white shadow-sm"
                            />
                          </div>
                          
                          <div className="lg:col-span-1">
                            <button
                              type="button"
                              className="w-full bg-red-50 hover:bg-red-100 text-red-600 p-2 rounded-lg transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                              onClick={() => removeOrderItem(index)}
                              disabled={formData.order_items.length === 1}
                            >
                              <X className="w-4 h-4 mx-auto" />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="mt-6 pt-4 border-t border-gray-200">
                    <div className="flex justify-between items-center">
                      <span className="text-lg font-semibold text-gray-900">Total:</span>
                      <span className="text-2xl font-bold text-orange-600">
                        {calculateTotal(formData.order_items).toFixed(2)} MAD
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Form Actions */}
              <div className="flex flex-col sm:flex-row justify-end gap-3 sm:gap-4 mt-6 sm:mt-8 pt-6 sm:pt-8 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => navigate('/orders')}
                  className="w-full sm:w-auto px-6 sm:px-8 py-2.5 sm:py-3 border-2 border-gray-300 text-gray-700 rounded-lg sm:rounded-xl hover:bg-gray-50 hover:border-gray-400 transition-all duration-200 font-semibold flex items-center justify-center gap-2 text-sm sm:text-base"
                >
                  <X className="w-4 h-4 sm:w-5 sm:h-5" />
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading || !Array.isArray(meals) || meals.length === 0 || !Array.isArray(tables) || tables.length === 0}
                  className="w-full sm:w-auto px-6 sm:px-8 py-2.5 sm:py-3 bg-gradient-to-r from-orange-500 to-amber-500 text-white rounded-lg sm:rounded-xl hover:from-orange-600 hover:to-amber-600 transform hover:scale-105 transition-all duration-200 font-semibold shadow-lg flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none text-sm sm:text-base"
                >
                  <Save className="w-4 h-4 sm:w-5 sm:h-5" />
                  {loading ? 'Creating...' : 'Create Order'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </>
  );
};

export default OrderForm;

