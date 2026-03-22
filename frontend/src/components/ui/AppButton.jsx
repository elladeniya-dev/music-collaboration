import React from 'react';
import { Button } from '@mui/material';

const variants = {
  primary: {
    background: 'linear-gradient(135deg, #a855f7, #6366f1)',
    color: '#fff',
    '&:hover': { boxShadow: '0 0 24px rgba(168,85,247,0.26)' },
  },
  secondary: {
    background: 'rgba(255,255,255,0.04)',
    color: '#d4d4e7',
    border: '1px solid rgba(255,255,255,0.12)',
    '&:hover': { borderColor: 'rgba(168,85,247,0.28)', color: '#e9e9ff' },
  },
  ghost: {
    background: 'transparent',
    color: '#a9a9c2',
    '&:hover': { background: 'rgba(255,255,255,0.06)' },
  },
};

const AppButton = ({ kind = 'primary', sx = {}, children, ...props }) => {
  return (
    <Button
      sx={{
        borderRadius: '12px',
        textTransform: 'none',
        fontWeight: 700,
        px: 2.6,
        py: 1,
        ...variants[kind],
        ...sx,
      }}
      {...props}
    >
      {children}
    </Button>
  );
};

export default AppButton;
