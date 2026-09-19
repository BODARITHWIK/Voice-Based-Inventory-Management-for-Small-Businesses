import React from 'react';
import { Box, Typography, Stack } from '@mui/material';

const PageHeader = ({ title, subtitle, action, chip }) => {
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: { xs: 'column', sm: 'row' },
        alignItems: { xs: 'flex-start', sm: 'center' },
        justifyContent: 'space-between',
        gap: 2,
        mb: 3.5,
      }}
    >
      <Box>
        <Stack direction="row" alignItems="center" spacing={1.5}>
          <Typography variant="h5" component="h1" sx={{ fontWeight: 700, color: '#0f172a' }}>
            {title}
          </Typography>
          {chip}
        </Stack>
        {subtitle && (
          <Typography variant="body2" sx={{ color: '#64748b', mt: 0.5 }}>
            {subtitle}
          </Typography>
        )}
      </Box>
      {action && (
        <Stack direction="row" spacing={1.5} alignItems="center" flexWrap="wrap">
          {action}
        </Stack>
      )}
    </Box>
  );
};

export default PageHeader;
