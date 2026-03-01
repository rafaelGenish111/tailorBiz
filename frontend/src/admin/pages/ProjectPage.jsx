import React, { useState } from 'react';
import {
  Box, Typography, Button, Tabs, Tab, Chip, Card,
  CircularProgress, Alert, Divider,
} from '@mui/material';
import { ArrowBack as ArrowBackIcon } from '@mui/icons-material';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { projectsAPI } from '../utils/api';

import ProjectOverviewTab from '../components/projects/tabs/ProjectOverviewTab';
import ProjectProposalTab from '../components/projects/tabs/ProjectProposalTab';
import ProjectContractTab from '../components/projects/tabs/ProjectContractTab';
import ProjectPaymentsTab from '../components/projects/tabs/ProjectPaymentsTab';
import ProjectDocumentsTab from '../components/projects/tabs/ProjectDocumentsTab';
import ProjectProgressTab from '../components/projects/tabs/ProjectProgressTab';
import ProjectInteractionsTab from '../components/projects/tabs/ProjectInteractionsTab';
import ProjectInvoicesTab from '../components/projects/tabs/ProjectInvoicesTab';

const STAGE_LABELS = {
  lead: 'ליד',
  won: 'נסגר',
  lost: 'הפסד',
  active: 'פעיל',
  completed: 'הושלם',
  archived: 'בארכיון',
};

const STAGE_COLORS = {
  lead: 'info',
  won: 'success',
  lost: 'error',
  active: 'primary',
  completed: 'success',
  archived: 'default',
};

// Lead stages show limited tabs; won/active/completed stages show all 8
const LEAD_STAGES = ['lead', 'lost'];

const ProjectPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const tabFromUrl = searchParams.get('tab');
  const [activeTab, setActiveTab] = useState(tabFromUrl || 'overview');

  const { data: projectRes, isLoading, error } = useQuery({
    queryKey: ['project', id],
    queryFn: () => projectsAPI.getById(id).then((res) => res.data),
    enabled: !!id,
  });

  const project = projectRes?.data;
  const clientId = project?.clientId?._id || project?.clientId;
  const clientName = project?.clientId?.personalInfo?.fullName || project?.clientId?.businessInfo?.businessName;
  const isLeadProject = LEAD_STAGES.includes(project?.stage);

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error || !project) {
    return (
      <Alert severity="error" sx={{ m: 2 }}>
        {error?.response?.data?.message || 'פרויקט לא נמצא'}
      </Alert>
    );
  }

  // Define which tabs to show
  const allTabs = [
    { key: 'overview', label: 'סקירה' },
    { key: 'proposal', label: 'הצעה ודרישות' },
    { key: 'contract', label: 'חוזה' },
    { key: 'payments', label: 'תשלומים' },
    { key: 'documents', label: 'מסמכים' },
    { key: 'progress', label: 'התקדמות' },
    { key: 'interactions', label: 'אינטראקציות' },
    { key: 'invoices', label: 'חשבוניות' },
  ];

  const leadTabs = [
    { key: 'overview', label: 'סקירה' },
    { key: 'proposal', label: 'הצעה ודרישות' },
  ];

  const visibleTabs = isLeadProject ? leadTabs : allTabs;

  // If current tab is not visible, reset to overview
  const currentTab = visibleTabs.find((t) => t.key === activeTab) ? activeTab : 'overview';

  return (
    <Box sx={{ p: { xs: 2, md: 3 } }}>
      {/* Back button */}
      <Button
        startIcon={<ArrowBackIcon sx={{ transform: 'rotate(180deg)' }} />}
        onClick={() => navigate(clientId ? `/admin/clients/${clientId}?tab=projects` : -1)}
        sx={{ mb: 2, textTransform: 'none', fontWeight: 600 }}
      >
        {clientName ? `חזור ל${clientName}` : 'חזור ללקוח'}
      </Button>

      {/* Header */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1, flexWrap: 'wrap' }}>
        <Typography variant="h4">{project.name}</Typography>
        <Chip
          label={STAGE_LABELS[project.stage] || project.stage}
          color={STAGE_COLORS[project.stage] || 'default'}
          size="small"
        />
        {project.productType && (
          <Chip label={project.productType} size="small" variant="outlined" />
        )}
      </Box>

      {/* Financial summary bar */}
      <Box sx={{ display: 'flex', gap: 3, mb: 3, flexWrap: 'wrap' }}>
        <Typography variant="body2" color="text.secondary">
          שווי: <strong>₪{(project.financials?.totalValue ?? 0).toLocaleString()}</strong>
        </Typography>
        <Typography variant="body2" color="text.secondary">
          שולם: <strong style={{ color: '#2e7d32' }}>₪{(project.financials?.paidAmount ?? 0).toLocaleString()}</strong>
        </Typography>
        <Typography variant="body2" color="text.secondary">
          יתרה: <strong style={{ color: '#d32f2f' }}>₪{(project.financials?.balance ?? 0).toLocaleString()}</strong>
        </Typography>
      </Box>

      {/* Tabs */}
      <Card>
        <Tabs
          value={currentTab}
          onChange={(_, v) => setActiveTab(v)}
          variant="scrollable"
          scrollButtons="auto"
        >
          {visibleTabs.map((tab) => (
            <Tab key={tab.key} label={tab.label} value={tab.key} />
          ))}
        </Tabs>
        <Divider />
        <Box sx={{ p: 3 }}>
          {currentTab === 'overview' && (
            <ProjectOverviewTab project={project} projectId={id} />
          )}
          {currentTab === 'proposal' && (
            <ProjectProposalTab project={project} projectId={id} />
          )}
          {currentTab === 'contract' && (
            <ProjectContractTab project={project} projectId={id} />
          )}
          {currentTab === 'payments' && (
            <ProjectPaymentsTab project={project} projectId={id} />
          )}
          {currentTab === 'documents' && (
            <ProjectDocumentsTab project={project} projectId={id} />
          )}
          {currentTab === 'progress' && (
            <ProjectProgressTab project={project} projectId={id} />
          )}
          {currentTab === 'interactions' && (
            <ProjectInteractionsTab project={project} projectId={id} />
          )}
          {currentTab === 'invoices' && (
            <ProjectInvoicesTab project={project} projectId={id} />
          )}
        </Box>
      </Card>
    </Box>
  );
};

export default ProjectPage;
