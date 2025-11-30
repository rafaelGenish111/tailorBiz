import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { clientAPI, leadNurturingAPI } from '../utils/api';
import { toast } from 'react-toastify';

export const useClients = (filters) => {
  return useQuery({
    queryKey: ['clients', filters],
    queryFn: () => clientAPI.getAll(filters).then(res => res.data)
  });
};

export const useClient = (id) => {
  return useQuery({
    queryKey: ['client', id],
    queryFn: () => clientAPI.getById(id).then(res => res.data),
    enabled: !!id
  });
};

export const useCreateClient = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data) => clientAPI.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries(['clients']);
      toast.success('לקוח נוצר בהצלחה!');
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'שגיאה ביצירת הלקוח');
    }
  });
};

export const useUpdateClient = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }) => clientAPI.update(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries(['clients']);
      queryClient.invalidateQueries(['client', variables.id]);
      toast.success('לקוח עודכן בהצלחה!');
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'שגיאה בעדכון הלקוח');
    }
  });
};

export const useDeleteClient = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id) => clientAPI.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries(['clients']);
      toast.success('לקוח נמחק בהצלחה!');
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'שגיאה במחיקת הלקוח');
    }
  });
};

export const useConvertLead = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ clientId, data }) => clientAPI.convertLeadToClient(clientId, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries(['clients']);
      queryClient.invalidateQueries(['client', variables.clientId]);
      toast.success('הליד הומר ללקוח בהצלחה! 🥂');
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'שגיאה בהמרת הליד');
    }
  });
};

export const useClientInteractions = (clientId) => {
  return useQuery({
    queryKey: ['client-interactions', clientId],
    queryFn: () => clientAPI.getInteractions(clientId).then(res => res.data),
    enabled: !!clientId
  });
};

// Lead nurturing instances for a specific client
export const useClientNurturingInstances = (clientId) => {
  return useQuery({
    queryKey: ['client-nurturing', clientId],
    queryFn: () =>
      leadNurturingAPI
        .getActiveInstances({ clientId })
        .then((res) => res.data),
    enabled: !!clientId
  });
};

export const useAddInteraction = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ clientId, data }) => clientAPI.addInteraction(clientId, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries(['client-interactions', variables.clientId]);
      queryClient.invalidateQueries(['client', variables.clientId]);
      toast.success('אינטראקציה נוספה בהצלחה!');
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'שגיאה בהוספת אינטראקציה');
    }
  });
};

export const useUpdateInteraction = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ clientId, interactionId, data }) => 
      clientAPI.updateInteraction(clientId, interactionId, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries(['client-interactions', variables.clientId]);
      queryClient.invalidateQueries(['client', variables.clientId]);
      toast.success('אינטראקציה עודכנה בהצלחה!');
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'שגיאה בעדכון האינטראקציה');
    }
  });
};

export const useDeleteInteraction = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ clientId, interactionId }) => 
      clientAPI.deleteInteraction(clientId, interactionId),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries(['client-interactions', variables.clientId]);
      queryClient.invalidateQueries(['client', variables.clientId]);
      toast.success('אינטראקציה נמחקה בהצלחה!');
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'שגיאה במחיקת האינטראקציה');
    }
  });
};

export const useClientTasks = (clientId, filters) => {
  return useQuery({
    queryKey: ['client-tasks', clientId, filters],
    queryFn: () => clientAPI.getTasks(clientId, filters).then(res => res.data),
    enabled: !!clientId
  });
};

export const useCreateTask = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ clientId, data }) => clientAPI.createTask(clientId, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries(['client-tasks', variables.clientId]);
      queryClient.invalidateQueries(['client', variables.clientId]);
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
    mutationFn: ({ clientId, taskId, data }) => 
      clientAPI.updateTask(clientId, taskId, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries(['client-tasks', variables.clientId]);
      queryClient.invalidateQueries(['client', variables.clientId]);
      toast.success('משימה עודכנה בהצלחה!');
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'שגיאה בעדכון המשימה');
    }
  });
};

export const useClientStats = () => {
  return useQuery({
    queryKey: ['client-stats'],
    queryFn: () => clientAPI.getOverviewStats().then(res => res.data)
  });
};

export const usePipelineStats = () => {
  return useQuery({
    queryKey: ['pipeline-stats'],
    queryFn: () => clientAPI.getPipelineStats().then(res => res.data)
  });
};

// חוזה לקוח/ליד
export const useUploadContract = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }) => clientAPI.uploadContract(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries(['client', variables.id]);
      queryClient.invalidateQueries(['clients']);
      toast.success('החוזה עודכן בהצלחה!');
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'שגיאה בעדכון החוזה');
    }
  });
};


