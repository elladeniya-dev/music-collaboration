import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Box, IconButton, LinearProgress, Typography } from '@mui/material';
import GraphicEqIcon from '@mui/icons-material/GraphicEq';
import PauseIcon from '@mui/icons-material/Pause';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import WaveSurfer from 'wavesurfer.js';
import { getDemoAudioUrl } from '../constants';

const formatTime = (seconds) => {
  if (!seconds || Number.isNaN(seconds)) {
    return '0:00';
  }

  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
};

const AudioWavePlayer = ({
  audioUrl,
  title = 'Audio Preview',
  compact = false,
  seed = '',
  accentStart = '#a855f7',
  accentEnd = '#6366f1',
}) => {
  const containerRef = useRef(null);
  const waveSurferRef = useRef(null);

  const [isReady, setIsReady] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);

  const resolvedAudioUrl = useMemo(() => audioUrl || getDemoAudioUrl(seed || title), [audioUrl, seed, title]);

  useEffect(() => {
    if (!containerRef.current) {
      return;
    }

    setIsLoading(true);
    setError(null);
    setIsReady(false);
    setIsPlaying(false);
    setCurrentTime(0);

    const wave = WaveSurfer.create({
      container: containerRef.current,
      height: compact ? 32 : 52,
      barWidth: compact ? 2 : 3,
      barGap: compact ? 1.5 : 2,
      barRadius: 999,
      cursorWidth: 2,
      normalize: true,
      interact: true,
      waveColor: 'rgba(180, 180, 210, 0.35)',
      progressColor: accentStart,
      cursorColor: accentEnd,
      url: resolvedAudioUrl,
    });

    waveSurferRef.current = wave;

    wave.on('ready', () => {
      setDuration(wave.getDuration() || 0);
      setIsLoading(false);
      setIsReady(true);
    });

    wave.on('audioprocess', () => {
      setCurrentTime(wave.getCurrentTime() || 0);
    });

    wave.on('timeupdate', (time) => {
      setCurrentTime(time || 0);
    });

    wave.on('play', () => setIsPlaying(true));
    wave.on('pause', () => setIsPlaying(false));
    wave.on('finish', () => {
      setIsPlaying(false);
      setCurrentTime(0);
      wave.seekTo(0);
    });

    wave.on('error', () => {
      setError('Audio preview unavailable');
      setIsLoading(false);
      setIsReady(false);
    });

    return () => {
      wave.destroy();
      waveSurferRef.current = null;
    };
  }, [accentEnd, accentStart, compact, resolvedAudioUrl]);

  const handleToggle = (e) => {
    e?.stopPropagation?.();
    if (!waveSurferRef.current || !isReady) {
      return;
    }

    waveSurferRef.current.playPause();
  };

  return (
    <Box
      sx={{
        p: compact ? 1.2 : 2,
        borderRadius: compact ? '10px' : '14px',
        background:
          'linear-gradient(135deg, rgba(168,85,247,0.08), rgba(99,102,241,0.06) 35%, rgba(20,20,30,0.9) 100%)',
        border: '1px solid rgba(255,255,255,0.07)',
        transition: 'all 0.25s ease',
        '&:hover': {
          borderColor: 'rgba(168,85,247,0.28)',
          boxShadow: '0 8px 28px rgba(99,102,241,0.14)',
        },
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', gap: compact ? 1 : 1.4, mb: compact ? 0.8 : 1.2 }}>
        <IconButton
          onClick={handleToggle}
          disabled={!isReady || !!error}
          sx={{
            width: compact ? 30 : 38,
            height: compact ? 30 : 38,
            borderRadius: '10px',
            color: 'white',
            background: `linear-gradient(135deg, ${accentStart}, ${accentEnd})`,
            transition: 'all 0.2s ease',
            '&:hover': {
              transform: 'scale(1.05)',
              boxShadow: `0 0 20px ${accentStart}55`,
            },
            '&.Mui-disabled': {
              bgcolor: 'rgba(255,255,255,0.08)',
              color: 'rgba(255,255,255,0.35)',
            },
          }}
        >
          {isPlaying ? <PauseIcon sx={{ fontSize: compact ? 16 : 19 }} /> : <PlayArrowIcon sx={{ fontSize: compact ? 16 : 19 }} />}
        </IconButton>

        <Box sx={{ minWidth: 0, flex: 1 }}>
          {!compact ? (
            <Typography variant="body2" fontWeight={700} sx={{ color: '#ececff', lineHeight: 1.25 }} noWrap>
              {title}
            </Typography>
          ) : null}

          <Typography variant="caption" sx={{ color: '#9f9fba' }}>
            {formatTime(currentTime)} / {formatTime(duration)}
          </Typography>
        </Box>
      </Box>

      <Box sx={{ position: 'relative' }}>
        <Box
          ref={containerRef}
          sx={{
            width: '100%',
            minHeight: compact ? 34 : 54,
            cursor: 'pointer',
            borderRadius: '8px',
            opacity: error ? 0.35 : 1,
          }}
        />

        {isLoading ? (
          <Box
            sx={{
              position: 'absolute',
              inset: 0,
              display: 'flex',
              alignItems: 'center',
              gap: 1,
              py: compact ? 0.5 : 1,
              px: 0.5,
              bgcolor: 'rgba(16,16,25,0.88)',
              borderRadius: '8px',
            }}
          >
            <GraphicEqIcon sx={{ color: '#8b5cf6', fontSize: compact ? 16 : 18 }} />
            <Box sx={{ flex: 1 }}>
              <LinearProgress
                sx={{
                  height: compact ? 4 : 5,
                  borderRadius: 99,
                  backgroundColor: 'rgba(255,255,255,0.08)',
                  '& .MuiLinearProgress-bar': {
                    background: `linear-gradient(90deg, ${accentStart}, ${accentEnd})`,
                  },
                }}
              />
            </Box>
            <Typography variant="caption" sx={{ color: '#7f7f98' }}>
              Loading
            </Typography>
          </Box>
        ) : null}
      </Box>

      {error ? (
        <Typography variant="caption" sx={{ color: '#fda4af', mt: 0.4, display: 'block' }}>
          {error}
        </Typography>
      ) : null}
    </Box>
  );
};

export default AudioWavePlayer;
