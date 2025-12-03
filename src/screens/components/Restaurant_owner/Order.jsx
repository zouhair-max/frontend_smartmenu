import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../contexts/AuthContext';
import orderService from '../../../services/OrderService';
import mealService from '../../../services/mealsService';
import { tableService } from '../../../services/tableService';

export default function Order() {
  const { user } = useAuth();
  const restaurantId = user?.restaurant_id;

  const [orders, setOrders] = useState([]);
  const [meals, setMeals] = useState([]);
  const [tables, setTables] = useState([]);
  const [loading, setLoading] = useState(false);
  const [dataLoading, setDataLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [showOrderDetails, setShowOrderDetails] = useState(false);
  
  const [filters, setFilters] = useState({
    status: '',
    table_id: ''
  });

  // Form states
  const [newOrder, setNewOrder] = useState({
    restaurant_id: restaurantId,
    table_id: '',
    order_items: [{ meal_id: '', quantity: 1, price: '' }]
  });

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
      const candidateKeys = ['data', 'tables', 'meals', 'orders', 'items', 'results'];
      for (const key of candidateKeys) {
        const value = payload[key];
        if (Array.isArray(value)) {
          return value;
        }
        if (value && Array.isArray(value?.data)) {
          return value.data;
        }
      }
      if (Array.isArray(payload.data)) {
        return payload.data;
      }
      if (payload.data && Array.isArray(payload.data.data)) {
        return payload.data.data;
      }
    }
    return [];
  };

  // Fetch initial data
  useEffect(() => {
    if (restaurantId) {
      console.log('Fetching data for restaurant:', restaurantId);
      fetchOrders();
      fetchMeals();
      fetchTables();
    }
  }, [restaurantId]);

  // Fetch orders
  const fetchOrders = async () => {
    if (!restaurantId) return;
    
    setLoading(true);
    setError('');
    try {
      console.log('Fetching orders...');
      const response = await orderService.getAllOrders(restaurantId, filters);
      const result = normalizeApiResult(response);
      console.log('Orders response:', result);
      
      if (result.success) {
        setOrders(extractArrayData(result.data));
      } else {
        setError(result.message || 'Failed to fetch orders');
      }
    } catch (err) {
      console.error('Error fetching orders:', err);
      setError(err.message || 'An error occurred while fetching orders');
    } finally {
      setLoading(false);
    }
  };

  // Fetch meals - FIXED
  const fetchMeals = async () => {
    if (!restaurantId) return;
    
    setDataLoading(true);
    try {
      console.log('Fetching meals...');
      const response = await mealService.getMealsByRestaurant(restaurantId);
      const result = normalizeApiResult(response);
      console.log('Meals response:', result);
      
      if (result.success) {
        setMeals(extractArrayData(result.data));
        console.log('Meals loaded:', result.data?.length || 0);
      } else {
        console.error('Failed to fetch meals:', result.message);
        setMeals([]);
      }
    } catch (err) {
      console.error('Error fetching meals:', err);
      setMeals([]);
    } finally {
      setDataLoading(false);
    }
  };

  // Fetch tables - FIXED
  const fetchTables = async () => {
    if (!restaurantId) return;
    
    setDataLoading(true);
    try {
      console.log('Fetching tables...');
      const response = await tableService.getTables();
      console.log('Tables raw response:', response);
      
      // The API returns { success: true, tables: [...] }
      if (response.success) {
        const tablesData = response.tables || [];
        setTables(Array.isArray(tablesData) ? tablesData : []);
        console.log('Tables loaded:', tablesData.length);
      } else {
        console.error('Failed to fetch tables:', response.message);
        setTables([]);
      }
    } catch (err) {
      console.error('Error fetching tables:', err);
      setTables([]);
    } finally {
      setDataLoading(false);
    }
  };

  // Create new order
  const handleCreateOrder = async (e) => {
    e.preventDefault();
    if (!restaurantId) {
      setError('No restaurant associated with user');
      return;
    }

    setLoading(true);
    setError('');
    
    try {
      const validOrderItems = newOrder.order_items.filter(item => 
        item.meal_id && item.quantity > 0 && item.price
      );

      if (validOrderItems.length === 0) {
        setError('Please add at least one valid order item');
        return;
      }

      if (!newOrder.table_id) {
        setError('Please select a table');
        return;
      }

      const orderData = {
        restaurant_id: restaurantId,
        table_id: newOrder.table_id,
        order_items: validOrderItems
      };

      console.log('Creating order with data:', orderData);

      const result = await orderService.createOrder(orderData);
      
      if (result.success) {
        setSuccess('Order created successfully!');
        setShowCreateForm(false);
        resetNewOrderForm();
        fetchOrders();
      } else {
        setError(result.message || 'Failed to create order');
      }
    } catch (err) {
      setError(err.message || 'An error occurred while creating order');
    } finally {
      setLoading(false);
    }
  };

  // Reset new order form
  const resetNewOrderForm = () => {
    setNewOrder({
      restaurant_id: restaurantId,
      table_id: '',
      order_items: [{ meal_id: '', quantity: 1, price: '' }]
    });
  };

  // Update order status
  const handleUpdateStatus = async (orderId, newStatus) => {
    setLoading(true);
    setError('');
    
    try {
      const result = await orderService.updateOrderStatus(orderId, newStatus);
      
      if (result.success) {
        setSuccess('Order status updated successfully!');
        fetchOrders();
        if (selectedOrder && selectedOrder.id === orderId) {
          setSelectedOrder(result.data);
        }
      } else {
        setError(result.message || 'Failed to update order status');
      }
    } catch (err) {
      setError(err.message || 'An error occurred while updating order status');
    } finally {
      setLoading(false);
    }
  };

  // Delete order
  const handleDeleteOrder = async (orderId) => {
    if (!window.confirm('Are you sure you want to delete this order?')) {
      return;
    }

    setLoading(true);
    setError('');
    
    try {
      const result = await orderService.deleteOrder(orderId);
      
      if (result.success) {
        setSuccess('Order deleted successfully!');
        setSelectedOrder(null);
        setShowOrderDetails(false);
        fetchOrders();
      } else {
        setError(result.message || 'Failed to delete order');
      }
    } catch (err) {
      setError(err.message || 'An error occurred while deleting order');
    } finally {
      setLoading(false);
    }
  };

  // Add new order item to form
  const addOrderItem = () => {
    setNewOrder(prev => ({
      ...prev,
      order_items: [...prev.order_items, { meal_id: '', quantity: 1, price: '' }]
    }));
  };

  // Remove order item from form
  const removeOrderItem = (index) => {
    if (newOrder.order_items.length === 1) return;
    
    setNewOrder(prev => ({
      ...prev,
      order_items: prev.order_items.filter((_, i) => i !== index)
    }));
  };

  // Update order item in form
  const updateOrderItem = (index, field, value) => {
    setNewOrder(prev => ({
      ...prev,
      order_items: prev.order_items.map((item, i) => {
        if (i === index) {
          const updatedItem = { ...item, [field]: value };
          
          if (field === 'meal_id' && value) {
            const selectedMeal = meals.find(meal => meal.id === parseInt(value));
            if (selectedMeal) {
              updatedItem.price = selectedMeal.price;
              console.log('Auto-filled price for meal:', selectedMeal.name, selectedMeal.price);
            }
          }
          
          return updatedItem;
        }
        return item;
      })
    }));
  };

  // Calculate total for order items
  const calculateTotal = (items) => {
    return items.reduce((total, item) => {
      const itemTotal = (item.quantity || 0) * (item.price || 0);
      return total + itemTotal;
    }, 0);
  };

  // Get status badge class
  const getStatusClass = (status) => {
    const statusClasses = {
      pending: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      confirmed: 'bg-blue-100 text-blue-800 border-blue-200',
      preparing: 'bg-purple-100 text-purple-800 border-purple-200',
      ready: 'bg-green-100 text-green-800 border-green-200',
      served: 'bg-teal-100 text-teal-800 border-teal-200',
      completed: 'bg-gray-100 text-gray-800 border-gray-200',
      cancelled: 'bg-red-100 text-red-800 border-red-200'
    };
    return statusClasses[status] || 'bg-yellow-100 text-yellow-800 border-yellow-200';
  };

  // View order details
  const viewOrderDetails = (order) => {
    console.log('Viewing order details:', order);
    setSelectedOrder(order);
    setShowOrderDetails(true);
  };

  // Get meal name by ID
  const getMealName = (mealId) => {
    const meal = meals.find(m => m.id === mealId);
    return meal ? meal.name : `Meal #${mealId}`;
  };

  const getCategoryLabel = (category) => {
    if (!category) return 'Uncategorized';
    if (typeof category === 'string') return category;
    if (typeof category === 'object') {
      return category.name || category.title || 'Uncategorized';
    }
    return String(category);
  };

  // Get table name by ID
  const getTableName = (tableId) => {
    const table = tables.find(t => t.id === tableId);
    return table ? table.name : `Table #${tableId}`;
  };

  const isTableAvailable = (table) => {
    if (!table) return false;
    return table.available !== false;
  };

  // Clear messages
  useEffect(() => {
    if (success || error) {
      const timer = setTimeout(() => {
        setSuccess('');
        setError('');
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [success, error]);

  if (!restaurantId) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-xl shadow-lg p-6 max-w-md w-full">
          <div className="flex items-center justify-center w-12 h-12 mx-auto bg-red-100 rounded-full">
            <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
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
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Header */}
      <div className="max-w-7xl mx-auto">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
            <div className="flex-1">
              <div className="flex items-center space-x-3">
                <div className="bg-orange-100 p-2 rounded-lg">
                  <svg className="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                  </svg>
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">Order Management</h1>
                  <p className="text-sm text-gray-600 mt-1">
                    Restaurant: <strong className="text-gray-800">{user?.restaurant_name}</strong>
                  </p>
                </div>
              </div>
              
              <div className="flex flex-wrap items-center gap-4 mt-4 text-xs text-gray-500">
                <div className="flex items-center space-x-1">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span>Meals: <strong className="text-gray-700">{meals.length}</strong></span>
                </div>
                <div className="flex items-center space-x-1">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <span>Tables: <strong className="text-gray-700">{tables.length}</strong></span>
                </div>
                <div className="flex items-center space-x-1">
                  <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                  <span>Orders: <strong className="text-gray-700">{orders.length}</strong></span>
                </div>
                {dataLoading && (
                  <div className="flex items-center space-x-1 text-yellow-600">
                    <svg className="w-3 h-3 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707" />
                    </svg>
                    <span>Loading data...</span>
                  </div>
                )}
              </div>
            </div>
            
            <button 
              className="mt-4 lg:mt-0 bg-orange-600 hover:bg-orange-700 text-white px-6 py-3 rounded-lg font-medium transition-colors duration-200 flex items-center space-x-2 shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
              onClick={() => setShowCreateForm(true)}
              disabled={loading || dataLoading}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              <span>Create New Order</span>
            </button>
          </div>
        </div>

        {/* Messages */}
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-xl p-4 flex items-start space-x-3 animate-fade-in">
            <div className="flex-shrink-0">
              <svg className="w-5 h-5 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <p className="text-red-800 text-sm flex-1">{error}</p>
          </div>
        )}
        
        {success && (
          <div className="mb-6 bg-green-50 border border-green-200 rounded-xl p-4 flex items-start space-x-3 animate-fade-in">
            <div className="flex-shrink-0">
              <svg className="w-5 h-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <p className="text-green-800 text-sm flex-1">{success}</p>
          </div>
        )}

        {/* Filters */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Filters</h3>
          <div className="flex flex-col sm:flex-row gap-4">
            <select 
              value={filters.status} 
              onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors duration-200"
            >
              <option value="">All Statuses</option>
              <option value="pending">Pending</option>
              <option value="confirmed">Confirmed</option>
              <option value="preparing">Preparing</option>
              <option value="ready">Ready</option>
              <option value="served">Served</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>

            <select
              value={filters.table_id}
              onChange={(e) => setFilters(prev => ({ ...prev, table_id: e.target.value }))}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors duration-200"
            >
              <option value="">All Tables</option>
              {tables.map(table => (
                <option key={table.id} value={table.id}>
                  {table.name} {!table.available && '(Unavailable)'}
                </option>
              ))}
            </select>

            <div className="flex gap-2">
              <button 
                onClick={fetchOrders} 
                className="bg-gray-600 hover:bg-gray-700 text-white px-6 py-2 rounded-lg font-medium transition-colors duration-200 flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={loading}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                </svg>
                <span>Apply Filters</span>
              </button>
              
              <button 
                onClick={() => setFilters({ status: '', table_id: '' })} 
                className="border border-gray-300 hover:bg-gray-50 text-gray-700 px-6 py-2 rounded-lg font-medium transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={loading}
              >
                Clear
              </button>
            </div>
          </div>
        </div>

        {/* Orders List */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">Orders ({orders.length})</h3>
            <button 
              onClick={fetchOrders} 
              className="mt-2 sm:mt-0 bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 px-4 py-2 rounded-lg font-medium transition-colors duration-200 flex items-center space-x-2 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={loading}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              <span>Refresh</span>
            </button>
          </div>
          
          {loading ? (
            <div className="flex flex-col items-center justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600 mb-4"></div>
              <p className="text-gray-600">Loading orders...</p>
            </div>
          ) : orders.length === 0 ? (
            <div className="text-center py-12">
              <div className="mx-auto w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No orders found</h3>
              <p className="text-gray-500 max-w-sm mx-auto">
                {Object.values(filters).some(f => f) 
                  ? 'No orders match your current filters. Try adjusting your filters.' 
                  : 'Get started by creating your first order.'}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {orders.map(order => (
                <div key={order.id} className="bg-white border border-gray-200 rounded-xl shadow-sm hover:shadow-md transition-shadow duration-200">
                  <div className="p-5">
                    <div className="flex items-start justify-between mb-4">
                      <h4 className="text-lg font-semibold text-gray-900">Order #{order.id}</h4>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusClass(order.status)}`}>
                        {order.status}
                      </span>
                    </div>
                    
                    <div className="space-y-2 text-sm text-gray-600">
                      <div className="flex justify-between">
                        <span>Table:</span>
                        <span className="font-medium text-gray-900">{getTableName(order.table_id)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Total:</span>
                        <span className="font-medium text-gray-900">${order.total}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Items:</span>
                        <span className="font-medium text-gray-900">{order.order_items?.length || 0}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Created:</span>
                        <span className="font-medium text-gray-900">{new Date(order.created_at).toLocaleDateString()}</span>
                      </div>
                    </div>

                    <div className="mt-6 flex flex-col space-y-2">
                      <button 
                        className="w-full bg-orange-50 hover:bg-orange-100 text-orange-700 px-4 py-2 rounded-lg font-medium transition-colors duration-200 flex items-center justify-center space-x-2 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                        onClick={() => viewOrderDetails(order)}
                        disabled={loading}
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                        <span>View Details</span>
                      </button>
                      
                      {orderService.canUpdateOrder(order.status) && (
                        <select 
                          value={order.status}
                          onChange={(e) => handleUpdateStatus(order.id, e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors duration-200 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                          disabled={loading}
                        >
                          <option value={order.status}>Update Status</option>
                          {orderService.getValidStatusTransitions(order.status).map(status => (
                            <option key={status} value={status}>
                              Mark as {status}
                            </option>
                          ))}
                        </select>
                      )}

                      {['pending', 'cancelled'].includes(order.status) && (
                        <button 
                          className="w-full bg-red-50 hover:bg-red-100 text-red-700 px-4 py-2 rounded-lg font-medium transition-colors duration-200 flex items-center justify-center space-x-2 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                          onClick={() => handleDeleteOrder(order.id)}
                          disabled={loading}
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                          <span>Delete Order</span>
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Create Order Modal */}
      {showCreateForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900">Create New Order</h2>
              <button 
                className="text-gray-400 hover:text-gray-600 transition-colors duration-200 p-2 rounded-lg hover:bg-gray-100"
                onClick={() => {
                  setShowCreateForm(false);
                  resetNewOrderForm();
                }}
                disabled={loading}
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <form onSubmit={handleCreateOrder} className="overflow-y-auto max-h-[calc(90vh-120px)]">
              <div className="p-6 space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Table *</label>
                  <select
                    required
                    value={newOrder.table_id}
                    onChange={(e) => setNewOrder(prev => ({ ...prev, table_id: e.target.value }))}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors duration-200"
                  >
                    <option value="">Select a Table</option>
                    {tables.filter(isTableAvailable).map(table => (
                      <option key={table.id} value={table.id}>
                        {table.name} (Capacity: {table.capacity})
                      </option>
                    ))}
                  </select>
                  <p className="mt-2 text-sm text-gray-500">
                    {tables.filter(isTableAvailable).length} tables available
                    {tables.length === 0 && ' - Loading tables...'}
                  </p>
                </div>

                <div className="border border-gray-200 rounded-xl p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="text-lg font-medium text-gray-900">Order Items</h4>
                    <button 
                      type="button" 
                      className="bg-green-50 hover:bg-green-100 text-green-700 px-4 py-2 rounded-lg font-medium transition-colors duration-200 flex items-center space-x-2 text-sm"
                      onClick={addOrderItem}
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                      </svg>
                      <span>Add Item</span>
                    </button>
                  </div>
                  
                  <div className="space-y-4">
                    {newOrder.order_items.map((item, index) => (
                      <div key={index} className="bg-gray-50 rounded-lg p-4">
                        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-end">
                          <div className="lg:col-span-5">
                            <label className="block text-sm font-medium text-gray-700 mb-2">Meal</label>
                            <select
                              required
                              value={item.meal_id}
                              onChange={(e) => updateOrderItem(index, 'meal_id', e.target.value)}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors duration-200"
                            >
                              <option value="">Select a Meal</option>
                              {meals.filter(meal => meal.available).map(meal => (
                                <option key={meal.id} value={meal.id}>
                                  {meal.name} - ${meal.price} ({getCategoryLabel(meal.category)})
                                </option>
                              ))}
                            </select>
                            {meals.length === 0 && <p className="mt-1 text-sm text-gray-500">Loading meals...</p>}
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
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors duration-200"
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
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors duration-200"
                            />
                          </div>
                          
                          <div className="lg:col-span-1">
                            <button
                              type="button"
                              className="w-full bg-red-50 hover:bg-red-100 text-red-600 p-2 rounded-lg transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                              onClick={() => removeOrderItem(index)}
                              disabled={newOrder.order_items.length === 1}
                            >
                              <svg className="w-4 h-4 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
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
                        ${calculateTotal(newOrder.order_items).toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex justify-end space-x-3 p-6 border-t border-gray-200 bg-gray-50">
                <button 
                  type="button" 
                  className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                  onClick={() => {
                    setShowCreateForm(false);
                    resetNewOrderForm();
                  }}
                  disabled={loading}
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="px-6 py-3 bg-orange-600 text-white rounded-lg font-medium hover:bg-orange-700 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                  disabled={loading || meals.length === 0 || tables.length === 0}
                >
                  {loading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>Creating...</span>
                    </>
                  ) : (
                    <>
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      <span>Create Order</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Order Details Modal */}
      {showOrderDetails && selectedOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900">Order #{selectedOrder.id} Details</h2>
              <button 
                className="text-gray-400 hover:text-gray-600 transition-colors duration-200 p-2 rounded-lg hover:bg-gray-100"
                onClick={() => setShowOrderDetails(false)}
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="overflow-y-auto max-h-[calc(90vh-120px)]">
              <div className="p-6 space-y-6">
                <div className="bg-gray-50 rounded-xl p-6">
                  <h4 className="text-lg font-medium text-gray-900 mb-4">Basic Information</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${getStatusClass(selectedOrder.status)}`}>
                        {selectedOrder.status}
                      </span>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Table</label>
                      <p className="text-gray-900 font-medium">{getTableName(selectedOrder.table_id)}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Total Amount</label>
                      <p className="text-gray-900 font-medium">${selectedOrder.total}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Created</label>
                      <p className="text-gray-900 font-medium">{new Date(selectedOrder.created_at).toLocaleString()}</p>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="text-lg font-medium text-gray-900 mb-4">Order Items</h4>
                  <div className="space-y-3">
                    {selectedOrder.order_items?.map((item, index) => (
                      <div key={item.id || index} className="flex items-center justify-between p-4 bg-white border border-gray-200 rounded-lg">
                        <div className="flex-1">
                          <div className="flex items-start justify-between mb-2">
                            <h5 className="font-medium text-gray-900">{getMealName(item.meal_id)}</h5>
                            <span className="font-semibold text-gray-900">
                              ${((item.quantity || 0) * (item.price || 0)).toFixed(2)}
                            </span>
                          </div>
                          <div className="flex items-center space-x-4 text-sm text-gray-600">
                            <span>Quantity: {item.quantity}</span>
                            <span>Price: ${item.price} each</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex justify-end space-x-3 p-6 border-t border-gray-200 bg-gray-50">
                <button 
                  className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors duration-200"
                  onClick={() => setShowOrderDetails(false)}
                >
                  Close
                </button>
                {['pending', 'cancelled'].includes(selectedOrder.status) && (
                  <button 
                    className="px-6 py-3 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                    onClick={() => handleDeleteOrder(selectedOrder.id)}
                    disabled={loading}
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                    <span>Delete Order</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}