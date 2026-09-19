package com.swaranidhi.service.voice;

import com.swaranidhi.dto.DetectLanguageResponse;
import com.swaranidhi.dto.LanguageCapability;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.concurrent.ConcurrentHashMap;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

/**
 * Registry & Language Intelligence Service for Indian Languages (Section 1, 2, 7, 32)
 * Manages capabilities for 22 Eighth Schedule Indian Languages + English and regional variants.
 */
@Service
public class LanguageCapabilityService {

    private final Map<String, LanguageCapability> registry = new LinkedHashMap<>();

    public LanguageCapabilityService() {
        initializeRegistry();
    }

    private void initializeRegistry() {
        // 1. English
        register(new LanguageCapability("en-IN", "English", "English", "Latin", "Pan-India",
                true, true, true, "SUPPORTED", "Add 20 packets of Maggi to stock"));

        // 2. Hindi
        register(new LanguageCapability("hi-IN", "Hindi", "हिन्दी", "Devanagari", "North / Central",
                true, true, true, "SUPPORTED", "मैगी के 20 पैकेट स्टॉक में जोड़ो"));

        // 3. Telugu
        register(new LanguageCapability("te-IN", "Telugu", "తెలుగు", "Telugu", "South",
                true, true, true, "SUPPORTED", "మ్యాగీ 20 ప్యాకెట్లు స్టాక్లో యాడ్ చేయి"));

        // 4. Tamil
        register(new LanguageCapability("ta-IN", "Tamil", "தமிழ்", "Tamil", "South",
                true, true, true, "SUPPORTED", "20 மேகி பாக்கெட்டுகளை ஸ்டாக்கில் சேர்க்கவும்"));

        // 5. Kannada
        register(new LanguageCapability("kn-IN", "Kannada", "ಕನ್ನಡ", "Kannada", "South",
                true, true, true, "SUPPORTED", "ಮ್ಯಾಗಿ 20 ಪ್ಯಾಕೆಟ್ ಸ್ಟಾಕ್ಗೆ ಸೇರಿಸಿ"));

        // 6. Malayalam
        register(new LanguageCapability("ml-IN", "Malayalam", "മലയാളം", "Malayalam", "South",
                true, true, true, "SUPPORTED", "20 പാക്കറ്റ് മാഗി സ്റ്റോക്കിൽ ചേർക്കൂ"));

        // 7. Marathi
        register(new LanguageCapability("mr-IN", "Marathi", "मराठी", "Devanagari", "West",
                true, true, true, "SUPPORTED", "मॅगीचे २० पॅकेट स्टॉकमध्ये जोडा"));

        // 8. Bengali
        register(new LanguageCapability("bn-IN", "Bengali", "বাংলা", "Bengali", "East",
                true, true, true, "SUPPORTED", "ম্যাগির ২০টা প্যাকেট স্টকে যোগ করো"));

        // 9. Gujarati
        register(new LanguageCapability("gu-IN", "Gujarati", "ગુજરાતી", "Gujarati", "West",
                true, true, true, "SUPPORTED", "મેગીના 20 પેકેટ સ્ટોકમાં ઉમેરો"));

        // 10. Punjabi
        register(new LanguageCapability("pa-IN", "Punjabi", "ਪੰਜਾਬੀ", "Gurmukhi", "North",
                true, true, true, "SUPPORTED", "ਮੈਗੀ ਦੇ 20 ਪੈਕਟ ਸਟਾਕ ਵਿੱਚ ਪਾ ਦਿਓ"));

        // 11. Urdu
        register(new LanguageCapability("ur-IN", "Urdu", "اردو", "Perso-Arabic", "Pan-India",
                true, true, true, "SUPPORTED", "میگی کے 20 پیکٹ اسٹاک میں شامل کریں"));

        // 12. Odia
        register(new LanguageCapability("or-IN", "Odia", "ଓଡ଼ିଆ", "Odia", "East",
                true, true, false, "SUPPORTED", "ମ୍ୟାଗିର 20 ପ୍ୟାକେଟ୍ ଷ୍ଟକ୍ରେ ଯୋଡନ୍ତୁ"));

        // 13. Assamese
        register(new LanguageCapability("as-IN", "Assamese", "অসমীয়া", "Bengali-Assamese", "North-East",
                true, true, false, "SUPPORTED", "মেগীৰ ২০টা পেকেট ষ্টকত যোগ কৰক"));

        // 14. Nepali
        register(new LanguageCapability("ne-IN", "Nepali", "नेपाली", "Devanagari", "North / East",
                true, true, false, "SUPPORTED", "म्यागीको २० प्याकेट स्टकमा थप्नुहोस्"));

        // 15. Konkani
        register(new LanguageCapability("kok-IN", "Konkani", "कोंकणी", "Devanagari", "West",
                true, true, false, "SUPPORTED", "मॅगीचे २० पाकिटां स्टॉकांत जोडा"));

        // 16. Kashmiri
        register(new LanguageCapability("ks-IN", "Kashmiri", "کٲشُر / कश्मीरी", "Perso-Arabic / Devanagari", "North",
                false, true, false, "SUPPORTED", "میگی ہند 20 پیکٹ سٹاکس منز تھاوِو"));

        // 17. Sindhi
        register(new LanguageCapability("sd-IN", "Sindhi", "سنڌي / सिन्धी", "Arabic / Devanagari", "West",
                false, true, false, "SUPPORTED", "ميگي جا 20 پيڪيٽ اسٽاڪ ۾ شامل ڪريو"));

        // 18. Sanskrit
        register(new LanguageCapability("sa-IN", "Sanskrit", "संस्कृतम्", "Devanagari", "Pan-India",
                false, true, false, "SUPPORTED", "मॅगी विंशति पुटकम् संचये योजयतु"));

        // 19. Maithili
        register(new LanguageCapability("mai-IN", "Maithili", "मैथिली", "Devanagari", "East",
                false, true, false, "SUPPORTED", "मैगी के 20 पैकेट स्टॉक में जोड़ू"));

        // 20. Dogri
        register(new LanguageCapability("doi-IN", "Dogri", "डोगरी", "Devanagari", "North",
                false, true, false, "SUPPORTED", "मैगी दे 20 पैकेट स्टाक च पा"));

        // 21. Bodo
        register(new LanguageCapability("brx-IN", "Bodo", "बड़ो", "Devanagari", "North-East",
                false, true, false, "SUPPORTED", "मेगिनी 20 पेकेट स्टकाव दाजाब"));

        // 22. Manipuri (Meitei)
        register(new LanguageCapability("mni-IN", "Manipuri", "মৈতৈলোন্", "Bengali / Meitei Mayek", "North-East",
                false, true, false, "SUPPORTED", "মেগী পেকেট ২০ স্তোক্তা হাপচিল্লু"));

        // 23. Santali
        register(new LanguageCapability("sat-IN", "Santali", "संथाली / ᱥᱟᱱᱛᱟᱲᱤ", "Ol Chiki / Devanagari", "East",
                false, true, false, "SUPPORTED", "ᱢᱮᱜᱤ ᱒᱐ ᱯᱮᱠᱮᱴ ᱤᱥᱴᱚᱠ ᱨᱮ ᱡᱩᱲᱟᱹᱭ ᱢᱮ"));

        // Regional dialect extensions (Section 2 - Transparently labeled)
        register(new LanguageCapability("bho-IN", "Bhojpuri", "भोजपुरी", "Devanagari", "North / East",
                false, true, false, "COMING_SOON", "मैगी के 20 पैकेट स्टॉक में डालब"));
        register(new LanguageCapability("raj-IN", "Rajasthani", "राजस्थानी", "Devanagari", "West",
                false, true, false, "COMING_SOON", "मैगी रा 20 पैकेट स्टॉक में जोड़ो"));
        register(new LanguageCapability("tcy-IN", "Tulu", "ತುಳು", "Kannada", "South",
                false, true, false, "COMING_SOON", "ಮ್ಯಾಗಿ 20 ಪ್ಯಾಕೆಟ್ ಸ್ಟಾಕ್ಗ್ ಪಾಲೆ"));
    }

