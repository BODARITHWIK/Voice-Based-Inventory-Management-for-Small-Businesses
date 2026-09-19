import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Tabs,
  Tab,
  TextField,
  Grid,
  Button,
  Switch,
  FormControlLabel,
  Divider,
  Stack,
  Slider,
  MenuItem,
  Alert,
  List,
  ListItem,
  ListItemText,
  Chip,
} from '@mui/material';
import PersonIcon from '@mui/icons-material/Person';
import StoreIcon from '@mui/icons-material/Store';
import InventoryIcon from '@mui/icons-material/Inventory';
import MicIcon from '@mui/icons-material/Mic';
import NotificationsIcon from '@mui/icons-material/Notifications';
import SecurityIcon from '@mui/icons-material/Security';
import PaletteIcon from '@mui/icons-material/Palette';
import CloudSyncIcon from '@mui/icons-material/CloudSync';
import TextFieldsIcon from '@mui/icons-material/TextFields';
import VolumeUpIcon from '@mui/icons-material/VolumeUp';

import PageHeader from '../components/PageHeader';
import VoiceButton from '../components/VoiceButton';
import { useLanguage } from '../context/LanguageContext';
import { useSimpleMode } from '../context/SimpleModeContext';

const Settings = ({ showToast }) => {
  const {
    t,
    uiLanguage,
    setUiLanguage,
    inputLanguage,
    setInputLanguage,
    responseLanguage,
    setResponseLanguage,
    voiceResponseEnabled,
    toggleVoiceResponse,
    mixedLanguageEnabled,
    toggleMixedLanguage,
    languageConfirmationEnabled,
    toggleLanguageConfirmation,
    developerMode,
    toggleDeveloperMode,
    indianLanguages,
  } = useLanguage();
  const { simpleMode, setSimpleMode, ttsEnabled, setTtsEnabled } = useSimpleMode();
  const [activeTab, setActiveTab] = useState(0);

  // Form states
  const [profile, setProfile] = useState({
    fullName: 'Swaranidhi Admin',
    email: 'admin@swaranidhi.in',
    phone: '+91 98480 99999',
    role: 'Shop Owner & Manager',
  });

  const [business, setBusiness] = useState({
    businessName: 'Sri Balaji General Stores & Provision',
    businessType: 'Retail Grocery / Kirana Store',
    ownerName: 'Admin',
    phone: '+91 98480 99999',
    email: 'contact@balajigrocery.in',
    address: 'Shop #14, Main Mandi Road',
    city: 'Vijayawada',
    state: 'Andhra Pradesh',
    pincode: '520001',
    gstNumber: '37AABCS1429K1ZM',
    currency: 'INR (₹)',
  });

  const [inventorySettings, setInventorySettings] = useState({
    threshold: 10,
    lowStockAlerts: true,
    outOfStockAlerts: true,
    allowNegativeStock: false,
    requireConfirmation: true,
    autoStockCalc: true,
  });

  const [voiceSettings, setVoiceSettings] = useState({
    enabled: true,
    confidenceThreshold: 80,
  });

  const [notifications, setNotifications] = useState({
    lowStock: true,
    outOfStock: true,
    dailySummary: true,
    purchaseNotifs: true,
    expiryAlerts: false,
    systemNotifs: true,
  });

  const [appearance, setAppearance] = useState({
    theme: 'Light',
    sidebar: 'Expanded',
  });

  const handleSave = (section) => {
    showToast?.(`${section} settings saved successfully.`, 'success');
  };

  return (
    <Box>
      <PageHeader
        title={t('settings.title')}
        subtitle={t('settings.subtitle')}
      />

      <Card sx={{ borderRadius: 3.5, border: '1px solid #e2e8f0', overflow: 'hidden' }}>
        <Box sx={{ borderBottom: 1, borderColor: '#e2e8f0', backgroundColor: '#f8fafc' }}>
          <Tabs
            value={activeTab}
            onChange={(e, val) => setActiveTab(val)}
            variant="scrollable"
            scrollButtons="auto"
            sx={{
              '& .MuiTab-root': {
                textTransform: 'none',
                fontWeight: 700,
                fontSize: simpleMode ? '0.98rem' : '0.88rem',
                minHeight: 52,
                color: '#64748b',
                '&.Mui-selected': { color: '#059669' },
              },
              '& .MuiTabs-indicator': { backgroundColor: '#059669', height: 3 },
            }}
          >
            <Tab icon={<PersonIcon sx={{ fontSize: 18 }} />} iconPosition="start" label={t('settings.profileTab')} />
            <Tab icon={<StoreIcon sx={{ fontSize: 18 }} />} iconPosition="start" label={t('settings.businessTab')} />
            <Tab icon={<InventoryIcon sx={{ fontSize: 18 }} />} iconPosition="start" label={t('settings.inventoryTab')} />
            <Tab icon={<MicIcon sx={{ fontSize: 18 }} />} iconPosition="start" label={t('settings.voiceTab')} />
            <Tab icon={<NotificationsIcon sx={{ fontSize: 18 }} />} iconPosition="start" label={t('settings.notificationsTab')} />
            <Tab icon={<SecurityIcon sx={{ fontSize: 18 }} />} iconPosition="start" label={t('settings.securityTab')} />
            <Tab icon={<PaletteIcon sx={{ fontSize: 18 }} />} iconPosition="start" label={t('settings.appearanceTab')} />
            <Tab icon={<CloudSyncIcon sx={{ fontSize: 18 }} />} iconPosition="start" label={t('settings.backupTab')} />
          </Tabs>
        </Box>

        <CardContent sx={{ p: { xs: 2.5, md: 4 } }}>
          {/* TAB 0: PROFILE */}
          {activeTab === 0 && (
            <Box maxWidth={700}>
              <Typography variant="h6" sx={{ fontWeight: 800, mb: 0.5 }}>
                {t('settings.profileTab')}
              </Typography>
              <Typography variant="caption" sx={{ color: '#64748b', display: 'block', mb: 3 }}>
                Update your personal information and contact details.
              </Typography>

              <Grid container spacing={2.5}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    label="Full Name"
                    fullWidth
                    value={profile.fullName}
                    onChange={(e) => setProfile({ ...profile, fullName: e.target.value })}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    label="Email Address"
                    type="email"
                    fullWidth
                    value={profile.email}
                    onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    label="Phone Number"
                    fullWidth
                    value={profile.phone}
                    onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    label="Role"
                    disabled
                    fullWidth
                    value={profile.role}
                  />
                </Grid>
              </Grid>

              <Box sx={{ mt: 3 }}>
                <Button variant="contained" color="primary" onClick={() => handleSave(t('settings.profileTab'))} sx={{ fontWeight: 700 }}>
                  Save Profile
                </Button>
              </Box>
            </Box>
          )}

          {/* TAB 1: BUSINESS */}
          {activeTab === 1 && (
            <Box maxWidth={800}>
              <Typography variant="h6" sx={{ fontWeight: 800, mb: 0.5 }}>
                {t('settings.businessTab')}
              </Typography>
              <Typography variant="caption" sx={{ color: '#64748b', display: 'block', mb: 3 }}>
                Information printed on customer receipts and billing records.
              </Typography>

              <Grid container spacing={2.5}>
                <Grid item xs={12} sm={8}>
                  <TextField
                    label="Business / Store Name"
                    fullWidth
                    value={business.businessName}
                    onChange={(e) => setBusiness({ ...business, businessName: e.target.value })}
                  />
                </Grid>
                <Grid item xs={12} sm={4}>
                  <TextField
                    label="Business Type"
                    fullWidth
                    value={business.businessType}
                    onChange={(e) => setBusiness({ ...business, businessType: e.target.value })}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    label="Owner Name"
                    fullWidth
                    value={business.ownerName}
                    onChange={(e) => setBusiness({ ...business, ownerName: e.target.value })}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    label="Phone Number"
                    fullWidth
                    value={business.phone}
                    onChange={(e) => setBusiness({ ...business, phone: e.target.value })}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    label="Address"
                    fullWidth
                    value={business.address}
                    onChange={(e) => setBusiness({ ...business, address: e.target.value })}
                  />
                </Grid>
                <Grid item xs={12} sm={4}>
                  <TextField
                    label="City"
                    fullWidth
                    value={business.city}
                    onChange={(e) => setBusiness({ ...business, city: e.target.value })}
                  />
                </Grid>
                <Grid item xs={12} sm={4}>
                  <TextField
                    label="State"
                    fullWidth
                    value={business.state}
                    onChange={(e) => setBusiness({ ...business, state: e.target.value })}
                  />
                </Grid>
                <Grid item xs={12} sm={4}>
                  <TextField
                    label="Pincode"
                    fullWidth
                    value={business.pincode}
                    onChange={(e) => setBusiness({ ...business, pincode: e.target.value })}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    label="GST Number"
                    fullWidth
                    value={business.gstNumber}
                    onChange={(e) => setBusiness({ ...business, gstNumber: e.target.value })}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    label="Currency"
                    fullWidth
                    disabled
                    value={business.currency}
                  />
                </Grid>
              </Grid>

              <Box sx={{ mt: 3 }}>
                <Button variant="contained" color="primary" onClick={() => handleSave(t('settings.businessTab'))} sx={{ fontWeight: 700 }}>
                  Save Shop Details
                </Button>
              </Box>
            </Box>
          )}

          {/* TAB 2: INVENTORY */}
          {activeTab === 2 && (
            <Box maxWidth={700}>
              <Typography variant="h6" sx={{ fontWeight: 800, mb: 0.5 }}>
                {t('settings.inventoryTab')}
              </Typography>
              <Typography variant="caption" sx={{ color: '#64748b', display: 'block', mb: 3 }}>
                Configure stock alerts, negative balance tolerance, and automated calculations.
              </Typography>

              <Stack spacing={3}>
                <Box>
                  <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#0f172a', mb: 1 }}>
                    Global Low Stock Threshold
                  </Typography>
                  <TextField
                    type="number"
                    size="small"
                    value={inventorySettings.threshold}
                    onChange={(e) => setInventorySettings({ ...inventorySettings, threshold: e.target.value })}
                    helperText="Alert when item count drops below this number"
                    sx={{ width: 220 }}
                  />
                </Box>

                <Divider />

                <FormControlLabel
                  control={
                    <Switch
                      checked={inventorySettings.lowStockAlerts}
                      onChange={(e) => setInventorySettings({ ...inventorySettings, lowStockAlerts: e.target.checked })}
                      color="primary"
                    />
                  }
                  label={
                    <Box>
                      <Typography variant="body2" sx={{ fontWeight: 700 }}>Low Stock Alerts</Typography>
                      <Typography variant="caption" sx={{ color: '#64748b' }}>Show warnings when items are running out.</Typography>
                    </Box>
                  }
                />

                <FormControlLabel
                  control={
                    <Switch
                      checked={inventorySettings.outOfStockAlerts}
                      onChange={(e) => setInventorySettings({ ...inventorySettings, outOfStockAlerts: e.target.checked })}
                      color="primary"
                    />
                  }
                  label={
                    <Box>
                      <Typography variant="body2" sx={{ fontWeight: 700 }}>Out-of-Stock Alerts</Typography>
                      <Typography variant="caption" sx={{ color: '#64748b' }}>Urgent alert when quantity reaches 0.</Typography>
                    </Box>
                  }
                />

                <FormControlLabel
                  control={
                    <Switch
                      checked={inventorySettings.allowNegativeStock}
                      onChange={(e) => setInventorySettings({ ...inventorySettings, allowNegativeStock: e.target.checked })}
                      color="primary"
                    />
                  }
                  label={
                    <Box>
                      <Typography variant="body2" sx={{ fontWeight: 700 }}>Allow Negative Stock</Typography>
                      <Typography variant="caption" sx={{ color: '#64748b' }}>Record sales even if physical count is temporarily 0.</Typography>
                    </Box>
                  }
                />

                <FormControlLabel
                  control={
                    <Switch
                      checked={inventorySettings.requireConfirmation}
                      onChange={(e) => setInventorySettings({ ...inventorySettings, requireConfirmation: e.target.checked })}
                      color="primary"
                    />
                  }
                  label={
                    <Box>
                      <Typography variant="body2" sx={{ fontWeight: 700 }}>Always Confirm Voice Actions</Typography>
                      <Typography variant="caption" sx={{ color: '#64748b' }}>Show confirmation dialog before modifying stock numbers.</Typography>
                    </Box>
                  }
                />
              </Stack>

              <Box sx={{ mt: 3.5 }}>
                <Button variant="contained" color="primary" onClick={() => handleSave(t('settings.inventoryTab'))} sx={{ fontWeight: 700 }}>
                  Save Stock Rules
                </Button>
              </Box>
            </Box>
          )}

          {/* TAB 3: VOICE & MULTILINGUAL AI */}
          {activeTab === 3 && (
            <Box maxWidth={760}>
              <Typography variant="h6" sx={{ fontWeight: 800, mb: 0.5 }}>
                🇮🇳 Multilingual Voice & AI Intelligence
              </Typography>
              <Typography variant="caption" sx={{ color: '#64748b', display: 'block', mb: 3 }}>
                India-first speech architecture: 3 independent layers for UI, Speech Understanding, and Spoken Response.
              </Typography>

              <Stack spacing={3}>
                {/* 3-LAYER ARCHITECTURE CONTROLS (Section 3) */}
                <Paper elevation={0} sx={{ p: 2.5, border: '1px solid #e2e8f0', borderRadius: 3, backgroundColor: '#f8fafc' }}>
                  <Typography variant="subtitle1" sx={{ fontWeight: 800, color: '#0f172a', mb: 0.5 }}>
                    Three Language Layers (Independently Configurable)
                  </Typography>
                  <Typography variant="caption" sx={{ color: '#64748b', display: 'block', mb: 2.5 }}>
                    Configure what you see, what you speak, and how Swaranidhi replies.
                  </Typography>

                  <Grid container spacing={2}>
                    {/* Layer 1: UI Language */}
                    <Grid item xs={12} sm={4}>
                      <Typography variant="caption" sx={{ fontWeight: 700, color: '#475569', display: 'block', mb: 0.8 }}>
                        LAYER 1: UI Language
                      </Typography>
                      <TextField
                        select
                        fullWidth
                        size="small"
                        value={uiLanguage}
                        onChange={(e) => setUiLanguage(e.target.value)}
                      >
                        {indianLanguages.map((l) => (
                          <MenuItem key={l.code} value={l.shortCode || l.code}>
                            {l.nativeName} ({l.name})
                          </MenuItem>
                        ))}
                      </TextField>
                    </Grid>

                    {/* Layer 2: Input / Understanding Language */}
                    <Grid item xs={12} sm={4}>
                      <Typography variant="caption" sx={{ fontWeight: 700, color: '#475569', display: 'block', mb: 0.8 }}>
                        LAYER 2: Voice & Text Input
                      </Typography>
                      <TextField
                        select
                        fullWidth
                        size="small"
                        value={inputLanguage}
                        onChange={(e) => setInputLanguage(e.target.value)}
                      >
                        <MenuItem value="auto">⚡ Auto Detect (Any Language)</MenuItem>
                        {indianLanguages.map((l) => (
                          <MenuItem key={l.code} value={l.code}>
                            {l.nativeName} ({l.name})
                          </MenuItem>
                        ))}
                      </TextField>
                    </Grid>

                    {/* Layer 3: Response Language */}
                    <Grid item xs={12} sm={4}>
                      <Typography variant="caption" sx={{ fontWeight: 700, color: '#475569', display: 'block', mb: 0.8 }}>
                        LAYER 3: Response Language
                      </Typography>
                      <TextField
                        select
                        fullWidth
                        size="small"
                        value={responseLanguage}
                        onChange={(e) => setResponseLanguage(e.target.value)}
                      >
                        <MenuItem value="same_as_input">Same as Spoken / Input</MenuItem>
                        {indianLanguages.map((l) => (
                          <MenuItem key={l.code} value={l.code}>
                            {l.nativeName} ({l.name})
                          </MenuItem>
                        ))}
                      </TextField>
                    </Grid>
                  </Grid>
                </Paper>

                {/* Voice Input Switch */}
                <FormControlLabel
                  control={
                    <Switch
                      checked={voiceSettings.enabled}
                      onChange={(e) => setVoiceSettings({ ...voiceSettings, enabled: e.target.checked })}
                      color="primary"
                    />
                  }
                  label={
                    <Box>
                      <Typography variant="body2" sx={{ fontWeight: 700 }}>Voice Input: {voiceSettings.enabled ? 'ON' : 'OFF'}</Typography>
                      <Typography variant="caption" sx={{ color: '#64748b' }}>Allow speaking to add items, record sales, and manage Khata.</Typography>
                    </Box>
                  }
                />

                {/* Text-To-Speech (Spoken Responses) */}
                <FormControlLabel
                  control={
                    <Switch
                      checked={ttsEnabled}
                      onChange={(e) => setTtsEnabled(e.target.checked)}
                      color="primary"
                    />
                  }
                  label={
                    <Box>
                      <Stack direction="row" spacing={1} alignItems="center">
                        <VolumeUpIcon sx={{ fontSize: 18, color: '#059669' }} />
                        <Typography variant="body2" sx={{ fontWeight: 700 }}>Voice Responses (TTS): {ttsEnabled ? 'ON' : 'OFF'}</Typography>
                      </Stack>
                      <Typography variant="caption" sx={{ color: '#64748b' }}>Swaranidhi replies in spoken voice in the shopkeeper's language.</Typography>
                    </Box>
                  }
                />

                {/* Mixed-Language / Code-Switching (Section 25, 33) */}
                <FormControlLabel
                  control={
                    <Switch
                      checked={mixedLanguageEnabled}
                      onChange={toggleMixedLanguage}
                      color="primary"
                    />
                  }
                  label={
                    <Box>
                      <Typography variant="body2" sx={{ fontWeight: 700 }}>Mixed-Language Code-Switching: {mixedLanguageEnabled ? 'ON' : 'OFF'}</Typography>
                      <Typography variant="caption" sx={{ color: '#64748b' }}>Supports natural sentences mixing Indian languages with English (e.g., "Maggi 20 packets stock lo add cheyyi").</Typography>
                    </Box>
                  }
                />

                {/* Language Confirmation (Section 33) */}
                <FormControlLabel
                  control={
                    <Switch
                      checked={languageConfirmationEnabled}
                      onChange={toggleLanguageConfirmation}
                      color="primary"
                    />
                  }
                  label={
                    <Box>
                      <Typography variant="body2" sx={{ fontWeight: 700 }}>Show Language Confirmation</Typography>
                      <Typography variant="caption" sx={{ color: '#64748b' }}>Display detected language badge when processing spoken commands.</Typography>
                    </Box>
                  }
                />

                {/* Section 56: Developer Mode */}
                <FormControlLabel
                  control={
                    <Switch
                      checked={developerMode}
                      onChange={toggleDeveloperMode}
                      color="primary"
                    />
                  }
                  label={
                    <Box>
                      <Typography variant="body2" sx={{ fontWeight: 700 }}>Developer Mode (Section 56): {developerMode ? 'ENABLED' : 'DISABLED'}</Typography>
                      <Typography variant="caption" sx={{ color: '#64748b' }}>Inspect detected language, confidence score, raw NormalizedCommand JSON, and latency in voice assistant.</Typography>
                    </Box>
                  }
                />

                {/* Simple Mode Toggle */}
                <FormControlLabel
                  control={
                    <Switch
                      checked={simpleMode}
                      onChange={(e) => setSimpleMode(e.target.checked)}
                      color="primary"
                    />
                  }
                  label={
                    <Box>
                      <Stack direction="row" spacing={1} alignItems="center">
                        <TextFieldsIcon sx={{ fontSize: 18, color: '#059669' }} />
                        <Typography variant="body2" sx={{ fontWeight: 700 }}>{t('settings.simpleMode')}</Typography>
                      </Stack>
                      <Typography variant="caption" sx={{ color: '#64748b' }}>{t('settings.simpleModeDesc')}</Typography>
                    </Box>
                  }
                />

                {/* Interactive Test Voice Box */}
                <Box sx={{ p: 2.5, backgroundColor: '#f0fdf4', borderRadius: 2.5, border: '1px solid #bbf7d0' }}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#065f46', mb: 1 }}>
                    Test Voice & Natural Language Understanding
                  </Typography>
                  <Typography variant="body2" sx={{ color: '#166534', mb: 2 }}>
                    Click below and speak or type in Telugu, Hindi, Tamil, Kannada, Malayalam, Bengali, Marathi, or English:
                  </Typography>
                  <VoiceButton
                    variant="button"
                    label="Test Multilingual Input"
                    onCommandResult={(res) => showToast?.(`Recognized [${res.intent}]: ${res.product || res.rawText}`, 'success')}
                  />
                </Box>
              </Stack>

              <Box sx={{ mt: 3.5 }}>
                <Button variant="contained" color="primary" onClick={() => handleSave(t('settings.voiceTab'))} sx={{ fontWeight: 700 }}>
                  Save Voice & Language Settings
                </Button>
              </Box>
            </Box>
          )}

          {/* TAB 4: NOTIFICATIONS */}
          {activeTab === 4 && (
            <Box maxWidth={700}>
              <Typography variant="h6" sx={{ fontWeight: 800, mb: 0.5 }}>
                {t('settings.notificationsTab')}
              </Typography>
              <Typography variant="caption" sx={{ color: '#64748b', display: 'block', mb: 3 }}>
                Choose which shop events trigger alert notifications.
              </Typography>

              <Stack spacing={2.5}>
                <FormControlLabel
                  control={<Switch checked={notifications.lowStock} onChange={(e) => setNotifications({ ...notifications, lowStock: e.target.checked })} color="primary" />}
                  label="Low Stock Alerts"
                />
                <FormControlLabel
                  control={<Switch checked={notifications.outOfStock} onChange={(e) => setNotifications({ ...notifications, outOfStock: e.target.checked })} color="primary" />}
                  label="Out of Stock Alerts"
                />
                <FormControlLabel
                  control={<Switch checked={notifications.dailySummary} onChange={(e) => setNotifications({ ...notifications, dailySummary: e.target.checked })} color="primary" />}
                  label="Daily Sales Summary"
                />
                <FormControlLabel
                  control={<Switch checked={notifications.purchaseNotifs} onChange={(e) => setNotifications({ ...notifications, purchaseNotifs: e.target.checked })} color="primary" />}
                  label="Purchase Notifications"
                />
                <FormControlLabel
                  control={<Switch checked={notifications.expiryAlerts} onChange={(e) => setNotifications({ ...notifications, expiryAlerts: e.target.checked })} color="primary" />}
                  label="Expiry Alerts"
                />
                <FormControlLabel
                  control={<Switch checked={notifications.systemNotifs} onChange={(e) => setNotifications({ ...notifications, systemNotifs: e.target.checked })} color="primary" />}
                  label="System Notifications"
                />
              </Stack>

              <Box sx={{ mt: 3.5 }}>
                <Button variant="contained" color="primary" onClick={() => handleSave(t('settings.notificationsTab'))} sx={{ fontWeight: 700 }}>
                  Save Alerts
                </Button>
              </Box>
            </Box>
          )}

          {/* TAB 5: SECURITY */}
          {activeTab === 5 && (
            <Box maxWidth={650}>
              <Typography variant="h6" sx={{ fontWeight: 800, mb: 0.5 }}>
                {t('settings.securityTab')}
              </Typography>
              <Typography variant="caption" sx={{ color: '#64748b', display: 'block', mb: 3 }}>
                Manage login credentials and secure store access.
              </Typography>

              <Stack spacing={3}>
                <Box>
                  <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1.5 }}>
                    Change Password
                  </Typography>
                  <Stack spacing={2}>
                    <TextField label="Current Password" type="password" size="small" fullWidth />
                    <TextField label="New Password" type="password" size="small" fullWidth />
                    <TextField label="Confirm New Password" type="password" size="small" fullWidth />
                  </Stack>
                  <Button variant="outlined" sx={{ mt: 2, fontWeight: 700 }} onClick={() => showToast?.('Password updated successfully.', 'success')}>
                    Update Password
                  </Button>
                </Box>

                <Divider />

                <FormControlLabel
                  control={<Switch defaultChecked color="primary" />}
                  label={
                    <Box>
                      <Typography variant="body2" sx={{ fontWeight: 700 }}>Two-Factor Authentication (2FA)</Typography>
                      <Typography variant="caption" sx={{ color: '#64748b' }}>OTP confirmation upon admin login.</Typography>
                    </Box>
                  }
                />
              </Stack>
            </Box>
          )}

          {/* TAB 6: APPEARANCE */}
          {activeTab === 6 && (
            <Box maxWidth={650}>
              <Typography variant="h6" sx={{ fontWeight: 800, mb: 0.5 }}>
                {t('settings.appearanceTab')}
              </Typography>
              <Typography variant="caption" sx={{ color: '#64748b', display: 'block', mb: 3 }}>
                Customize color theme and layout density.
              </Typography>

              <Stack spacing={3}>
                <Box>
                  <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1 }}>
                    Color Theme
                  </Typography>
                  <TextField
                    select
                    size="small"
                    value={appearance.theme}
                    onChange={(e) => setAppearance({ ...appearance, theme: e.target.value })}
                    sx={{ width: 240 }}
                  >
                    <MenuItem value="Light">Light (Emerald & Royal Blue)</MenuItem>
                    <MenuItem value="Dark">Dark Mode</MenuItem>
                    <MenuItem value="System">System Default</MenuItem>
                  </TextField>
                </Box>

                <Box>
                  <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1 }}>
                    Sidebar Behavior
                  </Typography>
                  <TextField
                    select
                    size="small"
                    value={appearance.sidebar}
                    onChange={(e) => setAppearance({ ...appearance, sidebar: e.target.value })}
                    sx={{ width: 240 }}
                  >
                    <MenuItem value="Expanded">Expanded (Default)</MenuItem>
                    <MenuItem value="Collapsed">Collapsed</MenuItem>
                  </TextField>
                </Box>
              </Stack>

              <Box sx={{ mt: 3.5 }}>
                <Button variant="contained" color="primary" onClick={() => handleSave(t('settings.appearanceTab'))} sx={{ fontWeight: 700 }}>
                  Save Appearance
                </Button>
              </Box>
            </Box>
          )}

          {/* TAB 7: DATA & BACKUP */}
          {activeTab === 7 && (
            <Box maxWidth={650}>
              <Typography variant="h6" sx={{ fontWeight: 800, mb: 0.5 }}>
                {t('settings.backupTab')}
              </Typography>
              <Typography variant="caption" sx={{ color: '#64748b', display: 'block', mb: 3 }}>
                Export local shop data or prepare sync with Spring Boot backend.
              </Typography>

              <Stack spacing={2.5}>
                <Alert severity="info" sx={{ border: '1px solid #bfdbfe' }}>
                  Swaranidhi stores shop records locally and is ready to sync with your Spring Boot backend at <code>http://localhost:8080/api</code>.
                </Alert>

                <Box>
                  <Typography variant="body2" sx={{ fontWeight: 700, mb: 0.5 }}>Export Shop Data</Typography>
                  <Typography variant="caption" sx={{ color: '#64748b', display: 'block', mb: 1.5 }}>
                    Download complete catalog, invoices, and customer Khata in JSON format.
                  </Typography>
                  <Button variant="outlined" onClick={() => showToast?.('Full shop database JSON exported.', 'success')} sx={{ fontWeight: 700 }}>
                    Export Full JSON
                  </Button>
                </Box>

                <Divider />

                <Box>
                  <Typography variant="body2" sx={{ fontWeight: 700, mb: 0.5 }}>Backup Data</Typography>
                  <Typography variant="caption" sx={{ color: '#64748b', display: 'block', mb: 1.5 }}>
                    Create a local snapshot timestamped for restoration.
                  </Typography>
                  <Button variant="contained" color="primary" onClick={() => showToast?.('Snapshot backup created successfully.', 'success')} sx={{ fontWeight: 700 }}>
                    Create Backup Now
                  </Button>
                </Box>
              </Stack>
            </Box>
          )}
        </CardContent>
      </Card>
    </Box>
  );
};

export default Settings;
