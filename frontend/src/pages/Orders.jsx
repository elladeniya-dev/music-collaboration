import React, { useState, useEffect } from 'react';
import { Box, Typography, CircularProgress, Chip, Button, TextField, Rating } from '@mui/material';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import StarIcon from '@mui/icons-material/Star';
import { orderService, reviewService } from '../services';
import { showSuccess, showError } from '../utils';
import { useUser } from '../context/UserContext';
import { formatDate } from '../utils';

const STATUS_COLORS = {
  PENDING: { bg: 'rgba(236,72,153,0.08)', color: '#ec4899', border: 'rgba(236,72,153,0.15)' },
  IN_PROGRESS: { bg: 'rgba(245,158,11,0.08)', color: '#f59e0b', border: 'rgba(245,158,11,0.15)' },
  DELIVERED: { bg: 'rgba(16,185,129,0.08)', color: '#10b981', border: 'rgba(16,185,129,0.15)' },
  COMPLETED: { bg: 'rgba(99,102,241,0.08)', color: '#6366f1', border: 'rgba(99,102,241,0.15)' },
  CANCELLED: { bg: 'rgba(239,68,68,0.08)', color: '#ef4444', border: 'rgba(239,68,68,0.15)' },
};

const ReviewForm = ({ orderId, onReviewed }) => {
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!comment.trim()) {
      showError('Please provide a comment');
      return;
    }
    setLoading(true);
    try {
      await reviewService.addReview({ orderId, rating, comment });
      showSuccess('Review submitted successfully!');
      onReviewed(orderId);
    } catch (err) {
      showError(err.response?.data?.message || 'Failed to submit review');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ mt: 3, pt: 3, borderTop: '1px solid rgba(255,255,255,0.05)' }}>
      <Typography variant="subtitle2" fontWeight={700} sx={{ color: '#e0e0ef', mb: 1.5 }}>
        Leave a Review
      </Typography>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
        <Rating
          value={rating}
          onChange={(event, newValue) => {
            if(newValue != null) setRating(newValue);
          }}
          precision={1}
          sx={{
            '& .MuiRating-iconFilled': { color: '#f59e0b' },
            '& .MuiRating-iconEmpty': { color: 'rgba(255,255,255,0.1)' },
          }}
        />
      </Box>
      <TextField
        fullWidth
        multiline
        rows={3}
        placeholder="How was your experience?"
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        sx={{
          mb: 2,
          '& .MuiOutlinedInput-root': {
            color: '#e0e0ef',
            bgcolor: 'rgba(255,255,255,0.02)',
            borderRadius: '12px',
            '& fieldset': { borderColor: 'rgba(255,255,255,0.05)' },
            '&:hover fieldset': { borderColor: 'rgba(168,85,247,0.3)' },
            '&.Mui-focused fieldset': { borderColor: '#a855f7' },
          },
        }}
      />
      <Button
        disabled={loading}
        onClick={handleSubmit}
        startIcon={<StarIcon sx={{ fontSize: 18 }} />}
        sx={{
          borderRadius: '10px', textTransform: 'none', fontWeight: 600, px: 3, py: 1,
          background: 'linear-gradient(135deg, #a855f7, #6366f1)', color: 'white',
          '&:hover': { boxShadow: '0 0 20px rgba(168,85,247,0.2)' },
          '&:disabled': { background: 'rgba(255,255,255,0.05)', color: '#5c5c72' }
        }}
      >
        Submit Review
      </Button>
    </Box>
  );
};

