package com.swaranidhi.service;

import com.swaranidhi.entity.Customer;
import com.swaranidhi.entity.Product;
import com.swaranidhi.repository.CustomerRepository;
import com.swaranidhi.repository.ProductRepository;
import com.swaranidhi.repository.SaleRepository;
import com.swaranidhi.service.llm.GeminiLLMProvider;
import com.swaranidhi.service.llm.RuleBasedLLMProvider;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class AssistantService {

    private final ProductRepository productRepository;
    private final SaleRepository saleRepository;
    private final CustomerRepository customerRepository;
    private final AlertsService alertsService;
    private final GeminiLLMProvider geminiLLMProvider;
    private final RuleBasedLLMProvider ruleBasedLLMProvider;

    public AssistantService(ProductRepository productRepository,
                            SaleRepository saleRepository,
                            CustomerRepository customerRepository,
                            AlertsService alertsService,
                            GeminiLLMProvider geminiLLMProvider,
                            RuleBasedLLMProvider ruleBasedLLMProvider) {
        this.productRepository = productRepository;
        this.saleRepository = saleRepository;
        this.customerRepository = customerRepository;
        this.alertsService = alertsService;
        this.geminiLLMProvider = geminiLLMProvider;
        this.ruleBasedLLMProvider = ruleBasedLLMProvider;
    }

    @Transactional(readOnly = true)
    public Map<String, Object> query(Long businessId, String userQuery) {
        LocalDateTime startOfToday = LocalDate.now().atStartOfDay();
        LocalDateTime endOfToday = LocalDate.now().atTime(LocalTime.MAX);

        // 1. Gather context
        BigDecimal todaySales = saleRepository.sumTotalByBusinessIdAndDateRange(businessId, startOfToday, endOfToday);
        long todaySalesCount = saleRepository.countSalesByBusinessIdAndDateRange(businessId, startOfToday, endOfToday);

        List<Product> allProducts = productRepository.findByBusinessIdAndActiveTrue(businessId);
        List<Product> lowStock = alertsService.getLowStockAlerts(businessId);
        Map<String, Object> expiry = alertsService.getExpiryAlerts(businessId);
        List<Map<String, Object>> fastMoving = alertsService.getFastMovingAlerts(businessId);

        BigDecimal customerDues = customerRepository.sumTotalOutstandingKhata(businessId);
        List<Customer> allCustomers = customerRepository.findByBusinessIdOrderByNameAsc(businessId);
        List<Map<String, Object>> topCustomerDues = allCustomers.stream()
                .filter(c -> c.getCurrentBalance() != null && c.getCurrentBalance().compareTo(BigDecimal.ZERO) > 0)
                .sorted((a, b) -> b.getCurrentBalance().compareTo(a.getCurrentBalance()))
                .limit(10)
                .map(c -> {
                    Map<String, Object> cm = new HashMap<>();
                    cm.put("name", c.getName());
                    cm.put("phone", c.getPhone());
                    cm.put("balance", c.getCurrentBalance());
                    return cm;
                })
                .collect(Collectors.toList());

        List<Map<String, Object>> productSummaryList = allProducts.stream().map(p -> {
            Map<String, Object> m = new HashMap<>();
            m.put("id", p.getId());
            m.put("name", p.getName());
            m.put("category", p.getCategory());
            m.put("quantity", p.getQuantity());
            m.put("unit", p.getUnit());
            m.put("sellingPrice", p.getSellingPrice());
            m.put("status", p.getStatus() != null ? p.getStatus().name() : "UNKNOWN");
            m.put("expiryDate", p.getExpiryDate() != null ? p.getExpiryDate().toString() : null);
            return m;
        }).collect(Collectors.toList());

        List<Map<String, Object>> lowStockList = lowStock.stream().map(p -> {
            Map<String, Object> m = new HashMap<>();
            m.put("name", p.getName());
            m.put("quantity", p.getQuantity());
            m.put("unit", p.getUnit());
            return m;
        }).collect(Collectors.toList());

        @SuppressWarnings("unchecked")
        List<Product> expiredList = (List<Product>) expiry.get("expired");
        @SuppressWarnings("unchecked")
        List<Product> expiringSoonList = (List<Product>) expiry.get("expiringSoon");

        List<Map<String, Object>> expiredSummaries = expiredList.stream().map(p -> {
            Map<String, Object> m = new HashMap<>();
            m.put("name", p.getName());
            m.put("quantity", p.getQuantity());
            m.put("batchNumber", p.getBatchNumber());
            m.put("expiryDate", p.getExpiryDate() != null ? p.getExpiryDate().toString() : "");
            return m;
        }).collect(Collectors.toList());

        List<Map<String, Object>> expiringSoonSummaries = expiringSoonList.stream().map(p -> {
            Map<String, Object> m = new HashMap<>();
            m.put("name", p.getName());
            m.put("quantity", p.getQuantity());
            m.put("expiryDate", p.getExpiryDate() != null ? p.getExpiryDate().toString() : "");
            return m;
        }).collect(Collectors.toList());

        Map<String, Object> context = new HashMap<>();
        context.put("todaySales", todaySales != null ? todaySales : BigDecimal.ZERO);
        context.put("todaySalesCount", (int) todaySalesCount);
        context.put("totalProducts", allProducts.size());
        context.put("lowStockProducts", lowStockList);
        context.put("expiredProducts", expiredSummaries);
        context.put("expiringProducts", expiringSoonSummaries);
        context.put("fastMovingProducts", fastMoving);
        context.put("totalCustomerDue", customerDues != null ? customerDues : BigDecimal.ZERO);
        context.put("topCustomerDues", topCustomerDues);
        context.put("allProducts", productSummaryList);

        String systemPrompt = "You are Swaranidhi AI, an intelligent shop assistant for Indian small businesses. " +
                "Answer the shopkeeper's question using ONLY the provided verified inventory, sales, and khata records. " +
                "Never invent imaginary products or figures. Be concise, respectful, and helpful.";

        String answer = null;
        String provider = "RuleBasedLLMProvider";

        if (geminiLLMProvider.isAvailable()) {
            answer = geminiLLMProvider.generateResponse(systemPrompt, userQuery, context);
            if (answer != null && !answer.isBlank()) {
                provider = geminiLLMProvider.getProviderName();
            }
        }

        if (answer == null || answer.isBlank()) {
            answer = ruleBasedLLMProvider.generateResponse(systemPrompt, userQuery, context);
            provider = ruleBasedLLMProvider.getProviderName();
        }

        Map<String, Object> response = new HashMap<>();
        response.put("query", userQuery);
        response.put("answer", answer);
        response.put("provider", provider);
        response.put("timestamp", LocalDateTime.now().toString());

        return response;
    }
}
