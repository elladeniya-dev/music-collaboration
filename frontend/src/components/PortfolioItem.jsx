import React, { useState } from 'react';
import { Box, Typography, IconButton } from '@mui/material';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import PauseIcon from '@mui/icons-material/Pause';
import MusicNoteIcon from '@mui/icons-material/MusicNote';
import ImageIcon from '@mui/icons-material/Image';
import VideocamIcon from '@mui/icons-material/Videocam';
import AudioWavePlayer from './AudioWavePlayer';

const TYPE_ICONS = {
  audio: <MusicNoteIcon sx={{ fontSize: 20 }} />,
  image: <ImageIcon sx={{ fontSize: 20 }} />,
  video: <VideocamIcon sx={{ fontSize: 20 }} />,
};

const TYPE_COLORS = {
  audio: '#a855f7',
  image: '#10b981',
  video: '#f59e0b',
};

const GRADIENTS = [
  'linear-gradient(135deg, #667eea, #764ba2)',
  'linear-gradient(135deg, #f093fb, #f5576c)',
  'linear-gradient(135deg, #4facfe, #00f2fe)',
  'linear-gradient(135deg, #43e97b, #38f9d7)',
  'linear-gradient(135deg, #fa709a, #fee140)',
  'linear-gradient(135deg, #a18cd1, #fbc2eb)',
];

const PortfolioItem = ({ item, index = 0 }) => {
  const [showPlayer, setShowPlayer] = useState(false);
  const color = TYPE_COLORS[item.type] || '#a855f7';
  const gradient = GRADIENTS[index % GRADIENTS.length];

  return (
    <Box sx={{
      bgcolor: '#16161f', borderRadius: '14px', overflow: 'hidden',
      border: '1px solid rgba(255,255,255,0.05)',
      transition: 'all 0.35s cubic-bezier(0.4,0,0.2,1)',
      '&:hover': { transform: 'translateY(-4px)', boxShadow: `0 15px 40px ${color}15`, borderColor: `${color}25` },
      '&:hover .play-overlay': { opacity: 1 },
    }}>
      {/* Visual */}
      <Box sx={{ height: 140, background: gradient, position: 'relative', cursor: 'pointer' }}
        onClick={() => item.type === 'audio' && setShowPlayer(!showPlayer)}>
        {/* Type badge */}
        <Box sx={{ position: 'absolute', top: 10, left: 10, display: 'flex', alignItems: 'center', gap: 0.5, px: 1.5, py: 0.5, borderRadius: '8px', bgcolor: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(8px)' }}>
          <Box sx={{ color, display: 'flex', alignItems: 'center', '& .MuiSvgIcon-root': { fontSize: 14 } }}>{TYPE_ICONS[item.type]}</Box>
          <Typography variant="caption" sx={{ color: 'white', fontWeight: 600, fontSize: '0.6rem', textTransform: 'capitalize' }}>{item.type}</Typography>
        </Box>

        {/* Play overlay */}
        {item.type === 'audio' && (
          <Box className="play-overlay" sx={{
            position: 'absolute', inset: 0,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            bgcolor: 'rgba(0,0,0,0.3)', opacity: 0, transition: 'opacity 0.3s',
          }}>
            <Box sx={{
              width: 48, height: 48, borderRadius: '50%',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              bgcolor: 'rgba(255,255,255,0.15)', backdropFilter: 'blur(10px)',
              color: 'white',
              '&:hover': { bgcolor: 'rgba(255,255,255,0.25)', transform: 'scale(1.1)' },
              transition: 'all 0.2s',
            }}>
              {showPlayer ? <PauseIcon /> : <PlayArrowIcon />}
            </Box>
          </Box>
        )}
      </Box>

      {/* Info */}
      <Box sx={{ p: 2 }}>
        <Typography variant="subtitle2" fontWeight={700} noWrap sx={{ color: '#e0e0ef', mb: 0.25 }}>{item.title}</Typography>
        {item.description && (
          <Typography variant="caption" noWrap sx={{ color: '#5c5c72' }}>{item.description}</Typography>
        )}

        {/* Inline player */}
        {showPlayer && item.type === 'audio' && (
          <Box sx={{ mt: 1.5 }}>
            <AudioWavePlayer
              compact
              title={item.title}
              seed={item.title}
              audioUrl={item.url || item.audioUrl || item.mediaUrl || ''}
              enableDemoFallback={false}
              accentStart={color}
              accentEnd="#6366f1"
            />
          </Box>
        )}
      </Box>
    </Box>
  );
};

export default PortfolioItem;
