import React, { useState } from 'react';
import { Box, Typography, Avatar, Chip, IconButton, Button, TextField } from '@mui/material';
import PersonIcon from '@mui/icons-material/Person';
import AttachFileIcon from '@mui/icons-material/AttachFile';
import SendIcon from '@mui/icons-material/Send';
import MusicNoteIcon from '@mui/icons-material/MusicNote';
import DownloadIcon from '@mui/icons-material/Download';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { useNavigate } from 'react-router-dom';
import { UserLevelChip, getMockUserMeta } from '../components/UserBadge';
import { AppButton } from '../components/ui';

const MOCK_MEMBERS = [
  { id: '1', name: 'You', role: 'Producer', online: true },
  { id: '2', name: 'Sarah C.', role: 'Vocalist', online: true },
  { id: '3', name: 'Marcus J.', role: 'Mixing Engineer', online: false },
];

const MOCK_FILES = [
  { name: 'beat_v2_master.wav', size: '24.5 MB', type: 'audio', uploadedBy: 'You', date: 'Today' },
  { name: 'vocals_take3.mp3', size: '8.2 MB', type: 'audio', uploadedBy: 'Sarah C.', date: 'Yesterday' },
  { name: 'mix_notes.pdf', size: '1.1 MB', type: 'doc', uploadedBy: 'Marcus J.', date: '2 days ago' },
];

const MOCK_MESSAGES = [
  { id: 1, sender: 'Sarah C.', message: 'Just uploaded the new vocal takes, let me know what you think!', time: '2:30 PM', isSelf: false },
  { id: 2, sender: 'You', message: 'These are fire 🔥 I\'ll start mixing tonight', time: '2:45 PM', isSelf: true },
  { id: 3, sender: 'Marcus J.', message: 'I\'ll have the final mix ready by tomorrow. Adding some reverb to the vocals.', time: '3:10 PM', isSelf: false },
];

