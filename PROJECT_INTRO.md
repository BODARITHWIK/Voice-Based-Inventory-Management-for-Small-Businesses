# 🎙️ PROJECT INTRODUCTION: SWARANIDHI (स्वर्णनिधि / స్వరనిధి)

> **"Speak. Manage. Grow."** — *AI-Powered Voice-Based Inventory, POS & Khata Operating System for Indian Micro-Retailers*

---

## 1. Project Abstract & Synopsis

**Swaranidhi** is an intelligent, voice-first retail operating platform specifically engineered to bridge the digital divide for India's **13+ million neighborhood Kirana stores and small businesses**. 

While modern retail conglomerates rely on multi-million dollar enterprise ERPs, traditional neighborhood merchants still depend on manual pen-and-paper ledgers (*bahi-khata*) and memory. Conventional inventory software fails these merchants due to language barriers, steep learning curves, and the physical impossibility of typing on a keyboard while attending to customers.

**Swaranidhi** solves this by transforming the merchant's natural voice and smartphone camera into an enterprise-grade retail controller. Shopkeepers can speak naturally in any of **22 official Indian languages** (plus English, Hinglish, and Tanglish) or snap a photo of product packaging to update stock, generate bills, manage customer credit ledgers, and prevent loss from expired goods.

---

## 2. Problem Statement & Motivation

### Real-world Challenges of Indian Micro-Retailers:
1. **The Language Barrier:** Over 85% of small shopkeepers are not fluent in English and find traditional accounting software confusing and alienating.
2. **Data-Entry Bottlenecks:** A shopkeeper handles 150–300 rapid cash transactions daily. Stopping to type product names, SKUs, and prices on a PC or mobile keypad during rush hours is impractical.
3. **Trapped Capital in Paper Khata:** Informal customer credit (*udhaar*) is tracked on paper notebooks that are prone to damage, calculation errors, disputes, and forgotten receivables.
4. **Stock Loss & Silent Expiries:** FMCG and dairy products frequently expire unnoticed on shelves, costing retailers 4%–7% of their annual profit margins.

---

## 3. Core Innovations & Unique Selling Points (USPs)

### 🗣️ Multilingual Conversational Intelligence
- **Zero-Translation Voice Understanding:** Understands commands in 22 Eighth Schedule Indian languages (Hindi, Telugu, Tamil, Kannada, Marathi, Bengali, Gujarati, Punjabi, etc.) plus mixed-language dialects (Hinglish, Tanglish).
- **Colloquial Grammar Parser:** Interprets natural sentences like *"Heritage doodh 5 packet add cheyyi"*, *"Ramesh ku 250 roobai udhaar podu"*, or *"Aaj kitna dhanda hua?"*.
- **Speech Synthesis (TTS):** Speaks back confirmations in the merchant's chosen language.

### 📷 Mobile-First AI Stock Photo Analysis
- **Point-and-Scan Inventory:** Shopkeepers can point their phone camera at a crate or product shelf to capture stock.
- **Vision + OCR Parsing:** Recognizes brands, packaging sizes, barcodes, batch numbers, and expiry dates without manual typing.
- **Confidence Scoring & Conflict Resolution:** Highlights multiple product matches for merchant confirmation.
- **Offline Resilience:** Actions performed without an internet connection are queued locally in `AsyncStorage` and automatically synchronized when connectivity resumes.

### 🛒 Fast POS Billing & Automated WhatsApp Khata
- **Lightning POS Billing:** Build carts via voice, barcode, or touch chips with automatic tax and line-item totals.
- **Digital Receipts:** Generates instant printable and shareable digital invoices.
- **1-Click WhatsApp Khata Reminders:** Automatically generates polite, pre-formatted WhatsApp reminder links (`wa.me`) with exact pending amounts.

### ⚠️ Expiry Tracking & Automated Write-Offs
- **Batch & Shelf-Life Management:** Products track `manufacturingDate`, `expiryDate`, and `batchNumber`.
- **Proactive Alerts:** Visual alerts for items *Expiring within 7 days* to enable discount clearance.
- **Auditable Write-Offs:** 1-click removal of expired stock with dedicated `EXPIRED_REMOVAL` audit trails.

---

## 4. Technical Architecture