    private void register(LanguageCapability cap) {
        registry.put(cap.getCode(), cap);
        // Also index short prefix (e.g. "te" -> "te-IN")
        String shortCode = cap.getCode().split("-")[0];
        if (!registry.containsKey(shortCode)) {
            registry.put(shortCode, cap);
        }
    }

    public List<LanguageCapability> getAllLanguages() {
        // Return unique canonical entries
        Set<String> seen = new HashSet<>();
        List<LanguageCapability> result = new ArrayList<>();
        for (LanguageCapability cap : registry.values()) {
            if (cap.getCode().contains("-") && seen.add(cap.getCode())) {
                result.add(cap);
            }
        }
        return result;
    }

    public LanguageCapability getCapability(String code) {
        if (code == null) return registry.get("en-IN");
        LanguageCapability cap = registry.get(code);
        if (cap != null) return cap;
        String shortCode = code.split("-")[0];
        return registry.getOrDefault(shortCode, registry.get("en-IN"));
    }

    /**
     * Intelligent Language and Script Identification (Section 7)
     */
    public DetectLanguageResponse detectLanguage(String text) {
        if (text == null || text.trim().isEmpty()) {
            return new DetectLanguageResponse(true, "en-IN", "English", "Latin", 0.50, false);
        }

        String raw = text.trim();
        String lower = raw.toLowerCase();

        // 1. Script checks
        // Telugu: \u0C00-\u0C7F
        if (hasScript(raw, "\\u0C00-\\u0C7F")) {
            return new DetectLanguageResponse(true, "te-IN", "Telugu", "Telugu", 0.98, true);
        }
        // Tamil: \u0B80-\u0BFF
        if (hasScript(raw, "\\u0B80-\\u0BFF")) {
            return new DetectLanguageResponse(true, "ta-IN", "Tamil", "Tamil", 0.98, true);
        }
        // Kannada: \u0C80-\u0CFF
        if (hasScript(raw, "\\u0C80-\\u0CFF")) {
            return new DetectLanguageResponse(true, "kn-IN", "Kannada", "Kannada", 0.98, true);
        }
        // Malayalam: \u0D00-\u0D7F
        if (hasScript(raw, "\\u0D00-\\u0D7F")) {
            return new DetectLanguageResponse(true, "ml-IN", "Malayalam", "Malayalam", 0.98, true);
        }
        // Gurmukhi / Punjabi: \u0A00-\u0A7F
        if (hasScript(raw, "\\u0A00-\\u0A7F")) {
            return new DetectLanguageResponse(true, "pa-IN", "Punjabi", "Gurmukhi", 0.98, true);
        }
        // Gujarati: \u0A80-\u0AFF
        if (hasScript(raw, "\\u0A80-\\u0AFF")) {
            return new DetectLanguageResponse(true, "gu-IN", "Gujarati", "Gujarati", 0.98, true);
        }
        // Odia: \u0B00-\u0B7F
        if (hasScript(raw, "\\u0B00-\\u0B7F")) {
            return new DetectLanguageResponse(true, "or-IN", "Odia", "Odia", 0.98, true);
        }
        // Bengali / Assamese: \u0980-\u09FF
        if (hasScript(raw, "\\u0980-\\u09FF")) {
            // Check specific Assamese characters (ৰ, ৱ)
            if (raw.contains("ৰ") || raw.contains("ৱ") || raw.contains("ষ্টকত") || raw.contains("যোগ কৰক")) {
                return new DetectLanguageResponse(true, "as-IN", "Assamese", "Bengali-Assamese", 0.97, true);
            }
            return new DetectLanguageResponse(true, "bn-IN", "Bengali", "Bengali", 0.98, true);
        }
        // Perso-Arabic (Urdu, Sindhi, Kashmiri): \u0600-\u06FF
        if (hasScript(raw, "\\u0600-\\u06FF\\uFB50-\\uFDFF")) {
            return new DetectLanguageResponse(true, "ur-IN", "Urdu", "Perso-Arabic", 0.98, true);
        }
        // Ol Chiki (Santali): \u1C50-\u1C7F
        if (hasScript(raw, "\\u1C50-\\u1C7F")) {
            return new DetectLanguageResponse(true, "sat-IN", "Santali", "Ol Chiki", 0.98, true);
        }
        // Devanagari script: Hindi, Marathi, Nepali, Sanskrit, Maithili, Konkani, etc.
        if (hasScript(raw, "\\u0900-\\u097F")) {
            // Check Marathi specific patterns
            if (lower.contains("करा") || lower.contains("जोडा") || lower.contains("स्टॉकमध्ये") || lower.contains("आहे") || lower.contains("विक्री")) {
                return new DetectLanguageResponse(true, "mr-IN", "Marathi", "Devanagari", 0.96, true);
            }
            // Check Nepali specific patterns
            if (lower.contains("थप्नुहोस्") || lower.contains("स्टकमा") || lower.contains("बिक्री")) {
                return new DetectLanguageResponse(true, "ne-IN", "Nepali", "Devanagari", 0.95, true);
            }
            return new DetectLanguageResponse(true, "hi-IN", "Hindi", "Devanagari", 0.96, true);
        }

        // 2. Romanized Indian Languages & Code-Switching (Section 25, 26)
        // Romanized Telugu markers
        if (lower.matches(".*\\b(cheyyi|cheyi|pettu|entha|chupinchu|ichanu|khata|undi|unnai|kavali|ammamu|biyyam|vele|repu|ee roju|lo|ki)\\b.*")) {
            return new DetectLanguageResponse(true, "te-IN", "Telugu (Romanized)", "Latin", 0.92, true);
        }
        // Romanized Hindi / Hinglish markers
        if (lower.matches(".*\\b(karo|jodo|kitna|kitni|dikhao|diye|diya|becha|bhejo|aaj|rupaye|udhaar|daalo|dal do|mein|chahiye)\\b.*")) {
            return new DetectLanguageResponse(true, "hi-IN", "Hindi (Hinglish)", "Latin", 0.92, true);
        }
        // Romanized Kannada markers
        if (lower.matches(".*\\b(haaki|serisi|kodbeku|eshtu|aayitu|maaratav|illa|beku|ge)\\b.*")) {
            return new DetectLanguageResponse(true, "kn-IN", "Kannada (Romanized)", "Latin", 0.90, true);
        }
        // Romanized Tamil markers
        if (lower.matches(".*\\b(serunga|podunga|evvalavu|aachu|kudunga|venum|la)\\b.*")) {
            return new DetectLanguageResponse(true, "ta-IN", "Tamil (Romanized)", "Latin", 0.90, true);
        }
        // Romanized Malayalam markers
        if (lower.matches(".*\\b(cherkkoo|cherkkuka|ethra|aayi|kodukkoo|kuravullath|il)\\b.*")) {
            return new DetectLanguageResponse(true, "ml-IN", "Malayalam (Romanized)", "Latin", 0.90, true);
        }

        // Default to English
        return new DetectLanguageResponse(true, "en-IN", "English", "Latin", 0.88, false);
    }

