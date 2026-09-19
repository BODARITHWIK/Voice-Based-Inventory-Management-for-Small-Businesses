import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogActions,
  Box,
  Typography,
  Button,
  Stack,
  Chip,
  IconButton,
  Card,
  Grid,
  Divider,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import MicIcon from '@mui/icons-material/Mic';
import CameraAltIcon from '@mui/icons-material/CameraAlt';
import PointOfSaleIcon from '@mui/icons-material/PointOfSale';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import PhoneIphoneIcon from '@mui/icons-material/PhoneIphone';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import { useNavigate } from 'react-router-dom';

const INTRO_STEPS = [
  {
    step: 1,
    badge: 'WELCOME TO SWARANIDHI',
    badgeColor: '#4f46e5',
    title: 'AI-Powered Voice & Vision Operating System',
    subtitle: 'Built specifically for India\'s 13+ million neighborhood Kirana stores and micro-retailers.',
    icon: <AutoAwesomeIcon sx={{ fontSize: 44, color: '#f59e0b' }} />,
    content: (
      <Box>
        <Typography variant="body1" sx={{ color: '#334155', lineHeight: 1.7, mb: 2 }}>
          Traditional inventory software requires typing in English on complex computer menus. Most shopkeepers cannot stop to type while serving 150+ rush-hour customers.
        </Typography>
        <Typography variant="body1" sx={{ color: '#334155', lineHeight: 1.7, mb: 2.5 }}>
          <strong>Swaranidhi ("Speak. Manage. Grow.")</strong> completely eliminates keyboards. Merchants run their store using <strong>natural voice in their own mother tongue</strong> or by <strong>pointing a phone camera at stock</strong>.
        </Typography>
        <Grid container spacing={1.5}>
          <Grid item xs={6}>
            <Box sx={{ p: 1.5, bgcolor: '#f1f5f9', borderRadius: 2, textAlign: 'center' }}>
              <Typography variant="h6" sx={{ fontWeight: 800, color: '#0f172a' }}>22+</Typography>
              <Typography variant="caption" sx={{ color: '#64748b' }}>Indian Languages</Typography>
            </Box>
          </Grid>
          <Grid item xs={6}>
            <Box sx={{ p: 1.5, bgcolor: '#f1f5f9', borderRadius: 2, textAlign: 'center' }}>
              <Typography variant="h6" sx={{ fontWeight: 800, color: '#059669' }}>100%</Typography>
              <Typography variant="caption" sx={{ color: '#64748b' }}>Voice & Vision First</Typography>
            </Box>
          </Grid>
        </Grid>
      </Box>
    ),
  },
  {
    step: 2,
    badge: 'VOICE INTELLIGENCE',
    badgeColor: '#059669',
    title: 'Natural Multilingual Voice Assistant',
    subtitle: 'Speak naturally in Hindi, Telugu, Tamil, Kannada, or English. Swaranidhi understands intent and quantity.',
    icon: <MicIcon sx={{ fontSize: 44, color: '#059669' }} />,
    content: (
      <Box>
        <Typography variant="body2" sx={{ color: '#475569', mb: 2 }}>
          The merchant doesn't need to learn computer commands or translate to English. They can speak everyday conversational phrases:
        </Typography>
        <Stack spacing={1} sx={{ mb: 2.5 }}>
          <Box sx={{ p: 1.2, bgcolor: '#ecfdf5', borderRadius: 1.5, borderLeft: '4px solid #10b981' }}>
            <Typography variant="body2" sx={{ fontWeight: 700, color: '#065f46' }}>
              "Heritage milk 10 packets add cheyyi" (Telugu)
            </Typography>
            <Typography variant="caption" sx={{ color: '#047857' }}>
              Action: ADD_STOCK • Product: Heritage Milk • Qty: 10 packets
            </Typography>
          </Box>
          <Box sx={{ p: 1.2, bgcolor: '#eff6ff', borderRadius: 1.5, borderLeft: '4px solid #3b82f6' }}>
            <Typography variant="body2" sx={{ fontWeight: 700, color: '#1e40af' }}>
              "Ramesh ko 500 rupaye udhaar likho" (Hindi)
            </Typography>
            <Typography variant="caption" sx={{ color: '#1d4ed8' }}>
              Action: KHATA_CREDIT • Customer: Ramesh • Amount: ₹500
            </Typography>
          </Box>
          <Box sx={{ p: 1.2, bgcolor: '#fef3c7', borderRadius: 1.5, borderLeft: '4px solid #f59e0b' }}>
            <Typography variant="body2" sx={{ fontWeight: 700, color: '#92400e' }}>
              "Aaj kitna total sale hua?" (Hinglish)
            </Typography>
            <Typography variant="caption" sx={{ color: '#b45309' }}>
              Action: QUERY_SALES • Spoken TTS response with live revenue
            </Typography>
          </Box>
        </Stack>
      </Box>
    ),
  },
  {
    step: 3,
    badge: 'AI COMPUTER VISION',
    badgeColor: '#2563eb',
    title: 'AI Stock Photo Analysis',
    subtitle: 'Point the phone camera at a crate or product packaging to recognize stock in seconds.',
    icon: <CameraAltIcon sx={{ fontSize: 44, color: '#2563eb' }} />,
    content: (
      <Box>
        <Typography variant="body2" sx={{ color: '#475569', mb: 2 }}>
          Swaranidhi combines Computer Vision and Optical Character Recognition (OCR) to inspect labels, barcodes, brand logos, and expiration dates.
        </Typography>
        <Grid container spacing={1.5} sx={{ mb: 2 }}>
          <Grid item xs={12} sm={6}>
            <Box sx={{ p: 1.5, bgcolor: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 2 }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#0f172a' }}>📷 Framing Guide</Typography>
              <Typography variant="caption" sx={{ color: '#64748b' }}>Visual target box assists merchants in capturing clear label photos.</Typography>
            </Box>
          </Grid>
          <Grid item xs={12} sm={6}>
            <Box sx={{ p: 1.5, bgcolor: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 2 }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#0f172a' }}>🏷️ Expiry & Batch OCR</Typography>
              <Typography variant="caption" sx={{ color: '#64748b' }}>Extracts batch numbers and expiry dates automatically.</Typography>
            </Box>
          </Grid>
        </Grid>
        <Box sx={{ p: 1.2, bgcolor: '#eff6ff', borderRadius: 1.5 }}>
          <Typography variant="caption" sx={{ color: '#1e40af', fontWeight: 600 }}>
            📶 Works Offline: Scans queue in mobile storage and auto-sync when online.
          </Typography>
        </Box>
      </Box>
    ),
  },
  {
    step: 4,
    badge: 'BILLING & CUSTOMER KHATA',
    badgeColor: '#d97706',
    title: 'POS Billing & WhatsApp Khata',
    subtitle: 'High-speed checkout with digital invoices and 1-click WhatsApp customer payment reminders.',
    icon: <PointOfSaleIcon sx={{ fontSize: 44, color: '#d97706' }} />,
    content: (
      <Box>
        <Typography variant="body2" sx={{ color: '#475569', mb: 2 }}>
          Bill customers in seconds using voice commands, barcode scanning, or one-tap quick chips.
        </Typography>
        <Stack spacing={1.5} sx={{ mb: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Box sx={{ width: 28, height: 28, borderRadius: '50%', bgcolor: '#dcfce7', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#15803d', fontWeight: 800, fontSize: 13 }}>✓</Box>
            <Typography variant="body2" sx={{ color: '#334155' }}>
              <strong>Cash, UPI & Khata (Credit):</strong> Track who paid and who owes money.
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Box sx={{ width: 28, height: 28, borderRadius: '50%', bgcolor: '#dcfce7', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#15803d', fontWeight: 800, fontSize: 13 }}>✓</Box>
            <Typography variant="body2" sx={{ color: '#334155' }}>
              <strong>1-Click WhatsApp Reminders:</strong> Sends pre-formatted payment links (`wa.me`) directly to debtor customers.
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Box sx={{ width: 28, height: 28, borderRadius: '50%', bgcolor: '#dcfce7', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#15803d', fontWeight: 800, fontSize: 13 }}>✓</Box>
            <Typography variant="body2" sx={{ color: '#334155' }}>
              <strong>Digital Receipts:</strong> Clean, professional invoices formatted for instant printing or sharing.
            </Typography>
          </Box>
        </Stack>
      </Box>
    ),
  },
  {
    step: 5,
    badge: 'EXPIRY & SMART ALERTS',
    badgeColor: '#dc2626',
    title: 'Expiry Tracking & Smart Inventory Alerts',
    subtitle: 'Prevent revenue loss from unnoticed expired stock with proactive shelf-life monitoring.',
    icon: <WarningAmberIcon sx={{ fontSize: 44, color: '#dc2626' }} />,
    content: (
      <Box>
        <Typography variant="body2" sx={{ color: '#475569', mb: 2 }}>
          FMCG and dairy products often expire unnoticed on store shelves. Swaranidhi monitors batch numbers and expiry dates in real time.
        </Typography>
        <Grid container spacing={1.5} sx={{ mb: 2 }}>
          <Grid item xs={6}>
            <Box sx={{ p: 1.5, bgcolor: '#fef3c7', borderRadius: 2, border: '1px solid #fde68a' }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#92400e' }}>⏳ Expiring Soon</Typography>
              <Typography variant="caption" sx={{ color: '#b45309' }}>Flags goods within 7 days of expiry for quick discounting.</Typography>
            </Box>
          </Grid>
          <Grid item xs={6}>
            <Box sx={{ p: 1.5, bgcolor: '#fee2e2', borderRadius: 2, border: '1px solid #fecdd3' }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#991b1b' }}>🗑️ 1-Click Write-Off</Typography>
              <Typography variant="caption" sx={{ color: '#b91c1c' }}>Safely logs `EXPIRED_REMOVAL` audit records.</Typography>
            </Box>
          </Grid>
        </Grid>
        <Box sx={{ p: 1.2, bgcolor: '#f0fdf4', borderRadius: 1.5, border: '1px solid #bbf7d0' }}>
          <Typography variant="caption" sx={{ color: '#166534', fontWeight: 600 }}>
            🔥 7-Day Velocity: Automatically highlights fast-moving products to prevent stockouts.
          </Typography>
        </Box>
      </Box>
    ),
  },
  {
    step: 6,
    badge: 'CROSS-PLATFORM ARCHITECTURE',
    badgeColor: '#7c3aed',
    title: 'Unified Web & Mobile Architecture',
    subtitle: 'Same Spring Boot backend, same PostgreSQL database, accessible anywhere.',
    icon: <PhoneIphoneIcon sx={{ fontSize: 44, color: '#7c3aed' }} />,
    content: (
      <Box>
        <Typography variant="body2" sx={{ color: '#475569', mb: 2 }}>
          Whether managing the shop counter from a PC or checking inventory at the wholesale mandi from a smartphone, Swaranidhi synchronizes instantly.
        </Typography>
        <Box sx={{ p: 1.5, bgcolor: '#1e1b4b', borderRadius: 2, color: '#ffffff', mb: 2 }}>
          <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#a5b4fc', mb: 0.5 }}>
            Enterprise Tech Stack:
          </Typography>
          <Typography variant="caption" sx={{ color: '#e0e7ff', display: 'block', lineHeight: 1.6 }}>
            • <strong>Frontend:</strong> React 19, Vite, Material-UI, Recharts<br />
            • <strong>Mobile:</strong> React Native, Expo 51, Expo Camera, Expo Speech<br />
            • <strong>Backend:</strong> Spring Boot 3.2, Spring Security 6, JWT<br />
            • <strong>AI Layer:</strong> Gemini 1.5 Flash + Rule-Based Zero-Hallucination Fallback<br />
            • <strong>Database:</strong> PostgreSQL 16 & In-Memory H2
          </Typography>
        </Box>
      </Box>
    ),
  },
];

export default function ProjectIntroModal({ open, onClose, onLaunchVoice, onLaunchScan }) {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const navigate = useNavigate();

  const currentStep = INTRO_STEPS[currentStepIndex];

  const handleNext = () => {
    if (currentStepIndex < INTRO_STEPS.length - 1) {
      setCurrentStepIndex(currentStepIndex + 1);
    } else {
      onClose();
    }
  };

  const handleBack = () => {
    if (currentStepIndex > 0) {
      setCurrentStepIndex(currentStepIndex - 1);
    }
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 4,
          overflow: 'hidden',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
        },
      }}
    >
      {/* Header Bar */}
      <Box
        sx={{
          background: 'linear-gradient(135deg, #0f172a 0%, #1e1b4b 50%, #312e81 100%)',
          color: '#ffffff',
          p: 2.5,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
        }}
      >
        <Box>
          <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 0.8 }}>
            <Chip
              label={currentStep.badge}
              size="small"
              sx={{
                bgcolor: currentStep.badgeColor,
                color: '#ffffff',
                fontWeight: 800,
                fontSize: 10,
                letterSpacing: 0.5,
              }}
            />
            <Chip
              label={`Step ${currentStep.step} of ${INTRO_STEPS.length}`}
              size="small"
              sx={{
                bgcolor: 'rgba(255,255,255,0.15)',
                color: '#ffffff',
                fontWeight: 600,
                fontSize: 10,
              }}
            />
          </Stack>
          <Typography variant="h6" sx={{ fontWeight: 800, color: '#ffffff', lineHeight: 1.3 }}>
            {currentStep.title}
          </Typography>
        </Box>
        <IconButton onClick={onClose} sx={{ color: '#94a3b8', '&:hover': { color: '#ffffff' } }}>
          <CloseIcon />
        </IconButton>
      </Box>

      {/* Main Content Area */}
      <DialogContent sx={{ p: 3, bgcolor: '#ffffff' }}>
        <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 2 }}>
          <Box
            sx={{
              width: 56,
              height: 56,
              borderRadius: 3,
              bgcolor: '#f8fafc',
              border: '1px solid #e2e8f0',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            {currentStep.icon}
          </Box>
          <Typography variant="subtitle2" sx={{ color: '#64748b', fontWeight: 500 }}>
            {currentStep.subtitle}
          </Typography>
        </Stack>

        <Divider sx={{ mb: 2.5 }} />

        {currentStep.content}

        {/* Interactive Try Buttons based on step */}
        {currentStep.step === 2 && onLaunchVoice && (
          <Button
            variant="contained"
            color="success"
            fullWidth
            startIcon={<MicIcon />}
            onClick={() => {
              onClose();
              onLaunchVoice();
            }}
            sx={{ mt: 1, py: 1.2, fontWeight: 700, borderRadius: 2 }}
          >
            🎤 Test Voice Assistant Live
          </Button>
        )}

        {currentStep.step === 3 && onLaunchScan && (
          <Button
            variant="contained"
            color="primary"
            fullWidth
            startIcon={<CameraAltIcon />}
            onClick={() => {
              onClose();
              onLaunchScan();
            }}
            sx={{ mt: 1, py: 1.2, fontWeight: 700, borderRadius: 2 }}
          >
            📷 Test AI Stock Photo Scan
          </Button>
        )}

        {/* Step dots indicator */}
        <Box sx={{ display: 'flex', justifyContent: 'center', gap: 1, mt: 3 }}>
          {INTRO_STEPS.map((_, idx) => (
            <Box
              key={idx}
              onClick={() => setCurrentStepIndex(idx)}
              sx={{
                width: currentStepIndex === idx ? 24 : 8,
                height: 8,
                borderRadius: 4,
                bgcolor: currentStepIndex === idx ? '#4f46e5' : '#cbd5e1',
                cursor: 'pointer',
                transition: 'all 0.25s ease',
              }}
            />
          ))}
        </Box>
      </DialogContent>

      {/* Footer Navigation */}
      <DialogActions sx={{ p: 2, bgcolor: '#f8fafc', borderTop: '1px solid #e2e8f0', justifyContent: 'space-between' }}>
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={handleBack}
          disabled={currentStepIndex === 0}
          sx={{ fontWeight: 600, color: '#64748b' }}
        >
          Previous
        </Button>

        <Stack direction="row" spacing={1}>
          <Button
            variant="outlined"
            onClick={() => {
              onClose();
              navigate('/intro');
            }}
            sx={{ fontWeight: 600, borderRadius: 2 }}
          >
            Full Project Page
          </Button>

          <Button
            variant="contained"
            endIcon={currentStepIndex === INTRO_STEPS.length - 1 ? null : <ArrowForwardIcon />}
            onClick={handleNext}
            sx={{
              bgcolor: '#4f46e5',
              '&:hover': { bgcolor: '#4338ca' },
              fontWeight: 700,
              borderRadius: 2,
              px: 3,
            }}
          >
            {currentStepIndex === INTRO_STEPS.length - 1 ? 'Got it, Let\'s Start! 🚀' : 'Next Step'}
          </Button>
        </Stack>
      </DialogActions>
    </Dialog>
  );
}
