import { useEffect, useState } from 'react';
import { dashboardService } from '../services/dashboardService';
import { useAuth } from '../contexts/AuthContext';
import Dashboard from './components/Restaurant_owner/Dashboard';
import LoadingSpinner from './components/Restaurant_owner/components/LoadingSpinner';
import MenuBuilder from './components/Restaurant_owner/Categories';
import Meals from './components/Restaurant_owner/Meals';

const HomeScreen = () => {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { logout } = useAuth();

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const response = await dashboardService.getDashboardData();
      
      if (response.success) {
        setDashboardData(response.data);
      } else {
        setError(response.message);
      }
    } catch (err) {
      setError(err.message);
      if (err.message === 'Authentication required') {
        logout();
      }
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div><LoadingSpinner/></div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div>
      {/* <Dashboard data={dashboardData} /> */}
      {/* <MenuBuilder/> */}
      <Meals/>

    </div>
  );
};

export default HomeScreen;