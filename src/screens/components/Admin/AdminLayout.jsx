import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Store, 
  Users, 
  LogOut,
  Menu,
  X,
  Shield,
  ChevronLeft,
  ChevronRight,
  Loader2,
  Settings
} from 'lucide-react';
import { useAuth } from '../../../contexts/AuthContext';
import { useLoading } from '../../../contexts/LoadingContext';

const BREAKPOINTS = {
  MOBILE: 640,
  TABLET: 768,
  DESKTOP: 1024
};

const SIDEBAR_WIDTH = {
  EXPANDED: '320px',
  COLLAPSED: '80px'
};

const ADMIN_NAVIGATION_ITEMS = [
  { 
    id: 'admin-dashboard',
    name: 'Dashboard', 
    path: '/admin/dashboard', 
    icon: LayoutDashboard,
    description: 'Admin Overview'
  },
  { 
    id: 'restaurants',
    name: 'Restaurants', 
    path: '/admin/restaurants', 
    icon: Store,
    description: 'Manage Restaurants'
  },
  { 
    id: 'users',
    name: 'Users', 
    path: '/admin/users', 
    icon: Users,
    description: 'Manage Users'
  },
];

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

const useClickOutside = (ref, callback) => {
  useEffect(() => {
    const handleClick = (event) => {
      if (ref.current && !ref.current.contains(event.target)) {
        callback();
      }
    };

    document.addEventListener('mousedown', handleClick);
    document.addEventListener('touchstart', handleClick);
    return () => {
      document.removeEventListener('mousedown', handleClick);
      document.removeEventListener('touchstart', handleClick);
    };
  }, [ref, callback]);
};

const LoadingSpinner = ({ size = 'default', className = '' }) => {
  const sizes = {
    small: 'w-4 h-4',
    default: 'w-6 h-6',
    large: 'w-8 h-8'
  };

  return (
    <Loader2 className={`${sizes[size]} animate-spin text-orange-500 ${className}`} />
  );
};

