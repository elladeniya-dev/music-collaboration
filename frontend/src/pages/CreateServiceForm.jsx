import React, { useState } from 'react';
import {
  Box,
  TextField,
  Button,
  MenuItem,
  Typography,
  Chip,
  InputAdornment,
} from '@mui/material';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import FileUploadZone from '../components/FileUploadZone';
import { serviceService } from '../services';
import { showSuccess, showError } from '../utils';

const CATEGORIES = [
  'Music Production', 'Mixing & Mastering', 'Songwriting', 'Vocals',
  'Sound Design', 'Music Theory', 'Instrument Lessons', 'Video Production',
  'Graphic Design', 'Other',
];

const STEPS = [
  { label: 'Basics', desc: 'Title & Category' },
  { label: 'Details', desc: 'Description & Tags' },
  { label: 'Pricing', desc: 'Price & Delivery' },
  { label: 'Media', desc: 'Upload Files' },
];

const inputSx = {
  '& .MuiOutlinedInput-root': {
    borderRadius: '12px',
    bgcolor: 'rgba(255,255,255,0.03)',
    border: '1px solid rgba(255,255,255,0.06)',
    color: '#e0e0ef',
    '& fieldset': { border: 'none' },
    '&:hover': { borderColor: 'rgba(168,85,247,0.2)', bgcolor: 'rgba(255,255,255,0.05)' },
    '&.Mui-focused': { borderColor: 'rgba(168,85,247,0.4)', boxShadow: '0 0 20px rgba(168,85,247,0.08)' },
  },
  '& .MuiInputBase-input': { color: '#e0e0ef' },
  '& .MuiInputLabel-root': { color: '#5c5c72' },
  '& .MuiInputLabel-root.Mui-focused': { color: '#a855f7' },
  '& .MuiSelect-icon': { color: '#5c5c72' },
};

