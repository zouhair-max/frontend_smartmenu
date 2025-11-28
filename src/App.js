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
import MealsList from './screens/components/Restaurant_owner/Meals/MealsList.jsx';
import MealForm from './screens/components/Restaurant_owner/Meals/MealForm.jsx';
import NavBarLayout from './screens/components/Restaurant_owner/NavBarLayout.jsx';
import Dashboard from './screens/components/Restaurant_owner/Dashboard.jsx';
import Categories from './screens/components/Restaurant_owner/Categories.jsx';

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
              path="/screen/dashboard" 
              element={
                <ProtectedRoute>
                  <NavBarLayout>
                    <Dashboard />
                  </NavBarLayout>
                </ProtectedRoute>
              } 
            />
            {/* Meal Management Routes */}
            <Route 
              path="/meals" 
              element={
                <ProtectedRoute>
                  <NavBarLayout>
                    <MealsList />
                  </NavBarLayout>
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/categories" 
              element={
                <ProtectedRoute>
                  <NavBarLayout>
                    <Categories />
                  </NavBarLayout>
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/meals/create" 
              element={
                <ProtectedRoute>
                  <NavBarLayout>
                    <MealForm />
                  </NavBarLayout>
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/meals/:id/edit" 
              element={
                <ProtectedRoute>
                  <NavBarLayout>
                    <MealForm />
                  </NavBarLayout>
                </ProtectedRoute>
              } 
            />
          </Routes>
        </Router>
      </AuthProvider>
    </LoadingProvider>
  );
}