import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-toastify';
import { adminPagesAPI, adminArticlesAPI, adminSiteClientsAPI, uploadsAPI } from '../utils/api';

// Pages (home/about)
export const useAdminPage = (slug) =>
  useQuery({
    queryKey: ['admin-page', slug],
    queryFn: () => adminPagesAPI.getBySlug(slug).then((r) => r.data),
    enabled: Boolean(slug)
  });

export const useSaveAdminPageDraft = (slug) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data) => adminPagesAPI.saveDraft(slug, data),
    onSuccess: () => {
      qc.invalidateQueries(['admin-page', slug]);
      toast.success('טיוטה נשמרה');
    },
    onError: (e) => toast.error(e.response?.data?.message || 'שגיאה בשמירת טיוטה')
  });
};

export const usePublishAdminPage = (slug) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => adminPagesAPI.publish(slug),
    onSuccess: () => {
      qc.invalidateQueries(['admin-page', slug]);
      toast.success('הדף פורסם');
    },
    onError: (e) => toast.error(e.response?.data?.message || 'שגיאה בפרסום דף')
  });
};

export const useRollbackAdminPage = (slug) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (versionIndex) => adminPagesAPI.rollback(slug, versionIndex),
    onSuccess: () => {
      qc.invalidateQueries(['admin-page', slug]);
      toast.success('שוחזר לגרסה קודמת');
    },
    onError: (e) => toast.error(e.response?.data?.message || 'שגיאה בשחזור גרסה')
  });
};

// Articles
export const useAdminArticles = (filters) =>
  useQuery({
    queryKey: ['admin-articles', filters],
    queryFn: () => adminArticlesAPI.list(filters).then((r) => r.data)
  });

export const useAdminArticle = (id) =>
  useQuery({
    queryKey: ['admin-article', id],
    queryFn: () => adminArticlesAPI.getById(id).then((r) => r.data),
    enabled: Boolean(id)
  });

export const useCreateAdminArticle = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data) => adminArticlesAPI.create(data),
    onSuccess: () => {
      qc.invalidateQueries(['admin-articles']);
      toast.success('מאמר נוצר');
    },
    onError: (e) => toast.error(e.response?.data?.message || 'שגיאה ביצירת מאמר')
  });
};

export const useUpdateAdminArticle = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }) => adminArticlesAPI.update(id, data),
    onSuccess: (_, vars) => {
      qc.invalidateQueries(['admin-articles']);
      qc.invalidateQueries(['admin-article', vars.id]);
      toast.success('מאמר עודכן');
    },
    onError: (e) => toast.error(e.response?.data?.message || 'שגיאה בעדכון מאמר')
  });
};

export const usePublishAdminArticle = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id) => adminArticlesAPI.publish(id),
    onSuccess: (_, id) => {
      qc.invalidateQueries(['admin-articles']);
      qc.invalidateQueries(['admin-article', id]);
      toast.success('מאמר פורסם');
    },
    onError: (e) => toast.error(e.response?.data?.message || 'שגיאה בפרסום מאמר')
  });
};

export const useDeleteAdminArticle = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id) => adminArticlesAPI.delete(id),
    onSuccess: () => {
      qc.invalidateQueries(['admin-articles']);
      toast.success('מאמר נמחק');
    },
    onError: (e) => toast.error(e.response?.data?.message || 'שגיאה במחיקת מאמר')
  });
};

// Clients (logos)
export const useAdminSiteClients = () =>
  useQuery({
    queryKey: ['admin-site-clients'],
    queryFn: () => adminSiteClientsAPI.list().then((r) => r.data)
  });

export const useCreateAdminSiteClient = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data) => adminSiteClientsAPI.create(data),
    onSuccess: () => {
      qc.invalidateQueries(['admin-site-clients']);
      toast.success('לקוח נוסף');
    },
    onError: (e) => toast.error(e.response?.data?.message || 'שגיאה ביצירת לקוח')
  });
};

export const useUpdateAdminSiteClient = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }) => adminSiteClientsAPI.update(id, data),
    onSuccess: () => {
      qc.invalidateQueries(['admin-site-clients']);
      toast.success('לקוח עודכן');
    },
    onError: (e) => toast.error(e.response?.data?.message || 'שגיאה בעדכון לקוח')
  });
};

export const useDeleteAdminSiteClient = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id) => adminSiteClientsAPI.delete(id),
    onSuccess: () => {
      qc.invalidateQueries(['admin-site-clients']);
      toast.success('לקוח נמחק');
    },
    onError: (e) => toast.error(e.response?.data?.message || 'שגיאה במחיקת לקוח')
  });
};

// Uploads
export const useUploadImage = () =>
  useMutation({
    mutationFn: (formData) => uploadsAPI.uploadImage(formData),
    onError: (e) => toast.error(e.response?.data?.message || 'שגיאה בהעלאת תמונה')
  });