const CreateServiceForm = () => {
  const [step, setStep] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    title: '', category: '', description: '', tagsInput: '', tags: [],
    price: '', deliveryTime: '', mediaFiles: [],
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleTagKeyDown = (e) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      const tag = formData.tagsInput.trim();
      if (tag && !formData.tags.includes(tag)) {
        setFormData((prev) => ({ ...prev, tags: [...prev.tags, tag], tagsInput: '' }));
      }
    }
  };

  const removeTag = (t) => setFormData((prev) => ({ ...prev, tags: prev.tags.filter(x => x !== t) }));

  const handleFileDrop = (e) => {
    e.preventDefault();
    const files = Array.from(e.dataTransfer?.files || e.target?.files || []);
    setFormData((prev) => ({ ...prev, mediaFiles: [...prev.mediaFiles, ...files] }));
  };

  const canProceed = () => {
    if (step === 0) return formData.title.trim() && formData.category;
    if (step === 1) return formData.description.trim();
    if (step === 2) return formData.price && formData.deliveryTime;
    return true;
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      await serviceService.createService({
        title: formData.title,
        description: formData.description,
        price: parseFloat(formData.price),
        deliveryTime: parseInt(formData.deliveryTime, 10),
        category: formData.category,
        tags: formData.tags,
      });
      showSuccess('Service published! 🎉');
      setStep(0);
      setFormData({ title: '', category: '', description: '', tagsInput: '', tags: [], price: '', deliveryTime: '', mediaFiles: [] });
    } catch (err) {
      console.error(err);
      showError('Error creating service');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Box sx={{ maxWidth: 700, mx: 'auto', mt: 2, mb: 4, px: { xs: 2, md: 0 } }}>
      {/* ═══ Progress Bar ═══ */}
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 5, gap: 0 }}>
        {STEPS.map((s, i) => (
          <React.Fragment key={s.label}>
            <Box
              onClick={() => i < step && setStep(i)}
              sx={{
                display: 'flex', alignItems: 'center', gap: 1, cursor: i < step ? 'pointer' : 'default',
                flex: 1, justifyContent: 'center',
              }}
            >
              <Box
                sx={{
                  width: 32, height: 32, borderRadius: '50%',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '0.8rem', fontWeight: 700,
                  background: i <= step ? 'linear-gradient(135deg, #a855f7, #6366f1)' : 'rgba(255,255,255,0.04)',
                  color: i <= step ? 'white' : '#5c5c72',
                  boxShadow: i === step ? '0 0 25px rgba(168,85,247,0.3)' : 'none',
                  transition: 'all 0.3s',
                }}
              >
                {i < step ? <CheckCircleIcon sx={{ fontSize: 18 }} /> : i + 1}
              </Box>
              <Box sx={{ display: { xs: 'none', sm: 'block' } }}>
                <Typography variant="caption" sx={{ color: i <= step ? '#e0e0ef' : '#5c5c72', fontWeight: 600, display: 'block', lineHeight: 1.2 }}>
                  {s.label}
                </Typography>
                <Typography variant="caption" sx={{ color: '#4a4a5e', fontSize: '0.6rem' }}>
                  {s.desc}
                </Typography>
              </Box>
            </Box>
            {i < STEPS.length - 1 && (
              <Box sx={{ flex: 0.3, height: 2, borderRadius: 1, bgcolor: i < step ? '#a855f7' : 'rgba(255,255,255,0.04)', transition: 'background 0.3s' }} />
            )}
          </React.Fragment>
        ))}
      </Box>

      {/* ═══ Form Card ═══ */}
      <Box
        sx={{
          bgcolor: '#16161f',
          borderRadius: '20px',
          border: '1px solid rgba(255,255,255,0.05)',
          p: { xs: 3, md: 5 },
        }}
      >
        {/* Step 1: Basics */}
        {step === 0 && (
          <Box>
            <Typography variant="h5" fontWeight={800} sx={{ color: '#e0e0ef', mb: 0.5, letterSpacing: '-0.5px' }}>
              What service are you offering?
            </Typography>
            <Typography variant="body2" sx={{ color: '#5c5c72', mb: 4 }}>
              Start with a clear title and pick the right category.
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
              <TextField name="title" label="Service Title" placeholder="e.g. Professional Mixing & Mastering" fullWidth value={formData.title} onChange={handleChange} sx={inputSx} />
              <TextField select name="category" label="Category" fullWidth value={formData.category} onChange={handleChange} sx={inputSx}
                SelectProps={{ MenuProps: { PaperProps: { sx: { bgcolor: '#1e1e2a', color: '#e0e0ef', '& .MuiMenuItem-root:hover': { bgcolor: 'rgba(168,85,247,0.1)' } } } } }}
              >
                {CATEGORIES.map((c) => <MenuItem key={c} value={c}>{c}</MenuItem>)}
              </TextField>
            </Box>
          </Box>
        )}

        {/* Step 2: Details */}
        {step === 1 && (
          <Box>
            <Typography variant="h5" fontWeight={800} sx={{ color: '#e0e0ef', mb: 0.5, letterSpacing: '-0.5px' }}>
              Describe your service
            </Typography>
            <Typography variant="body2" sx={{ color: '#5c5c72', mb: 4 }}>
              Tell buyers exactly what they'll get.
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
              <TextField name="description" label="Description" placeholder="Explain your service, what's included, turnaround..." multiline rows={5} fullWidth value={formData.description} onChange={handleChange} sx={inputSx} />
              <Box>
                <TextField name="tagsInput" label="Tags" placeholder="Press Enter to add" fullWidth value={formData.tagsInput} onChange={handleChange} onKeyDown={handleTagKeyDown} sx={inputSx} />
                {formData.tags.length > 0 && (
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mt: 1.5 }}>
                    {formData.tags.map((tag) => (
                      <Chip key={tag} label={tag} size="small" onDelete={() => removeTag(tag)}
                        sx={{
                          bgcolor: 'rgba(168,85,247,0.1)', color: '#c084fc', fontWeight: 600, borderRadius: '8px',
                          border: '1px solid rgba(168,85,247,0.15)',
                          '& .MuiChip-deleteIcon': { color: '#a855f7', '&:hover': { color: '#c084fc' } },
                        }}
                      />
                    ))}
                  </Box>
                )}
              </Box>
            </Box>
          </Box>
        )}

        {/* Step 3: Pricing */}
        {step === 2 && (
          <Box>
            <Typography variant="h5" fontWeight={800} sx={{ color: '#e0e0ef', mb: 0.5, letterSpacing: '-0.5px' }}>
              Set your pricing
            </Typography>
            <Typography variant="body2" sx={{ color: '#5c5c72', mb: 4 }}>
              Set a competitive price and delivery time.
            </Typography>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-5">
              {/* Price Card */}
              <Box sx={{ bgcolor: 'rgba(255,255,255,0.02)', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.05)', p: 3, textAlign: 'center' }}>
                <AttachMoneyIcon sx={{ fontSize: 36, color: '#10b981', mb: 1 }} />
                <Typography variant="subtitle2" sx={{ color: '#8b8b9e', mb: 2 }}>Starting Price</Typography>
                <TextField name="price" type="number" placeholder="0.00" fullWidth value={formData.price} onChange={handleChange}
                  inputProps={{ min: 1, step: 0.01 }}
                  sx={{ ...inputSx, '& .MuiOutlinedInput-root': { ...inputSx['& .MuiOutlinedInput-root'], textAlign: 'center' } }}
                  InputProps={{ startAdornment: <InputAdornment position="start"><Typography sx={{ color: '#10b981', fontWeight: 700 }}>$</Typography></InputAdornment> }}
                />
              </Box>
              {/* Delivery Card */}
              <Box sx={{ bgcolor: 'rgba(255,255,255,0.02)', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.05)', p: 3, textAlign: 'center' }}>
                <AccessTimeIcon sx={{ fontSize: 36, color: '#6366f1', mb: 1 }} />
                <Typography variant="subtitle2" sx={{ color: '#8b8b9e', mb: 2 }}>Delivery Time</Typography>
                <TextField name="deliveryTime" type="number" placeholder="0" fullWidth value={formData.deliveryTime} onChange={handleChange}
                  inputProps={{ min: 1 }}
                  sx={inputSx}
                  InputProps={{ endAdornment: <InputAdornment position="end"><Typography sx={{ color: '#5c5c72' }}>days</Typography></InputAdornment> }}
                />
              </Box>
            </div>
          </Box>
        )}

        {/* Step 4: Media */}
        {step === 3 && (
          <Box>
            <Typography variant="h5" fontWeight={800} sx={{ color: '#e0e0ef', mb: 0.5, letterSpacing: '-0.5px' }}>
              Add media (optional)
            </Typography>
            <Typography variant="body2" sx={{ color: '#5c5c72', mb: 4 }}>
              Upload samples, portfolio work, or images to showcase your service.
            </Typography>
            <FileUploadZone
              files={formData.mediaFiles}
              onChange={(files) => setFormData(prev => ({ ...prev, mediaFiles: files }))}
              accept="image/*,audio/*"
              maxFiles={5}
              accent="#a855f7"
            />
          </Box>
        )}

        {/* ═══ Navigation ═══ */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 5, pt: 3, borderTop: '1px solid rgba(255,255,255,0.05)' }}>
          <Button
            onClick={() => setStep(s => s - 1)}
            disabled={step === 0}
            startIcon={<ArrowBackIcon />}
            sx={{ borderRadius: '12px', textTransform: 'none', fontWeight: 600, color: '#8b8b9e', '&:hover': { bgcolor: 'rgba(255,255,255,0.04)' }, '&.Mui-disabled': { color: '#3a3a4e' } }}
          >
            Back
          </Button>

          {step < STEPS.length - 1 ? (
            <Button
              onClick={() => setStep(s => s + 1)}
              disabled={!canProceed()}
              endIcon={<ArrowForwardIcon />}
              sx={{
                borderRadius: '12px', textTransform: 'none', fontWeight: 700, px: 4, py: 1,
                background: canProceed() ? 'linear-gradient(135deg, #a855f7, #6366f1)' : 'rgba(255,255,255,0.04)',
                color: canProceed() ? 'white' : '#5c5c72',
                '&:hover': { boxShadow: '0 0 25px rgba(168,85,247,0.25)' },
                '&.Mui-disabled': { background: 'rgba(255,255,255,0.04)', color: '#3a3a4e' },
              }}
            >
              Continue
            </Button>
          ) : (
            <Button
              onClick={handleSubmit}
              disabled={submitting}
              sx={{
                borderRadius: '12px', textTransform: 'none', fontWeight: 700, px: 4, py: 1,
                background: 'linear-gradient(135deg, #10b981, #059669)',
                color: 'white',
                '&:hover': { boxShadow: '0 0 25px rgba(16,185,129,0.25)' },
              }}
            >
              {submitting ? 'Publishing...' : '🚀 Publish Service'}
            </Button>
          )}
        </Box>
      </Box>
    </Box>
  );
};

export default CreateServiceForm;