const NavItem = ({ item, isActive, onClick, collapsed, isLoading = false, isMobile = false }) => {
  const Icon = item.icon;
  
  if (isMobile) {
    return (
      <button
        onClick={onClick}
        disabled={isLoading}
        className={`
          w-full flex items-center justify-between 
          px-4 py-4 mt-1 rounded-2xl transition-all duration-200 active:scale-95
          ${isActive 
            ? 'bg-gradient-to-r from-yellow-500 to-orange-500 text-white shadow-lg' 
            : 'text-gray-700 active:bg-gray-100'
          }
          ${isLoading ? 'opacity-70 cursor-wait' : ''}
        `}
        aria-current={isActive ? 'page' : undefined}
      >
        <div className="flex items-center space-x-4">
          {isLoading ? (
            <LoadingSpinner size="small" />
          ) : (
            <Icon 
              size={22} 
              className={`${isActive ? 'text-white' : 'text-gray-600'}`}
              strokeWidth={isActive ? 2.5 : 2}
            />
          )}
          
          <div className="text-left">
            <span className={`block font-semibold text-base ${isActive ? 'text-white' : ''}`}>
              {item.name}
            </span>
            <span className={`block text-xs mt-0.5 ${isActive ? 'text-white/80' : 'text-gray-500'}`}>
              {item.description}
            </span>
          </div>
        </div>
      </button>
    );
  }

  return (
    <button
      onClick={onClick}
      disabled={isLoading}
      className={`
        w-full flex items-center ${collapsed ? 'justify-center' : 'justify-between'} 
        px-4 py-3 rounded-xl transition-all duration-200 group relative overflow-hidden
        ${isActive 
          ? 'bg-gradient-to-r from-orange-600 to-orange-600 text-white shadow-lg scale-[1.02]' 
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
                : 'text-gray-500 group-hover:text-orange-600 group-hover:scale-110'
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
    </button>
  );
};

const UserProfile = ({ user, collapsed = false, isLoading = false, isMobile = false }) => {
  if (isMobile) {
    return (
      <div className={`flex items-center space-x-4 p-4 rounded-2xl bg-gradient-to-r from-gray-50 to-gray-100 border border-gray-200 ${isLoading ? 'opacity-70' : ''}`}>
        {isLoading ? (
          <div className="w-14 h-14 rounded-full bg-gray-200 flex items-center justify-center">
            <LoadingSpinner size="default" />
          </div>
        ) : (
          <div className="relative">
            <div className="w-14 h-14 rounded-full bg-gradient-to-r from-yellow-400 to-orange-500 flex items-center justify-center text-white font-bold text-xl shadow-lg">
              {user?.name?.charAt(0).toUpperCase() || 'A'}
            </div>
            <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-green-500 rounded-full border-2 border-white"></div>
          </div>
        )}
        
        {!isLoading && (
          <div className="flex-1 min-w-0">
            <p className="text-base font-semibold text-gray-900 truncate">
              {user?.name || 'Admin'}
            </p>
            <p className="text-sm text-gray-500 truncate">
              {user?.email || 'admin@example.com'}
            </p>
            <span className="inline-block mt-1.5 text-xs font-medium text-orange-700 bg-orange-100 px-2.5 py-1 rounded-full">
              Administrator
            </span>
          </div>
        )}
      </div>
    );
  }

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
              {user?.name?.charAt(0).toUpperCase() || 'A'}
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
            {user?.name?.charAt(0).toUpperCase() || 'A'}
          </div>
          <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white animate-pulse"></div>
        </div>
      )}
      
      {!isLoading && (
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-gray-900 truncate">
            {user?.name || 'Admin'}
          </p>
          <p className="text-xs text-gray-500 truncate">
            {user?.email || 'admin@example.com'}
          </p>
          <span className="inline-block mt-1 text-xs font-medium text-orange-700 bg-orange-100 px-2 py-0.5 rounded-full">
            Administrator
          </span>
        </div>
      )}
    </div>
  );
};

const Logo = ({ collapsed = false, isLoading = false, isMobile = false }) => {
  if (isMobile) {
    return (
      <div className="flex items-center space-x-3 m-2">
        {isLoading ? (
          <div className="p-2.5 bg-gray-200 rounded-xl">
            <LoadingSpinner size="small" />
          </div>
        ) : (
          <div className="p-2.5 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-xl shadow-lg">
            <Shield className="w-7 h-7 text-white" />
          </div>
        )}
        
        {!isLoading && (
          <div>
            <h1 className="text-xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
              Admin Panel
            </h1>
            <p className="text-xs text-gray-500 font-medium">System Management</p>
          </div>
        )}
      </div>
    );
  }

  if (collapsed) {
    return (
      <div className="flex justify-center">
        {isLoading ? (
          <div className="p-2 bg-gray-200 rounded-xl">
            <LoadingSpinner size="small" />
          </div>
        ) : (
          <div className="p-2 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-xl shadow-lg">
            <Shield className="w-6 h-6 text-white" />
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
        <div className="p-2 bg-gradient-to-r from-orange-600 to-orange-600 rounded-xl shadow-lg">
          <Shield className="w-6 h-6 text-white" />
        </div>
      )}
      
      {!isLoading && (
        <div>
          <h1 className="text-xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
            Admin Panel
          </h1>
          <p className="text-xs text-gray-500 font-medium">System Management</p>
        </div>
      )}
    </div>
  );
};

const AdminLayout = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [activeNavigation, setActiveNavigation] = useState(null);
  
  const sidebarRef = useRef(null);
  
  const { isMobile, isTablet, isDesktop } = useResponsive();
  const { logout, user } = useAuth();
  const { loading: globalLoading } = useLoading();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const currentItem = ADMIN_NAVIGATION_ITEMS.find(item => 
      location.pathname === item.path || location.pathname.startsWith(item.path)
    );
    if (currentItem) {
      setActiveNavigation(currentItem.id);
    }
  }, [location.pathname]);

  useEffect(() => {
    if (isMobile || isTablet) {
      setSidebarOpen(false);
      setSidebarCollapsed(false);
    } else {
      setSidebarOpen(true);
      setSidebarCollapsed(false);
    }
  }, [isMobile, isTablet]);

  useEffect(() => {
    if (sidebarOpen && (isMobile || isTablet)) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [sidebarOpen, isMobile, isTablet]);

  useClickOutside(sidebarRef, () => {
    if (isMobile || isTablet) {
      setSidebarOpen(false);
    }
  });

  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape' && sidebarOpen && (isMobile || isTablet)) {
        setSidebarOpen(false);
      }
    };
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [sidebarOpen, isMobile, isTablet]);

  const handleNavigation = useCallback((path, itemId) => {
    setActiveNavigation(itemId);
    navigate(path);
    if (isMobile || isTablet) {
      setSidebarOpen(false);
    }
  }, [navigate, isMobile, isTablet]);

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

  const toggleSidebar = useCallback(() => {
    if (isDesktop) {
      setSidebarCollapsed(prev => !prev);
    } else {
      setSidebarOpen(prev => !prev);
    }
  }, [isDesktop]);

  const closeSidebar = useCallback(() => {
    if (isMobile || isTablet) {
      setSidebarOpen(false);
    }
  }, [isMobile, isTablet]);

  const pageTitle = useMemo(() => {
    const currentItem = ADMIN_NAVIGATION_ITEMS.find(item => 
      location.pathname === item.path || location.pathname.startsWith(item.path)
    );
    return currentItem?.name || 'Dashboard';
  }, [location.pathname]);

  const isNavItemActive = useCallback((itemPath) => {
    return location.pathname === itemPath || location.pathname.startsWith(itemPath);
  }, [location.pathname]);

  const sidebarWidth = useMemo(() => {
    if (!sidebarOpen && (isMobile || isTablet)) return '0px';
    if (sidebarCollapsed && isDesktop) return SIDEBAR_WIDTH.COLLAPSED;
    return SIDEBAR_WIDTH.EXPANDED;
  }, [sidebarOpen, sidebarCollapsed, isDesktop, isMobile, isTablet]);

  const isLoading = globalLoading;

  if (isMobile || isTablet) {
    return (
      <div className="flex h-screen bg-gray-50 overflow-hidden">
        {sidebarOpen && (
          <div 
            onClick={closeSidebar}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 transition-opacity duration-300"
            aria-hidden="true"
          />
        )}

        <aside 
          ref={sidebarRef}
          className={`
            fixed inset-y-0 left-0 z-50 w-[85%] max-w-[360px]
            ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
            bg-white shadow-2xl
            transition-transform duration-300 ease-out
            flex flex-col
          `}
          aria-label="Sidebar navigation"
          aria-hidden={!sidebarOpen}
        >
          <div className="flex items-center justify-between p-0 border-b border-gray-100">
            <Logo isLoading={isLoading} isMobile={true} />
            <button 
              onClick={closeSidebar}
              disabled={isLoading}
              className="p-2 rounded-xl active:bg-gray-100 transition-colors"
              aria-label="Close sidebar"
            >
              {isLoading ? (
                <LoadingSpinner size="small" />
              ) : (
                <X size={24} className="text-gray-500" />
              )}
            </button>
          </div>

          <nav className="flex-1 px-4 py-4 space-y-2 overflow-y-auto">
            {ADMIN_NAVIGATION_ITEMS.map((item) => (
              <NavItem
                key={item.id}
                item={item}
                isActive={isNavItemActive(item.path)}
                onClick={() => handleNavigation(item.path, item.id)}
                isLoading={isLoading && activeNavigation === item.id}
                isMobile={true}
              />
            ))}
          </nav>

          <div className="border-t border-gray-100 p-4 space-y-3 bg-gray-50/50">
            <UserProfile user={user} isLoading={isLoading} isMobile={true} />
            
            <div className="space-y-1">
              <button
                onClick={handleLogout}
                className="w-full flex items-center space-x-3 px-4 py-3.5 rounded-xl text-red-600 active:bg-red-50 transition-all duration-200 active:scale-95"
              >
                <LogOut size={20} />
                <span className="text-base font-medium flex-1 text-left">Logout</span>
                <ChevronRight size={18} className="text-gray-400" />
              </button>
            </div>
          </div>
        </aside>

        <div className="flex-1 flex flex-col overflow-hidden min-w-0">
          <header className="sticky top-0 z-30 bg-white border-b border-gray-200 shadow-sm">
            <div className="flex items-center justify-between px-4 py-3">
              <button
                onClick={toggleSidebar}
                className="p-2 rounded-xl active:bg-gray-100 transition-colors"
                aria-label={sidebarOpen ? "Close menu" : "Open menu"}
                aria-expanded={sidebarOpen}
              >
                {sidebarOpen ? (
                  <X size={24} className="text-gray-700" />
                ) : (
                  <Menu size={24} className="text-gray-700" />
                )}
              </button>
              
              <div className="flex-1 text-center">
                <h2 className="text-lg font-semibold text-gray-800">{pageTitle}</h2>
              </div>
              
              <div className="w-8"></div>
            </div>
          </header>

          <main className="flex-1 overflow-y-auto bg-gradient-to-br from-orange-50 via-white to-amber-50 relative">
            {isLoading && (
              <div className="absolute inset-0 bg-white/80 backdrop-blur-sm z-20 flex items-center justify-center">
                <div className="text-center">
                  <LoadingSpinner size="large" className="mx-auto mb-4" />
                  <p className="text-gray-600 font-medium text-lg">Loading {pageTitle}...</p>
                </div>
              </div>
            )}
            
            <div className="px-4 py-6">
              {children}
            </div>
          </main>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      <aside 
        ref={sidebarRef}
        style={{ width: sidebarWidth }}
        className={`
          relative
          inset-y-0 left-0 z-50
          bg-white shadow-2xl border-r border-gray-200
          transition-all duration-300 ease-in-out
          flex flex-col
        `}
        aria-label="Sidebar navigation"
      >
        <div className={`
          flex items-center ${sidebarCollapsed ? 'justify-center' : 'justify-between'}
          p-6 border-b border-gray-100
        `}>
          <Logo collapsed={sidebarCollapsed} isLoading={isLoading} />
          
          {!sidebarCollapsed && (
            <button 
              onClick={toggleSidebar}
              disabled={isLoading}
              className="p-2 rounded-lg hover:bg-gray-100 transition-colors disabled:opacity-50"
              aria-label="Collapse sidebar"
            >
              {isLoading ? (
                <LoadingSpinner size="small" />
              ) : (
                <ChevronLeft size={20} className="text-gray-500" />
              )}
            </button>
          )}
        </div>

        <nav className="flex-1 px-4 py-2 space-y-1 overflow-y-auto">
          {ADMIN_NAVIGATION_ITEMS.map((item) => (
            <NavItem
              key={item.id}
              item={item}
              isActive={isNavItemActive(item.path)}
              onClick={() => handleNavigation(item.path, item.id)}
              collapsed={sidebarCollapsed}
              isLoading={isLoading && activeNavigation === item.id}
            />
          ))}
        </nav>

        <div className="border-t border-gray-100 p-4 space-y-3 bg-gray-50/50">
          <UserProfile 
            user={user} 
            collapsed={sidebarCollapsed} 
            isLoading={isLoading}
          />
          
          {!sidebarCollapsed && (
            <div className="space-y-1">
              <button
                onClick={handleLogout}
                className="w-full flex items-center space-x-3 px-4 py-2.5 rounded-lg text-red-600 hover:bg-red-50 transition-all duration-200"
              >
                <LogOut size={18} />
                <span className="text-sm font-medium">Logout</span>
              </button>
            </div>
          )}
        </div>

        {sidebarCollapsed && (
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

      <div className="flex-1 flex flex-col overflow-hidden min-w-0">
        <main className="flex-1 overflow-y-auto bg-gradient-to-br from-gray-50 via-white to-orange-50/30 relative">
          {isLoading && (
            <div className="absolute inset-0 bg-white/80 backdrop-blur-sm z-20 flex items-center justify-center">
              <div className="text-center">
                <LoadingSpinner size="large" className="mx-auto mb-4" />
                <p className="text-gray-600 font-medium">Loading {pageTitle}...</p>
              </div>
            </div>
          )}
          
          <div className="max-w-[1800px] mx-auto px-4 sm:px-6 lg:px-8 pt-4 sm:pt-6 lg:pt-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;