    private boolean hasScript(String text, String unicodePattern) {
        Pattern pattern = Pattern.compile(".*[" + unicodePattern + "].*");
        return pattern.matcher(text).matches();
    }

    /**
     * Normalize Indian digits (Devanagari, Telugu, Bengali, Gujarati, etc.) into standard Arabic numerals 0-9
     */
    public String normalizeNumerals(String text) {
        if (text == null) return "";
        StringBuilder sb = new StringBuilder();
        for (char c : text.toCharArray()) {
            if (c >= '\u0966' && c <= '\u096F') { // Devanagari ०-९
                sb.append((char) ('0' + (c - '\u0966')));
            } else if (c >= '\u09E6' && c <= '\u09EF') { // Bengali ০-৯
                sb.append((char) ('0' + (c - '\u09E6')));
            } else if (c >= '\u0A66' && c <= '\u0A6F') { // Gurmukhi ੦-੯
                sb.append((char) ('0' + (c - '\u0A66')));
            } else if (c >= '\u0AE6' && c <= '\u0AEF') { // Gujarati ૦-૯
                sb.append((char) ('0' + (c - '\u0AE6')));
            } else if (c >= '\u0B66' && c <= '\u0B6F') { // Odia ୦-୯
                sb.append((char) ('0' + (c - '\u0B66')));
            } else if (c >= '\u0C66' && c <= '\u0C6F') { // Telugu ౦-౯
                sb.append((char) ('0' + (c - '\u0C66')));
            } else if (c >= '\u0CE6' && c <= '\u0CEF') { // Kannada ೦-೯
                sb.append((char) ('0' + (c - '\u0CE6')));
            } else if (c >= '\u0D66' && c <= '\u0D6F') { // Malayalam ൦-൯
                sb.append((char) ('0' + (c - '\u0D66')));
            } else if (c >= '\u1C50' && c <= '\u1C59') { // Ol Chiki ᱐-᱙
                sb.append((char) ('0' + (c - '\u1C50')));
            } else {
                sb.append(c);
            }
        }
        return sb.toString();
    }
}
