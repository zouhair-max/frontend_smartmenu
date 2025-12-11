import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { 
  Search, Plus, Minus, X, ShoppingCart, Check, 
  Menu, ChevronRight, ChevronLeft, Clock, 
  Star, Filter, ArrowUpDown, Flame, Leaf,
  Beef, Coffee, Pizza, Sandwich, Cake,
  UtensilsCrossed, ChefHat, Wine, IceCream,
  Tag, Wallet, Receipt, User, Package, RefreshCw, Crown, Globe,
  Sparkles, TrendingUp, Zap, Heart, Shield, Truck,
  Smartphone, Tablet, Monitor, Grid, List, BarChart,
  ArrowUp, ArrowDown, TrendingDown, BadgeCheck
} from 'lucide-react';
import PageMenuService from '../../services/PageMenuService';
import { getMealName, getMealDescription, getCategoryName } from '../../utils/translations';

// Get base URL for storage files
const getStorageBaseUrl = () => {
  if (process.env.REACT_APP_API_URL) {
    return process.env.REACT_APP_API_URL;
  }
  if (process.env.REACT_APP_API_BASE_URL) {
    return process.env.REACT_APP_API_BASE_URL;
  }
  if (typeof window !== 'undefined' && window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1') {
    return 'https://backend-endsmartmenu-production.up.railway.app';
  }
  return 'http://localhost:8000';
};

const STORAGE_BASE_URL = getStorageBaseUrl();

const getImageUrl = (imagePath) => {
  if (!imagePath) return null;
  
  let path = imagePath;
  if (path.startsWith('/')) {
    path = path.substring(1);
  }
  if (path.startsWith('storage/')) {
    return `${STORAGE_BASE_URL}/${path}`;
  }
  return `${STORAGE_BASE_URL}/storage/${path}`;
};

