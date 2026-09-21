package com.swaranidhi.service;

import com.swaranidhi.dto.*;
import com.swaranidhi.entity.Business;
import com.swaranidhi.entity.VoiceCommandLog;
import com.swaranidhi.repository.BusinessRepository;
import com.swaranidhi.repository.VoiceCommandLogRepository;
import com.swaranidhi.service.voice.LanguageCapabilityService;
import com.swaranidhi.service.voice.SpeechRecognitionProvider;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

@Service
public class VoiceService {

    private final VoiceCommandLogRepository voiceCommandLogRepository;
    private final BusinessRepository businessRepository;
    private final LanguageCapabilityService languageCapabilityService;
    private final SpeechRecognitionProvider speechProvider;

    public VoiceService(VoiceCommandLogRepository voiceCommandLogRepository,
                        BusinessRepository businessRepository,
                        LanguageCapabilityService languageCapabilityService,
                        @Qualifier("cloudSpeechProvider") SpeechRecognitionProvider speechProvider) {
        this.voiceCommandLogRepository = voiceCommandLogRepository;
        this.businessRepository = businessRepository;
        this.languageCapabilityService = languageCapabilityService;
        this.speechProvider = speechProvider;
    }

    /**
     * Speech-to-text transcription through configured SpeechRecognitionProvider
     */
    public TranscribeResponse transcribe(TranscribeRequest request) {
        if (request == null) {
            return new TranscribeResponse(false, "", "en-IN", 0.0, "none");
        }
        byte[] audioBytes = null;
        if (request.getAudioBase64() != null && !request.getAudioBase64().isEmpty()) {
            try {
                audioBytes = Base64.getDecoder().decode(request.getAudioBase64());
            } catch (Exception ignored) {}
        }
        return speechProvider.transcribe(audioBytes, request.getLanguageHint(), request.getFormat());
    }

    /**
     * Automatic language and script identification
     */
    public DetectLanguageResponse detectLanguage(DetectLanguageRequest request) {
        if (request == null || request.getText() == null) {
            return new DetectLanguageResponse(true, "en-IN", "English", "Latin", 0.50, false);
        }
        return languageCapabilityService.detectLanguage(request.getText());
    }

    /**
     * Universal language-neutral understanding engine (Section 22, 23, 24, 42)
     * Maps spoken or typed Indian input to NormalizedCommand without language-specific business logic.
     */
    public NormalizedCommand understand(Long businessId, VoiceCommandRequest request) {
        String rawText = request.getText() != null ? request.getText().trim() : "";
        Map<String, Object> context = request.getContext() != null ? request.getContext() : Collections.emptyMap();

        // 1. Language identification
        DetectLanguageResponse detected = languageCapabilityService.detectLanguage(rawText);
        String langCode = (request.getLanguage() != null && !request.getLanguage().equalsIgnoreCase("auto"))
                ? request.getLanguage()
                : detected.getLanguage();

        // 2. Numeral normalization (Converts Indian digits in Devanagari, Telugu, Bengali, Gujarati, etc. to 0-9)
        String normalizedText = languageCapabilityService.normalizeNumerals(rawText);

        // 3. NormalizedCommand construction
        NormalizedCommand cmd = new NormalizedCommand();
        cmd.setLanguage(langCode);
        cmd.setLanguageName(detected.getLanguageName());
        cmd.setLanguageConfidence(detected.getConfidence());
        cmd.setOriginalText(rawText);
        cmd.setContext(new HashMap<>(context));

        interpretToNormalizedCommand(normalizedText, rawText, langCode, context, cmd);

        // Log command
        logVoiceCommand(businessId, rawText, cmd.getLanguage(), cmd.getIntent(), cmd.getConfidence(), cmd.getMessage());

        return cmd;
    }

