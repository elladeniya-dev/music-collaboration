import React from 'react';
import { Box, Typography, Rating, Avatar } from '@mui/material';
import FormatQuoteIcon from '@mui/icons-material/FormatQuote';
import { UserLevelChip, getMockUserMeta } from './UserBadge';

const ReviewCard = ({ review }) => {
  const { level } = getMockUserMeta(review.name);

  return (
    <Box sx={{
      bgcolor: '#16161f', borderRadius: '16px', p: 3,
      border: '1px solid rgba(255,255,255,0.05)',
      transition: 'all 0.3s',
      '&:hover': { borderColor: 'rgba(168,85,247,0.12)', transform: 'translateY(-2px)', boxShadow: '0 8px 30px rgba(0,0,0,0.2)' },
    }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 2 }}>
        <Rating value={review.rating} readOnly size="small" precision={0.5}
          sx={{ '& .MuiRating-iconFilled': { color: '#f59e0b' }, '& .MuiRating-iconEmpty': { color: 'rgba(255,255,255,0.08)' }, fontSize: '0.9rem' }} />
        <Typography variant="caption" sx={{ color: '#5c5c72', ml: 0.5 }}>{review.rating}</Typography>
      </Box>

      <Box sx={{ position: 'relative', mb: 2 }}>
        <FormatQuoteIcon sx={{ position: 'absolute', top: -8, left: -4, fontSize: 28, color: 'rgba(168,85,247,0.1)' }} />
        <Typography variant="body2" sx={{ color: '#8b8b9e', lineHeight: 1.7, pl: 3 }}>
          {review.comment}
        </Typography>
      </Box>

      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, pt: 2, borderTop: '1px solid rgba(255,255,255,0.04)' }}>
        <Avatar sx={{ width: 28, height: 28, background: 'linear-gradient(135deg, #a855f7, #6366f1)', fontSize: 12, fontWeight: 600 }}>
          {review.name?.[0]}
        </Avatar>
        <Box>
          <Typography variant="caption" fontWeight={600} sx={{ color: '#e0e0ef', display: 'block', lineHeight: 1.2 }}>{review.name}</Typography>
          <Typography variant="caption" sx={{ color: '#5c5c72', fontSize: '0.6rem' }}>{review.date}</Typography>
        </Box>
        <Box sx={{ ml: 'auto' }}><UserLevelChip level={level} /></Box>
      </Box>
    </Box>
  );
};

export default ReviewCard;
