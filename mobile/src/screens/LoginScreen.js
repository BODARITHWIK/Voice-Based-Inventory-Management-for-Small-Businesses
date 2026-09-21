import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { login } from '../services/api';
import { COLORS } from '../theme';
import { useLanguage } from '../context/LanguageContext';

export default function LoginScreen({ navigation }) {
  const { t, language, setLanguage, indianLanguages } = useLanguage();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!username.trim() || !password.trim()) {
      Alert.alert('Error', 'Please enter username/email and password.');
      return;
    }

    try {
      setLoading(true);
      await login(username.trim(), password);
      navigation.replace('Home');
    } catch (err) {
      Alert.alert(
        'Login Failed',
        err.response?.data?.message || 'Please check your credentials.'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleDemoLogin = () => {
    setUsername('owner@kirana.com');
    setPassword('password123');
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Logo / Header */}
        <View style={styles.header}>
          <View style={styles.logoCircle}>
            <Text style={styles.logoIcon}>🎙️</Text>
          </View>
          <Text style={styles.title}>SWARANIDHI</Text>
          <Text style={styles.tagline}>"Speak. Manage. Grow."</Text>
          <Text style={styles.subtitle}>AI Shop Assistant for Indian Kirana</Text>
        </View>

        {/* Card */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Login to Store</Text>

          <Text style={styles.inputLabel}>Email or Phone</Text>
          <TextInput
            style={styles.input}
            placeholder="owner@kirana.com"
            placeholderTextColor="#94A3B8"
            autoCapitalize="none"
            value={username}
            onChangeText={setUsername}
          />

          <Text style={styles.inputLabel}>Password</Text>
          <TextInput
            style={styles.input}
            placeholder="••••••••"
            placeholderTextColor="#94A3B8"
            secureTextEntry
            value={password}
            onChangeText={setPassword}
          />

          <TouchableOpacity
            style={styles.loginBtn}
            onPress={handleLogin}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text style={styles.loginBtnText}>{t('login')}</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.demoBtn}
            onPress={handleDemoLogin}
          >
            <Text style={styles.demoBtnText}>⚡ Fill Demo: Ramesh Kirana</Text>
          </TouchableOpacity>
        </View>

        {/* Language selector chips */}
        <View style={styles.langSection}>
          <Text style={styles.langLabel}>App Language / భాష / भाषा:</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.langRow}>
            {indianLanguages.slice(0, 10).map((l) => (
              <TouchableOpacity
                key={l.code}
                style={[
                  styles.langChip,
                  language === l.code && styles.langChipActive,
                ]}
                onPress={() => setLanguage(l.code)}
              >
                <Text
                  style={[
                    styles.langChipText,
                    language === l.code && styles.langChipTextActive,
                  ]}
                >
                  {l.nativeName}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F172A',
  },
  scrollContent: {
    padding: 24,
    justifyContent: 'center',
    minHeight: '100%',
  },
  header: {
    alignItems: 'center',
    marginBottom: 28,
  },
  logoCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#059669',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  logoIcon: {
    fontSize: 32,
  },
  title: {
    fontSize: 26,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: 1,
  },
  tagline: {
    fontSize: 14,
    fontWeight: '600',
    color: '#34D399',
    marginTop: 4,
  },
  subtitle: {
    fontSize: 12,
    color: '#94A3B8',
    marginTop: 2,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 8,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 18,
  },
  inputLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#475569',
    marginBottom: 6,
  },
  input: {
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    color: '#0F172A',
    marginBottom: 16,
    backgroundColor: '#F8FAFC',
  },
  loginBtn: {
    backgroundColor: '#059669',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 6,
  },
  loginBtnText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  demoBtn: {
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
    marginTop: 12,
    backgroundColor: '#F1F5F9',
  },
  demoBtnText: {
    color: '#334155',
    fontSize: 14,
    fontWeight: '600',
  },
  langSection: {
    marginTop: 28,
  },
  langLabel: {
    color: '#94A3B8',
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 10,
    textAlign: 'center',
  },
  langRow: {
    flexDirection: 'row',
  },
  langChip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#1E293B',
    marginRight: 8,
    borderWidth: 1,
    borderColor: '#334155',
  },
  langChipActive: {
    backgroundColor: '#059669',
    borderColor: '#34D399',
  },
  langChipText: {
    color: '#CBD5E1',
    fontSize: 13,
    fontWeight: '600',
  },
  langChipTextActive: {
    color: '#FFFFFF',
  },
});
