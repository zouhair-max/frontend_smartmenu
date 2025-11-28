import { api } from './api';

export const dashboardService = {
  // Get main dashboard data
  getDashboardData: async () => {
    return api.get('/owner/dashboard');
  },

  // Get detailed stats
  getDetailedStats: async () => {
    return api.get('/owner/dashboard/stats');
  },

  // Get weekly report
  getWeeklyReport: async () => {
    return api.get('/owner/dashboard/weekly-report');
  },
};