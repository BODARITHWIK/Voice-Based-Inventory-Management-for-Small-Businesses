import React, { useState } from 'react';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  Button,
  Chip,
  Stack,
  Divider,
  Paper,
  Tab,
  Tabs,
} from '@mui/material';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import MicIcon from '@mui/icons-material/Mic';
import CameraAltIcon from '@mui/icons-material/CameraAlt';
import PointOfSaleIcon from '@mui/icons-material/PointOfSale';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import PhoneIphoneIcon from '@mui/icons-material/PhoneIphone';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import { useNavigate } from 'react-router-dom';
import ProjectIntroModal from '../components/ProjectIntroModal';
import ScanStockModal from '../components/ScanStockModal';

export default function ProjectIntro() {
  const navigate = useNavigate();
  const [tourOpen, setTourOpen] = useState(false);
  const [scanModalOpen, setScanModalOpen] = useState(false);
  const [pitchTab, setPitchTab] = useState(0);

  return (
    <Box sx={{ pb: 6 }}>
      {/* Back to Dashboard bar */}
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate('/dashboard')}
          sx={{ fontWeight: 700, color: '#334155' }}
        >
          Back to Dashboard
        </Button>
        <Button
          variant="contained"
          startIcon={<PlayArrowIcon />}
          onClick={() => setTourOpen(true)}
          sx={{
            background: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)',
            fontWeight: 700,
            borderRadius: 3,
            px: 2.5,
          }}
        >
          Start Interactive Tour ✨
        </Button>
      </Box>

      {/* Hero Header */}
      <Paper
        elevation={0}
        sx={{
          p: { xs: 3, md: 5 },
          borderRadius: 4,
          background: 'linear-gradient(135deg, #0f172a 0%, #1e1b4b 50%, #312e81 100%)',
          color: '#ffffff',
          position: 'relative',
          overflow: 'hidden',
          mb: 4,
        }}
      >
        <Box sx={{ position: 'relative', zIndex: 1, maxWidth: 850 }}>
          <Stack direction="row" spacing={1} sx={{ mb: 2 }}>
            <Chip
              label="PROJECT INTRODUCTION & SYNOPSIS"
              size="small"
              sx={{ bgcolor: '#4f46e5', color: '#ffffff', fontWeight: 800, fontSize: 11 }}
            />
            <Chip
              label="K L University Major Project"
              size="small"
              sx={{ bgcolor: 'rgba(255,255,255,0.15)', color: '#ffffff', fontWeight: 600, fontSize: 11 }}
            />
          </Stack>

          <Typography variant="h3" sx={{ fontWeight: 900, mb: 1.5, letterSpacing: -0.5 }}>
            Swaranidhi (స్వరనిధి / स्वर्णनिधि)
          </Typography>

          <Typography variant="h5" sx={{ color: '#f59e0b', fontWeight: 700, mb: 2 }}>
            "Speak. Manage. Grow."
          </Typography>

          <Typography variant="body1" sx={{ color: '#cbd5e1', lineHeight: 1.8, fontSize: '1.05rem', mb: 3 }}>
            An AI-Powered Voice & Vision Retail Operating System designed specifically for India's <strong>13+ million neighborhood Kirana stores</strong>. By replacing cumbersome keyboards with natural multilingual voice intelligence and camera OCR vision, Swaranidhi eliminates language barriers and clerical overhead for micro-retailers.
          </Typography>

          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
            <Button
              variant="contained"
              size="large"
              startIcon={<AutoAwesomeIcon />}
              onClick={() => setTourOpen(true)}
              sx={{
                bgcolor: '#f59e0b',
                color: '#0f172a',
                fontWeight: 800,
                borderRadius: 2.5,
                '&:hover': { bgcolor: '#d97706' },
                px: 3,
              }}
            >
              Take Interactive Tour
            </Button>
            <Button
              variant="outlined"
              size="large"
              startIcon={<MicIcon />}
              onClick={() => navigate('/dashboard')}
              sx={{
                borderColor: 'rgba(255,255,255,0.4)',
                color: '#ffffff',
                fontWeight: 700,
                borderRadius: 2.5,
                '&:hover': { borderColor: '#ffffff', bgcolor: 'rgba(255,255,255,0.08)' },
              }}
            >
              Try Voice Assistant
            </Button>
          </Stack>
        </Box>
      </Paper>

      {/* Problem vs Solution Comparison */}
      <Typography variant="h5" sx={{ fontWeight: 800, color: '#0f172a', mb: 2 }}>
        Why Swaranidhi? The Traditional Store vs. Swaranidhi
      </Typography>

      <Grid container spacing={3} sx={{ mb: 5 }}>
        {/* Traditional */}
        <Grid item xs={12} md={6}>
          <Card sx={{ height: '100%', borderRadius: 3, border: '1.5px solid #fecdd3', bgcolor: '#fff1f2' }}>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="h6" sx={{ fontWeight: 800, color: '#991b1b', mb: 2 }}>
                ❌ Traditional POS / Paper Khata
              </Typography>
              <Stack spacing={1.5}>
                {[
                  'English-only software alienates non-English speaking merchants.',
                  'Typing SKUs and prices during customer rush hours is impossible.',
                  'Paper khata notebooks get lost, damaged, or disputed by customers.',
                  'Perishables and packaged foods expire silently on shelves, wasting 4-7% profit.',
                  'High cost of barcode scanners, thermal printers, and desktop PCs.',
                ].map((text, i) => (
                  <Box key={i} sx={{ display: 'flex', gap: 1.2 }}>
                    <Typography sx={{ color: '#dc2626', fontWeight: 800 }}>•</Typography>
                    <Typography variant="body2" sx={{ color: '#7f1d1d', lineHeight: 1.6 }}>{text}</Typography>
                  </Box>
                ))}
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        {/* Swaranidhi */}
        <Grid item xs={12} md={6}>
          <Card sx={{ height: '100%', borderRadius: 3, border: '1.5px solid #a7f3d0', bgcolor: '#ecfdf5' }}>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="h6" sx={{ fontWeight: 800, color: '#065f46', mb: 2 }}>
                ✅ The Swaranidhi Solution
              </Typography>
              <Stack spacing={1.5}>
                {[
                  'Speak naturally in 22 Eighth Schedule Indian Languages + Hinglish & Tanglish.',
                  'AI Stock Photo Scan recognizes packaging, brand, and batch in 2 seconds.',
                  'Digital Khata ledger with 1-click polite WhatsApp reminder links (wa.me).',
                  'Real-time expiry alerts: flags items expiring within 7 days with 1-click write-offs.',
                  'Cross-platform: Works on desktop browser AND smartphone camera app.',
                ].map((text, i) => (
                  <Box key={i} sx={{ display: 'flex', gap: 1.2 }}>
                    <CheckCircleIcon sx={{ fontSize: 18, color: '#059669', mt: 0.2 }} />
                    <Typography variant="body2" sx={{ color: '#064e3b', fontWeight: 600, lineHeight: 1.6 }}>{text}</Typography>
                  </Box>
                ))}
              </Stack>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* 6 Key Modules Grid */}
      <Typography variant="h5" sx={{ fontWeight: 800, color: '#0f172a', mb: 2 }}>
        Core Innovation Modules
      </Typography>

      <Grid container spacing={2.5} sx={{ mb: 5 }}>
        {[
          {
            title: 'Multilingual Voice AI',
            desc: 'Understands intent, product name, and quantity in 22 Indian languages with TTS voice feedback.',
            icon: <MicIcon sx={{ fontSize: 32, color: '#059669' }} />,
            bg: '#f0fdf4',
            border: '#bbf7d0',
            action: 'Test Voice',
            onClick: () => navigate('/dashboard'),
          },
          {
            title: 'AI Stock Photo Analysis',
            desc: 'Computer Vision & OCR identifies packaged goods, batch numbers, and expiry dates from photos.',
            icon: <CameraAltIcon sx={{ fontSize: 32, color: '#2563eb' }} />,
            bg: '#eff6ff',
            border: '#bfdbfe',
            action: 'Scan Photo',
            onClick: () => setScanModalOpen(true),
          },
          {
            title: 'POS Billing & GST',
            desc: 'Touch, barcode, or voice cart creation with automated GST computation and instant digital receipts.',
            icon: <PointOfSaleIcon sx={{ fontSize: 32, color: '#d97706' }} />,
            bg: '#fffbeb',
            border: '#fde68a',
            action: 'Open Sales',
            onClick: () => navigate('/sales'),
          },
          {
            title: 'Customer Khata (Udhaar)',
            desc: 'Digital credit ledger with debtor balances and 1-click polite WhatsApp payment reminder links.',
            icon: <AccountBalanceWalletIcon sx={{ fontSize: 32, color: '#7c3aed' }} />,
            bg: '#f5f3ff',
            border: '#ddd6fe',
            action: 'View Khata',
            onClick: () => navigate('/customers'),
          },
          {
            title: 'Smart Expiry & Stock Alerts',
            desc: 'Tracks manufacturing & expiry dates with 7-day warning alerts and 1-click stock write-off.',
            icon: <WarningAmberIcon sx={{ fontSize: 32, color: '#dc2626' }} />,
            bg: '#fff1f2',
            border: '#fecdd3',
            action: 'Check Alerts',
            onClick: () => navigate('/notifications'),
          },
          {
            title: 'React Native Mobile App',
            desc: 'Mobile-first companion app (Expo 51) sharing the exact same Spring Boot backend and Postgres DB.',
            icon: <PhoneIphoneIcon sx={{ fontSize: 32, color: '#4338ca' }} />,
            bg: '#eef2ff',
            border: '#c7d2fe',
            action: 'Learn More',
            onClick: () => setTourOpen(true),
          },
        ].map((mod, idx) => (
          <Grid item xs={12} sm={6} md={4} key={idx}>
            <Card
              sx={{
                height: '100%',
                borderRadius: 3,
                border: `1.5px solid ${mod.border}`,
                bgcolor: mod.bg,
                transition: 'all 0.2s',
                '&:hover': { transform: 'translateY(-4px)', boxShadow: '0 10px 20px -5px rgba(0,0,0,0.1)' },
              }}
            >
              <CardContent sx={{ p: 2.5, display: 'flex', flexDirection: 'column', height: '100%' }}>
                <Box sx={{ mb: 1.5 }}>{mod.icon}</Box>
                <Typography variant="h6" sx={{ fontWeight: 800, color: '#0f172a', mb: 0.8 }}>
                  {mod.title}
                </Typography>
                <Typography variant="body2" sx={{ color: '#475569', lineHeight: 1.6, flex: 1, mb: 2 }}>
                  {mod.desc}
                </Typography>
                <Button
                  variant="outlined"
                  size="small"
                  onClick={mod.onClick}
                  sx={{ borderRadius: 2, fontWeight: 700, alignSelf: 'flex-start' }}
                >
                  {mod.action} ›
                </Button>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Evaluator Presentation Scripts Card */}
      <Paper elevation={0} sx={{ p: 3.5, borderRadius: 4, border: '1px solid #e2e8f0', bgcolor: '#ffffff', mb: 4 }}>
        <Typography variant="h5" sx={{ fontWeight: 800, color: '#0f172a', mb: 1 }}>
          🎙️ Presentation & Viva Pitch Scripts
        </Typography>
        <Typography variant="body2" sx={{ color: '#64748b', mb: 2.5 }}>
          Ready-to-use spoken scripts for university reviews, evaluation panels, or hackathon demos:
        </Typography>

        <Tabs value={pitchTab} onChange={(_, v) => setPitchTab(v)} sx={{ mb: 2 }}>
          <Tab label="1-Minute Elevator Pitch" sx={{ fontWeight: 700 }} />
          <Tab label="3-Minute Viva Review Pitch" sx={{ fontWeight: 700 }} />
        </Tabs>

        {pitchTab === 0 ? (
          <Box sx={{ p: 2.5, bgcolor: '#f8fafc', borderRadius: 2.5, borderLeft: '4px solid #4f46e5' }}>
            <Typography variant="body1" sx={{ color: '#1e293b', fontStyle: 'italic', lineHeight: 1.8 }}>
              "Good morning. I am presenting <strong>Swaranidhi</strong> — an AI-powered voice and vision operating system for India's 13 million neighborhood Kirana stores.<br /><br />
              Traditional retail software requires typing in English, which small shopkeepers cannot do while managing customers. Swaranidhi replaces keyboards with natural voice and camera vision.<br /><br />
              A merchant can speak in <strong>Hindi, Telugu, Tamil, or any of 22 Indian languages</strong> to record stock or sales. They can take a photo of a shelf using their smartphone, and our computer vision automatically identifies the product, batch, and expiry date. Customer credit accounts are tracked digitally, and polite WhatsApp payment reminders can be sent with a single tap.<br /><br />
              By eliminating language barriers and clerical overhead, Swaranidhi empowers local merchants to <strong>Speak. Manage. and Grow.</strong> Thank you."
            </Typography>
          </Box>
        ) : (
          <Box sx={{ p: 2.5, bgcolor: '#f8fafc', borderRadius: 2.5, borderLeft: '4px solid #059669' }}>
            <Typography variant="body1" sx={{ color: '#1e293b', fontStyle: 'italic', lineHeight: 1.8 }}>
              "Respected panel members, micro-retailers in India power over $800 billion in annual commerce, yet over 90% still rely on paper notebooks. Enterprise software built for Western supermarkets simply does not work in an Indian Kirana context.<br /><br />
              <strong>Swaranidhi introduces three breakthrough capabilities:</strong><br />
              • <strong>First:</strong> A conversational voice engine supporting 22 Indian languages and colloquial dialects that parses intent, item name, and quantity in real time.<br />
              • <strong>Second:</strong> AI Stock Photo Analysis that uses camera OCR to extract product details, batch numbers, and expiration dates directly from packaging.<br />
              • <strong>Third:</strong> Digital Khata management with automated WhatsApp reminder integration and 1-click write-off of expired goods.<br /><br />
              The system follows an enterprise three-tier architecture: a cross-platform React web dashboard, a native Expo mobile application, and a shared Spring Boot microservice backend with stateless JWT security and PostgreSQL persistence.<br /><br />
              Swaranidhi proves that cutting-edge artificial intelligence can be made accessible, practical, and transformative for everyday small businesses. Thank you, and I am happy to demonstrate the live system."
            </Typography>
          </Box>
        )}
      </Paper>

      {/* Interactive Tour Modal */}
      <ProjectIntroModal
        open={tourOpen}
        onClose={() => setTourOpen(false)}
        onLaunchVoice={() => navigate('/dashboard')}
        onLaunchScan={() => setScanModalOpen(true)}
      />

      {/* Scan Stock Modal */}
      <ScanStockModal
        open={scanModalOpen}
        onClose={() => setScanModalOpen(false)}
        onScanSuccess={() => {
          setScanModalOpen(false);
          navigate('/products');
        }}
      />
    </Box>
  );
}
