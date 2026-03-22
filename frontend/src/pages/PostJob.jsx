import React, { useState } from 'react';
import { Box, TextField, Button, MenuItem, Typography, Stack } from '@mui/material';
import { DesktopDatePicker } from '@mui/x-date-pickers/DesktopDatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import PostAddIcon from '@mui/icons-material/PostAdd';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import { jobPostService } from '../services';
import { showSuccess, showError, formatDateToISO } from '../utils';
import { CollaborationType } from '../constants';

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
  '& .MuiSelect-icon': { color: '#5c5c72' },
};

const PostJob = () => {
  const [formData, setFormData] = useState({ title: '', description: '', skillsNeeded: '', collaborationType: '', availability: new Date(), image: null });
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (e) => setFormData(p => ({ ...p, [e.target.name]: e.target.value }));
  const handleDateChange = (date) => { if (date) setFormData(p => ({ ...p, availability: date })); };

  const handleSubmit = async (e) => {
    e.preventDefault(); setSubmitting(true);
    try {
      const payload = new FormData();
      payload.append('title', formData.title); payload.append('description', formData.description);
      payload.append('skillsNeeded', formData.skillsNeeded); payload.append('collaborationType', formData.collaborationType);
      payload.append('availability', formatDateToISO(formData.availability));
      if (formData.image) payload.append('image', formData.image);
      await jobPostService.createJobPost(payload); showSuccess('Job posted!');
      setFormData({ title: '', description: '', skillsNeeded: '', collaborationType: '', availability: new Date(), image: null });
    } catch (err) { showError('Error posting job'); } finally { setSubmitting(false); }
  };

  return (
    <Box sx={{ maxWidth: 700, mx: 'auto', mt: 2, mb: 4 }}>
      <Box sx={{ bgcolor: '#16161f', borderRadius: '20px', border: '1px solid rgba(255,255,255,0.05)', p: { xs: 3, md: 5 } }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1 }}>
          <PostAddIcon sx={{ fontSize: 26, color: '#a855f7' }} />
          <Typography variant="h5" fontWeight={800} sx={{ color: '#e0e0ef', letterSpacing: '-0.5px' }}>Post a Job</Typography>
        </Box>
        <Typography variant="body2" sx={{ color: '#5c5c72', mb: 4, ml: 5.5 }}>Create a collaboration opportunity.</Typography>

        <form onSubmit={handleSubmit}>
          <Stack spacing={3}>
            <TextField name="title" label="Job Title" fullWidth required value={formData.title} onChange={handleChange} sx={inputSx} />
            <TextField name="description" label="Description" fullWidth multiline rows={4} required value={formData.description} onChange={handleChange} sx={inputSx} />
            <TextField name="skillsNeeded" label="Skills Needed" fullWidth required value={formData.skillsNeeded} onChange={handleChange} sx={inputSx} />
            <TextField select label="Collaboration Type" name="collaborationType" value={formData.collaborationType} onChange={handleChange} fullWidth required sx={inputSx}
              SelectProps={{ MenuProps: { PaperProps: { sx: { bgcolor: '#1e1e2a', color: '#e0e0ef', '& .MuiMenuItem-root:hover': { bgcolor: 'rgba(168,85,247,0.1)' } } } } }}>
              <MenuItem value={CollaborationType.REMOTE}>{CollaborationType.REMOTE}</MenuItem>
              <MenuItem value={CollaborationType.IN_PERSON}>{CollaborationType.IN_PERSON}</MenuItem>
              <MenuItem value={CollaborationType.HYBRID}>{CollaborationType.HYBRID}</MenuItem>
            </TextField>
            <LocalizationProvider dateAdapter={AdapterDateFns}>
              <DesktopDatePicker label="Availability" format="dd/MM/yyyy" value={formData.availability} onChange={handleDateChange}
                shouldDisableDate={(d) => { const t = new Date(); t.setHours(0,0,0,0); return d < t; }}
                slotProps={{ textField: { fullWidth: true, required: true, sx: inputSx } }} />
            </LocalizationProvider>
            <Button variant="outlined" component="label" startIcon={<CloudUploadIcon />}
              sx={{ borderRadius: '12px', textTransform: 'none', fontWeight: 600, py: 1.5, borderColor: 'rgba(255,255,255,0.08)', color: '#8b8b9e', '&:hover': { borderColor: 'rgba(168,85,247,0.3)', color: '#a855f7' } }}>
              {formData.image ? formData.image.name : 'Upload Image'}
              <input hidden accept="image/*" type="file" onChange={(e) => setFormData(p => ({ ...p, image: e.target.files[0] }))} />
            </Button>
            <Button type="submit" disabled={submitting}
              sx={{ py: 1.5, borderRadius: '12px', fontWeight: 700, fontSize: '1rem', textTransform: 'none', background: 'linear-gradient(135deg,#a855f7,#6366f1)', color: 'white', '&:hover': { boxShadow: '0 0 25px rgba(168,85,247,0.25)' } }}>
              {submitting ? 'Submitting...' : 'Post Job'}
            </Button>
          </Stack>
        </form>
      </Box>
    </Box>
  );
};

export default PostJob;
