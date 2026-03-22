import React, { useState, useEffect } from 'react';
import { Box, Typography, Avatar, Button, Rating, Chip, CircularProgress } from '@mui/material';
import MessageIcon from '@mui/icons-material/Message';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import EditIcon from '@mui/icons-material/Edit';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import StarIcon from '@mui/icons-material/Star';
import WorkIcon from '@mui/icons-material/Work';
import MusicNoteIcon from '@mui/icons-material/MusicNote';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../context/UserContext';
import StatusBadge from '../components/StatusBadge';
import { UserLevelChip, UserBadges, getMockUserMeta } from '../components/UserBadge';
import { TagGroup } from '../components/Tag';
import AudioPlayer from '../components/AudioPlayer';
import PortfolioItem from '../components/PortfolioItem';
import ReviewCard from '../components/ReviewCard';
import ServiceCard from '../components/ServiceCard';
import { showSuccess, showError } from '../utils';
import { formatDate } from '../utils';
import { userService, serviceService, orderService, reviewService } from '../services';

const Profile = () => {
  const { user } = useUser();
  const navigate = useNavigate();
  const [following, setFollowing] = useState(false);
  const [activeSection, setActiveSection] = useState('portfolio');
  
  const [profileData, setProfileData] = useState(null);
  const [sellerServices, setSellerServices] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const pData = await userService.getCurrentUser();
        setProfileData(pData);
        
        // fetch services
        if (pData?.id) {
            const sData = await serviceService.getServicesBySeller(pData.id);
            setSellerServices(sData || []);
            
            const rData = await reviewService.getSellerReviews(pData.id);
            setReviews(rData || []);
        }
      } catch (err) {
        showError('Failed to load profile');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleOrderService = async (svc, pkg, price) => {
     try {
         await orderService.createOrder(svc.id);
         showSuccess(`🎉 Order placed for ${svc.title} — $${price}`);
     } catch (err) {
         showError('Failed to place order.');
     }
  };

  const handleDeleteService = async (serviceId) => {
    if (!window.confirm("Are you sure you want to delete this service?")) return;
    try {
      await serviceService.deleteService(serviceId);
      setSellerServices(prev => prev.filter(s => s.id !== serviceId));
      showSuccess("Service deleted successfully");
    } catch (error) {
      showError("Failed to delete service");
    }
  };

  if (loading || !profileData) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 10 }}>
        <CircularProgress sx={{ color: '#a855f7' }} />
      </Box>
    );
  }

  const { level, badges } = getMockUserMeta(profileData.name);
  const displayName = profileData.name || 'Artist';
  
  const portfolio = profileData.portfolio || [];
  const skills = profileData.skills || [];
  const tools = profileData.tools || [];
  const genres = profileData.genres || [];

  const sections = ['portfolio', 'about', 'services', 'reviews'];

  return (
    <Box sx={{ maxWidth: 1000, mx: 'auto', px: { xs: 2, md: 0 }, pb: 6 }}>
      {/* ═══════════ HERO ═══════════ */}
      <Box sx={{ position: 'relative', mb: 4 }}>
        {/* Banner */}
        <Box sx={{ height: 200, borderRadius: '20px', overflow: 'hidden', position: 'relative' }}>
          <Box sx={{ position: 'absolute', inset: 0, background: 'linear-gradient(135deg, rgba(168,85,247,0.15), rgba(99,102,241,0.1), rgba(6,182,212,0.08))', zIndex: 1 }} />
          <Box sx={{ position: 'absolute', top: '20%', left: '10%', width: 300, height: 300, borderRadius: '50%', background: 'radial-gradient(circle, rgba(168,85,247,0.12) 0%, transparent 70%)' }} />
          <Box sx={{ position: 'absolute', top: '30%', right: '15%', width: 250, height: 250, borderRadius: '50%', background: 'radial-gradient(circle, rgba(99,102,241,0.08) 0%, transparent 70%)' }} />
          <Box sx={{ position: 'absolute', inset: 0, bgcolor: '#0d0d14' }} />
        </Box>

        {/* Profile card overlay */}
        <Box sx={{ position: 'relative', zIndex: 2, mt: -8, mx: { xs: 2, md: 4 }, bgcolor: '#16161f', borderRadius: '20px', border: '1px solid rgba(255,255,255,0.06)', p: { xs: 3, md: 4 } }}>
          <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 3, alignItems: { md: 'flex-start' } }}>
            {/* Avatar */}
            <Box sx={{ position: 'relative', flexShrink: 0 }}>
              <Avatar src={user?.profileImage}
                sx={{ width: 100, height: 100, background: 'linear-gradient(135deg, #a855f7, #6366f1)', fontSize: 36, fontWeight: 800, border: '4px solid #16161f', boxShadow: '0 0 30px rgba(168,85,247,0.2)' }}>
                {displayName[0]}
              </Avatar>
              <Box sx={{ position: 'absolute', bottom: 4, right: 4, width: 16, height: 16, borderRadius: '50%', bgcolor: '#10b981', border: '3px solid #16161f' }} />
            </Box>

            {/* Info */}
            <Box sx={{ flex: 1 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 0.5, flexWrap: 'wrap' }}>
                <Typography variant="h5" fontWeight={800} sx={{ color: '#e0e0ef', letterSpacing: '-0.5px' }}>{displayName}</Typography>
                <StatusBadge status={profileData.availability?.toLowerCase() || 'available'} />
                <UserLevelChip level={level} />
              </Box>
              <Typography variant="body2" sx={{ color: '#a855f7', fontWeight: 600, mb: 1 }}>{profileData.role || 'Music Professional'}</Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 }}>
                <Rating value={profileData.averageRating || 0} readOnly precision={0.1} size="small" sx={{ '& .MuiRating-iconFilled': { color: '#f59e0b' }, '& .MuiRating-iconEmpty': { color: 'rgba(255,255,255,0.08)' }, fontSize: '0.9rem' }} />
                <Typography variant="caption" sx={{ color: '#5c5c72' }}>{profileData.averageRating || 0} ({profileData.totalReviews || 0} reviews)</Typography>
              </Box>
              <UserBadges badges={badges} />
            </Box>

            {/* Actions */}
            <Box sx={{ display: 'flex', gap: 1.5, flexShrink: 0, flexWrap: 'wrap' }}>
              <Button startIcon={<EditIcon sx={{ fontSize: 16 }} />} onClick={() => navigate('/profile/edit')}
                sx={{ borderRadius: '10px', textTransform: 'none', fontWeight: 600, px: 2.5, bgcolor: 'rgba(255,255,255,0.04)', color: '#8b8b9e', border: '1px solid rgba(255,255,255,0.06)', '&:hover': { borderColor: 'rgba(168,85,247,0.2)', color: '#a855f7' } }}>
                Edit
              </Button>
              <Button startIcon={<MessageIcon sx={{ fontSize: 16 }} />} onClick={() => navigate('/chat')}
                sx={{ borderRadius: '10px', textTransform: 'none', fontWeight: 600, px: 2.5, bgcolor: 'rgba(168,85,247,0.08)', color: '#c084fc', border: '1px solid rgba(168,85,247,0.15)', '&:hover': { bgcolor: 'rgba(168,85,247,0.12)' } }}>
                Message
              </Button>
              <Button startIcon={<PersonAddIcon sx={{ fontSize: 16 }} />}
                onClick={() => { setFollowing(!following); showSuccess(following ? 'Unfollowed' : 'Following!'); }}
                sx={{
                  borderRadius: '10px', textTransform: 'none', fontWeight: 700, px: 2.5,
                  background: following ? 'rgba(255,255,255,0.04)' : 'linear-gradient(135deg, #a855f7, #6366f1)',
                  color: following ? '#5c5c72' : 'white',
                  border: following ? '1px solid rgba(255,255,255,0.06)' : 'none',
                  '&:hover': { boxShadow: following ? 'none' : '0 0 20px rgba(168,85,247,0.2)' },
                }}>
                {following ? 'Following' : 'Follow'}
              </Button>
            </Box>
          </Box>
        </Box>
      </Box>

      {/* ═══════════ STATS BAR ═══════════ */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        {[
          { label: 'Completed', value: profileData.completedOrders || 0, icon: <CheckCircleIcon sx={{ fontSize: 18 }} />, color: '#10b981' },
          { label: 'Active Jobs', value: '0', icon: <WorkIcon sx={{ fontSize: 18 }} />, color: '#f59e0b' },
          { label: 'Avg Response', value: '< 1hr', icon: <AccessTimeIcon sx={{ fontSize: 18 }} />, color: '#06b6d4' },
          { label: 'Rating', value: profileData.averageRating || 'N/A', icon: <StarIcon sx={{ fontSize: 18 }} />, color: '#a855f7' },
        ].map(stat => (
          <Box key={stat.label} sx={{ bgcolor: '#16161f', borderRadius: '14px', p: 2.5, border: '1px solid rgba(255,255,255,0.05)', textAlign: 'center' }}>
            <Box sx={{ display: 'inline-flex', width: 36, height: 36, borderRadius: '10px', alignItems: 'center', justifyContent: 'center', bgcolor: `${stat.color}12`, color: stat.color, mb: 1 }}>{stat.icon}</Box>
            <Typography variant="h6" fontWeight={800} sx={{ color: '#e0e0ef' }}>{stat.value}</Typography>
            <Typography variant="caption" sx={{ color: '#5c5c72' }}>{stat.label}</Typography>
          </Box>
        ))}
      </div>

      {/* ═══════════ SECTION TABS ═══════════ */}
      <Box sx={{ display: 'flex', gap: 0, mb: 4, borderBottom: '1px solid rgba(255,255,255,0.05)', overflowX: 'auto' }}>
        {sections.map(s => (
          <Box key={s} onClick={() => setActiveSection(s)}
            sx={{ px: 3, py: 1.5, cursor: 'pointer', whiteSpace: 'nowrap',
              borderBottom: activeSection === s ? '2px solid #a855f7' : '2px solid transparent',
              color: activeSection === s ? '#e0e0ef' : '#5c5c72',
              fontWeight: activeSection === s ? 700 : 400, fontSize: '0.85rem',
              textTransform: 'capitalize', transition: 'all 0.2s' }}>
            {s}
          </Box>
        ))}
      </Box>

      {/* ═══════════ PORTFOLIO ═══════════ */}
      {activeSection === 'portfolio' && (
        <Box>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <Typography variant="h6" fontWeight={700} sx={{ color: '#e0e0ef' }}>Portfolio</Typography>
            <Chip label={`${portfolio.length} items`} size="small"
              sx={{ bgcolor: 'rgba(168,85,247,0.08)', color: '#c084fc', fontWeight: 600, fontSize: '0.6rem', height: 22 }} />
          </Box>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {portfolio.length > 0 ? (
               portfolio.map((item, i) => <PortfolioItem key={item.id} item={item} index={i} />)
            ) : (
               <Typography variant="body2" sx={{ color: '#5c5c72' }}>No portfolio items uploaded.</Typography>
            )}
          </div>
        </Box>
      )}

      {/* ═══════════ ABOUT ═══════════ */}
      {activeSection === 'about' && (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          <Box sx={{ bgcolor: '#16161f', borderRadius: '16px', p: 4, border: '1px solid rgba(255,255,255,0.05)' }}>
            <Typography variant="subtitle2" fontWeight={700} sx={{ color: '#e0e0ef', mb: 2 }}>About</Typography>
            <Typography variant="body2" sx={{ color: '#8b8b9e', lineHeight: 1.8 }}>
              {profileData.bio || 'No bio provided yet. Edit your profile to add some information about yourself!'}
            </Typography>
          </Box>

          <Box sx={{ bgcolor: '#16161f', borderRadius: '16px', p: 4, border: '1px solid rgba(255,255,255,0.05)' }}>
            <Typography variant="subtitle2" fontWeight={700} sx={{ color: '#e0e0ef', mb: 2 }}>Skills</Typography>
            {skills.length > 0 ? (
               <TagGroup tags={skills} max={10} />
            ) : (
               <Typography variant="caption" sx={{ color: '#5c5c72' }}>No skills added.</Typography>
            )}
          </Box>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Box sx={{ bgcolor: '#16161f', borderRadius: '16px', p: 4, border: '1px solid rgba(255,255,255,0.05)' }}>
              <Typography variant="subtitle2" fontWeight={700} sx={{ color: '#e0e0ef', mb: 2 }}>
                <MusicNoteIcon sx={{ fontSize: 16, mr: 0.5, verticalAlign: 'text-bottom', color: '#a855f7' }} />
                Tools & DAWs
              </Typography>
              {tools.length > 0 ? (
                  <TagGroup tags={tools} variant="outline" max={10} />
              ) : (
                  <Typography variant="caption" sx={{ color: '#5c5c72' }}>No tools added.</Typography>
              )}
            </Box>
            <Box sx={{ bgcolor: '#16161f', borderRadius: '16px', p: 4, border: '1px solid rgba(255,255,255,0.05)' }}>
              <Typography variant="subtitle2" fontWeight={700} sx={{ color: '#e0e0ef', mb: 2 }}>🎵 Genres</Typography>
              {genres.length > 0 ? (
                  <TagGroup tags={genres} variant="outline" max={10} />
              ) : (
                  <Typography variant="caption" sx={{ color: '#5c5c72' }}>No genres added.</Typography>
              )}
            </Box>
          </div>
        </Box>
      )}

      {/* ═══════════ SERVICES ═══════════ */}
      {activeSection === 'services' && (
        <Box>
          <Typography variant="h6" fontWeight={700} sx={{ color: '#e0e0ef', mb: 3 }}>Services</Typography>
          {sellerServices.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {sellerServices.map(s => (
                  <ServiceCard key={s.id} service={{ ...s, sellerName: displayName }}
                    onOrder={handleOrderService} onDelete={handleDeleteService} />
                ))}
              </div>
          ) : (
             <Typography variant="body2" sx={{ color: '#5c5c72' }}>No services offered yet.</Typography>
          )}
        </Box>
      )}

      {/* ═══════════ REVIEWS ═══════════ */}
      {activeSection === 'reviews' && (
        <Box>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <Typography variant="h6" fontWeight={700} sx={{ color: '#e0e0ef' }}>Reviews</Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <StarIcon sx={{ fontSize: 16, color: '#f59e0b' }} />
              <Typography variant="subtitle2" fontWeight={700} sx={{ color: '#e0e0ef' }}>{profileData.averageRating || 0}</Typography>
              <Typography variant="caption" sx={{ color: '#5c5c72' }}>({profileData.totalReviews || 0})</Typography>
            </Box>
          </Box>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {reviews.length > 0 ? (
               reviews.map(r => (
                 <ReviewCard key={r.id} review={{ id: r.id, name: r.reviewerName, rating: r.rating, comment: r.comment, date: formatDate(r.createdAt) }} />
               ))
            ) : (
               <Typography variant="body2" sx={{ color: '#5c5c72' }}>No reviews yet.</Typography>
            )}
          </div>
        </Box>
      )}
    </Box>
  );
};

export default Profile;
