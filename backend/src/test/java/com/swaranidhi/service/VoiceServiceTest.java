package com.swaranidhi.service;

import com.swaranidhi.dto.VoiceCommandRequest;
import com.swaranidhi.dto.VoiceCommandResponse;
import com.swaranidhi.entity.Business;
import com.swaranidhi.repository.BusinessRepository;
import com.swaranidhi.repository.VoiceCommandLogRepository;
import com.swaranidhi.service.voice.BrowserSpeechProvider;
import com.swaranidhi.service.voice.LanguageCapabilityService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Map;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class VoiceServiceTest {

    @Mock
    private VoiceCommandLogRepository voiceCommandLogRepository;

    @Mock
    private BusinessRepository businessRepository;

    private VoiceService voiceService;
    private Business testBusiness;

    @BeforeEach
    void setUp() {
        LanguageCapabilityService capService = new LanguageCapabilityService();
        BrowserSpeechProvider speechProvider = new BrowserSpeechProvider();
        voiceService = new VoiceService(voiceCommandLogRepository, businessRepository, capService, speechProvider);

        testBusiness = new Business("Test Kirana", "Owner", "9876543210", "owner@test.com", "Vijayawada", "AP");
        testBusiness.setId(1L);
        when(businessRepository.findById(1L)).thenReturn(Optional.of(testBusiness));
    }

    @Test
    @DisplayName("Test 1: English - Add 20 packets of Maggi")
    void testEnglishAddStock() {
        VoiceCommandRequest req = new VoiceCommandRequest("Add 20 packets of Maggi", "auto");
        VoiceCommandResponse res = voiceService.processCommand(1L, req);

        assertEquals("ADD_STOCK", res.getIntent());
        assertTrue(res.getLanguage().startsWith("en"));
        assertTrue(res.getConfidence() >= 0.85);
        assertEquals(20, res.getEntities().get("quantity"));
    }

    @Test
    @DisplayName("Test 2: Romanized Telugu - Maggi 20 packets stock lo add cheyyi")
    void testRomanizedTeluguAddStock() {
        VoiceCommandRequest req = new VoiceCommandRequest("Maggi 20 packets stock lo add cheyyi", "auto");
        VoiceCommandResponse res = voiceService.processCommand(1L, req);

        assertEquals("ADD_STOCK", res.getIntent());
        assertTrue(res.getLanguage().startsWith("te"));
        assertEquals(20, res.getEntities().get("quantity"));
    }

    @Test
    @DisplayName("Test 3: Telugu Script - మ్యాగీ 20 ప్యాకెట్లు యాడ్ చేయి")
    void testTeluguScriptAddStock() {
        VoiceCommandRequest req = new VoiceCommandRequest("మ్యాగీ 20 ప్యాకెట్లు యాడ్ చేయి", "auto");
        VoiceCommandResponse res = voiceService.processCommand(1L, req);

        assertEquals("ADD_STOCK", res.getIntent());
        assertTrue(res.getLanguage().startsWith("te"));
    }

    @Test
    @DisplayName("Test 4: Hindi Script - मैगी के 20 पैकेट जोड़ो")
    void testHindiScriptAddStock() {
        VoiceCommandRequest req = new VoiceCommandRequest("मैगी के 20 पैकेट जोड़ो", "auto");
        VoiceCommandResponse res = voiceService.processCommand(1L, req);

        assertEquals("ADD_STOCK", res.getIntent());
        assertTrue(res.getLanguage().startsWith("hi"));
    }

    @Test
    @DisplayName("Test 5: Hinglish - Maggi ke 20 packets stock mein add karo")
    void testHinglishAddStock() {
        VoiceCommandRequest req = new VoiceCommandRequest("Maggi ke 20 packets stock mein add karo", "auto");
        VoiceCommandResponse res = voiceService.processCommand(1L, req);

        assertEquals("ADD_STOCK", res.getIntent());
        assertTrue(res.getLanguage().startsWith("hi"));
        assertEquals(20, res.getEntities().get("quantity"));
    }

    @Test
    @DisplayName("Test 6: Credit Sale - Ramesh ki 5 Maggi packets ichanu")
    void testCreditSaleTelugu() {
        VoiceCommandRequest req = new VoiceCommandRequest("Ramesh ki 5 Maggi packets ichanu", "auto");
        VoiceCommandResponse res = voiceService.processCommand(1L, req);

        assertEquals("SALE", res.getIntent());
        assertEquals("Ramesh", res.getEntities().get("customer"));
    }

    @Test
    @DisplayName("Test 7: Customer Payment - Ramesh ne 500 rupaye diye")
    void testCustomerPaymentHindi() {
        VoiceCommandRequest req = new VoiceCommandRequest("Ramesh ne 500 rupaye diye", "auto");
        VoiceCommandResponse res = voiceService.processCommand(1L, req);

        assertEquals("CUSTOMER_PAYMENT", res.getIntent());
        assertEquals("Ramesh", res.getEntities().get("customer"));
        assertEquals(500, res.getEntities().get("amount"));
    }

    @Test
    @DisplayName("Test 8: Customer Payment Telugu - రమేష్ 500 రూపాయలు ఇచ్చాడు")
    void testCustomerPaymentTeluguScript() {
        VoiceCommandRequest req = new VoiceCommandRequest("రమేష్ 500 రూపాయలు ఇచ్చాడు", "auto");
        VoiceCommandResponse res = voiceService.processCommand(1L, req);

        assertEquals("CUSTOMER_PAYMENT", res.getIntent());
        assertTrue(res.getLanguage().startsWith("te"));
    }

    @Test
    @DisplayName("Test 9: Sales Report Hindi - आज की sales कितनी है?")
    void testSalesReportHindi() {
        VoiceCommandRequest req = new VoiceCommandRequest("आज की sales कितनी है?", "auto");
        VoiceCommandResponse res = voiceService.processCommand(1L, req);

        assertEquals("TODAY_SALES", res.getIntent());
    }

    @Test
    @DisplayName("Test 10: Sales Report Telugu - ఈరోజు సేల్స్ ఎంత?")
    void testSalesReportTelugu() {
        VoiceCommandRequest req = new VoiceCommandRequest("ఈరోజు సేల్స్ ఎంత?", "auto");
        VoiceCommandResponse res = voiceService.processCommand(1L, req);

        assertEquals("TODAY_SALES", res.getIntent());
    }

    @Test
    @DisplayName("Test 11: Low Stock English - Show low stock")
    void testLowStockEnglish() {
        VoiceCommandRequest req = new VoiceCommandRequest("Show low stock", "auto");
        VoiceCommandResponse res = voiceService.processCommand(1L, req);

        assertEquals("LOW_STOCK", res.getIntent());
    }

    @Test
    @DisplayName("Test 14 & 15: Conversational Context - Follow-up 'Add 20 more'")
    void testConversationalContextFollowUp() {
        VoiceCommandRequest followUpReq = new VoiceCommandRequest("Add 20 more", "auto");
        followUpReq.setContext(Map.of("lastProduct", "Maggi 2-Minute Noodles"));

        VoiceCommandResponse res = voiceService.processCommand(1L, followUpReq);

        assertEquals("ADD_STOCK", res.getIntent());
        assertEquals("Maggi 2-Minute Noodles", res.getEntities().get("product"));
        assertEquals(20, res.getEntities().get("quantity"));
    }

    @Test
    @DisplayName("Step 19: All 10 Official Test Phrases Normalize to ADD_STOCK Maggi 20 packets")
    void testTenOfficialStep19Languages() {
        String[][] testPhrases = {
            {"en", "Add 20 packets of Maggi"},
            {"te", "20 ప్యాకెట్ల మేగి జోడించండి"},
            {"hi", "मैगी के 20 पैकेट जोड़ो"},
            {"ta", "20 பாக்கெட்டுகளைச் மேகி சேர்க்கவும்"},
            {"kn", "20 ಪ್ಯಾಕೆಟ್ಗಳನ್ನು ಮ್ಯಾಗಿ ಸೇರಿಸಿ"},
            {"ml", "20 പാക്കറ്റുകൾ മാഗി ചേർക്കുക"},
            {"mr", "मॅगीचे 20 पाकीट जोडा"},
            {"bn", "20 প্যাকেট ম্যাগি যোগ করুন"},
            {"gu", "20 પેકેટ મેગી ઉમેરો"},
            {"pa", "20 ਪੈਕਟ ਮੈਗੀ ਜੋੜੋ"}
        };

        for (String[] test : testPhrases) {
            String lang = test[0];
            String phrase = test[1];
            VoiceCommandRequest req = new VoiceCommandRequest(phrase, lang);
            VoiceCommandResponse res = voiceService.processCommand(1L, req);

            assertEquals("ADD_STOCK", res.getIntent(), "Failed intent for " + lang + ": " + phrase);
            assertEquals(20, res.getEntities().get("quantity"), "Failed quantity for " + lang);
            assertEquals("packets", res.getEntities().get("unit"), "Failed unit for " + lang);
            assertEquals("Maggi", res.getEntities().get("product"), "Failed product for " + lang);
        }
    }
}
