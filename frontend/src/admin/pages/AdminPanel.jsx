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
        {/* Content Management */}
        <Route path="testimonials" element={<TestimonialsList />} />
        <Route path="blog" element={<Placeholder title="מאמרים" />} />
        <Route path="portfolio" element={<Placeholder title="תיק עבודות" />} />
        <Route path="products" element={<Placeholder title="מוצרים" />} />
        {/* Clients */}
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

