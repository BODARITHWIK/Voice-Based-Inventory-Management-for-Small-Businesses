import React, { useState, useRef, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  IconButton,
  Chip,
  CircularProgress,
  TextField,
  MenuItem,
  Alert,
  Tabs,
  Tab,
  Checkbox,
  FormControlLabel,
  Card,
  CardContent,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Tooltip,
} from '@mui/material';
import {
  CameraAlt as CameraIcon,
  PhotoLibrary as GalleryIcon,
  Close as CloseIcon,
  FlipCameraIos as FlipCameraIcon,
  CheckCircle as CheckIcon,
  Edit as EditIcon,
  Mic as MicIcon,
  MicOff as MicOffIcon,
  VolumeUp as SpeakIcon,
  Warning as WarningIcon,
  QrCode as BarcodeIcon,
  ExpandMore as ExpandMoreIcon,
  CloudOff as OfflineIcon,
  Replay as RetakeIcon,
  AddShoppingCart as AddStockIcon,
  RemoveShoppingCart as RemoveStockIcon,
  Tune as AdjustStockIcon,
} from '@mui/icons-material';
import {
  analyzeStockPhoto,
  confirmStockScan,
  rejectStockScan,
  matchProductRemote,
  getProducts,
} from '../services/api';
import { parseNaturalVoiceCommand } from '../services/voiceParser';
import { speakIndianText } from '../services/speechService';
import { useLanguage } from '../context/LanguageContext';
import {
  getLocalizedProduct,
  getLocalizedCategory,
  getLocalizedUnit,
} from '../utils/productLocalization';

