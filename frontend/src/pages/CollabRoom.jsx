import React, { useState, useEffect, useRef } from 'react';
import { Box, Typography, Avatar, Chip, IconButton, Button, TextField, CircularProgress } from '@mui/material';
import PersonIcon from '@mui/icons-material/Person';
import AttachFileIcon from '@mui/icons-material/AttachFile';
import SendIcon from '@mui/icons-material/Send';
import MusicNoteIcon from '@mui/icons-material/MusicNote';
import DownloadIcon from '@mui/icons-material/Download';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { useParams, useNavigate } from 'react-router-dom';
import { UserLevelChip, UserBadges } from '../components/UserBadge';
import { AppButton } from '../components/ui';
import { useUser } from '../context/UserContext';
import { collaborationService, collabRoomService, userService, websocketService } from '../services';
import { formatTime, getUserId } from '../utils';

const MOCK_FILES = [
  { name: 'beat_v2_master.wav', size: '24.5 MB', type: 'audio', uploadedBy: 'You', date: 'Today' },
  { name: 'vocals_take3.mp3', size: '8.2 MB', type: 'audio', uploadedBy: 'Sarah C.', date: 'Yesterday' },
];

const CollabRoom = () => {
  const { id: roomId } = useParams();
  const navigate = useNavigate();
  const { user, onlineUsers } = useUser();
  const [roomInfo, setRoomInfo] = useState(null);
  const [members, setMembers] = useState([]);
  const [messages, setMessages] = useState([]);
  const [files, setFiles] = useState([]);
  const [message, setMessage] = useState('');
  const [activeSection, setActiveSection] = useState('chat');
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    const initRoom = async () => {
      try {
        setLoading(true);
        // Fetch room info
        const room = await collaborationService.getCollaborationRequestById(roomId);
        setRoomInfo(room);
        
        // Fetch members
        if (room.memberIds && room.memberIds.length > 0) {
          const fetchedMembers = await userService.getBulkUsers(room.memberIds);
          setMembers(fetchedMembers);
        }
        
        // Fetch chat history
        const history = await collabRoomService.getMessages(roomId);
        setMessages(history);

        // Fetch shared files
        const sharedFiles = await collabRoomService.getFiles(roomId);
        setFiles(sharedFiles);
      } catch (err) {
        console.error("Error loading collab room", err);
      } finally {
        setLoading(false);
      }
    };
    
    initRoom();

    // Subscribe to WS
    const subId = websocketService.subscribeToCollabRoom(roomId, (newMsg) => {
      setMessages(prev => [...prev, newMsg]);
    });

    return () => {
      if (subId) websocketService.unsubscribe(subId);
    };
  }, [roomId]);

  // Periodic presence checks for members
  useEffect(() => {
    if (!members || members.length === 0) return;
    
    const checkPresence = () => {
      if (!websocketService.isConnected()) return;
      members.forEach(m => {
        const userId = getUserId(m);
        if (userId) websocketService.checkPresence(userId);
      });
    };

    // Check presence shortly after load, and then every 15 seconds
    const timeouts = [
      setTimeout(checkPresence, 1000),
      setTimeout(checkPresence, 3000)
    ];
    const interval = setInterval(checkPresence, 15000);

    return () => {
      timeouts.forEach(clearTimeout);
      clearInterval(interval);
    };
  }, [members]);

  useEffect(() => {
    if (activeSection === 'chat') {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, activeSection]);

  const handleSendMessage = async () => {
    if (!message.trim()) return;
    try {
      const msgData = {
        roomId,
        senderId: user.id,
        senderName: user.name,
        message: message.trim()
      };
      await collabRoomService.sendMessage(roomId, msgData);
      setMessage('');
    } catch (err) {
      console.error("Failed to send message", err);
    }
  };

  const handleFileUpload = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      setUploading(true);
      const formData = new FormData();
      formData.append('file', file);
      
      const uploadedFile = await collabRoomService.uploadFile(roomId, formData);
      setFiles(prev => [uploadedFile, ...prev]);
    } catch (err) {
      console.error("Failed to upload file", err);
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  if (loading || !roomInfo) {
    return <Box display="flex" justifyContent="center" mt={10}><CircularProgress sx={{ color: '#ec4899' }} /></Box>;
  }

  return (
    <Box sx={{ display: 'flex', height: 'calc(100vh - 64px)', overflow: 'hidden' }} className="fade-in">
      {/* Main Area */}
      <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0, background: 'radial-gradient(circle at 50% 0%, rgba(236,72,153,0.03) 0%, transparent 70%)' }}>
        {/* Header */}
        <Box sx={{ px: 4, py: 2, borderBottom: '1px solid rgba(255,255,255,0.05)', bgcolor: 'rgba(17,17,24,0.8)', backdropFilter: 'blur(20px)', display: 'flex', alignItems: 'center', gap: 2 }}>
          <IconButton onClick={() => navigate('/requests')} sx={{ color: '#5c5c72' }}><ArrowBackIcon /></IconButton>
          <Box>
            <Typography variant="subtitle1" fontWeight={700} sx={{ color: '#e0e0ef' }}>{roomInfo.title}</Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Box sx={{ width: 6, height: 6, borderRadius: '50%', bgcolor: '#10b981' }} />
              <Typography variant="caption" sx={{ color: '#5c5c72' }}>{members.filter(m => onlineUsers.has(getUserId(m))).length} online</Typography>
            </Box>
          </Box>
        </Box>

        {/* Tab bar */}
        <Box sx={{ display: 'flex', gap: 0, px: 4, borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
          {['chat', 'files'].map(tab => (
            <Box key={tab} onClick={() => setActiveSection(tab)}
              sx={{ px: 3, py: 1.5, cursor: 'pointer', borderBottom: activeSection === tab ? '2px solid #ec4899' : '2px solid transparent',
                color: activeSection === tab ? '#e0e0ef' : '#5c5c72', fontWeight: activeSection === tab ? 700 : 400, fontSize: '0.85rem', textTransform: 'capitalize', transition: 'all 0.2s' }}>
              {tab}
            </Box>
          ))}
        </Box>

        {activeSection === 'chat' && (
          <>
            {/* Messages */}
            <Box sx={{ flex: 1, overflowY: 'auto', px: 4, py: 3, display: 'flex', flexDirection: 'column', gap: 2, scrollBehavior: 'smooth' }}>
              {messages.map(msg => {
                const isSelf = msg.senderId === user.id;
                return (
                  <Box key={msg.id} sx={{ display: 'flex', justifyContent: isSelf ? 'flex-end' : 'flex-start' }}>
                    <Box sx={{
                      maxWidth: '72%', px: 3, py: 2.2, borderRadius: isSelf ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
                      background: isSelf ? 'linear-gradient(135deg, #ec4899, #06b6d4)' : 'rgba(255,255,255,0.04)',
                      border: isSelf ? 'none' : '1px solid rgba(255,255,255,0.06)',
                      boxShadow: isSelf ? '0 4px 20px rgba(236,72,153,0.15)' : 'none',
                    }}>
                      {!isSelf && <Typography variant="caption" sx={{ color: '#ec4899', fontWeight: 600, display: 'block', mb: 0.5 }}>{msg.senderName}</Typography>}
                      <Typography variant="body2" sx={{ color: isSelf ? 'white' : '#e0e0ef', lineHeight: 1.5 }}>{msg.message}</Typography>
                      <Typography variant="caption" sx={{ color: isSelf ? 'rgba(255,255,255,0.5)' : '#5c5c72', display: 'block', textAlign: 'right', mt: 0.5, fontSize: '0.6rem' }}>{formatTime(msg.timestamp)}</Typography>
                    </Box>
                  </Box>
                );
              })}
              <div ref={messagesEndRef} />
            </Box>

            {/* Input */}
            <Box sx={{ px: 4, py: 3, borderTop: '1px solid rgba(255,255,255,0.05)', bgcolor: '#111118', display: 'flex', gap: 2, alignItems: 'center' }}>
              <IconButton sx={{ color: '#5c5c72', '&:hover': { color: '#ec4899' } }}><AttachFileIcon /></IconButton>
              <input className="flex-1 rounded-xl px-4 py-3 text-sm outline-none"
                style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)', color: '#e0e0ef' }}
                placeholder="Message this room..." value={message} onChange={(e) => setMessage(e.target.value)} 
                onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()} />
              <IconButton disabled={!message.trim()} onClick={handleSendMessage}
                sx={{ bgcolor: message.trim() ? 'linear-gradient(135deg, #ec4899, #06b6d4)' : 'transparent', background: message.trim() ? 'linear-gradient(135deg, #ec4899, #06b6d4)' : 'rgba(255,255,255,0.04)', color: 'white', borderRadius: '12px', '&.Mui-disabled': { color: '#3a3a4e' } }}>
                <SendIcon sx={{ fontSize: 18 }} />
              </IconButton>
            </Box>
          </>
        )}

        {activeSection === 'files' && (
          <Box sx={{ flex: 1, overflowY: 'auto', p: 4 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
              <Typography variant="subtitle2" fontWeight={700} sx={{ color: '#e0e0ef' }}>Shared Files</Typography>
              
              <input type="file" ref={fileInputRef} style={{ display: 'none' }} onChange={handleFileUpload} />
              <AppButton kind="secondary" size="small" startIcon={uploading ? <CircularProgress size={14} sx={{ color: '#ec4899' }} /> : <AttachFileIcon sx={{ fontSize: 14 }} />}
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
                sx={{ bgcolor: 'rgba(236,72,153,0.1)', color: '#ec4899', border: '1px solid rgba(236,72,153,0.15)', '&:hover': { bgcolor: 'rgba(236,72,153,0.15)' } }}>
                {uploading ? 'Uploading...' : 'Upload File'}
              </AppButton>
            </Box>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
              {files.map((f) => (
                <Box key={f.id} sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', p: 2.5, borderRadius: '12px', bgcolor: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)', transition: 'all 0.2s', '&:hover': { borderColor: 'rgba(236,72,153,0.15)' } }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Box sx={{ width: 36, height: 36, borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: f.fileType === 'audio' ? 'rgba(168,85,247,0.1)' : 'rgba(99,102,241,0.1)' }}>
                      {f.fileType === 'audio' ? <MusicNoteIcon sx={{ fontSize: 18, color: '#a855f7' }} /> : <AttachFileIcon sx={{ fontSize: 18, color: '#6366f1' }} />}
                    </Box>
                    <Box>
                      <Typography variant="body2" fontWeight={600} sx={{ color: '#e0e0ef', fontSize: '0.85rem' }}>{f.fileName}</Typography>
                      <Typography variant="caption" sx={{ color: '#5c5c72' }}>{f.size} · {f.uploaderName} · {formatTime(f.uploadedAt)}</Typography>
                    </Box>
                  </Box>
                  <IconButton size="small" onClick={() => window.open(f.fileUrl, '_blank')} sx={{ color: '#5c5c72', '&:hover': { color: '#ec4899' } }}><DownloadIcon sx={{ fontSize: 18 }} /></IconButton>
                </Box>
              ))}
              {files.length === 0 && !uploading && (
                <Typography variant="body2" sx={{ color: '#5c5c72', textAlign: 'center', mt: 4 }}>No files shared in this room yet.</Typography>
              )}
            </Box>
          </Box>
        )}
      </Box>

      {/* Right Sidebar — Members */}
      <Box sx={{ width: 260, borderLeft: '1px solid rgba(255,255,255,0.05)', bgcolor: '#111118', p: 3, display: { xs: 'none', lg: 'flex' }, flexDirection: 'column' }}>
        <Typography variant="subtitle2" fontWeight={700} sx={{ color: '#e0e0ef', mb: 2 }}>Members ({members.length})</Typography>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
          {members.map(m => {
            const userId = getUserId(m);
            const isOnline = onlineUsers.has(userId);
            return (
              <Box key={userId} sx={{ display: 'flex', alignItems: 'center', gap: 1.5, p: 1.5, borderRadius: '10px', '&:hover': { bgcolor: 'rgba(255,255,255,0.03)' } }}>
                <Box sx={{ position: 'relative' }}>
                  {m.profileImage ? (
                    <Avatar src={m.profileImage} sx={{ width: 32, height: 32 }} />
                  ) : (
                    <Avatar sx={{ width: 32, height: 32, background: 'linear-gradient(135deg, #a855f7, #6366f1)', fontSize: 13, fontWeight: 600 }}>{m.name[0]}</Avatar>
                  )}
                  <Box sx={{ position: 'absolute', bottom: -1, right: -1, width: 10, height: 10, borderRadius: '50%', bgcolor: isOnline ? '#10b981' : '#5c5c72', border: '2px solid #111118' }} />
                </Box>
                <Box>
                  <Typography variant="body2" fontWeight={600} sx={{ color: '#e0e0ef', fontSize: '0.8rem' }}>{m.name}</Typography>
                  <Typography variant="caption" sx={{ color: '#5c5c72', fontSize: '0.65rem' }}>{m.role || 'Member'}</Typography>
                </Box>
              </Box>
            );
          })}
        </Box>

        <Box sx={{ mt: 'auto', pt: 3, borderTop: '1px solid rgba(255,255,255,0.05)' }}>
          <Button fullWidth size="small" startIcon={<PersonIcon sx={{ fontSize: 14 }} />}
            sx={{ borderRadius: '10px', textTransform: 'none', fontWeight: 600, bgcolor: 'rgba(236,72,153,0.08)', color: '#ec4899', border: '1px solid rgba(236,72,153,0.12)', '&:hover': { bgcolor: 'rgba(236,72,153,0.12)' } }}>
            Invite Member
          </Button>
        </Box>
      </Box>
    </Box>
  );
};

export default CollabRoom;
