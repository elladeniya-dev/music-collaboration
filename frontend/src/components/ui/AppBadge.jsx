import React from 'react';
import { Chip } from '@mui/material';

const tones = {
  neutral: { bg: 'rgba(255,255,255,0.06)', color: '#d4d4e7', border: 'rgba(255,255,255,0.1)' },
  purple: { bg: 'rgba(168,85,247,0.12)', color: '#d8b4fe', border: 'rgba(168,85,247,0.24)' },
  green: { bg: 'rgba(16,185,129,0.12)', color: '#6ee7b7', border: 'rgba(16,185,129,0.24)' },
  orange: { bg: 'rgba(245,158,11,0.12)', color: '#fdba74', border: 'rgba(245,158,11,0.24)' },
  cyan: { bg: 'rgba(6,182,212,0.12)', color: '#67e8f9', border: 'rgba(6,182,212,0.24)' },
};

const AppBadge = ({ tone = 'neutral', sx = {}, ...props }) => {
  const t = tones[tone] || tones.neutral;
  return (
    <Chip
      size="small"
      sx={{
        bgcolor: t.bg,
        color: t.color,
        border: `1px solid ${t.border}`,
        fontWeight: 600,
        fontSize: '0.68rem',
        borderRadius: '8px',
        height: 24,
        ...sx,
      }}
      {...props}
    />
  );
};

export default AppBadge;
