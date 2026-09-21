// =============================================================================
// Swaranidhi Speech Recognition Provider Service
// =============================================================================
// Implements an extensible dual-provider speech architecture:
// 1. BrowserSpeechRecognitionProvider (Web Speech API with dynamic BCP-47 locale)
// 2. CloudSpeechRecognitionProvider (HTML5 MediaRecorder audio capture -> Backend /api/voice/transcribe)
// Never fakes transcripts. Reports honest provider capability.
// =============================================================================

import { getLanguageByCodeOrLocale, getLanguageLocale } from '../config/languages';
import axios from 'axios';

const BASE_URL = import.meta.env.VITE_API_BASE_URL || import.meta.env.VITE_API_URL || 'http://localhost:8080/api';

/**
 * 1. Browser Speech Recognition Provider
 */
export class BrowserSpeechRecognitionProvider {
  constructor() {
    this.SpeechRecognition = typeof window !== 'undefined'
      ? (window.SpeechRecognition || window.webkitSpeechRecognition)
      : null;
    this.recognitionInstance = null;
    this.isListening = false;
  }

  isSupported() {
    return Boolean(this.SpeechRecognition);
  }

  /**
   * Determine if the current browser engine provides native ASR models for this locale
   */
  supportsLocale(locale) {
    if (!this.isSupported()) return false;
    const lang = getLanguageByCodeOrLocale(locale);
    // Chromium / WebKit built-in models cover primary Indian languages
    return Boolean(lang && lang.browserSpeechSupported);
  }

  start({ locale, onStart, onInterim, onFinal, onError }) {
    if (!this.isSupported()) {
      onError?.({ error: 'not-supported', message: 'Speech recognition is not supported in this browser.' });
      return;
    }

    try {
      if (this.recognitionInstance) {
        try { this.recognitionInstance.abort(); } catch (e) {}
      }

      const recognition = new this.SpeechRecognition();
      this.recognitionInstance = recognition;
      recognition.continuous = false;
      recognition.interimResults = true;

      // Crucial: Set dynamic BCP-47 locale for the selected language
      const targetLocale = getLanguageLocale(locale);
      recognition.lang = targetLocale;
      console.debug(`[BrowserSpeechProvider] Starting speech recognition for locale: ${targetLocale}`);

      let finalTranscript = '';

      recognition.onstart = () => {
        this.isListening = true;
        onStart?.({ provider: 'browser', locale: targetLocale });
      };

      recognition.onresult = (event) => {
        let interim = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
          const item = event.results[i];
          if (item.isFinal) {
            finalTranscript += item[0].transcript;
          } else {
            interim += item[0].transcript;
          }
        }
        onInterim?.(finalTranscript + (interim ? ' ' + interim : ''));
      };

      recognition.onerror = (event) => {
        this.isListening = false;
        console.warn('[BrowserSpeechProvider] Speech error:', event.error);
        if (event.error === 'language-not-supported') {
          onError?.({
            error: 'language-not-supported',
            locale: targetLocale,
            message: `Voice recognition for this language (${targetLocale}) is not available in your browser engine.`,
          });
        } else if (event.error === 'no-speech') {
          onError?.({ error: 'no-speech', message: "I didn't hear anything. Please speak into your microphone." });
        } else if (event.error === 'not-allowed') {
          onError?.({ error: 'not-allowed', message: 'Microphone permission was denied. Please allow microphone access.' });
        } else {
          onError?.({ error: event.error, message: `Speech recognition error: ${event.error}` });
        }
      };

      recognition.onend = () => {
        this.isListening = false;
        onFinal?.(finalTranscript.trim());
      };

      recognition.start();
    } catch (err) {
      this.isListening = false;
      console.error('[BrowserSpeechProvider] Exception starting recognition:', err);
      onError?.({ error: 'start-failed', message: err.message });
    }
  }

  stop() {
    if (this.recognitionInstance && this.isListening) {
      try {
        this.recognitionInstance.stop();
      } catch (e) {}
    }
    this.isListening = false;
  }

  abort() {
    if (this.recognitionInstance) {
      try {
        this.recognitionInstance.abort();
      } catch (e) {}
    }
    this.isListening = false;
  }
}

/**
 * 2. Cloud Speech Recognition Provider (Audio Recording -> POST /api/voice/transcribe)
 */
export class CloudSpeechRecognitionProvider {
  constructor() {
    this.mediaRecorder = null;
    this.audioChunks = [];
    this.isRecording = false;
    this.stream = null;
  }

  isSupported() {
    return typeof navigator !== 'undefined' && Boolean(navigator.mediaDevices?.getUserMedia);
  }

  async start({ locale, onStart, onInterim, onFinal, onError }) {
    if (!this.isSupported()) {
      onError?.({ error: 'no-media-devices', message: 'Audio recording is not supported in this environment.' });
      return;
    }

    try {
      const targetLocale = getLanguageLocale(locale);
      this.stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      this.audioChunks = [];

      const mimeType = MediaRecorder.isTypeSupported('audio/webm')
        ? 'audio/webm'
        : (MediaRecorder.isTypeSupported('audio/ogg') ? 'audio/ogg' : 'audio/wav');

      this.mediaRecorder = new MediaRecorder(this.stream, { mimeType });
      this.isRecording = true;

      this.mediaRecorder.ondataavailable = (event) => {
        if (event.data && event.data.size > 0) {
          this.audioChunks.push(event.data);
        }
      };

      this.mediaRecorder.onstart = () => {
        onStart?.({ provider: 'cloud', locale: targetLocale });
      };

      this.mediaRecorder.onstop = async () => {
        this.isRecording = false;
        this.cleanupStream();

        if (this.audioChunks.length === 0) {
          onFinal?.('');
          return;
        }

        const audioBlob = new Blob(this.audioChunks, { type: mimeType });
        try {
          onInterim?.('Transcribing via cloud speech engine...');
          const transcript = await this.sendAudioToBackend(audioBlob, targetLocale, mimeType);
          onFinal?.(transcript);
        } catch (transcribeErr) {
          console.error('[CloudSpeechProvider] Transcription error:', transcribeErr);
          onError?.({
            error: 'cloud-transcription-failed',
            message: transcribeErr.response?.data?.message || transcribeErr.message || 'Cloud transcription failed.',
          });
        }
      };

      this.mediaRecorder.start(250); // Collect slice every 250ms
    } catch (err) {
      this.isRecording = false;
      this.cleanupStream();
      console.error('[CloudSpeechProvider] Microphone error:', err);
      onError?.({ error: 'mic-access-failed', message: 'Could not access microphone.' });
    }
  }

