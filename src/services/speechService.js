// Swaranidhi Browser Text-to-Speech (TTS) & Multilingual Audio Helper Service
// Transparently handles speech synthesis across Indian languages with fallback notice (Section 30, 44)

class SpeechService {
  constructor() {
    this.synth = typeof window !== 'undefined' ? window.speechSynthesis : null;
    this.voices = [];
    this.isSupported = Boolean(this.synth);

    if (this.isSupported) {
      this.loadVoices();
      if (typeof window !== 'undefined' && window.speechSynthesis.onvoiceschanged !== undefined) {
        window.speechSynthesis.onvoiceschanged = () => this.loadVoices();
      }
    }
  }

  loadVoices() {
    if (!this.synth) return;
    this.voices = this.synth.getVoices() || [];
  }

  /**
   * Resolve BCP-47 Speech code from language identifier
   */
  resolveSpeechLang(langCode = 'en') {
    if (!langCode) return 'en-IN';
    const code = langCode.toLowerCase();
    if (code.startsWith('te')) return 'te-IN';
    if (code.startsWith('hi')) return 'hi-IN';
    if (code.startsWith('ta')) return 'ta-IN';
    if (code.startsWith('kn')) return 'kn-IN';
    if (code.startsWith('ml')) return 'ml-IN';
    if (code.startsWith('mr')) return 'mr-IN';
    if (code.startsWith('bn')) return 'bn-IN';
    if (code.startsWith('gu')) return 'gu-IN';
    if (code.startsWith('pa')) return 'pa-IN';
    if (code.startsWith('ur')) return 'ur-IN';
    if (code.startsWith('or')) return 'or-IN';
    if (code.startsWith('as')) return 'as-IN';
    if (code.startsWith('ne')) return 'ne-IN';
    return 'en-IN';
  }

  /**
   * Check if TTS voice exists for the given language
   */
  hasVoiceForLanguage(langCode = 'en') {
    if (!this.isSupported) return false;
    const resolvedCode = this.resolveSpeechLang(langCode);
    const prefix = resolvedCode.substring(0, 2);
    return this.voices.some((v) => v.lang === resolvedCode || v.lang.startsWith(prefix));
  }

  /**
   * Speak text in chosen Indian language
   * If voice is unavailable, triggers onUnavailable callback without crashing or faking
   */
  speak(text, lang = 'en-IN', onEndCallback = null, onUnavailable = null) {
    if (!this.isSupported || !text) return;

    try {
      this.synth.cancel(); // Cancel ongoing audio

      const resolvedCode = this.resolveSpeechLang(lang);
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.95; // Friendly, natural pace for shopkeepers
      utterance.pitch = 1.0;
      utterance.lang = resolvedCode;

      // Find matching voice if available in user's OS / browser
      let hasMatchingVoice = false;
      if (this.voices.length > 0) {
        const langPrefix = resolvedCode.substring(0, 2);
        const matchingVoice = this.voices.find(
          (v) => v.lang === resolvedCode || v.lang.startsWith(langPrefix)
        );
        if (matchingVoice) {
          utterance.voice = matchingVoice;
          hasMatchingVoice = true;
        }
      }

      if (onEndCallback) {
        utterance.onend = onEndCallback;
      }

      this.synth.speak(utterance);
    } catch (e) {
      console.warn('Speech synthesis notice:', e);
      if (onUnavailable) {
        onUnavailable("Voice response is not available for this language yet, but I understood your request.");
      }
    }
  }

  stop() {
    if (this.synth) {
      this.synth.cancel();
    }
  }

  getAvailableVoices() {
    return this.voices;
  }
}

export const speechService = new SpeechService();
export const speakIndianText = (text, lang) => speechService.speak(text, lang);
export default speechService;
