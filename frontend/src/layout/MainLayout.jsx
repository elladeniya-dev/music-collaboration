import React, { useState, useEffect } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { Box, Typography, Avatar, IconButton, Tooltip } from '@mui/material';
import { Notifications, Search as SearchIcon } from '@mui/icons-material';
import Sidebar from '../components/Sidebar';
import { useUser } from '../context/UserContext';

const MainLayout = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const { user, loadingUser } = useUser();
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loadingUser && !user) navigate('/');
  }, [user, loadingUser, navigate]);

  const toggleSidebar = () => setIsCollapsed(prev => !prev);
  const isChatPage = location.pathname.startsWith('/chat');
  const isMarketplace = location.pathname === '/services';

  const getPageTitle = () => {
    const path = location.pathname;
    if (path === '/services') return 'Marketplace';
    if (path === '/services/create') return 'Create Service';
    if (path === '/job') return 'Job Board';
    if (path === '/post') return 'Post a Job';
    if (path === '/requests') return 'Collaborate';
    if (path.startsWith('/chat')) return 'Messages';
    if (path.startsWith('/jobs/')) return 'Job Details';
    if (path.startsWith('/job/')) return 'Edit Job';
    return 'Dashboard';
  };

  if (loadingUser) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', bgcolor: '#0a0a0f' }}>
        <div className="w-10 h-10 border-2 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
      </Box>
    );
  }

  if (!user) return null;

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: '#0a0a0f' }}>
      <Box sx={{ display: { xs: 'none', md: 'block' }, flexShrink: 0 }}>
        <Sidebar isCollapsed={isCollapsed} toggleSidebar={toggleSidebar} />
      </Box>

      <Box sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
        {/* Top Navbar */}
        {!isMarketplace && (
          <Box
            component="header"
            sx={{
              bgcolor: 'rgba(10, 10, 15, 0.8)',
              backdropFilter: 'blur(20px)',
              borderBottom: '1px solid rgba(255,255,255,0.05)',
              px: { xs: 2, md: 4 },
              py: 1.5,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              position: 'sticky',
              top: 0,
              zIndex: 10,
            }}
          >
            <Typography variant="h6" fontWeight={700} sx={{ color: '#e0e0ef', letterSpacing: '-0.3px' }}>
              {getPageTitle()}
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Tooltip title="Search">
                <IconButton size="small" sx={{ color: '#5c5c72', '&:hover': { color: '#a855f7' } }}>
                  <SearchIcon />
                </IconButton>
              </Tooltip>
              <Tooltip title="Notifications">
                <IconButton size="small" sx={{ color: '#5c5c72', '&:hover': { color: '#a855f7' } }}>
                  <Notifications />
                </IconButton>
              </Tooltip>
              <Avatar
                src={user?.profileImage || undefined}
                sx={{
                  width: 32, height: 32, ml: 1,
                  background: 'linear-gradient(135deg, #a855f7, #6366f1)',
                  fontSize: 13, fontWeight: 600,
                }}
              >
                {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
              </Avatar>
            </Box>
          </Box>
        )}

        <Box
          component="main"
          sx={{
            p: isChatPage ? 0 : isMarketplace ? 0 : { xs: 2, md: 3 },
            px: isChatPage ? 0 : isMarketplace ? 0 : { xs: 2, md: 4 },
            maxWidth: isChatPage || isMarketplace ? '100%' : '1400px',
            width: '100%',
            flexGrow: 1,
            overflow: 'hidden',
          }}
        >
          <Outlet />
        </Box>
      </Box>
    </Box>
  );
};

export default MainLayout;
