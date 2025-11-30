// frontend/src/components/common/QuickAddFAB.jsx
import React, { useState } from 'react';
import {
  Fab,
  SpeedDial,
  SpeedDialAction,
  SpeedDialIcon
} from '@mui/material';
import {
  PersonAdd as PersonAddIcon,
  WhatsApp as WhatsAppIcon,
  Phone as PhoneIcon,
  Web as WebIcon,
  LinkedIn as LinkedInIcon
} from '@mui/icons-material';
import QuickAddLead from '../leads/QuickAddLead';

const QuickAddFAB = () => {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [preSelectedSource, setPreSelectedSource] = useState('whatsapp');

  const actions = [
    { 
      icon: <WhatsAppIcon />, 
      name: 'WhatsApp',
      source: 'whatsapp',
      color: '#25D366'
    },
    { 
      icon: <PhoneIcon />, 
      name: 'טלפון',
      source: 'phone',
      color: '#2196f3'
    },
    { 
      icon: <WebIcon />, 
      name: 'טופס אתר',
      source: 'website_form',
      color: '#9c27b0'
    },
    { 
      icon: <LinkedInIcon />, 
      name: 'LinkedIn',
      source: 'linkedin',
      color: '#0077b5'
    }
  ];

  const handleActionClick = (source) => {
    setPreSelectedSource(source);
    setDialogOpen(true);
  };

  return (
    <>
      <SpeedDial
        ariaLabel="הוספת ליד מהירה"
        sx={{
          position: 'fixed',
          bottom: 24,
          left: 24,
          '& .MuiFab-primary': {
            width: 64,
            height: 64
          }
        }}
        icon={<SpeedDialIcon icon={<PersonAddIcon />} />}
      >
        {actions.map((action) => (
          <SpeedDialAction
            key={action.name}
            icon={action.icon}
            tooltipTitle={action.name}
            onClick={() => handleActionClick(action.source)}
            sx={{
              bgcolor: action.color,
              color: 'white',
              '&:hover': {
                bgcolor: action.color,
                opacity: 0.9
              }
            }}
          />
        ))}
      </SpeedDial>

      <QuickAddLead
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        preSelectedSource={preSelectedSource}
      />
    </>
  );
};

export default QuickAddFAB;




