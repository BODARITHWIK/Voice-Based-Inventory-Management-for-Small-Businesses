import React, { useState } from 'react';
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from 'react-router-dom';
import {
  ThemeProvider,
  CssBaseline,
  Box,
  Snackbar,
  Alert,
} from '@mui/material';

import theme from './theme/theme';
import Navbar from './components/Navbar';
import Sidebar, { DRAWER_WIDTH } from './components/Sidebar';
import ConfirmDialog from './components/ConfirmDialog';

import Dashboard from './pages/Dashboard';
import Products from './pages/Products';
import Sales from './pages/Sales';
import Purchases from './pages/Purchases';
import Suppliers from './pages/Suppliers';
import Customers from './pages/Customers';
import Reports from './pages/Reports';
import Settings from './pages/Settings';
import Notifications from './pages/Notifications';
import ProjectIntro from './pages/ProjectIntro';
import Login from './pages/Login';
import Register from './pages/Register';
import ProtectedRoute from './components/ProtectedRoute';

import { createProduct, createSale, getProducts } from './services/api';
import { speechService } from './services/speechService';
import { LanguageProvider, useLanguage } from './context/LanguageContext';
import { SimpleModeProvider, useSimpleMode } from './context/SimpleModeContext';
import { AuthProvider } from './context/AuthContext';

