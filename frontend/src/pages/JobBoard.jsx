import React, { useEffect, useState } from 'react';
import { Typography, CircularProgress, Box, Button, Chip } from '@mui/material';
import { Work as JobIcon, Add, AccessTime as DeadlineIcon, AttachMoney as BudgetIcon } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { jobPostService } from '../services';
import { showSuccess, showError, formatDate, parseSkills, truncateText, getUserId, isResourceOwner } from '../utils';
import { useUser } from '../context/UserContext';

const SkeletonCard = () => (
  <div className="rounded-2xl overflow-hidden" style={{ background: '#16161f', border: '1px solid rgba(255,255,255,0.05)' }}>
    <div className="p-5 space-y-3">
      <div className="skeleton h-5 w-3/4 rounded-lg" />
      <div className="skeleton h-4 w-full rounded-lg" />
      <div className="skeleton h-4 w-5/6 rounded-lg" />
      <div className="flex gap-2 mt-3">
        <div className="skeleton h-5 w-14 rounded-full" />
        <div className="skeleton h-5 w-14 rounded-full" />
      </div>
      <div className="skeleton h-9 w-28 rounded-lg mt-3" />
    </div>
  </div>
);

const JobBoard = () => {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useUser();
  const navigate = useNavigate();

  useEffect(() => {
    jobPostService.getAllJobPosts()
      .then((data) => { setJobs(data); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const handleDelete = async (jobId) => {
    try { await jobPostService.deleteJobPost(jobId); showSuccess('Deleted!'); setJobs(jobs.filter(j => j.id !== jobId)); } catch { showError('Error'); }
  };

  return (
    <Box>
      {/* ═══════════════════ HERO ═══════════════════ */}
      <Box sx={{ position: 'relative', overflow: 'hidden', pt: { xs: 8, md: 10 }, pb: { xs: 5, md: 8 }, px: { xs: 3, md: 6 } }}>
        {/* Amber glow */}
        <Box sx={{ position: 'absolute', top: -120, left: '25%', width: 450, height: 450, borderRadius: '50%', background: 'radial-gradient(circle, rgba(245,158,11,0.08) 0%, transparent 70%)', pointerEvents: 'none' }} />
        <Box sx={{ position: 'absolute', top: -80, right: '15%', width: 350, height: 350, borderRadius: '50%', background: 'radial-gradient(circle, rgba(249,115,22,0.05) 0%, transparent 70%)', pointerEvents: 'none' }} />

        <Box sx={{ maxWidth: 700, position: 'relative', zIndex: 1 }}>
          <Box sx={{ display: 'inline-flex', alignItems: 'center', gap: 1, px: 2, py: 0.75, borderRadius: '10px', bgcolor: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.15)', mb: 3 }}>
            <JobIcon sx={{ fontSize: 16, color: '#f59e0b' }} />
            <Typography variant="caption" sx={{ color: '#f59e0b', fontWeight: 600 }}>Jobs Board</Typography>
          </Box>
          <Typography variant="h2"
            sx={{ fontWeight: 900, fontSize: { xs: '2rem', md: '2.8rem' }, lineHeight: 1.15, letterSpacing: '-1.5px', mb: 2, color: '#e0e0ef' }}>
            Hire top music{' '}
            <span style={{ background: 'linear-gradient(135deg, #f59e0b, #f97316)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              professionals
            </span>
          </Typography>
          <Typography sx={{ color: '#5c5c72', fontSize: { xs: '0.95rem', md: '1.05rem' }, mb: 4, maxWidth: 550, lineHeight: 1.6 }}>
            Post your project and receive proposals from skilled musicians, producers, and audio engineers ready to bring your vision to life.
          </Typography>
          <Button onClick={() => navigate('/post')} startIcon={<Add />}
            sx={{ borderRadius: '12px', textTransform: 'none', fontWeight: 700, px: 3.5, py: 1.25, background: 'linear-gradient(135deg, #f59e0b, #f97316)', color: 'white', '&:hover': { boxShadow: '0 0 30px rgba(245,158,11,0.25)' } }}>
            Post a Job
          </Button>
        </Box>
      </Box>

      {/* ═══════════════════ JOBS GRID ═══════════════════ */}
      <Box sx={{ px: { xs: 3, md: 6 }, pb: 8 }}>
        <Typography variant="h6" fontWeight={700} sx={{ color: '#e0e0ef', mb: 3 }}>
          Open Positions
        </Typography>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {[...Array(6)].map((_, i) => <SkeletonCard key={i} />)}
          </div>
        ) : jobs.length === 0 ? (
          <Box sx={{ textAlign: 'center', py: 10 }}>
            <JobIcon sx={{ fontSize: 56, color: 'rgba(255,255,255,0.06)', mb: 2 }} />
            <Typography variant="h6" sx={{ color: '#5c5c72' }}>No jobs posted yet</Typography>
            <Typography variant="body2" sx={{ color: '#4a4a5e', mt: 0.5 }}>Post the first opportunity!</Typography>
          </Box>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {jobs.map((job) => {
              const isOwner = isResourceOwner(user, job.userId);
              return (
                <Box key={job.id}
                  onClick={() => navigate(`/jobs/${job.id}`)}
                  sx={{
                    bgcolor: '#16161f', borderRadius: '16px', p: 3, cursor: 'pointer',
                    border: '1px solid rgba(255,255,255,0.05)',
                    transition: 'all 0.3s cubic-bezier(0.4,0,0.2,1)',
                    '&:hover': { transform: 'translateY(-4px)', boxShadow: '0 15px 50px rgba(245,158,11,0.1)', borderColor: 'rgba(245,158,11,0.2)' },
                    display: 'flex', flexDirection: 'column', height: '100%',
                  }}
                >
                  {/* Type badge */}
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1.5 }}>
                    <Chip label={job.collaborationType || 'Remote'} size="small"
                      sx={{ bgcolor: 'rgba(245,158,11,0.08)', color: '#f59e0b', fontWeight: 600, fontSize: '0.65rem', height: 22, borderRadius: '6px', border: '1px solid rgba(245,158,11,0.12)' }} />
                    {isOwner && <Chip label="Your Post" size="small"
                      sx={{ bgcolor: 'rgba(168,85,247,0.08)', color: '#c084fc', fontWeight: 600, fontSize: '0.6rem', height: 20, border: '1px solid rgba(168,85,247,0.12)' }} />}
                  </Box>

                  {/* Title */}
                  <Typography variant="subtitle2" fontWeight={700} sx={{ color: '#e0e0ef', lineHeight: 1.35, mb: 1, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                    {job.title}
                  </Typography>

                  {/* Description */}
                  <Typography variant="caption" sx={{ color: '#5c5c72', lineHeight: 1.5, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden', mb: 2 }}>
                    {truncateText(job.description, 100)}
                  </Typography>

                  {/* Skills */}
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mb: 2 }}>
                    {parseSkills(job.skillsNeeded).slice(0, 3).map((s) => (
                      <Chip key={s} label={s} size="small"
                        sx={{ bgcolor: 'rgba(255,255,255,0.04)', color: '#8b8b9e', fontSize: '0.6rem', height: 20, borderRadius: '6px', border: '1px solid rgba(255,255,255,0.06)' }} />
                    ))}
                  </Box>

                  {/* Meta */}
                  <Box sx={{ mt: 'auto', pt: 2, borderTop: '1px solid rgba(255,255,255,0.05)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                      <DeadlineIcon sx={{ fontSize: 14, color: '#5c5c72' }} />
                      <Typography variant="caption" sx={{ color: '#8b8b9e' }}>{formatDate(job.availability)}</Typography>
                    </Box>
                    {!isOwner && (
                      <Button size="small"
                        onClick={(e) => { e.stopPropagation(); navigate(`/jobs/${job.id}`); }}
                        sx={{ borderRadius: '8px', textTransform: 'none', fontWeight: 600, fontSize: '0.75rem', px: 2, py: 0.5, background: 'linear-gradient(135deg, #f59e0b, #f97316)', color: 'white', '&:hover': { boxShadow: '0 0 15px rgba(245,158,11,0.2)' } }}>
                        Apply Now
                      </Button>
                    )}
                  </Box>

                  {isOwner && (
                    <Box mt={1.5} display="flex" gap={1}>
                      <Button size="small" onClick={(e) => { e.stopPropagation(); navigate(`/job/${job.id}`); }}
                        sx={{ borderRadius: '8px', textTransform: 'none', fontWeight: 600, fontSize: '0.7rem', color: '#a855f7', border: '1px solid rgba(168,85,247,0.2)', '&:hover': { bgcolor: 'rgba(168,85,247,0.08)' } }}>Edit</Button>
                      <Button size="small" onClick={(e) => { e.stopPropagation(); handleDelete(job.id); }}
                        sx={{ borderRadius: '8px', textTransform: 'none', fontWeight: 600, fontSize: '0.7rem', color: '#ef4444', border: '1px solid rgba(239,68,68,0.2)', '&:hover': { bgcolor: 'rgba(239,68,68,0.08)' } }}>Delete</Button>
                    </Box>
                  )}
                </Box>
              );
            })}
          </div>
        )}
      </Box>
    </Box>
  );
};

export default JobBoard;
