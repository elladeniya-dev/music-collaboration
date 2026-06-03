import React, { useEffect, useState, useRef, useCallback, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Avatar, IconButton, Chip, Tooltip, Box, Typography, Dialog } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import SendIcon from '@mui/icons-material/Send';
import AddIcon from '@mui/icons-material/Add';
import AttachFileIcon from '@mui/icons-material/AttachFile';
import DownloadIcon from '@mui/icons-material/Download';
import CloseIcon from '@mui/icons-material/Close';
import InsertDriveFileIcon from '@mui/icons-material/InsertDriveFile';
import ImageIcon from '@mui/icons-material/Image';
import AudioFileIcon from '@mui/icons-material/AudioFile';
import ChatBubbleOutlineIcon from '@mui/icons-material/ChatBubbleOutline';
import { useUser } from '../context/UserContext';
import { chatService, userService } from '../services';
import { showError, showInputDialog, showConfirmation, showSuccess, getUserId } from '../utils';
import { useWebSocket } from '../hooks';
import AudioWavePlayer from '../components/AudioWavePlayer';

const formatTime = (dateValue) => {
  const date = new Date(dateValue);
  if (Number.isNaN(date.getTime())) {
    return '';
  }

  return date.toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
};

const formatBytes = (bytes) => {
  if (!bytes && bytes !== 0) {
    return 'Unknown size';
  }
  if (bytes === 0) {
    return '0 B';
  }

  const units = ['B', 'KB', 'MB', 'GB'];
  const i = Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), units.length - 1);
  const value = bytes / (1024 ** i);
  return `${value.toFixed(value >= 10 || i === 0 ? 0 : 1)} ${units[i]}`;
};

const detectMessageTypeFromFile = (file) => {
  if (!file) {
    return 'file';
  }

  if (file.type.startsWith('image/')) {
    return 'image';
  }

  if (file.type.startsWith('audio/')) {
    return 'audio';
  }

  return 'file';
};

const getVersionMeta = (name = '') => {
  const match = name.match(/^(.*?)[-_ ]v(\d+)(\.[^.]+)?$/i);
  if (!match) {
    return null;
  }

  return {
    baseName: (match[1] || '').trim(),
    version: Number(match[2]),
  };
};

const toNormalizedMessage = (msg, fallbackIndex = 0) => {
  const timestamp = msg.timestamp || msg.createdAt || new Date().toISOString();
  const fileName = msg.fileName || msg.attachmentName || '';
  const fileUrl = msg.fileUrl || msg.url || '';
  const type = msg.type || (fileUrl && fileName ? 'file' : 'text');

  return {
    ...msg,
    id: msg.id || msg._id || `msg_${fallbackIndex}_${Date.now()}`,
    type,
    timestamp,
    message: msg.message || '',
    fileName,
    fileSize: msg.fileSize || null,
    fileUrl,
  };
};