    @Transactional
    public VoiceCommandResponse processCommand(Long businessId, VoiceCommandRequest request) {
        NormalizedCommand cmd = understand(businessId, request);

        VoiceCommandResponse response = new VoiceCommandResponse();
        response.setSuccess(true);
        response.setLanguage(cmd.getLanguage());
        response.setIntent(cmd.getIntent());
        response.setAction(cmd.getIntent());
        response.setConfidence(cmd.getConfidence());
        response.setEntities(cmd.getEntities());
        response.setMessage(cmd.getMessage());
        response.setResponse(cmd.getResponse());
        response.setRequiresConfirmation(cmd.isConfirmationRequired());
        response.setRequiresFollowUp(cmd.isRequiresFollowUp());
        response.setFollowUpQuestion(cmd.getFollowUpQuestion());

        return response;
    }

    private void interpretToNormalizedCommand(String normalizedText, String originalText, String lang,
                                              Map<String, Object> context, NormalizedCommand cmd) {
        String lower = normalizedText.toLowerCase();
        Map<String, Object> entities = new HashMap<>();

        // Context follow-up: e.g. "Add 20 more" or "ఇంకా 20 పెట్టు"
        Pattern morePattern = Pattern.compile("(?:add|pettu|jodo|aur|inka|aur)\\s+(\\d+)(?:\\s+more|\\s+inkaa|\\s+aur)?", Pattern.CASE_INSENSITIVE);
        Matcher moreMatcher = morePattern.matcher(lower);
        if (moreMatcher.find() && context.containsKey("lastProduct")) {
            int qty = Integer.parseInt(moreMatcher.group(1));
            String prod = String.valueOf(context.get("lastProduct"));
            cmd.setIntent("ADD_STOCK");
            cmd.setProduct(prod);
            cmd.setQuantity(qty);
            cmd.setUnit("packets");
            cmd.setConfidence(0.96);
            cmd.setConfirmationRequired(true);

            entities.put("product", prod);
            entities.put("quantity", qty);
            entities.put("unit", "packets");
            cmd.setEntities(entities);

            String msg = formatResponse(lang, "ADD_STOCK", prod, qty, "packets");
            cmd.setMessage(msg);
            cmd.setResponse(msg);
            cmd.setStatus("AWAITING_CONFIRMATION");
            return;
        }

        // 1. TODAY'S SALES QUERY
        boolean isSalesKeyword = lower.contains("sale") || lower.contains("sell") || lower.contains("sold") ||
                lower.contains("बिक्री") || lower.contains("సేల్స్") || lower.contains("ಮಾರಾಟ") ||
                lower.contains("விற்பனை") || lower.contains("വിൽപ്പന") || lower.contains("বিক্রি") ||
                lower.contains("वेचाण") || lower.contains("ਵਿਕਰੀ") || lower.contains("bikri");
        boolean isTodayKeyword = lower.contains("today") || lower.contains("aaj") || lower.contains("आज") ||
                lower.contains("ee roju") || lower.contains("ఈరోజు") || lower.contains("ಇಂದು") ||
                lower.contains("இன்று") || lower.contains("ഇന്ന്") || lower.contains("আজকে");

        if ((isSalesKeyword && isTodayKeyword) || lower.contains("sales report") || lower.contains("today sales")) {
            cmd.setIntent("TODAY_SALES");
            cmd.setConfidence(0.98);
            cmd.setConfirmationRequired(false);
            String msg = formatResponse(lang, "TODAY_SALES", null, 0, null);
            cmd.setMessage(msg);
            cmd.setResponse(msg);
            cmd.setStatus("READY");
            return;
        }

        // 2. LOW STOCK QUERY
        if (lower.contains("low stock") || lower.contains("running low") || lower.contains("out of stock") ||
                lower.contains("takkuva stock") || lower.contains("తక్కువ స్టాక్") ||
                lower.contains("kam stock") || lower.contains("कम स्टॉक") ||
                lower.contains("ಕಡಿಮೆ ಸ್ಟಾಕ್") || lower.contains("குறைந்த இருப்பு") ||
                lower.contains("കുറഞ്ഞ സ്റ്റോക്ക്") || lower.contains("কম স্টক")) {
            cmd.setIntent("LOW_STOCK");
            cmd.setConfidence(0.98);
            cmd.setConfirmationRequired(false);
            String msg = formatResponse(lang, "LOW_STOCK", null, 0, null);
            cmd.setMessage(msg);
            cmd.setResponse(msg);
            cmd.setStatus("READY");
            return;
        }

        // 3. CHECK STOCK QUERY
        if (lower.contains("how much") || lower.contains("how many") || lower.contains("entha undi") ||
                lower.contains("kitna hai") || lower.contains("ಎಷ್ಟು ಇದೆ") || lower.contains("எவ்வளவு இருக்கிறது") ||
                lower.contains("কত আছে") || lower.contains("કેટલું છે") || lower.contains("ਕਿੰਨਾ ਹੈ")) {
            String prod = extractProductName(originalText);
            if (!prod.isBlank() && !prod.equalsIgnoreCase("Item")) {
                cmd.setIntent("CHECK_STOCK");
                cmd.setProduct(prod);
                cmd.setConfidence(0.95);
                cmd.setConfirmationRequired(false);
                entities.put("product", prod);
                cmd.setEntities(entities);
                String msg = formatResponse(lang, "CHECK_STOCK", prod, 0, null);
                cmd.setMessage(msg);
                cmd.setResponse(msg);
                cmd.setStatus("READY");
                return;
            }
        }

        // 4. CUSTOMER PAYMENT ("Ramesh paid 500", "రమేష్ 500 ఇచ్చాడు", "रमेश ने पांच सौ रुपये दिए")
        Pattern paymentPattern = Pattern.compile("([a-zA-Z\\u0900-\\u0D7F]+)\\s+(?:paid|ne|ichadu|diye|diya|kodutha)?\\s*(?:rs\\.?|rupees|rupaye|రూపాయలు|रुपये|₹)?\\s*(\\d+)", Pattern.CASE_INSENSITIVE);
        Matcher payMatcher = paymentPattern.matcher(normalizedText);
        if ((lower.contains("paid") || lower.contains("ichadu") || lower.contains("diye") || lower.contains("ఇచ్చాడు") || lower.contains("ಕೊಟ್ಟಿದ್ದಾರೆ")) && payMatcher.find()) {
            String customer = payMatcher.group(1).replaceAll("(?i)\\b(ne|ki|ko|gaariki|kku|ge)\\b", "").trim();
            int amount = Integer.parseInt(payMatcher.group(2));
            cmd.setIntent("CUSTOMER_PAYMENT");
            cmd.setCustomer(customer);
            cmd.setAmount((double) amount);
            cmd.setCurrency("INR");
            cmd.setConfidence(0.95);
            cmd.setConfirmationRequired(true);

            entities.put("customer", customer);
            entities.put("amount", amount);
            entities.put("currency", "INR");
            cmd.setEntities(entities);

            String msg = formatPaymentResponse(lang, customer, amount);
            cmd.setMessage(msg);
            cmd.setResponse(msg);
            cmd.setStatus("AWAITING_CONFIRMATION");
            return;
        }

        // 5. CUSTOMER KHATA QUERY
        if (lower.contains("khata") || lower.contains("ఖాతా") || lower.contains("खाता") || lower.contains("udhaar") || lower.contains("credit")) {
            String customer = extractCustomerName(originalText);
            if (!customer.isBlank()) {
                cmd.setIntent("CUSTOMER_KHATA");
                cmd.setCustomer(customer);
                cmd.setConfidence(0.95);
                cmd.setConfirmationRequired(false);
                entities.put("customer", customer);
                cmd.setEntities(entities);
                String msg = formatKhataResponse(lang, customer);
                cmd.setMessage(msg);
                cmd.setResponse(msg);
                cmd.setStatus("READY");
                return;
            }
        }

        // 6. SALE WITH CREDIT / CASH
        if (lower.contains("ichanu") || lower.contains("ఇచ్చాను") || lower.contains("diye") || lower.contains("दिए") ||
                lower.contains("sold") || lower.contains("ಮಾರಾಟ") || lower.contains("விற்றேன்")) {
            String customer = extractCustomerName(originalText);
            int qty = extractQuantity(normalizedText);
            String prod = extractProductName(originalText);
            String unit = extractUnit(normalizedText);

            cmd.setIntent("SALE");
            cmd.setCustomer(customer.isBlank() ? "Customer" : customer);
            cmd.setProduct(prod.isBlank() ? "Item" : prod);
            cmd.setQuantity(qty > 0 ? qty : 1);
            cmd.setUnit(unit);
            cmd.setPaymentMethod(lower.contains("credit") || lower.contains("khata") || lower.contains("udhaar") ? "CREDIT" : "CASH");
            cmd.setConfidence(0.93);
            cmd.setConfirmationRequired(true);

            entities.put("customer", cmd.getCustomer());
            entities.put("product", cmd.getProduct());
            entities.put("quantity", cmd.getQuantity());
            entities.put("unit", cmd.getUnit());
            entities.put("paymentMethod", cmd.getPaymentMethod());
            cmd.setEntities(entities);

            String msg = formatSaleResponse(lang, cmd.getCustomer(), cmd.getProduct(), cmd.getQuantity(), cmd.getUnit());
            cmd.setMessage(msg);
            cmd.setResponse(msg);
            cmd.setStatus("AWAITING_CONFIRMATION");
            return;
        }

        // 7. ADD STOCK (Core inventory command)
        int qty = extractQuantity(normalizedText);
        boolean isAddKeyword = lower.contains("add") || lower.contains("pettu") || lower.contains("jodo") ||
                lower.contains("యాడ్") || lower.contains("చేయి") || lower.contains("జోడించండి") || lower.contains("జోడించు") ||
                lower.contains("जोड़ो") || lower.contains("जोडा") || lower.contains("डालो") ||
                lower.contains("సేరిసి") || lower.contains("ಸೇರಿಸಿ") || lower.contains("ಹಾಕಿ") ||
                lower.contains("சேர்") || lower.contains("சேர்க்கவும்") ||
                lower.contains("ചേർക്കൂ") || lower.contains("ചേർക്കുക") ||
                lower.contains("যোগ") || lower.contains("ਉਮੇਰੋ") || lower.contains("ઉમેરો") ||
                lower.contains("ਪਾ ਦਿਓ") || lower.contains("ਪਾਓ") || lower.contains("ਜੋੜੋ") ||
                lower.contains("شامل") || lower.contains("ଯୋଡନ୍ତু") || lower.contains("থप्नुहोस्") ||
                lower.contains("दाजाब") || lower.contains("হಾಪచিল্লু") || lower.contains("stock");

        if (isAddKeyword || qty > 0) {
            String prod = extractProductName(originalText);
            String unit = extractUnit(normalizedText);

            // Check if product is missing
            if (prod.isBlank() || prod.equalsIgnoreCase("Item") || prod.equalsIgnoreCase("Product")) {
                cmd.setRequiresFollowUp(true);
                cmd.setMissingField("product");
                cmd.setIntent("ADD_STOCK");
                cmd.setQuantity(qty > 0 ? qty : 1);
                cmd.setFollowUpQuestion(formatFollowUp(lang, "product", null));
                cmd.setMessage(cmd.getFollowUpQuestion());
                cmd.setResponse(cmd.getFollowUpQuestion());
                cmd.setStatus("AWAITING_INPUT");
                return;
            }

            // Check if quantity is missing
            if (qty <= 0) {
                cmd.setRequiresFollowUp(true);
                cmd.setMissingField("quantity");
                cmd.setIntent("ADD_STOCK");
                cmd.setProduct(prod);
                cmd.setFollowUpQuestion(formatFollowUp(lang, "quantity", prod));
                cmd.setMessage(cmd.getFollowUpQuestion());
                cmd.setResponse(cmd.getFollowUpQuestion());
                cmd.setStatus("AWAITING_INPUT");
                return;
            }

            cmd.setIntent("ADD_STOCK");
            cmd.setProduct(prod);
            cmd.setQuantity(qty);
            cmd.setUnit(unit);
            cmd.setConfidence(0.96);
            cmd.setConfirmationRequired(true);

            entities.put("product", prod);
            entities.put("quantity", qty);
            entities.put("unit", unit);
            cmd.setEntities(entities);

            String msg = formatResponse(lang, "ADD_STOCK", prod, qty, unit);
            cmd.setMessage(msg);
            cmd.setResponse(msg);
            cmd.setStatus("AWAITING_CONFIRMATION");
            return;
        }

        // Unknown
        cmd.setIntent("UNKNOWN");
        cmd.setConfidence(0.40);
        cmd.setConfirmationRequired(false);
        String msg = formatUnknownResponse(lang);
        cmd.setMessage(msg);
        cmd.setResponse(msg);
        cmd.setStatus("UNKNOWN");
    }

