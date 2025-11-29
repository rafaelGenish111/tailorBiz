// frontend/src/admin/hooks/useTasks.js
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { tasksAPI, notificationsAPI } from '../utils/api';
import { toast } from 'react-toastify';

// ========== Tasks ==========

export const useTasks = (filters) => {
  return useQuery({
    queryKey: ['tasks', filters],
    queryFn: () => tasksAPI.getAll(filters).then(res => res.data)
  });
};

export const useTask = (id) => {
  return useQuery({
    queryKey: ['task', id],
    queryFn: () => tasksAPI.getById(id).then(res => res.data),
    enabled: !!id
  });
};

export const useCreateTask = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data) => tasksAPI.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries(['tasks']);
      queryClient.invalidateQueries(['today-agenda']);
      toast.success('משימה נוצרה בהצלחה!');
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'שגיאה ביצירת המשימה');
    }
  });
};

export const useUpdateTask = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }) => tasksAPI.update(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries(['tasks']);
      queryClient.invalidateQueries(['task', variables.id]);
      queryClient.invalidateQueries(['today-agenda']);
      queryClient.invalidateQueries(['task-stats']);
      toast.success('משימה עודכנה בהצלחה!');
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'שגיאה בעדכון המשימה');
    }
  });
};

export const useDeleteTask = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id) => tasksAPI.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries(['tasks']);
      queryClient.invalidateQueries(['today-agenda']);
      toast.success('משימה נמחקה בהצלחה!');
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'שגיאה במחיקת המשימה');
    }
  });
};

export const useTodayAgenda = () => {
  return useQuery({
    queryKey: ['today-agenda'],
    queryFn: () => tasksAPI.getTodayAgenda().then(res => res.data),
    refetchInterval: 60000 // רענן כל דקה
  });
};

export const useCalendarView = (year, month) => {
  return useQuery({
    queryKey: ['calendar-view', year, month],
    queryFn: () => tasksAPI.getCalendarView(year, month).then(res => res.data),
    enabled: !!(year && month)
  });
};

export const useTaskStats = () => {
  return useQuery({
    queryKey: ['task-stats'],
    queryFn: () => tasksAPI.getStats().then(res => res.data)
  });
};

// ========== Notifications ==========

export const useNotifications = (filters) => {
  return useQuery({
    queryKey: ['notifications', filters],
    queryFn: () => notificationsAPI.getAll(filters).then(res => res.data),
    refetchInterval: 30000 // רענן כל 30 שניות
  });
};

export const useMarkAsRead = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id) => notificationsAPI.markAsRead(id),
    onSuccess: () => {
      queryClient.invalidateQueries(['notifications']);
      queryClient.invalidateQueries(['today-agenda']);
    }
  });
};

export const useMarkAllAsRead = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => notificationsAPI.markAllAsRead(),
    onSuccess: () => {
      queryClient.invalidateQueries(['notifications']);
      queryClient.invalidateQueries(['today-agenda']);
      toast.success('כל ההתראות סומנו כנקראו');
    }
  });
};

export const useDeleteNotification = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id) => notificationsAPI.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries(['notifications']);
      queryClient.invalidateQueries(['today-agenda']);
    }
  });
};



