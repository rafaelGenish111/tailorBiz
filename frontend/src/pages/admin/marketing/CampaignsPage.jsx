import React, { useState } from 'react';
import {
  Container,
  Box,
  Typography,
  Button,
  Grid,
  TextField,
  InputAdornment,
  ToggleButton,
  ToggleButtonGroup,
  Menu,
  MenuItem,
  IconButton,
  Alert
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import SearchIcon from '@mui/icons-material/Search';
import ViewModuleIcon from '@mui/icons-material/ViewModule';
import ViewListIcon from '@mui/icons-material/ViewList';
import AddIcon from '@mui/icons-material/Add';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import PauseIcon from '@mui/icons-material/Pause';

import { useCampaigns } from '../../../hooks/marketing/useCampaigns';
import CampaignCard from '../../../components/marketing/campaigns/CampaignCard';
import LoadingSpinner from '../../../components/marketing/shared/LoadingSpinner';
import * as campaignService from '../../../services/marketing/campaignService';

const CampaignsPage = () => {
  const navigate = useNavigate();
  const [view, setView] = useState('grid');
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedCampaign, setSelectedCampaign] = useState(null);
  const [error, setError] = useState(null);

  const { campaigns, loading, deleteCampaign, activateCampaign, pauseCampaign, duplicateCampaign } = useCampaigns({
    status: statusFilter !== 'all' ? statusFilter : undefined,
    search
  });

  const handleMenuClick = (event, campaign) => {
    setAnchorEl(event.currentTarget);
    setSelectedCampaign(campaign);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedCampaign(null);
  };

  const handleEdit = () => {
    if (selectedCampaign) {
      navigate(`/admin/marketing/campaigns/${selectedCampaign._id}/edit`);
    }
    handleMenuClose();
  };

  const handleDelete = async () => {
    if (selectedCampaign) {
      if (window.confirm('האם אתה בטוח שברצונך למחוק את הקמפיין?')) {
        try {
          await deleteCampaign(selectedCampaign._id);
        } catch (err) {
          setError(err.message || 'שגיאה במחיקת הקמפיין');
        }
      }
    }
    handleMenuClose();
  };

  const handleDuplicate = async () => {
    if (selectedCampaign) {
      try {
        await duplicateCampaign(selectedCampaign._id);
      } catch (err) {
        setError(err.message || 'שגיאה בשכפול הקמפיין');
      }
    }
    handleMenuClose();
  };

  const handleActivate = async () => {
    if (selectedCampaign) {
      try {
        await activateCampaign(selectedCampaign._id);
      } catch (err) {
        setError(err.message || 'שגיאה בהפעלת הקמפיין');
      }
    }
    handleMenuClose();
  };

  const handlePause = async () => {
    if (selectedCampaign) {
      try {
        await pauseCampaign(selectedCampaign._id);
      } catch (err) {
        setError(err.message || 'שגיאה בהשהיית הקמפיין');
      }
    }
    handleMenuClose();
  };

  if (loading) {
    return <LoadingSpinner message="טוען קמפיינים..." />;
  }

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      {/* Header */}
      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
        <Box>
          <Typography variant="h4" fontWeight={700} gutterBottom>
            קמפיינים
          </Typography>
          <Typography variant="body2" color="text.secondary">
            ניהול כל הקמפיינים השיווקיים
          </Typography>
        </Box>
        <Button
          variant="contained"
          size="large"
          startIcon={<AddIcon />}
          onClick={() => navigate('/admin/marketing/campaigns/new')}
        >
          קמפיין חדש
        </Button>
      </Box>

      {/* Error Alert */}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {/* Filters and View Toggle */}
      <Box sx={{ mb: 3, display: 'flex', gap: 2, flexWrap: 'wrap', alignItems: 'center' }}>
        <TextField
          placeholder="חפש קמפיינים..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            )
          }}
          sx={{ flexGrow: 1, minWidth: 200 }}
        />

        <ToggleButtonGroup
          value={statusFilter}
          exclusive
          onChange={(e, newValue) => newValue && setStatusFilter(newValue)}
          size="small"
        >
          <ToggleButton value="all">הכל</ToggleButton>
          <ToggleButton value="planning">תכנון</ToggleButton>
          <ToggleButton value="active">פעיל</ToggleButton>
          <ToggleButton value="paused">מושהה</ToggleButton>
          <ToggleButton value="completed">הושלם</ToggleButton>
        </ToggleButtonGroup>

        <ToggleButtonGroup
          value={view}
          exclusive
          onChange={(e, newValue) => newValue && setView(newValue)}
          size="small"
        >
          <ToggleButton value="grid">
            <ViewModuleIcon />
          </ToggleButton>
          <ToggleButton value="list">
            <ViewListIcon />
          </ToggleButton>
        </ToggleButtonGroup>
      </Box>

      {/* Campaigns List/Grid */}
      {campaigns.length === 0 ? (
        <Box sx={{ textAlign: 'center', py: 8 }}>
          <Typography variant="h6" color="text.secondary" gutterBottom>
            אין קמפיינים
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            {search || statusFilter !== 'all' 
              ? 'לא נמצאו קמפיינים התואמים לחיפוש' 
              : 'צור קמפיין חדש כדי להתחיל'}
          </Typography>
          {!search && statusFilter === 'all' && (
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => navigate('/admin/marketing/campaigns/new')}
            >
              צור קמפיין ראשון
            </Button>
          )}
        </Box>
      ) : (
        <Grid container spacing={3}>
          {campaigns.map((campaign, index) => (
            <Grid item xs={12} key={campaign._id} md={view === 'grid' ? 6 : 12} lg={view === 'grid' ? 4 : 12}>
              <CampaignCard
                campaign={campaign}
                index={index}
                view={view}
                onMenuClick={handleMenuClick}
                onClick={() => navigate(`/admin/marketing/campaigns/${campaign._id}`)}
              />
            </Grid>
          ))}
        </Grid>
      )}

      {/* Context Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
      >
        <MenuItem onClick={handleEdit}>
          <EditIcon sx={{ mr: 1, fontSize: 20 }} />
          ערוך
        </MenuItem>
        {selectedCampaign?.status === 'planning' && (
          <MenuItem onClick={handleActivate}>
            <PlayArrowIcon sx={{ mr: 1, fontSize: 20 }} />
            הפעל
          </MenuItem>
        )}
        {selectedCampaign?.status === 'active' && (
          <MenuItem onClick={handlePause}>
            <PauseIcon sx={{ mr: 1, fontSize: 20 }} />
            השה
          </MenuItem>
        )}
        <MenuItem onClick={handleDuplicate}>
          <ContentCopyIcon sx={{ mr: 1, fontSize: 20 }} />
          שכפל
        </MenuItem>
        <MenuItem onClick={handleDelete} sx={{ color: 'error.main' }}>
          <DeleteIcon sx={{ mr: 1, fontSize: 20 }} />
          מחק
        </MenuItem>
      </Menu>
    </Container>
  );
};

export default CampaignsPage;



