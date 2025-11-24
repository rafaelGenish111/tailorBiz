import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { testimonialsAPI } from '../utils/api';
import { toast } from 'react-toastify';

export const useTestimonials = (filters = {}) => {
  return useQuery({
    queryKey: ['testimonials', filters],
    queryFn: () => testimonialsAPI.getAll(filters).then(res => res.data)
  });
};

export const useTestimonial = (id) => {
  return useQuery({
    queryKey: ['testimonial', id],
    queryFn: () => testimonialsAPI.getById(id).then(res => res.data),
    enabled: !!id
  });
};

export const useCreateTestimonial = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: testimonialsAPI.create,
    onSuccess: () => {
      queryClient.invalidateQueries(['testimonials']);
      toast.success('ההמלצה נוצרה בהצלחה');
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'שגיאה ביצירת ההמלצה');
    }
  });
};

export const useUpdateTestimonial = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }) => testimonialsAPI.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries(['testimonials']);
      toast.success('ההמלצה עודכנה בהצלחה');
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'שגיאה בעדכון ההמלצה');
    }
  });
};

export const useDeleteTestimonial = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: testimonialsAPI.delete,
    onSuccess: () => {
      queryClient.invalidateQueries(['testimonials']);
      toast.success('ההמלצה נמחקה בהצלחה');
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'שגיאה במחיקת ההמלצה');
    }
  });
};

export const useUpdateTestimonialStatus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, status }) => testimonialsAPI.updateStatus(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries(['testimonials']);
      toast.success('הסטטוס עודכן בהצלחה');
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'שגיאה בעדכון הסטטוס');
    }
  });
};

export const useReorderTestimonials = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: testimonialsAPI.reorder,
    onSuccess: () => {
      queryClient.invalidateQueries(['testimonials']);
      toast.success('סדר ההמלצות עודכן בהצלחה');
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'שגיאה בעדכון הסדר');
    }
  });
};

