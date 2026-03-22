import React from 'react';
import { Avatar } from '@mui/material';

const AppAvatar = ({ name, sx = {}, ...props }) => {
  return (
    <Avatar
      sx={{
        background: 'linear-gradient(135deg, #a855f7, #6366f1)',
        fontWeight: 700,
        ...sx,
      }}
      {...props}
    >
      {name?.[0]?.toUpperCase() || 'U'}
    </Avatar>
  );
};

export default AppAvatar;
