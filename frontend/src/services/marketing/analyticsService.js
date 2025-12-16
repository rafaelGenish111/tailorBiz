import axios from 'axios';

// ב-Production (Vercel) נשתמש ב-/api, בלוקאל נגדיר VITE_API_URL=http://localhost:5000/api
const API_URL = import.meta.env.VITE_API_URL || '/api';

// Get marketing overview
export const getOverview = async (startDate, endDate) => {
  try {
    const params = new URLSearchParams();
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);

    const response = await axios.get(
      `${API_URL}/marketing/analytics/overview?${params}`,
      {
        withCredentials: true
      }
    );
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

// Get campaigns performance
export const getCampaignsPerformance = async (filters = {}) => {
  try {
    const params = new URLSearchParams(filters);
    const response = await axios.get(
      `${API_URL}/marketing/analytics/campaigns?${params}`,
      {
        withCredentials: true
      }
    );
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

// Get channels performance
export const getChannelsPerformance = async () => {
  try {
    const response = await axios.get(
      `${API_URL}/marketing/analytics/channels`,
      {
        withCredentials: true
      }
    );
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

// Get ROI analysis
export const getROIAnalysis = async (startDate, endDate) => {
  try {
    const params = new URLSearchParams();
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);

    const response = await axios.get(
      `${API_URL}/marketing/analytics/roi?${params}`,
      {
        withCredentials: true
      }
    );
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

// Get AI insights
export const getInsights = async (startDate, endDate) => {
  try {
    const params = new URLSearchParams();
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);

    const response = await axios.get(
      `${API_URL}/marketing/analytics/insights?${params}`,
      {
        withCredentials: true
      }
    );
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

// Generate report
export const generateReport = async (startDate, endDate, periodType) => {
  try {
    const response = await axios.post(
      `${API_URL}/marketing/analytics/generate`,
      { startDate, endDate, periodType },
      {
        headers: { 'Content-Type': 'application/json' },
        withCredentials: true
      }
    );
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

// Export analytics
export const exportAnalytics = async (startDate, endDate, format = 'json') => {
  try {
    const response = await axios.post(
      `${API_URL}/marketing/analytics/export`,
      { startDate, endDate, format },
      {
        headers: { 'Content-Type': 'application/json' },
        withCredentials: true,
        responseType: format === 'csv' ? 'blob' : 'json'
      }
    );
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};



