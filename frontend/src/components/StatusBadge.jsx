import React from 'react';
import { Box, Typography } from '@mui/material';
import FiberManualRecordIcon from '@mui/icons-material/FiberManualRecord';

const STATUS_CONFIG = {
  available: { label: 'Available', color: '#10b981', glow: 'rgba(16,185,129,0.3)' },
  busy: { label: 'Busy', color: '#f59e0b', glow: 'rgba(245,158,11,0.3)' },
  offline: { label: 'Offline', color: '#5c5c72', glow: 'none' },
};


const StatusBadge = ({ status = 'offline', showLabel = true, size = 'small' }) => {
  const cfg = STATUS_CONFIG[status] || STATUS_CONFIG.offline;
  const dotSize = size === 'small' ? 8 : 10;

  return (
    <Box sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.5 }}>
      <Box sx={{
        width: dotSize, height: dotSize, borderRadius: '50%',
        bgcolor: cfg.color,
        boxShadow: cfg.glow !== 'none' ? `0 0 8px ${cfg.glow}` : 'none',
        animation: status === 'available' ? 'pulse-dot 2s ease-in-out infinite' : 'none',
        '@keyframes pulse-dot': {
          '0%, 100%': { boxShadow: `0 0 4px ${cfg.glow}` },
          '50%': { boxShadow: `0 0 12px ${cfg.glow}` },
        },
      }} />
      {showLabel && (
        <Typography variant="caption" sx={{ color: cfg.color, fontWeight: 600, fontSize: '0.6rem' }}>
          {cfg.label}
        </Typography>
      )}
    </Box>
  );
};

// Dot-only overlay for avatars
export const StatusDot = ({ status = 'offline', size = 10 }) => {
  const cfg = STATUS_CONFIG[status] || STATUS_CONFIG.offline;
  return (
    <Box sx={{
      position: 'absolute', bottom: -1, right: -1,
      width: size, height: size, borderRadius: '50%',
      bgcolor: cfg.color, border: '2px solid #0a0a0f',
      boxShadow: cfg.glow !== 'none' ? `0 0 6px ${cfg.glow}` : 'none',
    }} />
  );
};

export default StatusBadge;
