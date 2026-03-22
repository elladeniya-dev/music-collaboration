import React from 'react';
import { Dialog } from '@mui/material';

const AppModal = ({ children, paperSx = {}, ...props }) => {
  return (
    <Dialog
      {...props}
      PaperProps={{
        sx: {
          bgcolor: '#16161f',
          border: '1px solid rgba(255,255,255,0.08)',
          borderRadius: '16px',
          color: '#e0e0ef',
          backgroundImage: 'none',
          ...paperSx,
        },
      }}
    >
      {children}
    </Dialog>
  );
};

export default AppModal;
