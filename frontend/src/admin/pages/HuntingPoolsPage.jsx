import React from 'react';
import { Box, Tab, Tabs } from '@mui/material';
import HuntingPoolsPoolsTab from './HuntingPoolsPoolsTab';
import HuntingPoolsReferrersTab from './HuntingPoolsReferrersTab';

const HuntingPoolsPage = () => {
  const [tab, setTab] = React.useState(0);

  return (
    <Box sx={{ p: { xs: 1.5, md: 3 } }}>
      <Tabs
        value={tab}
        onChange={(e, v) => setTab(v)}
        variant="scrollable"
        scrollButtons="auto"
        sx={{ mb: 1.5 }}
      >
        <Tab label="Pools" />
        <Tab label="מפנים" />
      </Tabs>

      {tab === 0 ? <HuntingPoolsPoolsTab /> : <HuntingPoolsReferrersTab />}
    </Box>
  );
};

export default HuntingPoolsPage;