export default function ScanStockModal({ open, onClose, onStockUpdated }) {
  const { getSpeechLangCode, developerMode, selectedLanguage } = useLanguage();

  // Step states: 'CAPTURE' | 'ANALYZING' | 'RESULT' | 'ERROR' | 'OFFLINE_SAVED'
  const [step, setStep] = useState('CAPTURE');
  const [facingMode, setFacingMode] = useState('environment'); // 'environment' | 'user'
  const [cameraError, setCameraError] = useState(null);
  const [capturedImage, setCapturedImage] = useState(null);
  const [analyzingMessageIndex, setAnalyzingMessageIndex] = useState(0);

  // Analysis result
  const [analysisResult, setAnalysisResult] = useState(null);
  const [selectedProductIndex, setSelectedProductIndex] = useState(0);
  const [multiSelectState, setMultiSelectState] = useState({}); // { [idx]: boolean }
  const [stockAction, setStockAction] = useState('ADD_STOCK'); // 'ADD_STOCK' | 'REMOVE_STOCK' | 'STOCK_ADJUSTMENT'

  // Editable fields before confirmation
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    productName: '',
    quantity: 1,
    unit: 'packets',
    category: 'Dairy',
    purchasePrice: '',
    sellingPrice: '',
    supplier: '',
    barcode: '',
  });

  // Voice + Photo Combination
  const [isListeningVoice, setIsListeningVoice] = useState(false);
  const [voiceConflict, setVoiceConflict] = useState(null); // { photoProduct, voiceProduct, voiceQty }
  const [voiceSpokenText, setVoiceSpokenText] = useState('');

  // Local inventory for autocomplete / match
  const [allProducts, setAllProducts] = useState([]);
  const [isSaving, setIsSaving] = useState(false);
  const [statusMessage, setStatusMessage] = useState(null);

  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const fileInputRef = useRef(null);
  const recognitionRef = useRef(null);
  const mediaStreamRef = useRef(null);

  const analyzingSteps = [
    'Reading product label...',
    'Detecting product...',
    'Checking inventory...',
    'Estimating quantity...',
  ];

  // Load existing products for instant local matching
  useEffect(() => {
    if (open) {
      getProducts().then((prods) => setAllProducts(prods || [])).catch(() => {});
      resetState();
    } else {
      stopCamera();
    }
  }, [open]);

  // Handle camera stream setup
  useEffect(() => {
    if (open && step === 'CAPTURE') {
      startCamera();
    }
    return () => {
      stopCamera();
    };
  }, [open, step, facingMode]);

  // Cycle analyzing status messages
  useEffect(() => {
    let interval;
    if (step === 'ANALYZING') {
      interval = setInterval(() => {
        setAnalyzingMessageIndex((prev) => (prev + 1) % analyzingSteps.length);
      }, 700);
    }
    return () => clearInterval(interval);
  }, [step]);

  const resetState = () => {
    setStep('CAPTURE');
    setCapturedImage(null);
    setAnalysisResult(null);
    setIsEditing(false);
    setVoiceConflict(null);
    setVoiceSpokenText('');
    setStatusMessage(null);
  };

  const startCamera = async () => {
    stopCamera();
    setCameraError(null);
    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        setCameraError('Camera API is not supported on this device. Please choose a photo from the gallery.');
        return;
      }
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: { ideal: facingMode },
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
        audio: false,
      });
      mediaStreamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (err) {
      console.warn('Camera access warning:', err);
      setCameraError('Unable to access camera. Please allow camera permissions or upload from gallery.');
    }
  };

  const stopCamera = () => {
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach((track) => track.stop());
      mediaStreamRef.current = null;
    }
  };

  const toggleCameraFacing = () => {
    setFacingMode((prev) => (prev === 'environment' ? 'user' : 'environment'));
  };

  const handleCapturePhoto = () => {
    if (!videoRef.current || !canvasRef.current) return;
    const video = videoRef.current;
    const canvas = canvasRef.current;
    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 480;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
    setCapturedImage(dataUrl);
    stopCamera();
    processPhoto(dataUrl, 'camera_capture.jpg');
  };

  const handleGalleryUpload = (e) => {
    const file = e.target.files && e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target.result;
      setCapturedImage(dataUrl);
      stopCamera();
      processPhoto(file, file.name);
    };
    reader.readAsDataURL(file);
  };

  const processPhoto = async (fileOrDataUrl, filename) => {
    // Check if network is offline
    if (!navigator.onLine) {
      saveOfflineQueue(fileOrDataUrl, filename);
      setStep('OFFLINE_SAVED');
      return;
    }

    setStep('ANALYZING');
    setAnalyzingMessageIndex(0);

    try {
      const result = await analyzeStockPhoto(fileOrDataUrl, filename);

      if (!result || result.status === 'ERROR') {
        setStep('ERROR');
        setStatusMessage(result?.message || 'Failed to analyze photo.');
        return;
      }

      if (result.status === 'DARK' || result.status === 'BLURRY' || result.status === 'NO_PRODUCT_DETECTED') {
        setAnalysisResult(result);
        setStep('ERROR');
        setStatusMessage(result.message);
        return;
      }

      setAnalysisResult(result);
      const prods = result.products || [];
      if (prods.length > 0) {
        const first = prods[0];
        setEditForm({
          productName: first.productName || '',
          quantity: first.quantity !== null && first.quantity !== undefined ? first.quantity : '',
          unit: first.unit || 'packets',
          category: first.category || 'Dairy',
          purchasePrice: first.purchasePrice || '',
          sellingPrice: first.sellingPrice || '',
          supplier: first.supplier || '',
          barcode: first.barcode || result.barcode || '',
        });

        // Initialize multi-select map
        const initialMap = {};
        prods.forEach((_, idx) => (initialMap[idx] = true));
        setMultiSelectState(initialMap);

        // TTS Read aloud if quantity detected
        const qtyText = first.quantity ? `${first.quantity} ${first.unit}` : 'units';
        const speechMsg = `I found ${first.productName}. Should I add ${qtyText} to your stock?`;
        speakIndianText(speechMsg, currentLanguage || 'en-IN');
      }

      setStep('RESULT');
    } catch (err) {
      console.error('Error during photo analysis:', err);
      setStep('ERROR');
      setStatusMessage('Network error analyzing photo. You can enter details manually.');
    }
  };

  const saveOfflineQueue = (dataUrl, filename) => {
    try {
      const existing = JSON.parse(localStorage.getItem('swaranidhi_offline_scans') || '[]');
      existing.push({
        id: 'OFFLINE_SCAN_' + Date.now(),
        image: dataUrl,
        filename,
        timestamp: new Date().toISOString(),
      });
      localStorage.setItem('swaranidhi_offline_scans', JSON.stringify(existing));
    } catch (e) {
      console.warn('Failed to save offline scan queue:', e);
    }
  };

  // Combine Voice + Photo
  const toggleVoiceInput = () => {
    if (isListeningVoice) {
      if (recognitionRef.current) recognitionRef.current.stop();
      setIsListeningVoice(false);
      return;
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert('Speech Recognition is not supported in this browser.');
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = getSpeechLangCode();
    recognition.continuous = false;
    recognition.interimResults = false;

    recognition.onstart = () => setIsListeningVoice(true);
    recognition.onend = () => setIsListeningVoice(false);
    recognition.onerror = () => setIsListeningVoice(false);

    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      setVoiceSpokenText(transcript);
      handleVoiceWithPhoto(transcript);
    };

    recognitionRef.current = recognition;
    recognition.start();
  };

  const handleVoiceWithPhoto = (spokenText) => {
    const parsed = parseNaturalVoiceCommand(spokenText, currentLanguage || 'auto', allProducts);
    const photoProduct = editForm.productName;
    const voiceProduct = parsed.product;

    // Check for conflict: Photo suggests X, but voice says Y
    if (voiceProduct && photoProduct && !photoProduct.toLowerCase().includes(voiceProduct.toLowerCase()) && !voiceProduct.toLowerCase().includes(photoProduct.toLowerCase())) {
      setVoiceConflict({
        photoProduct,
        voiceProduct,
        voiceQty: parsed.quantity || editForm.quantity,
      });
      return;
    }

    // No conflict: apply voice quantity or action
    if (parsed.quantity) {
      setEditForm((prev) => ({ ...prev, quantity: parsed.quantity }));
    }
    if (parsed.intent === 'SALE') {
      setStockAction('REMOVE_STOCK');
    } else {
      setStockAction('ADD_STOCK');
    }
  };

  const handleResolveConflict = (chosenProduct) => {
    setEditForm((prev) => ({
      ...prev,
      productName: chosenProduct,
      quantity: voiceConflict?.voiceQty || prev.quantity,
    }));
    setVoiceConflict(null);
  };

  // Confirm stock update
  const handleConfirmStock = async () => {
    if (!editForm.quantity || parseInt(editForm.quantity, 10) <= 0) {
      alert('Please enter a valid quantity visible in this photo.');
      setIsEditing(true);
      return;
    }

    setIsSaving(true);
    try {
      const activeProduct = analysisResult?.products?.[selectedProductIndex] || {};
      const payload = {
        scanId: analysisResult?.scanId,
        productId: activeProduct.existingProductId || null,
        productName: editForm.productName,
        quantity: parseInt(editForm.quantity, 10),
        unit: editForm.unit,
        category: editForm.category,
        action: stockAction,
        purchasePrice: parseFloat(editForm.purchasePrice) || 0,
        sellingPrice: parseFloat(editForm.sellingPrice) || 0,
        supplier: editForm.supplier,
        barcode: editForm.barcode,
      };

      const result = await confirmStockScan(payload);

      const actionText = stockAction === 'REMOVE_STOCK' ? 'deducted from' : 'added to';
      const msg = `Done! ${editForm.quantity} ${editForm.unit} of ${editForm.productName} were ${actionText} your stock.`;
      speakIndianText(msg, currentLanguage || 'en-IN');

      if (onStockUpdated) {
        onStockUpdated(result);
      }
      onClose();
    } catch (err) {
      console.error('Error confirming stock scan:', err);
      alert('Failed to update stock. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  // Add multiple detected products
  const handleConfirmMultiple = async () => {
    const prods = analysisResult?.products || [];
    const selected = prods.filter((_, idx) => multiSelectState[idx]);
    if (selected.length === 0) {
      alert('Please select at least one product to add.');
      return;
    }

    setIsSaving(true);
    try {
      for (const prod of selected) {
        await confirmStockScan({
          scanId: analysisResult?.scanId,
          productId: prod.existingProductId || null,
          productName: prod.productName,
          quantity: prod.quantity || 1,
          unit: prod.unit || 'packets',
          category: prod.category || 'General',
          action: 'ADD_STOCK',
        });
      }
      speakIndianText(`Added ${selected.length} products to stock successfully.`, currentLanguage || 'en-IN');
      if (onStockUpdated) onStockUpdated();
      onClose();
    } catch (err) {
      alert('Error updating products: ' + err.message);
    } finally {
      setIsSaving(false);
    }
  };

  const handleRetake = () => {
    resetState();
    startCamera();
  };

  const currentProduct = analysisResult?.products?.[selectedProductIndex];
  const isMultiProduct = (analysisResult?.products?.length || 0) > 1;

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 3,
          overflow: 'hidden',
          bgcolor: 'background.paper',
        },
      }}
    >
      {/* Header */}
      <DialogTitle
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          pb: 1,
          borderBottom: '1px solid',
          borderColor: 'divider',
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <CameraIcon color="primary" />
          <Box>
            <Typography variant="h6" fontWeight="bold">
              Scan Stock
            </Typography>
            <Typography variant="caption" color="text.secondary">
              AI-Powered Camera Inventory Analysis
            </Typography>
          </Box>
        </Box>
        <IconButton onClick={onClose} size="small" aria-label="Close">
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ p: { xs: 2, sm: 3 } }}>
        {/* ================= STEP 1: CAMERA CAPTURE ================= */}
        {step === 'CAPTURE' && (
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2, textAlign: 'center' }}>
              Take a clear photo of your products or stock packaging.
            </Typography>

            {/* Camera Viewfinder */}
            <Box
              sx={{
                position: 'relative',
                width: '100%',
                height: 320,
                bgcolor: '#0f172a',
                borderRadius: 3,
                overflow: 'hidden',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: 3,
              }}
            >
              {cameraError ? (
                <Box sx={{ p: 3, textAlign: 'center', color: '#94a3b8' }}>
                  <WarningIcon sx={{ fontSize: 48, color: '#f59e0b', mb: 1 }} />
                  <Typography variant="body2">{cameraError}</Typography>
                </Box>
              ) : (
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
              )}

              {/* Viewfinder Target Guidelines */}
              <Box
                sx={{
                  position: 'absolute',
                  width: '80%',
                  height: '75%',
                  border: '2px dashed rgba(255,255,255,0.7)',
                  borderRadius: 2,
                  pointerEvents: 'none',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Typography
                  variant="caption"
                  sx={{
                    bgcolor: 'rgba(0,0,0,0.6)',
                    color: '#fff',
                    px: 1.5,
                    py: 0.5,
                    borderRadius: 1,
                  }}
                >
                  Place product inside frame
                </Typography>
              </Box>

              {/* Flip camera toggle button */}
              {!cameraError && (
                <IconButton
                  onClick={toggleCameraFacing}
                  sx={{
                    position: 'absolute',
                    top: 12,
                    right: 12,
                    bgcolor: 'rgba(0,0,0,0.5)',
                    color: '#fff',
                    '&:hover': { bgcolor: 'rgba(0,0,0,0.8)' },
                  }}
                >
                  <FlipCameraIcon />
                </IconButton>
              )}
            </Box>

            <canvas ref={canvasRef} style={{ display: 'none' }} />
            <input
              type="file"
              accept="image/*"
              ref={fileInputRef}
              style={{ display: 'none' }}
              onChange={handleGalleryUpload}
            />

            {/* Helpful photography tips */}
            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', my: 2, justifyContent: 'center' }}>
              <Chip label="Make sure label is visible" size="small" variant="outlined" />
              <Chip label="Avoid dark or blurry photos" size="small" variant="outlined" />
            </Box>

            {/* Action Buttons */}
            <Box sx={{ display: 'flex', gap: 2, width: '100%', mt: 1 }}>
              <Button
                variant="contained"
                size="large"
                fullWidth
                startIcon={<CameraIcon />}
                onClick={handleCapturePhoto}
                disabled={!!cameraError}
                sx={{ py: 1.5, borderRadius: 2, fontWeight: 'bold' }}
              >
                Capture Photo
              </Button>
              <Button
                variant="outlined"
                size="large"
                startIcon={<GalleryIcon />}
                onClick={() => fileInputRef.current && fileInputRef.current.click()}
                sx={{ borderRadius: 2, px: 3 }}
              >
                Gallery
              </Button>
            </Box>
          </Box>
        )}

        {/* ================= STEP 2: ANALYZING ================= */}
        {step === 'ANALYZING' && (
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', py: 5 }}>
            <Box sx={{ position: 'relative', display: 'inline-flex', mb: 3 }}>
              <CircularProgress size={80} thickness={4} />
              <Box
                sx={{
                  top: 0,
                  left: 0,
                  bottom: 0,
                  right: 0,
                  position: 'absolute',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <CameraIcon color="primary" sx={{ fontSize: 36 }} />
              </Box>
            </Box>

            <Typography variant="h6" fontWeight="bold" gutterBottom>
              Analyzing Stock...
            </Typography>

            <Typography
              variant="body1"
              color="primary"
              sx={{ fontWeight: 'medium', minHeight: 28, transition: 'all 0.3s' }}
            >
              {analyzingSteps[analyzingMessageIndex]}
            </Typography>

            <Typography variant="caption" color="text.secondary" sx={{ mt: 1 }}>
              Connecting to Vision & OCR engine...
            </Typography>
          </Box>
        )}

        {/* ================= STEP 3: RESULT & CONFIRMATION ================= */}
        {step === 'RESULT' && analysisResult && (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {/* Captured thumbnail & Confidence Header */}
            <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
              {capturedImage && (
                <Box
                  component="img"
                  src={capturedImage}
                  alt="Scanned Stock"
                  sx={{
                    width: 72,
                    height: 72,
                    borderRadius: 2,
                    objectFit: 'cover',
                    border: '1px solid',
                    borderColor: 'divider',
                  }}
                />
              )}
              <Box sx={{ flex: 1 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
                  <Typography variant="subtitle1" fontWeight="bold">
                    Stock Scan Result
                  </Typography>
                  <Chip
                    label={`${Math.round(analysisResult.confidence * 100)}% Confidence`}
                    color={analysisResult.confidence >= 0.9 ? 'success' : 'warning'}
                    size="small"
                  />
                  {analysisResult.barcode && (
                    <Chip
                      icon={<BarcodeIcon />}
                      label={analysisResult.barcode}
                      size="small"
                      variant="outlined"
                    />
                  )}
                </Box>
                <Typography variant="caption" color="text.secondary">
                  {analysisResult.message}
                </Typography>
              </Box>
            </Box>

            {/* Voice + Photo Conflict Banner */}
            {voiceConflict && (
              <Alert
                severity="warning"
                sx={{ borderRadius: 2 }}
                action={
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    <Button
                      size="small"
                      variant="contained"
                      onClick={() => handleResolveConflict(voiceConflict.photoProduct)}
                    >
                      Use Photo ({voiceConflict.photoProduct})
                    </Button>
                    <Button
                      size="small"
                      variant="outlined"
                      onClick={() => handleResolveConflict(voiceConflict.voiceProduct)}
                    >
                      Use Voice ({voiceConflict.voiceProduct})
                    </Button>
                  </Box>
                }
              >
                Photo suggests <b>{voiceConflict.photoProduct}</b>, but voice says <b>{voiceConflict.voiceProduct}</b>. Which should I use?
              </Alert>
            )}

            {/* Multiple Products List */}
            {isMultiProduct ? (
              <Card variant="outlined" sx={{ borderRadius: 2 }}>
                <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                    <Typography variant="subtitle2" fontWeight="bold">
                      Multiple Products Detected ({analysisResult.products.length})
                    </Typography>
                    <Button
                      size="small"
                      onClick={() => {
                        const allSelected = Object.values(multiSelectState).every(Boolean);
                        const next = {};
                        analysisResult.products.forEach((_, idx) => (next[idx] = !allSelected));
                        setMultiSelectState(next);
                      }}
                    >
                      Select All
                    </Button>
                  </Box>
                  {analysisResult.products.map((p, idx) => (
                    <Box
                      key={idx}
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        py: 0.75,
                        borderBottom: idx < analysisResult.products.length - 1 ? '1px solid #f1f5f9' : 'none',
                      }}
                    >
                      <FormControlLabel
                        control={
                          <Checkbox
                            checked={!!multiSelectState[idx]}
                            onChange={(e) =>
                              setMultiSelectState((prev) => ({ ...prev, [idx]: e.target.checked }))
                            }
                            size="small"
                          />
                        }
                        label={
                          <Box>
                            <Typography variant="body2" fontWeight="medium">
                              {getLocalizedProduct(p.productName, selectedLanguage)}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              Qty: {p.quantity || 'Undetermined'} {getLocalizedUnit(p.unit, selectedLanguage)} • {getLocalizedCategory(p.category, selectedLanguage)}
                            </Typography>
                          </Box>
                        }
                      />
                      <Chip label={`${Math.round(p.confidence * 100)}%`} size="small" />
                    </Box>
                  ))}
                </CardContent>
              </Card>
            ) : (
              /* Single Product Card */
              <Card variant="outlined" sx={{ borderRadius: 2 }}>
                <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Box>
                      <Typography variant="h6" fontWeight="bold" color="text.primary">
                        {getLocalizedProduct(editForm.productName, selectedLanguage) || 'Unknown Product'}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Category: {getLocalizedCategory(editForm.category, selectedLanguage)} • Unit: {getLocalizedUnit(editForm.unit, selectedLanguage)}
                      </Typography>
                    </Box>
                    <IconButton size="small" onClick={() => setIsEditing(!isEditing)} color="primary">
                      <EditIcon fontSize="small" />
                    </IconButton>
                  </Box>

                  {/* Quantity Display or Undetermined Alert */}
                  {editForm.quantity ? (
                    <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 1, my: 1 }}>
                      <Typography variant="body2" color="text.secondary">
                        Detected Quantity:
                      </Typography>
                      <Typography variant="h5" fontWeight="bold" color="primary.main">
                        {editForm.quantity} {getLocalizedUnit(editForm.unit, selectedLanguage)}
                      </Typography>
                    </Box>
                  ) : (
                    <Alert severity="info" sx={{ my: 1, py: 0.5 }}>
                      <Typography variant="body2">
                        <b>Unable to determine quantity.</b> How many units are visible in this photo?
                      </Typography>
                      <TextField
                        size="small"
                        type="number"
                        placeholder="Enter quantity"
                        value={editForm.quantity}
                        onChange={(e) => setEditForm({ ...editForm, quantity: e.target.value })}
                        sx={{ mt: 1, width: 140, bgcolor: 'background.paper' }}
                      />
                    </Alert>
                  )}

                  {/* Match status */}
                  {currentProduct?.matchedExistingProduct && (
                    <Box sx={{ mt: 1, display: 'flex', alignItems: 'center', gap: 0.5 }}>
                      <CheckIcon color="success" fontSize="small" />
                      <Typography variant="caption" color="success.main" fontWeight="bold">
                        Matched existing inventory: {currentProduct.existingProductName} (Stock: {currentProduct.currentStock || 0})
                      </Typography>
                    </Box>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Stock Action Selector */}
            <Box>
              <Typography variant="caption" fontWeight="bold" color="text.secondary" gutterBottom>
                CHOOSE STOCK ACTION
              </Typography>
              <Tabs
                value={stockAction}
                onChange={(_, val) => setStockAction(val)}
                variant="fullWidth"
                sx={{
                  bgcolor: 'action.hover',
                  borderRadius: 2,
                  minHeight: 40,
                  '& .MuiTab-root': { minHeight: 40, py: 0.5, textTransform: 'none', fontWeight: 'bold' },
                }}
              >
                <Tab icon={<AddStockIcon fontSize="small" />} iconPosition="start" label="Add Stock" value="ADD_STOCK" />
                <Tab icon={<RemoveStockIcon fontSize="small" />} iconPosition="start" label="Remove" value="REMOVE_STOCK" />
                <Tab icon={<AdjustStockIcon fontSize="small" />} iconPosition="start" label="Adjust" value="STOCK_ADJUSTMENT" />
              </Tabs>
            </Box>

            {/* Edit Details Drawer */}
            {isEditing && (
              <Box sx={{ p: 2, bgcolor: 'action.hover', borderRadius: 2, display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                <Typography variant="subtitle2" fontWeight="bold">
                  Edit Details Before Confirmation
                </Typography>
                <TextField
                  label="Product Name"
                  size="small"
                  fullWidth
                  value={editForm.productName}
                  onChange={(e) => setEditForm({ ...editForm, productName: e.target.value })}
                />
                <Box sx={{ display: 'flex', gap: 1.5 }}>
                  <TextField
                    label="Quantity"
                    size="small"
                    type="number"
                    value={editForm.quantity}
                    onChange={(e) => setEditForm({ ...editForm, quantity: e.target.value })}
                    sx={{ flex: 1 }}
                  />
                  <TextField
                    label="Unit"
                    size="small"
                    value={editForm.unit}
                    onChange={(e) => setEditForm({ ...editForm, unit: e.target.value })}
                    sx={{ width: 120 }}
                  />
                </Box>
                <Box sx={{ display: 'flex', gap: 1.5 }}>
                  <TextField
                    label="Purchase Price (₹)"
                    size="small"
                    type="number"
                    value={editForm.purchasePrice}
                    onChange={(e) => setEditForm({ ...editForm, purchasePrice: e.target.value })}
                    sx={{ flex: 1 }}
                  />
                  <TextField
                    label="Selling Price (₹)"
                    size="small"
                    type="number"
                    value={editForm.sellingPrice}
                    onChange={(e) => setEditForm({ ...editForm, sellingPrice: e.target.value })}
                    sx={{ flex: 1 }}
                  />
                </Box>
                <TextField
                  label="Supplier"
                  size="small"
                  value={editForm.supplier}
                  onChange={(e) => setEditForm({ ...editForm, supplier: e.target.value })}
                />
              </Box>
            )}

            {/* Combined Voice + Photo Prompt */}
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                p: 1.5,
                bgcolor: isListeningVoice ? 'error.lighter' : 'primary.lighter',
                borderRadius: 2,
                border: '1px solid',
                borderColor: isListeningVoice ? 'error.light' : 'primary.light',
              }}
            >
              <Box>
                <Typography variant="body2" fontWeight="bold">
                  {isListeningVoice ? 'Listening to voice...' : 'Combine Voice + Photo'}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {voiceSpokenText
                    ? `Heard: "${voiceSpokenText}"`
                    : 'Speak: e.g. "Idi Heritage milk, 20 packets unnayi, add cheyyi"'}
                </Typography>
              </Box>
              <IconButton
                color={isListeningVoice ? 'error' : 'primary'}
                onClick={toggleVoiceInput}
                sx={{ bgcolor: 'background.paper', boxShadow: 1 }}
              >
                {isListeningVoice ? <MicOffIcon /> : <MicIcon />}
              </IconButton>
            </Box>

            {/* Developer Mode Debug View */}
            {developerMode && (
              <Accordion sx={{ borderRadius: 2, '&:before': { display: 'none' }, bgcolor: '#1e293b', color: '#f8fafc' }}>
                <AccordionSummary expandIcon={<ExpandMoreIcon sx={{ color: '#94a3b8' }} />}>
                  <Typography variant="caption" sx={{ fontFamily: 'monospace' }}>
                    🛠 Developer / Debug Info ({analysisResult.analysisProvider})
                  </Typography>
                </AccordionSummary>
                <AccordionDetails sx={{ pt: 0 }}>
                  <Typography variant="caption" component="pre" sx={{ fontFamily: 'monospace', whiteSpace: 'pre-wrap' }}>
                    {JSON.stringify(
                      {
                        provider: analysisResult.analysisProvider,
                        confidence: analysisResult.confidence,
                        processingTimeMs: analysisResult.processingTimeMs,
                        ocrText: analysisResult.ocrText,
                        barcode: analysisResult.barcode,
                        matchedProducts: analysisResult.products,
                      },
                      null,
                      2
                    )}
                  </Typography>
                </AccordionDetails>
              </Accordion>
            )}
          </Box>
        )}

        {/* ================= STEP 4: ERROR / RETAKE ================= */}
        {step === 'ERROR' && (
          <Box sx={{ textAlign: 'center', py: 4 }}>
            <WarningIcon sx={{ fontSize: 56, color: '#f59e0b', mb: 2 }} />
            <Typography variant="h6" fontWeight="bold" gutterBottom>
              Could Not Identify Product
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3, maxWidth: 360, mx: 'auto' }}>
              {statusMessage || "I couldn't find a recognizable product in this photo."}
            </Typography>
            <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center' }}>
              <Button variant="contained" startIcon={<RetakeIcon />} onClick={handleRetake}>
                Retake Photo
              </Button>
              <Button
                variant="outlined"
                onClick={() => {
                  setEditForm({
                    productName: '',
                    quantity: 1,
                    unit: 'packets',
                    category: 'General',
                    purchasePrice: '',
                    sellingPrice: '',
                    supplier: '',
                    barcode: '',
                  });
                  setStep('RESULT');
                  setIsEditing(true);
                }}
              >
                Enter Manually
              </Button>
            </Box>
          </Box>
        )}

        {/* ================= STEP 5: OFFLINE QUEUE SAVED ================= */}
        {step === 'OFFLINE_SAVED' && (
          <Box sx={{ textAlign: 'center', py: 4 }}>
            <OfflineIcon sx={{ fontSize: 56, color: '#0284c7', mb: 2 }} />
            <Typography variant="h6" fontWeight="bold" gutterBottom>
              📡 Saved Locally (Offline)
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              You're currently offline. The photo has been saved to your local queue and will be automatically analyzed when internet connection returns.
            </Typography>
            <Button variant="contained" onClick={onClose}>
              Done
            </Button>
          </Box>
        )}
      </DialogContent>

      {/* Footer Actions */}
      <DialogActions sx={{ p: 2, borderTop: '1px solid', borderColor: 'divider' }}>
        {step === 'RESULT' && (
          <>
            <Button onClick={handleRetake} color="inherit">
              Retake
            </Button>
            <Button onClick={onClose} color="inherit">
              Cancel
            </Button>
            {isMultiProduct ? (
              <Button
                variant="contained"
                onClick={handleConfirmMultiple}
                disabled={isSaving}
                sx={{ borderRadius: 2, px: 3, fontWeight: 'bold' }}
              >
                {isSaving ? <CircularProgress size={24} /> : 'Add Selected to Stock'}
              </Button>
            ) : (
              <Button
                variant="contained"
                onClick={handleConfirmStock}
                disabled={isSaving}
                sx={{ borderRadius: 2, px: 3, fontWeight: 'bold' }}
              >
                {isSaving ? (
                  <CircularProgress size={24} />
                ) : (
                  `+ ${stockAction === 'REMOVE_STOCK' ? 'Remove' : 'Add'} ${editForm.quantity || 1} to Stock`
                )}
              </Button>
            )}
          </>
        )}

        {step === 'CAPTURE' && (
          <Button onClick={onClose} color="inherit">
            Cancel
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
}
