import React, { useState, useEffect } from 'react';
import { Box, TextField, Button, MenuItem, Typography, Stack, CircularProgress } from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import { useParams, useNavigate } from 'react-router-dom';
import { jobPostService } from '../services';
import { showSuccess, showError } from '../utils';
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

const EditJob = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [formData, setFormData] = useState(null);
  const [imageFile, setImageFile] = useState(null);

  useEffect(() => {
    jobPostService.getJobPostById(id).then(setFormData).catch(() => showError('Failed to load.'));
  }, [id]);

  const handleChange = (e) => setFormData(p => ({ ...p, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    const payload = new FormData();
    ['title', 'description', 'skillsNeeded', 'collaborationType', 'availability'].forEach(k => payload.append(k, formData[k]));
    if (imageFile) payload.append('image', imageFile);
    try { await jobPostService.updateJobPost(id, payload); showSuccess('Updated!'); navigate('/job'); } catch { showError('Error updating.'); }
  };

  if (!formData) return <Box display="flex" justifyContent="center" mt={10}><CircularProgress sx={{ color: '#a855f7' }} /></Box>;

  return (
    <Box sx={{ maxWidth: 700, mx: 'auto', mt: 2, mb: 4 }}>
      <Box sx={{ bgcolor: '#16161f', borderRadius: '20px', border: '1px solid rgba(255,255,255,0.05)', p: { xs: 3, md: 5 } }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1 }}>
          <EditIcon sx={{ fontSize: 26, color: '#a855f7' }} />
          <Typography variant="h5" fontWeight={800} sx={{ color: '#e0e0ef', letterSpacing: '-0.5px' }}>Update Job</Typography>
        </Box>
        <Typography variant="body2" sx={{ color: '#5c5c72', mb: 4, ml: 5.5 }}>Edit your job posting details.</Typography>

        <form onSubmit={handleSubmit}>
          <Stack spacing={3}>
            <TextField name="title" label="Title" fullWidth required value={formData.title} onChange={handleChange} sx={inputSx} />
            <TextField name="description" label="Description" multiline rows={4} fullWidth required value={formData.description} onChange={handleChange} sx={inputSx} />
            <TextField name="skillsNeeded" label="Skills Needed" fullWidth required value={formData.skillsNeeded} onChange={handleChange} sx={inputSx} />
            <TextField select name="collaborationType" label="Type" value={formData.collaborationType} onChange={handleChange} fullWidth required sx={inputSx}
              SelectProps={{ MenuProps: { PaperProps: { sx: { bgcolor: '#1e1e2a', color: '#e0e0ef', '& .MuiMenuItem-root:hover': { bgcolor: 'rgba(168,85,247,0.1)' } } } } }}>
              <MenuItem value={CollaborationType.REMOTE}>{CollaborationType.REMOTE}</MenuItem>
              <MenuItem value={CollaborationType.IN_PERSON}>{CollaborationType.IN_PERSON}</MenuItem>
              <MenuItem value={CollaborationType.HYBRID}>{CollaborationType.HYBRID}</MenuItem>
            </TextField>
            <TextField type="date" name="availability" label="Availability" InputLabelProps={{ shrink: true }} value={formData.availability} onChange={handleChange} fullWidth required sx={inputSx} />
            <Button variant="outlined" component="label" startIcon={<CloudUploadIcon />}
              sx={{ borderRadius: '12px', textTransform: 'none', fontWeight: 600, py: 1.5, borderColor: 'rgba(255,255,255,0.08)', color: '#8b8b9e', '&:hover': { borderColor: 'rgba(168,85,247,0.3)', color: '#a855f7' } }}>
              {imageFile ? imageFile.name : 'Upload New Image'}
              <input hidden type="file" accept="image/*" onChange={(e) => setImageFile(e.target.files[0])} />
            </Button>
            <Button type="submit"
              sx={{ py: 1.5, borderRadius: '12px', fontWeight: 700, fontSize: '1rem', textTransform: 'none', background: 'linear-gradient(135deg,#a855f7,#6366f1)', color: 'white', '&:hover': { boxShadow: '0 0 25px rgba(168,85,247,0.25)' } }}>
              Update Job
            </Button>
          </Stack>
        </form>
      </Box>
    </Box>
  );
};

export default EditJob;