const ChatInterface = () => {
  const { id: partnerId } = useParams();
  const { user, loadingUser } = useUser();
  const navigate = useNavigate();
  const [chatHeads, setChatHeads] = useState([]);
  const [userMap, setUserMap] = useState({});
  const [messages, setMessages] = useState([]);
  const [message, setMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [partnerTyping, setPartnerTyping] = useState(false);
  const [partnerOnline, setPartnerOnline] = useState(false);
  const [draftFiles, setDraftFiles] = useState([]);
  const [isDragActive, setIsDragActive] = useState(false);
  const [previewImage, setPreviewImage] = useState(null);
  const messagesEndRef = useRef(null);
  const typingTimeoutRef = useRef(null);
  const fileInputRef = useRef(null);
  const persistedObjectUrlsRef = useRef(new Set());
  const getChatId = () => [getUserId(user), partnerId].sort().join('_');

  const handleMessageReceived = useCallback((newMessage) => {
    setMessages((prev) => {
      const normalized = toNormalizedMessage(newMessage, prev.length);
      if (prev.some(msg => msg.id === normalized.id)) return prev;
      return [...prev, normalized].sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
    });
    scrollToBottom();
  }, []);

  const handleTypingReceived = useCallback((indicator) => {
    if (indicator.userId === partnerId) {
      // Jackson serializes boolean isTyping to 'typing'
      setPartnerTyping(indicator.typing !== undefined ? indicator.typing : indicator.isTyping);
    }
  }, [partnerId]);

  const handlePresenceReceived = useCallback((presence) => {
    if (presence.userId === partnerId) {
      setPartnerOnline(presence.online);
    }
  }, [partnerId]);

  const { sendMessage, sendTypingIndicator, connected } = useWebSocket(
    partnerId ? getChatId() : null, 
    getUserId(user), 
    handleMessageReceived, 
    !!partnerId && !!user, 
    handleTypingReceived, 
    handlePresenceReceived
  );

  // Check partner's presence immediately when chat opens and socket connects
  useEffect(() => {
    if (connected && partnerId) {
      websocketService.checkPresence(partnerId);
    }
  }, [connected, partnerId]);

  const scrollToBottom = () => setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);

  useEffect(() => {
    const userId = getUserId(user);
    if (!userId) return;
    chatService.getChatHeads().then(async (data) => {
      setChatHeads(data);
      const partnerIds = data.map(chat => chat.participants.find(p => p !== userId));
      if (!partnerIds.length) return;
      const users = await userService.getBulkUsers(partnerIds);
      const map = {};
      users.forEach(u => { map[u._id || u.id] = u; });
      setUserMap(map);
    }).catch(err => console.error(err));
  }, [user]);

  useEffect(() => {
    if (!user || !partnerId) return;
    chatService.getMessages(getChatId()).then(data => {
      const normalized = (data || []).map((msg, idx) => toNormalizedMessage(msg, idx));
      setMessages(normalized.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp)));
      scrollToBottom();
    }).catch(console.error);
  }, [user, partnerId]);

  useEffect(() => { scrollToBottom(); }, [messages]);

  useEffect(() => {
    return () => {
      draftFiles.forEach((file) => {
        if (file.previewUrl) {
          URL.revokeObjectURL(file.previewUrl);
        }
      });

      persistedObjectUrlsRef.current.forEach((url) => {
        URL.revokeObjectURL(url);
      });
      persistedObjectUrlsRef.current.clear();
    };
  }, []);

  const groupedVersions = useMemo(() => {
    const versioned = messages
      .filter((msg) => ['audio', 'file'].includes(msg.type) && msg.fileName)
      .map((msg) => {
        const meta = getVersionMeta(msg.fileName);
        if (!meta) {
          return null;
        }
        return {
          key: meta.baseName.toLowerCase(),
          displayName: meta.baseName,
          version: meta.version,
          messageId: msg.id,
        };
      })
      .filter(Boolean);

    const grouped = versioned.reduce((acc, item) => {
      if (!acc[item.key]) {
        acc[item.key] = { displayName: item.displayName, versions: [] };
      }
      acc[item.key].versions.push(item);
      return acc;
    }, {});

    return Object.values(grouped)
      .map((group) => ({
        ...group,
        versions: group.versions.sort((a, b) => a.version - b.version),
      }))
      .sort((a, b) => a.displayName.localeCompare(b.displayName));
  }, [messages]);

  const addFilesToDraft = useCallback((fileList) => {
    const incoming = Array.from(fileList || []);
    if (!incoming.length) {
      return;
    }

    const next = incoming.map((file, idx) => ({
      id: `draft_${Date.now()}_${idx}`,
      file,
      fileName: file.name,
      fileSize: file.size,
      previewUrl: URL.createObjectURL(file),
      type: detectMessageTypeFromFile(file),
    }));

    setDraftFiles((prev) => [...prev, ...next]);
  }, []);

  const removeDraftFile = (draftId) => {
    setDraftFiles((prev) => {
      const found = prev.find((f) => f.id === draftId);
      if (found?.previewUrl) {
        URL.revokeObjectURL(found.previewUrl);
      }
      return prev.filter((f) => f.id !== draftId);
    });
  };

  const sendMessageHandler = async () => {
    const hasText = message.trim().length > 0;
    const hasFiles = draftFiles.length > 0;

    if (!hasText && !hasFiles) return;

    const msgObj = { chatId: getChatId(), senderId: getUserId(user), receiverId: partnerId, message: message.trim(), type: 'text', status: 'sent' };

    try {
      if (hasText) {
        if (connected) {
          sendWsMessage(msgObj);
          if (isTyping) {
            sendTypingIndicator(false, user.name);
            setIsTyping(false);
          }
        } else {
          const nm = await chatService.sendMessage(msgObj);
          setMessages((p) => [...p, toNormalizedMessage(nm, p.length)]);
        }
      }

      if (hasFiles) {
        const localAttachmentMessages = draftFiles.map((draft, index) => ({
          id: `local_attachment_${Date.now()}_${index}`,
          chatId: getChatId(),
          senderId: getUserId(user),
          receiverId: partnerId,
          type: draft.type,
          message: draft.type === 'text' ? message.trim() : `Shared ${draft.fileName}`,
          fileName: draft.fileName,
          fileSize: draft.fileSize,
          fileUrl: draft.previewUrl,
          status: 'sent',
          timestamp: new Date().toISOString(),
          localOnly: true,
        }));

        draftFiles.forEach((draft) => {
          if (draft.previewUrl) {
            persistedObjectUrlsRef.current.add(draft.previewUrl);
          }
        });

        setMessages((prev) => [...prev, ...localAttachmentMessages]);
      }

      setMessage('');
      setDraftFiles([]);
      scrollToBottom();
    } catch { showError('Failed to send message'); }
  };

  const handleTyping = () => {
    if (!connected) return;
    if (!isTyping) { setIsTyping(true); sendTypingIndicator(true, user.name); }
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => { setIsTyping(false); sendTypingIndicator(false, user.name); }, 2000);
  };

  const startNewChat = async () => {
    const email = await showInputDialog('Start New Chat', 'Enter Gmail of the user', 'email', 'example@gmail.com');
    if (email) {
      try {
        const receiver = await userService.getUserByEmail(email);
        if (!receiver || !getUserId(receiver)) { showError('User not found'); return; }
        await chatService.createChatHead(getUserId(receiver));
        navigate(`/chat/${getUserId(receiver)}`);
      } catch { showError('Error', 'Could not find user.'); }
    }
  };

  const handleDeleteChat = async (pid) => {
    const chatId = [getUserId(user), pid].sort().join('_');
    if (await showConfirmation('Delete Chat?', 'This will permanently delete all messages.')) {
      try {
        await chatService.deleteChat(chatId);
        setChatHeads(p => p.filter(c => c.participants.find(x => x !== getUserId(user)) !== pid));
        if (pid === partnerId) navigate('/chat');
        showSuccess('Deleted!', 'Chat deleted.');
      } catch { showError('Error', 'Failed to delete chat.'); }
    }
  };

  const partner = userMap[partnerId];

  const renderMessageContent = (msg, isSender) => {
    if (msg.type === 'audio') {
      return (
        <Box sx={{ width: '100%', minWidth: 220 }}>
          <Typography variant="caption" sx={{ color: isSender ? 'rgba(255,255,255,0.78)' : '#a7a7c0' }}>
            Audio
          </Typography>
          <AudioWavePlayer compact title={msg.fileName || 'Audio'} audioUrl={msg.fileUrl} seed={msg.fileName || msg.id} />
        </Box>
      );
    }

    if (msg.type === 'image') {
      return (
        <Box sx={{ minWidth: 220 }}>
          <Box
            component="img"
            src={msg.fileUrl}
            alt={msg.fileName || 'Shared image'}
            onClick={() => setPreviewImage({ url: msg.fileUrl, name: msg.fileName || 'Image preview' })}
            sx={{
              width: '100%',
              maxHeight: 220,
              objectFit: 'cover',
              borderRadius: '12px',
              border: '1px solid rgba(255,255,255,0.08)',
              cursor: 'zoom-in',
              transition: 'transform 0.2s ease',
              '&:hover': { transform: 'scale(1.01)' },
            }}
          />
          {msg.fileName ? (
            <Typography variant="caption" sx={{ color: isSender ? 'rgba(255,255,255,0.7)' : '#9797b0', mt: 0.75, display: 'block' }} noWrap>
              {msg.fileName}
            </Typography>
          ) : null}
        </Box>
      );
    }

    if (msg.type === 'file') {
      return (
        <Box
          sx={{
            minWidth: 220,
            p: 1.25,
            borderRadius: '12px',
            bgcolor: 'rgba(255,255,255,0.04)',
            border: '1px solid rgba(255,255,255,0.09)',
            display: 'flex',
            alignItems: 'center',
            gap: 1,
          }}
        >
          <InsertDriveFileIcon sx={{ color: '#8b9bff', fontSize: 20 }} />
          <Box sx={{ minWidth: 0, flex: 1 }}>
            <Typography variant="body2" fontWeight={700} sx={{ color: '#ececff' }} noWrap>
              {msg.fileName || 'Attachment'}
            </Typography>
            <Typography variant="caption" sx={{ color: '#9a9ab3' }}>
              {formatBytes(msg.fileSize)}
            </Typography>
          </Box>
          {msg.fileUrl ? (
            <IconButton component="a" href={msg.fileUrl} target="_blank" rel="noreferrer" size="small" sx={{ color: '#c4b5fd' }}>
              <DownloadIcon sx={{ fontSize: 17 }} />
            </IconButton>
          ) : null}
        </Box>
      );
    }

    return <div>{msg.message}</div>;
  };

  if (loadingUser) return <div className="flex items-center justify-center h-[calc(100vh-64px)]"><div className="w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full animate-spin"></div></div>;
  if (!getUserId(user)) return <div className="flex items-center justify-center h-[calc(100vh-64px)]"><p className="text-red-400 font-medium">Login required</p></div>;

  return (
    <div className="w-full h-[calc(100vh-64px)] flex overflow-hidden rounded-2xl fade-in" style={{ border: '1px solid rgba(255,255,255,0.08)', boxShadow: '0 12px 34px rgba(0,0,0,0.25)' }}>
      {/* Chat List */}
      <aside className="w-[320px] flex flex-col shrink-0" style={{ background: '#111118', borderRight: '1px solid rgba(255,255,255,0.05)' }}>
        <div className="flex justify-between items-center px-5 py-4" style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
          <h2 className="text-sm font-bold" style={{ color: '#e0e0ef' }}>Messages</h2>
          <Tooltip title="New Chat">
            <IconButton onClick={startNewChat} size="small"
              sx={{ bgcolor: 'rgba(168,85,247,0.1)', color: '#a855f7', '&:hover': { bgcolor: 'rgba(168,85,247,0.2)' }, width: 30, height: 30 }}>
              <AddIcon sx={{ fontSize: 16 }} />
            </IconButton>
          </Tooltip>
        </div>
        <ul className="flex-1 overflow-y-auto">
          {chatHeads.length === 0 && (
            <div className="flex flex-col items-center justify-center h-full px-6 text-center">
              <ChatBubbleOutlineIcon sx={{ fontSize: 36, color: 'rgba(255,255,255,0.06)', mb: 1 }} />
              <p className="text-xs" style={{ color: '#5c5c72' }}>No conversations yet</p>
              <button
                onClick={startNewChat}
                className="mt-3 px-3 py-1.5 rounded-lg text-xs font-semibold"
                style={{ color: '#c084fc', border: '1px solid rgba(168,85,247,0.3)', background: 'rgba(168,85,247,0.08)' }}
              >
                Start Chat
              </button>
            </div>
          )}
          {chatHeads.map((chat) => {
            const uid = getUserId(user);
            const pid = chat.participants.find(p => p !== uid);
            const p = userMap[pid];
            const isActive = pid === partnerId;
            return (
              <li key={chat._id || chat.id}
                className="px-4 py-3 flex items-center justify-between cursor-pointer group"
                style={{
                  transition: 'all 0.2s',
                  background: isActive ? 'rgba(168,85,247,0.08)' : 'transparent',
                  borderLeft: isActive ? '3px solid #a855f7' : '3px solid transparent',
                }}
                onMouseEnter={e => { if (!isActive) e.currentTarget.style.background = 'rgba(255,255,255,0.02)'; }}
                onMouseLeave={e => { if (!isActive) e.currentTarget.style.background = 'transparent'; }}
              >
                <div onClick={() => navigate(`/chat/${pid}`)} className="flex items-center gap-3 flex-1 min-w-0">
                  <Avatar src={p?.profileImage}
                    sx={{ width: 38, height: 38, background: isActive ? 'linear-gradient(135deg,#a855f7,#6366f1)' : 'rgba(255,255,255,0.06)', color: isActive ? 'white' : '#5c5c72', fontSize: 14, fontWeight: 600 }}>
                    {p?.name?.[0]?.toUpperCase()}
                  </Avatar>
                  <div className="min-w-0">
                    <div className="text-sm truncate font-semibold" style={{ color: isActive ? '#c084fc' : '#e0e0ef' }}>{p?.name || 'Unknown'}</div>
                    <div className="text-xs truncate" style={{ color: '#5c5c72' }}>{chat.lastMessage || 'No messages'}</div>
                  </div>
                </div>
                <IconButton onClick={(e) => { e.stopPropagation(); handleDeleteChat(pid); }} size="small"
                  sx={{ opacity: 0, '.group:hover &': { opacity: 1 }, color: '#ef4444', transition: 'opacity 0.2s' }}>
                  <DeleteIcon sx={{ fontSize: 14 }} />
                </IconButton>
              </li>
            );
          })}
        </ul>
      </aside>

      {/* Chat Area */}
      <section className="flex-1 flex flex-col min-w-0" style={{ background: '#0d0d14' }}>
        <header className="h-14 px-6 flex items-center justify-between shrink-0" style={{ borderBottom: '1px solid rgba(255,255,255,0.05)', background: 'rgba(17,17,24,0.8)', backdropFilter: 'blur(20px)' }}>
          {partner ? (
            <div className="flex items-center gap-3">
              <Avatar src={partner?.profileImage} sx={{ width: 32, height: 32, background: 'linear-gradient(135deg,#a855f7,#6366f1)', fontSize: 13, fontWeight: 600 }}>
                {partner?.name?.[0]?.toUpperCase()}
              </Avatar>
              <div>
                <h2 className="text-sm font-bold" style={{ color: '#e0e0ef' }}>{partner?.name}</h2>
              </div>
            </div>
          ) : <h2 className="text-sm font-medium" style={{ color: '#5c5c72' }}>Select a conversation</h2>}
          {partnerId && (
            <Chip label={partnerOnline ? 'Online' : 'Offline'} size="small"
              sx={{
                bgcolor: partnerOnline ? 'rgba(16,185,129,0.1)' : 'rgba(239,68,68,0.1)',
                color: partnerOnline ? '#10b981' : '#ef4444',
                fontWeight: 600, fontSize: '0.65rem', height: 22,
                border: '1px solid', borderColor: partnerOnline ? 'rgba(16,185,129,0.2)' : 'rgba(239,68,68,0.2)',
              }} />
          )}
        </header>

        <main
          className="flex-1 overflow-y-auto px-6 py-5 space-y-3"
          style={{ scrollBehavior: 'smooth' }}
          onDragOver={(e) => {
            e.preventDefault();
            setIsDragActive(true);
          }}
          onDragLeave={() => setIsDragActive(false)}
          onDrop={(e) => {
            e.preventDefault();
            setIsDragActive(false);
            addFilesToDraft(e.dataTransfer.files);
          }}
        >
          {groupedVersions.length > 0 ? (
            <Box sx={{ mb: 1, p: 2, borderRadius: '12px', border: '1px solid rgba(255,255,255,0.08)', bgcolor: 'rgba(255,255,255,0.015)' }}>
              <Typography variant="caption" sx={{ color: '#a9a9c3', fontWeight: 700, letterSpacing: '0.02em' }}>
                Versions
              </Typography>
              <Box sx={{ mt: 1, display: 'flex', flexDirection: 'column', gap: 1 }}>
                {groupedVersions.map((group) => (
                  <Box key={group.displayName} sx={{ display: 'flex', alignItems: 'center', gap: 1.2, flexWrap: 'wrap' }}>
                    <Typography variant="caption" sx={{ color: '#d2d2ea', fontWeight: 700 }}>
                      {group.displayName}
                    </Typography>
                    {group.versions.map((version) => (
                      <Chip
                        key={`${group.displayName}_${version.version}_${version.messageId}`}
                        size="small"
                        label={`v${version.version}`}
                        sx={{
                          bgcolor: 'rgba(168,85,247,0.14)',
                          color: '#d8b4fe',
                          border: '1px solid rgba(168,85,247,0.26)',
                          fontSize: '0.64rem',
                          fontWeight: 700,
                        }}
                      />
                    ))}
                  </Box>
                ))}
              </Box>
            </Box>
          ) : null}

          {!partnerId && (
            <div className="flex flex-col items-center justify-center h-full text-center">
              <ChatBubbleOutlineIcon sx={{ fontSize: 48, color: 'rgba(255,255,255,0.04)', mb: 2 }} />
              <p style={{ color: '#5c5c72' }} className="font-medium text-sm">Choose a conversation</p>
              <p style={{ color: '#4f4f63' }} className="text-xs mt-1">Pick a chat from the left panel or start a new one.</p>
            </div>
          )}
          {messages.map((msg, i) => {
            const isSender = msg.senderId === getUserId(user);
            const timeStr = formatTime(msg.timestamp);
            return (
              <div key={msg._id || msg.id || i} className={`flex ${isSender ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[70%] px-4 py-3 text-[0.88rem] leading-relaxed smooth ${
                  isSender
                    ? 'rounded-2xl rounded-br-md'
                    : 'rounded-2xl rounded-bl-md'
                }`} style={{
                  background: isSender ? 'linear-gradient(135deg, #a855f7, #6366f1)' : 'rgba(255,255,255,0.04)',
                  color: isSender ? 'white' : '#e0e0ef',
                  border: isSender ? 'none' : '1px solid rgba(255,255,255,0.06)',
                  boxShadow: isSender ? '0 4px 20px rgba(168,85,247,0.15)' : 'none',
                }}>
                  {renderMessageContent(msg, isSender)}
                  <div className={`text-[0.6rem] text-right mt-1.5`} style={{ color: isSender ? 'rgba(255,255,255,0.5)' : '#5c5c72' }}>{timeStr}</div>
                </div>
              </div>
            );
          })}

          {isDragActive ? (
            <Box
              sx={{
                p: 3,
                borderRadius: '12px',
                border: '1px dashed rgba(168,85,247,0.5)',
                bgcolor: 'rgba(168,85,247,0.08)',
                textAlign: 'center',
              }}
            >
              <Typography variant="body2" sx={{ color: '#e9d5ff', fontWeight: 600 }}>
                Drop files to attach
              </Typography>
            </Box>
          ) : null}

          {partnerTyping && (
            <div className="flex justify-start">
              <div className="px-4 py-3 rounded-2xl rounded-bl-md text-sm" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)', color: '#5c5c72' }}>
                <span className="italic">{partner?.name} is typing</span>
                <span className="inline-flex ml-1 gap-0.5">
                  {[0, 150, 300].map(d => <span key={d} className="w-1 h-1 rounded-full animate-bounce" style={{ background: '#a855f7', animationDelay: `${d}ms` }}></span>)}
                </span>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </main>

        {partnerId && (
          <footer className="px-5 py-4 shrink-0" style={{ borderTop: '1px solid rgba(255,255,255,0.05)', background: '#111118' }}>
            {!connected && <div className="text-xs mb-2" style={{ color: '#f59e0b' }}>⚠️ WebSocket disconnected</div>}

            {draftFiles.length > 0 ? (
              <Box sx={{ mb: 1.5, display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                {draftFiles.map((draft) => (
                  <Box
                    key={draft.id}
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 1,
                      px: 1.2,
                      py: 0.8,
                      borderRadius: '10px',
                      border: '1px solid rgba(255,255,255,0.1)',
                      bgcolor: 'rgba(255,255,255,0.03)',
                      minWidth: 0,
                    }}
                  >
                    {draft.type === 'image' ? <ImageIcon sx={{ color: '#93c5fd', fontSize: 16 }} /> : null}
                    {draft.type === 'audio' ? <AudioFileIcon sx={{ color: '#c4b5fd', fontSize: 16 }} /> : null}
                    {draft.type === 'file' ? <InsertDriveFileIcon sx={{ color: '#a7a7bf', fontSize: 16 }} /> : null}
                    <Typography variant="caption" sx={{ color: '#d6d6ec', maxWidth: 170 }} noWrap>
                      {draft.fileName}
                    </Typography>
                    <Typography variant="caption" sx={{ color: '#7d7d95' }}>
                      {formatBytes(draft.fileSize)}
                    </Typography>
                    <IconButton size="small" onClick={() => removeDraftFile(draft.id)} sx={{ color: '#fda4af' }}>
                      <CloseIcon sx={{ fontSize: 14 }} />
                    </IconButton>
                  </Box>
                ))}
              </Box>
            ) : null}

            <div className="flex items-center gap-3">
              <label
                className="flex items-center justify-center w-10 h-10 rounded-xl cursor-pointer"
                style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', color: '#8b8b9e' }}
                title="Attach file"
              >
                <AttachFileIcon sx={{ fontSize: 18 }} />
                <input
                  ref={fileInputRef}
                  hidden
                  type="file"
                  multiple
                  onChange={(e) => addFilesToDraft(e.target.files)}
                />
              </label>
              <input className="flex-1 rounded-xl px-4 py-3 text-sm outline-none"
                style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)', color: '#e0e0ef' }}
                placeholder="Type a message..." value={message}
                onChange={(e) => { setMessage(e.target.value); handleTyping(); }}
                onKeyDown={(e) => e.key === 'Enter' && sendMessageHandler()}
                onFocus={e => e.target.style.borderColor = 'rgba(168,85,247,0.3)'}
                onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.06)'}
              />
              <button onClick={sendMessageHandler} disabled={!message.trim() && draftFiles.length === 0}
                className="flex items-center justify-center w-10 h-10 rounded-xl text-white disabled:opacity-30 disabled:cursor-not-allowed"
                style={{ background: message.trim() ? 'linear-gradient(135deg, #a855f7, #6366f1)' : 'rgba(255,255,255,0.04)', transition: 'all 0.2s' }}>
                <SendIcon sx={{ fontSize: 18 }} />
              </button>
            </div>
          </footer>
        )}
      </section>

      <Dialog
        open={Boolean(previewImage)}
        onClose={() => setPreviewImage(null)}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: {
            bgcolor: '#111118',
            border: '1px solid rgba(255,255,255,0.08)',
            borderRadius: '14px',
            backgroundImage: 'none',
          },
        }}
      >
        <Box sx={{ p: 1.2, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Typography variant="body2" fontWeight={700} sx={{ color: '#ececff', px: 1 }} noWrap>
            {previewImage?.name || 'Image preview'}
          </Typography>
          <IconButton onClick={() => setPreviewImage(null)} sx={{ color: '#d4d4e7' }}>
            <CloseIcon />
          </IconButton>
        </Box>
        {previewImage?.url ? (
          <Box component="img" src={previewImage.url} alt={previewImage.name || 'Preview'} sx={{ width: '100%', maxHeight: '70vh', objectFit: 'contain', pb: 1.2, px: 1.2 }} />
        ) : null}
      </Dialog>
    </div>
  );
};

export default ChatInterface;
