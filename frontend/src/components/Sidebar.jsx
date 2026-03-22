import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Box,
  Avatar,
  Typography,
  Tooltip,
  IconButton,
} from '@mui/material';
import {
  Storefront as MarketplaceIcon,
  AddCircleOutline as CreateIcon,
  Message as MessageIcon,
  Group as CollabIcon,
  Work as JobsIcon,
  PostAdd as PostJobIcon,
  Menu as MenuIcon,
} from '@mui/icons-material';
import { useUser } from '../context/UserContext';

const navItems = [
  { label: 'Marketplace', icon: <MarketplaceIcon />, path: '/services' },
  { label: 'Create Service', icon: <CreateIcon />, path: '/services/create' },
  { label: 'Jobs', icon: <JobsIcon />, path: '/job' },
  { label: 'Post Job', icon: <PostJobIcon />, path: '/post' },
  { label: 'Collaborate', icon: <CollabIcon />, path: '/requests' },
  { label: 'Messages', icon: <MessageIcon />, path: '/chat' },
];

const Sidebar = ({ isCollapsed, toggleSidebar }) => {
  const { user } = useUser();
  const navigate = useNavigate();
  const location = useLocation();

  const isActive = (path) => location.pathname === path || location.pathname.startsWith(path + '/');

  return (
    <Box
      sx={{
        width: isCollapsed ? '72px' : '240px',
        transition: 'width 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        height: '100vh',
        bgcolor: '#0d0d14',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        py: 2,
        px: isCollapsed ? 1 : 1.5,
        borderRight: '1px solid rgba(255,255,255,0.05)',
        position: 'sticky',
        top: 0,
        overflow: 'hidden',
      }}
    >
      {/* Top */}
      <Box>
        {/* Toggle */}
        <Box
          onClick={toggleSidebar}
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 1.5,
            px: 1.5,
            py: 1.5,
            mb: 2,
            borderRadius: '12px',
            cursor: 'pointer',
            justifyContent: isCollapsed ? 'center' : 'flex-start',
            transition: 'background 0.2s',
            '&:hover': { bgcolor: 'rgba(255,255,255,0.04)' },
          }}
        >
          <IconButton size="small" sx={{ color: '#8b8b9e' }}>
            <MenuIcon />
          </IconButton>
          {!isCollapsed && (
            <Typography
              variant="subtitle2"
              fontWeight={800}
              sx={{
                background: 'linear-gradient(135deg, #a855f7, #6366f1)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                letterSpacing: '-0.3px',
                fontSize: '1rem',
              }}
            >
              HarmoniX
            </Typography>
          )}
        </Box>

        {/* Section label */}
        {!isCollapsed && (
          <Typography
            variant="overline"
            sx={{ px: 2, mb: 1, display: 'block', color: '#4a4a5e', fontSize: '0.6rem', letterSpacing: '1.5px' }}
          >
            MENU
          </Typography>
        )}

        {/* Nav Items */}
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
          {navItems.map((item) => {
            const active = isActive(item.path);
            return (
              <Tooltip key={item.label} title={item.label} placement="right" disableHoverListener={!isCollapsed}>
                <Box
                  onClick={() => navigate(item.path)}
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1.5,
                    px: 1.5,
                    py: 1.25,
                    borderRadius: '12px',
                    cursor: 'pointer',
                    justifyContent: isCollapsed ? 'center' : 'flex-start',
                    transition: 'all 0.25s ease',
                    bgcolor: active ? 'rgba(168, 85, 247, 0.1)' : 'transparent',
                    boxShadow: active ? '0 0 20px rgba(168, 85, 247, 0.1), inset 0 0 0 1px rgba(168, 85, 247, 0.15)' : 'none',
                    '&:hover': {
                      bgcolor: active ? 'rgba(168, 85, 247, 0.12)' : 'rgba(255,255,255,0.04)',
                    },
                  }}
                >
                  <Box
                    sx={{
                      color: active ? '#a855f7' : '#5c5c72',
                      display: 'flex',
                      alignItems: 'center',
                      transition: 'color 0.2s',
                      '& .MuiSvgIcon-root': { fontSize: 21 },
                    }}
                  >
                    {item.icon}
                  </Box>
                  {!isCollapsed && (
                    <Typography
                      variant="body2"
                      fontWeight={active ? 600 : 400}
                      sx={{
                        color: active ? '#c084fc' : '#8b8b9e',
                        whiteSpace: 'nowrap',
                        fontSize: '0.85rem',
                      }}
                    >
                      {item.label}
                    </Typography>
                  )}
                </Box>
              </Tooltip>
            );
          })}
        </Box>
      </Box>

      {/* Bottom: User */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 1.5,
          px: 1.5,
          py: 1.5,
          borderRadius: '12px',
          cursor: 'pointer',
          justifyContent: isCollapsed ? 'center' : 'flex-start',
          '&:hover': { bgcolor: 'rgba(255,255,255,0.04)' },
          transition: 'background 0.2s',
        }}
      >
        <Tooltip title={user?.name || 'Profile'} placement="right" disableHoverListener={!isCollapsed}>
          <Avatar
            src={user?.profileImage || undefined}
            sx={{
              width: 34,
              height: 34,
              background: 'linear-gradient(135deg, #a855f7, #6366f1)',
              fontSize: 14,
              fontWeight: 600,
            }}
          >
            {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
          </Avatar>
        </Tooltip>
        {!isCollapsed && (
          <Box sx={{ overflow: 'hidden' }}>
            <Typography variant="body2" fontWeight={600} noWrap sx={{ color: '#e0e0ef', fontSize: '0.85rem' }}>
              {user?.name || 'Guest'}
            </Typography>
            <Typography variant="caption" noWrap sx={{ color: '#5c5c72', fontSize: '0.7rem' }}>
              {user?.email || ''}
            </Typography>
          </Box>
        )}
      </Box>
    </Box>
  );
};

export default Sidebar;
