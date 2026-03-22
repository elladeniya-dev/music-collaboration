import React, { useEffect, useState } from 'react';
import { Box, Typography, CircularProgress, Skeleton } from '@mui/material';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import StarIcon from '@mui/icons-material/Star';
import PeopleIcon from '@mui/icons-material/People';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import MusicNoteIcon from '@mui/icons-material/MusicNote';
import AudioPlayer from '../components/AudioPlayer';
import { UserLevelChip, getMockUserMeta } from '../components/UserBadge';
import StatusBadge from '../components/StatusBadge';
import { useUser } from '../context/UserContext';
import { dashboardService } from '../services';

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

// Keeping static layout elements matching previous style
const QUICK_TRACKS = [
  { title: 'Summer Vibes Beat', seed: 'beat1', duration: 195 },
  { title: 'Lo-fi Chill Mix', seed: 'lofi2', duration: 240 },
  { title: 'R&B Vocal Demo', seed: 'rnb3', duration: 165 },
];

const MONTHLY_DATA = [35, 52, 48, 65, 72, 58, 80, 95, 88, 110, 105, 130];

const Dashboard = () => {
  const { user } = useUser();
  const { level, badges } = getMockUserMeta(user?.name);
  
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const result = await dashboardService.getDashboardData();
        setData(result);
      } catch (err) {
        setError('Failed to load dashboard data');
      } finally {
        setLoading(false);
      }
    };
    if (user) {
      fetchDashboard();
    }
  }, [user]);

  if (loading) {
    return (
      <Box sx={{ maxWidth: 1200, mx: 'auto', px: { xs: 2, md: 4 }, py: 3 }}>
        <Skeleton variant="text" width={300} height={60} sx={{ bgcolor: 'rgba(255,255,255,0.05)' }} />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6 mt-4">
          {[1, 2, 3, 4].map(i => <Skeleton key={i} variant="rounded" height={120} sx={{ bgcolor: 'rgba(255,255,255,0.05)', borderRadius: '16px' }} />)}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
          <Skeleton variant="rounded" height={300} sx={{ bgcolor: 'rgba(255,255,255,0.05)', borderRadius: '16px', gridColumn: { lg: 'span 2' } }} />
          <Skeleton variant="rounded" height={300} sx={{ bgcolor: 'rgba(255,255,255,0.05)', borderRadius: '16px' }} />
        </div>
      </Box>
    );
  }

  if (error || !data) {
    return (
      <Box sx={{ maxWidth: 1200, mx: 'auto', px: { xs: 2, md: 4 }, py: 3, textAlign: 'center' }}>
        <Typography color="error">{error || 'Could not load data'}</Typography>
      </Box>
    );
  }

  const STATS = [
    { label: 'Total Earnings', value: `$${data.totalEarnings?.toLocaleString() || '0'}`, change: '+8%', icon: <AttachMoneyIcon />, color: '#10b981', trend: 'up' },
    { label: 'Completed Orders', value: data.completedOrders?.toString() || '0', change: '+2', icon: <ShoppingCartIcon />, color: '#a855f7', trend: 'up' },
    { label: 'Active Orders', value: data.activeOrders?.toString() || '0', change: 'Current', icon: <ShoppingCartIcon />, color: '#06b6d4', trend: 'up' },
    { label: 'Avg Rating', value: data.averageRating?.toFixed(1) || '0.0', change: `${data.totalReviews || 0} reviews`, icon: <StarIcon />, color: '#f59e0b', trend: 'up' },
  ];

  const recentOrdersMapped = (data.recentOrders || []).map(o => ({
    id: `order_${o.id}`,
    type: 'order',
    text: o.serviceTitle || `Order #${o.id.substring(0, 6)}`,
    subtext: `${o.status} • $${o.price}`,
    time: formatTimeAgo(o.createdAt),
    icon: <ShoppingCartIcon sx={{ fontSize: 16 }} />,
    color: o.status === 'COMPLETED' || o.status === 'DELIVERED' ? '#10b981' : '#a855f7',
    date: new Date(o.createdAt)
  }));

  const recentReviewsMapped = (data.recentReviews || []).map(r => ({
    id: `review_${r.id}`,
    type: 'review',
    text: `${r.rating}-Star Review from ${r.reviewerName || 'A buyer'}`,
    subtext: `"${r.comment || 'Great service!'}"`,
    time: formatTimeAgo(r.createdAt),
    icon: <StarIcon sx={{ fontSize: 16 }} />,
    color: '#f59e0b',
    date: new Date(r.createdAt)
  }));

  const combinedActivity = [...recentOrdersMapped, ...recentReviewsMapped]
    .sort((a, b) => b.date - a.date)
    .slice(0, 5);

  return (
    <Box sx={{ maxWidth: 1200, mx: 'auto', px: { xs: 2, md: 4 }, py: 3 }}>
      {/* Welcome */}
      <Box sx={{ mb: 4 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
          <Typography variant="h4" fontWeight={900} sx={{ color: '#e0e0ef', letterSpacing: '-0.5px' }}>
            Welcome back, <span style={{ background: 'linear-gradient(135deg, #a855f7, #6366f1)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>{user?.name || 'Artist'}</span>
          </Typography>
          <StatusBadge status="available" />
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <UserLevelChip level={level} />
          <Typography variant="caption" sx={{ color: '#5c5c72', ml: 1 }}>{data.totalOrders} Lifetime Orders</Typography>
        </Box>
      </Box>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {STATS.map((stat) => (
          <Box key={stat.label} sx={{
            bgcolor: '#16161f', borderRadius: '16px', p: 3,
            border: '1px solid rgba(255,255,255,0.05)',
            transition: 'all 0.3s',
            '&:hover': { transform: 'translateY(-3px)', boxShadow: `0 12px 40px ${stat.color}10`, borderColor: `${stat.color}20` },
          }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
              <Box sx={{ width: 40, height: 40, borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: `${stat.color}12`, color: stat.color, '& .MuiSvgIcon-root': { fontSize: 20 } }}>
                {stat.icon}
              </Box>
              <Box sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.3, px: 1, py: 0.25, borderRadius: '6px', bgcolor: 'rgba(16,185,129,0.08)' }}>
                <TrendingUpIcon sx={{ fontSize: 12, color: '#10b981' }} />
                <Typography variant="caption" sx={{ color: '#10b981', fontWeight: 600, fontSize: '0.6rem' }}>{stat.change}</Typography>
              </Box>
            </Box>
            <Typography variant="h5" fontWeight={800} sx={{ color: '#e0e0ef', mb: 0.25 }}>{stat.value}</Typography>
            <Typography variant="caption" sx={{ color: '#5c5c72' }}>{stat.label}</Typography>
          </Box>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
        {/* Earnings Chart */}
        <Box sx={{ bgcolor: '#16161f', borderRadius: '16px', p: 3, border: '1px solid rgba(255,255,255,0.05)', gridColumn: { lg: 'span 2' } }}>
          <Typography variant="subtitle2" fontWeight={700} sx={{ color: '#e0e0ef', mb: 3 }}>Earnings Overview</Typography>
          <Box sx={{ display: 'flex', alignItems: 'end', gap: '6px', height: 140 }}>
            {MONTHLY_DATA.map((val, i) => {
              const maxVal = Math.max(...MONTHLY_DATA);
              const heightPct = (val / maxVal) * 100;
              const months = ['J', 'F', 'M', 'A', 'M', 'J', 'J', 'A', 'S', 'O', 'N', 'D'];
              return (
                <Box key={i} sx={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 0.5 }}>
                  <Box sx={{
                    width: '100%', borderRadius: '4px',
                    height: `${heightPct}%`, minHeight: 8,
                    background: i === MONTHLY_DATA.length - 1
                      ? 'linear-gradient(180deg, #a855f7, #6366f1)'
                      : 'rgba(168,85,247,0.15)',
                    transition: 'all 0.3s',
                    '&:hover': { background: 'linear-gradient(180deg, #a855f7, #6366f1)', transform: 'scaleY(1.05)' },
                  }} />
                  <Typography variant="caption" sx={{ color: '#5c5c72', fontSize: '0.55rem' }}>{months[i]}</Typography>
                </Box>
              );
            })}
          </Box>
        </Box>

        {/* Recent Activity */}
        <Box sx={{ bgcolor: '#16161f', borderRadius: '16px', p: 3, border: '1px solid rgba(255,255,255,0.05)' }}>
          <Typography variant="subtitle2" fontWeight={700} sx={{ color: '#e0e0ef', mb: 2 }}>Recent Activity</Typography>
          {combinedActivity.length === 0 ? (
            <Typography variant="body2" sx={{ color: '#71717a', textAlign: 'center', py: 4 }}>No recent activity yet</Typography>
          ) : (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
              {combinedActivity.map((activity) => (
                <Box key={activity.id} sx={{ display: 'flex', gap: 1.5, alignItems: 'flex-start' }}>
                  <Box sx={{ width: 28, height: 28, borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: `${activity.color}12`, color: activity.color, flexShrink: 0, mt: 0.25 }}>
                    {activity.icon}
                  </Box>
                  <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Typography variant="caption" fontWeight={600} sx={{ color: '#e0e0ef', display: 'block', lineHeight: 1.3, fontSize: '0.72rem' }}>{activity.text}</Typography>
                    <Typography variant="caption" sx={{ color: '#5c5c72', fontSize: '0.62rem' }}>{activity.subtext}</Typography>
                  </Box>
                  <Typography variant="caption" sx={{ color: '#4a4a5e', fontSize: '0.55rem', whiteSpace: 'nowrap', flexShrink: 0 }}>{activity.time}</Typography>
                </Box>
              ))}
            </Box>
          )}
        </Box>
      </div>

      {/* Audio Previews Placeholder */}
      <Box sx={{ bgcolor: '#16161f', borderRadius: '16px', p: 3, border: '1px solid rgba(255,255,255,0.05)' }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Box>
            <Typography variant="subtitle2" fontWeight={700} sx={{ color: '#e0e0ef' }}>Your Recent Tracks</Typography>
            <Typography variant="caption" sx={{ color: '#5c5c72' }}>Preview your latest uploads</Typography>
          </Box>
          <MusicNoteIcon sx={{ color: '#a855f7', fontSize: 20 }} />
        </Box>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {QUICK_TRACKS.map(track => (
            <AudioPlayer key={track.seed} title={track.title} seed={track.seed} duration={track.duration} />
          ))}
        </div>
      </Box>
    </Box>
  );
};

export default Dashboard;
