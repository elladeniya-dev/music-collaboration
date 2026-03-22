import React from 'react';
import { Card, CardMedia, CardContent, Typography, Box, Button, Chip } from '@mui/material';
import { useUser } from '../context/UserContext';
import { useNavigate } from 'react-router-dom';
import { formatDate, parseSkills, truncateText, getUserId, isResourceOwner } from '../utils';

const JobCard = ({ job, onDelete, onUpdate }) => {
  const { user } = useUser();
  const navigate = useNavigate();
  const isOwner = isResourceOwner(user, job.userId);

  return (
    <Box
      onClick={() => navigate(`/jobs/${job.id}`)}
      sx={{
        bgcolor: '#16161f', borderRadius: '16px', overflow: 'hidden', cursor: 'pointer',
        border: '1px solid rgba(255,255,255,0.05)',
        transition: 'all 0.3s cubic-bezier(0.4,0,0.2,1)',
        '&:hover': { transform: 'translateY(-4px)', boxShadow: '0 15px 50px rgba(168,85,247,0.12)', borderColor: 'rgba(168,85,247,0.2)' },
        display: 'flex', flexDirection: 'column', height: '100%',
      }}
    >
      {job.imageUrl && (
        <CardMedia component="img" height="160" image={job.imageUrl} alt={job.title}
          sx={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }} />
      )}
      <Box sx={{ p: 2.5, flex: 1, display: 'flex', flexDirection: 'column' }}>
        <Typography variant="subtitle2" fontWeight={700} gutterBottom sx={{ color: '#e0e0ef', lineHeight: 1.35 }}>
          {job.title}
        </Typography>
        <Typography variant="caption" sx={{ color: '#5c5c72', lineHeight: 1.5, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden', mb: 1.5 }}>
          {truncateText(job.description, 100)}
        </Typography>

        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mb: 1.5 }}>
          {parseSkills(job.skillsNeeded).slice(0, 3).map((s) => (
            <Chip key={s} label={s} size="small"
              sx={{ bgcolor: 'rgba(255,255,255,0.04)', color: '#8b8b9e', fontSize: '0.65rem', height: 22, borderRadius: '6px', border: '1px solid rgba(255,255,255,0.06)' }} />
          ))}
        </Box>

        <Box sx={{ mt: 'auto', pt: 1.5, borderTop: '1px solid rgba(255,255,255,0.05)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="caption" sx={{ color: '#5c5c72' }}>{job.collaborationType}</Typography>
          <Typography variant="caption" sx={{ color: '#5c5c72' }}>{formatDate(job.availability)}</Typography>
        </Box>

        {isOwner && (
          <Box mt={2} display="flex" gap={1}>
            <Button size="small" onClick={(e) => { e.stopPropagation(); onUpdate(job); }}
              sx={{ borderRadius: '8px', textTransform: 'none', fontWeight: 600, fontSize: '0.75rem', color: '#a855f7', border: '1px solid rgba(168,85,247,0.2)', '&:hover': { bgcolor: 'rgba(168,85,247,0.08)' } }}>
              Edit
            </Button>
            <Button size="small" onClick={(e) => { e.stopPropagation(); onDelete(job.id); }}
              sx={{ borderRadius: '8px', textTransform: 'none', fontWeight: 600, fontSize: '0.75rem', color: '#ef4444', border: '1px solid rgba(239,68,68,0.2)', '&:hover': { bgcolor: 'rgba(239,68,68,0.08)' } }}>
              Delete
            </Button>
          </Box>
        )}
      </Box>
    </Box>
  );
};

export default JobCard;
