import React, { useEffect, useState, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Avatar, IconButton, Chip, Tooltip } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import SendIcon from '@mui/icons-material/Send';
import AddIcon from '@mui/icons-material/Add';
import ChatBubbleOutlineIcon from '@mui/icons-material/ChatBubbleOutline';
import { useUser } from '../context/UserContext';
import { chatService, userService } from '../services';
import { showError, showInputDialog, showConfirmation, showSuccess, getUserId } from '../utils';
import { useWebSocket } from '../hooks';

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
  const messagesEndRef = useRef(null);
  const typingTimeoutRef = useRef(null);
  const getChatId = () => [getUserId(user), partnerId].sort().join('_');

  const handleMessageReceived = useCallback((newMessage) => {
    setMessages((prev) => {
      if (prev.some(msg => msg.id === newMessage.id)) return prev;
      return [...prev, newMessage].sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
    });
    scrollToBottom();
  }, []);

  const { connected, sendMessage: sendWsMessage, sendTypingIndicator } = useWebSocket(
    partnerId ? getChatId() : null, getUserId(user), handleMessageReceived, !!partnerId && !!user
  );

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
      setMessages(data.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp)));
      scrollToBottom();
    }).catch(console.error);
  }, [user, partnerId]);

  useEffect(() => { scrollToBottom(); }, [messages]);

  const sendMessageHandler = async () => {
    if (!message.trim()) return;
    const msgObj = { chatId: getChatId(), senderId: getUserId(user), receiverId: partnerId, message: message.trim(), type: 'text', status: 'sent' };
    try {
      if (connected) { sendWsMessage(msgObj); setMessage(''); if (isTyping) { sendTypingIndicator(false, user.name); setIsTyping(false); } }
      else { const nm = await chatService.sendMessage(msgObj); setMessages(p => [...p, nm]); setMessage(''); }
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
  if (loadingUser) return <div className="flex items-center justify-center h-[calc(100vh-64px)]"><div className="w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full animate-spin"></div></div>;
  if (!getUserId(user)) return <div className="flex items-center justify-center h-[calc(100vh-64px)]"><p className="text-red-400 font-medium">Login required</p></div>;

  return (
    <div className="w-full h-[calc(100vh-64px)] flex overflow-hidden rounded-xl" style={{ border: '1px solid rgba(255,255,255,0.05)' }}>
      {/* Chat List */}
      <aside className="w-[300px] flex flex-col shrink-0" style={{ background: '#111118', borderRight: '1px solid rgba(255,255,255,0.05)' }}>
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
            <div className="flex flex-col items-center justify-center h-full px-6">
              <ChatBubbleOutlineIcon sx={{ fontSize: 36, color: 'rgba(255,255,255,0.06)', mb: 1 }} />
              <p className="text-xs" style={{ color: '#5c5c72' }}>No conversations yet</p>
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
            <Chip label={connected ? 'Live' : 'Offline'} size="small"
              sx={{
                bgcolor: connected ? 'rgba(16,185,129,0.1)' : 'rgba(239,68,68,0.1)',
                color: connected ? '#10b981' : '#ef4444',
                fontWeight: 600, fontSize: '0.65rem', height: 22,
                border: '1px solid', borderColor: connected ? 'rgba(16,185,129,0.2)' : 'rgba(239,68,68,0.2)',
              }} />
          )}
        </header>

        <main className="flex-1 overflow-y-auto px-6 py-5 space-y-3">
          {!partnerId && (
            <div className="flex flex-col items-center justify-center h-full">
              <ChatBubbleOutlineIcon sx={{ fontSize: 48, color: 'rgba(255,255,255,0.04)', mb: 2 }} />
              <p style={{ color: '#5c5c72' }} className="font-medium text-sm">Choose a conversation</p>
            </div>
          )}
          {messages.map((msg, i) => {
            const isSender = msg.senderId === getUserId(user);
            const timeStr = new Date(msg.timestamp).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' });
            return (
              <div key={msg._id || msg.id || i} className={`flex ${isSender ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[70%] px-4 py-3 text-[0.88rem] leading-relaxed ${
                  isSender
                    ? 'rounded-2xl rounded-br-md'
                    : 'rounded-2xl rounded-bl-md'
                }`} style={{
                  background: isSender ? 'linear-gradient(135deg, #a855f7, #6366f1)' : 'rgba(255,255,255,0.04)',
                  color: isSender ? 'white' : '#e0e0ef',
                  border: isSender ? 'none' : '1px solid rgba(255,255,255,0.06)',
                  boxShadow: isSender ? '0 4px 20px rgba(168,85,247,0.15)' : 'none',
                }}>
                  <div>{msg.message}</div>
                  <div className={`text-[0.6rem] text-right mt-1.5`} style={{ color: isSender ? 'rgba(255,255,255,0.5)' : '#5c5c72' }}>{timeStr}</div>
                </div>
              </div>
            );
          })}
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
            <div className="flex items-center gap-3">
              <input className="flex-1 rounded-xl px-4 py-3 text-sm outline-none"
                style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)', color: '#e0e0ef' }}
                placeholder="Type a message..." value={message}
                onChange={(e) => { setMessage(e.target.value); handleTyping(); }}
                onKeyDown={(e) => e.key === 'Enter' && sendMessageHandler()}
                onFocus={e => e.target.style.borderColor = 'rgba(168,85,247,0.3)'}
                onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.06)'}
              />
              <button onClick={sendMessageHandler} disabled={!message.trim()}
                className="flex items-center justify-center w-10 h-10 rounded-xl text-white disabled:opacity-30 disabled:cursor-not-allowed"
                style={{ background: message.trim() ? 'linear-gradient(135deg, #a855f7, #6366f1)' : 'rgba(255,255,255,0.04)', transition: 'all 0.2s' }}>
                <SendIcon sx={{ fontSize: 18 }} />
              </button>
            </div>
          </footer>
        )}
      </section>
    </div>
  );
};

export default ChatInterface;
