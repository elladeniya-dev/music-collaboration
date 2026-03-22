import React, { useEffect, useState } from 'react';
import ServiceCard from '../components/ServiceCard';
import { Typography, Box, TextField, InputAdornment, Button, Chip } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import { useNavigate } from 'react-router-dom';
import { serviceService } from '../services';
import { showSuccess } from '../utils';
import MusicNoteIcon from '@mui/icons-material/MusicNote';
import HeadphonesIcon from '@mui/icons-material/Headphones';
import MicIcon from '@mui/icons-material/Mic';
import PianoIcon from '@mui/icons-material/Piano';
import GraphicEqIcon from '@mui/icons-material/GraphicEq';
import LibraryMusicIcon from '@mui/icons-material/LibraryMusic';
import VideocamIcon from '@mui/icons-material/Videocam';
import BrushIcon from '@mui/icons-material/Brush';
import StorefrontIcon from '@mui/icons-material/Storefront';

const CATEGORIES = [
  { label: 'Music Production', icon: <MusicNoteIcon />, color: '#a855f7' },
  { label: 'Mixing & Mastering', icon: <HeadphonesIcon />, color: '#6366f1' },
  { label: 'Vocals', icon: <MicIcon />, color: '#ec4899' },
  { label: 'Instrument Lessons', icon: <PianoIcon />, color: '#f59e0b' },
  { label: 'Sound Design', icon: <GraphicEqIcon />, color: '#10b981' },
  { label: 'Songwriting', icon: <LibraryMusicIcon />, color: '#06b6d4' },
  { label: 'Video Production', icon: <VideocamIcon />, color: '#f97316' },
  { label: 'Graphic Design', icon: <BrushIcon />, color: '#ef4444' },
];

const MOCK_SERVICES = [
  { id: 'm1', title: 'Professional Mix & Master for Your Track', description: 'Industry-standard mixing and mastering with analog warmth and digital precision.', price: 150, sellerName: 'AudioPro', category: 'Mixing & Mastering', deliveryTime: 3, tags: ['mixing', 'mastering', 'pro'] },
  { id: 'm2', title: 'Custom Beat Production – Any Genre', description: 'Original beats from scratch. Hip-hop, R&B, Pop, Trap, Lo-fi and more.', price: 75, sellerName: 'BeatMaker', category: 'Music Production', deliveryTime: 5, tags: ['beats', 'hip-hop', 'original'] },
  { id: 'm3', title: 'Professional Vocal Recording & Tuning', description: 'Clean vocal recording, pitch correction, and professional comping.', price: 100, sellerName: 'VocalStudio', category: 'Vocals', deliveryTime: 2, tags: ['vocals', 'recording', 'tuning'] },
  { id: 'm4', title: 'Cinematic Sound Design Package', description: 'Custom sound effects, ambient textures, and cinematic soundscapes.', price: 200, sellerName: 'SoundWizard', category: 'Sound Design', deliveryTime: 7, tags: ['sfx', 'cinematic', 'foley'] },
];

const SkeletonCard = () => (
  <div className="rounded-2xl overflow-hidden" style={{ background: '#16161f', border: '1px solid rgba(255,255,255,0.05)' }}>
    <div className="skeleton h-[160px] rounded-none" />
    <div className="p-4 space-y-3">
      <div className="skeleton h-4 w-4/5 rounded-lg" />
      <div className="skeleton h-3 w-full rounded-lg" />
      <div className="skeleton h-3 w-3/4 rounded-lg" />
      <div className="flex gap-2 mt-3">
        <div className="skeleton h-5 w-14 rounded-full" />
        <div className="skeleton h-5 w-14 rounded-full" />
      </div>
      <div className="flex justify-between mt-3 pt-3" style={{ borderTop: '1px solid rgba(255,255,255,0.05)' }}>
        <div className="skeleton h-3 w-16 rounded-lg" />
        <div className="skeleton h-3 w-12 rounded-lg" />
      </div>
    </div>
  </div>
);

