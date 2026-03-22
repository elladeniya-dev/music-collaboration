import React from 'react';
import { Box, Typography } from '@mui/material';

const PageHeader = ({ title, subtitle, actions }) => {
  return (
    <Box className="page-header">
      <Box>
        <Typography variant="h4" fontWeight={800} sx={{ color: '#f3f3ff', letterSpacing: '-0.6px' }}>
          {title}
        </Typography>
        {subtitle ? (
          <Typography variant="body2" sx={{ color: '#9898ad', mt: 0.75 }}>
            {subtitle}
          </Typography>
        ) : null}
      </Box>
      {actions ? <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>{actions}</Box> : null}
    </Box>
  );
};

export default PageHeader;