    private void logVoiceCommand(Long businessId, String text, String lang, String intent, Double conf, String msg) {
        if (businessId == null) return;
        businessRepository.findById(businessId).ifPresent(b -> {
            try {
                VoiceCommandLog log = new VoiceCommandLog(b, text, lang, intent, conf, msg, false);
                voiceCommandLogRepository.save(log);
            } catch (Exception ignored) {}
        });
    }

    private int extractQuantity(String text) {
        Pattern p = Pattern.compile("\\b(\\d+)\\b");
        Matcher m = p.matcher(text);
        if (m.find()) {
            return Integer.parseInt(m.group(1));
        }
        return 0;
    }

    private String extractUnit(String text) {
        String lower = text.toLowerCase();
        if (lower.contains("kg") || lower.contains("kilo") || lower.contains("కిలో") || lower.contains("किलो") || lower.contains("கிலோ") || lower.contains("കിലോ") || lower.contains("ਕਿਲੋ") || lower.contains("કિલો") || lower.contains("কিলো") || lower.contains("କିଲୋ")) return "kg";
        if (lower.contains("packet") || lower.contains("packets") || lower.contains("ప్యాకెట్") || lower.contains("పాకెట్") || lower.contains("पैकेट") || lower.contains("पॅकेट") || lower.contains("पाकीट") || lower.contains("பாக்கெட்") || lower.contains("প্যাকেট") || lower.contains("ਪੈਕਟ") || lower.contains("પેકેટ") || lower.contains("پیکٹ") || lower.contains("പാക്കറ്റ") || lower.contains("ಪ್ಯಾಕೆಟ್")) return "packets";
        if (lower.contains("piece") || lower.contains("pieces") || lower.contains("pcs")) return "pcs";
        if (lower.contains("box") || lower.contains("boxes") || lower.contains("బాక్స్") || lower.contains("पेटी") || lower.contains("டப்பா") || lower.contains("ಡಬ್ಬ")) return "boxes";
        if (lower.contains("liter") || lower.contains("litres") || lower.contains("లీటర్") || lower.contains("लीटर") || lower.contains("ലിറ്റർ") || lower.contains("லிட்டர்")) return "litres";
        return "packets";
    }