const ServiceMarketplace = () => {
  const [services, setServices] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    serviceService.getAllServices()
      .then((data) => {
        setServices(data);
        setFiltered(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  useEffect(() => {
    let result = services;
    if (activeCategory) {
      result = result.filter(s => s.category === activeCategory);
    }
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(
        (s) =>
          s.title?.toLowerCase().includes(q) ||
          s.category?.toLowerCase().includes(q) ||
          s.sellerName?.toLowerCase().includes(q)
      );
    }
    setFiltered(result);
  }, [search, services, activeCategory]);

  const displayServices = filtered.length > 0 ? filtered : MOCK_SERVICES;
  const showMock = !loading && filtered.length === 0;

  return (
    <Box>
      {/* ═══════════════════ HERO ═══════════════════ */}
      <Box
        sx={{
          position: 'relative',
          overflow: 'hidden',
          pt: { xs: 8, md: 12 },
          pb: { xs: 6, md: 10 },
          px: { xs: 3, md: 6 },
        }}
      >
        {/* Ambient glow */}
        <Box sx={{ position: 'absolute', top: -150, left: '20%', width: 500, height: 500, borderRadius: '50%', background: 'radial-gradient(circle, rgba(168,85,247,0.08) 0%, transparent 70%)', pointerEvents: 'none' }} />
        <Box sx={{ position: 'absolute', top: -100, right: '10%', width: 400, height: 400, borderRadius: '50%', background: 'radial-gradient(circle, rgba(99,102,241,0.06) 0%, transparent 70%)', pointerEvents: 'none' }} />

        <Box sx={{ maxWidth: 800, mx: 'auto', textAlign: 'center', position: 'relative', zIndex: 1 }}>
          <Typography
            variant="h2"
            sx={{
              fontWeight: 900,
              fontSize: { xs: '2rem', md: '3.2rem' },
              lineHeight: 1.15,
              letterSpacing: '-1.5px',
              mb: 2,
              background: 'linear-gradient(135deg, #f0f0f5, #a78bfa, #818cf8)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >
            Find the perfect music{' '}
            <span style={{ background: 'linear-gradient(135deg, #a855f7, #6366f1)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              collaborator
            </span>
          </Typography>

          <Typography sx={{ color: '#5c5c72', fontSize: { xs: '0.95rem', md: '1.1rem' }, mb: 4, maxWidth: 600, mx: 'auto', lineHeight: 1.6 }}>
            Browse thousands of music services from talented producers, singers, and sound engineers. Turn your ideas into professional tracks.
          </Typography>

          {/* Search Bar */}
          <Box sx={{ maxWidth: 600, mx: 'auto' }}>
            <TextField
              placeholder="Search services, categories, or sellers..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              fullWidth
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: '16px',
                  bgcolor: 'rgba(255,255,255,0.04)',
                  border: '1px solid rgba(255,255,255,0.08)',
                  color: '#e0e0ef',
                  py: 0.5,
                  '& fieldset': { border: 'none' },
                  '&:hover': { borderColor: 'rgba(168,85,247,0.3)', bgcolor: 'rgba(255,255,255,0.06)' },
                  '&.Mui-focused': { borderColor: 'rgba(168,85,247,0.5)', boxShadow: '0 0 30px rgba(168,85,247,0.1)' },
                },
                '& .MuiInputBase-input': { color: '#e0e0ef', '&::placeholder': { color: '#5c5c72', opacity: 1 } },
              }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon sx={{ color: '#5c5c72' }} />
                  </InputAdornment>
                ),
              }}
            />
          </Box>
        </Box>
      </Box>

      {/* ═══════════════════ CATEGORIES ═══════════════════ */}
      <Box sx={{ px: { xs: 3, md: 6 }, pb: 5 }}>
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
          {CATEGORIES.map((cat) => {
            const isActive = activeCategory === cat.label;
            return (
              <Box
                key={cat.label}
                onClick={() => setActiveCategory(isActive ? null : cat.label)}
                sx={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: 1,
                  py: 2,
                  px: 1,
                  borderRadius: '14px',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  bgcolor: isActive ? `${cat.color}15` : 'rgba(255,255,255,0.02)',
                  border: '1px solid',
                  borderColor: isActive ? `${cat.color}40` : 'rgba(255,255,255,0.04)',
                  boxShadow: isActive ? `0 0 25px ${cat.color}20` : 'none',
                  '&:hover': {
                    bgcolor: `${cat.color}10`,
                    borderColor: `${cat.color}30`,
                    transform: 'translateY(-2px)',
                  },
                }}
              >
                <Box sx={{ color: isActive ? cat.color : '#5c5c72', transition: 'color 0.2s', '& .MuiSvgIcon-root': { fontSize: 24 } }}>
                  {cat.icon}
                </Box>
                <Typography variant="caption" sx={{ color: isActive ? '#e0e0ef' : '#5c5c72', fontWeight: isActive ? 600 : 400, fontSize: '0.7rem', textAlign: 'center', lineHeight: 1.2 }}>
                  {cat.label}
                </Typography>
              </Box>
            );
          })}
        </div>
      </Box>

      {/* ═══════════════════ SERVICES GRID ═══════════════════ */}
      <Box sx={{ px: { xs: 3, md: 6 }, pb: 8 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
          <Box>
            <Typography variant="h5" fontWeight={800} sx={{ color: '#e0e0ef', letterSpacing: '-0.5px' }}>
              {activeCategory ? activeCategory : showMock ? 'Featured Services' : 'All Services'}
            </Typography>
            {showMock && (
              <Typography variant="caption" sx={{ color: '#5c5c72' }}>
                Sample services — be the first to list yours!
              </Typography>
            )}
          </Box>
          <Button
            onClick={() => navigate('/services/create')}
            sx={{
              borderRadius: '12px',
              textTransform: 'none',
              fontWeight: 600,
              px: 3,
              py: 1,
              background: 'linear-gradient(135deg, #a855f7, #6366f1)',
              color: 'white',
              '&:hover': { boxShadow: '0 0 30px rgba(168,85,247,0.3)' },
            }}
          >
            + Create Service
          </Button>
        </Box>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {[...Array(8)].map((_, i) => <SkeletonCard key={i} />)}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {displayServices.map((service) => (
              <ServiceCard key={service.id} service={service} onOrder={(svc, pkg, price) => showSuccess(`🎉 Order placed! ${svc.title} (${pkg}) — $${price}`)} />
            ))}
          </div>
        )}

        {/* Empty state for filtered */}
        {!loading && filtered.length === 0 && search && (
          <Box sx={{ textAlign: 'center', py: 8 }}>
            <StorefrontIcon sx={{ fontSize: 56, color: 'rgba(255,255,255,0.06)', mb: 2 }} />
            <Typography variant="h6" sx={{ color: '#5c5c72' }}>
              No services match "{search}"
            </Typography>
          </Box>
        )}
      </Box>
    </Box>
  );
};

export default ServiceMarketplace;
