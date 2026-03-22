import React from 'react';
import { Chip } from '@mui/material';

const TAG_COLORS = [
  { bg: 'rgba(168,85,247,0.08)', color: '#c084fc', border: 'rgba(168,85,247,0.15)' },
  { bg: 'rgba(99,102,241,0.08)', color: '#818cf8', border: 'rgba(99,102,241,0.15)' },
  { bg: 'rgba(236,72,153,0.08)', color: '#f472b6', border: 'rgba(236,72,153,0.15)' },
  { bg: 'rgba(6,182,212,0.08)', color: '#22d3ee', border: 'rgba(6,182,212,0.15)' },
  { bg: 'rgba(16,185,129,0.08)', color: '#34d399', border: 'rgba(16,185,129,0.15)' },
  { bg: 'rgba(245,158,11,0.08)', color: '#fbbf24', border: 'rgba(245,158,11,0.15)' },
  { bg: 'rgba(239,68,68,0.08)', color: '#f87171', border: 'rgba(239,68,68,0.15)' },
];

const getColorIndex = (label) => {
  let hash = 0;
  for (let i = 0; i < label.length; i++) hash = ((hash << 5) - hash) + label.charCodeAt(i);
  return Math.abs(hash) % TAG_COLORS.length;
};

const Tag = ({
  label,
  icon,
  onDelete,
  onClick,
  variant = 'default', // 'default' | 'outline' | 'solid'
  size = 'small',
  colorIndex,
}) => {
  const idx = colorIndex !== undefined ? colorIndex % TAG_COLORS.length : getColorIndex(label || '');
  const palette = TAG_COLORS[idx];

  const sx = variant === 'solid'
    ? { bgcolor: palette.color, color: '#0a0a0f', fontWeight: 700, border: 'none', '&:hover': { bgcolor: palette.color, opacity: 0.9 } }
    : variant === 'outline'
    ? { bgcolor: 'transparent', color: palette.color, border: `1px solid ${palette.border}`, fontWeight: 600, '&:hover': { bgcolor: palette.bg } }
    : { bgcolor: palette.bg, color: palette.color, border: `1px solid ${palette.border}`, fontWeight: 600, '&:hover': { bgcolor: `${palette.bg}` } };

  return (
    <Chip
      label={label}
      icon={icon}
      size={size}
      onClick={onClick}
      onDelete={onDelete}
      sx={{
        fontSize: '0.65rem',
        height: size === 'small' ? 22 : 26,
        borderRadius: '6px',
        cursor: onClick ? 'pointer' : 'default',
        transition: 'all 0.2s',
        '& .MuiChip-icon': { color: palette.color, fontSize: 14 },
        '& .MuiChip-deleteIcon': { color: `${palette.color}80`, fontSize: 14, '&:hover': { color: palette.color } },
        ...sx,
      }}
    />
  );
};

export const TagGroup = ({ tags = [], variant, size, onClick, onDelete, max = 5 }) => {
  const display = tags.slice(0, max);
  const remaining = tags.length - max;
  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
      {display.map((tag, i) => (
        <Tag key={tag} label={tag} variant={variant} size={size} colorIndex={i}
          onClick={onClick ? () => onClick(tag) : undefined}
          onDelete={onDelete ? () => onDelete(tag) : undefined} />
      ))}
      {remaining > 0 && <Tag label={`+${remaining}`} variant="outline" size={size} colorIndex={6} />}
    </div>
  );
};

export default Tag;
