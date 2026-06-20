import React, { useEffect, useState } from 'react';
import {
  Typography, Button, CircularProgress,
  Dialog, DialogTitle, DialogContent, TextField, DialogActions, Chip,
  Tooltip, IconButton, Box, Avatar, AvatarGroup
} from '@mui/material';
import { Edit, Send, Add, Delete, Group as CollabIcon, MusicNote, Headphones, Mic, Close as CloseIcon, PersonAdd } from '@mui/icons-material';
import { useUser } from '../context/UserContext';
import { useNavigate } from 'react-router-dom';
import { collaborationService } from '../services';
import { showSuccess, showError, showConfirmation, getUserId } from '../utils';
import { UserLevelChip, UserBadges, getMockUserMeta } from '../components/UserBadge';
import AudioWavePlayer from '../components/AudioWavePlayer';
import { AppButton, AppInput, AppModal, EmptyState, PageHeader } from '../components/ui';

const inputSx = {
  '& .MuiOutlinedInput-root': {
    borderRadius: '12px', bgcolor: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', color: '#e0e0ef',
    '& fieldset': { border: 'none' },
    '&:hover': { borderColor: 'rgba(236,72,153,0.2)' },
    '&.Mui-focused': { borderColor: 'rgba(236,72,153,0.4)', boxShadow: '0 0 20px rgba(236,72,153,0.08)' },
  },
  '& .MuiInputBase-input': { color: '#e0e0ef' },
  '& .MuiInputLabel-root': { color: '#5c5c72' },
  '& .MuiInputLabel-root.Mui-focused': { color: '#ec4899' },
};

const ROLE_OPTIONS = ['Vocalist', 'Producer', 'Mixing Engineer', 'Songwriter', 'Guitarist', 'Drummer', 'Pianist', 'DJ', 'Sound Designer', 'Video Editor'];

const SkeletonCard = () => (
  <div className="rounded-2xl overflow-hidden" style={{ background: '#16161f', border: '1px solid rgba(255,255,255,0.05)' }}>
    <div style={{ height: 4, background: 'rgba(255,255,255,0.03)' }} />
    <div className="p-5 space-y-3">
      <div className="skeleton h-5 w-2/3 rounded-lg" /><div className="skeleton h-4 w-full rounded-lg" /><div className="skeleton h-4 w-4/5 rounded-lg" />
      <div className="flex gap-2 mt-3"><div className="skeleton h-6 w-20 rounded-full" /><div className="skeleton h-6 w-16 rounded-full" /></div>
    </div>
  </div>
);