  stop() {
    if (this.mediaRecorder && this.isRecording) {
      try {
        this.mediaRecorder.stop();
      } catch (e) {}
    }
    this.isRecording = false;
  }

  cleanupStream() {
    if (this.stream) {
      try {
        this.stream.getTracks().forEach((track) => track.stop());
      } catch (e) {}
      this.stream = null;
    }
  }

  async sendAudioToBackend(audioBlob, locale, mimeType) {
    // Convert Blob to Base64
    const base64Data = await new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result;
        const base64 = result.includes(',') ? result.split(',')[1] : result;
        resolve(base64);
      };
      reader.onerror = reject;
      reader.readAsDataURL(audioBlob);
    });

    const token = typeof localStorage !== 'undefined' ? localStorage.getItem('swaranidhi_token') : null;
    const headers = { 'Content-Type': 'application/json' };
    if (token) headers['Authorization'] = `Bearer ${token}`;

    const res = await axios.post(
      `${BASE_URL}/voice/transcribe`,
      {
        audioBase64: base64Data,
        languageHint: locale,
        format: mimeType,
      },
      { headers, timeout: 20000 }
    );

    const data = res.data?.data || res.data;
    if (data && data.text !== undefined) {
      return data.text;
    }
    throw new Error(data?.message || 'Empty transcription returned from speech provider.');
  }
}

/**
 * 3. Unified Orchestration Service
 */
class SpeechRecognitionService {
  constructor() {
    this.browserProvider = new BrowserSpeechRecognitionProvider();
    this.cloudProvider = new CloudSpeechRecognitionProvider();
    this.activeProvider = null;
    this.cloudAvailable = false;
    this.checkCloudAvailability();
  }

  async checkCloudAvailability() {
    try {
      const res = await axios.get(`${BASE_URL}/voice/languages`, { timeout: 3000 });
      const languages = res.data?.data || res.data || [];
      // If any language requires cloud and is marked supported, cloud is operational
      this.cloudAvailable = Array.isArray(languages) && languages.some((l) => l.speechRecognitionSupported);
    } catch (e) {
      this.cloudAvailable = false;
    }
  }

  /**
   * Determine speech provider capabilities for a given language
   */
  getCapabilityForLocale(locale) {
    const lang = getLanguageByCodeOrLocale(locale);
    const targetLocale = lang ? lang.locale : 'en-IN';
    const browserCan = this.browserProvider.supportsLocale(targetLocale);

    if (browserCan) {
      return {
        canRecognize: true,
        provider: 'browser',
        locale: targetLocale,
        message: 'Browser Speech Recognition Available',
      };
    }

    if (this.cloudAvailable) {
      return {
        canRecognize: true,
        provider: 'cloud',
        locale: targetLocale,
        message: 'Cloud Multilingual Speech Available',
      };
    }

    return {
      canRecognize: false,
      provider: 'none',
      locale: targetLocale,
      message: `Voice recognition for ${lang?.name || targetLocale} is unavailable in this browser. Configure a multilingual speech provider (Whisper or Bhashini) to enable it.`,
    };
  }

  /**
   * Start listening using the best available provider
   */
  startListening({ locale, onStart, onInterim, onFinal, onError }) {
    const targetLocale = getLanguageLocale(locale);
    const capability = this.getCapabilityForLocale(targetLocale);

    if (capability.provider === 'browser') {
      this.activeProvider = this.browserProvider;
      this.browserProvider.start({
        locale: targetLocale,
        onStart,
        onInterim,
        onFinal,
        onError: (err) => {
          // If browser unexpectedly throws language-not-supported, attempt cloud fallback if possible
          if (err.error === 'language-not-supported' && this.cloudProvider.isSupported()) {
            console.warn('[SpeechRecognitionService] Browser failed on locale, attempting cloud recording fallback...');
            this.activeProvider = this.cloudProvider;
            this.cloudProvider.start({ locale: targetLocale, onStart, onInterim, onFinal, onError });
          } else {
            onError?.(err);
          }
        },
      });
      return;
    }

    if (capability.provider === 'cloud') {
      this.activeProvider = this.cloudProvider;
      this.cloudProvider.start({
        locale: targetLocale,
        onStart,
        onInterim,
        onFinal,
        onError,
      });
      return;
    }

    // Honest reporting when no provider supports this language
    onError?.({
      error: 'unsupported-language',
      locale: targetLocale,
      message: capability.message,
    });
  }

  stopListening() {
    if (this.activeProvider) {
      this.activeProvider.stop();
      this.activeProvider = null;
    }
  }

  abort() {
    if (this.browserProvider) this.browserProvider.abort();
    if (this.cloudProvider) this.cloudProvider.cleanupStream();
    this.activeProvider = null;
  }
}

export const speechRecognitionService = new SpeechRecognitionService();
export default speechRecognitionService;
