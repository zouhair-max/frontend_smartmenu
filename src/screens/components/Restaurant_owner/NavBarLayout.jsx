// NavBarLayout.jsx - Professional Production-Ready Version with Loading State
import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  UtensilsCrossed, 
  ShoppingCart, 
  Users, 
  Package,
  LogOut,
  Menu,
  X,
  ChefHat,
  Settings,
  Bell,
  Search,
  HelpCircle,
  Moon,
  Sun,
  ChevronLeft,
  ChevronRight,
  Loader2
} from 'lucide-react';
import { useAuth } from '../../../contexts/AuthContext';
import { useLoading } from '../../../contexts/LoadingContext';

// ============================================================================
// CONSTANTS & CONFIGURATION
// ============================================================================

const BREAKPOINTS = {
  MOBILE: 640,
  TABLET: 768,
  DESKTOP: 1024,
  LARGE: 1280
};

const SIDEBAR_WIDTH = {
  EXPANDED: '320px',
  COLLAPSED: '80px'
};

const NAVIGATION_ITEMS = [
  { 
    id: 'dashboard',
    name: 'Dashboard', 
    path: '/screen/dashboard', 
    icon: LayoutDashboard,
    badge: null,
    description: 'Overview & Analytics'
},
{ 
id: 'categories',
name: 'categories', 
path: '/categories', 
icon: ShoppingCart,
description: 'categories '
},
  { 
    id: 'meals',
    name: 'Meals', 
    path: '/meals', 
    icon: UtensilsCrossed,
    badge: null,
    description: 'Menu Management'
  },
  { 
    id: 'orders',
    name: 'Orders', 
    path: '/orders', 
    icon: ShoppingCart,
    badge: { count: 5, color: 'bg-red-500' },
    description: 'Order Processing'
  },

  { 
    id: 'customers',
    name: 'Customers', 
    path: '/customers', 
    icon: Users,
    badge: null,
    description: 'Customer Database'
  },
  { 
    id: 'inventory',
    name: 'Inventory', 
    path: '/inventory', 
    icon: Package,
    badge: { count: 3, color: 'bg-yellow-500' },
    description: 'Stock Management'
  },
];

// ============================================================================
// CUSTOM HOOKS
// ============================================================================

/**
 * Custom hook for responsive behavior tracking
 */
const useResponsive = () => {
  const [deviceType, setDeviceType] = useState({
    isMobile: false,
    isTablet: false,
    isDesktop: false,
    width: typeof window !== 'undefined' ? window.innerWidth : 0
  });

  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      setDeviceType({
        isMobile: width < BREAKPOINTS.TABLET,
        isTablet: width >= BREAKPOINTS.TABLET && width < BREAKPOINTS.DESKTOP,
        isDesktop: width >= BREAKPOINTS.DESKTOP,
        width
      });
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return deviceType;
};

/**
 * Custom hook for handling click outside
 */