    private String extractProductName(String text) {
        String lower = text.toLowerCase();
        if (lower.contains("maggi") || lower.contains("మేగి") || lower.contains("మ్యాగీ") ||
            lower.contains("मैगी") || lower.contains("मॅगी") || lower.contains("மகி") ||
            lower.contains("மேகி") || lower.contains("ಮ್ಯಾಗಿ") || lower.contains("മാഗി") ||
            lower.contains("ম্যাগি") || lower.contains("মেগী") || lower.contains("મેગી") ||
            lower.contains("ਮੈਗੀ") || lower.contains("ମ୍ୟାਗି") || lower.contains("میگی")) {
            return "Maggi";
        }
        if (lower.contains("heritage milk") || lower.contains("హెరిటేజ్ మిల్క్") || lower.contains("हेरिटेज मिल्क")) {
            return "Heritage Milk";
        }
        if (lower.contains("parle") || lower.contains("పార్లే") || lower.contains("पारले")) {
            return "Parle-G";
        }
        // Strip common multilingual stop words without mangling the brand or product name (e.g. "Heritage Milk", "Maggi")
        String cleaned = text.replaceAll("(?i)\\b(add|stock|lo|mein|cheyyi|pettu|jodo|karo|packets?|kg|kilo|pieces?|boxes?|how|much|do|i|have|entha|undi|kitna|hai|of|to|ke|కి|కో|స్టాక్|యాడ్|చేయి|జోడో|కరో|ప్యాకెట్లు|पैकेट|பாக்கெட்|প্যাকেট|சேர்|சேர்க்கவும்|ದಾಖಲಿಸಿ|ಸೇರ್|थप्नुहोस्)\\b", " ")
                .replaceAll("\\d+", " ")
                .replaceAll("[,.?!₹]", " ")
                .trim()
                .replaceAll("\\s+", " ");
        return cleaned.isBlank() ? "Product" : cleaned;
    }

