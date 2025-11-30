import axios from 'axios';

// ב-Production (Vercel) נשתמש ב-/api, בלוקאל נגדיר VITE_API_URL=http://localhost:5000/api
const API_URL = import.meta.env.VITE_API_URL || '/api';

// Get all campaigns
export const getCampaigns = async (filters = {}) => {
  try {
    const params = new URLSearchParams(filters);
    const response = await axios.get(`${API_URL}/marketing/campaigns?${params}`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`
      }
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

// Get single campaign
export const getCampaign = async (id) => {
  try {
    const response = await axios.get(`${API_URL}/marketing/campaigns/${id}`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`
      }
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

// Create campaign
export const createCampaign = async (campaignData) => {
  try {
    const response = await axios.post(
      `${API_URL}/marketing/campaigns`,
      campaignData,
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        }
      }
    );
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

// Update campaign
export const updateCampaign = async (id, campaignData) => {
  try {
    const response = await axios.put(
      `${API_URL}/marketing/campaigns/${id}`,
      campaignData,
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        }
      }
    );
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

// Delete campaign
export const deleteCampaign = async (id) => {
  try {
    const response = await axios.delete(`${API_URL}/marketing/campaigns/${id}`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`
      }
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

// Activate campaign
export const activateCampaign = async (id) => {
  try {
    const response = await axios.post(
      `${API_URL}/marketing/campaigns/${id}/activate`,
      {},
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      }
    );
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

// Pause campaign
export const pauseCampaign = async (id) => {
  try {
    const response = await axios.post(
      `${API_URL}/marketing/campaigns/${id}/pause`,
      {},
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      }
    );
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

// Get campaign analytics
export const getCampaignAnalytics = async (id) => {
  try {
    const response = await axios.get(
      `${API_URL}/marketing/campaigns/${id}/analytics`,
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      }
    );
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

// Duplicate campaign
export const duplicateCampaign = async (id) => {
  try {
    const response = await axios.post(
      `${API_URL}/marketing/campaigns/${id}/duplicate`,
      {},
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      }
    );
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

// Get upcoming campaigns
export const getUpcomingCampaigns = async (days = 30) => {
  try {
    const response = await axios.get(
      `${API_URL}/marketing/campaigns/upcoming?days=${days}`,
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      }
    );
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};