const useClickOutside = (ref, callback) => {
  useEffect(() => {
    const handleClick = (event) => {
      if (ref.current && !ref.current.contains(event.target)) {
        callback();
      }
    };

    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [ref, callback]);
};

// ============================================================================
// SUB-COMPONENTS
// ============================================================================

/**
 * Loading Spinner Component
 */
const LoadingSpinner = ({ size = 'default', className = '' }) => {
  const sizes = {
    small: 'w-4 h-4',
    default: 'w-6 h-6',
    large: 'w-8 h-8'
  };

  return (
    <Loader2 
      className={`${sizes[size]} animate-spin text-yellow-500 ${className}`}
    />
  );
};

/**
 * Navigation Item Component
 */
const NavItem = ({ item, isActive, onClick, collapsed, isLoading = false }) => {
  const Icon = item.icon;
  
  return (
    <button
      onClick={onClick}
      disabled={isLoading}
      className={`
        w-full flex items-center ${collapsed ? 'justify-center' : 'justify-between'} 
        px-4 py-3 rounded-xl transition-all duration-200 group relative overflow-hidden
        ${isActive 
          ? 'bg-gradient-to-r from-yellow-500 to-orange-500 text-white shadow-lg scale-[1.02]' 
          : 'text-gray-700 hover:bg-gray-100 hover:shadow-md'
        }
        ${isLoading ? 'opacity-70 cursor-wait' : ''}
      `}
      aria-current={isActive ? 'page' : undefined}
      title={collapsed ? item.name : ''}
    >
      <div className={`flex items-center ${collapsed ? '' : 'space-x-4'} z-10`}>
        {isLoading ? (
          <LoadingSpinner size="small" />
        ) : (
          <Icon 
            size={20} 
            className={`transition-transform duration-200 ${
              isActive 
                ? 'text-white' 
                : 'text-gray-500 group-hover:text-yellow-600 group-hover:scale-110'
            }`}
            strokeWidth={isActive ? 2.5 : 2}
          />
        )}
        
        {!collapsed && (
          <div className="text-left">
            <span className={`block font-semibold text-sm ${isActive ? 'text-white' : ''}`}>
              {item.name}
            </span>
            {item.description && (
              <span className={`block text-xs ${isActive ? 'text-white/80' : 'text-gray-500'}`}>
                {item.description}
              </span>
            )}
          </div>
        )}
      </div>
      
      {!collapsed && item.badge && !isLoading && (
        <span className={`
          ${item.badge.color} text-white text-xs font-bold 
          px-2 py-0.5 rounded-full min-w-[20px] text-center z-10
          animate-pulse
        `}>
          {item.badge.count}
        </span>
      )}
      
      {collapsed && item.badge && !isLoading && (
        <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center border-2 border-white">
          {item.badge.count}
        </span>
      )}
      
      {!isActive && !isLoading && (
        <div className="absolute inset-0 bg-gradient-to-r from-yellow-500/0 to-orange-500/0 group-hover:from-yellow-500/5 group-hover:to-orange-500/5 transition-all duration-200" />
      )}
    </button>
  );
};

/**
 * User Profile Component
 */
const UserProfile = ({ user, collapsed = false, isLoading = false }) => {
  if (collapsed) {
    return (
      <div className="flex flex-col items-center space-y-2">
        {isLoading ? (
          <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center">
            <LoadingSpinner size="small" />
          </div>
        ) : (
          <div className="relative">
            <div className="w-10 h-10 rounded-full bg-gradient-to-r from-yellow-400 to-orange-500 flex items-center justify-center text-white font-bold shadow-lg">
              {user?.name?.charAt(0).toUpperCase() || 'U'}
            </div>
            <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className={`flex items-center space-x-3 p-3 rounded-xl bg-gradient-to-r from-gray-50 to-gray-100 hover:from-gray-100 hover:to-gray-50 transition-all duration-200 cursor-pointer border border-gray-200 ${isLoading ? 'opacity-70' : ''}`}>
      {isLoading ? (
        <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center">
          <LoadingSpinner size="default" />
        </div>
      ) : (
        <div className="relative">
          <div className="w-12 h-12 rounded-full bg-gradient-to-r from-yellow-400 to-orange-500 flex items-center justify-center text-white font-bold text-lg shadow-lg">
            {user?.name?.charAt(0).toUpperCase() || 'U'}
          </div>
          <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white animate-pulse"></div>
        </div>
      )}
      
      {!isLoading && (
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-gray-900 truncate">
            {user?.name || 'User'}
          </p>
          <p className="text-xs text-gray-500 truncate">
            {user?.email || 'user@example.com'}
          </p>
          <span className="inline-block mt-1 text-xs font-medium text-yellow-700 bg-yellow-100 px-2 py-0.5 rounded-full">
            Restaurant Owner
          </span>
        </div>
      )}
    </div>
  );
};

/**
 * Logo Component
 */
const Logo = ({ collapsed = false, isLoading = false }) => {
  if (collapsed) {
    return (
      <div className="flex justify-center">
        {isLoading ? (
          <div className="p-2 bg-gray-200 rounded-xl">
            <LoadingSpinner size="small" />
          </div>
        ) : (
          <div className="p-2 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-xl shadow-lg">
            <ChefHat className="w-6 h-6 text-white" />
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="flex items-center space-x-3">
      {isLoading ? (
        <div className="p-2 bg-gray-200 rounded-xl">
          <LoadingSpinner size="small" />
        </div>
      ) : (
        <div className="p-2 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-xl shadow-lg">
          <ChefHat className="w-6 h-6 text-white" />
        </div>
      )}
      
      {!isLoading && (
        <div>
          <h1 className="text-xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
            RestaurantHub
          </h1>
          <p className="text-xs text-gray-500 font-medium">Management System</p>
        </div>
      )}
    </div>
  );
};

/**
 * Action Button Component
 */
const ActionButton = ({ icon: Icon, label, onClick, variant = 'default', badge = null, className = '', isLoading = false }) => {
  const variants = {
    default: 'text-gray-600 hover:bg-white hover:text-gray-900',
    danger: 'text-red-600 hover:bg-red-50',
    primary: 'text-yellow-600 hover:bg-yellow-50'
  };

  return (
    <button
      onClick={onClick}
      disabled={isLoading}
      className={`
        w-full flex items-center space-x-3 px-4 py-2.5 rounded-lg
        ${variants[variant]} hover:shadow-sm transition-all duration-200
        ${isLoading ? 'opacity-70 cursor-wait' : ''}
        ${className}
      `}
      aria-label={label}
    >
      {isLoading ? (
        <LoadingSpinner size="small" />
      ) : (
        <Icon size={18} />
      )}
      <span className="text-sm font-medium">{label}</span>
      {badge && !isLoading && (
        <span className="ml-auto bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
          {badge}
        </span>
      )}
    </button>
  );
};


const NavBarLayout = ({ children }) => {
  // State Management
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [notifications, setNotifications] = useState(3);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [activeNavigation, setActiveNavigation] = useState(null);
  
  // Refs
  const sidebarRef = useRef(null);
  const userMenuRef = useRef(null);
  
  // Hooks
  const { logout, user } = useAuth();
  const { loading: globalLoading } = useLoading();
  const navigate = useNavigate();
  const location = useLocation();
  const { isMobile, isTablet, isDesktop } = useResponsive();

  // Initialize sidebar state based on screen size
  useEffect(() => {
    if (isMobile || isTablet) {
      setSidebarOpen(false);
      setSidebarCollapsed(false);
    } else {
      setSidebarOpen(true);
      setSidebarCollapsed(false);
    }
  }, [isMobile, isTablet]);

  // Click outside handlers
  useClickOutside(sidebarRef, () => {
    if (isMobile || isTablet) {
      setSidebarOpen(false);
    }
  });

  useClickOutside(userMenuRef, () => {
    setShowUserMenu(false);
  });

  // Handlers
  const handleLogout = useCallback(async () => {
    if (window.confirm('Are you sure you want to logout?')) {
      try {
        await logout();
        navigate('/login');
      } catch (error) {
        console.error('Logout error:', error);
      }
    }
  }, [logout, navigate]);

  const handleNavigation = useCallback((path, itemId) => {
    setActiveNavigation(itemId);
    navigate(path);
    if (isMobile || isTablet) {
      setSidebarOpen(false);
    }
  }, [navigate, isMobile, isTablet]);

  const toggleSidebar = useCallback(() => {
    if (isDesktop) {
      setSidebarCollapsed(prev => !prev);
    } else {
      setSidebarOpen(prev => !prev);
    }
  }, [isDesktop]);

  const openSidebar = useCallback(() => {
    setSidebarOpen(true);
  }, []);

  const closeSidebar = useCallback(() => {
    if (isMobile || isTablet) {
      setSidebarOpen(false);
    }
  }, [isMobile, isTablet]);

  const toggleDarkMode = useCallback(() => {
    setDarkMode(prev => !prev);
  }, []);

  const handleSearchChange = useCallback((e) => {
    setSearchQuery(e.target.value);
  }, []);

  const handleNotificationsClick = useCallback(() => {
    setNotifications(0);
    // Add your notifications logic here
  }, []);

  // Computed Values
  const pageTitle = useMemo(() => {
    const currentItem = NAVIGATION_ITEMS.find(item => 
      location.pathname.startsWith(item.path)
    );
    return currentItem?.name || 'Dashboard';
  }, [location.pathname]);

  const isNavItemActive = useCallback((path) => {
    return location.pathname.startsWith(path);
  }, [location.pathname]);

  const sidebarWidth = useMemo(() => {
    if (!sidebarOpen && (isMobile || isTablet)) return '0px';
    if (sidebarCollapsed && isDesktop) return SIDEBAR_WIDTH.COLLAPSED;
    return SIDEBAR_WIDTH.EXPANDED;
  }, [sidebarOpen, sidebarCollapsed, isDesktop, isMobile, isTablet]);

  const isLoading = globalLoading;

  return (
    <div className={`flex h-screen ${darkMode ? 'dark' : ''} bg-gray-50 overflow-hidden`}>
      {/* Sidebar Overlay for Mobile/Tablet */}
      {sidebarOpen && (isMobile || isTablet) && (
        <div 
          onClick={closeSidebar}
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 transition-opacity duration-300"
          aria-hidden="true"
        />
      )}

      {/* Sidebar */}
      <aside 
        ref={sidebarRef}
        style={{ width: sidebarWidth }}
        className={`
          ${(isMobile || isTablet) ? 'fixed' : 'relative'}
          inset-y-0 left-0 z-50
          ${sidebarOpen || isDesktop ? 'translate-x-0' : '-translate-x-full'}
          bg-white shadow-2xl border-r border-gray-200
          transition-all duration-300 ease-in-out
          flex flex-col
        `}
        aria-label="Sidebar navigation"
      >
        {/* Logo Section */}
        <div className={`
          flex items-center ${sidebarCollapsed && isDesktop ? 'justify-center' : 'justify-between'}
          p-6 border-b border-gray-100
        `}>
          <Logo collapsed={sidebarCollapsed && isDesktop} isLoading={isLoading} />
          
          {!(sidebarCollapsed && isDesktop) && (
            <button 
              onClick={isDesktop ? toggleSidebar : closeSidebar}
              disabled={isLoading}
              className="p-2 rounded-lg hover:bg-gray-100 transition-colors disabled:opacity-50"
              aria-label={isDesktop ? "Collapse sidebar" : "Close sidebar"}
            >
              {isLoading ? (
                <LoadingSpinner size="small" />
              ) : isDesktop ? (
                <ChevronLeft size={20} className="text-gray-500" />
              ) : (
                <X size={20} className="text-gray-500" />
              )}
            </button>
          )}
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 px-4 py-2 space-y-1 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent">
          {NAVIGATION_ITEMS.map((item) => (
            <NavItem
              key={item.id}
              item={item}
              isActive={isNavItemActive(item.path)}
              onClick={() => handleNavigation(item.path, item.id)}
              collapsed={sidebarCollapsed && isDesktop}
              isLoading={isLoading && activeNavigation === item.id}
            />
          ))}
        </nav>

        {/* Bottom Section */}
        <div className="border-t border-gray-100 p-4 space-y-3 bg-gray-50/50">
          <UserProfile 
            user={user} 
            collapsed={sidebarCollapsed && isDesktop} 
            isLoading={isLoading}
          />
          
          {!(sidebarCollapsed && isDesktop) && (
            <div className="space-y-1">
              <ActionButton
                icon={Settings}
                label="Settings"
                onClick={() => handleNavigation('/settings')}
                variant="default"
                isLoading={isLoading}
              />
              
              <ActionButton
                icon={HelpCircle}
                label="Help & Support"
                onClick={() => handleNavigation('/help')}
                variant="default"
                isLoading={isLoading}
              />
              
              <ActionButton
                icon={LogOut}
                label="Logout"
                onClick={handleLogout}
                variant="danger"
                isLoading={isLoading}
              />
            </div>
          )}
          
          {sidebarCollapsed && isDesktop && (
            <div className="flex flex-col items-center space-y-2">
              <button
                onClick={() => handleNavigation('/settings')}
                disabled={isLoading}
                className="p-2 rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50"
                title="Settings"
              >
                {isLoading ? (
                  <LoadingSpinner size="small" />
                ) : (
                  <Settings size={20} className="text-gray-600" />
                )}
              </button>
              <button
                onClick={handleLogout}
                disabled={isLoading}
                className="p-2 rounded-lg hover:bg-red-50 transition-colors disabled:opacity-50"
                title="Logout"
              >
                {isLoading ? (
                  <LoadingSpinner size="small" />
                ) : (
                  <LogOut size={20} className="text-red-600" />
                )}
              </button>
            </div>
          )}
        </div>

        {/* Collapse Toggle Button (Desktop Only) */}
        {isDesktop && sidebarCollapsed && (
          <button
            onClick={toggleSidebar}
            disabled={isLoading}
            className="absolute -right-3 top-1/2 transform -translate-y-1/2 bg-white border border-gray-200 rounded-full p-1.5 shadow-lg hover:shadow-xl transition-all disabled:opacity-50"
            aria-label="Expand sidebar"
          >
            {isLoading ? (
              <LoadingSpinner size="small" />
            ) : (
              <ChevronRight size={16} className="text-gray-600" />
            )}
          </button>
        )}
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden min-w-0">
       

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto bg-gradient-to-br from-gray-50 via-white to-blue-50/30 relative">
          {/* Global Loading Overlay */}
          {isLoading && (
            <div className="absolute inset-0 bg-white/80 backdrop-blur-sm z-20 flex items-center justify-center">
              <div className="text-center">
                <LoadingSpinner size="large" className="mx-auto mb-4" />
                <p className="text-gray-600 font-medium">Loading {pageTitle}...</p>
              </div>
            </div>
          )}
          
          <div className="max-w-[1800px] mx-auto">
            {children}
          </div>
        </main>
      </div>

      {/* Add CSS for loading animation */}
      <style jsx>{`
        @keyframes loading {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
        .animate-\[loading_1\.5s_ease-in-out_infinite\] {
          animation: loading 1.5s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
};

export default NavBarLayout;