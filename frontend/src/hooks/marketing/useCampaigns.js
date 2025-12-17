import { useState, useEffect, useCallback } from 'react';
import * as campaignService from '../../services/marketing/campaignService';

export const useCampaigns = (filters = {}) => {
  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchCampaigns = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await campaignService.getCampaigns(filters);
      setCampaigns(response.data || []);
    } catch (err) {
      setError(err.message || 'שגיאה בטעינת קמפיינים');
      console.error('Error fetching campaigns:', err);
    } finally {
      setLoading(false);
    }
  }, [JSON.stringify(filters)]);

  useEffect(() => {
    fetchCampaigns();
  }, [fetchCampaigns]);

  const createCampaign = async (campaignData) => {
    try {
      const response = await campaignService.createCampaign(campaignData);
      setCampaigns(prev => [...prev, response.data]);
      return response;
    } catch (err) {
      throw err;
    }
  };

  const updateCampaign = async (id, campaignData) => {
    try {
      const response = await campaignService.updateCampaign(id, campaignData);
      setCampaigns(prev => 
        prev.map(c => c._id === id ? response.data : c)
      );
      return response;
    } catch (err) {
      throw err;
    }
  };

  const deleteCampaign = async (id) => {
    try {
      await campaignService.deleteCampaign(id);
      setCampaigns(prev => prev.filter(c => c._id !== id));
    } catch (err) {
      throw err;
    }
  };

  const activateCampaign = async (id) => {
    try {
      const response = await campaignService.activateCampaign(id);
      setCampaigns(prev => 
        prev.map(c => c._id === id ? response.data : c)
      );
      return response;
    } catch (err) {
      throw err;
    }
  };

  const pauseCampaign = async (id) => {
    try {
      const response = await campaignService.pauseCampaign(id);
      setCampaigns(prev => 
        prev.map(c => c._id === id ? response.data : c)
      );
      return response;
    } catch (err) {
      throw err;
    }
  };

  const duplicateCampaign = async (id) => {
    try {
      const response = await campaignService.duplicateCampaign(id);
      setCampaigns(prev => [...prev, response.data]);
      return response;
    } catch (err) {
      throw err;
    }
  };

  const refresh = () => {
    fetchCampaigns();
  };

  return {
    campaigns,
    loading,
    error,
    createCampaign,
    updateCampaign,
    deleteCampaign,
    activateCampaign,
    pauseCampaign,
    duplicateCampaign,
    refresh
  };
};

export const useCampaign = (id) => {
  const [campaign, setCampaign] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchCampaign = async () => {
      if (!id) return;
      
      try {
        setLoading(true);
        setError(null);
        const response = await campaignService.getCampaign(id);
        setCampaign(response.data);
      } catch (err) {
        setError(err.message || 'שגיאה בטעינת קמפיין');
        console.error('Error fetching campaign:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchCampaign();
  }, [id]);

  return { campaign, loading, error };
};

export const useUpcomingCampaigns = (days = 30) => {
  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchUpcoming = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await campaignService.getUpcomingCampaigns(days);
        setCampaigns(response.data || []);
      } catch (err) {
        setError(err.message || 'שגיאה בטעינת קמפיינים קרובים');
        console.error('Error fetching upcoming campaigns:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchUpcoming();
  }, [days]);

  return { campaigns, loading, error };
};