    private String extractCustomerName(String text) {
        Pattern p = Pattern.compile("([a-zA-Z\\u0900-\\u0D7F]+)(?:\\s*ki|\\s*ko|\\s*ne|\\s*ka|\\s*ఖాతా|\\s*khata|\\s*खाता)", Pattern.CASE_INSENSITIVE);
        Matcher m = p.matcher(text);
        if (m.find()) {
            String c = m.group(1).trim();
            if (!c.equalsIgnoreCase("show") && !c.equalsIgnoreCase("chupinchu") && !c.equalsIgnoreCase("dikhao")) {
                return c;
            }
        }
        return "";
    }

    private String formatResponse(String lang, String intent, String prod, int qty, String unit) {
        String code = lang != null ? lang.toLowerCase() : "en";
        if ("ADD_STOCK".equals(intent)) {
            if (code.startsWith("te")) return "అర్థమైంది 👍 " + prod + " " + qty + " " + unit + " స్టాక్లో యాడ్ చేయాలా?";
            if (code.startsWith("hi")) return "समझ गया 👍 " + prod + " के " + qty + " " + unit + " स्टॉक में जोड़ दूँ?";
            if (code.startsWith("kn")) return "ಅರ್ಥವಾಯಿತು 👍 " + qty + " " + prod + " ಪ್ಯಾಕೆಟ್ಗಳನ್ನು ಸ್ಟಾಕ್ಗೆ ಸೇರಿಸಬೇಕೆ?";
            if (code.startsWith("ta")) return "புரிந்தது 👍 " + qty + " " + prod + " இருப்பில் சேர்க்கவா?";
            if (code.startsWith("ml")) return "മനസ്സിലായി 👍 " + qty + " " + prod + " സ്റ്റോക്കിൽ ചേർക്കണോ?";
            if (code.startsWith("bn")) return "বুঝেছি 👍 " + prod + " " + qty + " " + unit + " স্টকে যোগ করব?";
            if (code.startsWith("mr")) return "समजले 👍 " + prod + " चे " + qty + " " + unit + " स्टॉकमध्ये जोडू का?";
            if (code.startsWith("gu")) return "સમજી ગયો 👍 " + prod + " ના " + qty + " " + unit + " સ્ટોકમાં ઉમેરું?";
            if (code.startsWith("pa")) return "ਸਮਝ ਗਿਆ 👍 " + prod + " ਦੇ " + qty + " " + unit + " ਸਟਾਕ ਵਿੱਚ ਪਾ ਦੇਵਾਂ?";
            if (code.startsWith("ur")) return "سمجھ گیا 👍 " + prod + " کے " + qty + " " + unit + " اسٹاک میں شامل کریں؟";
            return "Got it 👍 Add " + qty + " " + unit + " of " + prod + " to stock?";
        } else if ("TODAY_SALES".equals(intent)) {
            if (code.startsWith("te")) return "ఈరోజు అమ్మకాల వివరాలు చూపిస్తున్నాను.";
            if (code.startsWith("hi")) return "आज की कुल बिक्री रिपोर्ट दिखा रहा हूँ।";
            if (code.startsWith("kn")) return "ಇಂದಿನ ಒಟ್ಟು ಮಾರಾಟ ವಿವರಗಳನ್ನು ತೆರೆಯುತ್ತಿದ್ದೇನೆ.";
            if (code.startsWith("ta")) return "இன்றைய விற்பனை விவரங்களை காட்டுகிறேன்.";
            return "Showing today's sales summary.";
        } else if ("LOW_STOCK".equals(intent)) {
            if (code.startsWith("te")) return "తక్కువ స్టాక్ ఉన్న వస్తువుల వివరాలు చూపిస్తున్నాను.";
            if (code.startsWith("hi")) return "कम स्टॉक वाले आइटम दिखा रहा हूँ।";
            return "Showing low stock items that need restocking.";
        } else if ("CHECK_STOCK".equals(intent)) {
            if (code.startsWith("te")) return prod + " స్టాక్ తనిఖీ చేస్తున్నాను...";
            if (code.startsWith("hi")) return prod + " का स्टॉक चेक कर रहा हूँ...";
            return "Checking current stock for " + prod + "...";
        }
        return "Command understood.";
    }

