// App.js
import { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { LoadingProvider } from './contexts/LoadingContext';
import ProtectedRoute from './screens/components/ProtectedRoute.jsx';
import RoleProtectedRoute from './screens/components/RoleProtectedRoute.jsx';
import NavBarLayout from './screens/components/Restaurant_owner/NavBarLayout.jsx';
import AdminLayout from './screens/components/Admin/AdminLayout.jsx';
import LoadingFallback from './components/LoadingFallback.jsx';

// Public routes - loaded immediately
import Home from './auth/Home';
import Login from './auth/Login.jsx';
import SignUp from './auth/Singup.jsx';
import ForgetPassword from './auth/ForgetPassword.jsx';
import ResetPassword from './auth/ResetPassword.jsx';
import NotFound from './components/NotFound.jsx';

// Lazy load heavy components for better performance
const PageMenu = lazy(() => import('./screens/components/PageMenu.jsx'));
const Dashboard = lazy(() => import('./screens/components/Restaurant_owner/Dashboard.jsx'));
const MealsList = lazy(() => import('./screens/components/Restaurant_owner/Meals/MealsList.jsx'));
const MealForm = lazy(() => import('./screens/components/Restaurant_owner/Meals/MealForm.jsx'));
const Categories = lazy(() => import('./screens/components/Restaurant_owner/Categories.jsx'));
const CategoryForm = lazy(() => import('./screens/components/Restaurant_owner/Categories/CategoryForm.jsx'));
const Order = lazy(() => import('./screens/components/Restaurant_owner/Order.jsx'));
const OrderForm = lazy(() => import('./screens/components/Restaurant_owner/Orders/OrderForm.jsx'));
const Staff = lazy(() => import('./screens/components/Restaurant_owner/Staff.jsx'));
const StaffForm = lazy(() => import('./screens/components/Restaurant_owner/Staff/StaffForm.jsx'));
const Restaurant_Tables = lazy(() => import('./screens/components/Restaurant_owner/Restaurant_Tables.jsx'));
const TableForm = lazy(() => import('./screens/components/Restaurant_owner/Tables/TableForm.jsx'));
const Setting = lazy(() => import('./screens/components/Restaurant_owner/Setting.jsx'));
const Subscription = lazy(() => import('./screens/components/Restaurant_owner/Subscription.jsx'));
const SubscriptionSuccess = lazy(() => import('./screens/components/Restaurant_owner/SubscriptionSuccess.jsx'));
const SubscriptionCancel = lazy(() => import('./screens/components/Restaurant_owner/SubscriptionCancel.jsx'));

// Admin components
const AdminDashboard = lazy(() => import('./screens/components/Admin/AdminDashboard.jsx'));
const RestaurantsList = lazy(() => import('./screens/components/Admin/Restaurants/RestaurantsList.jsx'));
const RestaurantForm = lazy(() => import('./screens/components/Admin/Restaurants/RestaurantForm.jsx'));
const RestaurantDetails = lazy(() => import('./screens/components/Admin/Restaurants/RestaurantDetails.jsx'));
const UsersList = lazy(() => import('./screens/components/Admin/Users/UsersList.jsx'));
const UserForm = lazy(() => import('./screens/components/Admin/Users/UserForm.jsx'));
const UserDetails = lazy(() => import('./screens/components/Admin/Users/UserDetails.jsx'));

export default function App() {
  return (
    <LoadingProvider>
      <AuthProvider>
        <Router>
          <Routes>
            {/* Public Routes without NavBarLayout */}
            <Route 
              path="/Pagemenu/:restaurant_id/:table_id" 
              element={
                <Suspense fallback={<LoadingFallback message="Loading menu..." />}>
                  <PageMenu />
                </Suspense>
              } 
            />

            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<SignUp />} />
            <Route path="/forgot-password" element={<ForgetPassword />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route path="/" element={<Home />} />
            
            
            {/* Protected Routes with NavBarLayout */}
            <Route 
              path="/dashboard" 
              element={
                <RoleProtectedRoute allowedRoles={['restaurant_owner']}>
                  <NavBarLayout>
                    <Suspense fallback={<LoadingFallback />}>
                      <Dashboard />
                    </Suspense>
                  </NavBarLayout>
                </RoleProtectedRoute>
              } 
            />
            {/* Meal Management Routes - Restaurant Owner Only */}
            <Route 
              path="/meals" 
              element={
                <RoleProtectedRoute >
                  <NavBarLayout>
                    <Suspense fallback={<LoadingFallback />}>
                      <MealsList />
                    </Suspense>
                  </NavBarLayout>
                </RoleProtectedRoute>
              } 
            />
            <Route 
              path="/categories" 
              element={
                <RoleProtectedRoute >
                  <NavBarLayout>
                    <Suspense fallback={<LoadingFallback />}>
                      <Categories />
                    </Suspense>
                  </NavBarLayout>
                </RoleProtectedRoute>
              } 
            />
            <Route 
              path="/categories/create" 
              element={
                <RoleProtectedRoute >
                  <NavBarLayout>
                    <Suspense fallback={<LoadingFallback />}>
                      <CategoryForm />
                    </Suspense>
                  </NavBarLayout>
                </RoleProtectedRoute>
              } 
            />
            <Route 
              path="/categories/:id/edit" 
              element={
                <RoleProtectedRoute >
                  <NavBarLayout>
                    <Suspense fallback={<LoadingFallback />}>
                      <CategoryForm />
                    </Suspense>
                  </NavBarLayout>
                </RoleProtectedRoute>
              } 
            />
            <Route 
              path="/meals/create" 
              element={
                <RoleProtectedRoute >
                  <NavBarLayout>
                    <Suspense fallback={<LoadingFallback />}>
                      <MealForm />
                    </Suspense>
                  </NavBarLayout>
                </RoleProtectedRoute>
              } 
            />
            <Route 
              path="/meals/:id/edit" 
              element={
                <RoleProtectedRoute >
                  <NavBarLayout>
                    <Suspense fallback={<LoadingFallback />}>
                      <MealForm />
                    </Suspense>
                  </NavBarLayout>
                </RoleProtectedRoute>
              } 
            />
            <Route 
              path="/orders" 
              element={
                <ProtectedRoute>
                  <NavBarLayout>
                    <Suspense fallback={<LoadingFallback />}>
                      <Order />
                    </Suspense>
                  </NavBarLayout>
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/orders/create" 
              element={
                <RoleProtectedRoute>
                  <NavBarLayout>
                    <Suspense fallback={<LoadingFallback />}>
                      <OrderForm />
                    </Suspense>
                  </NavBarLayout>
                </RoleProtectedRoute>
              } 
            />
            <Route 
              path="/Staffs" 
              element={
                <RoleProtectedRoute allowedRoles={['restaurant_owner']}>
                  <NavBarLayout>
                    <Suspense fallback={<LoadingFallback />}>
                      <Staff />
                    </Suspense>
                  </NavBarLayout>
                </RoleProtectedRoute>
              } 
            />
            <Route 
              path="/Staffs/create" 
              element={
                <RoleProtectedRoute allowedRoles={['restaurant_owner']}>
                  <NavBarLayout>
                    <Suspense fallback={<LoadingFallback />}>
                      <StaffForm />
                    </Suspense>
                  </NavBarLayout>
                </RoleProtectedRoute>
              } 
            />
            <Route 
              path="/Staffs/:id/edit" 
              element={
                <RoleProtectedRoute allowedRoles={['restaurant_owner']}>
                  <NavBarLayout>
                    <Suspense fallback={<LoadingFallback />}>
                      <StaffForm />
                    </Suspense>
                  </NavBarLayout>
                </RoleProtectedRoute>
              } 
            />
            <Route 
              path="/Restaurant_Tables" 
              element={
                <ProtectedRoute>
                  <NavBarLayout>
                    <Suspense fallback={<LoadingFallback />}>
                      <Restaurant_Tables />
                    </Suspense>
                  </NavBarLayout>
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/Restaurant_Tables/create" 
              element={
                <ProtectedRoute>
                  <NavBarLayout>
                    <Suspense fallback={<LoadingFallback />}>
                      <TableForm />
                    </Suspense>
                  </NavBarLayout>
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/Restaurant_Tables/:id/edit" 
              element={
                <ProtectedRoute>
                  <NavBarLayout>
                    <Suspense fallback={<LoadingFallback />}>
                      <TableForm />
                    </Suspense>
                  </NavBarLayout>
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/settings" 
              element={
                <RoleProtectedRoute allowedRoles={['restaurant_owner']}>
                  <NavBarLayout>
                    <Suspense fallback={<LoadingFallback />}>
                      <Setting />
                    </Suspense>
                  </NavBarLayout>
                </RoleProtectedRoute>
              } 
            />
            <Route 
              path="/subscription" 
              element={
                <RoleProtectedRoute allowedRoles={['restaurant_owner']}>
                  <NavBarLayout>
                    <Suspense fallback={<LoadingFallback />}>
                      <Subscription />
                    </Suspense>
                  </NavBarLayout>
                </RoleProtectedRoute>
              } 
            />
            <Route 
              path="/subscription/success" 
              element={
                <RoleProtectedRoute allowedRoles={['restaurant_owner']}>
                  <NavBarLayout>
                    <Suspense fallback={<LoadingFallback />}>
                      <SubscriptionSuccess />
                    </Suspense>
                  </NavBarLayout>
                </RoleProtectedRoute>
              } 
            />
            <Route 
              path="/subscription/cancel" 
              element={
                <RoleProtectedRoute allowedRoles={['restaurant_owner']}>
                  <NavBarLayout>
                    <Suspense fallback={<LoadingFallback />}>
                      <SubscriptionCancel />
                    </Suspense>
                  </NavBarLayout>
                </RoleProtectedRoute>
              } 
            />

            {/* Admin Routes */}
            <Route 
              path="/admin/dashboard" 
              element={
                <RoleProtectedRoute allowedRoles={['admin']}>
                  <AdminLayout>
                    <Suspense fallback={<LoadingFallback />}>
                      <AdminDashboard />
                    </Suspense>
                  </AdminLayout>
                </RoleProtectedRoute>
              } 
            />
            <Route 
              path="/admin/restaurants" 
              element={
                <RoleProtectedRoute allowedRoles={['admin']}>
                  <AdminLayout>
                    <Suspense fallback={<LoadingFallback />}>
                      <RestaurantsList />
                    </Suspense>
                  </AdminLayout>
                </RoleProtectedRoute>
              } 
            />
            <Route 
              path="/admin/restaurants/create" 
              element={
                <RoleProtectedRoute allowedRoles={['admin']}>
                  <AdminLayout>
                    <Suspense fallback={<LoadingFallback />}>
                      <RestaurantForm />
                    </Suspense>
                  </AdminLayout>
                </RoleProtectedRoute>
              } 
            />
            <Route 
              path="/admin/restaurants/:id" 
              element={
                <RoleProtectedRoute allowedRoles={['admin']}>
                  <AdminLayout>
                    <Suspense fallback={<LoadingFallback />}>
                      <RestaurantDetails />
                    </Suspense>
                  </AdminLayout>
                </RoleProtectedRoute>
              } 
            />
            <Route 
              path="/admin/restaurants/:id/edit" 
              element={
                <RoleProtectedRoute allowedRoles={['admin']}>
                  <AdminLayout>
                    <Suspense fallback={<LoadingFallback />}>
                      <RestaurantForm />
                    </Suspense>
                  </AdminLayout>
                </RoleProtectedRoute>
              } 
            />
            <Route 
              path="/admin/users" 
              element={
                <RoleProtectedRoute allowedRoles={['admin']}>
                  <AdminLayout>
                    <Suspense fallback={<LoadingFallback />}>
                      <UsersList />
                    </Suspense>
                  </AdminLayout>
                </RoleProtectedRoute>
              } 
            />
            <Route 
              path="/admin/users/create" 
              element={
                <RoleProtectedRoute allowedRoles={['admin']}>
                  <AdminLayout>
                    <Suspense fallback={<LoadingFallback />}>
                      <UserForm />
                    </Suspense>
                  </AdminLayout>
                </RoleProtectedRoute>
              } 
            />
            <Route 
              path="/admin/users/:id" 
              element={
                <RoleProtectedRoute allowedRoles={['admin']}>
                  <AdminLayout>
                    <Suspense fallback={<LoadingFallback />}>
                      <UserDetails />
                    </Suspense>
                  </AdminLayout>
                </RoleProtectedRoute>
              } 
            />
            <Route 
              path="/admin/users/:id/edit" 
              element={
                <RoleProtectedRoute allowedRoles={['admin']}>
                  <AdminLayout>
                    <Suspense fallback={<LoadingFallback />}>
                      <UserForm />
                    </Suspense>
                  </AdminLayout>
                </RoleProtectedRoute>
              } 
            />

            {/* 404 - Catch all route (must be last) */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Router>
      </AuthProvider>
    </LoadingProvider>
  );
}