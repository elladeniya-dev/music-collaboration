import React, { useState, useEffect } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { Box, Typography, Avatar, IconButton, Tooltip, Badge, Popover, List, ListItem, ListItemText, ListItemAvatar, Divider } from '@mui/material';
import { Notifications, Search as SearchIcon, ShoppingCart, Message, Star } from '@mui/icons-material';
import Sidebar from '../components/Sidebar';
import { useUser } from '../context/UserContext';
import { notificationService } from '../services';

const formatTimeAgo = (dateString) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  const now = new Date();
  const diffInSeconds = Math.floor((now - date) / 1000);
  
  if (diffInSeconds < 60) return 'Just now';
  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) return `${diffInHours}h ago`;
  const diffInDays = Math.floor(diffInHours / 24);
  return `${diffInDays}d ago`;
};

const MainLayout = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const { user, loadingUser } = useUser();
  const location = useLocation();
  const navigate = useNavigate();

  // Notifications State
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [notificationAnchorEl, setNotificationAnchorEl] = useState(null);

  useEffect(() => {
    if (!loadingUser && !user) navigate('/');
  }, [user, loadingUser, navigate]);

  const fetchNotifications = async () => {
    if (user) {
      const data = await notificationService.getNotifications();
      setNotifications(data || []);
      // Handle both isRead and read from diverse Jackson serialization
      setUnreadCount((data || []).filter(n => n.isRead === false || n.read === false).length);
    }
  };

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 15000);
    return () => clearInterval(interval);
  }, [user]);

  const handleNotificationClick = (event) => {
    setNotificationAnchorEl(event.currentTarget);
  };

  const handleNotificationClose = () => {
    setNotificationAnchorEl(null);
  };

  const handleNotificationItemClick = async (notif) => {
    const isUnread = notif.isRead === false || notif.read === false;
    if (isUnread) {
      try {
        await notificationService.markAsRead(notif.id);
        setNotifications(prev => prev.map(n => n.id === notif.id ? { ...n, isRead: true, read: true } : n));
        setUnreadCount(prev => Math.max(0, prev - 1));
      } catch (err) {
        console.error('Failed to mark as read', err);
      }
    }
    handleNotificationClose();
    
    if (notif.type === 'ORDER') navigate('/orders');
    else if (notif.type === 'MESSAGE') navigate('/chat');
    else if (notif.type === 'REVIEW') navigate('/profile');
  };

  const toggleSidebar = () => setIsCollapsed(prev => !prev);
  const isChatPage = location.pathname.startsWith('/chat');
  const isMarketplace = location.pathname === '/services';
  const isJobBoard = location.pathname === '/job';
  const isCollab = location.pathname === '/requests';
  const isHeroPage = isMarketplace || isJobBoard || isCollab;

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
    if (path === '/orders') return 'Orders';
    return 'Dashboard';
  };

  const getNotificationIcon = (type) => {
    switch(type) {
      case 'ORDER': return <ShoppingCart sx={{ color: '#a855f7' }} />;
      case 'MESSAGE': return <Message sx={{ color: '#3b82f6' }} />;
      case 'REVIEW': return <Star sx={{ color: '#eab308' }} />;
      default: return <Notifications sx={{ color: '#a1a1aa' }} />;
    }
  };

  if (loadingUser) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', bgcolor: '#0a0a0f' }}>
        <div className="w-10 h-10 border-2 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
      </Box>
    );
  }

  if (!user) return null;

  const openNotifications = Boolean(notificationAnchorEl);

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: '#0a0a0f' }}>
      <Box sx={{ display: { xs: 'none', md: 'block' }, flexShrink: 0 }}>
        <Sidebar isCollapsed={isCollapsed} toggleSidebar={toggleSidebar} />
      </Box>

      <Box sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
        {/* Top Navbar */}
        {!isHeroPage && (
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
                <IconButton 
                  size="small" 
                  onClick={handleNotificationClick}
                  sx={{ color: '#5c5c72', '&:hover': { color: '#a855f7' }, mr: 1 }}
                >
                  <Badge badgeContent={unreadCount} color="error" sx={{ '& .MuiBadge-badge': { bgcolor: '#ef4444', color: 'white' } }}>
                    <Notifications />
                  </Badge>
                </IconButton>
              </Tooltip>

              <Popover
                open={openNotifications}
                anchorEl={notificationAnchorEl}
                onClose={handleNotificationClose}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                transformOrigin={{ vertical: 'top', horizontal: 'right' }}
                PaperProps={{
                  sx: {
                    mt: 1.5,
                    width: 360,
                    maxHeight: 480,
                    bgcolor: '#13131a',
                    backgroundImage: 'none',
                    border: '1px solid rgba(255,255,255,0.1)',
                    boxShadow: '0 10px 40px -10px rgba(0,0,0,0.5)',
                    borderRadius: 3,
                    overflow: 'hidden'
                  }
                }}
              >
                <Box sx={{ p: 2, borderBottom: '1px solid rgba(255,255,255,0.05)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography variant="subtitle1" fontWeight={700} sx={{ color: '#fff' }}>Notifications</Typography>
                  {unreadCount > 0 && (
                    <Typography variant="caption" sx={{ color: '#a855f7', bgcolor: 'rgba(168, 85, 247, 0.1)', px: 1, py: 0.5, borderRadius: 1 }}>
                      {unreadCount} new
                    </Typography>
                  )}
                </Box>
                <List sx={{ p: 0 }}>
                  {notifications.length === 0 ? (
                    <Box sx={{ p: 4, textAlign: 'center' }}>
                      <Notifications sx={{ fontSize: 40, color: '#272732', mb: 1 }} />
                      <Typography variant="body2" sx={{ color: '#a1a1aa' }}>No notifications yet</Typography>
                    </Box>
                  ) : (
                    notifications.map((notif, index) => {
                      const isUnread = notif.isRead === false || notif.read === false;
                      return (
                        <React.Fragment key={notif.id}>
                          <ListItem 
                            button 
                            onClick={() => handleNotificationItemClick(notif)}
                            sx={{ 
                              bgcolor: isUnread ? 'rgba(168, 85, 247, 0.05)' : 'transparent',
                              transition: 'background-color 0.2s',
                              '&:hover': { bgcolor: 'rgba(255,255,255,0.03)' },
                              px: 2, py: 1.5
                            }}
                          >
                            <ListItemAvatar sx={{ minWidth: 48 }}>
                              <Avatar sx={{ bgcolor: 'rgba(255,255,255,0.05)', color: '#fff' }}>
                                {getNotificationIcon(notif.type)}
                              </Avatar>
                            </ListItemAvatar>
                            <ListItemText 
                              primary={notif.message} 
                              secondary={formatTimeAgo(notif.createdAt)}
                              primaryTypographyProps={{ 
                                variant: 'body2', 
                                fontWeight: isUnread ? 600 : 400,
                                color: isUnread ? '#fff' : '#d4d4d8',
                                sx: { mb: 0.5, lineHeight: 1.3 }
                              }}
                              secondaryTypographyProps={{ 
                                variant: 'caption', 
                                color: '#71717a' 
                              }}
                            />
                            {isUnread && (
                              <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: '#a855f7', ml: 2 }} />
                            )}
                          </ListItem>
                          {index < notifications.length - 1 && <Divider sx={{ borderColor: 'rgba(255,255,255,0.05)' }} />}
                        </React.Fragment>
                      );
                    })
                  )}
                </List>
              </Popover>

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
            p: isChatPage || isHeroPage ? 0 : { xs: 2, md: 3 },
            px: isChatPage || isHeroPage ? 0 : { xs: 2, md: 4 },
            maxWidth: isChatPage || isHeroPage ? '100%' : '1400px',
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
