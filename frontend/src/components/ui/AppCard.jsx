import React from 'react';
import { Box } from '@mui/material';

const AppCard = ({ children, sx = {}, interactive = false, className = '', ...props }) => {
  return (
    <Box
      className={`app-card ${interactive ? 'app-card-interactive' : ''} ${className}`.trim()}
      sx={{ p: 3, ...sx }}
      {...props}
    >
      {children}
    </Box>
  );
};

export default AppCard;
