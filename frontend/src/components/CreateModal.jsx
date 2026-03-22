import React from 'react';
import { Box, Typography, IconButton, Tooltip } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import StorefrontIcon from '@mui/icons-material/Storefront';
import WorkIcon from '@mui/icons-material/Work';
import GroupIcon from '@mui/icons-material/Group';
import { useNavigate } from 'react-router-dom';

const options = [
  {
    label: 'Sell a Service',
    desc: 'List your skills on the marketplace',
    icon: <StorefrontIcon />,
    color: '#10b981',
    glow: 'rgba(16,185,129,0.15)',
    path: '/services/create',
  },
  {
    label: 'Post a Job',
    desc: 'Hire a talented professional',
    icon: <WorkIcon />,
    color: '#f59e0b',
    glow: 'rgba(245,158,11,0.15)',
    path: '/post',
  },
  {
    label: 'Start Collaboration',
    desc: 'Find creative partners',
    icon: <GroupIcon />,
    color: '#a855f7',
    glow: 'rgba(168,85,247,0.15)',
    path: '/requests',
    action: 'collab',
  },
];

const CreateModal = ({ open, onClose }) => {
  const navigate = useNavigate();

  if (!open) return null;

  const handleSelect = (opt) => {
    onClose();
    if (opt.action === 'collab') {
      // Navigate to collab page — the "Add Request" button is there
      navigate(opt.path);
    } else {
      navigate(opt.path);
    }
  };

  return (
    <>
      {/* Backdrop */}
      <Box
        onClick={onClose}
        sx={{
          position: 'fixed',
          inset: 0,
          bgcolor: 'rgba(0,0,0,0.6)',
          backdropFilter: 'blur(8px)',
          zIndex: 1300,
          transition: 'opacity 0.2s',
        }}
      />

      {/* Modal */}
      <Box
        sx={{
          position: 'fixed',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          zIndex: 1301,
          width: '100%',
          maxWidth: 480,
          px: 2,
        }}
      >
        <Box
          sx={{
            bgcolor: '#16161f',
            borderRadius: '20px',
            border: '1px solid rgba(255,255,255,0.06)',
            p: 4,
            boxShadow: '0 25px 100px rgba(0,0,0,0.5)',
          }}
        >
          {/* Header */}
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
            <Typography variant="h6" fontWeight={800} sx={{ color: '#e0e0ef', letterSpacing: '-0.3px' }}>
              What would you like to create?
            </Typography>
            <IconButton onClick={onClose} size="small" sx={{ color: '#5c5c72', '&:hover': { color: '#e0e0ef' } }}>
              <CloseIcon sx={{ fontSize: 20 }} />
            </IconButton>
          </Box>

          {/* Options */}
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
            {options.map((opt) => (
              <Box
                key={opt.label}
                onClick={() => handleSelect(opt)}
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 2.5,
                  p: 2.5,
                  borderRadius: '14px',
                  cursor: 'pointer',
                  border: '1px solid rgba(255,255,255,0.05)',
                  transition: 'all 0.25s ease',
                  '&:hover': {
                    bgcolor: `${opt.glow}`,
                    borderColor: `${opt.color}40`,
                    boxShadow: `0 0 30px ${opt.glow}`,
                    transform: 'translateX(4px)',
                  },
                }}
              >
                <Box
                  sx={{
                    width: 48,
                    height: 48,
                    borderRadius: '12px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    bgcolor: `${opt.color}15`,
                    color: opt.color,
                    flexShrink: 0,
                    '& .MuiSvgIcon-root': { fontSize: 24 },
                  }}
                >
                  {opt.icon}
                </Box>
                <Box>
                  <Typography variant="subtitle2" fontWeight={700} sx={{ color: '#e0e0ef', lineHeight: 1.3 }}>
                    {opt.label}
                  </Typography>
                  <Typography variant="caption" sx={{ color: '#5c5c72' }}>
                    {opt.desc}
                  </Typography>
                </Box>
              </Box>
            ))}
          </Box>
        </Box>
      </Box>
    </>
  );
};

export default CreateModal;
