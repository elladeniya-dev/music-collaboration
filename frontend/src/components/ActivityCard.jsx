import React from 'react';
import { Box, Typography } from '@mui/material';

const ActivityCard = ({ title, items, emptyText }) => {
  return (
    <Box
      sx={{
        bgcolor: '#16161f',
        borderRadius: '16px',
        p: 3,
        border: '1px solid rgba(255,255,255,0.05)',
      }}
    >
      <Typography variant="subtitle2" fontWeight={700} sx={{ color: '#ececf7', mb: 2 }}>
        {title}
      </Typography>

      {items.length === 0 ? (
        <Box
          sx={{
            border: '1px dashed rgba(255,255,255,0.12)',
            borderRadius: '12px',
            py: 3,
            px: 2,
            textAlign: 'center',
          }}
        >
          <Typography variant="body2" sx={{ color: '#72728a' }}>
            {emptyText}
          </Typography>
        </Box>
      ) : (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.25 }}>
          {items.map((item) => (
            <Box
              key={item.id}
              sx={{
                display: 'flex',
                alignItems: 'flex-start',
                justifyContent: 'space-between',
                gap: 1.5,
                p: 1.25,
                borderRadius: '10px',
                bgcolor: 'rgba(255,255,255,0.02)',
                transition: 'background-color 0.2s ease',
                '&:hover': {
                  bgcolor: 'rgba(255,255,255,0.05)',
                },
              }}
            >
              <Box sx={{ minWidth: 0 }}>
                <Typography
                  variant="body2"
                  sx={{
                    color: '#ececf7',
                    fontWeight: 600,
                    lineHeight: 1.3,
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {item.primary}
                </Typography>
                <Typography variant="caption" sx={{ color: '#9d9db2' }}>
                  {item.secondary}
                </Typography>
              </Box>
              <Typography variant="caption" sx={{ color: '#6f6f87', whiteSpace: 'nowrap' }}>
                {item.time}
              </Typography>
            </Box>
          ))}
        </Box>
      )}
    </Box>
  );
};

export default ActivityCard;