const Orders = () => {
  const { user } = useUser();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [reviewedOrders, setReviewedOrders] = useState(new Set());

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const data = await orderService.getMyOrders();
      setOrders(data || []);
    } catch (err) {
      showError('Failed to load orders');
    } finally {
      setLoading(false);
    }
  };

  const handleReviewed = (orderId) => {
    setReviewedOrders(prev => new Set(prev).add(orderId));
  };

  return (
    <Box sx={{ maxWidth: 1000, mx: 'auto', px: { xs: 2, md: 4 }, py: 4 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 4 }}>
        <Box sx={{ width: 48, height: 48, borderRadius: '14px', background: 'linear-gradient(135deg, rgba(168,85,247,0.15), rgba(99,102,241,0.15))', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#a855f7' }}>
          <ShoppingCartIcon />
        </Box>
        <Box>
          <Typography variant="h4" fontWeight={800} sx={{ color: '#e0e0ef', letterSpacing: '-0.5px' }}>My Orders</Typography>
          <Typography variant="caption" sx={{ color: '#5c5c72' }}>Track and manage your service purchases</Typography>
        </Box>
      </Box>

      {loading ? (
        <Box display="flex" justifyContent="center" py={10}>
          <CircularProgress sx={{ color: '#a855f7' }} />
        </Box>
      ) : orders.length === 0 ? (
        <Box sx={{ textAlign: 'center', py: 10, bgcolor: '#16161f', borderRadius: '20px', border: '1px solid rgba(255,255,255,0.05)' }}>
          <ShoppingCartIcon sx={{ fontSize: 48, color: 'rgba(255,255,255,0.05)', mb: 2 }} />
          <Typography variant="h6" sx={{ color: '#e0e0ef', mb: 1 }}>No orders yet</Typography>
          <Typography variant="body2" sx={{ color: '#5c5c72' }}>You haven't bought or sold any services.</Typography>
        </Box>
      ) : (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
          {orders.map(order => {
            const isBuyer = user?.id === order.buyerId;
            const statusCfg = STATUS_COLORS[order.status] || STATUS_COLORS.PENDING;
            const canReview = isBuyer && order.status === 'COMPLETED' && !reviewedOrders.has(order.id);
            
            return (
              <Box key={order.id} sx={{ bgcolor: '#16161f', borderRadius: '16px', p: 3, border: '1px solid rgba(255,255,255,0.05)', transition: 'all 0.3s', '&:hover': { borderColor: 'rgba(168,85,247,0.15)' } }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', mb: 2 }}>
                  <Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1 }}>
                      <Chip label={order.status} size="small"
                        sx={{ bgcolor: statusCfg.bg, color: statusCfg.color, fontWeight: 700, fontSize: '0.65rem', height: 22, borderRadius: '6px', border: `1px solid ${statusCfg.border}` }} />
                      <Typography variant="caption" sx={{ color: '#5c5c72' }}>{formatDate(order.createdAt)}</Typography>
                    </Box>
                    <Typography variant="h6" fontWeight={700} sx={{ color: '#e0e0ef', mb: 0.5 }}>{order.serviceTitle}</Typography>
                    <Typography variant="body2" sx={{ color: '#8b8b9e' }}>
                      {isBuyer ? `Purchased from Seller: ${order.sellerId}` : `Order from Buyer: ${order.buyerId}`}
                    </Typography>
                  </Box>
                  <Typography variant="h5" fontWeight={800} sx={{ color: '#10b981' }}>${order.price?.toFixed(2) || '0.00'}</Typography>
                </Box>
                
                {/* Delivery message if present */}
                {order.deliveryMessage && (
                  <Box sx={{ mt: 2, p: 2, bgcolor: 'rgba(255,255,255,0.02)', borderRadius: '12px', border: '1px dashed rgba(255,255,255,0.05)' }}>
                    <Typography variant="caption" fontWeight={600} sx={{ color: '#a855f7', mb: 0.5, display: 'block' }}>Delivery Note:</Typography>
                    <Typography variant="body2" sx={{ color: '#e0e0ef' }}>{order.deliveryMessage}</Typography>
                  </Box>
                )}

                {/* Review Form */}
                {canReview && (
                  <ReviewForm orderId={order.id} onReviewed={handleReviewed} />
                )}
                {isBuyer && order.status === 'COMPLETED' && reviewedOrders.has(order.id) && (
                  <Box sx={{ mt: 3, p: 2, bgcolor: 'rgba(16,185,129,0.05)', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: 1, border: '1px solid rgba(16,185,129,0.1)' }}>
                    <StarIcon sx={{ color: '#10b981', fontSize: 20 }} />
                    <Typography variant="body2" sx={{ color: '#10b981', fontWeight: 600 }}>You've reviewed this order</Typography>
                  </Box>
                )}
              </Box>
            );
          })}
        </Box>
      )}
    </Box>
  );
};

export default Orders;
