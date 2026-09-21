import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  TextInput,
  Switch,
  Alert,
} from 'react-native';
import { setApiBaseUrl, logout } from '../services/api';
import { COLORS } from '../theme';
import { useLanguage } from '../context/LanguageContext';

export default function SettingsScreen({ navigation }) {
  const { t, language, setLanguage, indianLanguages } = useLanguage();
  const [customUrl, setCustomUrl] = useState('');
  const [voiceResponses, setVoiceResponses] = useState(true);
  const [simpleMode, setSimpleMode] = useState(false);

  const handleSaveUrl = async () => {
    if (!customUrl.trim()) {
      Alert.alert('Info', 'Default API endpoint will be used.');
      return;
    }
    await setApiBaseUrl(customUrl.trim());
    Alert.alert('Saved', `Backend endpoint set to: ${customUrl.trim()}`);
  };

  const handleLogout = async () => {
    Alert.alert('Confirm Logout', 'Are you sure you want to log out of your store?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Logout',
        style: 'destructive',
        onPress: async () => {
          await logout();
          navigation.replace('Login');
        },
      },
    ]);
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Language Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>🇮🇳 Shop Language (23 Languages)</Text>
        <Text style={styles.sectionDesc}>
          Choose your primary operating language across all screens and voice recognition.
        </Text>

        <View style={styles.langGrid}>
          {indianLanguages.map((l) => {
            const isSelected = language === l.code;
            return (
              <TouchableOpacity
                key={l.code}
                style={[styles.langCard, isSelected && styles.langCardActive]}
                onPress={() => setLanguage(l.code)}
              >
                <Text style={[styles.nativeText, isSelected && styles.nativeTextActive]}>
                  {l.nativeName}
                </Text>
                <Text style={[styles.langSub, isSelected && styles.langSubActive]}>
                  {l.name}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      {/* Voice & Assistant Settings */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>🎙️ Voice & Accessibility</Text>

        <View style={styles.settingRow}>
          <View style={{ flex: 1 }}>
            <Text style={styles.settingTitle}>Voice Responses (TTS)</Text>
            <Text style={styles.settingSub}>Swaranidhi speaks confirmations aloud</Text>
          </View>
          <Switch
            value={voiceResponses}
            onValueChange={setVoiceResponses}
            trackColor={{ true: '#059669', false: '#CBD5E1' }}
          />
        </View>

        <View style={styles.settingRow}>
          <View style={{ flex: 1 }}>
            <Text style={styles.settingTitle}>Simple Mode</Text>
            <Text style={styles.settingSub}>Larger fonts and high-contrast buttons</Text>
          </View>
          <Switch
            value={simpleMode}
            onValueChange={setSimpleMode}
            trackColor={{ true: '#059669', false: '#CBD5E1' }}
          />
        </View>
      </View>

      {/* Server Endpoint Config */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>🌐 Server Endpoint</Text>
        <Text style={styles.sectionDesc}>
          Configure Spring Boot backend host (e.g. Render URL or local network IP).
        </Text>
        <TextInput
          style={styles.input}
          placeholder="https://swaranidhi-backend.onrender.com/api"
          placeholderTextColor="#94A3B8"
          autoCapitalize="none"
          value={customUrl}
          onChangeText={setCustomUrl}
        />
        <TouchableOpacity style={styles.saveUrlBtn} onPress={handleSaveUrl}>
          <Text style={styles.saveUrlBtnText}>Save Endpoint</Text>
        </TouchableOpacity>
      </View>

      {/* Account / Logout */}
      <View style={styles.section}>
        <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
          <Text style={styles.logoutBtnText}>Logout of Shop</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  content: {
    padding: 16,
    paddingBottom: 40,
  },
  section: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 18,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 4,
  },
  sectionDesc: {
    fontSize: 12,
    color: '#64748B',
    marginBottom: 14,
  },
  langGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  langCard: {
    width: '31%',
    backgroundColor: '#F8FAFC',
    borderRadius: 10,
    padding: 10,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    alignItems: 'center',
  },
  langCardActive: {
    backgroundColor: '#ECFDF5',
    borderColor: '#059669',
  },
  nativeText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#334155',
  },
  nativeTextActive: {
    color: '#065F46',
  },
  langSub: {
    fontSize: 10,
    color: '#94A3B8',
    marginTop: 2,
  },
  langSubActive: {
    color: '#059669',
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  settingTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0F172A',
  },
  settingSub: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
  },
  input: {
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    color: '#0F172A',
    marginBottom: 12,
    backgroundColor: '#F8FAFC',
  },
  saveUrlBtn: {
    backgroundColor: '#1E293B',
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: 'center',
  },
  saveUrlBtnText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 14,
  },
  logoutBtn: {
    backgroundColor: '#FEE2E2',
    borderWidth: 1,
    borderColor: '#FCA5A5',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
  },
  logoutBtnText: {
    color: '#DC2626',
    fontWeight: '700',
    fontSize: 15,
  },
});
