import React, { useEffect, useMemo, useState } from 'react';
import { Alert, Box, Skeleton, Typography, ToggleButton, ToggleButtonGroup } from '@mui/material';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import PendingActionsIcon from '@mui/icons-material/PendingActions';
import StarRateIcon from '@mui/icons-material/StarRate';
import TaskAltIcon from '@mui/icons-material/TaskAlt';
import PostAddIcon from '@mui/icons-material/PostAdd';
import DesignServicesIcon from '@mui/icons-material/DesignServices';
import HandshakeIcon from '@mui/icons-material/Handshake';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer } from 'recharts';
import ActivityCard from '../components/ActivityCard';
import StatCard from '../components/StatCard';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../context/UserContext';
import { dashboardService } from '../services';
import { PageHeader } from '../components/ui';

const formatCurrency = (value) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(value || 0);
};

const formatTimeAgo = (dateString) => {
  if (!dateString) return '';

  const date = new Date(dateString);
  if (Number.isNaN(date.getTime())) {
    return '';
  }

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

const Dashboard = () => {
  const { user } = useUser();
  const navigate = useNavigate();

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [viewMode, setViewMode] = useState('seller');

  useEffect(() => {
    let isMounted = true;
    let interval = null;

    const fetchDashboard = async (showLoading = true) => {
      if (showLoading) setLoading(true);
      setError(null);

      try {
        const result = await dashboardService.getDashboardData();
        if (isMounted) {
          setData(result);
        }
      } catch {
        if (isMounted && showLoading) {
          setError('Failed to load dashboard data. Please refresh and try again.');
        }
      } finally {
        if (isMounted && showLoading) {
          setLoading(false);
        }
      }
    };

    if (user) {
      fetchDashboard(true);
      // Poll every 15 seconds for real-time updates
      interval = setInterval(() => fetchDashboard(false), 15000);
    } else {
      setLoading(false);
    }

    return () => {
      isMounted = false;
      if (interval) clearInterval(interval);
    };
  }, [user]);

  const stats = useMemo(() => {
    if (!data) {
      return [];
    }

    if (viewMode === 'seller') {
      return [
        {
          label: 'Total Earnings',
          value: formatCurrency(data.totalEarnings),
          helperText: `${data.completedOrders || 0} completed payouts`,
          icon: <AttachMoneyIcon sx={{ fontSize: 20 }} />,
          color: '#10b981',
        },
        {
          label: 'Completed Orders',
          value: `${data.completedOrders || 0}`,
          helperText: `${data.totalOrders || 0} total orders`,
          icon: <TaskAltIcon sx={{ fontSize: 20 }} />,
          color: '#6366f1',
        },
        {
          label: 'Active Orders',
          value: `${data.activeOrders || 0}`,
          helperText: 'Pending + In progress',
          icon: <PendingActionsIcon sx={{ fontSize: 20 }} />,
          color: '#06b6d4',
        },
        {
          label: 'Average Rating',
          value: `${(data.averageRating || 0).toFixed(1)}`,
          helperText: `${data.totalReviews || 0} reviews received`,
          icon: <StarRateIcon sx={{ fontSize: 20 }} />,
          color: '#f59e0b',
        },
      ];
    } else {
      return [
        {
          label: 'Total Spent',
          value: formatCurrency(data.totalSpent),
          helperText: `${data.completedOrdersAsBuyer || 0} completed purchases`,
          icon: <AttachMoneyIcon sx={{ fontSize: 20 }} />,
          color: '#ef4444',
        },
        {
          label: 'Purchased Orders',
          value: `${data.completedOrdersAsBuyer || 0}`,
          helperText: `${data.totalOrdersAsBuyer || 0} total orders`,
          icon: <TaskAltIcon sx={{ fontSize: 20 }} />,
          color: '#8b5cf6',
        },
        {
          label: 'Active Purchases',
          value: `${data.activeOrdersAsBuyer || 0}`,
          helperText: 'Pending + In progress',
          icon: <PendingActionsIcon sx={{ fontSize: 20 }} />,
          color: '#0ea5e9',
        },
        {
          label: 'Average Rating',
          value: `${(data.averageRating || 0).toFixed(1)}`,
          helperText: `${data.totalReviews || 0} reviews received`,
          icon: <StarRateIcon sx={{ fontSize: 20 }} />,
          color: '#f59e0b',
        },
      ];
    }
  }, [data, viewMode]);

  const recentOrders = useMemo(() => {
    const ordersList = viewMode === 'seller' ? data?.recentOrders : data?.recentOrdersAsBuyer;
    if (!ordersList) {
      return [];
    }

    return ordersList.map((order) => ({
      id: `order-${order.id}`,
      primary: order.serviceTitle || `Order ${order.id?.slice(0, 6) || ''}`,
      secondary: `${order.status} - ${formatCurrency(order.price)}`,
      time: formatTimeAgo(order.createdAt),
    }));
  }, [data, viewMode]);

  const recentReviews = useMemo(() => {
    if (!data?.recentReviews) {
      return [];
    }

    return data.recentReviews.map((review) => ({
      id: `review-${review.id}`,
      primary: `${review.rating || 0} star review`,
      secondary: review.comment || 'No comment provided',
      time: formatTimeAgo(review.createdAt),
    }));
  }, [data]);

  const chartData = useMemo(() => {
    return viewMode === 'seller' ? data?.sellerChartData || [] : data?.buyerChartData || [];
  }, [data, viewMode]);

  const renderLoadingState = () => (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-6">
        {[1, 2, 3, 4].map((id) => (
          <Skeleton
            key={id}
            variant="rounded"
            height={140}
            sx={{ bgcolor: 'rgba(255,255,255,0.05)', borderRadius: '16px' }}
          />
        ))}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        {[1, 2].map((id) => (
          <Skeleton
            key={id}
            variant="rounded"
            height={280}
            sx={{ bgcolor: 'rgba(255,255,255,0.05)', borderRadius: '16px' }}
          />
        ))}
      </div>
    </>
  );

  return (
    <Box sx={{ maxWidth: 1240, mx: 'auto', px: { xs: 2, md: 3 }, py: 3 }} className="fade-in">
      <PageHeader
        title="Analytics Dashboard"
        subtitle={user?.name ? `Welcome back, ${user.name}. Real-time insight into your activities.` : 'Real-time insight into your activities.'}
      />

      <Box
        sx={{
          mb: 4,
          p: { xs: 2, md: 3 },
          borderRadius: '18px',
          border: '1px solid rgba(255,255,255,0.08)',
          background:
            'radial-gradient(circle at top right, rgba(16,185,129,0.22), transparent 42%), radial-gradient(circle at bottom left, rgba(99,102,241,0.2), transparent 38%), #16161f',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: 2
        }}
      >
        <Box>
          <Typography variant="h5" fontWeight={800} sx={{ color: '#f0f0fb', letterSpacing: '-0.4px' }}>
            Snapshot
          </Typography>
          <Typography variant="body2" sx={{ color: '#afafc4', mt: 0.5 }}>
            Track your platform interactions and statistics in real time.
          </Typography>
        </Box>
        
        <ToggleButtonGroup
          value={viewMode}
          exclusive
          onChange={(e, newMode) => newMode && setViewMode(newMode)}
          size="small"
          sx={{
            bgcolor: 'rgba(0,0,0,0.2)',
            p: 0.5,
            borderRadius: 2,
            '& .MuiToggleButton-root': {
              color: '#a1a1aa',
              border: 'none',
              borderRadius: 1.5,
              textTransform: 'none',
              fontWeight: 600,
              px: 3,
              '&.Mui-selected': {
                bgcolor: '#a855f7',
                color: '#fff',
                '&:hover': { bgcolor: '#9333ea' }
              }
            }
          }}
        >
          <ToggleButton value="seller">Seller</ToggleButton>
          <ToggleButton value="buyer">Buyer</ToggleButton>
        </ToggleButtonGroup>
      </Box>

      {error ? (
        <Alert severity="error" sx={{ mb: 3, bgcolor: 'rgba(239,68,68,0.12)', color: '#fecaca' }}>
          {error}
        </Alert>
      ) : null}

      {loading ? (
        renderLoadingState()
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-6">
            {stats.map((stat) => (
              <StatCard
                key={stat.label}
                label={stat.label}
                value={stat.value}
                helperText={stat.helperText}
                icon={stat.icon}
                color={stat.color}
              />
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
            <Box sx={{ gridColumn: { lg: 'span 2' }, bgcolor: '#16161f', borderRadius: '16px', p: 3, border: '1px solid rgba(255,255,255,0.05)' }}>
              <Typography variant="subtitle2" fontWeight={700} sx={{ color: '#ececf7', mb: 3 }}>
                Performance Overview
              </Typography>
              <Box sx={{ width: '100%', height: 300 }}>
                {chartData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                      <defs>
                        <linearGradient id="colorEarnings" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor={viewMode === 'seller' ? '#10b981' : '#ef4444'} stopOpacity={0.3}/>
                          <stop offset="95%" stopColor={viewMode === 'seller' ? '#10b981' : '#ef4444'} stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <XAxis dataKey="month" stroke="#5c5c72" fontSize={12} tickLine={false} axisLine={false} />
                      <YAxis stroke="#5c5c72" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(val) => `$${val}`} />
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                      <RechartsTooltip 
                        contentStyle={{ backgroundColor: '#1e1e2d', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px' }}
                        itemStyle={{ color: '#e0e0ef' }}
                        formatter={(value) => [`$${value}`, viewMode === 'seller' ? 'Earnings' : 'Spent']}
                      />
                      <Area type="monotone" dataKey="earnings" stroke={viewMode === 'seller' ? '#10b981' : '#ef4444'} strokeWidth={3} fillOpacity={1} fill="url(#colorEarnings)" />
                    </AreaChart>
                  </ResponsiveContainer>
                ) : (
                  <Box sx={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Typography variant="body2" sx={{ color: '#72728a' }}>No chart data available yet.</Typography>
                  </Box>
                )}
              </Box>
            </Box>

            <Box sx={{ bgcolor: '#16161f', borderRadius: '16px', p: 3, border: '1px solid rgba(255,255,255,0.05)' }}>
              <Typography variant="subtitle2" fontWeight={700} sx={{ color: '#ececf7', mb: 3 }}>
                Quick Actions
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <Box onClick={() => navigate('/services/create')} sx={{ p: 2, borderRadius: '12px', bgcolor: 'rgba(99,102,241,0.08)', border: '1px solid rgba(99,102,241,0.15)', cursor: 'pointer', transition: 'all 0.2s', '&:hover': { bgcolor: 'rgba(99,102,241,0.12)', transform: 'translateY(-2px)' } }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1 }}>
                    <DesignServicesIcon sx={{ color: '#6366f1', fontSize: 20 }} />
                    <Typography variant="subtitle2" fontWeight={700} sx={{ color: '#e0e0ef' }}>Create Service</Typography>
                  </Box>
                  <Typography variant="caption" sx={{ color: '#8b8b9e' }}>Offer your skills to the marketplace and start earning.</Typography>
                </Box>
                
                <Box onClick={() => navigate('/post')} sx={{ p: 2, borderRadius: '12px', bgcolor: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.15)', cursor: 'pointer', transition: 'all 0.2s', '&:hover': { bgcolor: 'rgba(245,158,11,0.12)', transform: 'translateY(-2px)' } }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1 }}>
                    <PostAddIcon sx={{ color: '#f59e0b', fontSize: 20 }} />
                    <Typography variant="subtitle2" fontWeight={700} sx={{ color: '#e0e0ef' }}>Post a Job</Typography>
                  </Box>
                  <Typography variant="caption" sx={{ color: '#8b8b9e' }}>Hire top professionals for your next music project.</Typography>
                </Box>

                <Box onClick={() => navigate('/requests')} sx={{ p: 2, borderRadius: '12px', bgcolor: 'rgba(236,72,153,0.08)', border: '1px solid rgba(236,72,153,0.15)', cursor: 'pointer', transition: 'all 0.2s', '&:hover': { bgcolor: 'rgba(236,72,153,0.12)', transform: 'translateY(-2px)' } }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1 }}>
                    <HandshakeIcon sx={{ color: '#ec4899', fontSize: 20 }} />
                    <Typography variant="subtitle2" fontWeight={700} sx={{ color: '#e0e0ef' }}>Start Collaboration</Typography>
                  </Box>
                  <Typography variant="caption" sx={{ color: '#8b8b9e' }}>Build a team and create a track together in real-time.</Typography>
                </Box>
              </Box>
            </Box>
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
            <ActivityCard
              title={viewMode === 'seller' ? 'Recent Selling Orders' : 'Recent Purchases'}
              items={recentOrders}
              emptyText={`No ${viewMode === 'seller' ? 'selling' : 'purchasing'} activity yet.`}
            />

            <ActivityCard
              title="Recent Reviews"
              items={recentReviews}
              emptyText="No reviews yet. Completed orders and feedback will appear here."
            />
          </div>
        </>
      )}
    </Box>
  );
};

export default Dashboard;
