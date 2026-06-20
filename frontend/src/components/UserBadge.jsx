import React from 'react';
import { Box, Typography, Chip, Tooltip } from '@mui/material';
import StarIcon from '@mui/icons-material/Star';
import VerifiedIcon from '@mui/icons-material/Verified';
import WorkspacePremiumIcon from '@mui/icons-material/WorkspacePremium';
import GroupIcon from '@mui/icons-material/Group';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';

const LEVELS = {
  beginner: { label: 'Beginner', color: '#5c5c72', icon: null },
  intermediate: { label: 'Intermediate', color: '#06b6d4', icon: <TrendingUpIcon sx={{ fontSize: 12 }} /> },
  pro: { label: 'Pro', color: '#a855f7', icon: <StarIcon sx={{ fontSize: 12 }} /> },
  top_artist: { label: 'Top Artist', color: '#f59e0b', icon: <WorkspacePremiumIcon sx={{ fontSize: 12 }} /> },
};

const BADGES = {
  top_seller: { label: 'Top Seller', color: '#10b981', icon: <StarIcon sx={{ fontSize: 11 }} /> },
  verified: { label: 'Verified', color: '#3b82f6', icon: <VerifiedIcon sx={{ fontSize: 11 }} /> },
  active_collaborator: { label: 'Active Collaborator', color: '#ec4899', icon: <GroupIcon sx={{ fontSize: 11 }} /> },
  Newcomer: { label: 'Newcomer', color: '#8b5cf6', icon: <StarIcon sx={{ fontSize: 11 }} /> }
};

// Generate mock level + badges from name (kept for mock screens like CollabRoom)
export const getMockUserMeta = (name) => {
  if (!name) return { level: 1, badges: [] };
  const hash = name.length + (name.charCodeAt(0) || 0);
  const levels = [1, 2, 3, 4];
  const level = levels[hash % levels.length];
  const badgeKeys = Object.keys(BADGES);
  const badges = badgeKeys.filter((_, i) => (hash + i) % 3 === 0);
  return { level, badges };
};

export const UserLevelChip = ({ level = 1, size = 'small' }) => {
  let levelKey = level;
  if (typeof level === 'number') {
      if (level >= 4) levelKey = 'top_artist';
      else if (level === 3) levelKey = 'pro';
      else if (level === 2) levelKey = 'intermediate';
      else levelKey = 'beginner';
  }
  const cfg = LEVELS[levelKey] || LEVELS.beginner;
  return (
    <Chip
      icon={cfg.icon || undefined}
      label={cfg.label}
      size={size}
      sx={{
        bgcolor: `${cfg.color}12`,
        color: cfg.color,
        fontWeight: 600,
        fontSize: '0.6rem',
        height: 20,
        borderRadius: '6px',
        border: `1px solid ${cfg.color}20`,
        '& .MuiChip-icon': { color: cfg.color, ml: 0.5 },
      }}
    />
  );
};

export const UserBadges = ({ badges = [] }) => {
  if (!badges.length) return null;
  return (
    <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
      {badges.map((key) => {
        const cfg = BADGES[key] || { label: key, color: '#8b5cf6', icon: <StarIcon sx={{ fontSize: 11 }} /> };
        return (
          <Tooltip key={key} title={cfg.label} placement="top">
            <Box
              sx={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 0.3,
                px: 1,
                py: 0.25,
                borderRadius: '6px',
                bgcolor: `${cfg.color}10`,
                border: `1px solid ${cfg.color}15`,
              }}
            >
              <Box sx={{ color: cfg.color, display: 'flex', alignItems: 'center' }}>{cfg.icon}</Box>
              <Typography variant="caption" sx={{ color: cfg.color, fontWeight: 600, fontSize: '0.55rem', lineHeight: 1 }}>
                {cfg.label}
              </Typography>
            </Box>
          </Tooltip>
        );
      })}
    </Box>
  );
};

export default UserLevelChip;
