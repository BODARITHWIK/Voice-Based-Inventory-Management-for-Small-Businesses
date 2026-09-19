# Swaranidhi Mobile Application 📱

AI-Powered Voice-Based Inventory Management System for Small Businesses
**"Speak. Manage. Grow."**

The Swaranidhi Mobile App provides a unified, mobile-first experience for Indian shopkeepers, sharing the exact same Spring Boot backend and PostgreSQL/H2 database as the web application.

---

## 🚀 Key Features

1. **Dashboard (Section 43)**:
   - Greeting ("Good morning 👋") & Shop name ("Swaranidhi Kirana")
   - KPI row: Today's Sales (₹), Low Stock count, Total Products
   - 6-Pack Quick Action Grid (🎤 Speak, 📷 Scan Stock, ➕ Add Stock, 🛒 New Sale, 👤 Khata, 📦 Products)
   - Smart Alert Banner & Offline Sync Indicator

2. **AI Stock Photo Analysis (Section 44)**:
   - Camera Viewfinder with visual framing guide
   - Take Photo & Choose from Gallery
   - OCR & packaging recognition with confidence scoring
   - Multi-candidate resolution
   - Quick + Add to Stock / - Deduct Stock actions
   - Offline Queue & auto-sync when online

3. **Multilingual Voice Assistant**:
   - 22 Eighth Schedule Indian Languages + English
   - Speech synthesis / audio feedback via Expo Speech
   - Natural language shop querying (sales, low stock, customer dues, expiry)

4. **POS Billing & Khata**:
   - Quick cart builder with estimated GST calculation
   - Cash, UPI, or Khata (Credit) checkout
   - Digital receipt view
   - Khata debtor ledger with 1-click WhatsApp reminder link (`wa.me`)

5. **Smart Inventory Alerts & Expiry Management**:
   - Real-time Low Stock & Out-of-Stock alerts
   - 7-day sales velocity and fast-moving items
   - Expired products with 1-click stock write-off

---

## 🛠 Running the Mobile App

### Prerequisites
- Node.js 18+
- Expo CLI (`npm install -g expo-cli` or via `npx expo`)
- Expo Go on your Android or iOS device (available on Google Play Store & Apple App Store)

### Quick Start
```bash
cd mobile
npm install
npx expo start
```

- Scan the QR code in your terminal with the **Expo Go** app on your phone.
- Or press `a` for Android Emulator, `i` for iOS Simulator, or `w` for Web preview.

### Backend Connectivity
By default:
- Android emulator connects to `http://10.0.2.2:8080/api`
- iOS / Web connects to `http://localhost:8080/api`
- For physical mobile devices over Wi-Fi, ensure your phone and computer are on the same Wi-Fi network and update the IP in `mobile/src/services/api.js` to your local machine IP (e.g. `http://192.168.1.X:8080/api`).