    private String formatPaymentResponse(String lang, String customer, int amount) {
        String code = lang != null ? lang.toLowerCase() : "en";
        if (code.startsWith("te")) return customer + " ఇచ్చిన ₹" + amount + " పేమెంట్ రికార్డ్ చేయాలా?";
        if (code.startsWith("hi")) return "समझ गया। " + customer + " ने ₹" + amount + " का भुगतान किया है। इसे खाते में दर्ज कर दूँ?";
        return "Record payment of ₹" + amount + " received from " + customer + "?";
    }

    private String formatKhataResponse(String lang, String customer) {
        String code = lang != null ? lang.toLowerCase() : "en";
        if (code.startsWith("te")) return customer + " ఖాతా వివరాలు తెరుస్తున్నాను...";
        if (code.startsWith("hi")) return customer + " का खाता खोल रहा हूँ...";
        return "Opening Khata ledger for " + customer + "...";
    }

    private String formatSaleResponse(String lang, String customer, String prod, int qty, String unit) {
        String code = lang != null ? lang.toLowerCase() : "en";
        if (code.startsWith("te")) return customer + " కి " + qty + " " + unit + " " + prod + " సేల్ రికార్డ్ చేయాలా?";
        if (code.startsWith("hi")) return customer + " को " + qty + " " + unit + " " + prod + " की बिक्री दर्ज करें?";
        return "Record sale of " + qty + " " + unit + " " + prod + " to " + customer + "?";
    }

