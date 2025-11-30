import React, { useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  Button,
  Divider,
  Stack,
  CircularProgress
} from '@mui/material';
import {
  Upload as UploadIcon,
  CheckCircle as CheckCircleIcon
} from '@mui/icons-material';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { clientAPI } from '../../../../admin/utils/api';
import { toast } from 'react-toastify';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
const SERVER_BASE_URL = API_URL.replace(/\/api$/, '');

const resolveFileUrl = (url) => {
  if (!url) return null;
  if (url.startsWith('data:') || url.startsWith('http://') || url.startsWith('https://')) {
    return url;
  }
  return `${SERVER_BASE_URL}${url.startsWith('/') ? url : `/${url}`}`;
};

const ContractTab = ({ clientId, contract }) => {
  const queryClient = useQueryClient();
  const [file, setFile] = useState(null);
  const [notes, setNotes] = useState(contract?.notes || '');

  const uploadMutation = useMutation({
    mutationFn: async (formData) => {
      return clientAPI.uploadContract(clientId, formData).then((res) => res.data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['client', clientId]);
      queryClient.invalidateQueries(['clients']);
      toast.success('החוזה נשמר בהצלחה');
      setFile(null);
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'שגיאה בהעלאת החוזה');
    }
  });

  const handleUpload = () => {
    if (!file) return;

    const formData = new FormData();
    formData.append('contract', file);
    if (notes) {
      formData.append('notes', notes);
    }

    uploadMutation.mutate(formData);
  };

  const fileUrl = resolveFileUrl(contract?.fileUrl);

  return (
    <Box>
      <Paper sx={{ p: 3 }}>
        <Typography variant="h6" gutterBottom>
          חוזה
        </Typography>
        <Divider sx={{ mb: 2 }} />

        <Stack spacing={3}>
          <Box>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
              ניתן להעלות קובץ חוזה אחד (PDF). החוזה החדש יחליף את הקובץ הקיים ויוצג בתצוגה מקדימה.
            </Typography>
            <Button
              variant="outlined"
              component="label"
              startIcon={
                file || contract?.fileUrl ? (
                  <CheckCircleIcon color="success" />
                ) : (
                  <UploadIcon />
                )
              }
            >
              {file
                ? file.name
                : contract?.fileUrl
                ? 'החלף קובץ חוזה (PDF)'
                : 'העלה קובץ חוזה (PDF)'}
              <input
                type="file"
                hidden
                accept="application/pdf"
                onChange={(e) => {
                  if (e.target.files && e.target.files[0]) {
                    setFile(e.target.files[0]);
                  }
                }}
              />
            </Button>
          </Box>

          <Box>
            <Typography variant="caption" color="text.secondary">
              הערות לחוזה (אופציונלי)
            </Typography>
            <textarea
              style={{
                width: '100%',
                minHeight: 80,
                marginTop: 8,
                padding: 8,
                borderRadius: 4,
                border: '1px solid rgba(0,0,0,0.23)',
                fontFamily: 'inherit',
                fontSize: '0.875rem'
              }}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </Box>

          <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
            <Button
              variant="contained"
              onClick={handleUpload}
              disabled={uploadMutation.isPending || !file}
            >
              {uploadMutation.isPending ? (
                <CircularProgress size={20} />
              ) : contract?.fileUrl ? (
                'עדכן חוזה'
              ) : (
                'שמור חוזה'
              )}
            </Button>
          </Box>

          {fileUrl && (
            <Box sx={{ mt: 2 }}>
              <Typography variant="subtitle2" gutterBottom>
                תצוגה מקדימה של החוזה
              </Typography>
              <Box
                sx={{
                  border: '1px solid',
                  borderColor: 'divider',
                  borderRadius: 1,
                  overflow: 'hidden',
                  height: 500
                }}
              >
                <iframe
                  src={fileUrl}
                  title="תצוגת חוזה"
                  style={{ width: '100%', height: '100%', border: 'none' }}
                />
              </Box>
            </Box>
          )}
        </Stack>
      </Paper>
    </Box>
  );
};

export default ContractTab;


