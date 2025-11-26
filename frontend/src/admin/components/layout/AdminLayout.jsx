import { Box, Toolbar } from '@mui/material';
import AdminHeader from './AdminHeader';
import Sidebar from './Sidebar';
import QuickAddFAB from '../../../components/common/QuickAddFAB';

function AdminLayout({ children }) {
  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: 'background.default' }}>
      {/* Header - Fixed at top */}
      <AdminHeader />

      {/* Sidebar - Fixed at left (rtl: right), pushed down by header */}
      <Sidebar />

      {/* Main Content */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          display: 'flex',
          flexDirection: 'column',
          minHeight: '100vh',
          overflow: 'auto',
          width: '100%', // Ensure it takes remaining width
        }}
      >
        {/* Spacer for fixed header */}
        <Toolbar />

        <Box 
          sx={{ 
            flex: 1,
            p: 4,
            width: '100%'
          }}
        >
          {children}
        </Box>
      </Box>

      {/* Quick Add FAB */}
      <QuickAddFAB />
    </Box>
  );
}

export default AdminLayout;
