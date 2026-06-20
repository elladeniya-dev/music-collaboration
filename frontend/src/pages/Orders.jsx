import React, { useState, useEffect } from 'react';
import { Box, Typography, CircularProgress, Chip, Button, TextField, Rating, LinearProgress } from '@mui/material';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import StarIcon from '@mui/icons-material/Star';
import { orderService, reviewService } from '../services';
import { showSuccess, showError } from '../utils';
import { useUser } from '../context/UserContext';
import { formatDate } from '../utils';
import { AppButton, AppCard, AppInput, AppModal, EmptyState, PageHeader } from '../components/ui';
import AttachFileIcon from '@mui/icons-material/AttachFile';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import HandshakeIcon from '@mui/icons-material/Handshake';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';

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
      <AppInput
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
      <AppButton
        disabled={loading}
        onClick={handleSubmit}
        startIcon={<StarIcon sx={{ fontSize: 18 }} />}
        sx={{ '&:disabled': { background: 'rgba(255,255,255,0.05)', color: '#5c5c72' } }}
      >
        Submit Review
      </AppButton>
    </Box>
  );
};

const Orders = () => {
  const { user } = useUser();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [reviewedOrders, setReviewedOrders] = useState(new Set());

  // Delivery Modal State
  const [deliverModalOpen, setDeliverModalOpen] = useState(false);
  const [activeOrderId, setActiveOrderId] = useState(null);
  const [deliveryMessage, setDeliveryMessage] = useState('');
  const [deliveryFileUrl, setDeliveryFileUrl] = useState('');
  const [deliveryFile, setDeliveryFile] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

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

  const handleAcceptOrder = async (id) => {
    try {
      setActionLoading(true);
      await orderService.acceptOrder(id);
      showSuccess('Order accepted! Status is now IN PROGRESS.');
      fetchOrders();
    } catch (err) {
      showError(err.response?.data?.message || 'Failed to accept order');
    } finally {
      setActionLoading(false);
    }
  };

  const handleCompleteOrder = async (id) => {
    try {
      setActionLoading(true);
      await orderService.completeOrder(id);
      showSuccess('Order marked as COMPLETED!');
      fetchOrders();
    } catch (err) {
      showError(err.response?.data?.message || 'Failed to complete order');
    } finally {
      setActionLoading(false);
    }
  };

  const handleCancelOrder = async (id) => {
    if (!window.confirm("Are you sure you want to cancel and delete this order?")) return;
    try {
      setActionLoading(true);
      await orderService.cancelOrder(id);
      showSuccess('Order deleted successfully!');
      fetchOrders();
    } catch (err) {
      showError(err.response?.data?.message || 'Failed to delete order');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeliverClick = (id) => {
    setActiveOrderId(id);
    setDeliverModalOpen(true);
  };

  const submitDelivery = async () => {
    if (!deliveryMessage.trim()) {
      showError('Delivery message is required.');
      return;
    }
    if (!deliveryFileUrl.trim() && !deliveryFile) {
      showError('Either a File URL or a direct file upload is required.');
      return;
    }
    
    try {
      setActionLoading(true);
      setUploadProgress(0);
      
      await orderService.deliverOrder(
        activeOrderId, 
        { deliveryMessage, deliveryFileUrl, file: deliveryFile },
        (progressEvent) => {
          if (progressEvent.total) {
            const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
            setUploadProgress(percentCompleted);
          }
        }
      );
      
      showSuccess('Order delivered successfully!');
      setDeliverModalOpen(false);
      setDeliveryMessage('');
      setDeliveryFileUrl('');
      setDeliveryFile(null);
      setUploadProgress(0);
      fetchOrders();
    } catch (err) {
      showError(err.response?.data?.message || 'Failed to deliver order');
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <Box sx={{ maxWidth: 1100, mx: 'auto', px: { xs: 2, md: 3 }, py: 3 }} className="fade-in">
      <PageHeader
        title="My Orders"
        subtitle="Track and manage your service purchases with clear status visibility."
      />

      {loading ? (
        <Box display="flex" justifyContent="center" py={10}>
          <CircularProgress sx={{ color: '#a855f7' }} />
        </Box>
      ) : orders.length === 0 ? (
        <EmptyState
          icon={<ShoppingCartIcon sx={{ fontSize: 48, color: 'rgba(255,255,255,0.08)' }} />}
          title="No orders yet"
          description="You have not bought or sold any services yet."
        />
      ) : (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
          {orders.map(order => {
            const isBuyer = user?.id === order.buyerId;
            const statusCfg = STATUS_COLORS[order.status] || STATUS_COLORS.PENDING;
            const canReview = isBuyer && order.status === 'COMPLETED' && !order.isReviewed && !reviewedOrders.has(order.id);
            const alreadyReviewed = isBuyer && order.status === 'COMPLETED' && (order.isReviewed || reviewedOrders.has(order.id));
            
            return (
              <AppCard key={order.id} interactive sx={{ borderRadius: '16px', p: 3, '&:hover': { borderColor: 'rgba(168,85,247,0.15)' } }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', mb: 2 }}>
                  <Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1 }}>
                      <Chip label={order.status} size="small"
                        sx={{ bgcolor: statusCfg.bg, color: statusCfg.color, fontWeight: 700, fontSize: '0.65rem', height: 22, borderRadius: '6px', border: `1px solid ${statusCfg.border}` }} />
                      <Typography variant="caption" sx={{ color: '#5c5c72' }}>{formatDate(order.createdAt)}</Typography>
                    </Box>
                    <Typography variant="h6" fontWeight={700} sx={{ color: '#e0e0ef', mb: 0.5 }}>{order.serviceTitle}</Typography>
                    <Typography variant="body2" sx={{ color: '#8b8b9e' }}>
                      {isBuyer ? `Purchased from: ` : `Order from: `}
                      <span style={{ color: '#a855f7', fontWeight: 600 }}>@{isBuyer ? (order.sellerName || order.sellerId) : (order.buyerName || order.buyerId)}</span>
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

                {/* Actions */}
                <Box sx={{ mt: 3, display: 'flex', gap: 2 }}>
                  {!isBuyer && order.status === 'PENDING' && (
                    <AppButton disabled={actionLoading} onClick={() => handleAcceptOrder(order.id)} startIcon={<HandshakeIcon />} sx={{ background: 'linear-gradient(135deg, #10b981, #059669)', '&:hover': { boxShadow: '0 0 15px rgba(16,185,129,0.3)' } }}>
                      Accept Order
                    </AppButton>
                  )}
                  {!isBuyer && order.status === 'IN_PROGRESS' && (
                    <AppButton disabled={actionLoading} onClick={() => handleDeliverClick(order.id)} startIcon={<LocalShippingIcon />} sx={{ background: 'linear-gradient(135deg, #0ea5e9, #0284c7)', '&:hover': { boxShadow: '0 0 15px rgba(14,165,233,0.3)' } }}>
                      Deliver Work
                    </AppButton>
                  )}
                  {isBuyer && order.status === 'DELIVERED' && (
                    <AppButton disabled={actionLoading} onClick={() => handleCompleteOrder(order.id)} startIcon={<CheckCircleIcon />} sx={{ background: 'linear-gradient(135deg, #8b5cf6, #7c3aed)', '&:hover': { boxShadow: '0 0 15px rgba(139,92,246,0.3)' } }}>
                      Approve & Complete
                    </AppButton>
                  )}
                  <AppButton kind="ghost" disabled={actionLoading} onClick={() => handleCancelOrder(order.id)} startIcon={<DeleteOutlineIcon />} sx={{ color: '#ef4444', borderColor: 'rgba(239,68,68,0.2)', '&:hover': { background: 'rgba(239,68,68,0.1)', borderColor: '#ef4444' } }}>
                    Delete
                  </AppButton>
                </Box>

                {/* Review Form */}
                {canReview && (
                  <ReviewForm orderId={order.id} onReviewed={handleReviewed} />
                )}
                {alreadyReviewed && (
                  <Box sx={{ mt: 3, p: 2, bgcolor: 'rgba(16,185,129,0.05)', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: 1, border: '1px solid rgba(16,185,129,0.1)' }}>
                    <StarIcon sx={{ color: '#10b981', fontSize: 20 }} />
                    <Typography variant="body2" sx={{ color: '#10b981', fontWeight: 600 }}>You've reviewed this order</Typography>
                  </Box>
                )}
              </AppCard>
            );
          })}
        </Box>
      )}

      {/* Delivery Modal */}
      <AppModal open={deliverModalOpen} onClose={() => setDeliverModalOpen(false)}>
        <Box sx={{ p: 3 }}>
          <Typography variant="h6" fontWeight={800} sx={{ color: '#ececf7', mb: 1 }}>
            Deliver Your Work
          </Typography>
          <Typography variant="body2" sx={{ color: '#8b8b9e', mb: 3 }}>
            Upload your final assets directly, OR provide an external link (Google Drive, Dropbox, etc.).
          </Typography>

          {/* File Upload Area */}
          <Box
            sx={{
              mb: 3,
              p: 2,
              border: '1px dashed rgba(168,85,247,0.4)',
              borderRadius: '12px',
              bgcolor: 'rgba(168,85,247,0.05)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 1,
              cursor: 'pointer',
              '&:hover': { bgcolor: 'rgba(168,85,247,0.08)' }
            }}
            onClick={() => document.getElementById('delivery-file-input').click()}
          >
            <AttachFileIcon sx={{ color: '#a855f7', fontSize: 28 }} />
            <Typography variant="body2" sx={{ color: '#e0e0ef', fontWeight: 600 }}>
              {deliveryFile ? deliveryFile.name : 'Click to Upload Direct Media'}
            </Typography>
            <Typography variant="caption" sx={{ color: '#8b8b9e' }}>
              {deliveryFile ? `${(deliveryFile.size / 1024 / 1024).toFixed(2)} MB` : 'MP3, WAV, ZIP, etc.'}
            </Typography>
            <input
              id="delivery-file-input"
              type="file"
              hidden
              onChange={(e) => {
                if (e.target.files && e.target.files[0]) {
                  setDeliveryFile(e.target.files[0]);
                  setDeliveryFileUrl(''); // clear URL if file selected
                }
              }}
            />
          </Box>

          <Typography variant="body2" sx={{ color: '#8b8b9e', textAlign: 'center', mb: 2 }}>— OR —</Typography>

          <AppInput
            label="External File URL (Optional if file uploaded)"
            fullWidth
            value={deliveryFileUrl}
            onChange={(e) => {
              setDeliveryFileUrl(e.target.value);
              if (e.target.value) setDeliveryFile(null); // clear file if URL pasted
            }}
            sx={{ mb: 3 }}
            InputProps={{
              startAdornment: <AttachFileIcon sx={{ color: '#5c5c72', mr: 1, fontSize: 20 }} />
            }}
          />
          <AppInput
            label="Delivery Message (Required)"
            fullWidth
            multiline
            rows={4}
            value={deliveryMessage}
            onChange={(e) => setDeliveryMessage(e.target.value)}
            sx={{ mb: 4 }}
          />
          {actionLoading && deliveryFile && (
            <Box sx={{ mb: 4 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography variant="caption" sx={{ color: '#8b8b9e' }}>Uploading securely to cloud...</Typography>
                <Typography variant="caption" sx={{ color: '#a855f7', fontWeight: 700 }}>{uploadProgress}%</Typography>
              </Box>
              <LinearProgress 
                variant="determinate" 
                value={uploadProgress} 
                sx={{ 
                  height: 6, 
                  borderRadius: 3,
                  bgcolor: 'rgba(255,255,255,0.05)',
                  '& .MuiLinearProgress-bar': {
                    background: 'linear-gradient(90deg, #a855f7, #ec4899)'
                  }
                }} 
              />
            </Box>
          )}
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
            <AppButton kind="ghost" onClick={() => setDeliverModalOpen(false)} disabled={actionLoading}>Cancel</AppButton>
            <AppButton disabled={actionLoading} onClick={submitDelivery} startIcon={actionLoading ? <CircularProgress size={16} color="inherit" /> : <LocalShippingIcon />} sx={{ background: 'linear-gradient(135deg, #0ea5e9, #0284c7)' }}>
              {actionLoading ? 'Uploading...' : 'Send Delivery'}
            </AppButton>
          </Box>
        </Box>
      </AppModal>
    </Box>
  );
};

export default Orders;
