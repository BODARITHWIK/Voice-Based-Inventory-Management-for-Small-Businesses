import React from 'react';
import { Box, Stack } from '@mui/material';

const VoiceWaveform = ({ state = 'listening' }) => {
  const isListening = state === 'listening';
  const isProcessing = state === 'processing' || state === 'understanding';

  const barColor = isListening ? '#ef4444' : '#059669';

  return (
    <Stack
      direction="row"
      spacing={0.75}
      alignItems="center"
      justifyContent="center"
      sx={{ height: 36, my: 1 }}
    >
      {[0.1, 0.3, 0.15, 0.4, 0.25, 0.35, 0.2].map((delay, idx) => (
        <Box
          key={idx}
          sx={{
            width: 4,
            height: isListening ? 28 : isProcessing ? 16 : 8,
            backgroundColor: barColor,
            borderRadius: 2,
            transition: 'height 0.2s ease',
            animation: isListening || isProcessing ? `audioBar 0.8s infinite ease-in-out` : 'none',
            animationDelay: `${delay}s`,
          }}
        />
      ))}
    </Stack>
  );
};

export default VoiceWaveform;
