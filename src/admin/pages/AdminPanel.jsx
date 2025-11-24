import { Routes, Route, Navigate } from 'react-router-dom';
import AdminLayout from '../components/layout/AdminLayout';
import TestimonialsList from '../components/content/testimonials/TestimonialsList';
import { Box, Typography } from '@mui/material';

// Placeholder components
function Dashboard() {
  return (
    <Box>
      <Typography variant="h4">דשבורד</Typography>
      <Typography>ברוכים הבאים לאזור הניהול</Typography>
    </Box>
  );
}

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
        <Route path="testimonials" element={<TestimonialsList />} />
        <Route path="blog" element={<Placeholder title="מאמרים" />} />
        <Route path="portfolio" element={<Placeholder title="תיק עבודות" />} />
        <Route path="products" element={<Placeholder title="מוצרים" />} />
        <Route path="clients" element={<Placeholder title="לקוחות" />} />
        <Route path="settings" element={<Placeholder title="הגדרות" />} />
        <Route path="*" element={<Navigate to="/admin" replace />} />
      </Routes>
    </AdminLayout>
  );
}

export default AdminPanel;