    private String formatFollowUp(String lang, String field, String prod) {
        String code = lang != null ? lang.toLowerCase() : "en";
        if ("product".equals(field)) {
            if (code.startsWith("te")) return "ఖచ్చితంగా. ఏ వస్తువు స్టాక్లో యాడ్ చేయాలి?";
            if (code.startsWith("hi")) return "ज़रूर। कौन सा आइटम जोड़ना है?";
            return "Sure. Which product should I add?";
        } else if ("quantity".equals(field)) {
            if (code.startsWith("te")) return prod + " ఎన్ని ప్యాకెట్లు యాడ్ చేయాలి?";
            if (code.startsWith("hi")) return prod + " के कितने पैकेट जोड़ने हैं?";
            return "How many " + prod + " should I add?";
        }
        return "Could you please provide more details?";
    }

    private String formatUnknownResponse(String lang) {
        String code = lang != null ? lang.toLowerCase() : "en";
        if (code.startsWith("te")) return "క్షమించండి, నాకు అర్థం కాలేదు. దయచేసి మళ్లీ చెప్పండి.";
        if (code.startsWith("hi")) return "माफ़ कीजिये, मैं समझ नहीं पाया। कृपया दोबारा कहें।";
        return "I didn't quite understand that. Try saying: 'Add 20 packets of Maggi' or 'Today sales'.";
    }
}
