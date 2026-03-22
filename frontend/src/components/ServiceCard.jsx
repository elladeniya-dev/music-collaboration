import React from 'react';
import { Box, Typography, Chip, Rating } from '@mui/material';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import PersonIcon from '@mui/icons-material/Person';

const ServiceCard = ({ service }) => {
  // Generate a deterministic placeholder gradient based on title
  const gradients = [
    'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
    'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
    'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
    'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
    'linear-gradient(135deg, #a18cd1 0%, #fbc2eb 100%)',
    'linear-gradient(135deg, #fccb90 0%, #d57eeb 100%)',
    'linear-gradient(135deg, #e0c3fc 0%, #8ec5fc 100%)',
  ];
  const gradientIndex = (service.title?.length || 0) % gradients.length;

  return (
    <Box
      sx={{
        bgcolor: '#16161f',
        borderRadius: '16px',
        overflow: 'hidden',
        border: '1px solid rgba(255,255,255,0.05)',
        transition: 'all 0.35s cubic-bezier(0.4, 0, 0.2, 1)',
        cursor: 'pointer',
        '&:hover': {
          transform: 'translateY(-6px) scale(1.02)',
          boxShadow: '0 20px 60px rgba(168, 85, 247, 0.15), 0 0 0 1px rgba(168, 85, 247, 0.15)',
          borderColor: 'rgba(168, 85, 247, 0.2)',
        },
      }}
    >
      {/* Image / Gradient Placeholder */}
      <Box
        sx={{
          height: 160,
          background: gradients[gradientIndex],
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Price badge */}
        <Box
          sx={{
            position: 'absolute',
            bottom: 12,
            right: 12,
            bgcolor: 'rgba(0,0,0,0.7)',
            backdropFilter: 'blur(10px)',
            borderRadius: '10px',
            px: 1.5,
            py: 0.5,
          }}
        >
          <Typography variant="subtitle2" fontWeight={800} sx={{ color: '#10b981' }}>
            ${service.price?.toFixed(2) || '0.00'}
          </Typography>
        </Box>

        {/* Category chip */}
        {service.category && (
          <Box
            sx={{
              position: 'absolute',
              top: 12,
              left: 12,
            }}
          >
            <Chip
              label={service.category}
              size="small"
              sx={{
                bgcolor: 'rgba(0,0,0,0.6)',
                backdropFilter: 'blur(10px)',
                color: 'white',
                fontWeight: 600,
                fontSize: '0.7rem',
                height: 24,
                borderRadius: '8px',
              }}
            />
          </Box>
        )}
      </Box>

      {/* Content */}
      <Box sx={{ p: 2.5 }}>
        <Typography
          variant="subtitle2"
          fontWeight={700}
          sx={{
            color: '#e0e0ef',
            lineHeight: 1.4,
            mb: 0.75,
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
          }}
        >
          {service.title}
        </Typography>

        <Typography
          variant="caption"
          sx={{
            color: '#5c5c72',
            lineHeight: 1.5,
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
            mb: 1.5,
          }}
        >
          {service.description}
        </Typography>

        {/* Rating stars (static) */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, mb: 1.5 }}>
          <Rating
            value={4.5}
            precision={0.5}
            readOnly
            size="small"
            sx={{
              '& .MuiRating-iconFilled': { color: '#f59e0b' },
              '& .MuiRating-iconEmpty': { color: 'rgba(255,255,255,0.1)' },
              fontSize: '0.9rem',
            }}
          />
          <Typography variant="caption" sx={{ color: '#5c5c72' }}>4.5</Typography>
        </Box>

        {/* Tags */}
        {service.tags?.length > 0 && (
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mb: 1.5 }}>
            {service.tags.slice(0, 3).map((tag) => (
              <Chip
                key={tag}
                label={tag}
                size="small"
                sx={{
                  bgcolor: 'rgba(168, 85, 247, 0.08)',
                  color: '#a78bfa',
                  fontSize: '0.65rem',
                  fontWeight: 500,
                  height: 22,
                  borderRadius: '6px',
                  border: '1px solid rgba(168, 85, 247, 0.1)',
                }}
              />
            ))}
          </Box>
        )}

        {/* Footer */}
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            pt: 1.5,
            borderTop: '1px solid rgba(255,255,255,0.05)',
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <PersonIcon sx={{ fontSize: 14, color: '#5c5c72' }} />
            <Typography variant="caption" sx={{ color: '#8b8b9e', fontWeight: 500 }}>
              {service.sellerName || 'Seller'}
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <AccessTimeIcon sx={{ fontSize: 14, color: '#5c5c72' }} />
            <Typography variant="caption" sx={{ color: '#8b8b9e' }}>
              {service.deliveryTime || '?'}d
            </Typography>
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

export default ServiceCard;