export default function PageMenu() {
  const { restaurant_id, table_id } = useParams();
  const { t, i18n } = useTranslation();
  const currentLocale = i18n.language;
  
  // Responsive state
  const [windowWidth, setWindowWidth] = useState(typeof window !== 'undefined' ? window.innerWidth : 1024);
  const [isMobile, setIsMobile] = useState(false);
  const [isTablet, setIsTablet] = useState(false);
  const [isDesktop, setIsDesktop] = useState(false);
  
  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      setWindowWidth(width);
      setIsMobile(width < 768);
      setIsTablet(width >= 768 && width < 1024);
      setIsDesktop(width >= 1024);
    };
    
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    document.documentElement.dir = currentLocale === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.lang = currentLocale;
  }, [currentLocale]);

  // State management
  const [menuData, setMenuData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');
  const [cart, setCart] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState(false);
  const [orderError, setOrderError] = useState('');
  const [isOrderBarOpen, setIsOrderBarOpen] = useState(!isMobile);
  const [isCategorySidebarOpen, setIsCategorySidebarOpen] = useState(!isMobile);
  const [sortBy, setSortBy] = useState('default');
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [orders, setOrders] = useState([]);
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [showOrderTracking, setShowOrderTracking] = useState(false);
  const [failedCategoryImages, setFailedCategoryImages] = useState(new Set());
  const [showLanguageMenu, setShowLanguageMenu] = useState(false);
  const [viewMode, setViewMode] = useState(isMobile ? 'grid' : 'detailed'); // 'grid' | 'detailed' | 'compact'
  const [showFiltersSheet, setShowFiltersSheet] = useState(false);
  const [showCartSheet, setShowCartSheet] = useState(false);
  const [animationEnabled, setAnimationEnabled] = useState(true);

  // Toggle sidebars based on screen size
  useEffect(() => {
    if (isMobile) {
      setIsCategorySidebarOpen(false);
      setIsOrderBarOpen(false);
    } else {
      setIsCategorySidebarOpen(true);
      setIsOrderBarOpen(true);
    }
  }, [isMobile]);

  const changeLanguage = (lng) => {
    i18n.changeLanguage(lng);
    localStorage.setItem('app_language', lng);
    setShowLanguageMenu(false);
  };

  useEffect(() => {
    fetchMenu();
    fetchOrders();
  }, [restaurant_id, table_id]);

  // Auto-refresh orders
  useEffect(() => {
    if (showOrderTracking && restaurant_id && table_id) {
      const interval = setInterval(() => {
        fetchOrders();
      }, 10000);
      return () => clearInterval(interval);
    }
  }, [showOrderTracking, restaurant_id, table_id]);

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
      
      let ordersData = [];
      if (response && response.success && response.order) {
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
    
    // Show visual feedback on mobile
    if (isMobile) {
      const button = document.getElementById(`meal-${meal.id}`);
      if (button) {
        button.classList.add('scale-110');
        setTimeout(() => {
          button.classList.remove('scale-110');
        }, 300);
      }
    }
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
    
    if (!restaurant_id || !table_id) {
      setOrderError('Missing restaurant or table information');
      return;
    }

    setIsSubmitting(true);
    setOrderError('');
    
    try {
      const orderItems = cart.map(item => {
        const note = item.notes && item.notes.trim() ? item.notes.trim() : null;
        return {
          meal_id: item.id,
          quantity: item.quantity,
          price: parseFloat(item.price),
          note: note
        };
      });

      const response = await PageMenuService.createOrder(
        parseInt(restaurant_id),
        parseInt(table_id),
        orderItems
      );

      if (response.success) {
        setOrderSuccess(true);
        setCart([]);
        setOrderError('');
        fetchOrders();
        
        setTimeout(() => {
          setOrderSuccess(false);
        }, 3000);
      } else {
        throw new Error(response.message || 'Failed to create order');
      }
    } catch (error) {
      const errorMessage = error.message || 'Failed to submit order. Please try again.';
      setOrderError(errorMessage);
      console.error('Order submission error:', error);
      
      setTimeout(() => {
        setOrderError('');
      }, 5000);
    } finally {
      setIsSubmitting(false);
    }
  };

  const getCategoryIcon = (category) => {
    let categoryName;
    if (typeof category === 'string') {
      categoryName = category;
    } else {
      const enName = category.translations?.find(t => t.locale === 'en')?.name;
      categoryName = enName || getCategoryName(category, currentLocale) || category.name || '';
    }
    const name = categoryName.toLowerCase();
    
    const iconMap = {
      burger: <Beef className="w-4 h-4" />,
      noodle: <UtensilsCrossed className="w-4 h-4" />,
      pasta: <UtensilsCrossed className="w-4 h-4" />,
      drink: <Coffee className="w-4 h-4" />,
      beverage: <Coffee className="w-4 h-4" />,
      dessert: <Cake className="w-4 h-4" />,
      pizza: <Pizza className="w-4 h-4" />,
      sandwich: <Sandwich className="w-4 h-4" />,
      wine: <Wine className="w-4 h-4" />,
      alcohol: <Wine className="w-4 h-4" />,
      'ice cream': <IceCream className="w-4 h-4" />,
    };
    
    for (const [key, icon] of Object.entries(iconMap)) {
      if (name.includes(key)) return icon;
    }
    
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
    const iconMap = {
      pending: <Clock className="w-4 h-4" />,
      confirmed: <Check className="w-4 h-4" />,
      preparing: <ChefHat className="w-4 h-4" />,
      ready: <Package className="w-4 h-4" />,
      served: <UtensilsCrossed className="w-4 h-4" />,
      completed: <Check className="w-4 h-4" />,
      cancelled: <X className="w-4 h-4" />
    };
    return iconMap[status] || <Clock className="w-4 h-4" />;
  };

  // Filter and sort logic
  const filteredMeals = (() => {
    let meals = [];
    
    if (activeCategory === 'all') {
      meals = menuData?.categories?.flatMap(cat => cat.meals || []) || [];
    } else {
      meals = menuData?.categories?.find(cat => cat.id === activeCategory)?.meals || [];
    }
    
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

  // Responsive grid classes
  const getGridClasses = () => {
    if (isMobile) {
      return viewMode === 'grid' ? 'grid-cols-2' : 'grid-cols-1';
    } else if (isTablet) {
      return viewMode === 'grid' ? 'grid-cols-3' : 'grid-cols-2';
    } else {
      return viewMode === 'grid' ? 'grid-cols-5' : 'grid-cols-3';
    }
  };

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="relative">
            <div className="w-20 h-20 border-4 border-gray-200 rounded-full"></div>
            <div className="absolute top-0 left-0 w-20 h-20 border-4 border-orange-500 rounded-full border-t-transparent animate-spin"></div>
          </div>
          <div className="space-y-2">
            <p className="text-gray-600 font-medium">{t('errors.loadingMenu')}</p>
            <p className="text-gray-400 text-sm">{isMobile ? 'Mobile view' : isTablet ? 'Tablet view' : 'Desktop view'}</p>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-4">
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-gray-200/50 p-6 max-w-md w-full text-center shadow-xl">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <X className="w-8 h-8 text-red-500" />
          </div>
          <h2 className="text-lg font-bold text-gray-800 mb-2">{t('errors.error')}</h2>
          <p className="text-gray-600 text-sm mb-6">{error}</p>
          <button
            onClick={fetchMenu}
            className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-medium py-3 px-6 rounded-xl transition-all duration-200 w-full text-sm shadow-lg hover:shadow-xl"
          >
            {t('errors.tryAgain')}
          </button>
        </div>
      </div>
    );
  }

  if (!menuData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-20 h-20 bg-gradient-to-br from-orange-100 to-orange-200 rounded-2xl flex items-center justify-center mx-auto">
            <UtensilsCrossed className="w-10 h-10 text-orange-500" />
          </div>
          <p className="text-gray-600 font-medium">{t('errors.noMenuData')}</p>
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
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Mobile Bottom Navigation */}
      {isMobile && (
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50 shadow-lg">
          <div className="flex items-center justify-around p-2">
            <button
              onClick={() => setShowFiltersSheet(true)}
              className="flex flex-col items-center p-2 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <Filter className="w-5 h-5 text-gray-600" />
              <span className="text-xs text-gray-600 mt-1">Filters</span>
            </button>
            
            <button
              onClick={() => setViewMode(viewMode === 'grid' ? 'detailed' : 'grid')}
              className="flex flex-col items-center p-2 rounded-lg hover:bg-gray-50 transition-colors"
            >
              {viewMode === 'grid' ? (
                <List className="w-5 h-5 text-gray-600" />
              ) : (
                <Grid className="w-5 h-5 text-gray-600" />
              )}
              <span className="text-xs text-gray-600 mt-1">View</span>
            </button>
            
            <button
              onClick={() => setShowCartSheet(true)}
              className="relative flex flex-col items-center p-2 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <ShoppingCart className="w-5 h-5 text-gray-600" />
              {cart.length > 0 && (
                <span className="absolute -top-1 -right-1 bg-orange-500 text-white text-[10px] font-bold rounded-full w-5 h-5 flex items-center justify-center">
                  {getCartItemCount()}
                </span>
              )}
              <span className="text-xs text-gray-600 mt-1">Cart</span>
            </button>
            
            <button
              onClick={() => setShowOrderTracking(true)}
              className="relative flex flex-col items-center p-2 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <Package className="w-5 h-5 text-gray-600" />
              {orders.filter(o => o.status !== 'completed' && o.status !== 'cancelled').length > 0 && (
                <span className="absolute -top-1 -right-1 bg-blue-500 text-white text-[10px] font-bold rounded-full w-5 h-5 flex items-center justify-center">
                  {orders.filter(o => o.status !== 'completed' && o.status !== 'cancelled').length}
                </span>
              )}
              <span className="text-xs text-gray-600 mt-1">Orders</span>
            </button>
          </div>
        </div>
      )}

      {/* Main Layout */}
      <div className="flex h-screen overflow-hidden">
        {/* Category Sidebar (Left) - Desktop */}
        {!isMobile && (
          <div className={`bg-white border-r border-gray-200 transition-all duration-300 ${
            isCategorySidebarOpen ? 'w-64' : 'w-0'
          } overflow-hidden flex flex-col shadow-lg`}>
            <div className={`p-4 ${!isCategorySidebarOpen && 'hidden'}`}>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-sm font-bold text-gray-800 uppercase tracking-wider flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-orange-500" />
                  {t('categories.title')}
                </h2>
                <button
                  onClick={() => setIsCategorySidebarOpen(false)}
                  className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <ChevronLeft className="w-4 h-4 text-gray-600" />
                </button>
              </div>
              
              <div className="space-y-2">
                <button
                  onClick={() => setActiveCategory('all')}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group ${
                    activeCategory === 'all'
                      ? 'bg-gradient-to-r from-orange-500 to-orange-600 text-white shadow-lg'
                      : 'text-gray-700 hover:bg-gray-50 hover:shadow-sm'
                  }`}
                >
                  <div className={`p-2 rounded-lg ${
                    activeCategory === 'all'
                      ? 'bg-white/20'
                      : 'bg-gray-100 group-hover:bg-gray-200'
                  }`}>
                    <UtensilsCrossed className="w-4 h-4" />
                  </div>
                  <span className="flex-1 text-left font-medium">{t('categories.all')}</span>
                  <span className={`text-xs px-2 py-1 rounded-full ${
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
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group ${
                      activeCategory === category.id
                        ? 'bg-gradient-to-r from-orange-500 to-orange-600 text-white shadow-lg'
                        : 'text-gray-700 hover:bg-gray-50 hover:shadow-sm'
                    }`}
                  >
                    <div className={`p-2 rounded-lg ${
                      activeCategory === category.id
                        ? 'bg-white/20'
                        : 'bg-gray-100 group-hover:bg-gray-200'
                    }`}>
                      {getCategoryIcon(category)}
                    </div>
                    <span className="flex-1 text-left font-medium truncate">
                      {getCategoryName(category, currentLocale)}
                    </span>
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      activeCategory === category.id 
                        ? 'bg-white/20' 
                        : 'bg-gray-200 text-gray-600'
                    }`}>
                      {category.meals?.length || 0}
                    </span>
                  </button>
                ))}
              </div>

              {/* Desktop Filters & Sort */}
              <div className="mt-8">
                <div className="mb-4">
                  <div className="flex items-center gap-2 mb-3">
                    <Filter className="w-4 h-4 text-gray-500" />
                    <h3 className="text-xs font-bold text-gray-600 uppercase tracking-wider">{t('filters.title')}</h3>
                  </div>
                  <div className="space-y-2">
                    {[
                      { id: 'all', label: t('filters.allItems'), icon: <UtensilsCrossed className="w-3 h-3" /> },
                      { id: 'available', label: t('filters.available'), icon: <Check className="w-3 h-3" /> },
                      { id: 'popular', label: t('filters.popular'), icon: <TrendingUp className="w-3 h-3" /> },
                      { id: 'vegetarian', label: t('filters.vegetarian'), icon: <Leaf className="w-3 h-3" /> }
                    ].map((filter) => (
                      <button
                        key={filter.id}
                        onClick={() => setSelectedFilter(filter.id)}
                        className={`w-full flex items-center gap-3 px-3 py-2.5 text-sm rounded-lg transition-all duration-200 ${
                          selectedFilter === filter.id
                            ? 'bg-gradient-to-r from-blue-50 to-blue-100 text-blue-600 border border-blue-200 shadow-sm'
                            : 'text-gray-600 hover:bg-gray-50 hover:shadow-sm'
                        }`}
                      >
                        {filter.icon}
                        <span className="flex-1 text-left">{filter.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <ArrowUpDown className="w-4 h-4 text-gray-500" />
                    <h3 className="text-xs font-bold text-gray-600 uppercase tracking-wider">{t('sort.title')}</h3>
                  </div>
                  <div className="space-y-2">
                    {[
                      { id: 'default', label: t('sort.default'), icon: <Zap className="w-3 h-3" /> },
                      { id: 'price-low', label: t('sort.priceLow'), icon: <ArrowDown className="w-3 h-3" /> },
                      { id: 'price-high', label: t('sort.priceHigh'), icon: <ArrowUp className="w-3 h-3" /> },
                      { id: 'popular', label: t('sort.mostPopular'), icon: <TrendingUp className="w-3 h-3" /> },
                      { id: 'name', label: t('sort.nameAZ'), icon: <List className="w-3 h-3" /> }
                    ].map((option) => (
                      <button
                        key={option.id}
                        onClick={() => setSortBy(option.id)}
                        className={`w-full flex items-center gap-3 px-3 py-2.5 text-sm rounded-lg transition-all duration-200 ${
                          sortBy === option.id
                            ? 'bg-gradient-to-r from-gray-100 to-gray-200 text-gray-800 border border-gray-300 shadow-sm'
                            : 'text-gray-600 hover:bg-gray-50 hover:shadow-sm'
                        }`}
                      >
                        {option.icon}
                        <span className="flex-1 text-left">{option.label}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Toggle Category Sidebar Button - Desktop */}
        {!isMobile && !isCategorySidebarOpen && (
          <button
            onClick={() => setIsCategorySidebarOpen(true)}
            className="fixed left-0 top-1/2 -translate-y-1/2 z-30 bg-gradient-to-r from-orange-500 to-orange-600 text-white p-2 rounded-r-xl hover:from-orange-600 hover:to-orange-700 transition-all duration-200 shadow-lg hover:shadow-xl"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        )}

        {/* Main Content Area */}
        <div className="flex-1 overflow-y-auto">
          {/* Responsive Header */}
          <div className="bg-white/80 backdrop-blur-sm border-b border-gray-200/50 sticky top-0 z-40 shadow-sm">
            <div className="p-4">
              <div className="flex items-center justify-between">
                {/* Left Section */}
                <div className="flex items-center gap-3">
                  {!isMobile && !isCategorySidebarOpen && (
                    <button
                      onClick={() => setIsCategorySidebarOpen(true)}
                      className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                      <Menu className="w-5 h-5 text-gray-600" />
                    </button>
                  )}
                  
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <Crown className="w-4 h-4 text-orange-500 absolute -top-2 -left-1 z-10" />
                      {menuData.restaurant?.logo ? (
                        <img
                          src={getImageUrl(menuData.restaurant.logo)}
                          alt={menuData.restaurant?.name || 'Logo'}
                          className="w-12 h-12 md:w-16 md:h-16 object-cover rounded-xl shadow-sm"
                          onError={(e) => {
                            e.target.style.display = 'none';
                            const fallback = e.target.parentElement.querySelector('.logo-fallback');
                            if (fallback) fallback.style.display = 'flex';
                          }}
                        />
                      ) : null}
                      <div className={`logo-fallback ${menuData.restaurant?.logo ? 'hidden' : 'flex'} items-center justify-center w-12 h-12 md:w-16 md:h-16 bg-gradient-to-br from-orange-100 to-orange-200 rounded-xl shadow-sm`}>
                        <UtensilsCrossed className="w-6 h-6 md:w-8 md:w-8 text-orange-500" />
                      </div>
                    </div>
                    <div>
                      <h1 className="text-lg md:text-xl font-bold text-gray-900">
                        {menuData.restaurant?.name}
                      </h1>
                      <p className="text-gray-500 text-xs">{currentDate}</p>
                    </div>
                  </div>
                </div>

                {/* Right Section */}
                <div className="flex items-center gap-2 md:gap-3">
                  {/* View Mode Toggle - Desktop */}
                  {!isMobile && (
                    <div className="hidden md:flex items-center gap-1 bg-gray-100 rounded-lg p-1">
                      <button
                        onClick={() => setViewMode('grid')}
                        className={`p-2 rounded-lg transition-colors ${viewMode === 'grid' ? 'bg-white shadow' : 'hover:bg-gray-200'}`}
                      >
                        <Grid className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => setViewMode('detailed')}
                        className={`p-2 rounded-lg transition-colors ${viewMode === 'detailed' ? 'bg-white shadow' : 'hover:bg-gray-200'}`}
                      >
                        <List className="w-4 h-4" />
                      </button>
                    </div>
                  )}

                  {/* Status Indicator */}
                  <div className="hidden md:flex items-center gap-2 bg-gradient-to-r from-green-50 to-emerald-50 px-3 py-1.5 rounded-full border border-green-200">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                    <span className="text-xs font-medium text-green-800">{t('header.kitchenActive')}</span>
                  </div>

                  {/* Table Info */}
                  <div className="text-right hidden md:block">
                    <div className="text-gray-900 font-medium text-sm">{t('header.order')}</div>
                    <div className="text-gray-500 text-xs">
                      {t('header.table')} <span className="font-bold">{menuData.table_id}</span>
                    </div>
                  </div>

                  {/* Language Switcher */}
                  <div className="relative language-menu-container">
                    <button
                      onClick={() => setShowLanguageMenu(!showLanguageMenu)}
                      className="p-2 bg-gradient-to-r from-gray-100 to-gray-200 hover:from-gray-200 hover:to-gray-300 text-gray-700 rounded-xl transition-all duration-200 shadow-sm"
                      title="Change Language"
                    >
                      <Globe className="w-5 h-5" />
                    </button>
                    {showLanguageMenu && (
                      <div className="absolute right-0 mt-2 bg-white rounded-xl shadow-xl border border-gray-200/50 py-2 z-50 min-w-[140px] backdrop-blur-sm">
                        <button
                          onClick={() => changeLanguage('en')}
                          className={`w-full text-left px-4 py-2.5 text-sm hover:bg-gray-50 flex items-center gap-2 transition-colors ${
                            currentLocale === 'en' ? 'text-orange-600 bg-orange-50' : 'text-gray-700'
                          }`}
                        >
                          {currentLocale === 'en' && <Check className="w-4 h-4" />}
                          {t('language.english')}
                        </button>
                        <button
                          onClick={() => changeLanguage('fr')}
                          className={`w-full text-left px-4 py-2.5 text-sm hover:bg-gray-50 flex items-center gap-2 transition-colors ${
                            currentLocale === 'fr' ? 'text-orange-600 bg-orange-50' : 'text-gray-700'
                          }`}
                        >
                          {currentLocale === 'fr' && <Check className="w-4 h-4" />}
                          {t('language.french')}
                        </button>
                        <button
                          onClick={() => changeLanguage('ar')}
                          className={`w-full text-left px-4 py-2.5 text-sm hover:bg-gray-50 flex items-center gap-2 transition-colors ${
                            currentLocale === 'ar' ? 'text-orange-600 bg-orange-50' : 'text-gray-700'
                          }`}
                        >
                          {currentLocale === 'ar' && <Check className="w-4 h-4" />}
                          {t('language.arabic')}
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Order Tracking */}
                  <button
                    onClick={() => setShowOrderTracking(!showOrderTracking)}
                    className="relative p-2 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white rounded-xl transition-all duration-200 shadow-sm"
                    title={t('orderTracking.title')}
                  >
                    <Package className="w-5 h-5" />
                    {orders.filter(o => o.status !== 'completed' && o.status !== 'cancelled').length > 0 && (
                      <span className="absolute -top-1 -right-1 bg-white text-blue-600 text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center shadow-sm">
                        {orders.filter(o => o.status !== 'completed' && o.status !== 'cancelled').length}
                      </span>
                    )}
                  </button>

                  {/* Cart Button - Desktop */}
                  {!isMobile && (
                    <button
                      onClick={() => setIsOrderBarOpen(!isOrderBarOpen)}
                      className="relative p-2 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white rounded-xl transition-all duration-200 shadow-sm"
                    >
                      <ShoppingCart className="w-5 h-5" />
                      {cart.length > 0 && (
                        <span className="absolute -top-1 -right-1 bg-white text-orange-600 text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center shadow-sm">
                          {getCartItemCount()}
                        </span>
                      )}
                    </button>
                  )}
                </div>
              </div>

              {/* Cover Image Banner - Responsive */}
              {menuData.restaurant?.cover_image && (
                <div className="mt-4 md:mt-6">
                  <div className={`relative overflow-hidden rounded-2xl shadow-lg ${
                    isMobile ? 'h-40' : isTablet ? 'h-56' : 'h-64'
                  }`}>
                    <img
                      src={getImageUrl(menuData.restaurant.cover_image)}
                      alt={menuData.restaurant?.name || 'Restaurant banner'}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        console.error('Failed to load cover image');
                        e.target.style.display = 'none';
                      }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent"></div>
                  </div>
                </div>
              )}

              {/* Search Bar - Responsive */}
              <div className={`mt-4 ${menuData.restaurant?.cover_image ? '' : ''}`}>
                <div className="relative">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder={t('search.placeholder')}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-12 pr-10 py-3 bg-white border border-gray-300 rounded-xl text-sm md:text-base text-gray-900 placeholder-gray-500 focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 transition-all duration-200 shadow-sm"
                  />
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery('')}
                      className="absolute right-3 top-1/2 -translate-y-1/2 p-1 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                      <X className="w-3.5 h-3.5 text-gray-500" />
                    </button>
                  )}
                </div>
              </div>

              {/* Category Filter - Responsive Horizontal Scroll */}
              <div className="mt-4">
                <h2 className="text-sm font-semibold text-gray-700 mb-3">{t('categories.findBestFood')}</h2>
                <div className="flex gap-2 md:gap-3 overflow-x-auto pb-2 scrollbar-hide">
                  {/* All Button */}
                  <button
                    onClick={() => setActiveCategory('all')}
                    className={`flex-shrink-0 flex items-center gap-2 px-4 py-2.5 md:px-5 md:py-3 rounded-full font-medium text-sm transition-all duration-200 whitespace-nowrap shadow-sm ${
                      activeCategory === 'all'
                        ? 'bg-gradient-to-r from-orange-500 to-orange-600 text-white shadow-lg'
                        : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-200'
                    }`}
                  >
                    <div className={`w-6 h-6 md:w-7 md:h-7 rounded-full overflow-hidden flex items-center justify-center flex-shrink-0 ${
                      activeCategory === 'all' ? 'bg-white/20' : 'bg-gray-100'
                    }`}>
                      <UtensilsCrossed className={`w-3 h-3 md:w-4 md:h-4 ${
                        activeCategory === 'all' ? 'text-white' : 'text-gray-600'
                      }`} />
                    </div>
                    <span>{t('categories.all')}</span>
                  </button>
                  
                  {/* Category Buttons */}
                  {menuData.categories?.map((category) => {
                    const iconElement = getCategoryIcon(category);
                    const coloredIcon = React.cloneElement(iconElement, {
                      className: `w-3 h-3 md:w-4 md:h-4 ${activeCategory === category.id ? 'text-white' : 'text-gray-600'}`
                    });
                    
                    const showImage = category.image && !failedCategoryImages.has(category.id);
                    const handleImageError = () => {
                      setFailedCategoryImages(prev => new Set([...prev, category.id]));
                    };
                    
                    return (
                      <button
                        key={category.id}
                        onClick={() => setActiveCategory(category.id)}
                        className={`flex-shrink-0 flex items-center gap-2 px-4 py-2.5 md:px-5 md:py-3 rounded-full font-medium text-sm transition-all duration-200 whitespace-nowrap shadow-sm ${
                          activeCategory === category.id
                            ? 'bg-gradient-to-r from-orange-500 to-orange-600 text-white shadow-lg'
                            : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-200'
                        }`}
                      >
                        <div className={`w-6 h-6 md:w-7 md:h-7 rounded-full overflow-hidden flex items-center justify-center flex-shrink-0 ${
                          activeCategory === category.id ? 'bg-white/20' : 'bg-gray-100'
                        }`}>
                          {showImage ? (
                            <img
                              src={getImageUrl(category.image)}
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

              {/* Active Category Info & Stats */}
              <div className="mt-3 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {activeCategory === 'all' ? (
                    <div className="px-3 py-1.5 bg-gradient-to-r from-teal-100 to-teal-50 text-teal-700 rounded-full text-xs font-medium border border-teal-200">
                      {t('categories.allCategories')}
                    </div>
                  ) : (() => {
                    const activeCat = menuData.categories?.find(cat => cat.id === activeCategory);
                    return activeCat ? (
                      <div className="px-3 py-1.5 bg-gradient-to-r from-orange-100 to-orange-50 text-orange-700 rounded-full text-xs font-medium border border-orange-200">
                        {getCategoryName(activeCat, currentLocale)}
                      </div>
                    ) : null;
                  })()}
                  <span className="text-gray-500 text-xs hidden md:inline">
                    {sortedMeals.length} {t('categories.items')} • {formatPrice(getCartTotal())} {t('categories.inCart')}
                  </span>
                </div>
                
                {/* Quick Stats */}
                <div className="flex items-center gap-3">
                  <div className="hidden md:flex items-center gap-2 text-xs text-gray-500">
                    <Sparkles className="w-3 h-3 text-yellow-500" />
                    <span>{sortedMeals.filter(m => m.rating > 4.5).length} Top Rated</span>
                  </div>
                  <div className="hidden md:flex items-center gap-2 text-xs text-gray-500">
                    <Leaf className="w-3 h-3 text-green-500" />
                    <span>{sortedMeals.filter(m => m.is_vegetarian).length} Vegetarian</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Menu Items Grid - Responsive */}
          <div className="p-3 md:p-4">
            {sortedMeals.length === 0 ? (
              <div className="text-center py-12 md:py-16">
                <div className="w-20 h-20 bg-gradient-to-br from-gray-100 to-gray-200 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Search className="w-8 h-8 text-gray-400" />
                </div>
                <p className="text-gray-500 text-sm md:text-base">{t('meals.noItemsFound')}</p>
                <p className="text-gray-400 text-xs md:text-sm mt-1">{t('meals.tryAdjusting')}</p>
              </div>
            ) : (
              <div className={`grid ${getGridClasses()} gap-3 md:gap-4`}>
                {sortedMeals.map((meal) => (
                  <div
                    key={meal.id}
                    className={`bg-white rounded-xl overflow-hidden border border-gray-200/50 hover:border-orange-300 hover:shadow-lg transition-all duration-300 group ${
                      !meal.available ? 'opacity-60' : ''
                    }`}
                  >
                    {/* Image Container */}
                    <div className="relative h-36 md:h-48 overflow-hidden">
                      <img
                        src={getImageUrl(meal.image)}
                        alt={getMealName(meal, currentLocale)}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        onError={(e) => {
                          e.target.src = 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=400';
                        }}
                      />
                      
                      {/* Gradient Overlay */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent"></div>
                      
                      {/* Badges */}
                      <div className="absolute top-2 left-2 flex flex-col gap-1">
                        {!meal.available && (
                          <span className="bg-gradient-to-r from-red-500 to-red-600 text-white px-2 py-1 rounded-lg text-[10px] font-bold shadow-sm">
                            {t('meals.soldOut')}
                          </span>
                        )}
                        {meal.prep_time && (
                          <span className="bg-black/80 backdrop-blur-sm text-white px-2 py-1 rounded-lg text-[10px] flex items-center gap-1 shadow-sm">
                            <Clock className="w-2.5 h-2.5" />
                            {meal.prep_time}
                          </span>
                        )}
                        {meal.rating > 4.5 && (
                          <span className="bg-gradient-to-r from-amber-500 to-yellow-500 text-white px-2 py-1 rounded-lg text-[10px] flex items-center gap-1 shadow-sm">
                            <Star className="w-2.5 h-2.5 fill-white" />
                            {meal.rating.toFixed(1)}
                          </span>
                        )}
                      </div>
                    </div>
                    
                    {/* Content */}
                    <div className="p-3 md:p-4">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1 min-w-0">
                          <h3 className="text-sm md:text-base font-bold text-gray-900 truncate">
                            {getMealName(meal, currentLocale)}
                          </h3>
                          {getMealDescription(meal, currentLocale) && (
                            <p className="text-gray-500 text-xs md:text-sm mt-1 line-clamp-2">
                              {getMealDescription(meal, currentLocale)}
                            </p>
                          )}
                        </div>
                        <span className="text-base md:text-lg font-bold text-orange-500 ml-2 whitespace-nowrap">
                          {formatPrice(meal.price)}
                        </span>
                      </div>

                      {/* Tags */}
                      <div className="flex flex-wrap gap-1.5 mb-3">
                        {meal.is_spicy && (
                          <span className="px-2 py-1 bg-gradient-to-r from-red-50 to-pink-50 text-red-700 text-xs rounded-lg flex items-center gap-1 border border-red-100">
                            <Flame className="w-3 h-3" />
                            {t('meals.spicy')}
                          </span>
                        )}
                        {meal.is_vegetarian && (
                          <span className="px-2 py-1 bg-gradient-to-r from-green-50 to-emerald-50 text-green-700 text-xs rounded-lg flex items-center gap-1 border border-green-100">
                            <Leaf className="w-3 h-3" />
                            {t('meals.veg')}
                          </span>
                        )}
                      </div>

                      {/* Add Button */}
                      <button
                        id={`meal-${meal.id}`}
                        onClick={() => addToCart(meal)}
                        disabled={!meal.available}
                        className={`w-full py-2.5 md:py-3 rounded-lg font-medium text-sm transition-all duration-200 flex items-center justify-center gap-2 shadow-sm ${
                          meal.available
                            ? 'bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white hover:shadow-lg'
                            : 'bg-gray-200 text-gray-500 cursor-not-allowed'
                        }`}
                      >
                        {cart.find(item => item.id === meal.id) ? (
                          <>
                            <Check className="w-4 h-4" />
                            <span className="text-xs md:text-sm">
                              {t('meals.added')} ({cart.find(item => item.id === meal.id)?.quantity})
                            </span>
                          </>
                        ) : (
                          <>
                            <Plus className="w-4 h-4" />
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

        {/* Order Sidebar (Right) - Desktop */}
        {!isMobile && (
          <div className={`bg-white border-l border-gray-200 flex flex-col h-screen sticky top-0 transition-all duration-300 ${
            isOrderBarOpen ? 'w-80' : 'w-0'
          } overflow-hidden shadow-lg`}>
            <div className={`h-full flex flex-col ${!isOrderBarOpen && 'hidden'}`}>
              {/* Header */}
              <div className="bg-gradient-to-r from-gray-50 to-white border-b border-gray-200 p-4">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <h2 className="text-base font-bold text-gray-900">{t('cart.title')}</h2>
                    <p className="text-gray-500 text-xs">{t('header.table')} {menuData.table_id}</p>
                  </div>
                  <div className="flex items-center gap-1">
                    <button className="bg-gradient-to-r from-gray-100 to-gray-200 hover:from-gray-200 hover:to-gray-300 text-gray-700 px-3 py-1.5 rounded-lg text-xs flex items-center gap-1.5 transition-all duration-200 shadow-sm">
                      <Plus className="w-3 h-3" />
                      {t('cart.addOn')}
                    </button>
                    <button
                      onClick={() => setIsOrderBarOpen(false)}
                      className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                      <X className="w-4 h-4 text-gray-500" />
                    </button>
                  </div>
                </div>

                {/* Status */}
                <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-xl px-3 py-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                      <span className="text-xs font-medium text-green-800">{t('cart.kitchenReady')}</span>
                    </div>
                    <span className="text-[10px] text-green-600">{t('cart.estTime')}</span>
                  </div>
                </div>
              </div>

              {/* Order Items */}
              <div className="flex-1 overflow-y-auto p-4">
                {cart.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="w-16 h-16 bg-gradient-to-br from-gray-100 to-gray-200 rounded-2xl flex items-center justify-center mx-auto mb-4">
                      <ShoppingCart className="w-8 h-8 text-gray-400" />
                    </div>
                    <p className="text-gray-500 text-sm">{t('cart.empty')}</p>
                    <p className="text-gray-400 text-xs mt-1">{t('cart.addItems')}</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {cart.map((item) => (
                      <div key={item.id} className="bg-white rounded-xl border border-gray-200/50 p-3 shadow-sm hover:shadow-md transition-shadow">
                        <div className="flex gap-3">
                          <div className="w-16 h-16 rounded-xl overflow-hidden flex-shrink-0">
                            <img
                              src={getImageUrl(item.image)}
                              alt={getMealName(item, currentLocale)}
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex justify-between items-start mb-1">
                              <h3 className="text-sm font-medium text-gray-900 truncate">
                                {getMealName(item, currentLocale)}
                              </h3>
                              <button
                                onClick={() => removeFromCart(item.id)}
                                className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
                              >
                                <X className="w-3.5 h-3.5 text-gray-500" />
                              </button>
                            </div>
                            
                            <div className="flex items-center justify-between mb-2">
                              <div className="flex items-center gap-2 bg-gray-100 rounded-lg px-2.5 py-1">
                                <button
                                  onClick={() => updateQuantity(item.id, -1)}
                                  className="w-6 h-6 rounded-lg flex items-center justify-center hover:bg-gray-200 transition-colors"
                                >
                                  <Minus className="w-3 h-3 text-gray-700" />
                                </button>
                                <span className="font-medium text-gray-900 text-sm w-6 text-center">
                                  {item.quantity}
                                </span>
                                <button
                                  onClick={() => updateQuantity(item.id, 1)}
                                  className="w-6 h-6 rounded-lg flex items-center justify-center hover:bg-gray-200 transition-colors"
                                >
                                  <Plus className="w-3 h-3 text-gray-700" />
                                </button>
                              </div>
                              <span className="font-bold text-gray-900 text-base">
                                {formatPrice(parseFloat(item.price) * item.quantity)}
                              </span>
                            </div>
                            
                            {/* Notes Input */}
                            <input
                              type="text"
                              placeholder={t('cart.addNote')}
                              value={item.notes || ''}
                              onChange={(e) => updateNotes(item.id, e.target.value)}
                              className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500"
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
                <div className="border-t border-gray-200 p-4 bg-white shadow-lg">
                  {orderError && (
                    <div className="mb-3 p-3 bg-gradient-to-r from-red-50 to-pink-50 border border-red-200 rounded-xl">
                      <p className="text-red-700 text-xs">{orderError}</p>
                    </div>
                  )}
                  
                  <div className="space-y-2.5 mb-4">
                    <div className="flex justify-between items-center text-gray-700 text-sm">
                      <span className="flex items-center gap-2">
                        <Receipt className="w-4 h-4" />
                        {t('cart.subTotal')}
                      </span>
                      <span className="font-medium">{formatPrice(getCartTotal())}</span>
                    </div>
                    <div className="flex justify-between items-center text-gray-700 text-sm">
                      <span className="flex items-center gap-2">
                        <Tag className="w-4 h-4" />
                        {t('cart.tax')}
                      </span>
                      <span className="font-medium">{formatPrice(getTax())}</span>
                    </div>
                    <div className="flex justify-between items-center text-gray-700 text-sm">
                      <span className="flex items-center gap-2">
                        <Wallet className="w-4 h-4" />
                        {t('cart.serviceFee')}
                      </span>
                      <span className="font-medium">{formatPrice(getServiceFee())}</span>
                    </div>
                    <div className="border-t border-gray-300 pt-3">
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
                    className={`w-full py-3 rounded-xl font-bold text-sm transition-all duration-200 flex items-center justify-center gap-2 shadow-lg ${
                      isSubmitting || cart.length === 0
                        ? 'bg-gradient-to-r from-gray-300 to-gray-400 text-gray-500 cursor-not-allowed'
                        : 'bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white hover:shadow-xl'
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
                  
                  <p className="text-center text-gray-500 text-xs mt-3">
                    {t('cart.orderSent')}
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Toggle Order Bar Button - Desktop */}
        {!isMobile && !isOrderBarOpen && (
          <button
            onClick={() => setIsOrderBarOpen(true)}
            className="fixed right-0 top-1/2 -translate-y-1/2 z-30 bg-gradient-to-r from-orange-500 to-orange-600 text-white p-2 rounded-l-xl hover:from-orange-600 hover:to-orange-700 transition-all duration-200 shadow-lg hover:shadow-xl"
          >
            <div className="relative">
              <ShoppingCart className="w-4 h-4" />
              {cart.length > 0 && (
                <span className="absolute -top-1 -right-1 bg-white text-orange-600 text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center shadow-sm">
                  {getCartItemCount()}
                </span>
              )}
            </div>
          </button>
        )}
      </div>

      {/* Mobile Filters Sheet */}
      {showFiltersSheet && isMobile && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50">
          <div className="absolute bottom-0 left-0 right-0 bg-white rounded-t-3xl shadow-2xl max-h-[85vh] overflow-hidden">
            <div className="p-4">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold text-gray-900">Filters & Sort</h2>
                <button
                  onClick={() => setShowFiltersSheet(false)}
                  className="p-2 hover:bg-gray-100 rounded-full"
                >
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>
              
              {/* Filters Section */}
              <div className="mb-6">
                <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                  <Filter className="w-4 h-4" />
                  Filters
                </h3>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { id: 'all', label: t('filters.allItems'), icon: <UtensilsCrossed className="w-4 h-4" /> },
                    { id: 'available', label: t('filters.available'), icon: <Check className="w-4 h-4" /> },
                    { id: 'popular', label: t('filters.popular'), icon: <TrendingUp className="w-4 h-4" /> },
                    { id: 'vegetarian', label: t('filters.vegetarian'), icon: <Leaf className="w-4 h-4" /> }
                  ].map((filter) => (
                    <button
                      key={filter.id}
                      onClick={() => {
                        setSelectedFilter(filter.id);
                        setShowFiltersSheet(false);
                      }}
                      className={`flex flex-col items-center justify-center p-3 rounded-xl border transition-all ${
                        selectedFilter === filter.id
                          ? 'bg-gradient-to-r from-blue-50 to-blue-100 border-blue-200 text-blue-600'
                          : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'
                      }`}
                    >
                      {filter.icon}
                      <span className="text-xs mt-1">{filter.label}</span>
                    </button>
                  ))}
                </div>
              </div>
              
              {/* Sort Section */}
              <div>
                <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                  <ArrowUpDown className="w-4 h-4" />
                  Sort By
                </h3>
                <div className="space-y-2">
                  {[
                    { id: 'default', label: t('sort.default'), icon: <Zap className="w-4 h-4" /> },
                    { id: 'price-low', label: t('sort.priceLow'), icon: <ArrowDown className="w-4 h-4" /> },
                    { id: 'price-high', label: t('sort.priceHigh'), icon: <ArrowUp className="w-4 h-4" /> },
                    { id: 'popular', label: t('sort.mostPopular'), icon: <TrendingUp className="w-4 h-4" /> },
                    { id: 'name', label: t('sort.nameAZ'), icon: <List className="w-4 h-4" /> }
                  ].map((option) => (
                    <button
                      key={option.id}
                      onClick={() => {
                        setSortBy(option.id);
                        setShowFiltersSheet(false);
                      }}
                      className={`w-full flex items-center gap-3 p-3 rounded-xl border transition-all ${
                        sortBy === option.id
                          ? 'bg-gradient-to-r from-gray-100 to-gray-200 border-gray-300 text-gray-800'
                          : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'
                      }`}
                    >
                      {option.icon}
                      <span className="flex-1 text-left">{option.label}</span>
                      {sortBy === option.id && <Check className="w-4 h-4 text-green-500" />}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Mobile Cart Sheet */}
      {showCartSheet && isMobile && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50">
          <div className="absolute bottom-0 left-0 right-0 bg-white rounded-t-3xl shadow-2xl max-h-[85vh] overflow-hidden flex flex-col">
            <div className="p-4 border-b border-gray-200">
              <div className="flex items-center justify-between mb-2">
                <h2 className="text-lg font-bold text-gray-900">{t('cart.title')}</h2>
                <button
                  onClick={() => setShowCartSheet(false)}
                  className="p-2 hover:bg-gray-100 rounded-full"
                >
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span>{t('header.kitchenActive')}</span>
              </div>
            </div>
            
            <div className="flex-1 overflow-y-auto p-4">
              {cart.length === 0 ? (
                <div className="text-center py-12">
                  <ShoppingCart className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500 text-sm">{t('cart.empty')}</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {cart.map((item) => (
                    <div key={item.id} className="bg-gray-50 rounded-xl p-3">
                      <div className="flex gap-3">
                        <div className="w-16 h-16 rounded-lg overflow-hidden">
                          <img
                            src={getImageUrl(item.image)}
                            alt={getMealName(item, currentLocale)}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="flex-1">
                          <div className="flex justify-between items-start mb-1">
                            <h3 className="text-sm font-medium text-gray-900">
                              {getMealName(item, currentLocale)}
                            </h3>
                            <span className="font-bold text-orange-500">
                              {formatPrice(parseFloat(item.price) * item.quantity)}
                            </span>
                          </div>
                          
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2 bg-white rounded-lg px-2 py-1">
                              <button
                                onClick={() => updateQuantity(item.id, -1)}
                                className="w-6 h-6 rounded-lg flex items-center justify-center hover:bg-gray-100"
                              >
                                <Minus className="w-3 h-3" />
                              </button>
                              <span className="font-medium w-6 text-center">{item.quantity}</span>
                              <button
                                onClick={() => updateQuantity(item.id, 1)}
                                className="w-6 h-6 rounded-lg flex items-center justify-center hover:bg-gray-100"
                              >
                                <Plus className="w-3 h-3" />
                              </button>
                            </div>
                            <button
                              onClick={() => removeFromCart(item.id)}
                              className="p-1 hover:bg-gray-200 rounded-lg"
                            >
                              <X className="w-4 h-4 text-gray-500" />
                            </button>
                          </div>
                          
                          <input
                            type="text"
                            placeholder={t('cart.addNote')}
                            value={item.notes || ''}
                            onChange={(e) => updateNotes(item.id, e.target.value)}
                            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg"
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
            
            {cart.length > 0 && (
              <div className="border-t border-gray-200 p-4 bg-white">
                <div className="space-y-2 mb-4">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">{t('cart.subTotal')}</span>
                    <span className="font-medium">{formatPrice(getCartTotal())}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">{t('cart.tax')}</span>
                    <span className="font-medium">{formatPrice(getTax())}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">{t('cart.serviceFee')}</span>
                    <span className="font-medium">{formatPrice(getServiceFee())}</span>
                  </div>
                  <div className="border-t pt-2">
                    <div className="flex justify-between font-bold">
                      <span>{t('cart.total')}</span>
                      <span className="text-orange-500">{formatPrice(getFinalTotal())}</span>
                    </div>
                  </div>
                </div>
                
                <button
                  onClick={handleAddOrder}
                  disabled={isSubmitting}
                  className={`w-full py-3 rounded-lg font-bold text-white transition-all ${
                    isSubmitting
                      ? 'bg-gray-400'
                      : 'bg-gradient-to-r from-orange-500 to-orange-600'
                  }`}
                >
                  {isSubmitting ? t('cart.processing') : `${t('cart.placeOrder')} • ${formatPrice(getFinalTotal())}`}
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Order Tracking Modal - Responsive */}
      {showOrderTracking && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className={`bg-white rounded-2xl shadow-2xl w-full max-h-[90vh] overflow-hidden ${
            isMobile ? 'h-[90vh]' : 'max-w-2xl'
          }`}>
            <div className="bg-gradient-to-r from-orange-500 to-orange-600 text-white p-4">
              <div className="flex items-center justify-between">
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
                    className="p-2 hover:bg-orange-600 rounded-lg transition-colors"
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
            </div>

            <div className="overflow-y-auto h-[calc(100%-80px)] p-4">
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
                      <div key={order.id} className="bg-white border border-gray-200 rounded-xl p-4">
                        <div className="flex items-start justify-between mb-4">
                          <div>
                            <div className="flex items-center gap-2 mb-2">
                              <h3 className="font-bold text-gray-900">Order #{order.id}</h3>
                              <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(order.status)}`}>
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
                            <p className="text-xs text-gray-500">{order.order_items?.length || 0} items</p>
                          </div>
                        </div>

                        {/* Progress Bar */}
                        <div className="mb-4">
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
                          {order.order_items?.slice(0, 2).map((item, idx) => (
                            <div key={item.id || idx} className="flex items-center justify-between text-sm bg-gray-50 rounded-lg px-3 py-2">
                              <span className="text-gray-700">
                                {item.meal ? getMealName(item.meal, currentLocale) : `Item #${item.meal_id}`} x{item.quantity}
                                {item.note && <span className="text-gray-500 text-xs ml-2">({item.note})</span>}
                              </span>
                              <span className="font-medium">${(item.quantity * (item.price || 0)).toFixed(2)}</span>
                            </div>
                          ))}
                          {order.order_items?.length > 2 && (
                            <p className="text-center text-gray-500 text-xs">
                              +{order.order_items.length - 2} more items
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
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl p-6 max-w-sm w-full text-center animate-scale-in">
            <div className="w-20 h-20 bg-gradient-to-br from-green-400 to-emerald-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <Check className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">{t('orderSuccess.title')}</h2>
            <p className="text-gray-600 text-sm mb-4">{t('orderSuccess.message')}</p>
            <div className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl px-4 py-3 mb-4">
              <p className="text-xs text-gray-500 mb-1">{t('orderSuccess.estTime')}</p>
              <p className="text-lg font-bold text-orange-500">15-20 minutes</p>
            </div>
            <button
              onClick={() => setOrderSuccess(false)}
              className="w-full bg-gradient-to-r from-orange-500 to-orange-600 text-white font-bold py-3 rounded-xl transition-all hover:shadow-lg"
            >
              {t('orderSuccess.continueShopping')}
            </button>
          </div>
        </div>
      )}

      {/* Mobile Floating Action Button */}
      {isMobile && cart.length > 0 && !showCartSheet && (
        <button
          onClick={() => setShowCartSheet(true)}
          className="fixed bottom-16 right-4 bg-gradient-to-r from-orange-500 to-orange-600 text-white p-4 rounded-full shadow-2xl z-40 animate-bounce-subtle"
        >
          <div className="relative">
            <ShoppingCart className="w-6 h-6" />
            <span className="absolute -top-1 -right-1 bg-white text-orange-600 text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
              {getCartItemCount()}
            </span>
          </div>
        </button>
      )}
    </div>
  );
}