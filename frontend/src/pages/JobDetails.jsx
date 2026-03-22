import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Typography, Box, Chip, Avatar, Button, CircularProgress, Rating } from '@mui/material';
import WorkIcon from '@mui/icons-material/Work';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import GroupWorkIcon from '@mui/icons-material/GroupWork';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import PersonIcon from '@mui/icons-material/Person';
import { jobPostService } from '../services';
import { formatDate, parseSkills, getUserId, isResourceOwner } from '../utils';
import { showSuccess } from '../utils';
import { useUser } from '../context/UserContext';
import ProposalModal from '../components/ProposalModal';
import { UserLevelChip, UserBadges, getMockUserMeta } from '../components/UserBadge';
import { AppButton, AppCard, EmptyState, PageHeader } from '../components/ui';

const STATUS_COLORS = {
  OPEN: { bg: 'rgba(16,185,129,0.08)', color: '#10b981', border: 'rgba(16,185,129,0.15)' },
  IN_PROGRESS: { bg: 'rgba(245,158,11,0.08)', color: '#f59e0b', border: 'rgba(245,158,11,0.15)' },
  COMPLETED: { bg: 'rgba(99,102,241,0.08)', color: '#6366f1', border: 'rgba(99,102,241,0.15)' },
};

const MOCK_APPLICANTS = [
  { id: 'a1', name: 'Sarah Chen', bid: 120, deliveryDays: 5, rating: 4.8, coverLetter: 'Experienced vocalist with 8+ years in R&B...' },
  { id: 'a2', name: 'Marcus Johnson', bid: 95, deliveryDays: 7, rating: 4.5, coverLetter: 'Professional mixing engineer, worked with...' },
  { id: 'a3', name: 'Aisha Williams', bid: 150, deliveryDays: 3, rating: 4.9, coverLetter: 'Grammy-nominated producer specializing in...' },
];

