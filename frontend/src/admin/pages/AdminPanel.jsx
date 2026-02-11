import { Routes, Route, Navigate } from 'react-router-dom';
import AdminLayout from '../components/layout/AdminLayout';
import ClientsList from '../components/content/clients/ClientsList';
import ClientCard from '../../components/clients/ClientCard/ClientCard';
import Dashboard from '../../pages/Dashboard';
import SiteSettingsPage from './SiteSettingsPage';
import EmployeesPage from './EmployeesPage';
import RequireModuleAccess from '../components/auth/RequireModuleAccess';
import AdminPathGuard from '../components/auth/AdminPathGuard';
import WhatsAppSetupPage from '../../pages/WhatsAppSetupPage';
import BulkWhatsAppPage from '../../pages/BulkWhatsAppPage';

function AdminPanel() {
  return (
    <AdminLayout>
      <AdminPathGuard>
        <Routes>
          <Route index element={<Dashboard />} />
          <Route path="leads" element={<RequireModuleAccess requiredModule="leads"><ClientsList viewMode="leads" /></RequireModuleAccess>} />
          <Route path="customers" element={<RequireModuleAccess requiredModule="clients"><ClientsList viewMode="clients" /></RequireModuleAccess>} />
          <Route path="clients" element={<RequireModuleAccess requiredModule="clients"><ClientsList /></RequireModuleAccess>} />
          <Route path="clients/:id" element={<RequireModuleAccess anyOfModules={['clients', 'leads']}><ClientCard /></RequireModuleAccess>} />
          <Route path="whatsapp-setup" element={<WhatsAppSetupPage />} />
          <Route path="whatsapp-broadcast" element={<RequireModuleAccess anyOfModules={['leads', 'clients']}><BulkWhatsAppPage /></RequireModuleAccess>} />
          <Route path="settings" element={<RequireModuleAccess requiredModule="settings"><SiteSettingsPage /></RequireModuleAccess>} />
          <Route path="employees" element={<RequireModuleAccess adminOnly><EmployeesPage /></RequireModuleAccess>} />
          <Route path="*" element={<Navigate to="/admin" replace />} />
        </Routes>
      </AdminPathGuard>
    </AdminLayout>
  );
}

export default AdminPanel;

