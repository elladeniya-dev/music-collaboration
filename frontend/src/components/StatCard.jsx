import React from 'react';
import { Box, Typography } from '@mui/material';

const StatCard = ({
  label,
  value,
  helperText,
  icon,
  color = '#a855f7',
}) => {
  return (
    <Box
      sx={{
        bgcolor: '#16161f',
        borderRadius: '16px',
        p: 3,
        border: '1px solid rgba(255,255,255,0.05)',
        backgroundImage: `linear-gradient(165deg, ${color}14 0%, rgba(22,22,31,1) 55%)`,
        transition: 'transform 0.25s ease, box-shadow 0.25s ease, border-color 0.25s ease',
        '&:hover': {
          transform: 'translateY(-3px)',
          boxShadow: `0 14px 34px ${color}20`,
          borderColor: `${color}30`,
        },
      }}
    >
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1.5 }}>
        <Box
          sx={{
            width: 40,
            height: 40,
            borderRadius: '12px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            bgcolor: `${color}1a`,
            color,
          }}
        >
          {icon}
        </Box>
      </Box>

      <Typography variant="h5" fontWeight={800} sx={{ color: '#ececf7', mb: 0.25 }}>
        {value}
      </Typography>
      <Typography variant="caption" sx={{ color: '#8d8da3', display: 'block' }}>
        {label}
      </Typography>
      {helperText ? (
        <Typography variant="caption" sx={{ color: '#66667b', display: 'block', mt: 0.7 }}>
          {helperText}
        </Typography>
      ) : null}
    </Box>
  );
};

export default StatCard;
