import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Typography, Box, Chip, Avatar, Button, CircularProgress } from '@mui/material';
import WorkIcon from '@mui/icons-material/Work';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import GroupWorkIcon from '@mui/icons-material/GroupWork';
import SendIcon from '@mui/icons-material/Send';
import { jobPostService } from '../services';
import { formatDate, parseSkills } from '../utils';

const JobDetails = () => {
  const { id } = useParams();
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    jobPostService.getJobPostById(id).then(setJob).catch(console.error).finally(() => setLoading(false));
  }, [id]);

  if (loading) return <Box display="flex" justifyContent="center" mt={10}><CircularProgress sx={{ color: '#a855f7' }} /></Box>;

  if (!job) return (
    <Box sx={{ textAlign: 'center', mt: 10 }}>
      <WorkIcon sx={{ fontSize: 56, color: 'rgba(255,255,255,0.06)', mb: 2 }} />
      <Typography variant="h6" sx={{ color: '#5c5c72' }}>Job not found.</Typography>
    </Box>
  );

  return (
    <Box sx={{ maxWidth: 900, mx: 'auto', mt: 2, mb: 4 }}>
      <Box sx={{ bgcolor: '#16161f', borderRadius: '20px', border: '1px solid rgba(255,255,255,0.05)', overflow: 'hidden' }}>
        {job.imageUrl && (
          <Box component="img" src={job.imageUrl} alt={job.title} sx={{ width: '100%', height: 280, objectFit: 'cover', borderBottom: '1px solid rgba(255,255,255,0.05)' }} />
        )}
        <Box sx={{ p: { xs: 3, md: 5 } }}>
          <Typography variant="h4" fontWeight={800} sx={{ color: '#e0e0ef', letterSpacing: '-0.5px', mb: 1 }}>
            {job.title}
          </Typography>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3, flexWrap: 'wrap' }}>
            {job.contactMethod && (
              <Chip avatar={<Avatar sx={{ bgcolor: '#a855f7', width: 22, height: 22, fontSize: 11 }}>{job.contactMethod?.[0]}</Avatar>}
                label={job.contactMethod} size="small"
                sx={{ bgcolor: 'rgba(168,85,247,0.1)', color: '#c084fc', fontWeight: 600, fontSize: '0.7rem', border: '1px solid rgba(168,85,247,0.15)' }} />
            )}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, color: '#5c5c72' }}>
              <GroupWorkIcon sx={{ fontSize: 15 }} /><Typography variant="caption">{job.collaborationType}</Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, color: '#5c5c72' }}>
              <CalendarTodayIcon sx={{ fontSize: 15 }} /><Typography variant="caption">{formatDate(job.availability)}</Typography>
            </Box>
          </Box>

          <Typography variant="body1" sx={{ color: '#8b8b9e', lineHeight: 1.8, mb: 3, whiteSpace: 'pre-wrap' }}>
            {job.description}
          </Typography>

          <Box sx={{ mb: 4 }}>
            <Typography variant="subtitle2" fontWeight={700} sx={{ color: '#e0e0ef', mb: 1.5 }}>Skills Required</Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
              {parseSkills(job.skillsNeeded).map((s) => (
                <Chip key={s} label={s} size="small"
                  sx={{ bgcolor: 'rgba(255,255,255,0.04)', color: '#8b8b9e', fontWeight: 500, fontSize: '0.78rem', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.06)' }} />
              ))}
            </Box>
          </Box>

          <Button variant="contained" size="large" startIcon={<SendIcon />}
            sx={{ borderRadius: '12px', textTransform: 'none', fontWeight: 700, px: 4, py: 1.5, background: 'linear-gradient(135deg,#a855f7,#6366f1)', color: 'white', '&:hover': { boxShadow: '0 0 30px rgba(168,85,247,0.25)' } }}>
            Send Collaboration Request
          </Button>
        </Box>
      </Box>
    </Box>
  );
};

export default JobDetails;
