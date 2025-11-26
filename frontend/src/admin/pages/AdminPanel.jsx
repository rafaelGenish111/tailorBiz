import { Routes, Route, Navigate } from 'react-router-dom';
import AdminLayout from '../components/layout/AdminLayout';
import TestimonialsList from '../components/content/testimonials/TestimonialsList';
import ClientsList from '../components/content/clients/ClientsList';
import ClientCard from '../../components/clients/ClientCard/ClientCard';
import Dashboard from '../../pages/Dashboard';
import TodayAgenda from '../../pages/TodayAgenda';
import CalendarView from '../../pages/CalendarView';
import TaskBoard from '../../pages/TaskBoard';
import NotificationsCenter from '../../pages/NotificationsCenter';
import NurturingDashboard from '../../pages/NurturingDashboard';
import ActiveNurturing from '../../pages/ActiveNurturing';
import MarketingDashboard from '../../pages/admin/marketing/MarketingDashboard';
import CampaignsPage from '../../pages/admin/marketing/CampaignsPage';
import CampaignForm from '../../pages/admin/marketing/CampaignForm';
import { Box, Typography } from '@mui/material';

function Placeholder({ title }) {
  return (
    <Box>
      <Typography variant="h4">{title}</Typography>
      <Typography>עמוד זה בבנייה...</Typography>
    </Box>
  );
}

function AdminPanel() {
  return (
    <AdminLayout>
      <Routes>
        <Route index element={<Dashboard />} />
        {/* Tasks & Planner */}
        <Route path="today" element={<TodayAgenda />} />
        <Route path="calendar" element={<CalendarView />} />
        <Route path="tasks" element={<TaskBoard />} />
        <Route path="notifications" element={<NotificationsCenter />} />
        {/* Lead Nurturing */}
        <Route path="nurturing" element={<NurturingDashboard />} />
        <Route path="nurturing/active" element={<ActiveNurturing />} />
        {/* Marketing Hub */}
        <Route path="marketing" element={<MarketingDashboard />} />
        <Route path="marketing/campaigns" element={<CampaignsPage />} />
        <Route path="marketing/campaigns/new" element={<CampaignForm />} />
        <Route path="marketing/campaigns/:id/edit" element={<CampaignForm />} />
        <Route path="marketing/campaigns/:id" element={<Placeholder title="פרטי קמפיין" />} />
        <Route path="marketing/channels" element={<Placeholder title="ערוצי שיווק" />} />
        <Route path="marketing/automations" element={<Placeholder title="אוטומציות שיווק" />} />
        <Route path="marketing/analytics" element={<Placeholder title="אנליטיקה" />} />
        {/* Content Management */}
        <Route path="testimonials" element={<TestimonialsList />} />
        <Route path="blog" element={<Placeholder title="מאמרים" />} />
        <Route path="portfolio" element={<Placeholder title="תיק עבודות" />} />
        <Route path="products" element={<Placeholder title="מוצרים" />} />
        {/* Clients & Leads */}
        <Route path="leads" element={<ClientsList viewMode="leads" />} />
        <Route path="customers" element={<ClientsList viewMode="clients" />} />
        <Route path="clients" element={<ClientsList />} />
        <Route path="clients/:id" element={<ClientCard />} />
        {/* Settings */}
        <Route path="settings" element={<Placeholder title="הגדרות" />} />
        <Route path="*" element={<Navigate to="/admin" replace />} />
      </Routes>
    </AdminLayout>
  );
}

export default AdminPanel;

