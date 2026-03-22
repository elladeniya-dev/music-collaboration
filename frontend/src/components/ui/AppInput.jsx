import React from 'react';
import { TextField } from '@mui/material';

export const appInputSx = {
  '& .MuiOutlinedInput-root': {
    borderRadius: '12px',
    bgcolor: 'rgba(255,255,255,0.03)',
    border: '1px solid rgba(255,255,255,0.07)',
    color: '#e0e0ef',
    transition: 'all 0.2s ease',
    '& fieldset': { border: 'none' },
    '&:hover': { borderColor: 'rgba(168,85,247,0.26)' },
    '&.Mui-focused': {
      borderColor: 'rgba(168,85,247,0.44)',
      boxShadow: '0 0 22px rgba(168,85,247,0.12)',
    },
  },
  '& .MuiInputBase-input': { color: '#e0e0ef' },
  '& .MuiInputLabel-root': { color: '#6f6f87' },
  '& .MuiInputLabel-root.Mui-focused': { color: '#a855f7' },
  '& .MuiSelect-icon': { color: '#6f6f87' },
  '& .MuiFormHelperText-root': { color: '#66667d', marginLeft: '2px' },
};

const AppInput = ({ sx = {}, ...props }) => {
  return <TextField {...props} sx={{ ...appInputSx, ...sx }} />;
};

export default AppInput;
