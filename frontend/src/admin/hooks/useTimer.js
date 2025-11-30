// frontend/src/admin/hooks/useTimer.js
import { useState, useEffect, useCallback, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';

// ב-Production (Vercel) נשתמש ב-/api, בלוקאל נגדיר VITE_API_URL=http://localhost:5000/api
const API_URL = import.meta.env.VITE_API_URL || '/api';

const timerApi = {
  getActive: () => axios.get(`${API_URL}/time-entries/active`).then(res => res.data),
  start: (clientId, data) => axios.post(`${API_URL}/time-entries/client/${clientId}/start`, data).then(res => res.data),
  stop: (entryId) => axios.put(`${API_URL}/time-entries/${entryId}/stop`).then(res => res.data),
  getClientEntries: (clientId, params) => axios.get(`${API_URL}/time-entries/client/${clientId}`, { params }).then(res => res.data),
  addManual: (clientId, data) => axios.post(`${API_URL}/time-entries/client/${clientId}/manual`, data).then(res => res.data),
  update: (entryId, data) => axios.put(`${API_URL}/time-entries/${entryId}`, data).then(res => res.data),
  delete: (entryId) => axios.delete(`${API_URL}/time-entries/${entryId}`).then(res => res.data),
};

// Hook לטיימר פעיל
export const useActiveTimer = () => {
  const queryClient = useQueryClient();
  const [elapsedTime, setElapsedTime] = useState(0);
  const intervalRef = useRef(null);

  const { data: activeTimer, isLoading, refetch } = useQuery({
    queryKey: ['activeTimer'],
    queryFn: timerApi.getActive,
    refetchInterval: 60000,
  });

  useEffect(() => {
    if (activeTimer?.data?.isRunning) {
      const startTime = new Date(activeTimer.data.startTime).getTime();
      
      const updateElapsed = () => {
        const now = Date.now();
        setElapsedTime(Math.floor((now - startTime) / 1000));
      };

      updateElapsed();
      intervalRef.current = setInterval(updateElapsed, 1000);

      return () => {
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
        }
      };
    } else {
      setElapsedTime(0);
    }
  }, [activeTimer]);

  const startMutation = useMutation({
    mutationFn: ({ clientId, data }) => timerApi.start(clientId, data),
    onSuccess: () => {
      queryClient.invalidateQueries(['activeTimer']);
    }
  });

  const stopMutation = useMutation({
    mutationFn: (entryId) => timerApi.stop(entryId),
    onSuccess: () => {
      queryClient.invalidateQueries(['activeTimer']);
      queryClient.invalidateQueries(['clientTimeEntries']);
    }
  });

  const startTimer = useCallback((clientId, taskType = 'general', description = '') => {
    return startMutation.mutateAsync({ clientId, data: { taskType, description } });
  }, [startMutation]);

  const stopTimer = useCallback(() => {
    if (activeTimer?.data?._id) {
      return stopMutation.mutateAsync(activeTimer.data._id);
    }
  }, [activeTimer, stopMutation]);

  return {
    activeTimer: activeTimer?.data || null,
    isLoading,
    elapsedTime,
    isRunning: activeTimer?.data?.isRunning || false,
    startTimer,
    stopTimer,
    isStarting: startMutation.isPending,
    isStopping: stopMutation.isPending,
    refetch
  };
};

// Hook לזמנים של לקוח ספציפי
export const useClientTimeEntries = (clientId, options = {}) => {
  const queryClient = useQueryClient();

  const { data, isLoading, error } = useQuery({
    queryKey: ['clientTimeEntries', clientId, options],
    queryFn: () => timerApi.getClientEntries(clientId, options),
    enabled: !!clientId,
  });

  const addManualMutation = useMutation({
    mutationFn: (entryData) => timerApi.addManual(clientId, entryData),
    onSuccess: () => {
      queryClient.invalidateQueries(['clientTimeEntries', clientId]);
    }
  });

  const deleteMutation = useMutation({
    mutationFn: (entryId) => timerApi.delete(entryId),
    onSuccess: () => {
      queryClient.invalidateQueries(['clientTimeEntries', clientId]);
    }
  });

  return {
    entries: data?.data?.entries || [],
    stats: data?.data?.stats || {},
    statsByTask: data?.data?.statsByTask || [],
    pagination: data?.data?.pagination || {},
    isLoading,
    error,
    addManualEntry: addManualMutation.mutateAsync,
    deleteEntry: deleteMutation.mutateAsync,
    isAdding: addManualMutation.isPending,
    isDeleting: deleteMutation.isPending
  };
};

// פונקציית עזר לפורמט זמן
export const formatDuration = (seconds) => {
  if (!seconds || seconds < 0) return '00:00:00';
  
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;

  return [hours, minutes, secs]
    .map(v => v.toString().padStart(2, '0'))
    .join(':');
};

// פורמט זמן קריא
export const formatDurationReadable = (seconds) => {
  if (!seconds || seconds < 0) return '0 דקות';
  
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);

  if (hours === 0) {
    return `${minutes} דקות`;
  }
  
  if (minutes === 0) {
    return `${hours} שעות`;
  }

  return `${hours} שעות ו-${minutes} דקות`;
};


