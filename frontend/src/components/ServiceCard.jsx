import React, { useState } from 'react';
import { Box, Typography, Chip, Rating, Button } from '@mui/material';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import PersonIcon from '@mui/icons-material/Person';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import DeleteIcon from '@mui/icons-material/Delete';
import { UserLevelChip, UserBadges, getMockUserMeta } from './UserBadge';
import StatusBadge, { getMockStatus } from './StatusBadge';
import AudioPlayer from './AudioPlayer';
import { TagGroup } from './Tag';
import { useUser } from '../context/UserContext';

const PACKAGES = ['Basic', 'Standard', 'Premium'];
const PKG_MULTIPLIERS = [1, 1.8, 3];
const PKG_COLORS = ['#5c5c72', '#a855f7', '#f59e0b'];
const PKG_DELIVERY = [1, 0.8, 0.6];

const ServiceCard = ({ service, onOrder, onDelete }) => {
  const { user } = useUser();
  const [selectedPkg, setSelectedPkg] = useState(0);

  const gradients = [
    'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
    'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
    'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
    'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
    'linear-gradient(135deg, #a18cd1 0%, #fbc2eb 100%)',
    'linear-gradient(135deg, #fccb90 0%, #d57eeb 100%)',
    'linear-gradient(135deg, #e0c3fc 0%, #8ec5fc 100%)',
  ];
  const gradientIndex = (service.title?.length || 0) % gradients.length;
  const basePrice = service.price || 50;
  const baseDelivery = service.deliveryTime || 5;
  const pkgPrice = (basePrice * PKG_MULTIPLIERS[selectedPkg]).toFixed(0);
  const pkgDelivery = Math.max(1, Math.round(baseDelivery * PKG_DELIVERY[selectedPkg]));
  const { level, badges } = getMockUserMeta(service.sellerName);
  const sellerStatus = getMockStatus(service.sellerName);
  const isOwner = user?.id === service.sellerId;

  return (
    <Box sx={{
      bgcolor: '#16161f', borderRadius: '16px', overflow: 'hidden',
      border: '1px solid rgba(255,255,255,0.05)',
      transition: 'all 0.35s cubic-bezier(0.4, 0, 0.2, 1)',
      '&:hover': { transform: 'translateY(-6px) scale(1.01)', boxShadow: '0 20px 60px rgba(168, 85, 247, 0.12), 0 0 0 1px rgba(168, 85, 247, 0.12)', borderColor: 'rgba(168, 85, 247, 0.18)' },
    }}>
      {/* Image / Gradient */}
      <Box sx={{ height: 120, background: gradients[gradientIndex], position: 'relative', overflow: 'hidden' }}>
        {service.category && (
          <Chip label={service.category} size="small"
            sx={{ position: 'absolute', top: 10, left: 10, bgcolor: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(10px)', color: 'white', fontWeight: 600, fontSize: '0.6rem', height: 22, borderRadius: '6px' }} />
        )}
      </Box>

      <Box sx={{ p: 2.5 }}>
        {/* Title */}
        <Typography variant="subtitle2" fontWeight={700}
          sx={{ color: '#e0e0ef', lineHeight: 1.4, mb: 0.75, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
          {service.title}
        </Typography>

        {/* Seller row with status */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <PersonIcon sx={{ fontSize: 13, color: '#5c5c72' }} />
            <Typography variant="caption" sx={{ color: '#8b8b9e', fontWeight: 500 }}>{service.sellerName || 'Seller'}</Typography>
          </Box>
          <StatusBadge status={sellerStatus} showLabel={false} />
          <UserLevelChip level={level} />
        </Box>

        {/* Stars */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, mb: 1 }}>
          <Rating value={4.5} precision={0.5} readOnly size="small"
            sx={{ '& .MuiRating-iconFilled': { color: '#f59e0b' }, '& .MuiRating-iconEmpty': { color: 'rgba(255,255,255,0.1)' }, fontSize: '0.8rem' }} />
          <Typography variant="caption" sx={{ color: '#5c5c72' }}>4.5</Typography>
        </Box>

        {/* Badges */}
        {badges.length > 0 && <Box sx={{ mb: 1 }}><UserBadges badges={badges} /></Box>}

        {/* Tags */}
        {service.tags?.length > 0 && <Box sx={{ mb: 1.5 }}><TagGroup tags={service.tags} max={3} /></Box>}

        {/* Audio preview */}
        <Box sx={{ mb: 2 }}>
          <AudioPlayer compact seed={service.title || 'audio'} duration={service.deliveryTime ? service.deliveryTime * 40 : 180} accent="#a855f7" />
        </Box>

        {/* Package selector */}
        <Box sx={{ display: 'flex', gap: 0.5, mb: 2 }}>
          {PACKAGES.map((pkg, i) => (
            <Box key={pkg} onClick={() => setSelectedPkg(i)}
              sx={{
                flex: 1, textAlign: 'center', py: 0.6, borderRadius: '8px', cursor: 'pointer',
                bgcolor: selectedPkg === i ? `${PKG_COLORS[i]}15` : 'rgba(255,255,255,0.02)',
                border: `1px solid ${selectedPkg === i ? `${PKG_COLORS[i]}40` : 'rgba(255,255,255,0.04)'}`,
                transition: 'all 0.2s', '&:hover': { borderColor: `${PKG_COLORS[i]}30` },
              }}>
              <Typography variant="caption" sx={{ color: selectedPkg === i ? PKG_COLORS[i] : '#5c5c72', fontWeight: selectedPkg === i ? 700 : 400, fontSize: '0.58rem' }}>{pkg}</Typography>
            </Box>
          ))}
        </Box>

        {/* Price + Delivery */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h6" fontWeight={800} sx={{ color: '#10b981' }}>${pkgPrice}</Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <AccessTimeIcon sx={{ fontSize: 13, color: '#5c5c72' }} />
            <Typography variant="caption" sx={{ color: '#8b8b9e' }}>{pkgDelivery}d delivery</Typography>
          </Box>
        </Box>

        {/* Actions */}
        {isOwner ? (
          <Button fullWidth startIcon={<DeleteIcon sx={{ fontSize: 16 }} />}
            onClick={(e) => { e.stopPropagation(); onDelete?.(service.id); }}
            sx={{
              borderRadius: '10px', textTransform: 'none', fontWeight: 700, py: 1,
              background: 'rgba(239,68,68,0.1)', color: '#ef4444', fontSize: '0.8rem',
              border: '1px solid rgba(239,68,68,0.2)',
              '&:hover': { bgcolor: 'rgba(239,68,68,0.2)', borderColor: 'rgba(239,68,68,0.4)' },
            }}>
            Delete Service
          </Button>
        ) : (
          <Button fullWidth startIcon={<ShoppingCartIcon sx={{ fontSize: 16 }} />}
            onClick={(e) => { e.stopPropagation(); onOrder?.(service, PACKAGES[selectedPkg], pkgPrice); }}
            sx={{
              borderRadius: '10px', textTransform: 'none', fontWeight: 700, py: 1,
              background: 'linear-gradient(135deg, #a855f7, #6366f1)', color: 'white', fontSize: '0.8rem',
              '&:hover': { boxShadow: '0 0 25px rgba(168,85,247,0.25)' },
            }}>
            Order Now
          </Button>
        )}
      </Box>
    </Box>
  );
};

export default ServiceCard;