const CollabRoom = () => {
  const navigate = useNavigate();
  const [message, setMessage] = useState('');
  const [activeSection, setActiveSection] = useState('chat');

  return (
    <Box sx={{ display: 'flex', height: 'calc(100vh - 64px)', overflow: 'hidden' }} className="fade-in">
      {/* Main Area */}
      <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
        {/* Header */}
        <Box sx={{ px: 4, py: 2, borderBottom: '1px solid rgba(255,255,255,0.05)', bgcolor: 'rgba(17,17,24,0.8)', backdropFilter: 'blur(20px)', display: 'flex', alignItems: 'center', gap: 2 }}>
          <IconButton onClick={() => navigate('/requests')} sx={{ color: '#5c5c72' }}><ArrowBackIcon /></IconButton>
          <Box>
            <Typography variant="subtitle1" fontWeight={700} sx={{ color: '#e0e0ef' }}>R&B Track Collaboration</Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Box sx={{ width: 6, height: 6, borderRadius: '50%', bgcolor: '#10b981' }} />
              <Typography variant="caption" sx={{ color: '#5c5c72' }}>{MOCK_MEMBERS.filter(m => m.online).length} online</Typography>
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
              {MOCK_MESSAGES.map(msg => (
                <Box key={msg.id} sx={{ display: 'flex', justifyContent: msg.isSelf ? 'flex-end' : 'flex-start' }}>
                  <Box sx={{
                    maxWidth: '72%', px: 3, py: 2.2, borderRadius: msg.isSelf ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
                    background: msg.isSelf ? 'linear-gradient(135deg, #ec4899, #06b6d4)' : 'rgba(255,255,255,0.04)',
                    border: msg.isSelf ? 'none' : '1px solid rgba(255,255,255,0.06)',
                    boxShadow: msg.isSelf ? '0 4px 20px rgba(236,72,153,0.15)' : 'none',
                  }}>
                    {!msg.isSelf && <Typography variant="caption" sx={{ color: '#ec4899', fontWeight: 600, display: 'block', mb: 0.5 }}>{msg.sender}</Typography>}
                    <Typography variant="body2" sx={{ color: msg.isSelf ? 'white' : '#e0e0ef', lineHeight: 1.5 }}>{msg.message}</Typography>
                    <Typography variant="caption" sx={{ color: msg.isSelf ? 'rgba(255,255,255,0.5)' : '#5c5c72', display: 'block', textAlign: 'right', mt: 0.5, fontSize: '0.6rem' }}>{msg.time}</Typography>
                  </Box>
                </Box>
              ))}
            </Box>

            {/* Input */}
            <Box sx={{ px: 4, py: 3, borderTop: '1px solid rgba(255,255,255,0.05)', bgcolor: '#111118', display: 'flex', gap: 2, alignItems: 'center' }}>
              <IconButton sx={{ color: '#5c5c72', '&:hover': { color: '#ec4899' } }}><AttachFileIcon /></IconButton>
              <input className="flex-1 rounded-xl px-4 py-3 text-sm outline-none"
                style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)', color: '#e0e0ef' }}
                placeholder="Message this room..." value={message} onChange={(e) => setMessage(e.target.value)} />
              <IconButton disabled={!message.trim()}
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
              <AppButton kind="secondary" size="small" startIcon={<AttachFileIcon sx={{ fontSize: 14 }} />}
                sx={{ bgcolor: 'rgba(236,72,153,0.1)', color: '#ec4899', border: '1px solid rgba(236,72,153,0.15)', '&:hover': { bgcolor: 'rgba(236,72,153,0.15)' } }}>
                Upload File
              </AppButton>
            </Box>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
              {MOCK_FILES.map((f, i) => (
                <Box key={i} sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', p: 2.5, borderRadius: '12px', bgcolor: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)', transition: 'all 0.2s', '&:hover': { borderColor: 'rgba(236,72,153,0.15)' } }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Box sx={{ width: 36, height: 36, borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: f.type === 'audio' ? 'rgba(168,85,247,0.1)' : 'rgba(99,102,241,0.1)' }}>
                      {f.type === 'audio' ? <MusicNoteIcon sx={{ fontSize: 18, color: '#a855f7' }} /> : <AttachFileIcon sx={{ fontSize: 18, color: '#6366f1' }} />}
                    </Box>
                    <Box>
                      <Typography variant="body2" fontWeight={600} sx={{ color: '#e0e0ef', fontSize: '0.85rem' }}>{f.name}</Typography>
                      <Typography variant="caption" sx={{ color: '#5c5c72' }}>{f.size} · {f.uploadedBy} · {f.date}</Typography>
                    </Box>
                  </Box>
                  <IconButton size="small" sx={{ color: '#5c5c72', '&:hover': { color: '#ec4899' } }}><DownloadIcon sx={{ fontSize: 18 }} /></IconButton>
                </Box>
              ))}
            </Box>
          </Box>
        )}
      </Box>

      {/* Right Sidebar — Members */}
      <Box sx={{ width: 260, borderLeft: '1px solid rgba(255,255,255,0.05)', bgcolor: '#111118', p: 3, display: { xs: 'none', lg: 'flex' }, flexDirection: 'column' }}>
        <Typography variant="subtitle2" fontWeight={700} sx={{ color: '#e0e0ef', mb: 2 }}>Members ({MOCK_MEMBERS.length})</Typography>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
          {MOCK_MEMBERS.map(m => {
            const { level } = getMockUserMeta(m.name);
            return (
              <Box key={m.id} sx={{ display: 'flex', alignItems: 'center', gap: 1.5, p: 1.5, borderRadius: '10px', '&:hover': { bgcolor: 'rgba(255,255,255,0.03)' } }}>
                <Box sx={{ position: 'relative' }}>
                  <Avatar sx={{ width: 32, height: 32, background: 'linear-gradient(135deg, #a855f7, #6366f1)', fontSize: 13, fontWeight: 600 }}>{m.name[0]}</Avatar>
                  <Box sx={{ position: 'absolute', bottom: -1, right: -1, width: 10, height: 10, borderRadius: '50%', bgcolor: m.online ? '#10b981' : '#5c5c72', border: '2px solid #111118' }} />
                </Box>
                <Box>
                  <Typography variant="body2" fontWeight={600} sx={{ color: '#e0e0ef', fontSize: '0.8rem' }}>{m.name}</Typography>
                  <Typography variant="caption" sx={{ color: '#5c5c72', fontSize: '0.65rem' }}>{m.role}</Typography>
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
