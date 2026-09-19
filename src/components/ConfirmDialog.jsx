import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  Divider,
  Chip,
  Alert,
  Stack,
  TextField,
  InputAdornment,
} from '@mui/material';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import RecordVoiceOverIcon from '@mui/icons-material/RecordVoiceOver';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import EditIcon from '@mui/icons-material/Edit';
import PriorityHighIcon from '@mui/icons-material/PriorityHigh';
import HelpOutlinedIcon from '@mui/icons-material/HelpOutlined';
import { useLanguage } from '../context/LanguageContext';
import { useSimpleMode } from '../context/SimpleModeContext';

const ConfirmDialog = ({
  open,
  onClose,
  onConfirm,
  title = '',
  type = 'voice', // 'voice' | 'destructive' | 'standard'
  voiceData = null, // { rawText, action, product, quantity, unit, customer, amount, paymentMethod, confidence, confidenceTier, message, response }
  destructiveMessage = '',
  confirmText = '',
  cancelText = '',
}) => {
  const { t } = useLanguage();
  const { simpleMode } = useSimpleMode();

  // Inline editing state for [✎ Change] button
  const [isEditing, setIsEditing] = useState(false);
  const [editedProduct, setEditedProduct] = useState('');
  const [editedQuantity, setEditedQuantity] = useState('');
  const [editedUnit, setEditedUnit] = useState('packets');
  const [editedCustomer, setEditedCustomer] = useState('');

  useEffect(() => {
    if (voiceData) {
      setEditedProduct(voiceData.product || '');
      setEditedQuantity(voiceData.quantity !== undefined ? String(voiceData.quantity) : '1');
      setEditedUnit(voiceData.unit || 'packets');
      setEditedCustomer(voiceData.customer || '');
    }
    setIsEditing(false);
  }, [voiceData, open]);

  const isDestructive = type === 'destructive';
  const isVoice = type === 'voice';
  const isMediumConfidence = voiceData?.confidenceTier === 'medium';
  const isHighValue = voiceData?.amount && voiceData.amount >= 10000;

  const handleConfirmAction = () => {
    if (isEditing && voiceData) {
      onConfirm({
        ...voiceData,
        product: editedProduct,
        quantity: parseInt(editedQuantity, 10) || voiceData.quantity,
        unit: editedUnit,
        customer: editedCustomer || voiceData.customer,
      });
    } else {
      onConfirm(voiceData);
    }
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="xs"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 3.5,
          p: 1,
          border: isHighValue
            ? '2px solid #f59e0b'
            : isDestructive
            ? '1.5px solid #fee2e2'
            : '1.5px solid #a7f3d0',
          boxShadow: '0 12px 36px rgba(0,0,0,0.12)',
        },
      }}
    >
      <DialogTitle sx={{ pb: 1, pt: 2 }}>
        <Stack direction="row" alignItems="center" spacing={1.5}>
          {isVoice ? (
            <Box
              sx={{
                width: 44,
                height: 44,
                borderRadius: 2.5,
                backgroundColor: isMediumConfidence ? '#fffbeb' : '#ecfdf5',
                color: isMediumConfidence ? '#d97706' : '#059669',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                border: `1px solid ${isMediumConfidence ? '#fde68a' : '#a7f3d0'}`,
              }}
            >
              {isMediumConfidence ? <HelpOutlinedIcon /> : <RecordVoiceOverIcon />}
            </Box>
          ) : isDestructive ? (
            <Box
              sx={{
                width: 44,
                height: 44,
                borderRadius: 2.5,
                backgroundColor: '#fee2e2',
                color: '#dc2626',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <WarningAmberIcon />
            </Box>
          ) : (
            <Box
              sx={{
                width: 44,
                height: 44,
                borderRadius: 2.5,
                backgroundColor: '#eff6ff',
                color: '#2563eb',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <CheckCircleIcon />
            </Box>
          )}

          <Box>
            <Typography
              variant="h6"
              sx={{
                fontWeight: 800,
                color: '#0f172a',
                fontSize: simpleMode ? '1.3rem' : '1.15rem',
              }}
            >
              {isMediumConfidence
                ? 'Confirm Interpretation'
                : isVoice
                ? 'I understood:'
                : isDestructive
                ? 'Delete Confirmation'
                : title || 'Confirmation'}
            </Typography>
            <Typography variant="caption" sx={{ color: '#64748b' }}>
              Swaranidhi Digital Assistant
            </Typography>
          </Box>
        </Stack>
      </DialogTitle>

      <DialogContent sx={{ py: 2 }}>
        {/* Medium Confidence Caution Message (Section 21 & 22) */}
        {isMediumConfidence && (
          <Alert severity="info" sx={{ mb: 2, borderRadius: 2.5 }}>
            I think you mean: <strong>{voiceData.action || 'Update'} {voiceData.quantity || ''} {voiceData.product}</strong>. Is that correct?
          </Alert>
        )}

        {/* High-value transaction caution */}
        {isHighValue && (
          <Alert severity="warning" sx={{ mb: 2, border: '1px solid #fde68a' }} icon={<PriorityHighIcon />}>
            High value amount: ₹{voiceData.amount}. Please verify details carefully.
          </Alert>
        )}

        {/* SECTION 16: FRIENDLY UNDERSTANDING CONFIRMATION FORMAT */}
        {/*
          📦 Item: Maggi
          🔢 Quantity: 20 packets
          📋 Action: Add Stock
          Is this correct?
        */}
        {isVoice && voiceData && (
          <Box>
            {!isEditing ? (
              <Box
                sx={{
                  backgroundColor: '#f8fafc',
                  borderRadius: 3,
                  p: 2.5,
                  border: '1.5px solid #e2e8f0',
                  boxShadow: 'inset 0 1px 2px rgba(0,0,0,0.02)',
                }}
              >
                <Stack spacing={1.75}>
                  {/* 📋 Action */}
                  <Stack direction="row" justifyContent="space-between" alignItems="center">
                    <Typography variant="body1" sx={{ color: '#475569', fontWeight: 600, fontSize: '0.95rem' }}>
                      📋 Action:
                    </Typography>
                    <Chip
                      size="small"
                      label={voiceData.action || 'Update Stock'}
                      sx={{
                        fontWeight: 800,
                        backgroundColor: '#ecfdf5',
                        color: '#065f46',
                        border: '1px solid #a7f3d0',
                        fontSize: simpleMode ? '0.9rem' : '0.82rem',
                        px: 0.5,
                      }}
                    />
                  </Stack>

                  <Divider sx={{ borderStyle: 'dashed' }} />

                  {/* 📦 Item */}
                  {voiceData.product && (
                    <Stack direction="row" justifyContent="space-between" alignItems="center">
                      <Typography variant="body1" sx={{ color: '#475569', fontWeight: 600, fontSize: '0.95rem' }}>
                        📦 Item:
                      </Typography>
                      <Typography
                        variant="body1"
                        sx={{
                          fontWeight: 800,
                          color: '#0f172a',
                          fontSize: simpleMode ? '1.15rem' : '1.05rem',
                        }}
                      >
                        {voiceData.product}
                      </Typography>
                    </Stack>
                  )}

                  {/* 🔢 Quantity */}
                  {voiceData.quantity !== undefined && (
                    <>
                      <Divider sx={{ borderStyle: 'dashed' }} />
                      <Stack direction="row" justifyContent="space-between" alignItems="center">
                        <Typography variant="body1" sx={{ color: '#475569', fontWeight: 600, fontSize: '0.95rem' }}>
                          🔢 Quantity:
                        </Typography>
                        <Typography
                          variant="body1"
                          sx={{
                            fontWeight: 800,
                            color: '#059669',
                            fontSize: simpleMode ? '1.15rem' : '1.05rem',
                          }}
                        >
                          {voiceData.quantity} {voiceData.unit || 'packets'}
                        </Typography>
                      </Stack>
                    </>
                  )}

                  {/* 👤 Customer (if applicable) */}
                  {voiceData.customer && (
                    <>
                      <Divider sx={{ borderStyle: 'dashed' }} />
                      <Stack direction="row" justifyContent="space-between" alignItems="center">
                        <Typography variant="body1" sx={{ color: '#475569', fontWeight: 600, fontSize: '0.95rem' }}>
                          👤 Customer:
                        </Typography>
                        <Typography variant="body1" sx={{ fontWeight: 800, color: '#2563eb' }}>
                          {voiceData.customer}
                        </Typography>
                      </Stack>
                    </>
                  )}

                  {/* 💳 Payment / Amount (if applicable) */}
                  {voiceData.amount !== undefined && (
                    <>
                      <Divider sx={{ borderStyle: 'dashed' }} />
                      <Stack direction="row" justifyContent="space-between" alignItems="center">
                        <Typography variant="body1" sx={{ color: '#475569', fontWeight: 600, fontSize: '0.95rem' }}>
                          💰 Amount:
                        </Typography>
                        <Typography variant="body1" sx={{ fontWeight: 800, color: '#059669' }}>
                          ₹{voiceData.amount}
                        </Typography>
                      </Stack>
                    </>
                  )}

                  {voiceData.paymentMethod && (
                    <>
                      <Divider sx={{ borderStyle: 'dashed' }} />
                      <Stack direction="row" justifyContent="space-between" alignItems="center">
                        <Typography variant="body1" sx={{ color: '#475569', fontWeight: 600, fontSize: '0.95rem' }}>
                          💳 Payment:
                        </Typography>
                        <Chip
                          size="small"
                          label={voiceData.paymentMethod}
                          sx={{
                            fontWeight: 700,
                            backgroundColor: voiceData.paymentMethod === 'Credit' ? '#fffbeb' : '#ecfdf5',
                            color: voiceData.paymentMethod === 'Credit' ? '#b45309' : '#065f46',
                          }}
                        />
                      </Stack>
                    </>
                  )}
                </Stack>
              </Box>
            ) : (
              /* Inline Edit Mode when [✎ Change] is pressed */
              <Box sx={{ p: 1 }}>
                <Typography variant="caption" sx={{ color: '#64748b', fontWeight: 700, mb: 1, display: 'block' }}>
                  Adjust details:
                </Typography>
                <Stack spacing={2}>
                  <TextField
                    label="Item Name"
                    size="small"
                    fullWidth
                    value={editedProduct}
                    onChange={(e) => setEditedProduct(e.target.value)}
                  />
                  <Stack direction="row" spacing={1.5}>
                    <TextField
                      label="Quantity"
                      type="number"
                      size="small"
                      sx={{ width: 120 }}
                      value={editedQuantity}
                      onChange={(e) => setEditedQuantity(e.target.value)}
                    />
                    <TextField
                      label="Unit"
                      size="small"
                      fullWidth
                      value={editedUnit}
                      onChange={(e) => setEditedUnit(e.target.value)}
                    />
                  </Stack>
                  {voiceData.customer && (
                    <TextField
                      label="Customer Name"
                      size="small"
                      fullWidth
                      value={editedCustomer}
                      onChange={(e) => setEditedCustomer(e.target.value)}
                    />
                  )}
                </Stack>
              </Box>
            )}

            {/* Prompt text */}
            <Typography
              variant="body1"
              sx={{
                fontWeight: 700,
                color: '#0f172a',
                textAlign: 'center',
                mt: 2.5,
                fontSize: simpleMode ? '1.15rem' : '1rem',
              }}
            >
              Is this correct?
            </Typography>

            {/* Friendly localized speech response preview */}
            {voiceData.response && (
              <Typography
                variant="caption"
                sx={{
                  color: '#059669',
                  display: 'block',
                  textAlign: 'center',
                  fontStyle: 'italic',
                  mt: 0.5,
                }}
              >
                "{voiceData.response}"
              </Typography>
            )}
          </Box>
        )}

        {/* Destructive message fallback */}
        {isDestructive && (
          <Box>
            <Typography variant="body1" sx={{ color: '#334155', mb: 2 }}>
              {destructiveMessage || t('confirm.destructivePrompt')}
            </Typography>
            <Alert severity="error" sx={{ backgroundColor: '#fef2f2', border: '1px solid #fecaca' }}>
              Confirming will permanently remove this item from your records.
            </Alert>
          </Box>
        )}
      </DialogContent>

      {/* SECTION 16: BUTTONS [✓ Yes, Continue] [✎ Change] [Cancel] */}
      <DialogActions sx={{ px: 2.5, pb: 2.5, gap: 1, justifyContent: 'space-between' }}>
        <Button
          onClick={onClose}
          variant="outlined"
          sx={{
            color: '#64748b',
            borderColor: '#cbd5e1',
            fontWeight: 700,
            py: simpleMode ? 1.2 : 0.8,
            px: 2,
            fontSize: simpleMode ? '0.98rem' : '0.88rem',
            borderRadius: 2.5,
          }}
        >
          {cancelText || 'Cancel'}
        </Button>

        <Stack direction="row" spacing={1}>
          {isVoice && (
            <Button
              onClick={() => setIsEditing(!isEditing)}
              variant="outlined"
              color="inherit"
              startIcon={<EditIcon sx={{ fontSize: 16 }} />}
              sx={{
                color: '#475569',
                borderColor: '#cbd5e1',
                fontWeight: 700,
                py: simpleMode ? 1.2 : 0.8,
                px: 1.8,
                fontSize: simpleMode ? '0.98rem' : '0.88rem',
                borderRadius: 2.5,
              }}
            >
              {isEditing ? 'Done' : '✎ Change'}
            </Button>
          )}

          <Button
            onClick={handleConfirmAction}
            variant="contained"
            color={isDestructive ? 'error' : 'primary'}
            sx={{
              fontWeight: 800,
              py: simpleMode ? 1.2 : 0.8,
              px: simpleMode ? 2.5 : 2.2,
              fontSize: simpleMode ? '1.02rem' : '0.9rem',
              borderRadius: 2.5,
              backgroundColor: isDestructive ? '#dc2626' : '#059669',
              '&:hover': {
                backgroundColor: isDestructive ? '#b91c1c' : '#047857',
              },
            }}
          >
            {confirmText || '✓ Yes, Continue'}
          </Button>
        </Stack>
      </DialogActions>
    </Dialog>
  );
};

export default ConfirmDialog;
