import React, { useState, useRef } from 'react';
import { Box, Typography, IconButton } from '@mui/material';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import CloseIcon from '@mui/icons-material/Close';
import MusicNoteIcon from '@mui/icons-material/MusicNote';
import ImageIcon from '@mui/icons-material/Image';
import InsertDriveFileIcon from '@mui/icons-material/InsertDriveFile';
import VideocamIcon from '@mui/icons-material/Videocam';

const getFileIcon = (type) => {
  if (type?.startsWith('audio')) return <MusicNoteIcon sx={{ fontSize: 20, color: '#a855f7' }} />;
  if (type?.startsWith('image')) return <ImageIcon sx={{ fontSize: 20, color: '#10b981' }} />;
  if (type?.startsWith('video')) return <VideocamIcon sx={{ fontSize: 20, color: '#f59e0b' }} />;
  return <InsertDriveFileIcon sx={{ fontSize: 20, color: '#6366f1' }} />;
};

const formatSize = (bytes) => {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

const FileUploadZone = ({ files = [], onChange, accept, maxFiles = 5, accent = '#a855f7', fileProgress = {} }) => {
  const [isDragging, setIsDragging] = useState(false);
  const inputRef = useRef(null);

  const handleFiles = (newFiles) => {
    const arr = Array.from(newFiles);
    const merged = [...files, ...arr].slice(0, maxFiles);
    onChange?.(merged);
  };

  const handleDrop = (e) => {
    e.preventDefault(); setIsDragging(false);
    handleFiles(e.dataTransfer.files);
  };

  const handleRemove = (index) => {
    const next = files.filter((_, i) => i !== index);
    onChange?.(next);
  };

  return (
    <Box>
      {/* Drop zone */}
      <Box
        onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
        onClick={() => inputRef.current?.click()}
        sx={{
          p: 4,
          borderRadius: '16px',
          border: `2px dashed ${isDragging ? accent : 'rgba(255,255,255,0.08)'}`,
          bgcolor: isDragging ? `${accent}08` : 'rgba(255,255,255,0.02)',
          cursor: 'pointer',
          textAlign: 'center',
          transition: 'all 0.3s ease',
          '&:hover': {
            borderColor: `${accent}40`,
            bgcolor: `${accent}05`,
            transform: 'scale(1.01)',
          },
        }}
      >
        <Box sx={{
          width: 56, height: 56, borderRadius: '14px', mx: 'auto', mb: 2,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          bgcolor: `${accent}10`,
          transition: 'all 0.3s',
        }}>
          <CloudUploadIcon sx={{ fontSize: 28, color: accent }} />
        </Box>
        <Typography variant="subtitle2" fontWeight={700} sx={{ color: '#e0e0ef', mb: 0.5 }}>
          {isDragging ? 'Drop files here' : 'Drag & drop files'}
        </Typography>
        <Typography variant="caption" sx={{ color: '#5c5c72' }}>
          or click to browse · Max {maxFiles} files
        </Typography>
        <input ref={inputRef} type="file" hidden multiple accept={accept}
          onChange={(e) => handleFiles(e.target.files)} />
      </Box>

      {/* File previews */}
      {files.length > 0 && (
        <Box sx={{ mt: 2, display: 'flex', flexDirection: 'column', gap: 1 }}>
          {files.map((file, i) => (
            <Box key={i} sx={{
              display: 'flex', alignItems: 'center', gap: 2,
              p: 2, borderRadius: '12px',
              bgcolor: 'rgba(255,255,255,0.02)',
              border: '1px solid rgba(255,255,255,0.05)',
              transition: 'all 0.2s',
              '&:hover': { borderColor: `${accent}20` },
            }}>
              <Box sx={{
                width: 40, height: 40, borderRadius: '10px',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                bgcolor: 'rgba(255,255,255,0.04)',
              }}>
                {file.type?.startsWith('image')
                  ? <Box component="img" src={URL.createObjectURL(file)} alt={file.name}
                      sx={{ width: 40, height: 40, borderRadius: '10px', objectFit: 'cover' }} />
                  : getFileIcon(file.type)
                }
              </Box>
              <Box sx={{ flex: 1, minWidth: 0 }}>
                <Typography variant="body2" fontWeight={600} noWrap
                  sx={{ color: '#e0e0ef', fontSize: '0.8rem' }}>{file.name}</Typography>
                <Typography variant="caption" sx={{ color: '#5c5c72' }}>
                  {formatSize(file.size)}
                </Typography>
              </Box>
              {/* Real Progress bar */}
              <Box sx={{ width: 60, height: 4, borderRadius: 2, bgcolor: 'rgba(255,255,255,0.06)', overflow: 'hidden' }}>
                <Box sx={{
                  height: '100%', 
                  width: `${fileProgress[file.name] !== undefined ? fileProgress[file.name] : 0}%`, 
                  bgcolor: '#10b981', 
                  borderRadius: 2,
                  transition: 'width 0.2s ease-out'
                }} />
              </Box>
              <IconButton size="small" onClick={(e) => { e.stopPropagation(); handleRemove(i); }}
                sx={{ color: '#5c5c72', '&:hover': { color: '#ef4444' } }}>
                <CloseIcon sx={{ fontSize: 16 }} />
              </IconButton>
            </Box>
          ))}
        </Box>
      )}
    </Box>
  );
};

export default FileUploadZone;
