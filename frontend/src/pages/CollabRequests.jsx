import React, { useEffect, useState } from 'react';
import {
  Typography, Button, CircularProgress,
  Dialog, DialogTitle, DialogContent, TextField, DialogActions, Chip,
  Tooltip, IconButton, Box, Avatar
} from '@mui/material';
import { Edit, Send, Add, Delete, Group as CollabIcon, MusicNote, Headphones, Mic, Close as CloseIcon, PersonAdd } from '@mui/icons-material';
import { useUser } from '../context/UserContext';
import { useNavigate } from 'react-router-dom';
import { collaborationService } from '../services';
import { showSuccess, showError, showConfirmation, getUserId } from '../utils';
import { UserLevelChip, UserBadges, getMockUserMeta } from '../components/UserBadge';

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

const SUGGESTED_COLLABS = [
  { id: 's1', name: 'Maya Thomas', role: 'Vocalist', genre: 'R&B / Soul', avatar: null },
  { id: 's2', name: 'Jake Wilson', role: 'Producer', genre: 'Hip-Hop / Trap', avatar: null },
  { id: 's3', name: 'Priya Sharma', role: 'Sound Designer', genre: 'Electronic', avatar: null },
  { id: 's4', name: 'Leo Martinez', role: 'Guitarist', genre: 'Indie / Rock', avatar: null },
];

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
  const { user } = useUser();
  const navigate = useNavigate();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [selectedRoles, setSelectedRoles] = useState([]);

  const fetchRequests = async () => { try { setRequests(await collaborationService.getAllCollaborationRequests()); } catch { } finally { setLoading(false); } };
  const handleAccept = async (id) => { try { await collaborationService.acceptCollaborationRequest(id); showSuccess('Joined!'); fetchRequests(); } catch { showError('Error'); } };
  const handleDelete = async (id) => { if (await showConfirmation('Delete?', 'This is permanent.')) { try { await collaborationService.deleteCollaborationRequest(id); showSuccess('Deleted!'); fetchRequests(); } catch { showError('Error'); } } };
  const handleCreateOrUpdate = async () => {
    try {
      const payload = { title, description };
      if (editingId) await collaborationService.updateCollaborationRequest(editingId, payload);
      else await collaborationService.createCollaborationRequest(payload);
      showSuccess(editingId ? 'Updated!' : 'Posted!');
      handleClose(); fetchRequests();
    } catch { showError('Error'); }
  };
  const handleEdit = (r) => { setEditingId(r.id); setTitle(r.title); setDescription(r.description); setOpen(true); };
  const handleClose = () => { setOpen(false); setTitle(''); setDescription(''); setEditingId(null); setSelectedRoles([]); };
  const toggleRole = (role) => setSelectedRoles(prev => prev.includes(role) ? prev.filter(r => r !== role) : [...prev, role]);

  useEffect(() => { fetchRequests(); }, []);

  const accents = ['#a855f7', '#ec4899', '#06b6d4', '#10b981', '#f59e0b', '#6366f1'];
  const roleIcons = [<MusicNote />, <Headphones />, <Mic />, <CollabIcon />];

  return (
    <Box>
      {/* HERO */}
      <Box sx={{ position: 'relative', overflow: 'hidden', pt: { xs: 8, md: 10 }, pb: { xs: 5, md: 8 }, px: { xs: 3, md: 6 } }}>
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
          <Button onClick={() => setOpen(true)} startIcon={<Add />}
            sx={{ borderRadius: '12px', textTransform: 'none', fontWeight: 700, px: 3.5, py: 1.25, background: 'linear-gradient(135deg, #ec4899, #06b6d4)', color: 'white', '&:hover': { boxShadow: '0 0 30px rgba(236,72,153,0.2)' } }}>
            Start Collaboration
          </Button>
        </Box>
      </Box>

      {/* SUGGESTED COLLABORATORS */}
      <Box sx={{ px: { xs: 3, md: 6 }, pb: 5 }}>
        <Typography variant="h6" fontWeight={700} sx={{ color: '#e0e0ef', mb: 2 }}>Suggested Collaborators</Typography>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {SUGGESTED_COLLABS.map(s => {
            const { level, badges } = getMockUserMeta(s.name);
            return (
              <Box key={s.id} sx={{ bgcolor: '#16161f', borderRadius: '14px', border: '1px solid rgba(255,255,255,0.05)', p: 2.5, textAlign: 'center', transition: 'all 0.3s', '&:hover': { borderColor: 'rgba(236,72,153,0.2)', transform: 'translateY(-3px)', boxShadow: '0 10px 40px rgba(236,72,153,0.08)' } }}>
                <Avatar sx={{ width: 44, height: 44, mx: 'auto', mb: 1.5, background: 'linear-gradient(135deg, #ec4899, #06b6d4)', fontSize: 16, fontWeight: 700 }}>{s.name[0]}</Avatar>
                <Typography variant="subtitle2" fontWeight={700} sx={{ color: '#e0e0ef', mb: 0.25 }}>{s.name}</Typography>
                <Typography variant="caption" sx={{ color: '#ec4899', fontWeight: 500, display: 'block', mb: 0.5 }}>{s.role}</Typography>
                <Typography variant="caption" sx={{ color: '#5c5c72', display: 'block', mb: 1 }}>{s.genre}</Typography>
                <Box sx={{ display: 'flex', justifyContent: 'center', mb: 1.5 }}><UserLevelChip level={level} /></Box>
                <Button size="small" fullWidth startIcon={<PersonAdd sx={{ fontSize: 14 }} />}
                  sx={{ borderRadius: '8px', textTransform: 'none', fontWeight: 600, fontSize: '0.7rem', bgcolor: 'rgba(236,72,153,0.08)', color: '#ec4899', border: '1px solid rgba(236,72,153,0.12)', '&:hover': { bgcolor: 'rgba(236,72,153,0.12)' } }}>
                  Connect
                </Button>
              </Box>
            );
          })}
        </div>
      </Box>

      {/* COLLAB GRID */}
      <Box sx={{ px: { xs: 3, md: 6 }, pb: 8 }}>
        <Typography variant="h6" fontWeight={700} sx={{ color: '#e0e0ef', mb: 3 }}>Open Collaborations</Typography>
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">{[...Array(6)].map((_, i) => <SkeletonCard key={i} />)}</div>
        ) : requests.length === 0 ? (
          <Box sx={{ textAlign: 'center', py: 10 }}>
            <CollabIcon sx={{ fontSize: 56, color: 'rgba(255,255,255,0.06)', mb: 2 }} />
            <Typography variant="h6" sx={{ color: '#5c5c72' }}>No collaborations yet</Typography>
          </Box>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {requests.map((req, idx) => {
              const isCreator = req.creatorId === getUserId(user);
              const accent = accents[idx % accents.length];
              const roleIcon = roleIcons[idx % roleIcons.length];
              return (
                <Box key={req.id} sx={{ bgcolor: '#16161f', borderRadius: '16px', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.05)', transition: 'all 0.3s', '&:hover': { transform: 'translateY(-4px)', boxShadow: `0 15px 50px ${accent}15`, borderColor: `${accent}30` } }}>
                  <Box sx={{ height: 4, background: `linear-gradient(90deg, ${accent}, ${accent}60)` }} />
                  <Box sx={{ p: 3 }}>
                    <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={1}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Box sx={{ width: 32, height: 32, borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: `${accent}12`, color: accent, '& .MuiSvgIcon-root': { fontSize: 18 } }}>{roleIcon}</Box>
                        <Typography variant="subtitle2" fontWeight={700} sx={{ color: '#e0e0ef', lineHeight: 1.2 }}>{req.title}</Typography>
                      </Box>
                      {isCreator && <Chip label="You" size="small" sx={{ bgcolor: `${accent}12`, color: accent, fontWeight: 600, fontSize: '0.6rem', height: 20, border: `1px solid ${accent}20` }} />}
                    </Box>
                    <Typography variant="caption" sx={{ display: 'block', color: '#5c5c72', mb: 1.5 }}>by {req.creatorEmail || req.creatorId}</Typography>
                    <Typography variant="body2" sx={{ color: '#8b8b9e', lineHeight: 1.6, display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden', mb: 2 }}>{req.description}</Typography>
                    <Box sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.5, px: 1.5, py: 0.5, borderRadius: '8px', bgcolor: 'rgba(16,185,129,0.06)', border: '1px solid rgba(16,185,129,0.1)', mb: 2 }}>
                      <Box sx={{ width: 6, height: 6, borderRadius: '50%', bgcolor: '#10b981' }} />
                      <Typography variant="caption" sx={{ color: '#10b981', fontWeight: 600, fontSize: '0.65rem' }}>Open to Collaborate</Typography>
                    </Box>
                    <Box display="flex" gap={1} alignItems="center">
                      {!isCreator && (
                        <Button size="small" startIcon={<Send sx={{ fontSize: 14 }} />} onClick={() => handleAccept(req.id)}
                          sx={{ borderRadius: '10px', textTransform: 'none', fontWeight: 600, px: 2, py: 0.75, background: `linear-gradient(135deg, ${accent}, ${accent}cc)`, color: 'white', '&:hover': { boxShadow: `0 0 20px ${accent}30` } }}>
                          Join
                        </Button>
                      )}
                      {isCreator && (
                        <Button size="small" onClick={() => navigate(`/collab/room`)}
                          sx={{ borderRadius: '10px', textTransform: 'none', fontWeight: 600, px: 2, py: 0.75, bgcolor: 'rgba(236,72,153,0.08)', color: '#ec4899', border: '1px solid rgba(236,72,153,0.12)', '&:hover': { bgcolor: 'rgba(236,72,153,0.12)' } }}>
                          Open Room
                        </Button>
                      )}
                      {isCreator && (
                        <>
                          <Tooltip title="Edit"><IconButton size="small" onClick={() => handleEdit(req)} sx={{ color: '#a855f7' }}><Edit fontSize="small" /></IconButton></Tooltip>
                          <Tooltip title="Delete"><IconButton size="small" onClick={() => handleDelete(req.id)} sx={{ color: '#ef4444' }}><Delete fontSize="small" /></IconButton></Tooltip>
                        </>
                      )}
                    </Box>
                  </Box>
                </Box>
              );
            })}
          </div>
        )}
      </Box>

      {/* Dialog */}
      <Dialog open={open} onClose={handleClose} fullWidth maxWidth="sm"
        PaperProps={{ sx: { bgcolor: '#16161f', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '16px', color: '#e0e0ef' } }}>
        <DialogTitle sx={{ fontWeight: 700, color: '#e0e0ef' }}>{editingId ? 'Update' : 'Start a Collaboration'}</DialogTitle>
        <DialogContent>
          <TextField label="What are you looking for?" placeholder="e.g. Looking for a vocalist for R&B track" fullWidth value={title} onChange={(e) => setTitle(e.target.value)} sx={{ mt: 2, ...inputSx }} />
          <TextField label="Describe the vision" placeholder="Genre, vibe, mood, what you bring..." fullWidth multiline minRows={3} value={description} onChange={(e) => setDescription(e.target.value)} sx={{ mt: 2, ...inputSx }} />

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
          <Button onClick={handleClose} sx={{ borderRadius: '10px', textTransform: 'none', color: '#5c5c72' }}>Cancel</Button>
          <Button onClick={handleCreateOrUpdate}
            sx={{ borderRadius: '10px', textTransform: 'none', fontWeight: 600, background: 'linear-gradient(135deg,#ec4899,#06b6d4)', color: 'white', '&:hover': { boxShadow: '0 0 20px rgba(236,72,153,0.2)' } }}>
            {editingId ? 'Update' : 'Post'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default CollabRequests;
