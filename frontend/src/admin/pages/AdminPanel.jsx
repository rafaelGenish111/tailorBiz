import { Routes, Route, Navigate } from 'react-router-dom';
import AdminLayout from '../components/layout/AdminLayout';
import TestimonialsList from '../components/content/testimonials/TestimonialsList';
import ClientsList from '../components/content/clients/ClientsList';
import ClientCard from '../../components/clients/ClientCard/ClientCard';
import Dashboard from '../../pages/Dashboard';
import TodayAgenda from '../../pages/TodayAgenda';
import CalendarView from '../../pages/CalendarView';
import TaskBoard from '../../pages/TaskBoard';
import Projects from '../../pages/admin/Projects';
import GanttView from '../../pages/GanttView';
import NotificationsCenter from '../../pages/NotificationsCenter';
import NurturingDashboard from '../../pages/NurturingDashboard';
import ActiveNurturing from '../../pages/ActiveNurturing';
import MarketingDashboard from '../../pages/admin/marketing/MarketingDashboard';
import CampaignsPage from '../../pages/admin/marketing/CampaignsPage';
import CampaignForm from '../../pages/admin/marketing/CampaignForm';
import ChannelsPage from '../../pages/admin/marketing/ChannelsPage';
import AnalyticsPage from '../../pages/admin/marketing/AnalyticsPage';
import AutomationsPage from '../../pages/admin/marketing/AutomationsPage';
import SitePagesEditor from '../../pages/admin/cms/SitePagesEditor';
import ArticlesManager from '../../pages/admin/cms/ArticlesManager';
import ArticleEditor from '../../pages/admin/cms/ArticleEditor';
import ClientsManager from '../../pages/admin/cms/ClientsManager';
import SiteSettingsPage from './SiteSettingsPage';
import EmployeesPage from './EmployeesPage';
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
        <Route path="tasks/:id" element={<TaskBoard />} />
        <Route path="tasks" element={<TaskBoard />} />
        <Route path="gantt" element={<GanttView />} />
        <Route path="projects" element={<Projects />} />
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
        <Route path="marketing/channels" element={<ChannelsPage />} />
        <Route path="marketing/automations" element={<AutomationsPage />} />
        <Route path="marketing/analytics" element={<AnalyticsPage />} />
        {/* Content Management */}
        <Route path="testimonials" element={<TestimonialsList />} />
        <Route path="cms/pages" element={<SitePagesEditor />} />
        <Route path="cms/articles" element={<ArticlesManager />} />
        <Route path="cms/articles/:id" element={<ArticleEditor />} />
        <Route path="cms/clients" element={<ClientsManager />} />
        <Route path="blog" element={<Navigate to="/admin/cms/articles" replace />} />
        <Route path="portfolio" element={<Placeholder title="תיק עבודות" />} />
        <Route path="products" element={<Placeholder title="מוצרים" />} />
        {/* Clients & Leads */}
        <Route path="leads" element={<ClientsList viewMode="leads" />} />
        <Route path="customers" element={<ClientsList viewMode="clients" />} />
        <Route path="clients" element={<ClientsList />} />
        <Route path="clients/:id" element={<ClientCard />} />
        {/* Settings */}
        <Route path="settings" element={<SiteSettingsPage />} />
        <Route path="employees" element={<EmployeesPage />} />
        <Route path="*" element={<Navigate to="/admin" replace />} />
      </Routes>
    </AdminLayout>
  );
}

export default AdminPanel;

