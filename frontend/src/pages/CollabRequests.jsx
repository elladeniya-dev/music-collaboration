import React, { useEffect, useState } from 'react';
import {
  Typography, Card, CardContent, Button, CircularProgress,
  Dialog, DialogTitle, DialogContent, TextField, DialogActions, Chip,
  Tooltip, IconButton, Box
} from '@mui/material';
import { Edit, Send, Add, Delete, Group as CollabIcon } from '@mui/icons-material';
import { useUser } from '../context/UserContext';
import { collaborationService } from '../services';
import { showSuccess, showError, showConfirmation } from '../utils';
import { getUserId } from '../utils';

const inputSx = {
  '& .MuiOutlinedInput-root': {
    borderRadius: '12px', bgcolor: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', color: '#e0e0ef',
    '& fieldset': { border: 'none' },
    '&:hover': { borderColor: 'rgba(168,85,247,0.2)' },
    '&.Mui-focused': { borderColor: 'rgba(168,85,247,0.4)', boxShadow: '0 0 20px rgba(168,85,247,0.08)' },
  },
  '& .MuiInputBase-input': { color: '#e0e0ef' },
  '& .MuiInputLabel-root': { color: '#5c5c72' },
  '& .MuiInputLabel-root.Mui-focused': { color: '#a855f7' },
};

const CollabRequests = () => {
  const { user } = useUser();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');

  const fetchRequests = async () => {
    try { setRequests(await collaborationService.getAllCollaborationRequests()); } catch (e) { console.error(e); } finally { setLoading(false); }
  };
  const handleAccept = async (id) => {
    try { await collaborationService.acceptCollaborationRequest(id); showSuccess('Accepted!'); fetchRequests(); } catch { showError('Error'); }
  };
  const handleDelete = async (id) => {
    if (await showConfirmation('Are you sure?', 'Permanently delete?')) {
      try { await collaborationService.deleteCollaborationRequest(id); showSuccess('Deleted!'); fetchRequests(); } catch { showError('Error'); }
    }
  };
  const handleCreateOrUpdate = async () => {
    try {
      if (editingId) { await collaborationService.updateCollaborationRequest(editingId, { title, description }); showSuccess('Updated!'); }
      else { await collaborationService.createCollaborationRequest({ title, description }); showSuccess('Created!'); }
      handleClose(); fetchRequests();
    } catch { showError('Error'); }
  };
  const handleEdit = (r) => { setEditingId(r.id); setTitle(r.title); setDescription(r.description); setOpen(true); };
  const handleClose = () => { setOpen(false); setTitle(''); setDescription(''); setEditingId(null); };

  useEffect(() => { fetchRequests(); }, []);

  return (
    <Box sx={{ py: 1 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
        <Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <CollabIcon sx={{ fontSize: 26, color: '#a855f7' }} />
            <Typography variant="h5" fontWeight={800} sx={{ color: '#e0e0ef', letterSpacing: '-0.5px' }}>Collaboration Requests</Typography>
          </Box>
          <Typography variant="body2" sx={{ mt: 0.5, ml: 5.5, color: '#5c5c72' }}>Find collaborators or offer to help.</Typography>
        </Box>
        <Button onClick={() => setOpen(true)} startIcon={<Add />}
          sx={{ borderRadius: '12px', textTransform: 'none', fontWeight: 600, px: 3, py: 1, background: 'linear-gradient(135deg,#a855f7,#6366f1)', color: 'white', '&:hover': { boxShadow: '0 0 25px rgba(168,85,247,0.25)' } }}>
          Add Request
        </Button>
      </Box>

      {loading ? (
        <Box display="flex" justifyContent="center" mt={8}><CircularProgress sx={{ color: '#a855f7' }} /></Box>
      ) : requests.length === 0 ? (
        <Box sx={{ textAlign: 'center', mt: 10 }}>
          <CollabIcon sx={{ fontSize: 56, color: 'rgba(255,255,255,0.06)', mb: 2 }} />
          <Typography variant="h6" sx={{ color: '#5c5c72' }}>No requests yet.</Typography>
        </Box>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {requests.map((req) => {
            const isCreator = req.creatorId === getUserId(user);
            return (
              <Box key={req.id} sx={{
                bgcolor: '#16161f', borderRadius: '16px', p: 3, border: '1px solid rgba(255,255,255,0.05)',
                transition: 'all 0.3s', '&:hover': { borderColor: 'rgba(168,85,247,0.2)', boxShadow: '0 0 30px rgba(168,85,247,0.08)', transform: 'translateY(-3px)' },
              }}>
                <Box display="flex" justifyContent="space-between" alignItems="flex-start">
                  <Typography variant="subtitle1" fontWeight={700} sx={{ color: '#e0e0ef', lineHeight: 1.3, flex: 1 }}>{req.title}</Typography>
                  {isCreator && <Chip label="You" size="small" sx={{ ml: 1, bgcolor: 'rgba(168,85,247,0.1)', color: '#c084fc', fontWeight: 600, fontSize: '0.65rem', height: 20, border: '1px solid rgba(168,85,247,0.15)' }} />}
                </Box>
                <Typography variant="caption" sx={{ display: 'block', mt: 0.5, color: '#5c5c72' }}>by {req.creatorEmail || req.creatorId}</Typography>
                <Typography variant="body2" sx={{ mt: 1.5, color: '#8b8b9e', lineHeight: 1.6, display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{req.description}</Typography>
                <Box display="flex" gap={1} mt={2} alignItems="center">
                  {!isCreator && (
                    <Button size="small" startIcon={<Send sx={{ fontSize: 14 }} />} onClick={() => handleAccept(req.id)}
                      sx={{ borderRadius: '10px', textTransform: 'none', fontWeight: 600, bgcolor: 'rgba(16,185,129,0.1)', color: '#10b981', border: '1px solid rgba(16,185,129,0.15)', '&:hover': { bgcolor: 'rgba(16,185,129,0.15)' } }}>
                      Apply
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
            );
          })}
        </div>
      )}

      <Dialog open={open} onClose={handleClose} fullWidth maxWidth="sm"
        PaperProps={{ sx: { bgcolor: '#16161f', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '16px', color: '#e0e0ef' } }}>
        <DialogTitle sx={{ fontWeight: 700, color: '#e0e0ef' }}>{editingId ? 'Update Request' : 'Create Request'}</DialogTitle>
        <DialogContent>
          <TextField label="Title" fullWidth value={title} onChange={(e) => setTitle(e.target.value)} sx={{ mt: 2, ...inputSx }} />
          <TextField label="Description" fullWidth multiline minRows={3} value={description} onChange={(e) => setDescription(e.target.value)} sx={{ mt: 2, ...inputSx }} />
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={handleClose} sx={{ borderRadius: '10px', textTransform: 'none', color: '#5c5c72' }}>Cancel</Button>
          <Button variant="contained" onClick={handleCreateOrUpdate}
            sx={{ borderRadius: '10px', textTransform: 'none', fontWeight: 600, background: 'linear-gradient(135deg,#a855f7,#6366f1)', '&:hover': { boxShadow: '0 0 20px rgba(168,85,247,0.2)' } }}>
            {editingId ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default CollabRequests;
