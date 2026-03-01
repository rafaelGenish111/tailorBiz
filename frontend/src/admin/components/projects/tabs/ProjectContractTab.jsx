import React, { useState } from 'react';
import {
  Box, Paper, Typography, Button, Divider, Stack, CircularProgress, Chip
} from '@mui/material';
import {
  Upload as UploadIcon,
  CheckCircle as CheckCircleIcon
} from '@mui/icons-material';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { projectsAPI } from '../../../utils/api';
import { toast } from 'react-toastify';

const API_URL = import.meta.env.VITE_API_URL || '/api';
const SERVER_BASE_URL = API_URL.replace(/\/api$/, '');

const resolveFileUrl = (url) => {
  if (!url || url.includes('undefined') || url.includes('null')) return null;
  if (url.startsWith('data:') || url.startsWith('http://') || url.startsWith('https://')) return url;
  return `${SERVER_BASE_URL}${url.startsWith('/') ? url : `/${url}`}`;
};

const ProjectContractTab = ({ project, projectId }) => {
  const queryClient = useQueryClient();
  const contract = project?.contract;
  const [file, setFile] = useState(null);
  const [notes, setNotes] = useState(contract?.notes || '');

  const updateMutation = useMutation({
    mutationFn: (data) => projectsAPI.updateContract(projectId, data),
    onSuccess: () => {
      queryClient.invalidateQueries(['project', projectId]);
      toast.success('החוזה נשמר');
      setFile(null);
    },
    onError: (err) => toast.error(err?.response?.data?.message || 'שגיאה בשמירת חוזה'),
  });

  const handleSave = () => {
    updateMutation.mutate({
      signed: true,
      signedAt: new Date().toISOString(),
      notes,
    });
  };

  const fileUrl = resolveFileUrl(contract?.fileUrl);

  return (
    <Box>
      <Paper sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h6">חוזה</Typography>
          {contract?.signed && (
            <Chip icon={<CheckCircleIcon />} label="חתום" color="success" size="small" />
          )}
        </Box>
        <Divider sx={{ mb: 2 }} />

        <Stack spacing={3}>
          {contract?.signedAt && (
            <Typography variant="body2" color="text.secondary">
              נחתם בתאריך: {new Date(contract.signedAt).toLocaleDateString('he-IL')}
            </Typography>
          )}

          <Box>
            <Typography variant="caption" color="text.secondary">
              הערות לחוזה
            </Typography>
            <textarea
              style={{
                width: '100%', minHeight: 80, marginTop: 8, padding: 8,
                borderRadius: 4, border: '1px solid rgba(0,0,0,0.23)',
                fontFamily: 'inherit', fontSize: '0.875rem'
              }}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </Box>

          <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
            <Button
              variant="contained"
              onClick={handleSave}
              disabled={updateMutation.isPending}
            >
              {updateMutation.isPending ? <CircularProgress size={20} /> : 'שמור חוזה'}
            </Button>
          </Box>

          {fileUrl && (
            <Box sx={{ mt: 2 }}>
              <Typography variant="subtitle2" gutterBottom>תצוגה מקדימה</Typography>
              <Box sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 1, overflow: 'hidden', height: 500 }}>
                <iframe src={fileUrl} title="תצוגת חוזה" style={{ width: '100%', height: '100%', border: 'none' }} />
              </Box>
            </Box>
          )}
        </Stack>
      </Paper>
    </Box>
  );
};

export default ProjectContractTab;
