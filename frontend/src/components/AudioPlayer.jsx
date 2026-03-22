import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Box, Typography, IconButton, Slider } from '@mui/material';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import PauseIcon from '@mui/icons-material/Pause';
import VolumeUpIcon from '@mui/icons-material/VolumeUp';
import VolumeOffIcon from '@mui/icons-material/VolumeOff';

const WAVEFORM_BARS = 40;

const formatTime = (seconds) => {
  if (!seconds || isNaN(seconds)) return '0:00';
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, '0')}`;
};

// Generate deterministic waveform heights from a seed string
const generateWaveform = (seed = '') => {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) hash = ((hash << 5) - hash) + seed.charCodeAt(i);
  return Array.from({ length: WAVEFORM_BARS }, (_, i) => {
    const val = Math.abs(Math.sin(hash * (i + 1) * 0.1)) * 0.7 + 0.3;
    return val;
  });
};

const AudioPlayer = ({
  title = 'Audio Preview',
  duration = 180, // mock duration in seconds
  seed = 'default',
  accent = '#a855f7',
  compact = false,
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [muted, setMuted] = useState(false);
  const intervalRef = useRef(null);
  const waveform = useRef(generateWaveform(seed)).current;

  const startPlayback = useCallback(() => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    intervalRef.current = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(intervalRef.current);
          setIsPlaying(false);
          return 0;
        }
        return prev + (100 / (duration * 10));
      });
    }, 100);
  }, [duration]);

  useEffect(() => {
    if (isPlaying) startPlayback();
    else if (intervalRef.current) clearInterval(intervalRef.current);
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [isPlaying, startPlayback]);

  const togglePlay = (e) => {
    e?.stopPropagation?.();
    setIsPlaying(!isPlaying);
  };

  const handleWaveformClick = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const pct = (x / rect.width) * 100;
    setProgress(Math.max(0, Math.min(100, pct)));
  };

  const currentTime = (progress / 100) * duration;

  if (compact) {
    return (
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, p: 1.5, borderRadius: '10px', bgcolor: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)' }}>
        <IconButton onClick={togglePlay} size="small"
          sx={{ width: 32, height: 32, bgcolor: `${accent}20`, color: accent, '&:hover': { bgcolor: `${accent}30`, transform: 'scale(1.05)' }, transition: 'all 0.2s' }}>
          {isPlaying ? <PauseIcon sx={{ fontSize: 16 }} /> : <PlayArrowIcon sx={{ fontSize: 16 }} />}
        </IconButton>
        {/* Mini waveform */}
        <Box onClick={handleWaveformClick}
          sx={{ flex: 1, display: 'flex', alignItems: 'center', gap: '1.5px', height: 24, cursor: 'pointer' }}>
          {waveform.map((h, i) => {
            const barProgress = (i / WAVEFORM_BARS) * 100;
            return (
              <Box key={i} sx={{
                flex: 1, borderRadius: '1px', transition: 'height 0.15s ease',
                height: `${h * 100}%`,
                bgcolor: barProgress < progress ? accent : 'rgba(255,255,255,0.12)',
              }} />
            );
          })}
        </Box>
        <Typography variant="caption" sx={{ color: '#5c5c72', fontSize: '0.65rem', fontFamily: 'monospace', minWidth: 32 }}>
          {formatTime(currentTime)}
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3, borderRadius: '14px', bgcolor: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', transition: 'all 0.3s', '&:hover': { borderColor: `${accent}20` } }}>
      {/* Top row */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
        <IconButton onClick={togglePlay}
          sx={{
            width: 44, height: 44, borderRadius: '12px',
            background: `linear-gradient(135deg, ${accent}, ${accent}cc)`,
            color: 'white',
            boxShadow: `0 4px 20px ${accent}30`,
            '&:hover': { transform: 'scale(1.06)', boxShadow: `0 6px 25px ${accent}40` },
            transition: 'all 0.2s',
          }}>
          {isPlaying ? <PauseIcon /> : <PlayArrowIcon />}
        </IconButton>
        <Box sx={{ flex: 1 }}>
          <Typography variant="subtitle2" fontWeight={600} sx={{ color: '#e0e0ef', fontSize: '0.85rem' }}>{title}</Typography>
          <Typography variant="caption" sx={{ color: '#5c5c72' }}>
            {formatTime(currentTime)} / {formatTime(duration)}
          </Typography>
        </Box>
        <IconButton onClick={(e) => { e.stopPropagation(); setMuted(!muted); }} size="small"
          sx={{ color: muted ? '#ef4444' : '#5c5c72', '&:hover': { color: accent } }}>
          {muted ? <VolumeOffIcon sx={{ fontSize: 18 }} /> : <VolumeUpIcon sx={{ fontSize: 18 }} />}
        </IconButton>
      </Box>

      {/* Waveform */}
      <Box onClick={handleWaveformClick}
        sx={{ display: 'flex', alignItems: 'end', gap: '2px', height: 48, cursor: 'pointer', px: 0.5 }}>
        {waveform.map((h, i) => {
          const barProgress = (i / WAVEFORM_BARS) * 100;
          const isActive = barProgress < progress;
          return (
            <Box key={i} sx={{
              flex: 1, borderRadius: '2px',
              height: `${h * 100}%`,
              bgcolor: isActive ? accent : 'rgba(255,255,255,0.08)',
              boxShadow: isActive ? `0 0 6px ${accent}40` : 'none',
              transition: 'background-color 0.1s, box-shadow 0.2s',
              '&:hover': { bgcolor: isActive ? accent : 'rgba(255,255,255,0.15)' },
            }} />
          );
        })}
      </Box>

      {/* Progress bar */}
      <Box sx={{ mt: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
        <Box sx={{ flex: 1, height: 3, borderRadius: 2, bgcolor: 'rgba(255,255,255,0.06)', overflow: 'hidden' }}>
          <Box sx={{ height: '100%', width: `${progress}%`, bgcolor: accent, borderRadius: 2, transition: 'width 0.1s linear' }} />
        </Box>
      </Box>
    </Box>
  );
};

export default AudioPlayer;
