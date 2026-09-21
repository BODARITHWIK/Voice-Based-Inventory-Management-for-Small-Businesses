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
import { generateFriendlyResponse } from './services/languageService';
import { LanguageProvider, useLanguage } from './context/LanguageContext';
import { SimpleModeProvider, useSimpleMode } from './context/SimpleModeContext';
import { AuthProvider } from './context/AuthContext';

function MainAppContent() {
  const { t, getSpeechLangCode, effectiveLang } = useLanguage();
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
    const currentLang = parsedData.language || effectiveLang || 'en';

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
          replyMsg = generateFriendlyResponse('CHECK_STOCK', { product: `${found.name} (${found.stock} ${found.unit})` }, currentLang);
        } else {
          replyMsg = `Couldn't find ${parsedData.product || 'item'} in your stock.`;
        }

        showToast(replyMsg, 'info');
        if (ttsEnabled) {
          speechService.speak(replyMsg, currentLang);
        }
      } catch (e) {
        showToast('Checking stock...', 'info');
      }
      return;
    }

    // 2. LOW_STOCK / OUT_OF_STOCK: Navigate and announce
    if (parsedData.intent === 'LOW_STOCK' || parsedData.intent === 'OUT_OF_STOCK') {
      const msg = generateFriendlyResponse('LOW_STOCK', {}, currentLang);

      showToast(msg, 'warning');
      if (ttsEnabled) {
        speechService.speak(msg, currentLang);
      }
      return;
    }

    // 3. TODAY_SUMMARY / SALES_REPORT: Announce sales total (Section 27)
    if (parsedData.intent === 'TODAY_SUMMARY' || parsedData.intent === 'SALES_REPORT') {
      const msg = generateFriendlyResponse('TODAY_SUMMARY', {}, currentLang);

      showToast(msg, 'success');
      if (ttsEnabled) {
        speechService.speak(msg, currentLang);
      }
      return;
    }

    // 4. CUSTOMER_KHATA: Open customer khata
    if (parsedData.intent === 'CUSTOMER_KHATA') {
      const cust = parsedData.customer || 'Customer';
      const msg = generateFriendlyResponse('CUSTOMER_KHATA', { customer: cust }, currentLang);
      showToast(msg, 'info');
      if (ttsEnabled) {
        speechService.speak(msg, currentLang);
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
      const currentLang = cmdLang || effectiveLang || 'en';
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

        toastText = t('toast.stockAdded', { qty, unit: u, item: product });
        spokenText = toastText.replace(/[^\w\s\u0900-\u0D7F₹]/gi, '').trim();
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
          toastText = t('toast.khataUpdated', { amount: saleAmount, customer: customer || 'Customer' });
          spokenText = toastText.replace(/[^\w\s\u0900-\u0D7F₹]/gi, '').trim();
        } else {
          toastText = t('toast.saleCompleted');
          spokenText = toastText.replace(/[^\w\s\u0900-\u0D7F₹]/gi, '').trim();
        }
      } else if (intent === 'KHATA_CREDIT') {
        toastText = t('toast.khataUpdated', { amount: amount || 500, customer: customer || 'Customer' });
        spokenText = toastText.replace(/[^\w\s\u0900-\u0D7F₹]/gi, '').trim();
      } else if (intent === 'REMOVE_STOCK') {
        toastText = t('toast.itemRemoved');
        spokenText = toastText.replace(/[^\w\s\u0900-\u0D7F₹]/gi, '').trim();
      } else {
        toastText = `✅ ${product}`;
        spokenText = product;
      }

      showToast(toastText, 'success');
      if (ttsEnabled && spokenText) {
        speechService.speak(spokenText, currentLang);
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