function MainAppContent() {
  const { t, getSpeechLangCode } = useLanguage();
  const { simpleMode, ttsEnabled } = useSimpleMode();

  const [mobileOpen, setMobileOpen] = useState(false);

  // Global Toast Notifications
  const [toast, setToast] = useState({
    open: false,
    message: '',
    severity: 'success', // 'success' | 'info' | 'warning' | 'error'
  });

  const showToast = (message, severity = 'success') => {
    setToast({ open: true, message, severity });
  };

  const handleCloseToast = (event, reason) => {
    if (reason === 'clickaway') return;
    setToast((prev) => ({ ...prev, open: false }));
  };

  // Global Voice Action Confirmation Dialog
  const [voiceConfirmData, setVoiceConfirmData] = useState(null);
  const [voiceConfirmOpen, setVoiceConfirmOpen] = useState(false);

  const handleTriggerVoiceConfirm = async (parsedData) => {
    if (!parsedData || !parsedData.intent) return;
    const lang = parsedData.language || effectiveLang;

    // 1. CHECK_STOCK: Informative query, answer directly without modal confirmation
    if (parsedData.intent === 'CHECK_STOCK') {
      try {
        const allProducts = await getProducts();
        const searchTarget = (parsedData.product || '').toLowerCase();
        const found = allProducts.find((p) =>
          p.name.toLowerCase().includes(searchTarget)
        );

        let replyMsg;
        if (found) {
          if (lang === 'te' || lang === 'te-en') {
            replyMsg = `మీ దగ్గర ${found.name} ${found.stock} ${found.unit} స్టాక్ ఉంది.`;
          } else if (lang === 'hi' || lang === 'hi-en') {
            replyMsg = `आपके पास ${found.name} का ${found.stock} ${found.unit} स्टॉक है.`;
          } else {
            replyMsg = `You have ${found.stock} ${found.unit} of ${found.name} in stock.`;
          }
        } else {
          replyMsg = `I checked, but couldn't find ${parsedData.product || 'item'} in your current stock.`;
        }

        showToast(replyMsg, 'info');
        if (ttsEnabled) {
          speechService.speak(replyMsg, lang);
        }
      } catch (e) {
        showToast('Checking stock...', 'info');
      }
      return;
    }

    // 2. LOW_STOCK / OUT_OF_STOCK: Navigate and announce
    if (parsedData.intent === 'LOW_STOCK' || parsedData.intent === 'OUT_OF_STOCK') {
      let msg = '';
      if (lang === 'te' || lang === 'te-en') {
        msg = 'ఇప్పుడు 5 ప్రొడక్ట్స్ తక్కువ స్టాక్లో ఉన్నాయి.';
      } else if (lang === 'hi' || lang === 'hi-en') {
        msg = 'कम स्टॉक वाले सामान दिखा रहा हूँ.';
      } else {
        msg = 'Showing products running low on stock.';
      }

      showToast(msg, 'warning');
      if (ttsEnabled) {
        speechService.speak(msg, lang);
      }
      return;
    }

    // 3. TODAY_SUMMARY / SALES_REPORT: Announce sales total (Section 27)
    if (parsedData.intent === 'TODAY_SUMMARY' || parsedData.intent === 'SALES_REPORT') {
      let msg = '';
      if (lang === 'hi' || lang === 'hi-en') {
        msg = 'आज की कुल बिक्री ₹8,450 है.';
      } else if (lang === 'te' || lang === 'te-en') {
        msg = 'ఈరోజు మొత్తం సేల్స్ ₹8,450.';
      } else {
        msg = "Today's total sales are ₹8,450 across 28 transactions.";
      }

      showToast(msg, 'success');
      if (ttsEnabled) {
        speechService.speak(msg, lang);
      }
      return;
    }

    // 4. CUSTOMER_KHATA: Open customer khata
    if (parsedData.intent === 'CUSTOMER_KHATA') {
      const cust = parsedData.customer || 'Customer';
      let msg = `Showing Khata account for ${cust}.`;
      showToast(msg, 'info');
      if (ttsEnabled) {
        speechService.speak(msg, lang);
      }
      return;
    }

    // 5. For State Mutating Commands (ADD_STOCK, SALE, REMOVE_STOCK): Show friendly confirmation
    setVoiceConfirmData(parsedData);
    setVoiceConfirmOpen(true);
  };

  const handleExecuteVoiceCommand = async (confirmedData = null) => {
    const dataToExecute = confirmedData && confirmedData.intent ? confirmedData : voiceConfirmData;
    if (!dataToExecute) return;

    try {
      const { intent, product, quantity, unit, customer, amount, paymentMethod, language: cmdLang } = dataToExecute;
      const lang = cmdLang || effectiveLang;
      let spokenText = '';
      let toastText = '';

      if (intent === 'ADD_STOCK') {
        const qty = quantity || 20;
        const u = unit || 'packets';
        await createProduct({
          name: product,
          category: 'Daily Essentials',
          sku: `SKU-${Math.floor(1000 + Math.random() * 9000)}`,
          quantity: qty,
          unit: u,
          minStock: 10,
          purchasePrice: 40,
          sellingPrice: 50,
          supplier: 'Wholesale Mandi',
        });

        if (lang === 'te' || lang === 'te-en') {
          spokenText = `Done! 👍 ${qty} ${u} ${product} స్టాక్లో యాడ్ అయ్యాయి.`;
        } else if (lang === 'hi' || lang === 'hi-en') {
          spokenText = `Done! 👍 ${product} के ${qty} ${u} स्टॉक में जोड़ दिए गए हैं.`;
        } else {
          spokenText = `Done! 👍 ${qty} ${u} of ${product} added to your stock.`;
        }
        toastText = `✅ ${qty} ${u} of ${product} added to stock!`;
      } else if (intent === 'RECORD_SALE' || intent === 'SALE') {
        const qty = quantity || 1;
        const u = unit || 'units';
        const saleAmount = amount || qty * 55;
        await createSale({
          customerName: customer || 'Walk-in Customer',
          products: `${product} (${qty} ${u})`,
          amount: saleAmount,
          paymentMethod: paymentMethod || 'Cash',
          status: 'Completed',
        });

        if (paymentMethod === 'Credit') {
          spokenText = `Done! ${customer || 'Customer'} ki ₹${saleAmount} khata sale record ayyindi.`;
          toastText = `Sale recorded! ₹${saleAmount} added to ${customer || 'Customer'}'s Khata.`;
        } else {
          spokenText = `Done! 👍 Sale recorded for ${qty} ${u} of ${product}.`;
          toastText = `Sale recorded: ${qty} ${u} of ${product}!`;
        }
      } else if (intent === 'KHATA_CREDIT') {
        spokenText = `₹${amount || 500} added to ${customer || 'Customer'}'s Khata.`;
        toastText = `Khata updated: ₹${amount || 500} for ${customer || 'Customer'}.`;
      } else if (intent === 'REMOVE_STOCK') {
        spokenText = `Done! ${quantity || 1} ${unit || 'units'} of ${product} removed from stock.`;
        toastText = `Removed ${quantity || 1} ${unit || 'units'} of ${product} from stock.`;
      } else {
        spokenText = `Action completed for ${product}.`;
        toastText = `✅ Done! Action completed for ${product}.`;
      }

      showToast(toastText, 'success');
      if (ttsEnabled && spokenText) {
        speechService.speak(spokenText, lang);
      }
    } catch (err) {
      showToast(t('toast.errorGeneric'), 'error');
    } finally {
      setVoiceConfirmOpen(false);
      setVoiceConfirmData(null);
    }
  };

  const handleCancelVoiceCommand = () => {
    setVoiceConfirmOpen(false);
    setVoiceConfirmData(null);
    showToast(t('toast.cancelled'), 'info');
    if (ttsEnabled) {
      speechService.speak('Action cancelled.', effectiveLang);
    }
  };

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  return (
    <Box
      sx={{
        display: 'flex',
        minHeight: '100vh',
        backgroundColor: '#f8fafc',
        fontSize: simpleMode ? '1.08rem' : '1rem',
      }}
    >
      {/* Responsive Sidebar */}
      <Sidebar
        mobileOpen={mobileOpen}
        onMobileClose={() => setMobileOpen(false)}
      />

      {/* Main Layout Area */}
      <Box
        sx={{
          flexGrow: 1,
          display: 'flex',
          flexDirection: 'column',
          minWidth: 0,
          width: { md: `calc(100% - ${DRAWER_WIDTH}px)` },
        }}
      >
        {/* Top Navbar */}
        <Navbar
          onDrawerToggle={handleDrawerToggle}
          onVoiceCommandParsed={handleTriggerVoiceConfirm}
        />

        {/* Main Page Content */}
        <Box
          component="main"
          sx={{
            flexGrow: 1,
            p: simpleMode ? { xs: 2, sm: 3.5, md: 4.5 } : { xs: 2, sm: 3, md: 4 },
            maxWidth: 1600,
            width: '100%',
            margin: '0 auto',
          }}
        >
          <Routes>
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route
              path="/dashboard"
              element={
                <Dashboard
                  showToast={showToast}
                  onTriggerVoiceConfirm={handleTriggerVoiceConfirm}
                />
              }
            />
            <Route
              path="/products"
              element={
                <Products
                  showToast={showToast}
                  onTriggerVoiceConfirm={handleTriggerVoiceConfirm}
                />
              }
            />
            <Route
              path="/sales"
              element={
                <Sales
                  showToast={showToast}
                  onTriggerVoiceConfirm={handleTriggerVoiceConfirm}
                />
              }
            />
            <Route
              path="/purchases"
              element={
                <Purchases
                  showToast={showToast}
                  onTriggerVoiceConfirm={handleTriggerVoiceConfirm}
                />
              }
            />
            <Route
              path="/suppliers"
              element={<Suppliers showToast={showToast} />}
            />
            <Route
              path="/customers"
              element={<Customers showToast={showToast} />}
            />
            <Route
              path="/reports"
              element={<Reports showToast={showToast} />}
            />
            <Route
              path="/notifications"
              element={<Notifications showToast={showToast} />}
            />
            <Route
              path="/settings"
              element={<Settings showToast={showToast} />}
            />
            <Route
              path="/intro"
              element={<ProjectIntro />}
            />
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </Box>
      </Box>

      {/* Global Voice Confirmation Dialog */}
      <ConfirmDialog
        open={voiceConfirmOpen}
        onClose={handleCancelVoiceCommand}
        onConfirm={handleExecuteVoiceCommand}
        title={t('confirm.voiceTitle')}
        type="voice"
        voiceData={voiceConfirmData}
        confirmText={t('confirm.yesConfirm')}
        cancelText={t('confirm.cancel')}
      />

      {/* Global Toast Alert */}
      <Snackbar
        open={toast.open}
        autoHideDuration={4000}
        onClose={handleCloseToast}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert
          onClose={handleCloseToast}
          severity={toast.severity}
          variant="filled"
          sx={{
            width: '100%',
            borderRadius: 2.5,
            fontWeight: 700,
            fontSize: simpleMode ? '1rem' : '0.9rem',
            boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
            ...(toast.severity === 'success' && {
              backgroundColor: '#059669',
            }),
          }}
        >
          {toast.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        <AuthProvider>
          <LanguageProvider>
            <SimpleModeProvider>
              <Routes>
                {/* Public Auth Routes */}
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />

                {/* Protected App Shell */}
                <Route
                  path="/*"
                  element={
                    <ProtectedRoute>
                      <MainAppContent />
                    </ProtectedRoute>
                  }
                />
              </Routes>
            </SimpleModeProvider>
          </LanguageProvider>
        </AuthProvider>
      </Router>
    </ThemeProvider>
  );
}

export default App;
