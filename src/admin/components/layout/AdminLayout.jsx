import { Box, Container } from '@mui/material';
import AdminHeader from './AdminHeader';
import Sidebar from './Sidebar';

function AdminLayout({ children }) {
  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: 'grey.50' }}>
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content */}
      <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        {/* Header */}
        <AdminHeader />

        {/* Page Content */}
        <Container maxWidth="xl" sx={{ mt: 4, mb: 4, flex: 1 }}>
          {children}
        </Container>
      </Box>
    </Box>
  );
}

export default AdminLayout;




