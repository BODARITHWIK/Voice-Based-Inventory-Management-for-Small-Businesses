import React, { useState, useEffect, useRef } from 'react';
import {
  Button,
  IconButton,
  Tooltip,
  Typography,
  Box,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Chip,
  Alert,
  Stack,
  Paper,
  Collapse,
} from '@mui/material';
import MicIcon from '@mui/icons-material/Mic';
import GraphicEqIcon from '@mui/icons-material/GraphicEq';
import SendIcon from '@mui/icons-material/Send';
import VolumeUpIcon from '@mui/icons-material/VolumeUp';
import VolumeOffIcon from '@mui/icons-material/VolumeOff';
import QuestionAnswerIcon from '@mui/icons-material/QuestionAnswer';
import CloseIcon from '@mui/icons-material/Close';
import CodeIcon from '@mui/icons-material/Code';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';

import VoiceWaveform from './VoiceWaveform';
import { sendVoiceCommand, getProducts } from '../services/api';
import { speechService } from '../services/speechService';
import { useLanguage } from '../context/LanguageContext';
import { useSimpleMode } from '../context/SimpleModeContext';
import { clearConversationContext } from '../services/voiceParser';

// Rotating prompts per Section 48
const ROTATING_HINTS = [
  { lang: 'Telugu', hint: 'తెలుగులో మాట్లాడండి (e.g. మ్యాగీ 20 ప్యాకెట్లు యాడ్ చేయి)' },
  { lang: 'Hindi', hint: 'हिंदी में बोलें (e.g. मैगी के 20 पैकेट स्टॉक में जोड़ो)' },
  { lang: 'Kannada', hint: 'ಕನ್ನಡದಲ್ಲಿ ಮಾತನಾಡಿ (e.g. ಮ್ಯಾಗಿ 20 ಪ್ಯಾಕೆಟ್ ಸೇರಿಸಿ)' },
  { lang: 'Tamil', hint: 'தமிழில் பேசுங்கள் (e.g. 20 மேகி பாக்கெட்டுகளை சேர்க்கவும்)' },
  { lang: 'Malayalam', hint: 'മലയാളത്തിൽ സംസാരിക്കൂ (e.g. 20 പാക്കറ്റ് മാഗി ചേർക്കൂ)' },
  { lang: 'Bengali', hint: 'বাংলায় বলুন (e.g. ম্যাগি ২০টা প্যাকেট স্টকে যোগ করো)' },
  { lang: 'English', hint: 'Speak in English (e.g. Add 20 packets of Maggi)' },
];

