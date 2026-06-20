import React, { useState, useEffect } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { Box, Typography, Avatar, IconButton, Tooltip, Badge, Popover, List, ListItem, ListItemText, ListItemAvatar, Divider, Dialog, TextField, InputAdornment, CircularProgress, ListSubheader, ListItemButton } from '@mui/material';
import { Notifications, Search as SearchIcon, ShoppingCart, Message, Star, Close as CloseIcon, Person, Work, LocalOffer, CheckCircleOutline } from '@mui/icons-material';
import Sidebar from '../components/Sidebar';
import { useUser } from '../context/UserContext';
import { notificationService, globalSearchService } from '../services';
import websocketService from '../services/websocketService';
import { getUserId } from '../utils';

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
  const { user, loadingUser, setOnlineUsers } = useUser();
  const location = useLocation();
  const navigate = useNavigate();

  // Notifications State
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [notificationAnchorEl, setNotificationAnchorEl] = useState(null);

  // Global Search State
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState({ users: [], services: [], jobs: [] });
  const [searching, setSearching] = useState(false);

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
    const userId = getUserId(user);
    if (!userId) return;

    // Connect to WebSocket using the user's ID
    let notifSub = null;
    websocketService.connect(userId, () => {
      notifSub = websocketService.subscribeToNotifications(userId, (newNotif) => {
        setNotifications((prev) => {
          if (prev.some((n) => n.id === newNotif.id)) return prev;
          return [newNotif, ...prev];
        });
        setUnreadCount((prev) => prev + 1);
      });
      // Subscribe to global presence to send presence broadcast
      websocketService.subscribeToPresence((presenceData) => {
        if (!presenceData || !presenceData.userId) return;
        const isUserOnline = presenceData.isOnline ?? presenceData.online;
        setOnlineUsers((prev) => {
          const newSet = new Set(prev);
          if (isUserOnline) newSet.add(presenceData.userId);
          else newSet.delete(presenceData.userId);
          return newSet;
        });
      });
      websocketService.sendPresenceIndicator({ userId, online: true });
    });

    // Fallback polling for reliability
    const interval = setInterval(fetchNotifications, 30000);
    return () => {
      clearInterval(interval);
      if (notifSub) websocketService.unsubscribe(notifSub);
    };
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

  const handleMarkAllAsRead = async () => {
    try {
      await notificationService.markAllAsRead();
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true, read: true })));
      setUnreadCount(0);
    } catch (err) {
      console.error('Failed to mark all as read', err);
    }
  };

  const handleMarkSingleAsRead = async (e, notif) => {
    e.stopPropagation();
    try {
      await notificationService.markAsRead(notif.id);
      setNotifications(prev => prev.map(n => n.id === notif.id ? { ...n, isRead: true, read: true } : n));
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (err) {
      console.error('Failed to mark as read', err);
    }
  };

  const handleGlobalSearch = async (q) => {
    setSearchQuery(q);
    if (!q.trim()) {
      setSearchResults({ users: [], services: [], jobs: [] });
      return;
    }
    setSearching(true);
    try {
      const results = await globalSearchService.searchGlobal(q);
      setSearchResults(results);
    } catch (err) {
      console.error('Global search failed', err);
    } finally {
      setSearching(false);
    }
  };

  const toggleSidebar = () => setIsCollapsed(prev => !prev);
  const isChatPage = location.pathname.startsWith('/chat') || location.pathname.startsWith('/collab/room');

  const getPageTitle = () => {
    const path = location.pathname;
    if (path === '/services') return 'Marketplace';
    if (path === '/services/create') return 'Create Service';
    if (path === '/job') return 'Job Board';
    if (path === '/post') return 'Post a Job';
    if (path === '/requests') return 'Collaborate';
    if (path.startsWith('/collab/room')) return 'Collaboration Room';
    if (path.startsWith('/chat')) return 'Messages';
    if (path.startsWith('/jobs/')) return 'Job Details';
    if (path.startsWith('/job/')) return 'Edit Job';
    if (path === '/profile') return 'Profile';
    if (path === '/profile/edit') return 'Edit Profile';
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
        <Box
          component="header"
          sx={{
            bgcolor: 'rgba(10, 10, 15, 0.82)',
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
          <Typography variant="h6" fontWeight={700} sx={{ color: '#f0f0fa', letterSpacing: '-0.3px' }}>
            {getPageTitle()}
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Tooltip title="Global Search">
              <IconButton size="small" onClick={() => { setSearchOpen(true); setSearchQuery(''); setSearchResults({ users: [], services: [], jobs: [] }); }} sx={{ color: '#5c5c72', '&:hover': { color: '#a855f7' } }}>
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
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                    {unreadCount > 0 && (
                      <Typography 
                        variant="caption" 
                        onClick={handleMarkAllAsRead}
                        sx={{ cursor: 'pointer', color: '#a855f7', fontWeight: 600, '&:hover': { textDecoration: 'underline' } }}
                      >
                        Mark all as read
                      </Typography>
                    )}
                    {unreadCount > 0 && (
                      <Typography variant="caption" sx={{ color: '#a855f7', bgcolor: 'rgba(168, 85, 247, 0.1)', px: 1, py: 0.5, borderRadius: 1 }}>
                        {unreadCount} new
                      </Typography>
                    )}
                  </Box>
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
                              <Tooltip title="Mark as read">
                                <IconButton size="small" onClick={(e) => handleMarkSingleAsRead(e, notif)} sx={{ ml: 1, color: '#a855f7', '&:hover': { color: '#c084fc' } }}>
                                  <CheckCircleOutline fontSize="small" />
                                </IconButton>
                              </Tooltip>
                            )}
                            {isUnread && !notif.read && (
                              <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: '#a855f7', ml: 1 }} />
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

        <Box
          component="main"
          sx={{
            p: isChatPage ? 0 : { xs: 2, md: 3 },
            px: isChatPage ? 0 : { xs: 2, md: 4 },
            maxWidth: isChatPage ? '100%' : '1400px',
            width: '100%',
            flexGrow: 1,
            overflowX: 'hidden',
            overflowY: 'visible',
            mx: 'auto',
          }}
        >
          <Outlet />
        </Box>
      </Box>

      {/* Global Search Dialog */}
      <Dialog
        open={searchOpen}
        onClose={() => setSearchOpen(false)}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: {
            bgcolor: '#111118',
            border: '1px solid rgba(255,255,255,0.08)',
            borderRadius: '16px',
            backgroundImage: 'none',
            overflow: 'hidden'
          },
        }}
      >
        <Box sx={{ p: 2, display: 'flex', alignItems: 'center', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
          <SearchIcon sx={{ color: '#8b8b9e', mr: 1.5 }} />
          <input 
            autoFocus
            type="text"
            placeholder="Search across platform (people, services, jobs)..."
            value={searchQuery}
            onChange={(e) => handleGlobalSearch(e.target.value)}
            style={{
              flex: 1,
              background: 'transparent',
              border: 'none',
              outline: 'none',
              color: '#fff',
              fontSize: '1.1rem',
            }}
          />
          {searching ? (
            <CircularProgress size={20} sx={{ color: '#a855f7', ml: 1.5 }} />
          ) : null}
          <IconButton onClick={() => setSearchOpen(false)} sx={{ color: '#d4d4e7', ml: 1 }}>
            <CloseIcon />
          </IconButton>
        </Box>
        <List sx={{ maxHeight: '60vh', overflowY: 'auto', p: 0 }}>
          {!searchQuery.trim() ? (
            <Box sx={{ p: 4, textAlign: 'center' }}>
              <Typography variant="body2" sx={{ color: '#8b8b9e' }}>Type something to start searching...</Typography>
            </Box>
          ) : (!searching && searchResults.users.length === 0 && searchResults.services.length === 0 && searchResults.jobs.length === 0) ? (
            <Box sx={{ p: 4, textAlign: 'center' }}>
              <Typography variant="body2" sx={{ color: '#8b8b9e' }}>No results found for "{searchQuery}"</Typography>
            </Box>
          ) : (
            <Box sx={{ p: 1 }}>
              {searchResults.users.length > 0 && (
                <>
                  <ListSubheader sx={{ bgcolor: 'transparent', color: '#a855f7', fontWeight: 700, lineHeight: '36px' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Person sx={{ fontSize: 18 }} /> People
                    </Box>
                  </ListSubheader>
                  {searchResults.users.map(u => (
                    <ListItemButton key={u.id || u._id} onClick={() => { setSearchOpen(false); navigate(`/profile/${getUserId(u)}`); }} sx={{ borderRadius: '8px', '&:hover': { bgcolor: 'rgba(255,255,255,0.03)' } }}>
                      <ListItemAvatar>
                        <Avatar src={u.profileImage} sx={{ bgcolor: '#8b5cf6', width: 32, height: 32, fontSize: '0.85rem' }}>{u.name?.charAt(0)}</Avatar>
                      </ListItemAvatar>
                      <ListItemText primary={u.name} secondary={u.role || 'Member'} primaryTypographyProps={{ sx: { color: '#e0e0ef', fontWeight: 600 } }} secondaryTypographyProps={{ sx: { color: '#8b8b9e' } }} />
                    </ListItemButton>
                  ))}
                </>
              )}

              {searchResults.services.length > 0 && (
                <>
                  <ListSubheader sx={{ bgcolor: 'transparent', color: '#10b981', fontWeight: 700, lineHeight: '36px', mt: 1 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <LocalOffer sx={{ fontSize: 18 }} /> Services
                    </Box>
                  </ListSubheader>
                  {searchResults.services.map(s => (
                    <ListItemButton key={s.id} onClick={() => { setSearchOpen(false); navigate(`/services?q=${encodeURIComponent(s.title)}`); }} sx={{ borderRadius: '8px', '&:hover': { bgcolor: 'rgba(255,255,255,0.03)' } }}>
                      <ListItemAvatar>
                        <Avatar variant="rounded" src={s.imageUrl} sx={{ bgcolor: 'rgba(16,185,129,0.1)', color: '#10b981', width: 40, height: 40 }}>
                          <LocalOffer sx={{ fontSize: 20 }} />
                        </Avatar>
                      </ListItemAvatar>
                      <ListItemText primary={s.title} secondary={`By ${s.sellerName} • $${s.price.toFixed(2)}`} primaryTypographyProps={{ sx: { color: '#e0e0ef', fontWeight: 600 } }} secondaryTypographyProps={{ sx: { color: '#8b8b9e' } }} />
                    </ListItemButton>
                  ))}
                </>
              )}

              {searchResults.jobs.length > 0 && (
                <>
                  <ListSubheader sx={{ bgcolor: 'transparent', color: '#3b82f6', fontWeight: 700, lineHeight: '36px', mt: 1 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Work sx={{ fontSize: 18 }} /> Jobs & Projects
                    </Box>
                  </ListSubheader>
                  {searchResults.jobs.map(j => (
                    <ListItemButton key={j.id} onClick={() => { setSearchOpen(false); navigate(`/jobs/${j.id}`); }} sx={{ borderRadius: '8px', '&:hover': { bgcolor: 'rgba(255,255,255,0.03)' } }}>
                      <ListItemAvatar>
                        <Avatar variant="rounded" sx={{ bgcolor: 'rgba(59,130,246,0.1)', color: '#3b82f6', width: 40, height: 40 }}>
                          <Work sx={{ fontSize: 20 }} />
                        </Avatar>
                      </ListItemAvatar>
                      <ListItemText primary={j.title} secondary={j.skillsNeeded} primaryTypographyProps={{ sx: { color: '#e0e0ef', fontWeight: 600 } }} secondaryTypographyProps={{ sx: { color: '#8b8b9e' } }} />
                    </ListItemButton>
                  ))}
                </>
              )}
            </Box>
          )}
        </List>
      </Dialog>
    </Box>
  );
};

export default MainLayout;
