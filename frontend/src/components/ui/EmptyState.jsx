import React from 'react';
import { Box, Typography } from '@mui/material';

const EmptyState = ({ icon, title, description, action }) => {
  return (
    <Box
      sx={{
        textAlign: 'center',
        py: 7,
        px: 3,
        borderRadius: '16px',
        border: '1px dashed rgba(255,255,255,0.14)',
        background: 'rgba(255,255,255,0.01)',
      }}
    >
      {icon}
      <Typography variant="h6" sx={{ color: '#dbdbee', mt: 1.5 }}>
        {title}
      </Typography>
      {description ? (
        <Typography variant="body2" sx={{ color: '#7f7f95', mt: 0.75 }}>
          {description}
        </Typography>
      ) : null}
      {action ? <Box sx={{ mt: 2.2 }}>{action}</Box> : null}
    </Box>
  );
};

export default EmptyState;