const JobDetails = () => {
  const { id } = useParams();
  const { user } = useUser();
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [proposalOpen, setProposalOpen] = useState(false);
  const [jobStatus, setJobStatus] = useState('OPEN');
  const [applicants, setApplicants] = useState(MOCK_APPLICANTS);
  const [activeTab, setActiveTab] = useState('details');

  useEffect(() => {
    jobPostService.getJobPostById(id).then(setJob).catch(console.error).finally(() => setLoading(false));
  }, [id]);

  if (loading) return <Box display="flex" justifyContent="center" mt={10}><CircularProgress sx={{ color: '#a855f7' }} /></Box>;
  if (!job) return <Box sx={{ maxWidth: 1000, mx: 'auto', mt: 8 }}><EmptyState icon={<WorkIcon sx={{ fontSize: 56, color: 'rgba(255,255,255,0.08)' }} />} title="Job not found" description="This post may have been removed or is no longer available." /></Box>;

  const isOwner = isResourceOwner(user, job.userId);
  const statusCfg = STATUS_COLORS[jobStatus] || STATUS_COLORS.OPEN;

  const handleAcceptApplicant = (applicant) => {
    setJobStatus('IN_PROGRESS');
    showSuccess(`Accepted ${applicant.name}!`);
  };

  return (
    <Box sx={{ maxWidth: 1100, mx: 'auto', mt: 1, mb: 4, px: { xs: 2, md: 1 } }} className="fade-in">
      <PageHeader
        title="Job Overview"
        subtitle="Review job requirements, applicant quality, and collaboration fit."
      />

      <Box sx={{ display: 'flex', gap: 3, flexDirection: { xs: 'column', md: 'row' } }}>
        {/* Main Content */}
        <Box sx={{ flex: 1 }}>
          <AppCard sx={{ borderRadius: '20px', p: 0, overflow: 'hidden' }}>
            {job.imageUrl && <Box component="img" src={job.imageUrl} alt={job.title} sx={{ width: '100%', height: 220, objectFit: 'cover', borderBottom: '1px solid rgba(255,255,255,0.05)' }} />}

            <Box sx={{ p: { xs: 3, md: 4 } }}>
              {/* Status + Type */}
              <Box sx={{ display: 'flex', gap: 1, mb: 2, flexWrap: 'wrap' }}>
                <Chip label={jobStatus} size="small"
                  sx={{ bgcolor: statusCfg.bg, color: statusCfg.color, fontWeight: 700, fontSize: '0.65rem', height: 22, borderRadius: '6px', border: `1px solid ${statusCfg.border}` }} />
                {job.collaborationType && <Chip label={job.collaborationType} size="small"
                  sx={{ bgcolor: 'rgba(245,158,11,0.08)', color: '#f59e0b', fontWeight: 600, fontSize: '0.65rem', height: 22, borderRadius: '6px', border: '1px solid rgba(245,158,11,0.12)' }} />}
              </Box>

              <Typography variant="h4" fontWeight={800} sx={{ color: '#e0e0ef', letterSpacing: '-0.5px', mb: 1, lineHeight: 1.2 }}>
                {job.title}
              </Typography>

              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3, color: '#5c5c72' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}><GroupWorkIcon sx={{ fontSize: 15 }} /><Typography variant="caption">{job.collaborationType}</Typography></Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}><CalendarTodayIcon sx={{ fontSize: 15 }} /><Typography variant="caption">{formatDate(job.availability)}</Typography></Box>
              </Box>

              {/* Tabs */}
              <Box sx={{ display: 'flex', gap: 0, mb: 3, borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                {['details', ...(isOwner ? ['applicants'] : [])].map(tab => (
                  <Box key={tab} onClick={() => setActiveTab(tab)}
                    sx={{ px: 3, py: 1.5, cursor: 'pointer', borderBottom: activeTab === tab ? '2px solid #f59e0b' : '2px solid transparent',
                      color: activeTab === tab ? '#e0e0ef' : '#5c5c72', fontWeight: activeTab === tab ? 700 : 400, fontSize: '0.85rem', textTransform: 'capitalize', transition: 'all 0.2s' }}>
                    {tab} {tab === 'applicants' && <Chip label={applicants.length} size="small" sx={{ ml: 0.5, bgcolor: 'rgba(245,158,11,0.1)', color: '#f59e0b', height: 18, fontSize: '0.6rem', fontWeight: 700 }} />}
                  </Box>
                ))}
              </Box>

              {activeTab === 'details' && (
                <>
                  <Typography variant="body1" sx={{ color: '#8b8b9e', lineHeight: 1.8, mb: 3, whiteSpace: 'pre-wrap' }}>{job.description}</Typography>
                  <Box sx={{ mb: 3 }}>
                    <Typography variant="subtitle2" fontWeight={700} sx={{ color: '#e0e0ef', mb: 1.5 }}>Skills Required</Typography>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                      {parseSkills(job.skillsNeeded).map(s => <Chip key={s} label={s} size="small"
                        sx={{ bgcolor: 'rgba(255,255,255,0.04)', color: '#8b8b9e', fontWeight: 500, fontSize: '0.78rem', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.06)' }} />)}
                    </Box>
                  </Box>
                </>
              )}

              {activeTab === 'applicants' && isOwner && (
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  {applicants.map(a => {
                    const { level, badges } = getMockUserMeta(a.name);
                    return (
                      <Box key={a.id} sx={{ bgcolor: 'rgba(255,255,255,0.02)', borderRadius: '14px', border: '1px solid rgba(255,255,255,0.05)', p: 3 }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1.5 }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                            <Avatar sx={{ width: 36, height: 36, background: 'linear-gradient(135deg, #a855f7, #6366f1)', fontSize: 14, fontWeight: 600 }}>{a.name[0]}</Avatar>
                            <Box>
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <Typography variant="subtitle2" fontWeight={700} sx={{ color: '#e0e0ef' }}>{a.name}</Typography>
                                <UserLevelChip level={level} />
                              </Box>
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mt: 0.25 }}>
                                <Rating value={a.rating} precision={0.1} readOnly size="small" sx={{ '& .MuiRating-iconFilled': { color: '#f59e0b' }, '& .MuiRating-iconEmpty': { color: 'rgba(255,255,255,0.1)' }, fontSize: '0.75rem' }} />
                                <Typography variant="caption" sx={{ color: '#5c5c72' }}>{a.rating}</Typography>
                              </Box>
                            </Box>
                          </Box>
                          <Box sx={{ textAlign: 'right' }}>
                            <Typography variant="subtitle2" fontWeight={800} sx={{ color: '#10b981' }}>${a.bid}</Typography>
                            <Typography variant="caption" sx={{ color: '#5c5c72' }}>{a.deliveryDays}d delivery</Typography>
                          </Box>
                        </Box>
                        <UserBadges badges={badges} />
                        <Typography variant="body2" sx={{ color: '#8b8b9e', mt: 1.5, mb: 2, lineHeight: 1.6 }}>{a.coverLetter}</Typography>
                        <AppButton size="small" startIcon={<CheckCircleIcon sx={{ fontSize: 14 }} />} onClick={() => handleAcceptApplicant(a)}
                          sx={{ borderRadius: '10px', px: 2.5, background: 'linear-gradient(135deg, #10b981, #059669)', '&:hover': { boxShadow: '0 0 20px rgba(16,185,129,0.2)' } }}>
                          Accept
                        </AppButton>
                      </Box>
                    );
                  })}
                </Box>
              )}
            </Box>
          </AppCard>
        </Box>

        {/* Sidebar */}
        {!isOwner && (
          <Box sx={{ width: { xs: '100%', md: 300 }, flexShrink: 0 }}>
            <AppCard sx={{ borderRadius: '16px', p: 3, position: 'sticky', top: 80 }}>
              <Typography variant="subtitle2" fontWeight={700} sx={{ color: '#e0e0ef', mb: 2 }}>Interested in this job?</Typography>
              <AppButton fullWidth onClick={() => setProposalOpen(true)}
                sx={{ py: 1.5, background: 'linear-gradient(135deg, #f59e0b, #f97316)', mb: 2, '&:hover': { boxShadow: '0 0 25px rgba(245,158,11,0.25)' } }}>
                Apply Now
              </AppButton>
              <Box sx={{ display: 'flex', justifyContent: 'space-around', pt: 2, borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                <Box sx={{ textAlign: 'center' }}><Typography variant="h6" fontWeight={800} sx={{ color: '#e0e0ef' }}>{applicants.length}</Typography><Typography variant="caption" sx={{ color: '#5c5c72' }}>Applicants</Typography></Box>
                <Box sx={{ textAlign: 'center' }}><Typography variant="h6" fontWeight={800} sx={{ color: '#10b981' }}>$95</Typography><Typography variant="caption" sx={{ color: '#5c5c72' }}>Avg Bid</Typography></Box>
              </Box>
            </AppCard>
          </Box>
        )}
      </Box>

      <ProposalModal open={proposalOpen} onClose={() => setProposalOpen(false)} job={job}
        onSubmit={(data) => { showSuccess('Proposal submitted!'); }} />
    </Box>
  );
};

export default JobDetails;