const CollabRequests = () => {
  const { user, onlineUsers } = useUser();
  const navigate = useNavigate();
  const [requests, setRequests] = useState([]);
  const [suggestedUsers, setSuggestedUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [selectedRoles, setSelectedRoles] = useState([]);

  const fetchData = async () => { 
    try { 
      setLoading(true);
      const [allRequests, allUsers] = await Promise.all([
        collaborationService.getAllCollaborationRequests(),
        import('../services').then(m => m.userService.searchUsers(''))
      ]);
      setRequests(allRequests); 
      
      // Filter out current user and take up to 4 random/first users
      if (allUsers) {
        const otherUsers = allUsers.filter(u => u.id !== user?.id).slice(0, 4);
        setSuggestedUsers(otherUsers);
      }
    } catch (e) {
      console.error(e);
    } finally { 
      setLoading(false); 
    } 
  };

  const fetchRequestsOnly = async () => {
    try { setRequests(await collaborationService.getAllCollaborationRequests()); } catch { }
  }

  const handleAccept = async (id) => { try { await collaborationService.acceptCollaborationRequest(id); showSuccess('Joined!'); navigate(`/collab/room/${id}`); } catch { showError('Error'); } };
  const handleDelete = async (id) => { if (await showConfirmation('Delete?', 'This is permanent.')) { try { await collaborationService.deleteCollaborationRequest(id); showSuccess('Deleted!'); fetchRequestsOnly(); } catch { showError('Error'); } } };
  const handleCreateOrUpdate = async () => {
    try {
      const payload = { title, description };
      if (editingId) await collaborationService.updateCollaborationRequest(editingId, payload);
      else await collaborationService.createCollaborationRequest(payload);
      showSuccess(editingId ? 'Updated!' : 'Posted!');
      handleClose(); fetchRequestsOnly();
    } catch { showError('Error'); }
  };
  const handleEdit = (r) => { setEditingId(r.id); setTitle(r.title); setDescription(r.description); setOpen(true); };
  const handleClose = () => { setOpen(false); setTitle(''); setDescription(''); setEditingId(null); setSelectedRoles([]); };
  const toggleRole = (role) => setSelectedRoles(prev => prev.includes(role) ? prev.filter(r => r !== role) : [...prev, role]);

  useEffect(() => { fetchData(); }, [user]);

  const accents = ['#a855f7', '#ec4899', '#06b6d4', '#10b981', '#f59e0b', '#6366f1'];
  const roleIcons = [<MusicNote />, <Headphones />, <Mic />, <CollabIcon />];

  return (
    <Box>
      {/* HERO */}
      <Box sx={{ position: 'relative', overflow: 'hidden', pt: { xs: 4, md: 6 }, pb: { xs: 4, md: 5 }, px: { xs: 2, md: 3 } }}>
        <Box sx={{ position: 'absolute', top: -120, left: '15%', width: 450, height: 450, borderRadius: '50%', background: 'radial-gradient(circle, rgba(236,72,153,0.06) 0%, transparent 70%)', pointerEvents: 'none' }} />
        <Box sx={{ position: 'absolute', top: -100, right: '20%', width: 400, height: 400, borderRadius: '50%', background: 'radial-gradient(circle, rgba(6,182,212,0.05) 0%, transparent 70%)', pointerEvents: 'none' }} />
        <Box sx={{ maxWidth: 700, position: 'relative', zIndex: 1 }}>
          <Box sx={{ display: 'inline-flex', alignItems: 'center', gap: 1, px: 2, py: 0.75, borderRadius: '10px', bgcolor: 'rgba(236,72,153,0.08)', border: '1px solid rgba(236,72,153,0.15)', mb: 3 }}>
            <CollabIcon sx={{ fontSize: 16, color: '#ec4899' }} /><Typography variant="caption" sx={{ color: '#ec4899', fontWeight: 600 }}>Creative Network</Typography>
          </Box>
          <Typography variant="h2" sx={{ fontWeight: 900, fontSize: { xs: '2rem', md: '2.8rem' }, lineHeight: 1.15, letterSpacing: '-1.5px', mb: 2, color: '#e0e0ef' }}>
            Find creative{' '}<span style={{ background: 'linear-gradient(135deg, #ec4899, #06b6d4)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>collaborators</span>
          </Typography>
          <Typography sx={{ color: '#5c5c72', fontSize: { xs: '0.95rem', md: '1.05rem' }, mb: 4, maxWidth: 550, lineHeight: 1.6 }}>
            Connect with artists, producers, and musicians. Build something amazing together.
          </Typography>
          <AppButton onClick={() => setOpen(true)} startIcon={<Add />} sx={{ background: 'linear-gradient(135deg, #ec4899, #06b6d4)', '&:hover': { boxShadow: '0 0 30px rgba(236,72,153,0.2)' } }}>
            Start Collaboration
          </AppButton>
        </Box>
      </Box>

      {/* SUGGESTED COLLABORATORS */}
      <Box sx={{ px: { xs: 2, md: 3 }, pb: 4 }}>
        {suggestedUsers.length > 0 && (
          <>
            <Typography variant="h6" fontWeight={700} sx={{ color: '#e0e0ef', mb: 2 }}>Suggested Collaborators</Typography>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {suggestedUsers.map(s => {
                const { level } = getMockUserMeta(s.name);
                return (
                  <Box key={s.id} sx={{ bgcolor: '#16161f', borderRadius: '14px', border: '1px solid rgba(255,255,255,0.05)', p: 2.5, textAlign: 'center', transition: 'all 0.3s', '&:hover': { borderColor: 'rgba(236,72,153,0.2)', transform: 'translateY(-3px)', boxShadow: '0 10px 40px rgba(236,72,153,0.08)' } }}>
                    <Avatar src={s.profileImage} sx={{ width: 44, height: 44, mx: 'auto', mb: 1.5, background: 'linear-gradient(135deg, #ec4899, #06b6d4)', fontSize: 16, fontWeight: 700 }}>{s.name[0]}</Avatar>
                    <Typography variant="subtitle2" fontWeight={700} sx={{ color: '#e0e0ef', mb: 0.25 }}>{s.name}</Typography>
                    <Typography variant="caption" sx={{ color: '#ec4899', fontWeight: 500, display: 'block', mb: 0.5 }}>{s.role || 'Member'}</Typography>
                    <Box sx={{ display: 'flex', justifyContent: 'center', mb: 1.5, mt: 1 }}><UserLevelChip level={level} /></Box>
                    <Button size="small" fullWidth startIcon={<PersonAdd sx={{ fontSize: 14 }} />} onClick={() => navigate(`/profile/${s.id}`)}
                      sx={{ borderRadius: '8px', textTransform: 'none', fontWeight: 600, fontSize: '0.7rem', bgcolor: 'rgba(236,72,153,0.08)', color: '#ec4899', border: '1px solid rgba(236,72,153,0.12)', '&:hover': { bgcolor: 'rgba(236,72,153,0.12)' } }}>
                      View Profile
                    </Button>
                  </Box>
                );
              })}
            </div>
          </>
        )}
      </Box>

      {/* COLLAB GRID */}
      <Box sx={{ px: { xs: 2, md: 3 }, pb: 7 }}>
        <PageHeader
          title="Open Collaborations"
          subtitle={`${requests.length} active collaboration request${requests.length === 1 ? '' : 's'}`}
          actions={<AppButton onClick={() => setOpen(true)}>New Request</AppButton>}
        />
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">{[...Array(6)].map((_, i) => <SkeletonCard key={i} />)}</div>
        ) : requests.length === 0 ? (
          <EmptyState
            icon={<CollabIcon sx={{ fontSize: 56, color: 'rgba(255,255,255,0.08)' }} />}
            title="No collaborations yet"
            description="Create a request and let creators discover your project vibe."
            action={<AppButton onClick={() => setOpen(true)}>Start Collaboration</AppButton>}
          />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {requests.map((req, idx) => {
              const isCreator = req.creatorId === getUserId(user);
              const isMember = req.memberIds?.includes(getUserId(user));
              const numMembers = req.memberIds?.length || 1;
              const numOnline = req.memberIds?.filter(id => onlineUsers?.has(id)).length || (onlineUsers?.has(req.creatorId) ? 1 : 0);
              const accent = accents[idx % accents.length];
              const roleIcon = roleIcons[idx % roleIcons.length];
              return (
                <Box key={req.id} sx={{ position: 'relative', bgcolor: '#16161f', borderRadius: '16px', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.05)', transition: 'all 0.3s', '&:hover': { transform: 'translateY(-4px)', boxShadow: `0 15px 50px ${accent}15`, borderColor: `${accent}30` } }}>
                  <Box sx={{ position: 'absolute', top: 0, right: 0, width: 150, height: 150, background: `radial-gradient(circle, ${accent}08 0%, transparent 70%)`, pointerEvents: 'none' }} />
                  <Box sx={{ height: 4, background: `linear-gradient(90deg, ${accent}, ${accent}60)` }} />
                  <Box sx={{ p: 3, display: 'flex', flexDirection: 'column', height: '100%' }}>
                    <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={1.5} sx={{ position: 'relative', zIndex: 1 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Box sx={{ width: 32, height: 32, borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: `${accent}12`, color: accent, '& .MuiSvgIcon-root': { fontSize: 18 } }}>{roleIcon}</Box>
                        <Typography variant="subtitle1" fontWeight={800} sx={{ color: '#e0e0ef', lineHeight: 1.2, fontSize: '1.15rem', letterSpacing: '-0.3px', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{req.title}</Typography>
                      </Box>
                      {isCreator && <Chip label="Your Room" size="small" sx={{ bgcolor: `${accent}12`, color: accent, fontWeight: 600, fontSize: '0.65rem', height: 24, border: `1px solid ${accent}20` }} />}
                    </Box>
                    <Typography variant="caption" sx={{ display: 'flex', alignItems: 'center', gap: 0.5, color: '#5c5c72', mb: 2, position: 'relative', zIndex: 1 }}>
                      <CollabIcon sx={{ fontSize: 14, opacity: 0.5 }} /> Hosted by <span style={{ color: '#e0e0ef', fontWeight: 600 }}>@{req.creatorName || req.creatorEmail?.split('@')[0] || 'creator'}</span>
                    </Typography>
                    <Typography variant="body2" sx={{ color: '#8b8b9e', lineHeight: 1.6, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden', mb: 2.5, position: 'relative', zIndex: 1 }}>{req.description}</Typography>

                    <Box sx={{ 
                      height: 80, 
                      borderRadius: '12px', 
                      mb: 2.5, 
                      p: 2,
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'space-between',
                      background: `linear-gradient(135deg, ${accent}10, rgba(255,255,255,0.02))`,
                      border: `1px dashed ${accent}30`,
                      position: 'relative', zIndex: 1
                    }}>
                      <Box>
                        <Typography variant="caption" sx={{ color: '#8b8b9e', display: 'block', mb: 0.5, fontWeight: 600 }}>Team Size</Typography>
                        <AvatarGroup max={4} sx={{ '& .MuiAvatar-root': { width: 32, height: 32, fontSize: '0.8rem', borderColor: '#16161f' }, justifyContent: 'flex-end' }}>
                           {Array.from({ length: numMembers }).map((_, i) => (
                             <Avatar key={i} sx={{ bgcolor: i === 0 ? accent : `${accent}80` }} />
                           ))}
                        </AvatarGroup>
                      </Box>
                      <CollabIcon sx={{ fontSize: 40, color: accent, opacity: 0.2 }} />
                    </Box>

                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, px: 1.5, py: 0.5, borderRadius: '6px', bgcolor: 'rgba(16,185,129,0.08)' }}>
                        <Box sx={{ width: 6, height: 6, borderRadius: '50%', bgcolor: '#10b981' }} />
                        <Typography variant="caption" sx={{ color: '#10b981', fontWeight: 700 }}>Open</Typography>
                      </Box>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, px: 1.5, py: 0.5, borderRadius: '6px', bgcolor: 'rgba(59,130,246,0.08)' }}>
                        <CollabIcon sx={{ fontSize: 14, color: '#3b82f6' }} />
                        <Typography variant="caption" sx={{ color: '#3b82f6', fontWeight: 600 }}>{numMembers} Members ({numOnline} Online)</Typography>
                      </Box>
                    </Box>

                    <Box sx={{ mt: 'auto', pt: 2, borderTop: '1px solid rgba(255,255,255,0.05)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Box display="flex" gap={1} alignItems="center" width="100%">
                        {!isMember && (
                          <Button size="small" fullWidth startIcon={<Send sx={{ fontSize: 14 }} />} onClick={() => handleAccept(req.id)}
                            sx={{ borderRadius: '8px', textTransform: 'none', fontWeight: 600, py: 0.75, background: `linear-gradient(135deg, ${accent}, ${accent}cc)`, color: 'white', '&:hover': { boxShadow: `0 0 20px ${accent}30` } }}>
                            Join Room
                          </Button>
                        )}
                        {isMember && (
                          <Button size="small" fullWidth onClick={() => navigate(`/collab/room/${req.id}`)}
                            sx={{ borderRadius: '8px', textTransform: 'none', fontWeight: 600, py: 0.75, bgcolor: `${accent}15`, color: accent, border: `1px solid ${accent}25`, '&:hover': { bgcolor: `${accent}25` } }}>
                            Open Room
                          </Button>
                        )}
                      </Box>
                    </Box>

                    {isCreator && (
                      <Box mt={2} display="flex" gap={1.5}>
                        <Button size="small" fullWidth onClick={() => handleEdit(req)}
                          sx={{ borderRadius: '8px', textTransform: 'none', fontWeight: 600, fontSize: '0.75rem', py: 0.75, color: '#c084fc', bgcolor: 'rgba(168,85,247,0.08)', border: '1px solid rgba(168,85,247,0.15)', '&:hover': { bgcolor: 'rgba(168,85,247,0.15)' } }}>Edit Room</Button>
                        <Button size="small" fullWidth onClick={() => handleDelete(req.id)}
                          sx={{ borderRadius: '8px', textTransform: 'none', fontWeight: 600, fontSize: '0.75rem', py: 0.75, color: '#ef4444', bgcolor: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.15)', '&:hover': { bgcolor: 'rgba(239,68,68,0.15)' } }}>Delete</Button>
                      </Box>
                    )}
                  </Box>
                </Box>
              );
            })}
          </div>
        )}
      </Box>

      {/* Dialog */}
      <AppModal open={open} onClose={handleClose} fullWidth maxWidth="sm">
        <DialogTitle sx={{ fontWeight: 700, color: '#e0e0ef' }}>{editingId ? 'Update' : 'Start a Collaboration'}</DialogTitle>
        <DialogContent>
          <AppInput label="What are you looking for?" placeholder="e.g. Looking for a vocalist for R&B track" fullWidth value={title} onChange={(e) => setTitle(e.target.value)} sx={{ mt: 2, ...inputSx }} />
          <AppInput label="Describe the vision" placeholder="Genre, vibe, mood, what you bring..." fullWidth multiline minRows={3} value={description} onChange={(e) => setDescription(e.target.value)} sx={{ mt: 2, ...inputSx }} />

          {/* Roles selector */}
          <Box sx={{ mt: 2 }}>
            <Typography variant="caption" sx={{ color: '#8b8b9e', fontWeight: 600, mb: 1, display: 'block' }}>Roles Needed</Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
              {ROLE_OPTIONS.map(role => (
                <Chip key={role} label={role} size="small" onClick={() => toggleRole(role)}
                  sx={{
                    cursor: 'pointer',
                    bgcolor: selectedRoles.includes(role) ? 'rgba(236,72,153,0.12)' : 'rgba(255,255,255,0.03)',
                    color: selectedRoles.includes(role) ? '#ec4899' : '#5c5c72',
                    border: `1px solid ${selectedRoles.includes(role) ? 'rgba(236,72,153,0.2)' : 'rgba(255,255,255,0.06)'}`,
                    fontWeight: selectedRoles.includes(role) ? 600 : 400,
                    '&:hover': { bgcolor: 'rgba(236,72,153,0.08)' },
                  }} />
              ))}
            </Box>
          </Box>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <AppButton kind="ghost" onClick={handleClose}>Cancel</AppButton>
          <AppButton onClick={handleCreateOrUpdate} sx={{ background: 'linear-gradient(135deg,#ec4899,#06b6d4)', '&:hover': { boxShadow: '0 0 20px rgba(236,72,153,0.2)' } }}>
            {editingId ? 'Update' : 'Post'}
          </AppButton>
        </DialogActions>
      </AppModal>
    </Box>
  );
};

export default CollabRequests;
