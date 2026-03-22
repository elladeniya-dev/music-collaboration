import React, { useState, useEffect } from 'react';
import { Box, TextField, Button, MenuItem, Typography, Stack, CircularProgress } from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import { useParams, useNavigate } from 'react-router-dom';
import { jobPostService } from '../services';
import { showSuccess, showError } from '../utils';
import { CollaborationType } from '../constants';
import { AppButton, AppCard, AppInput, PageHeader } from '../components/ui';

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
    <Box sx={{ maxWidth: 820, mx: 'auto', mt: 1, mb: 4 }} className="fade-in">
      <PageHeader
        title="Edit Job"
        subtitle="Refine your posting and keep applicants aligned with your expectations."
      />

      <AppCard sx={{ borderRadius: '20px', p: { xs: 3, md: 5 } }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 3 }}>
          <EditIcon sx={{ fontSize: 26, color: '#a855f7' }} />
          <Typography variant="h6" fontWeight={800} sx={{ color: '#e0e0ef', letterSpacing: '-0.5px' }}>Update Details</Typography>
        </Box>

        <form onSubmit={handleSubmit}>
          <Stack spacing={3}>
            <AppInput name="title" label="Title" fullWidth required value={formData.title} onChange={handleChange} sx={inputSx} />
            <AppInput name="description" label="Description" multiline rows={4} fullWidth required value={formData.description} onChange={handleChange} sx={inputSx} />
            <AppInput name="skillsNeeded" label="Skills Needed" fullWidth required value={formData.skillsNeeded} onChange={handleChange} sx={inputSx} />
            <AppInput select name="collaborationType" label="Type" value={formData.collaborationType} onChange={handleChange} fullWidth required sx={inputSx}
              SelectProps={{ MenuProps: { PaperProps: { sx: { bgcolor: '#1e1e2a', color: '#e0e0ef', '& .MuiMenuItem-root:hover': { bgcolor: 'rgba(168,85,247,0.1)' } } } } }}>
              <MenuItem value={CollaborationType.REMOTE}>{CollaborationType.REMOTE}</MenuItem>
              <MenuItem value={CollaborationType.IN_PERSON}>{CollaborationType.IN_PERSON}</MenuItem>
              <MenuItem value={CollaborationType.HYBRID}>{CollaborationType.HYBRID}</MenuItem>
            </AppInput>
            <AppInput type="date" name="availability" label="Availability" InputLabelProps={{ shrink: true }} value={formData.availability} onChange={handleChange} fullWidth required sx={inputSx} />
            <AppButton kind="secondary" component="label" startIcon={<CloudUploadIcon />}
              sx={{ borderRadius: '12px', textTransform: 'none', fontWeight: 600, py: 1.5, borderColor: 'rgba(255,255,255,0.08)', color: '#8b8b9e', '&:hover': { borderColor: 'rgba(168,85,247,0.3)', color: '#a855f7' } }}>
              {imageFile ? imageFile.name : 'Upload New Image'}
              <input hidden type="file" accept="image/*" onChange={(e) => setImageFile(e.target.files[0])} />
            </AppButton>
            <AppButton type="submit"
              sx={{ py: 1.5, borderRadius: '12px', fontWeight: 700, fontSize: '1rem' }}>
              Update Job
            </AppButton>
          </Stack>
        </form>
      </AppCard>
    </Box>
  );
};

export default EditJob;