```
                                  USER INTERFACES
                 ┌─────────────────────────────────────────────────┐
                 │                                                 │
                 ▼                                                 ▼
      ┌────────────────────────┐                        ┌────────────────────────┐
      │   💻 React 19 Web App  │                        │ 📱 React Native Mobile  │
      │   (Vite, MUI, Speech)  │                        │  (Expo 51, Vision/Cam) │
      └───────────┬────────────┘                        └───────────┬────────────┘
                  │                                                 │
                  └───────────────────────┬─────────────────────────┘
                                          │ REST APIs / JWT Authentication
                                          ▼
                         ┌─────────────────────────────────┐
                         │   ⚡ Spring Boot 3.2 Backend    │
                         ├─────────────────────────────────┤
                         │ • Multilingual Voice Engine     │
                         │ • Computer Vision & OCR Service │
                         │ • Billing & Khata Engine        │
                         │ • Smart Alerts & Expiry Service │
                         │ • Gemini LLM & Rule-Based Agent │
                         └────────────────┬────────────────┘
                                          │
                                          ▼
                         ┌─────────────────────────────────┐
                         │      🗄️ PostgreSQL / H2 DB      │
                         │   (Multi-Tenant Kirana Store)   │
                         └─────────────────────────────────┘
```

### Technology Stack:
- **Web Frontend:** React 19, Vite, Material UI (MUI v6), Recharts, Web Speech API, Axios.
- **Mobile App:** React Native, Expo 51, React Navigation, Expo Camera, Expo Speech, AsyncStorage.
- **Backend Services:** Java 17, Spring Boot 3.2.3, Spring Security 6 (Stateless JWT), Spring Data JPA.
- **AI & LLM Services:** Google Gemini 1.5 Flash API + Fallback Deterministic Context Parser.
- **Database:** PostgreSQL 16 (Production) / In-Memory H2 (Development & Testing).

---

## 5. Live Project Presentation Scripts

### 🎙️ 1-Minute Elevator Pitch (For Quick Demos & Evaluators)
> *"Good morning. I am presenting **Swaranidhi** — an AI-powered voice and vision operating system for India's 13 million neighborhood Kirana stores.*
>
> *Traditional retail software requires typing in English, which small shopkeepers cannot do while managing customers. Swaranidhi replaces keyboards with natural voice and camera vision.*
>
> *A merchant can speak in **Hindi, Telugu, Tamil, or any of 22 Indian languages** to record stock or sales. They can take a photo of a shelf using their smartphone, and our computer vision automatically identifies the product, batch, and expiry date. Customers' credit accounts are tracked digitally, and polite WhatsApp payment reminders can be sent with a single tap.*
>
> *By eliminating language barriers and clerical overhead, Swaranidhi empowers local merchants to **Speak. Manage. and Grow.** Thank you."*

---

### 🎙️ 3-Minute In-Depth Presentation (For Project Reviews & Viva)

1. **Introduction & Context (0:00 - 0:45):**
   - *"Respected panel members, micro-retailers in India power over $800 billion in annual commerce, yet over 90% still rely on paper notebooks. Enterprise software built for Western supermarkets simply does not work in an Indian Kirana context."*
2. **The Innovation (0:45 - 1:45):**
   - *"Swaranidhi introduces three breakthrough capabilities:*
     - *First: A conversational voice engine supporting 22 Indian languages and colloquial dialects that parses intent, item name, and quantity in real time.*
     - *Second: AI Stock Photo Analysis that uses camera OCR to extract product details, batch numbers, and expiration dates directly from packaging.*
     - *Third: Digital Khata management with automated WhatsApp reminder integration and 1-click write-off of expired goods."*
3. **Technical Highlights (1:45 - 2:30):**
   - *"The system follows an enterprise three-tier architecture: a cross-platform React web dashboard, a native Expo mobile application, and a shared Spring Boot microservice backend with stateless JWT security and PostgreSQL persistence. If network connectivity drops, the mobile client buffers transactions offline and synchronizes automatically."*
4. **Conclusion & Impact (2:30 - 3:00):**
   - *"Swaranidhi proves that cutting-edge artificial intelligence can be made accessible, practical, and transformative for everyday small businesses. Thank you, and I am happy to demonstrate the live system."*

---

## 6. Project Metadata
- **Project Title:** Swaranidhi (AI-Powered Voice-Based Inventory Management System)
- **Tagline:** Speak. Manage. Grow.
- **Domain:** Artificial Intelligence, Mobile Computing, Retail Tech, Natural Language Processing.
- **Repository:** Cross-platform Monorepo (`/src`, `/mobile`, `/backend`).
