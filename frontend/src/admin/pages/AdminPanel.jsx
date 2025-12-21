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
import SalesPipelineBoard from '../../components/leads/SalesPipelineBoard';
import HuntingPoolsPage from './HuntingPoolsPage';
import { Box, Typography } from '@mui/material';
import RequireModuleAccess from '../components/auth/RequireModuleAccess';
import SalesTrainingPage from './SalesTrainingPage';
import AdminPathGuard from '../components/auth/AdminPathGuard';

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
      <AdminPathGuard>
        <Routes>
          <Route index element={<Dashboard />} />
          {/* Tasks & Planner */}
          <Route path="today" element={<RequireModuleAccess requiredModule="tasks_calendar"><TodayAgenda /></RequireModuleAccess>} />
          <Route path="calendar" element={<RequireModuleAccess requiredModule="tasks_calendar"><CalendarView /></RequireModuleAccess>} />
          <Route path="tasks/:id" element={<RequireModuleAccess requiredModule="tasks_calendar"><TaskBoard /></RequireModuleAccess>} />
          <Route path="tasks" element={<RequireModuleAccess requiredModule="tasks_calendar"><TaskBoard /></RequireModuleAccess>} />
          <Route path="gantt" element={<RequireModuleAccess requiredModule="tasks_calendar"><GanttView /></RequireModuleAccess>} />
          <Route path="projects" element={<RequireModuleAccess requiredModule="tasks_calendar"><Projects /></RequireModuleAccess>} />
          <Route path="notifications" element={<RequireModuleAccess requiredModule="tasks_calendar"><NotificationsCenter /></RequireModuleAccess>} />
          {/* Lead Nurturing */}
          <Route path="nurturing" element={<RequireModuleAccess requiredModule="marketing"><NurturingDashboard /></RequireModuleAccess>} />
          <Route path="nurturing/active" element={<RequireModuleAccess requiredModule="marketing"><ActiveNurturing /></RequireModuleAccess>} />
          {/* Marketing Hub */}
          <Route path="marketing" element={<RequireModuleAccess requiredModule="marketing"><MarketingDashboard /></RequireModuleAccess>} />
          <Route path="marketing/campaigns" element={<RequireModuleAccess requiredModule="marketing"><CampaignsPage /></RequireModuleAccess>} />
          <Route path="marketing/campaigns/new" element={<RequireModuleAccess requiredModule="marketing"><CampaignForm /></RequireModuleAccess>} />
          <Route path="marketing/campaigns/:id/edit" element={<RequireModuleAccess requiredModule="marketing"><CampaignForm /></RequireModuleAccess>} />
          <Route path="marketing/campaigns/:id" element={<RequireModuleAccess requiredModule="marketing"><Placeholder title="פרטי קמפיין" /></RequireModuleAccess>} />
          <Route path="marketing/channels" element={<RequireModuleAccess requiredModule="marketing"><ChannelsPage /></RequireModuleAccess>} />
          <Route path="marketing/automations" element={<RequireModuleAccess requiredModule="marketing"><AutomationsPage /></RequireModuleAccess>} />
          <Route path="marketing/analytics" element={<RequireModuleAccess requiredModule="marketing"><AnalyticsPage /></RequireModuleAccess>} />
          {/* Content Management */}
          <Route path="testimonials" element={<RequireModuleAccess requiredModule="cms"><TestimonialsList /></RequireModuleAccess>} />
          <Route path="cms/pages" element={<RequireModuleAccess requiredModule="cms"><SitePagesEditor /></RequireModuleAccess>} />
          <Route path="cms/articles" element={<RequireModuleAccess requiredModule="cms"><ArticlesManager /></RequireModuleAccess>} />
          <Route path="cms/articles/:id" element={<RequireModuleAccess requiredModule="cms"><ArticleEditor /></RequireModuleAccess>} />
          <Route path="cms/clients" element={<RequireModuleAccess requiredModule="cms"><ClientsManager /></RequireModuleAccess>} />
          <Route path="blog" element={<Navigate to="/admin/cms/articles" replace />} />
          <Route path="portfolio" element={<RequireModuleAccess requiredModule="cms"><Placeholder title="תיק עבודות" /></RequireModuleAccess>} />
          <Route path="products" element={<RequireModuleAccess requiredModule="cms"><Placeholder title="מוצרים" /></RequireModuleAccess>} />
          {/* Clients & Leads */}
          <Route path="leads" element={<RequireModuleAccess requiredModule="leads"><ClientsList viewMode="leads" /></RequireModuleAccess>} />
          <Route path="customers" element={<RequireModuleAccess requiredModule="clients"><ClientsList viewMode="clients" /></RequireModuleAccess>} />
          {/* Combined view (clients+leads) should be clients-only to avoid lead-only employees seeing customers */}
          <Route path="clients" element={<RequireModuleAccess requiredModule="clients"><ClientsList /></RequireModuleAccess>} />
          <Route path="clients/:id" element={<RequireModuleAccess anyOfModules={['clients', 'leads']}><ClientCard /></RequireModuleAccess>} />
          <Route path="pipeline" element={<RequireModuleAccess anyOfModules={['leads', 'clients']}><SalesPipelineBoard /></RequireModuleAccess>} />
          <Route path="hunting-pools" element={<RequireModuleAccess anyOfModules={['leads', 'clients']}><HuntingPoolsPage /></RequireModuleAccess>} />
          {/* Settings */}
          <Route path="settings" element={<RequireModuleAccess requiredModule="settings"><SiteSettingsPage /></RequireModuleAccess>} />
          <Route path="employees" element={<RequireModuleAccess adminOnly><EmployeesPage /></RequireModuleAccess>} />

          {/* Sales training (employee portal content) */}
          <Route path="sales-training" element={<SalesTrainingPage />} />
          <Route path="*" element={<Navigate to="/admin" replace />} />
        </Routes>
      </AdminPathGuard>
    </AdminLayout>
  );
}

export default AdminPanel;

