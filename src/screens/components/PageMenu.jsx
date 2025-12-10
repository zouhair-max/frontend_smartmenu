import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { 
  Search, Plus, Minus, X, ShoppingCart, Check, 
  Menu, ChevronRight, ChevronLeft, Clock, 
  Star, Filter, ArrowUpDown, Flame, Leaf,
  Beef, Coffee, Pizza, Sandwich, Cake,
  UtensilsCrossed, ChefHat, Wine, IceCream,
  Tag, Wallet, Receipt, User, Package, RefreshCw, Crown, Globe
} from 'lucide-react';
import PageMenuService from '../../services/PageMenuService';
import { getMealName, getMealDescription, getCategoryName } from '../../utils/translations';

export default function PageMenu() {
  const { restaurant_id, table_id } = useParams();
  const { t, i18n } = useTranslation();
  const currentLocale = i18n.language;
  
  // Set document direction for RTL languages
  useEffect(() => {
    document.documentElement.dir = currentLocale === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.lang = currentLocale;
  }, [currentLocale]);
  const [menuData, setMenuData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');
  const [cart, setCart] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState(false);
  const [orderError, setOrderError] = useState('');
  const [isOrderBarOpen, setIsOrderBarOpen] = useState(true);
  const [isCategorySidebarOpen, setIsCategorySidebarOpen] = useState(true);
  const [sortBy, setSortBy] = useState('default');
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [orders, setOrders] = useState([]);
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [showOrderTracking, setShowOrderTracking] = useState(false);
  const [failedCategoryImages, setFailedCategoryImages] = useState(new Set());
  const [showLanguageMenu, setShowLanguageMenu] = useState(false);

  const changeLanguage = (lng) => {
    i18n.changeLanguage(lng);
    localStorage.setItem('app_language', lng);
    setShowLanguageMenu(false);
  };

  useEffect(() => {
    fetchMenu();
    fetchOrders();
  }, [restaurant_id, table_id]);

  // Auto-refresh orders every 10 seconds
  useEffect(() => {
    if (showOrderTracking && restaurant_id && table_id) {
      const interval = setInterval(() => {
        fetchOrders();
      }, 10000); // Refresh every 10 seconds
      return () => clearInterval(interval);
    }
  }, [showOrderTracking, restaurant_id, table_id]);

  // Handle click outside language menu
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showLanguageMenu && !event.target.closest('.language-menu-container')) {
        setShowLanguageMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showLanguageMenu]);

  const fetchMenu = async () => {
    try {
      setLoading(true);
      setError('');
      const data = await PageMenuService.getMenu(restaurant_id, table_id);
      
      if (data && data.status) {
        setMenuData(data);
        // Default to 'all' to show all categories
        setActiveCategory('all');
      } else {
        setError(data?.message || t('errors.failedToLoad'));
      }
    } catch (err) {
      setError(err.message || t('errors.failedToLoad'));
    } finally {
      setLoading(false);
    }
  };

  const fetchOrders = async () => {
    if (!restaurant_id || !table_id) return;
    
    try {
      setOrdersLoading(true);
      const response = await PageMenuService.getLastOrder(restaurant_id, table_id);
      
      // Handle response structure - getLastOrder returns { success: true, order: order }
      let ordersData = [];
      if (response && response.success && response.order) {
        // Wrap single order in array for consistency with existing UI
        ordersData = [response.order];
      }
      
      setOrders(Array.isArray(ordersData) ? ordersData : []);
    } catch (err) {
      console.error('Error fetching last order:', err);
      setOrders([]);
    } finally {
      setOrdersLoading(false);
    }
  };

  const formatPrice = (price) => {
    return `${parseFloat(price).toFixed(2)} MAD`;
  };

  const addToCart = (meal) => {
    if (!meal.available) return;
    
    setCart(prevCart => {
      const existingItem = prevCart.find(item => item.id === meal.id);
      if (existingItem) {
        return prevCart.map(item =>
          item.id === meal.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      } else {
        return [...prevCart, { ...meal, quantity: 1, notes: '' }];
      }
    });
  };

  const updateQuantity = (mealId, change) => {
    setCart(prevCart =>
      prevCart.reduce((acc, item) => {
        if (item.id === mealId) {
          const newQuantity = item.quantity + change;
          if (newQuantity > 0) {
            acc.push({ ...item, quantity: newQuantity });
          }
        } else {
          acc.push(item);
        }
        return acc;
      }, [])
    );
  };

  const removeFromCart = (mealId) => {
    setCart(prevCart => prevCart.filter(item => item.id !== mealId));
  };

  const updateNotes = (mealId, notes) => {
    setCart(prevCart =>
      prevCart.map(item =>
        item.id === mealId ? { ...item, notes } : item
      )
    );
  };

  const getCartTotal = () => {
    return cart.reduce((total, item) => 
      total + (parseFloat(item.price) * item.quantity), 0
    );
  };

  const getCartItemCount = () => {
    return cart.reduce((count, item) => count + item.quantity, 0);
  };

  const getTax = () => getCartTotal() * 0.1;
  const getServiceFee = () => 1.99;
  const getFinalTotal = () => getCartTotal() + getTax() + getServiceFee();

  const handleAddOrder = async () => {
    if (cart.length === 0) return;
    
    // Validate that we have restaurant_id and table_id
    if (!restaurant_id || !table_id) {
      setOrderError('Missing restaurant or table information');
      return;
    }

    setIsSubmitting(true);
    setOrderError('');
    
    try {
      // Debug: Log cart items before transformation
      console.log('Cart items before transformation:', cart);
      
      // Transform cart items to match backend format
      const orderItems = cart.map(item => {
        const note = item.notes && item.notes.trim() ? item.notes.trim() : null;
        console.log(`Item ${item.id} note:`, note, 'from item.notes:', item.notes);
        return {
          meal_id: item.id, // meal_id from cart item
          quantity: item.quantity,
          price: parseFloat(item.price), // Ensure price is a number
          note: note // Include note for each item
        };
      });
      
      console.log('Order items after transformation:', orderItems);

      // Call the API to create the order
      const response = await PageMenuService.createOrder(
        parseInt(restaurant_id),
        parseInt(table_id),
        orderItems
      );

      if (response.success) {
        setOrderSuccess(true);
        setCart([]);
        setOrderError('');
        // Refresh orders after creating a new one
        fetchOrders();
        
        setTimeout(() => {
          setOrderSuccess(false);
        }, 3000);
      } else {
        throw new Error(response.message || 'Failed to create order');
      }
    } catch (error) {
      // Display error message
      const errorMessage = error.message || 'Failed to submit order. Please try again.';
      setOrderError(errorMessage);
      console.error('Order submission error:', error);
      
      // Clear error after 5 seconds
      setTimeout(() => {
        setOrderError('');
      }, 5000);
    } finally {
      setIsSubmitting(false);
    }
  };

  const getCategoryIcon = (category) => {
    // For icon matching, prefer English name so icons match correctly across languages
    // Fall back to translated name or original name if English not available
    let categoryName;
    if (typeof category === 'string') {
      categoryName = category;
    } else {
      // Try to get English name first for icon matching
      const enName = category.translations?.find(t => t.locale === 'en')?.name;
      categoryName = enName || getCategoryName(category, currentLocale) || category.name || '';
    }
    const name = categoryName.toLowerCase();
    if (name.includes('burger')) return <Beef className="w-4 h-4" />;
    if (name.includes('noodle') || name.includes('pasta')) return <UtensilsCrossed className="w-4 h-4" />;
    if (name.includes('drink') || name.includes('beverage')) return <Coffee className="w-4 h-4" />;
    if (name.includes('dessert')) return <Cake className="w-4 h-4" />;
    if (name.includes('pizza')) return <Pizza className="w-4 h-4" />;
    if (name.includes('sandwich')) return <Sandwich className="w-4 h-4" />;
    if (name.includes('wine') || name.includes('alcohol')) return <Wine className="w-4 h-4" />;
    if (name.includes('ice cream')) return <IceCream className="w-4 h-4" />;
    return <UtensilsCrossed className="w-4 h-4" />;
  };

  const getStatusLabel = (status) => {
    const labels = {
      pending: t('status.pending'),
      confirmed: t('status.confirmed'),
      preparing: t('status.preparing'),
      ready: t('status.ready'),
      served: t('status.served'),
      completed: t('status.completed'),
      cancelled: t('status.cancelled')
    };
    return labels[status] || status;
  };

  const getStatusColor = (status) => {
    const colors = {
      pending: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      confirmed: 'bg-blue-100 text-blue-800 border-blue-200',
      preparing: 'bg-purple-100 text-purple-800 border-purple-200',
      ready: 'bg-green-100 text-green-800 border-green-200',
      served: 'bg-teal-100 text-teal-800 border-teal-200',
      completed: 'bg-gray-100 text-gray-800 border-gray-200',
      cancelled: 'bg-red-100 text-red-800 border-red-200'
    };
    return colors[status] || 'bg-gray-100 text-gray-800 border-gray-200';
  };

  const getStatusIcon = (status) => {
    switch(status) {
      case 'pending':
        return <Clock className="w-4 h-4" />;
      case 'confirmed':
        return <Check className="w-4 h-4" />;
      case 'preparing':
        return <ChefHat className="w-4 h-4" />;
      case 'ready':
        return <Package className="w-4 h-4" />;
      case 'served':
        return <UtensilsCrossed className="w-4 h-4" />;
      case 'completed':
        return <Check className="w-4 h-4" />;
      case 'cancelled':
        return <X className="w-4 h-4" />;
      default:
        return <Clock className="w-4 h-4" />;
    }
  };

  const filteredMeals = (() => {
    let meals = [];
    
    if (activeCategory === 'all') {
      // Get all meals from all categories
      meals = menuData?.categories?.flatMap(cat => cat.meals || []) || [];
    } else {
      // Get meals from selected category
      meals = menuData?.categories
    ?.find(cat => cat.id === activeCategory)
        ?.meals || [];
    }
    
    // Apply search and filters
    return meals.filter(meal => {
      const mealName = getMealName(meal, currentLocale).toLowerCase();
      const mealDesc = getMealDescription(meal, currentLocale).toLowerCase();
      const matchesSearch = mealName.includes(searchQuery.toLowerCase()) ||
        (mealDesc && mealDesc.includes(searchQuery.toLowerCase()));
      
      if (selectedFilter === 'available') return matchesSearch && meal.available;
      if (selectedFilter === 'popular') return matchesSearch && (meal.rating > 4.5 || meal.is_popular);
      if (selectedFilter === 'vegetarian') return matchesSearch && meal.is_vegetarian;
      return matchesSearch;
    });
  })();

  const sortedMeals = [...filteredMeals].sort((a, b) => {
    switch(sortBy) {
      case 'price-low': return parseFloat(a.price) - parseFloat(b.price);
      case 'price-high': return parseFloat(b.price) - parseFloat(a.price);
      case 'popular': return (b.rating || 0) - (a.rating || 0);
      case 'name': {
        const nameA = getMealName(a, currentLocale).toLowerCase();
        const nameB = getMealName(b, currentLocale).toLowerCase();
        return nameA.localeCompare(nameB);
      }
      default: return 0;
    }
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-orange-500 mx-auto mb-4"></div>
          <p className="text-gray-600 text-sm">{t('errors.loadingMenu')}</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center p-4">
        <div className="bg-white rounded-lg border border-gray-200 p-6 max-w-md w-full text-center shadow-sm">
          <X className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-lg font-bold text-gray-800 mb-2">{t('errors.error')}</h2>
          <p className="text-gray-600 text-sm mb-4">{error}</p>
          <button
            onClick={fetchMenu}
            className="bg-orange-500 hover:bg-orange-600 text-white font-medium py-2 px-4 rounded-lg transition duration-200 w-full text-sm"
          >
            {t('errors.tryAgain')}
          </button>
        </div>
      </div>
    );
  }

  if (!menuData) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <UtensilsCrossed className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600 text-sm">{t('errors.noMenuData')}</p>
        </div>
      </div>
    );
  }

  const currentDate = new Date().toLocaleDateString('en-US', { 
    month: 'long', 
    day: 'numeric', 
    year: 'numeric' 
  });

  return (
    <div className="min-h-screen bg-white flex">
      {/* Category Sidebar (Left) */}
      <div className={`bg-gray-50 border-r border-gray-200 transition-all duration-200 ${
        isCategorySidebarOpen ? 'w-56' : 'w-0'
      } overflow-hidden flex flex-col`}>
        <div className={`p-3 ${!isCategorySidebarOpen && 'hidden'}`}>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-bold text-gray-800 uppercase tracking-wider">{t('categories.title')}</h2>
            <button
              onClick={() => setIsCategorySidebarOpen(false)}
              className="p-1 hover:bg-gray-200 rounded transition-colors"
            >
              <ChevronLeft className="w-4 h-4 text-gray-600" />
            </button>
          </div>
          
          <div className="space-y-1">
            {/* All Button in Sidebar */}
            <button
              onClick={() => setActiveCategory('all')}
              className={`w-full flex items-center gap-2 px-3 py-2.5 rounded-md transition-all duration-150 text-sm ${
                activeCategory === 'all'
                  ? 'bg-orange-500 text-white shadow-sm'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              <div className={`p-1.5 rounded ${activeCategory === 'all' ? 'bg-white/20' : 'bg-gray-200'}`}>
                <UtensilsCrossed className="w-4 h-4" />
              </div>
              <span className="flex-1 text-left font-medium">{t('categories.all')}</span>
              <span className={`text-xs px-1.5 py-0.5 rounded ${
                activeCategory === 'all' 
                  ? 'bg-white/20' 
                  : 'bg-gray-200 text-gray-600'
              }`}>
                {menuData?.categories?.reduce((sum, cat) => sum + (cat.meals?.length || 0), 0) || 0}
              </span>
            </button>
            
            {menuData.categories?.map((category) => (
              <button
                key={category.id}
                onClick={() => setActiveCategory(category.id)}
                className={`w-full flex items-center gap-2 px-3 py-2.5 rounded-md transition-all duration-150 text-sm ${
                  activeCategory === category.id
                    ? 'bg-orange-500 text-white shadow-sm'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <div className={`p-1.5 rounded ${activeCategory === category.id ? 'bg-white/20' : 'bg-gray-200'}`}>
                  {getCategoryIcon(category)}
                </div>
                <span className="flex-1 text-left font-medium">{getCategoryName(category, currentLocale)}</span>
                <span className={`text-xs px-1.5 py-0.5 rounded ${
                  activeCategory === category.id 
                    ? 'bg-white/20' 
                    : 'bg-gray-200 text-gray-600'
                }`}>
                  {category.meals?.length || 0}
                </span>
              </button>
            ))}
          </div>

          {/* Filters */}
          <div className="mt-6">
            <div className="flex items-center gap-2 mb-3">
              <Filter className="w-4 h-4 text-gray-500" />
              <h3 className="text-xs font-bold text-gray-600 uppercase tracking-wider">{t('filters.title')}</h3>
            </div>
            <div className="space-y-1">
              {[
                { id: 'all', label: t('filters.allItems'), icon: <UtensilsCrossed className="w-3 h-3" /> },
                { id: 'available', label: t('filters.available'), icon: <Check className="w-3 h-3" /> },
                { id: 'popular', label: t('filters.popular'), icon: <Flame className="w-3 h-3" /> },
                { id: 'vegetarian', label: t('filters.vegetarian'), icon: <Leaf className="w-3 h-3" /> }
              ].map((filter) => (
                <button
                  key={filter.id}
                  onClick={() => setSelectedFilter(filter.id)}
                  className={`w-full flex items-center gap-2 px-3 py-2 text-xs rounded transition-colors ${
                    selectedFilter === filter.id
                      ? 'bg-orange-50 text-orange-600 border border-orange-200'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  {filter.icon}
                  <span>{filter.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Sort */}
          <div className="mt-6">
            <div className="flex items-center gap-2 mb-3">
              <ArrowUpDown className="w-4 h-4 text-gray-500" />
              <h3 className="text-xs font-bold text-gray-600 uppercase tracking-wider">{t('sort.title')}</h3>
            </div>
            <div className="space-y-1">
              {[
                { id: 'default', label: t('sort.default'), icon: '📋' },
                { id: 'price-low', label: t('sort.priceLow'), icon: '💰↓' },
                { id: 'price-high', label: t('sort.priceHigh'), icon: '💰↑' },
                { id: 'popular', label: t('sort.mostPopular'), icon: '🔥' },
                { id: 'name', label: t('sort.nameAZ'), icon: '🔤' }
              ].map((option) => (
                <button
                  key={option.id}
                  onClick={() => setSortBy(option.id)}
                  className={`w-full flex items-center gap-2 px-3 py-2 text-xs rounded transition-colors ${
                    sortBy === option.id
                      ? 'bg-gray-100 text-gray-800 border border-gray-300'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  <span>{option.icon}</span>
                  <span>{option.label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Toggle Category Sidebar Button */}
      {!isCategorySidebarOpen && (
        <button
          onClick={() => setIsCategorySidebarOpen(true)}
          className="fixed left-0 top-1/2 -translate-y-1/2 z-30 bg-orange-500 text-white p-2 rounded-r-md hover:bg-orange-600 transition-colors shadow-sm"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      )}

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto">
        {/* Header */}
        <div className="bg-white border-b border-gray-200 p-3 sticky top-0 z-10 shadow-sm">
          <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-3">
                {!isCategorySidebarOpen && (
                  <button
                    onClick={() => setIsCategorySidebarOpen(true)}
                    className="p-1.5 hover:bg-gray-100 rounded transition-colors"
                  >
                    <Menu className="w-5 h-5 text-gray-600" />
                  </button>
                )}
                <div className="flex items-center gap-3">
                  <div className="relative flex items-center">
                    <Crown className="w-4 h-4 text-orange-500 absolute -top-2 left-1/2 -translate-x-1/2 z-10" />
                    {menuData.restaurant?.logo ? (
                      <img
                        src={`http://localhost:8000/storage/${menuData.restaurant.logo}`}
                        alt={menuData.restaurant?.name || 'Logo'}
                        className="w-16 h-16 object-contain"
                        onError={(e) => {
                          e.target.style.display = 'none';
                          const fallback = e.target.parentElement.querySelector('.logo-fallback');
                          if (fallback) fallback.style.display = 'flex';
                        }}
                      />
                    ) : null}
                    <div className={`logo-fallback ${menuData.restaurant?.logo ? 'hidden' : 'flex'} items-center justify-center w-16 h-16`}>
                      <UtensilsCrossed className="w-10 h-10 text-orange-500" />
                    </div>
                  </div>
                <div>
                  <h1 className="text-lg font-bold text-gray-900">{menuData.restaurant?.name}</h1>
                  <p className="text-gray-500 text-xs">{currentDate}</p>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <div className="hidden md:flex items-center gap-2 bg-gray-100 px-2 py-1 rounded-full">
                  <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></div>
                  <span className="text-xs text-gray-600">{t('header.kitchenActive')}</span>
                </div>
                
                <div className="text-right">
                  <div className="text-gray-900 font-medium text-sm">{t('header.order')}</div>
                  <div className="text-gray-500 text-xs">{t('header.table')} {menuData.table_id}</div>
                </div>
                
                {/* Language Switcher */}
                <div className="relative language-menu-container">
                  <button
                    onClick={() => setShowLanguageMenu(!showLanguageMenu)}
                    className="p-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors shadow-sm"
                    title="Change Language"
                  >
                    <Globe className="w-5 h-5" />
                  </button>
                  {showLanguageMenu && (
                    <div className="absolute right-0 mt-2 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50 min-w-[120px]">
                      <button
                        onClick={() => changeLanguage('en')}
                        className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-100 flex items-center gap-2 ${
                          currentLocale === 'en' ? 'bg-orange-50 text-orange-600' : 'text-gray-700'
                        }`}
                      >
                        {currentLocale === 'en' && <Check className="w-4 h-4" />}
                        {t('language.english')}
                      </button>
                      <button
                        onClick={() => changeLanguage('fr')}
                        className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-100 flex items-center gap-2 ${
                          currentLocale === 'fr' ? 'bg-orange-50 text-orange-600' : 'text-gray-700'
                        }`}
                      >
                        {currentLocale === 'fr' && <Check className="w-4 h-4" />}
                        {t('language.french')}
                      </button>
                      <button
                        onClick={() => changeLanguage('ar')}
                        className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-100 flex items-center gap-2 ${
                          currentLocale === 'ar' ? 'bg-orange-50 text-orange-600' : 'text-gray-700'
                        }`}
                      >
                        {currentLocale === 'ar' && <Check className="w-4 h-4" />}
                        {t('language.arabic')}
                      </button>
                    </div>
                  )}
                </div>
                
                <button
                  onClick={() => setShowOrderTracking(!showOrderTracking)}
                  className="relative p-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors shadow-sm"
                  title={t('orderTracking.title')}
                >
                  <Package className="w-5 h-5" />
                  {orders.filter(o => o.status !== 'completed' && o.status !== 'cancelled').length > 0 && (
                    <span className="absolute -top-1 -right-1 bg-white text-blue-600 text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center">
                      {orders.filter(o => o.status !== 'completed' && o.status !== 'cancelled').length}
                    </span>
                  )}
                </button>
                
                <button
                  onClick={() => setIsOrderBarOpen(!isOrderBarOpen)}
                  className="relative p-2 bg-orange-500 hover:bg-orange-600 text-white rounded-lg transition-colors shadow-sm"
                >
                  <ShoppingCart className="w-5 h-5" />
                  {cart.length > 0 && (
                    <span className="absolute -top-1 -right-1 bg-white text-orange-600 text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center">
                      {getCartItemCount()}
                    </span>
                  )}
                </button>
              </div>
            </div>

            {/* Cover Image Banner */}
            {menuData.restaurant?.cover_image && (
              <div className="mt-4">
                <div className="relative h-48 sm:h-64 md:h-80 w-full overflow-hidden rounded-lg">
                  <img
                    src={`http://localhost:8000/storage/${menuData.restaurant.cover_image}`}
                    alt={menuData.restaurant?.name || 'Restaurant banner'}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.target.style.display = 'none';
                    }}
                  />
                  {/* Optional gradient overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
                </div>
              </div>
            )}

            {/* Search Bar */}
            <div className={`relative ${menuData.restaurant?.cover_image ? 'mt-4' : 'mt-0'}`}>
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder={t('search.placeholder')}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-8 py-2 bg-gray-50 border border-gray-300 rounded-lg text-sm text-gray-900 placeholder-gray-500 focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition-colors"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-0.5 hover:bg-gray-200 rounded transition-colors"
                >
                  <X className="w-3.5 h-3.5 text-gray-500" />
                </button>
              )}
            </div>

            {/* Category Filter - Horizontal Scrollable */}
            <div className="mt-4">
              <h2 className="text-sm font-semibold text-gray-700 mb-3">{t('categories.findBestFood')}</h2>
              <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
                {/* All Button */}
                <button
                  onClick={() => setActiveCategory('all')}
                  className={`flex-shrink-0 flex items-center gap-2 px-5 py-2.5 rounded-full font-medium text-sm transition-all duration-200 whitespace-nowrap ${
                    activeCategory === 'all'
                      ? 'bg-orange-500 text-white shadow-md'
                      : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-200'
                  }`}
                >
                  <div className={`w-6 h-6 rounded-full overflow-hidden flex items-center justify-center flex-shrink-0 ${
                    activeCategory === 'all' ? 'bg-white/20' : 'bg-gray-100'
                  }`}>
                    <UtensilsCrossed className={`w-4 h-4 ${
                      activeCategory === 'all' ? 'text-white' : 'text-gray-600'
                    }`} />
                  </div>
                  <span>{t('categories.all')}</span>
                </button>
                
                {/* Category Buttons */}
                {menuData.categories?.map((category) => {
                  const iconElement = getCategoryIcon(category);
                  const coloredIcon = React.cloneElement(iconElement, {
                    className: `w-4 h-4 ${activeCategory === category.id ? 'text-white' : 'text-gray-600'}`
                  });
                  
                  const showImage = category.image && !failedCategoryImages.has(category.id);
                  const handleImageError = () => {
                    setFailedCategoryImages(prev => new Set([...prev, category.id]));
                  };
                  
                  return (
                    <button
                      key={category.id}
                      onClick={() => setActiveCategory(category.id)}
                      className={`flex-shrink-0 flex items-center gap-2 px-5 py-2.5 rounded-full font-medium text-sm transition-all duration-200 whitespace-nowrap ${
                        activeCategory === category.id
                          ? 'bg-orange-500 text-white shadow-md'
                          : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-200'
                      }`}
                    >
                      <div className={`w-6 h-6 rounded-full overflow-hidden flex items-center justify-center flex-shrink-0 ${
                        activeCategory === category.id ? 'bg-white/20' : 'bg-gray-100'
                      }`}>
                        {showImage ? (
                          <img
                            src={`http://localhost:8000/storage/${category.image}`}
                            alt={getCategoryName(category, currentLocale)}
                            className="w-full h-full object-cover"
                            onError={handleImageError}
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            {coloredIcon}
                          </div>
                        )}
                      </div>
                      <span>{getCategoryName(category, currentLocale)}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Active Category Info */}
            <div className="mt-3 flex items-center gap-2">
              {activeCategory === 'all' ? (
                <div className="px-2 py-0.5 bg-teal-100 text-teal-700 rounded text-xs font-medium">
                  {t('categories.allCategories')}
                </div>
              ) : (() => {
                const activeCat = menuData.categories?.find(cat => cat.id === activeCategory);
                return activeCat ? (
                  <div className="px-2 py-0.5 bg-orange-100 text-orange-700 rounded text-xs font-medium">
                    {getCategoryName(activeCat, currentLocale)}
                  </div>
                ) : null;
              })()}
                <span className="text-gray-500 text-xs">
                {sortedMeals.length} {t('categories.items')} • ${getCartTotal().toFixed(2)} {t('categories.inCart')}
                </span>
              </div>
        </div>

        {/* Menu Items Grid - Small Cards */}
        <div className="p-3">
          <div className="max-w-7xl mx-auto">
            {sortedMeals.length === 0 ? (
              <div className="text-center py-12">
                <Search className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500 text-sm">{t('meals.noItemsFound')}</p>
                <p className="text-gray-400 text-xs mt-1">{t('meals.tryAdjusting')}</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
                {sortedMeals.map((meal) => (
                  <div
                    key={meal.id}
                    className={`bg-white rounded-lg overflow-hidden border border-gray-200 hover:border-orange-300 hover:shadow-sm transition-all duration-150 ${
                      !meal.available ? 'opacity-50' : ''
                    }`}
                  >
                    {/* Image */}
                    <div className="relative h-28 overflow-hidden">
                      <img
                        src={`http://localhost:8000/storage/${meal.image}`}
                        alt={getMealName(meal, currentLocale)}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.target.src = 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=400';
                        }}
                      />
                      
                      {/* Badges */}
                      <div className="absolute top-1.5 left-1.5 flex flex-col gap-1">
                        {!meal.available && (
                          <span className="bg-red-500 text-white px-1.5 py-0.5 rounded text-[10px] font-bold">
                            {t('meals.soldOut')}
                          </span>
                        )}
                        {meal.prep_time && (
                          <span className="bg-black/80 text-white px-1.5 py-0.5 rounded text-[10px] flex items-center gap-1">
                            <Clock className="w-2.5 h-2.5" />
                            {meal.prep_time}
                          </span>
                        )}
                        {meal.rating > 4.5 && (
                          <span className="bg-amber-500 text-white px-1.5 py-0.5 rounded text-[10px] flex items-center gap-1">
                            <Star className="w-2.5 h-2.5 fill-white" />
                            {meal.rating}
                          </span>
                        )}
                      </div>
                    </div>
                    
                    {/* Info */}
                    <div className="p-2">
                      <div className="flex items-start justify-between mb-1">
                        <div className="flex-1 min-w-0">
                          <h3 className="text-xs font-bold text-gray-900 truncate">
                            {getMealName(meal, currentLocale)}
                          </h3>
                          {getMealDescription(meal, currentLocale) && (
                            <p className="text-gray-500 text-[10px] truncate mt-0.5">
                              {getMealDescription(meal, currentLocale)}
                            </p>
                          )}
                        </div>
                        <span className="text-sm font-bold text-orange-500 ml-1 whitespace-nowrap">
                          {formatPrice(meal.price)}
                        </span>
                      </div>

                      {/* Tags */}
                      <div className="flex flex-wrap gap-1 mb-2">
                        {meal.is_spicy && (
                          <span className="px-1 py-0.5 bg-red-50 text-red-700 text-[10px] rounded flex items-center gap-0.5">
                            <Flame className="w-2.5 h-2.5" />
                            {t('meals.spicy')}
                          </span>
                        )}
                        {meal.is_vegetarian && (
                          <span className="px-1 py-0.5 bg-green-50 text-green-700 text-[10px] rounded flex items-center gap-0.5">
                            <Leaf className="w-2.5 h-2.5" />
                            {t('meals.veg')}
                          </span>
                        )}
                      </div>

                      {/* Add Button */}
                      <button
                        onClick={() => addToCart(meal)}
                        disabled={!meal.available}
                        className={`w-full py-1.5 rounded-md text-xs font-medium transition-all duration-150 flex items-center justify-center gap-1.5 ${
                          meal.available
                            ? 'bg-orange-500 hover:bg-orange-600 text-white'
                            : 'bg-gray-200 text-gray-500 cursor-not-allowed'
                        }`}
                      >
                        {cart.find(item => item.id === meal.id) ? (
                          <>
                            <Check className="w-3.5 h-3.5" />
                            <span className="text-[10px]">{t('meals.added')} ({cart.find(item => item.id === meal.id)?.quantity})</span>
                          </>
                        ) : (
                          <>
                            <Plus className="w-3.5 h-3.5" />
                            <span>{t('meals.add')}</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Order Sidebar (Right) */}
      <div className={`bg-gray-50 border-l border-gray-200 flex flex-col h-screen sticky top-0 transition-all duration-200 ${
        isOrderBarOpen ? 'w-72' : 'w-0'
      } overflow-hidden shadow-sm`}>
        <div className={`h-full flex flex-col ${!isOrderBarOpen && 'hidden'}`}>
          {/* Header */}
          <div className="bg-white border-b border-gray-200 p-3">
            <div className="flex items-center justify-between mb-2">
              <div>
                <h2 className="text-sm font-bold text-gray-900">{t('cart.title')}</h2>
                <p className="text-gray-500 text-xs">{t('header.table')} {menuData.table_id}</p>
              </div>
              <div className="flex items-center gap-1">
                <button className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-2 py-1 rounded text-xs flex items-center gap-1 transition-colors">
                  <Plus className="w-3 h-3" />
                  {t('cart.addOn')}
                </button>
                <button
                  onClick={() => setIsOrderBarOpen(false)}
                  className="p-1 hover:bg-gray-100 rounded transition-colors"
                >
                  <X className="w-4 h-4 text-gray-500" />
                </button>
              </div>
            </div>

            {/* Status */}
            <div className="bg-green-50 border border-green-200 rounded px-2 py-1.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></div>
                  <span className="text-xs font-medium text-green-800">{t('cart.kitchenReady')}</span>
                </div>
                <span className="text-[10px] text-green-600">{t('cart.estTime')}</span>
              </div>
            </div>
          </div>

          {/* Order Items */}
          <div className="flex-1 overflow-y-auto p-3">
            {cart.length === 0 ? (
              <div className="text-center py-12">
                <ShoppingCart className="w-10 h-10 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500 text-sm">{t('cart.empty')}</p>
                <p className="text-gray-400 text-xs mt-1">{t('cart.addItems')}</p>
              </div>
            ) : (
              <div className="space-y-2">
                {cart.map((item) => (
                  <div key={item.id} className="bg-white rounded border border-gray-200 p-2">
                    <div className="flex gap-2">
                      <div className="w-14 h-14 rounded overflow-hidden flex-shrink-0">
                        <img
                          src={`http://localhost:8000/storage/${item.image}`}
                          alt={getMealName(item, currentLocale)}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-start mb-1">
                          <h3 className="text-xs font-medium text-gray-900 truncate">
                            {getMealName(item, currentLocale)}
                          </h3>
                          <button
                            onClick={() => removeFromCart(item.id)}
                            className="p-0.5 hover:bg-gray-100 rounded transition-colors"
                          >
                            <X className="w-3 h-3 text-gray-500" />
                          </button>
                        </div>
                        
                        <p className="text-gray-500 text-[10px] mb-2">{t('cart.extraSauce')}</p>
                        
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-1.5 bg-gray-100 rounded px-1.5 py-0.5">
                            <button
                              onClick={() => updateQuantity(item.id, -1)}
                              className="w-5 h-5 rounded flex items-center justify-center hover:bg-gray-200 transition-colors"
                            >
                              <Minus className="w-2.5 h-2.5 text-gray-700" />
                            </button>
                            <span className="font-medium text-gray-900 text-xs w-5 text-center">
                              {item.quantity}
                            </span>
                            <button
                              onClick={() => updateQuantity(item.id, 1)}
                              className="w-5 h-5 rounded flex items-center justify-center hover:bg-gray-200 transition-colors"
                            >
                              <Plus className="w-2.5 h-2.5 text-gray-700" />
                            </button>
                          </div>
                          <span className="font-bold text-gray-900 text-sm">
                            {formatPrice(parseFloat(item.price) * item.quantity)}
                          </span>
                        </div>
                        
                        {/* Notes Input */}
                        <input
                          type="text"
                          placeholder={t('cart.addNote')}
                          value={item.notes || ''}
                          onChange={(e) => updateNotes(item.id, e.target.value)}
                          className="w-full mt-1 px-1.5 py-0.5 text-xs border border-gray-300 rounded focus:outline-none focus:border-orange-500"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Order Summary */}
          {cart.length > 0 && (
            <div className="border-t border-gray-200 p-3 bg-white">
              {/* Error Message */}
              {orderError && (
                <div className="mb-3 p-2 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-red-700 text-xs">{orderError}</p>
                </div>
              )}
              
              <div className="space-y-2 mb-3">
                <div className="flex justify-between items-center text-gray-700 text-sm">
                  <span className="flex items-center gap-1">
                    <Receipt className="w-3.5 h-3.5" />
                    {t('cart.subTotal')}
                  </span>
                  <span className="font-medium">{formatPrice(getCartTotal())}</span>
                </div>
                <div className="flex justify-between items-center text-gray-700 text-sm">
                  <span className="flex items-center gap-1">
                    <Tag className="w-3.5 h-3.5" />
                    {t('cart.tax')}
                  </span>
                  <span className="font-medium">{formatPrice(getTax())}</span>
                </div>
                <div className="flex justify-between items-center text-gray-700 text-sm">
                  <span className="flex items-center gap-1">
                    <Wallet className="w-3.5 h-3.5" />
                    {t('cart.serviceFee')}
                  </span>
                  <span className="font-medium">{formatPrice(getServiceFee())}</span>
                </div>
                <div className="border-t border-gray-300 pt-2">
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-gray-900">{t('cart.total')}</span>
                    <span className="font-bold text-orange-500 text-lg">
                      {formatPrice(getFinalTotal())}
                    </span>
                  </div>
                </div>
              </div>
              
              <button
                onClick={handleAddOrder}
                disabled={isSubmitting || cart.length === 0}
                className={`w-full py-2.5 rounded-lg font-bold text-sm transition-colors flex items-center justify-center gap-2 ${
                  isSubmitting || cart.length === 0
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    : 'bg-orange-500 hover:bg-orange-600 text-white shadow-sm hover:shadow'
                }`}
              >
                {isSubmitting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white"></div>
                    {t('cart.processing')}
                  </>
                ) : (
                  <>
                    <ShoppingCart className="w-4 h-4" />
                    {t('cart.placeOrder')} • {formatPrice(getFinalTotal())}
                  </>
                )}
              </button>
              
              <p className="text-center text-gray-500 text-xs mt-2">
                {t('cart.orderSent')}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Toggle Order Bar Button */}
      {!isOrderBarOpen && (
        <button
          onClick={() => setIsOrderBarOpen(true)}
          className="fixed right-0 top-1/2 -translate-y-1/2 z-30 bg-orange-500 text-white p-2 rounded-l-md hover:bg-orange-600 transition-colors shadow-sm"
        >
          <div className="relative">
            <ShoppingCart className="w-4 h-4" />
            {cart.length > 0 && (
              <span className="absolute -top-1 -right-1 bg-white text-orange-600 text-[10px] font-bold rounded-full w-3.5 h-3.5 flex items-center justify-center">
                {getCartItemCount()}
              </span>
            )}
          </div>
        </button>
      )}

      {/* Order Tracking Modal */}
      {showOrderTracking && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-lg max-w-2xl w-full max-h-[90vh] overflow-hidden border border-gray-200">
            <div className="bg-orange-500 text-white p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Package className="w-6 h-6" />
                <div>
                  <h2 className="text-lg font-bold">{t('orderTracking.title')}</h2>
                  <p className="text-sm text-orange-100">{t('header.table')} {menuData.table_id}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={fetchOrders}
                  disabled={ordersLoading}
                  className="p-2 hover:bg-orange-600 rounded-lg transition-colors disabled:opacity-50"
                  title={t('orderTracking.refresh')}
                >
                  <RefreshCw className={`w-5 h-5 ${ordersLoading ? 'animate-spin' : ''}`} />
                </button>
                <button
                  onClick={() => setShowOrderTracking(false)}
                  className="p-2 hover:bg-orange-600 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="overflow-y-auto max-h-[calc(90vh-120px)] p-4">
              {ordersLoading && orders.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12">
                  <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-orange-500 mb-4"></div>
                  <p className="text-gray-600 text-sm">{t('orderTracking.loading')}</p>
                </div>
              ) : orders.length === 0 ? (
                <div className="text-center py-12">
                  <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">{t('orderTracking.noOrders')}</h3>
                  <p className="text-gray-500 text-sm">{t('orderTracking.noOrdersDesc')}</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {orders
                    .sort((a, b) => {
                      const statusOrder = {
                        pending: 1,
                        confirmed: 2,
                        preparing: 3,
                        ready: 4,
                        served: 5,
                        completed: 6,
                        cancelled: 0
                      };
                      return (statusOrder[b.status] || 0) - (statusOrder[a.status] || 0);
                    })
                    .map((order) => (
                      <div key={order.id} className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <div className="flex items-center gap-2 mb-1">
                              <h3 className="font-bold text-gray-900">{t('orderTracking.order')} #{order.id}</h3>
                              <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusColor(order.status)}`}>
                                {getStatusIcon(order.status)}
                                {getStatusLabel(order.status)}
                              </span>
                            </div>
                            <p className="text-xs text-gray-500">
                              {new Date(order.created_at).toLocaleString()}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="font-bold text-orange-500 text-lg">${parseFloat(order.total).toFixed(2)}</p>
                            <p className="text-xs text-gray-500">{order.order_items?.length || 0} {t('orderTracking.items')}</p>
                          </div>
                        </div>

                        {/* Status Progress Bar */}
                        <div className="mb-3">
                          <div className="flex items-center justify-between text-xs text-gray-500 mb-1">
                            <span>{t('orderTracking.orderProgress')}</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div
                              className={`h-2 rounded-full transition-all duration-300 ${
                                order.status === 'pending' ? 'bg-yellow-500 w-[14%]' :
                                order.status === 'confirmed' ? 'bg-blue-500 w-[28%]' :
                                order.status === 'preparing' ? 'bg-purple-500 w-[42%]' :
                                order.status === 'ready' ? 'bg-green-500 w-[57%]' :
                                order.status === 'served' ? 'bg-teal-500 w-[71%]' :
                                order.status === 'completed' ? 'bg-gray-500 w-[100%]' :
                                'bg-red-500 w-[0%]'
                              }`}
                            ></div>
                          </div>
                        </div>

                        {/* Order Items */}
                        <div className="space-y-2">
                          <h4 className="text-sm font-medium text-gray-700 mb-2">{t('orderTracking.items')}:</h4>
                          {order.order_items?.slice(0, 3).map((item, idx) => (
                            <div key={item.id || idx} className="flex items-center justify-between text-sm bg-gray-50 rounded px-2 py-1">
                              <span className="text-gray-700">
                                {item.meal ? getMealName(item.meal, currentLocale) || `Item #${item.meal_id}` : `Item #${item.meal_id}`} x{item.quantity}
                                {item.note && (
                                  <span className="text-gray-500 text-xs ml-2">({item.note})</span>
                                )}
                              </span>
                              <span className="font-medium text-gray-900">
                                ${((item.quantity || 0) * (item.price || 0)).toFixed(2)}
                              </span>
                            </div>
                          ))}
                          {order.order_items?.length > 3 && (
                            <p className="text-xs text-gray-500 text-center">
                              +{order.order_items.length - 3} {t('orderTracking.moreItems')}
                            </p>
                          )}
                        </div>
                      </div>
                    ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Order Success Modal */}
      {orderSuccess && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-lg p-6 max-w-sm w-full text-center border border-gray-200 animate-scale-in">
            <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <Check className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-lg font-bold text-gray-900 mb-2">{t('orderSuccess.title')}</h2>
            <p className="text-gray-600 text-sm mb-4">{t('orderSuccess.message')}</p>
            <div className="bg-gray-50 rounded px-4 py-3 mb-4">
              <p className="text-xs text-gray-500 mb-1">{t('orderSuccess.estTime')}</p>
              <p className="text-lg font-bold text-orange-500">15-20 minutes</p>
            </div>
            <button
              onClick={() => setOrderSuccess(false)}
              className="w-full bg-orange-500 hover:bg-orange-600 text-white font-medium py-2.5 rounded-lg transition-colors text-sm"
            >
              {t('orderSuccess.continueShopping')}
            </button>
          </div>
        </div>
      )}

      <style jsx>{`
        @keyframes scale-in {
          from {
            transform: scale(0.95);
            opacity: 0;
          }
          to {
            transform: scale(1);
            opacity: 1;
          }
        }
        
        .animate-scale-in {
          animation: scale-in 0.2s ease-out;
        }
        
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </div>
  );
}