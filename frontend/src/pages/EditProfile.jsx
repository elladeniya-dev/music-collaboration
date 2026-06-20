import React, { useState, useEffect } from 'react';
import { Box, Typography, Avatar, Button, TextField, IconButton, CircularProgress, MenuItem } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import CameraAltIcon from '@mui/icons-material/CameraAlt';
import SaveIcon from '@mui/icons-material/Save';
import LogoutIcon from '@mui/icons-material/Logout';
import DeleteIcon from '@mui/icons-material/Delete';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../context/UserContext';
import { TagGroup } from '../components/Tag';
import Tag from '../components/Tag';
import FileUploadZone from '../components/FileUploadZone';
import PortfolioItem from '../components/PortfolioItem';
import { showSuccess, showError } from '../utils';
import { userService } from '../services';
import { AppButton, AppInput, EmptyState, PageHeader } from '../components/ui';

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

const TABS = ['Profile Info', 'Portfolio', 'Skills & Tools', 'Account'];

const EditProfile = () => {
  const { user, setUser } = useUser();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState(0);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  const [profile, setProfile] = useState({
    name: user?.name || '',
    role: '',
    bio: '',
  });
  const [skills, setSkills] = useState([]);
  const [tools, setTools] = useState([]);
  const [genres, setGenres] = useState([]);
  
  const [skillInput, setSkillInput] = useState('');
  const [toolInput, setToolInput] = useState('');
  const [genreInput, setGenreInput] = useState('');
  
  const [portfolioFiles, setPortfolioFiles] = useState([]);
  const [portfolioItems, setPortfolioItems] = useState([]);
  
  const [availability, setAvailability] = useState('AVAILABLE');
  const [uploadingImage, setUploadingImage] = useState(false);
  const [uploadingPortfolio, setUploadingPortfolio] = useState(false);
  const [fileProgress, setFileProgress] = useState({});

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      const data = await userService.getCurrentUser();
      setProfile({
        name: data.name || '',
        role: data.role || '',
        bio: data.bio || '',
      });
      setSkills(data.skills || []);
      setTools(data.tools || []);
      setGenres(data.genres || []);
      setPortfolioItems(data.portfolio || []);
      setAvailability(data.availability || 'AVAILABLE');
      setLoading(false);
    } catch (error) {
      showError('Failed to load profile');
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const updatedUser = await userService.updateProfile({
        name: profile.name,
        role: profile.role,
        bio: profile.bio,
        skills,
        tools,
        genres
      });
      
      // Update global context so header avatar updates
      if (user && setUser) {
         setUser({ ...user, name: updatedUser.name }); 
      }
      
      showSuccess('Profile updated successfully!');
    } catch (error) {
      console.error(error);
      showError('Failed to save profile: ' + (error.response?.data?.message || error.message));
    } finally {
      setSaving(false);
    }
  };

  const handleProfileChange = (field, value) => setProfile(p => ({ ...p, [field]: value }));

  const addTag = (setter, input, setInput) => (e) => {
    if (e.key === 'Enter' && input.trim()) {
      e.preventDefault();
      setter(prev => prev.includes(input.trim()) ? prev : [...prev, input.trim()]);
      setInput('');
    }
  };

  const removeTag = (setter) => (tag) => setter(prev => prev.filter(t => t !== tag));

  const handleProfileImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    setUploadingImage(true);
    try {
      const updatedUser = await userService.uploadProfileImage(file);
      if (user && setUser) {
         setUser({ ...user, profileImage: updatedUser.profileImage }); 
      }
      showSuccess('Profile image updated!');
    } catch (error) {
      showError('Failed to upload image');
    } finally {
      setUploadingImage(false);
    }
  };

  const handleAvailabilityChange = async (e) => {
    const newVal = e.target.value;
    setAvailability(newVal);
    try {
      await userService.updateAvailability(newVal);
      showSuccess('Availability updated!');
    } catch (error) {
      showError('Failed to update availability');
    }
  };

  const handlePortfolioUpload = async () => {
    if (portfolioFiles.length === 0) return;
    
    setUploadingPortfolio(true);
    setFileProgress({});
    try {
        for (const file of portfolioFiles) {
            let title = prompt(`Enter title for ${file.name}:`) || file.name;
            let type = 'IMAGE';
            if (file.type.startsWith('audio/')) type = 'AUDIO';
            if (file.type.startsWith('video/')) type = 'VIDEO';
            
            const updatedUser = await userService.uploadPortfolioItem(title, type, file, (progressEvent) => {
               if (progressEvent.total) {
                  const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
                  setFileProgress(prev => ({...prev, [file.name]: percentCompleted}));
               }
            });
            setPortfolioItems(updatedUser.portfolio);
        }
        setPortfolioFiles([]);
        setFileProgress({});
        showSuccess('Portfolio updated!');
    } catch (error) {
        showError('Failed to upload portfolio item(s)');
    } finally {
        setUploadingPortfolio(false);
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 10 }}>
        <CircularProgress sx={{ color: '#a855f7' }} />
      </Box>
    );
  }

  return (
    <Box sx={{ maxWidth: 900, mx: 'auto', px: { xs: 2, md: 0 }, pb: 6 }} className="fade-in">
      <PageHeader
        title="Edit Profile"
        subtitle="Update identity, portfolio, skills, and account settings with a consistent workflow."
        actions={
          <>
            <IconButton onClick={() => navigate('/profile')}
              sx={{ color: '#5c5c72', '&:hover': { color: '#a855f7' } }}>
              <ArrowBackIcon />
            </IconButton>
            <AppButton startIcon={saving ? <CircularProgress size={16} color="inherit" /> : <SaveIcon sx={{ fontSize: 16 }} />}
              onClick={handleSave}
              disabled={saving}
              sx={{ '&.Mui-disabled': { background: '#3f3f46', color: '#a1a1aa' } }}>
              {saving ? 'Saving...' : 'Save Changes'}
            </AppButton>
          </>
        }
      />

      {/* Header */}
      <Box sx={{ display: 'none' }}>
        <Button startIcon={saving ? <CircularProgress size={16} color="inherit" /> : <SaveIcon sx={{ fontSize: 16 }} />}
          onClick={handleSave}
          disabled={saving}
          sx={{ borderRadius: '10px', textTransform: 'none', fontWeight: 700, px: 3, py: 1,
            background: 'linear-gradient(135deg, #a855f7, #6366f1)', color: 'white',
            '&:hover': { boxShadow: '0 0 25px rgba(168,85,247,0.25)' },
            '&.Mui-disabled': { background: '#3f3f46', color: '#a1a1aa' } }}>
          {saving ? 'Saving...' : 'Save Changes'}
        </Button>
      </Box>

      {/* Tabs */}
      <Box sx={{ display: 'flex', gap: 0, mb: 4, borderBottom: '1px solid rgba(255,255,255,0.05)', overflowX: 'auto' }}>
        {TABS.map((tab, i) => (
          <Box key={tab} onClick={() => setActiveTab(i)}
            sx={{ px: 3, py: 1.5, cursor: 'pointer', whiteSpace: 'nowrap',
              borderBottom: activeTab === i ? '2px solid #a855f7' : '2px solid transparent',
              color: activeTab === i ? '#e0e0ef' : '#5c5c72',
              fontWeight: activeTab === i ? 700 : 400, fontSize: '0.85rem', transition: 'all 0.2s' }}>
            {tab}
          </Box>
        ))}
      </Box>

      {/* ═══ PROFILE INFO ═══ */}
      {activeTab === 0 && (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
          {/* Avatar */}
          <Box sx={{ bgcolor: '#16161f', borderRadius: '16px', p: 4, border: '1px solid rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', gap: 3 }}>
            <Box sx={{ position: 'relative' }}>
              <Avatar src={user?.profileImage}
                sx={{ width: 80, height: 80, background: 'linear-gradient(135deg, #a855f7, #6366f1)', fontSize: 28, fontWeight: 800 }}>
                {uploadingImage ? <CircularProgress size={24} color="inherit" /> : (profile.name?.[0] || 'U')}
              </Avatar>
              <input type="file" id="profile-image-upload" hidden accept="image/*" onChange={handleProfileImageUpload} />
              <IconButton size="small" onClick={() => document.getElementById('profile-image-upload').click()}
                disabled={uploadingImage}
                sx={{ position: 'absolute', bottom: -4, right: -4, width: 28, height: 28,
                  bgcolor: '#a855f7', color: 'white', '&:hover': { bgcolor: '#9333ea' } }}>
                <CameraAltIcon sx={{ fontSize: 14 }} />
              </IconButton>
            </Box>
            <Box>
              <Typography variant="subtitle2" fontWeight={700} sx={{ color: '#e0e0ef' }}>Profile Photo</Typography>
              <Typography variant="caption" sx={{ color: '#5c5c72' }}>JPG, PNG. Max 5MB. Recommended: 400×400px</Typography>
            </Box>
          </Box>

          {/* Fields */}
          <Box sx={{ bgcolor: '#16161f', borderRadius: '16px', p: 4, border: '1px solid rgba(255,255,255,0.05)', display: 'flex', flexDirection: 'column', gap: 3 }}>
            <AppInput label="Display Name" fullWidth value={profile.name} onChange={(e) => handleProfileChange('name', e.target.value)} sx={inputSx} />
            <AppInput label="Professional Title" fullWidth value={profile.role} onChange={(e) => handleProfileChange('role', e.target.value)} sx={inputSx}
              helperText={<Typography variant="caption" sx={{ color: '#4a4a5e' }}>e.g. Music Producer, Mixing Engineer, Vocalist</Typography>} />
            <AppInput label="Bio" fullWidth multiline rows={4} value={profile.bio} onChange={(e) => handleProfileChange('bio', e.target.value)} sx={inputSx}
              helperText={<Typography variant="caption" sx={{ color: '#4a4a5e' }}>{profile.bio?.length || 0}/500 characters</Typography>} />
            <AppInput select label="Availability Status" fullWidth value={availability} onChange={handleAvailabilityChange} sx={inputSx}>
              <MenuItem value="AVAILABLE">Available</MenuItem>
              <MenuItem value="BUSY">Busy</MenuItem>
              <MenuItem value="LOOKING_FOR_WORK">Looking for Work</MenuItem>
            </AppInput>
          </Box>
        </Box>
      )}

      {/* ═══ PORTFOLIO ═══ */}
      {activeTab === 1 && (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          {/* Upload */}
          <Box sx={{ bgcolor: '#16161f', borderRadius: '16px', p: 4, border: '1px solid rgba(255,255,255,0.05)' }}>
            <Typography variant="subtitle2" fontWeight={700} sx={{ color: '#e0e0ef', mb: 2 }}>Add New Work</Typography>
            <FileUploadZone files={portfolioFiles} onChange={setPortfolioFiles} accept="image/*,audio/*,video/*" maxFiles={10} accent="#a855f7" fileProgress={fileProgress} />
            {portfolioFiles.length > 0 && (
              <Button 
                onClick={handlePortfolioUpload} 
                disabled={uploadingPortfolio} 
                variant="contained"
                sx={{ mt: 2, bgcolor: '#a855f7', color: 'white', '&:hover': { bgcolor: '#9333ea' }, borderRadius: '8px', textTransform: 'none', fontWeight: 600 }}>
                {uploadingPortfolio ? <CircularProgress size={20} color="inherit" /> : `Upload ${portfolioFiles.length} Item(s)`}
              </Button>
            )}
          </Box>

          {/* Existing items */}
          <Box>
            <Typography variant="subtitle2" fontWeight={700} sx={{ color: '#e0e0ef', mb: 2 }}>Current Portfolio</Typography>
            {portfolioItems.length === 0 ? (
              <EmptyState
                icon={<CameraAltIcon sx={{ fontSize: 44, color: 'rgba(255,255,255,0.08)' }} />}
                title="No portfolio items yet"
                description="Upload your best work to showcase your talent."
              />
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {portfolioItems.map((item, i) => <PortfolioItem key={item.id} item={item} index={i} />)}
              </div>
            )}
          </Box>
        </Box>
      )}

      {/* ═══ SKILLS & TOOLS ═══ */}
      {activeTab === 2 && (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          {[
            { label: 'Skills', items: skills, setter: setSkills, input: skillInput, setInput: setSkillInput, accent: '#a855f7' },
            { label: 'Tools & DAWs', items: tools, setter: setTools, input: toolInput, setInput: setToolInput, accent: '#6366f1' },
            { label: 'Genres', items: genres, setter: setGenres, input: genreInput, setInput: setGenreInput, accent: '#ec4899' },
          ].map(section => (
            <Box key={section.label} sx={{ bgcolor: '#16161f', borderRadius: '16px', p: 4, border: '1px solid rgba(255,255,255,0.05)' }}>
              <Typography variant="subtitle2" fontWeight={700} sx={{ color: '#e0e0ef', mb: 2 }}>{section.label}</Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mb: 2 }}>
                {section.items.map((tag, i) => (
                  <Tag key={tag} label={tag} colorIndex={i} onDelete={() => removeTag(section.setter)(tag)} />
                ))}
              </Box>
              <AppInput fullWidth size="small" placeholder={`Add ${section.label.toLowerCase()}... (press Enter)`}
                value={section.input} onChange={(e) => section.setInput(e.target.value)}
                onKeyDown={addTag(section.setter, section.input, section.setInput)}
                sx={{ ...inputSx, '& .MuiOutlinedInput-root': { ...inputSx['& .MuiOutlinedInput-root'], '&.Mui-focused': { borderColor: `${section.accent}60`, boxShadow: `0 0 20px ${section.accent}15` } } }} />
            </Box>
          ))}
        </Box>
      )}

      {/* ═══ ACCOUNT ═══ */}
      {activeTab === 3 && (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          <Box sx={{ bgcolor: '#16161f', borderRadius: '16px', p: 4, border: '1px solid rgba(255,255,255,0.05)' }}>
            <Typography variant="subtitle2" fontWeight={700} sx={{ color: '#e0e0ef', mb: 1 }}>Email</Typography>
            <Typography variant="body2" sx={{ color: '#8b8b9e', mb: 3 }}>{user?.email || 'user@example.com'}</Typography>
            <Typography variant="subtitle2" fontWeight={700} sx={{ color: '#e0e0ef', mb: 1 }}>Account Type</Typography>
            <Typography variant="body2" sx={{ color: '#8b8b9e' }}>Google OAuth</Typography>
          </Box>

          <Box sx={{ bgcolor: '#16161f', borderRadius: '16px', p: 4, border: '1px solid rgba(255,255,255,0.05)' }}>
            <Typography variant="subtitle2" fontWeight={700} sx={{ color: '#e0e0ef', mb: 2 }}>Actions</Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
              <Button fullWidth startIcon={<LogoutIcon sx={{ fontSize: 16 }} />}
                onClick={() => showSuccess('Logged out')}
                sx={{ borderRadius: '10px', textTransform: 'none', fontWeight: 600, py: 1.5,
                  bgcolor: 'rgba(255,255,255,0.04)', color: '#8b8b9e', justifyContent: 'flex-start', px: 3,
                  border: '1px solid rgba(255,255,255,0.05)', '&:hover': { borderColor: 'rgba(245,158,11,0.2)', color: '#f59e0b' } }}>
                Log Out
              </Button>
              <Button fullWidth startIcon={<DeleteIcon sx={{ fontSize: 16 }} />}
                onClick={() => showSuccess('Not available in demo')}
                sx={{ borderRadius: '10px', textTransform: 'none', fontWeight: 600, py: 1.5,
                  bgcolor: 'rgba(239,68,68,0.05)', color: '#ef4444', justifyContent: 'flex-start', px: 3,
                  border: '1px solid rgba(239,68,68,0.08)', '&:hover': { bgcolor: 'rgba(239,68,68,0.08)', borderColor: 'rgba(239,68,68,0.15)' } }}>
                Delete Account
              </Button>
            </Box>
          </Box>
        </Box>
      )}
    </Box>
  );
};

export default EditProfile;
