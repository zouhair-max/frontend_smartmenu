// App.js
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { LoadingProvider } from './contexts/LoadingContext';
import Home from './auth/Home';
import Login from './auth/Login.jsx';
import SignUp from './auth/Singup.jsx';
import ForgetPassword from './auth/ForgetPassword.jsx';
import HomeScreen from './screens/HomeScreen.jsx';
import ProtectedRoute from './screens/components/ProtectedRoute.jsx';
import RoleProtectedRoute from './screens/components/RoleProtectedRoute.jsx';
import MealsList from './screens/components/Restaurant_owner/Meals/MealsList.jsx';
import MealForm from './screens/components/Restaurant_owner/Meals/MealForm.jsx';
import NavBarLayout from './screens/components/Restaurant_owner/NavBarLayout.jsx';
import Dashboard from './screens/components/Restaurant_owner/Dashboard.jsx';
import Categories from './screens/components/Restaurant_owner/Categories.jsx';
import Order from './screens/components/Restaurant_owner/Order.jsx';
import Staff from './screens/components/Restaurant_owner/Staff.jsx';
import Restaurant_Tables from './screens/components/Restaurant_owner/Restaurant_Tables.jsx';
import Setting from './screens/components/Restaurant_owner/Setting.jsx';

export default function App() {
  return (
    <LoadingProvider>
      <AuthProvider>
        <Router>
          <Routes>
            {/* Public Routes without NavBarLayout */}
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<SignUp />} />
            <Route path="/login/ForegetPassword" element={<ForgetPassword />} />
            
            {/* Protected Routes with NavBarLayout */}
            <Route 
              path="/dashboard" 
              element={
                <ProtectedRoute allowedRoles={['restaurant_owner']}>
                  <NavBarLayout>
                    <Dashboard />
                  </NavBarLayout>
                </ProtectedRoute>
              } 
            />
            {/* Meal Management Routes - Restaurant Owner Only */}
            <Route 
              path="/meals" 
              element={
                <RoleProtectedRoute >
                  <NavBarLayout>
                    <MealsList />
                  </NavBarLayout>
                </RoleProtectedRoute>
              } 
            />
            <Route 
              path="/categories" 
              element={
                <RoleProtectedRoute >
                  <NavBarLayout>
                    <Categories />
                  </NavBarLayout>
                </RoleProtectedRoute>
              } 
            />
            <Route 
              path="/meals/create" 
              element={
                <RoleProtectedRoute >
                  <NavBarLayout>
                    <MealForm />
                  </NavBarLayout>
                </RoleProtectedRoute>
              } 
            />
            <Route 
              path="/meals/:id/edit" 
              element={
                <RoleProtectedRoute >
                  <NavBarLayout>
                    <MealForm />
                  </NavBarLayout>
                </RoleProtectedRoute>
              } 
            />
            <Route 
              path="/orders" 
              element={
                <ProtectedRoute>
                  <NavBarLayout>
                    <Order />
                  </NavBarLayout>
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/Staffs" 
              element={
                <RoleProtectedRoute allowedRoles={['restaurant_owner']}>
                  <NavBarLayout>
                    <Staff />
                  </NavBarLayout>
                </RoleProtectedRoute>
              } 
            />
            <Route 
              path="/Restaurant_Tables" 
              element={
                <ProtectedRoute>
                  <NavBarLayout>
                    <Restaurant_Tables />
                  </NavBarLayout>
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/settings" 
              element={
                <RoleProtectedRoute allowedRoles={['restaurant_owner']}>
                  <NavBarLayout>
                    <Setting />
                  </NavBarLayout>
                </RoleProtectedRoute>
              } 
            />
          </Routes>
        </Router>
      </AuthProvider>
    </LoadingProvider>
  );
}