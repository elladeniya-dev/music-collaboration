import React, { useEffect, useState } from 'react';
import { Typography, CircularProgress, Box, Alert, Button } from '@mui/material';
import { Work as JobIcon, Add } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import JobCard from '../components/JobCard';
import { jobPostService } from '../services';
import { showSuccess, showError } from '../utils';

const JobBoard = () => {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    jobPostService.getAllJobPosts()
      .then((data) => { setJobs(data); setLoading(false); })
      .catch((err) => { setError('Error fetching jobs.'); setLoading(false); });
  }, []);

  const handleDelete = async (jobId) => {
    try { await jobPostService.deleteJobPost(jobId); showSuccess('Deleted!'); setJobs(jobs.filter(j => j.id !== jobId)); } catch { showError('Error'); }
  };

  const handleUpdate = (job) => navigate(`/job/${job.id}`);

  return (
    <Box sx={{ py: 1 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
        <Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <JobIcon sx={{ fontSize: 26, color: '#a855f7' }} />
            <Typography variant="h5" fontWeight={800} sx={{ color: '#e0e0ef', letterSpacing: '-0.5px' }}>Job Board</Typography>
          </Box>
          <Typography variant="body2" sx={{ mt: 0.5, ml: 5.5, color: '#5c5c72' }}>Browse collaboration opportunities.</Typography>
        </Box>
        <Button onClick={() => navigate('/post')} startIcon={<Add />}
          sx={{ borderRadius: '12px', textTransform: 'none', fontWeight: 600, px: 3, py: 1, background: 'linear-gradient(135deg,#a855f7,#6366f1)', color: 'white', '&:hover': { boxShadow: '0 0 25px rgba(168,85,247,0.25)' } }}>
          Post Job
        </Button>
      </Box>

      {loading ? (
        <Box display="flex" justifyContent="center" mt={8}><CircularProgress sx={{ color: '#a855f7' }} /></Box>
      ) : error ? (
        <Alert severity="error" sx={{ borderRadius: '12px', bgcolor: 'rgba(239,68,68,0.1)', color: '#ef4444' }}>{error}</Alert>
      ) : jobs.length === 0 ? (
        <Box sx={{ textAlign: 'center', mt: 10 }}>
          <JobIcon sx={{ fontSize: 56, color: 'rgba(255,255,255,0.06)', mb: 2 }} />
          <Typography variant="h6" sx={{ color: '#5c5c72' }}>No jobs posted yet.</Typography>
        </Box>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {jobs.map((job) => <JobCard key={job.id} job={job} onDelete={handleDelete} onUpdate={handleUpdate} />)}
        </div>
      )}
    </Box>
  );
};

export default JobBoard;
