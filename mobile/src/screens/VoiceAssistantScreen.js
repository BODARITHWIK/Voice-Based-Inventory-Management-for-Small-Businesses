import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
  ActivityIndicator,
  SafeAreaView,
  Alert,
} from 'react-native';
import * as Speech from 'expo-speech';
import { COLORS, SHADOWS } from '../theme';
import { queryAssistant, adjustStock, getProducts } from '../services/api';

const INDIAN_LANGUAGES = [
  { code: 'hi-IN', name: 'हिंदी (Hindi)' },
  { code: 'te-IN', name: 'తెలుగు (Telugu)' },
  { code: 'ta-IN', name: 'தமிழ் (Tamil)' },
  { code: 'kn-IN', name: 'ಕನ್ನಡ (Kannada)' },
  { code: 'ml-IN', name: 'മലയാളം (Malayalam)' },
  { code: 'mr-IN', name: 'मराठी (Marathi)' },
  { code: 'bn-IN', name: 'বাংলা (Bengali)' },
  { code: 'gu-IN', name: 'ગુજરાતી (Gujarati)' },
  { code: 'pa-IN', name: 'ਪੰਜਾਬੀ (Punjabi)' },
  { code: 'en-IN', name: 'English (India)' },
];

export default function VoiceAssistantScreen() {
  const [selectedLanguage, setSelectedLanguage] = useState('hi-IN');
  const [isListening, setIsListening] = useState(false);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState([
    {
      id: 'welcome',
      sender: 'assistant',
      text: 'नमस्ते! मैं स्वर्णनिधि AI सहायक हूँ। आप बोलकर या लिखकर अपनी दुकान की बिक्री, स्टॉक या खाता के बारे में पूछ सकते हैं।',
      time: 'Just now',
    },
  ]);

  const speakText = (text, langCode) => {
    try {
      Speech.stop();
      Speech.speak(text, {
        language: langCode || selectedLanguage,
        pitch: 1.0,
        rate: 0.9,
      });
    } catch (e) {
      console.warn('Speech playback error', e);
    }
  };

  const handleSend = async (queryToSend) => {
    const q = queryToSend || inputText;
    if (!q || !q.trim()) return;

    const userMsg = {
      id: 'user_' + Date.now(),
      sender: 'user',
      text: q.trim(),
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputText('');
    setLoading(true);

    try {
      const res = await queryAssistant(q.trim());
      const answer = res?.answer || "I've checked the store records for you.";

      const assistantMsg = {
        id: 'bot_' + Date.now(),
        sender: 'assistant',
        text: answer,
        provider: res?.provider || 'RuleBasedLLMProvider',
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages((prev) => [...prev, assistantMsg]);
      speakText(answer, selectedLanguage);
    } catch (err) {
      const errMsg = {
        id: 'bot_err_' + Date.now(),
        sender: 'assistant',
        text: 'Sorry, I had trouble checking that right now. Please try again or check network connection.',
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, errMsg]);
    } finally {
      setLoading(false);
    }
  };

  const handleMicPress = () => {
    // Check if browser/environment Web Speech API is supported
    if (typeof window !== 'undefined' && (window.SpeechRecognition || window.webkitSpeechRecognition)) {
      try {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        const recognition = new SpeechRecognition();
        recognition.lang = selectedLanguage === 'en' ? 'en-IN' : `${selectedLanguage}-IN`;
        recognition.onstart = () => setIsListening(true);
        recognition.onresult = (event) => {
          setIsListening(false);
          const transcript = event.results[0][0].transcript;
          if (transcript) handleSend(transcript);
        };
        recognition.onerror = () => {
          setIsListening(false);
          Alert.alert('Microphone', 'Speech recognition error. Please try again or type below.');
        };
        recognition.onend = () => setIsListening(false);
        recognition.start();
        return;
      } catch (err) {
        console.warn('SpeechRecognition failed:', err);
      }
    }

    // Truthful notification if device microphone STT engine is not available
    Alert.alert(
      'Voice STT Not Configured',
      'Microphone speech recognition requires native device voice engine or Web Speech API. Please type your question in the box below or tap a quick query.'
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Language Selector Chips */}
      <View style={styles.languageBar}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chipScroll}>
          {INDIAN_LANGUAGES.map((lang) => {
            const isSelected = selectedLanguage === lang.code;
            return (
              <TouchableOpacity
                key={lang.code}
                style={[styles.langChip, isSelected && styles.langChipActive]}
                onPress={() => setSelectedLanguage(lang.code)}
              >
                <Text style={[styles.langChipText, isSelected && styles.langChipTextActive]}>
                  {lang.name}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {/* Chat Messages */}
      <ScrollView contentContainerStyle={styles.chatScroll}>
        {messages.map((msg) => {
          const isUser = msg.sender === 'user';
          return (
            <View key={msg.id} style={[styles.msgWrapper, isUser ? styles.msgRight : styles.msgLeft]}>
              <View style={[styles.msgBubble, isUser ? styles.bubbleUser : styles.bubbleBot, SHADOWS.sm]}>
                <Text style={[styles.msgText, isUser ? styles.textUser : styles.textBot]}>
                  {msg.text}
                </Text>
                <View style={styles.msgMeta}>
                  <Text style={[styles.metaTime, isUser ? styles.metaTimeUser : styles.metaTimeBot]}>
                    {msg.time}
                  </Text>
                  {!isUser && (
                    <TouchableOpacity onPress={() => speakText(msg.text, selectedLanguage)}>
                      <Text style={styles.listenIcon}>🔊</Text>
                    </TouchableOpacity>
                  )}
                </View>
              </View>
            </View>
          );
        })}
        {loading && (
          <View style={[styles.msgWrapper, styles.msgLeft]}>
            <View style={[styles.msgBubble, styles.bubbleBot]}>
              <ActivityIndicator size="small" color={COLORS.primary} />
              <Text style={styles.thinkingText}>Swaranidhi AI is thinking...</Text>
            </View>
          </View>
        )}
      </ScrollView>

      {/* Suggested Quick Prompts */}
      <View style={styles.quickPromptRow}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 12 }}>
          <TouchableOpacity style={styles.promptPill} onPress={() => handleSend("Today's sales")}>
            <Text style={styles.promptText}>📊 Today's sales</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.promptPill} onPress={() => handleSend("Low stock products")}>
            <Text style={styles.promptText}>⚠️ Low stock items</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.promptPill} onPress={() => handleSend("Expiring products")}>
            <Text style={styles.promptText}>⏳ Expiring soon</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.promptPill} onPress={() => handleSend("Customer khata dues")}>
            <Text style={styles.promptText}>👤 Khata balance</Text>
          </TouchableOpacity>
        </ScrollView>
      </View>

      {/* Input Bar with Mic and Send */}
      <View style={styles.inputContainer}>
        <TouchableOpacity
          style={[styles.micButton, isListening && styles.micButtonListening]}
          onPress={handleMicPress}
        >
          <Text style={styles.micEmoji}>{isListening ? '🔴' : '🎤'}</Text>
        </TouchableOpacity>

        <TextInput
          style={styles.textInput}
          placeholder="Speak or type your command..."
          placeholderTextColor={COLORS.textSecondary}
          value={inputText}
          onChangeText={setInputText}
          onSubmitEditing={() => handleSend()}
        />

        <TouchableOpacity
          style={[styles.sendButton, !inputText.trim() && { opacity: 0.5 }]}
          onPress={() => handleSend()}
          disabled={!inputText.trim()}
        >
          <Text style={styles.sendText}>➤</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  languageBar: {
    backgroundColor: '#FFFFFF',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  chipScroll: {
    paddingHorizontal: 12,
    gap: 8,
  },
  langChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: '#F1F5F9',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  langChipActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  langChipText: {
    fontSize: 12,
    color: COLORS.textSecondary,
    fontWeight: '600',
  },
  langChipTextActive: {
    color: '#FFFFFF',
  },
  chatScroll: {
    padding: 16,
    paddingBottom: 20,
  },
  msgWrapper: {
    marginBottom: 14,
    flexDirection: 'row',
  },
  msgLeft: {
    justifyContent: 'flex-start',
  },
  msgRight: {
    justifyContent: 'flex-end',
  },
  msgBubble: {
    maxWidth: '82%',
    padding: 14,
    borderRadius: 18,
  },
  bubbleBot: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 4,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  bubbleUser: {
    backgroundColor: COLORS.primary,
    borderTopRightRadius: 4,
  },
  msgText: {
    fontSize: 14,
    lineHeight: 20,
  },
  textBot: {
    color: COLORS.text,
  },
  textUser: {
    color: '#FFFFFF',
  },
  msgMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 6,
  },
  metaTime: {
    fontSize: 10,
  },
  metaTimeBot: {
    color: COLORS.textSecondary,
  },
  metaTimeUser: {
    color: '#93C5FD',
  },
  listenIcon: {
    fontSize: 14,
    marginLeft: 10,
  },
  thinkingText: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginTop: 4,
  },
  quickPromptRow: {
    paddingVertical: 8,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  promptPill: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginRight: 8,
  },
  promptText: {
    fontSize: 12,
    color: COLORS.text,
    fontWeight: '500',
  },
  inputContainer: {
    backgroundColor: '#FFFFFF',
    padding: 10,
    flexDirection: 'row',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    gap: 8,
  },
  micButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#EEF2FF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  micButtonListening: {
    backgroundColor: '#FEE2E2',
  },
  micEmoji: {
    fontSize: 22,
  },
  textInput: {
    flex: 1,
    backgroundColor: '#F1F5F9',
    borderRadius: 22,
    paddingHorizontal: 16,
    paddingVertical: 10,
    fontSize: 14,
    color: COLORS.text,
  },
  sendButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
});
