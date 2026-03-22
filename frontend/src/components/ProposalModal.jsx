import React, { useState } from 'react';
import { Box, Typography, TextField, Button, InputAdornment, Slider } from '@mui/material';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import SendIcon from '@mui/icons-material/Send';
import CloseIcon from '@mui/icons-material/Close';

const inputSx = {
  '& .MuiOutlinedInput-root': {
    borderRadius: '12px', bgcolor: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', color: '#e0e0ef',
    '& fieldset': { border: 'none' },
    '&:hover': { borderColor: 'rgba(245,158,11,0.2)' },
    '&.Mui-focused': { borderColor: 'rgba(245,158,11,0.4)', boxShadow: '0 0 20px rgba(245,158,11,0.08)' },
  },
  '& .MuiInputBase-input': { color: '#e0e0ef' },
  '& .MuiInputLabel-root': { color: '#5c5c72' },
  '& .MuiInputLabel-root.Mui-focused': { color: '#f59e0b' },
};

const ProposalModal = ({ open, onClose, job, onSubmit }) => {
  const [bid, setBid] = useState('');
  const [deliveryDays, setDeliveryDays] = useState(7);
  const [coverLetter, setCoverLetter] = useState('');
  const [submitting, setSubmitting] = useState(false);

  if (!open) return null;

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      await onSubmit?.({ bid: parseFloat(bid), deliveryDays, coverLetter });
      onClose();
    } catch { } finally { setSubmitting(false); }
  };

  return (
    <>
      <Box onClick={onClose}
        sx={{ position: 'fixed', inset: 0, bgcolor: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(8px)', zIndex: 1300 }} />
      <Box sx={{ position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', zIndex: 1301, width: '100%', maxWidth: 520, px: 2 }}>
        <Box sx={{ bgcolor: '#16161f', borderRadius: '20px', border: '1px solid rgba(255,255,255,0.06)', p: 4, boxShadow: '0 25px 100px rgba(0,0,0,0.5)' }}>
          {/* Header */}
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 3 }}>
            <Box>
              <Typography variant="h6" fontWeight={800} sx={{ color: '#e0e0ef', letterSpacing: '-0.3px' }}>
                Submit Proposal
              </Typography>
              <Typography variant="caption" sx={{ color: '#5c5c72' }}>
                for: {job?.title}
              </Typography>
            </Box>
            <Button onClick={onClose} sx={{ minWidth: 'auto', color: '#5c5c72', '&:hover': { color: '#e0e0ef' } }}>
              <CloseIcon sx={{ fontSize: 20 }} />
            </Button>
          </Box>

          {/* Bid */}
          <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
            <Box sx={{ flex: 1 }}>
              <Typography variant="caption" sx={{ color: '#8b8b9e', mb: 0.5, display: 'block', fontWeight: 600 }}>Your Bid</Typography>
              <TextField fullWidth value={bid} onChange={(e) => setBid(e.target.value)} type="number" placeholder="0.00"
                inputProps={{ min: 1 }} sx={inputSx}
                InputProps={{ startAdornment: <InputAdornment position="start"><AttachMoneyIcon sx={{ color: '#10b981', fontSize: 20 }} /></InputAdornment> }} />
            </Box>
            <Box sx={{ flex: 1 }}>
              <Typography variant="caption" sx={{ color: '#8b8b9e', mb: 0.5, display: 'block', fontWeight: 600 }}>Delivery Time</Typography>
              <TextField fullWidth value={deliveryDays} onChange={(e) => setDeliveryDays(e.target.value)} type="number" placeholder="7"
                inputProps={{ min: 1 }} sx={inputSx}
                InputProps={{ endAdornment: <InputAdornment position="end"><Typography sx={{ color: '#5c5c72', fontSize: '0.8rem' }}>days</Typography></InputAdornment> }} />
            </Box>
          </Box>

          {/* Cover Letter */}
          <Box sx={{ mb: 3 }}>
            <Typography variant="caption" sx={{ color: '#8b8b9e', mb: 0.5, display: 'block', fontWeight: 600 }}>Cover Letter</Typography>
            <TextField fullWidth multiline rows={4} value={coverLetter} onChange={(e) => setCoverLetter(e.target.value)}
              placeholder="Explain why you're the best fit for this job, your relevant experience, and how you plan to approach it..."
              sx={inputSx} />
          </Box>

          {/* Summary card */}
          {bid && (
            <Box sx={{ bgcolor: 'rgba(245,158,11,0.05)', borderRadius: '12px', border: '1px solid rgba(245,158,11,0.1)', p: 2, mb: 3, display: 'flex', justifyContent: 'space-around' }}>
              <Box sx={{ textAlign: 'center' }}>
                <Typography variant="caption" sx={{ color: '#5c5c72' }}>Your Bid</Typography>
                <Typography variant="subtitle2" fontWeight={800} sx={{ color: '#10b981' }}>${parseFloat(bid).toFixed(2)}</Typography>
              </Box>
              <Box sx={{ width: 1, bgcolor: 'rgba(255,255,255,0.05)' }} />
              <Box sx={{ textAlign: 'center' }}>
                <Typography variant="caption" sx={{ color: '#5c5c72' }}>Delivery</Typography>
                <Typography variant="subtitle2" fontWeight={800} sx={{ color: '#f59e0b' }}>{deliveryDays} days</Typography>
              </Box>
              <Box sx={{ width: 1, bgcolor: 'rgba(255,255,255,0.05)' }} />
              <Box sx={{ textAlign: 'center' }}>
                <Typography variant="caption" sx={{ color: '#5c5c72' }}>Platform Fee</Typography>
                <Typography variant="subtitle2" fontWeight={800} sx={{ color: '#ef4444' }}>10%</Typography>
              </Box>
            </Box>
          )}

          {/* Submit */}
          <Button fullWidth onClick={handleSubmit} disabled={!bid || !coverLetter.trim() || submitting}
            startIcon={<SendIcon sx={{ fontSize: 16 }} />}
            sx={{
              borderRadius: '12px', textTransform: 'none', fontWeight: 700, py: 1.5,
              background: bid && coverLetter.trim() ? 'linear-gradient(135deg, #f59e0b, #f97316)' : 'rgba(255,255,255,0.04)',
              color: bid && coverLetter.trim() ? 'white' : '#5c5c72',
              '&:hover': { boxShadow: '0 0 25px rgba(245,158,11,0.25)' },
              '&.Mui-disabled': { background: 'rgba(255,255,255,0.04)', color: '#3a3a4e' },
            }}
          >
            {submitting ? 'Submitting...' : 'Submit Proposal'}
          </Button>
        </Box>
      </Box>
    </>
  );
};

export default ProposalModal;