const VoiceButton = ({
  variant = 'button', // 'button' | 'icon' | 'largeCard'
  onCommandResult,
  label = '',
  contextHint = '',
}) => {
  const {
    t,
    getSpeechLangCode,
    effectiveLang,
    inputLanguage,
    developerMode,
    toggleDeveloperMode,
  } = useLanguage();
  const { simpleMode, ttsEnabled, toggleTts } = useSimpleMode();

  const [state, setState] = useState('idle'); // 'idle' | 'listening' | 'processing' | 'success' | 'error'
  const [transcript, setTranscript] = useState('');
  const [friendlyMessage, setFriendlyMessage] = useState('');
  const [manualText, setManualText] = useState('');
  const [manualModalOpen, setManualModalOpen] = useState(false);
  const [followUpQuestion, setFollowUpQuestion] = useState(null);
  const [pendingConfirm, setPendingConfirm] = useState(null); // { message, result }
  const [isSupported, setIsSupported] = useState(true);
  const [products, setProducts] = useState([]);

  // Pipeline Live Status (Section 49)
  const [detectedLangDisplay, setDetectedLangDisplay] = useState(null); // { name, confidence }
  const [pipelineStep, setPipelineStep] = useState('idle'); // 'listening' | 'detected' | 'understanding' | 'idle'
  const [lastCommandResult, setLastCommandResult] = useState(null);
  const [devPanelOpen, setDevPanelOpen] = useState(false);
  const [latencyMs, setLatencyMs] = useState(null);

  // Rotating hints ticker
  const [hintIndex, setHintIndex] = useState(0);

  const recognitionRef = useRef(null);
  const transcriptRef = useRef('');

  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) setIsSupported(false);
    getProducts().then((list) => {
      if (Array.isArray(list) && list.length > 0) setProducts(list);
    }).catch(() => {});

    // Hint rotation timer
    const ticker = setInterval(() => {
      setHintIndex((prev) => (prev + 1) % ROTATING_HINTS.length);
    }, 4500);

    return () => clearInterval(ticker);
  }, []);

  // Determine speech recognition language code
  const getRecognitionLang = () => {
    return getSpeechLangCode(inputLanguage);
  };

  const startListening = async () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setIsSupported(false);
      setFriendlyMessage("Speech recognition is not supported in this browser. Please use Chrome or Edge, or type in the box below!");
      setState('error');
      return;
    }

    // Step 1: Check mic stream
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        stream.getTracks().forEach((track) => track.stop());
      } catch (permErr) {
        console.warn('Microphone permission blocked:', permErr);
        setFriendlyMessage(
          "🔒 Microphone permission is blocked. Please click the lock icon 🔒 in the address bar and switch Microphone to 'Allow', then try again. Or type below!"
        );
        setState('error');
        return;
      }
    }

    // Step 2: Start speech recognition
    try {
      if (recognitionRef.current) {
        try { recognitionRef.current.abort(); } catch (e) {}
      }

      const recognition = new SpeechRecognition();
      recognitionRef.current = recognition;
      recognition.continuous = false;
      recognition.interimResults = true;
      recognition.lang = getRecognitionLang();

      recognition.onstart = () => {
        setState('listening');
        setPipelineStep('listening');
        setDetectedLangDisplay(null);
        transcriptRef.current = '';
        setTranscript('');
        setFriendlyMessage('');
      };

      recognition.onresult = (event) => {
        let currentText = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
          currentText += event.results[i][0].transcript;
        }
        transcriptRef.current = currentText;
        setTranscript(currentText);
      };

      recognition.onerror = (event) => {
        console.warn('Speech error:', event.error);
        if (event.error === 'no-speech') {
          setFriendlyMessage("I didn't hear anything. Please tap and speak clearly!");
          setState('idle');
          setPipelineStep('idle');
        } else {
          setFriendlyMessage("I couldn't hear that clearly. Please try again or type below.");
          setState('error');
          setPipelineStep('idle');
        }
      };

      recognition.onend = () => {
        const finalText = transcriptRef.current.trim();
        if (finalText) {
          handleProcessCommand(finalText);
        } else {
          setState('idle');
          setPipelineStep('idle');
        }
      };

      recognition.start();
    } catch (err) {
      console.error('Speech recognition exception:', err);
      setFriendlyMessage("I couldn't understand that. Please try again.");
      setState('error');
      setPipelineStep('idle');
    }
  };

  const stopListening = () => {
    if (recognitionRef.current) {
      try { recognitionRef.current.stop(); } catch (e) {}
    }
    const finalText = transcriptRef.current.trim();
    if (finalText) {
      handleProcessCommand(finalText);
    } else {
      setState('idle');
      setPipelineStep('idle');
    }
  };

  /**
   * Unified Understanding Pipeline: Voice & Text both route through here
   */
  const handleProcessCommand = async (text) => {
    if (!text || !text.trim()) return;
    const startTime = performance.now();
    setState('processing');
    setPipelineStep('understanding');
    console.debug('[VoiceButton] Processing:', text);

    try {
      const result = await sendVoiceCommand(text, inputLanguage, products);
      const elapsed = Math.round(performance.now() - startTime);
      setLatencyMs(elapsed);
      setLastCommandResult(result);

      // Update detected language feedback (Section 49)
      if (result.languageName) {
        setDetectedLangDisplay({
          name: result.languageName,
          confidence: Math.round((result.languageConfidence || result.confidence || 0.95) * 100),
        });
      }

      // --- Follow-up question needed (missing quantity / product) ---
      if (result.requiresFollowUp) {
        const question = result.followUpQuestion || result.message;
        setFollowUpQuestion(question);
        setPendingConfirm(null);
        setState('idle');
        setPipelineStep('idle');
        setTranscript('');
        if (ttsEnabled && question) {
          speechService.speak(question, result.language || getSpeechLangCode());
        }
        return;
      }

      // --- Awaiting confirmation ---
      if (result.requiresConfirmation && !result.executed) {
        const confirmMsg = result.response || result.message;
        setFollowUpQuestion(null);
        setPendingConfirm({ message: confirmMsg, result });
        setState('idle');
        setPipelineStep('idle');
        setTranscript('');
        if (ttsEnabled && confirmMsg) {
          speechService.speak(confirmMsg, result.language || getSpeechLangCode());
        }
        return;
      }

      // --- Cancelled ---
      if (result.cancelled) {
        setFollowUpQuestion(null);
        setPendingConfirm(null);
        setState('idle');
        setPipelineStep('idle');
        setFriendlyMessage(result.message || 'Cancelled.');
        setTimeout(() => setFriendlyMessage(''), 2500);
        return;
      }

      // --- Fully resolved result ---
      setFollowUpQuestion(null);
      setPendingConfirm(null);

      if (result.success) {
        setState('success');
        setPipelineStep('idle');
        if (onCommandResult) onCommandResult(result);
        if (ttsEnabled && result.response) {
          speechService.speak(result.response, result.language || getSpeechLangCode());
        }
        setTimeout(() => { setState('idle'); setTranscript(''); }, 1800);
      } else {
        setState('error');
        setPipelineStep('idle');
        setFriendlyMessage(result.message || "I couldn't find that product. Please try again.");
      }
    } catch (err) {
      console.error('Command processing error:', err);
      setState('error');
      setPipelineStep('idle');
      setFriendlyMessage("An error occurred while understanding the command. Please try again.");
    }
  };

  const handleConfirm = () => {
    if (!pendingConfirm) return;
    const { result } = pendingConfirm;
    setPendingConfirm(null);
    clearConversationContext();

    if (onCommandResult) {
      onCommandResult({ ...result, executed: true });
    }
    setState('success');
    const doneMsg = "Done! Action confirmed.";
    setFriendlyMessage(doneMsg);
    if (ttsEnabled) {
      speechService.speak(doneMsg, result?.language || getSpeechLangCode());
    }
    setTimeout(() => {
      setState('idle');
      setFriendlyMessage('');
    }, 2000);
  };

  const handleCancelConfirm = () => {
    setPendingConfirm(null);
    clearConversationContext();
    setFriendlyMessage('Action cancelled.');
    setState('idle');
    setTimeout(() => setFriendlyMessage(''), 2000);
  };

  const handleManualSubmit = () => {
    if (!manualText.trim()) return;
    const cmd = manualText.trim();
    setManualText('');
    setManualModalOpen(false);
    handleProcessCommand(cmd);
  };

  // Quick-try sample chips across Indian languages
  const sampleCommands = [
    { label: 'తెలుగు: మ్యాగీ 20 ప్యాకెట్లు', text: 'మ్యాగీ 20 ప్యాకెట్లు స్టాక్లో యాడ్ చేయి' },
    { label: 'हिंदी: मैगी के 20 पैकेट', text: 'मैगी के 20 पैकेट स्टॉक में जोड़ो' },
    { label: 'Heritage Milk: 20 packets', text: 'Heritage Milk 20 packets add cheyyi' },
    { label: 'Ramesh: ₹500 paid', text: 'Ramesh 500 rupaye diye' },
    { label: 'Sales: Ee roju sales', text: 'Ee roju sales entha?' },
    { label: 'English: Add 20 Maggi', text: 'Add 20 packets of Maggi' },
  ];

  // =========================================================================
  // RENDER VARIANTS
  // =========================================================================

  // 1. largeCard variant (Dashboard main assistant)
  if (variant === 'largeCard') {
    const currentHint = ROTATING_HINTS[hintIndex];
    const confirmActionButtons = pendingConfirm?.result?.actionButtons || {
      confirm: '✓ Confirm',
      cancel: 'Cancel',
    };

    return (
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          py: simpleMode ? 3.5 : 2.5,
          px: simpleMode ? 3 : 2,
        }}
      >
        {/* Section 48 Header */}
        <Typography
          variant="h6"
          sx={{
            fontWeight: 800,
            color: '#064e3b',
            fontSize: simpleMode ? '1.45rem' : '1.25rem',
            textAlign: 'center',
            mb: 0.5,
          }}
        >
          Speak naturally in your language.
        </Typography>

        {/* Rotating prompt subtitle */}
        <Typography
          variant="body2"
          sx={{
            color: '#059669',
            fontWeight: 700,
            fontSize: simpleMode ? '1.05rem' : '0.92rem',
            textAlign: 'center',
            mb: 2,
            minHeight: 24,
            transition: 'opacity 0.3s ease',
          }}
        >
          {currentHint.hint}
        </Typography>

        {/* Large Mic Trigger Button */}
        <Box sx={{ position: 'relative', my: 1 }}>
          {state === 'processing' && (
            <CircularProgress
              size={simpleMode ? 108 : 96}
              thickness={2.5}
              sx={{
                color: '#059669',
                position: 'absolute',
                top: -6,
                left: -6,
                zIndex: 1,
              }}
            />
          )}

          <IconButton
            onClick={state === 'listening' ? stopListening : startListening}
            sx={{
              width: simpleMode ? 96 : 84,
              height: simpleMode ? 96 : 84,
              backgroundColor: state === 'listening' ? '#ef4444' : '#059669',
              color: '#ffffff',
              boxShadow: state === 'listening'
                ? '0 0 0 12px rgba(239, 68, 68, 0.25), 0 8px 24px rgba(239, 68, 68, 0.4)'
                : '0 0 0 8px rgba(5, 150, 105, 0.15), 0 8px 24px rgba(5, 150, 105, 0.35)',
              transition: 'all 0.25s ease-in-out',
              '&:hover': {
                backgroundColor: state === 'listening' ? '#dc2626' : '#047857',
                transform: 'scale(1.05)',
              },
            }}
            aria-label="Voice Command Microphone"
          >
            {state === 'listening' ? (
              <GraphicEqIcon sx={{ fontSize: simpleMode ? 52 : 46 }} />
            ) : (
              <MicIcon sx={{ fontSize: simpleMode ? 52 : 46 }} />
            )}
          </IconButton>
        </Box>

        {/* Waveform while listening */}
        {state === 'listening' && <VoiceWaveform state="listening" />}

        {/* Section 49: Live Pipeline Status (Listening -> Detected Language -> Understanding) */}
        <Box sx={{ textAlign: 'center', mb: 1.5, mt: 1 }}>
          {state === 'listening' && (
            <Typography variant="body1" sx={{ fontWeight: 800, color: '#dc2626' }}>
              🎙️ Listening in {inputLanguage === 'auto' ? 'Indian Languages' : inputLanguage.toUpperCase()}...
            </Typography>
          )}

          {state === 'processing' && (
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 0.5 }}>
              {detectedLangDisplay && (
                <Chip
                  label={`Language detected: ${detectedLangDisplay.name} (${detectedLangDisplay.confidence}%)`}
                  size="small"
                  color="primary"
                  sx={{ fontWeight: 700, fontSize: '0.82rem', mb: 0.5 }}
                />
              )}
              <Typography variant="body1" sx={{ fontWeight: 800, color: '#059669' }}>
                🧠 Understanding command...
              </Typography>
            </Box>
          )}

          {state === 'idle' && !followUpQuestion && !pendingConfirm && (
            <Typography variant="body2" color="text.secondary">
              Tap mic or type in any Indian language below
            </Typography>
          )}
        </Box>

        {/* Follow-up question banner */}
        {followUpQuestion && (
          <Alert
            severity="info"
            icon={<QuestionAnswerIcon />}
            action={
              <IconButton size="small" color="inherit" onClick={() => setFollowUpQuestion(null)}>
                <CloseIcon fontSize="small" />
              </IconButton>
            }
            sx={{
              mb: 2,
              width: '100%',
              borderRadius: 2.5,
              backgroundColor: '#eff6ff',
              border: '1.5px solid #93c5fd',
              color: '#1e40af',
              fontWeight: 700,
              fontSize: '1rem',
            }}
          >
            {followUpQuestion}
          </Alert>
        )}

        {/* Confirmation banner with Localized Action Buttons (Section 9, 10, 11) */}
        {pendingConfirm && (
          <Alert
            severity="success"
            icon={<CheckCircleIcon />}
            sx={{
              mb: 2,
              width: '100%',
              borderRadius: 2.5,
              backgroundColor: '#f0fdf4',
              border: '1.5px solid #86efac',
              color: '#14532d',
              fontWeight: 700,
              fontSize: '1rem',
            }}
            action={
              <Stack direction="row" spacing={1}>
                <Button
                  size="small"
                  variant="contained"
                  color="success"
                  onClick={handleConfirm}
                  sx={{ fontWeight: 800, borderRadius: 2, minWidth: 90 }}
                >
                  {confirmActionButtons.confirm}
                </Button>
                <Button
                  size="small"
                  variant="outlined"
                  color="error"
                  onClick={handleCancelConfirm}
                  sx={{ fontWeight: 700, borderRadius: 2, minWidth: 70 }}
                >
                  {confirmActionButtons.cancel}
                </Button>
              </Stack>
            }
          >
            {pendingConfirm.message}
          </Alert>
        )}

        {/* Spoken Transcript display box */}
        {transcript && state === 'listening' && (
          <Box
            sx={{
              p: 1.5,
              mb: 2,
              backgroundColor: '#f8fafc',
              borderRadius: 3,
              border: '1.5px dashed #059669',
              width: '100%',
              textAlign: 'center',
            }}
          >
            <Typography variant="caption" sx={{ color: '#64748b', fontWeight: 700, display: 'block' }}>
              Hearing:
            </Typography>
            <Typography variant="body1" sx={{ fontWeight: 700, color: '#0f172a', fontStyle: 'italic' }}>
              "{transcript}"
            </Typography>
          </Box>
        )}

        {/* Friendly alerts */}
        {friendlyMessage && (
          <Alert severity="warning" sx={{ mb: 2, width: '100%' }} onClose={() => setFriendlyMessage('')}>
            {friendlyMessage}
          </Alert>
        )}

        {/* Natural Language Input Box */}
        <Paper
          elevation={0}
          component="form"
          onSubmit={(e) => {
            e.preventDefault();
            handleManualSubmit();
          }}
          sx={{
            display: 'flex',
            alignItems: 'center',
            width: '100%',
            backgroundColor: '#ffffff',
            borderRadius: 3.5,
            border: '2px solid #a7f3d0',
            boxShadow: '0 4px 16px rgba(5, 150, 105, 0.08)',
            p: '4px 12px',
            mb: 2,
            transition: 'border-color 0.2s ease',
            '&:focus-within': {
              borderColor: '#059669',
              boxShadow: '0 0 0 4px rgba(5, 150, 105, 0.15)',
            },
          }}
        >
          <TextField
            fullWidth
            variant="standard"
            placeholder="Type or speak in any Indian language..."
            value={manualText}
            onChange={(e) => setManualText(e.target.value)}
            InputProps={{
              disableUnderline: true,
              sx: {
                fontSize: simpleMode ? '1.15rem' : '1rem',
                fontWeight: 500,
                color: '#0f172a',
                py: 1,
                px: 1,
              },
            }}
          />

          <Stack direction="row" spacing={1} alignItems="center">
            <Tooltip title={state === 'listening' ? 'Stop listening' : 'Speak command'}>
              <IconButton
                size="small"
                onClick={state === 'listening' ? stopListening : startListening}
                color={state === 'listening' ? 'error' : 'primary'}
                sx={{
                  backgroundColor: state === 'listening' ? '#fee2e2' : '#ecfdf5',
                  '&:hover': { backgroundColor: state === 'listening' ? '#fecaca' : '#d1fae5' },
                }}
              >
                {state === 'listening' ? <GraphicEqIcon fontSize="small" /> : <MicIcon fontSize="small" />}
              </IconButton>
            </Tooltip>

            <Button
              type="submit"
              variant="contained"
              color="primary"
              disabled={!manualText.trim()}
              endIcon={<SendIcon sx={{ fontSize: 16 }} />}
              sx={{
                borderRadius: 2.5,
                fontWeight: 700,
                px: 2.2,
                py: 0.8,
                fontSize: '0.88rem',
              }}
            >
              Send
            </Button>
          </Stack>
        </Paper>

        {/* Controls: Audio Response & Developer Mode */}
        <Stack direction="row" spacing={1.5} sx={{ mb: 2, alignItems: 'center', flexWrap: 'wrap' }}>
          <Button
            size="small"
            startIcon={ttsEnabled ? <VolumeUpIcon /> : <VolumeOffIcon />}
            onClick={toggleTts}
            sx={{
              color: ttsEnabled ? '#059669' : '#64748b',
              backgroundColor: ttsEnabled ? '#ecfdf5' : '#f8fafc',
              border: `1px solid ${ttsEnabled ? '#a7f3d0' : '#e2e8f0'}`,
              fontWeight: 700,
              fontSize: '0.78rem',
              borderRadius: 2,
            }}
          >
            {ttsEnabled ? 'Voice Response: ON' : 'Voice Response: OFF'}
          </Button>

          {/* Section 56: Developer Mode Toggle */}
          {developerMode && (
            <Button
              size="small"
              startIcon={<CodeIcon />}
              onClick={() => setDevPanelOpen((prev) => !prev)}
              sx={{
                color: '#475569',
                backgroundColor: '#f1f5f9',
                border: '1px solid #cbd5e1',
                fontWeight: 700,
                fontSize: '0.78rem',
                borderRadius: 2,
              }}
            >
              {devPanelOpen ? 'Hide Dev View' : 'Dev View (NLP & Command)'}
            </Button>
          )}
        </Stack>

        {/* Section 56: Developer Mode Inspector Panel */}
        {developerMode && (
          <Collapse in={devPanelOpen} sx={{ width: '100%', mb: 2 }}>
            <Paper
              elevation={0}
              sx={{
                p: 2,
                backgroundColor: '#0f172a',
                color: '#38bdf8',
                borderRadius: 2.5,
                fontFamily: 'monospace',
                fontSize: '0.78rem',
                overflowX: 'auto',
              }}
            >
              <Typography variant="caption" sx={{ color: '#94a3b8', fontWeight: 800, display: 'block', mb: 1 }}>
                DEVELOPER MODE INSPECTOR (Section 56)
              </Typography>
              <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: 1, mb: 1.5 }}>
                <Box>
                  <Typography variant="caption" sx={{ color: '#64748b' }}>Detected Lang:</Typography>
                  <div>{lastCommandResult?.language || 'N/A'} ({lastCommandResult?.languageName || 'N/A'})</div>
                </Box>
                <Box>
                  <Typography variant="caption" sx={{ color: '#64748b' }}>Intent:</Typography>
                  <div style={{ color: '#4ade80' }}>{lastCommandResult?.intent || 'N/A'}</div>
                </Box>
                <Box>
                  <Typography variant="caption" sx={{ color: '#64748b' }}>Confidence:</Typography>
                  <div>{lastCommandResult?.confidence ? `${Math.round(lastCommandResult.confidence * 100)}%` : 'N/A'}</div>
                </Box>
                <Box>
                  <Typography variant="caption" sx={{ color: '#64748b' }}>Latency:</Typography>
                  <div>{latencyMs ? `${latencyMs} ms` : 'N/A'}</div>
                </Box>
              </Box>
              <Typography variant="caption" sx={{ color: '#64748b' }}>Raw NormalizedCommand JSON:</Typography>
              <pre style={{ margin: 0, marginTop: 4, color: '#e2e8f0', whiteSpace: 'pre-wrap' }}>
                {JSON.stringify(lastCommandResult || {}, null, 2)}
              </pre>
            </Paper>
          </Collapse>
        )}

        {/* Multilingual Quick Examples */}
        <Box sx={{ width: '100%' }}>
          <Typography
            variant="caption"
            sx={{
              color: '#64748b',
              fontWeight: 800,
              display: 'block',
              mb: 1.2,
              textAlign: 'center',
              textTransform: 'uppercase',
              letterSpacing: '0.6px',
            }}
          >
            Try speaking or typing:
          </Typography>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, justifyContent: 'center' }}>
            {sampleCommands.map((cmd, idx) => (
              <Chip
                key={idx}
                label={cmd.label}
                size={simpleMode ? 'medium' : 'small'}
                onClick={() => {
                  setManualText(cmd.text);
                  handleProcessCommand(cmd.text);
                }}
                sx={{
                  backgroundColor: '#ffffff',
                  border: '1px solid #cbd5e1',
                  fontWeight: 600,
                  cursor: 'pointer',
                  py: simpleMode ? 1.2 : 0.5,
                  fontSize: simpleMode ? '0.9rem' : '0.8rem',
                  '&:hover': {
                    backgroundColor: '#ecfdf5',
                    borderColor: '#059669',
                    color: '#065f46',
                  },
                }}
              />
            ))}
          </Box>
        </Box>
      </Box>
    );
  }

  // 2. icon variant (Navbar icon)
  if (variant === 'icon') {
    return (
      <>
        <Tooltip title={state === 'listening' ? "🔴 I'm listening..." : '🎙️ Speak in your language'}>
          <IconButton
            onClick={state === 'listening' ? stopListening : startListening}
            color={state === 'listening' ? 'error' : 'primary'}
            sx={{
              backgroundColor: state === 'listening' ? '#fee2e2' : '#ecfdf5',
              border: `1px solid ${state === 'listening' ? '#fca5a5' : '#a7f3d0'}`,
              '&:hover': {
                backgroundColor: state === 'listening' ? '#fecaca' : '#d1fae5',
              },
            }}
            aria-label="Voice command"
          >
            {state === 'listening' ? <GraphicEqIcon fontSize="small" /> : <MicIcon fontSize="small" />}
          </IconButton>
        </Tooltip>

        {/* Quick Type Dialog Fallback */}
        <Dialog open={manualModalOpen} onClose={() => setManualModalOpen(false)} maxWidth="sm" fullWidth>
          <DialogTitle sx={{ fontWeight: 800 }}>Speak or type in your language</DialogTitle>
          <DialogContent>
            <TextField
              autoFocus
              fullWidth
              placeholder="e.g., మ్యాగీ 20 ప్యాకెట్లు లేదా 20 packets Maggi"
              value={manualText}
              onChange={(e) => setManualText(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleManualSubmit()}
              sx={{ mt: 1 }}
            />
          </DialogContent>
          <DialogActions sx={{ px: 3, pb: 2.5 }}>
            <Button onClick={() => setManualModalOpen(false)} sx={{ color: '#64748b' }}>
              Cancel
            </Button>
            <Button variant="contained" color="primary" onClick={handleManualSubmit}>
              Submit
            </Button>
          </DialogActions>
        </Dialog>
      </>
    );
  }

  // 3. button variant
  const buttonLabel = label || '🎙️ Speak in your language';
  return (
    <>
      <Button
        variant="outlined"
        color={state === 'listening' ? 'error' : 'primary'}
        startIcon={
          state === 'listening' ? (
            <GraphicEqIcon />
          ) : state === 'processing' ? (
            <CircularProgress size={18} />
          ) : (
            <MicIcon />
          )
        }
        onClick={state === 'listening' ? stopListening : startListening}
        sx={{
          borderRadius: 2.5,
          fontWeight: 700,
          borderColor: state === 'listening' ? '#ef4444' : '#059669',
          color: state === 'listening' ? '#dc2626' : '#059669',
          backgroundColor: state === 'listening' ? '#fee2e2' : 'transparent',
          fontSize: simpleMode ? '0.95rem' : '0.85rem',
          py: simpleMode ? 1.2 : 0.8,
          '&:hover': {
            backgroundColor: state === 'listening' ? '#fecaca' : '#ecfdf5',
            borderColor: state === 'listening' ? '#dc2626' : '#047857',
          },
        }}
      >
        {state === 'listening'
          ? "🔴 I'm listening..."
          : state === 'processing'
          ? 'Understanding...'
          : buttonLabel}
      </Button>

      <Dialog open={manualModalOpen} onClose={() => setManualModalOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ fontWeight: 800 }}>Type or speak what you want...</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            fullWidth
            size="small"
            placeholder={contextHint || 'Type or speak what you want...'}
            value={manualText}
            onChange={(e) => setManualText(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleManualSubmit()}
            sx={{ mt: 1 }}
          />
        </DialogContent>
        <DialogActions sx={{ px: 2.5, pb: 2 }}>
          <Button onClick={() => setManualModalOpen(false)}>Cancel</Button>
          <Button variant="contained" color="primary" onClick={handleManualSubmit}>
            Continue
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default VoiceButton;
