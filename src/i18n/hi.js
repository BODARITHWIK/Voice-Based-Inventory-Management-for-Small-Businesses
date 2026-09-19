// Swaranidhi Hindi Translations - Friendly Shopkeeper Style

const hi = {
  // Brand & General
  appName: 'स्वर्णनिधि',
  tagline: 'बोलिए। संभालिए। आगे बढ़िए।',
  aiAssistant: 'स्वर्णनिधि AI',
  smartAssistant: 'आपकी दुकान का स्मार्ट सहायक',

  // Navigation
  nav: {
    dashboard: 'डैशबोर्ड',
    products: 'मेरा स्टॉक',
    sales: 'बिक्री',
    purchases: 'खरीद',
    suppliers: 'सप्लायर्स',
    customers: 'ग्राहक (खाता)',
    reports: 'रिपोर्ट्स',
    notifications: 'सूचनाएं (Alerts)',
    settings: 'सेटिंग्स',
  },

  // Greetings & Time-based
  greeting: {
    morning: 'नमस्ते / सुप्रभात! 👋',
    afternoon: 'शुभ दोपहर! 👋',
    evening: 'शुभ संध्या! 👋',
    subtitle: 'आइए आज आपकी दुकान का काम आसान बनाएं।',
    activeBadge: 'वॉयस AI चालू है',
  },

  // Stat Cards
  stats: {
    todaySales: 'आज की बिक्री',
    myStock: 'कुल सामान',
    itemsInStock: 'स्टॉक में मौजूद',
    runningLow: 'स्टॉक कम है',
    needsAttention: 'जल्द मंगाना होगा',
    outOfStock: 'खत्म हो गया',
    requiresRestocking: 'तुरंत स्टॉक भरें',
    totalTxns: 'कुल बिल',
    avgOrder: 'औसत बिल',
    creditSales: 'ग्राहक उधार (खाता)',
    pendingCollection: 'वसूली बाकी',
  },

  // Quick Actions
  quickActions: {
    title: 'तुरंत काम',
    addItem: '+ सामान जोड़ें',
    recordSale: '+ बिक्री लिखें',
    recordPurchase: '+ खरीद दर्ज करें',
    speak: '🎙️ बोलकर करें',
    viewReports: '📊 रिपोर्ट देखें',
  },

  // Voice Assistant
  voice: {
    howCanIHelp: 'मैं आपकी क्या मदद कर सकता हूँ?',
    speakToAssistant: 'स्वर्णनिधि से बोलें',
    listening: 'सुन रहा हूँ... खुलकर बोलिए',
    processing: 'आपकी बात समझ रहा हूँ...',
    success: 'हो गया! आपका स्टॉक अपडेट हो गया है।',
    error: 'समझ नहीं पाया। कृपया दोबारा बोलें।',
    startSpeaking: 'बोलना शुरू करें',
    orType: 'या लिखकर बताएं',
    trySaying: 'ऐसे बोलकर देखें:',
    sample1: 'मैगी के 20 पैकेट स्टॉक में जोड़ो',
    sample2: '5 किलो चावल बेचा',
    sample3: 'चीनी कितनी बची है?',
    sample4: 'रमेश के खाते में 500 रुपये उधार लिखो',
    voiceAction: 'वॉयस एक्शन',
    voiceAdd: 'वॉयस से स्टॉक जोड़ें',
    voiceSale: 'वॉयस बिक्री',
    voicePurchase: 'वॉयस खरीद',
    unsupported: 'इस ब्राउज़र में वॉयस काम नहीं करता।',
  },

  // Confirmations
  confirm: {
    title: 'कृपया पुष्टि करें',
    voiceTitle: 'वॉयस कमांड पुष्टि',
    speechReceived: 'आपने कहा:',
    detected: 'समझी गई जानकारी:',
    action: 'काम (Action)',
    product: 'सामान',
    quantity: 'मात्रा',
    customer: 'ग्राहक',
    amount: 'रुपये',
    paymentMethod: 'भुगतान का तरीका',
    yesConfirm: '✓ हाँ, पक्का करें',
    cancel: 'रद्द करें',
    destructiveTitle: 'सामान हटाएं?',
    destructivePrompt: 'क्या आप सचमुच इस सामान को स्टॉक से हटाना चाहते हैं?',
    largeAmountWarning: '💰 आप ₹{amount} का बड़ा लेन-देन दर्ज कर रहे हैं। कृपया जांच लें।',
  },

  // Responses & Toasts
  toast: {
    stockAdded: '✅ हो गया! {item} के {qty} {unit} स्टॉक में जुड़ गए।',
    stockSold: '✅ बिक्री दर्ज हो गई! {item} के {qty} {unit}।',
    saleCompleted: '✅ बिक्री सफलतापूर्वक दर्ज हो गई।',
    purchaseSaved: '✅ खरीद दर्ज हो गई और स्टॉक बढ़ गया।',
    khataUpdated: '💰 {customer} के खाते में ₹{amount} उधार जुड़ गया।',
    itemRemoved: 'सामान स्टॉक से हटा दिया गया।',
    cancelled: 'रद्द कर दिया गया।',
    errorGeneric: 'कोई समस्या आई। कृपया फिर प्रयास करें।',
    offlineNotice: 'आप ऑफलाइन हैं। आपका डेटा आपके फ़ोन/कंप्यूटर में सुरक्षित है।',
  },

  // Products Page
  products: {
    title: 'मेरा स्टॉक',
    subtitle: 'अपनी दुकान के सभी सामान, उनकी मात्रा और कीमत देखें व संभालें।',
    searchPlaceholder: 'सामान का नाम, श्रेणी या कोड खोजें...',
    allCategories: 'सभी श्रेणियां',
    allStatus: 'सभी स्थिति',
    inStock: 'स्टॉक में है',
    runningLow: 'कम बचा है',
    outOfStock: 'खत्म हो चुका',
    item: 'सामान',
    category: 'श्रेणी',
    code: 'कोड',
    stock: 'बचा हुआ स्टॉक',
    unit: 'इकाई',
    buyPrice: 'खरीद मूल्य',
    sellPrice: 'बिक्री मूल्य',
    status: 'हालत',
    actions: 'कार्रवाई',
    addItemBtn: '+ नया सामान',
    editItem: 'बदलें',
    itemDetails: 'सामान का विवरण',
    saveBtn: 'सेव करें',
    minStock: 'अलर्ट सीमा (न्यूनतम स्टॉक)',
    supplier: 'सप्लायर / व्यापारी',
  },

  // Sales Page
  sales: {
    title: 'बिक्री और बिल',
    subtitle: 'दुकान की दैनिक बिक्री, नकद, यूपीआई और उधार का पूरा हिसाब रखें।',
    newSaleBtn: '+ नई बिक्री लिखें',
    invoice: 'बिल #',
    customer: 'ग्राहक का नाम',
    phone: 'फ़ोन नंबर',
    itemsSold: 'बेचा गया सामान',
    amount: 'रकम (₹)',
    payment: 'भुगतान का माध्यम',
    cash: 'नकद (Cash)',
    upi: 'UPI (PhonePe/GPay)',
    card: 'कार्ड',
    credit: 'खाता / उधार',
    status: 'स्थिति',
    date: 'तारीख व समय',
  },

  // Purchases Page
  purchases: {
    title: 'खरीद और आवक',
    subtitle: 'होलसेलर्स और डिस्ट्रीब्यूटर्स से खरीदे गए माल का पूरा ब्यौरा।',
    newPurchaseBtn: '+ नई खरीद दर्ज करें',
    purchaseId: 'ऑर्डर ID',
    supplier: 'सप्लायर',
    itemsOrdered: 'आया हुआ माल',
    cost: 'कुल लागत (₹)',
  },

  // Suppliers Page
  suppliers: {
    title: 'सप्लायर्स व व्यापारी',
    subtitle: 'आपकी दुकान में माल पहुंचाने वाले सप्लायर्स और उनकी देनदारी।',
    addSupplierBtn: '+ नया सप्लायर',
    name: 'सप्लायर का नाम',
    rep: 'प्रतिनिधि',
    contact: 'फ़ोन व ईमेल',
    location: 'मंडी / पता व GST',
    totalPurchases: 'कुल खरीद',
    outstanding: 'बकाया रकम',
  },

  // Customers (Khata) Page
  customers: {
    title: 'ग्राहक और खाता बही',
    subtitle: 'ग्राहकों की उधारी, जमा और लेन-देन का विश्वसनीय खाता।',
    addCustomerBtn: '+ ग्राहक जोड़ें',
    customerName: 'ग्राहक का नाम',
    phone: 'फ़ोन',
    totalBought: 'कुल खरीदारी',
    khataBalance: 'खाता उधारी (बाकी)',
    lastVisit: 'अंतिम खरीद',
    viewKhata: 'खाता देखें',
    recordPayment: 'रुपये जमा करें',
  },

  // Reports Page
  reports: {
    title: 'दुकान की रिपोर्ट',
    subtitle: 'जानिए दुकान में कितनी बिक्री हुई, कितना मुनाफ़ा बना और क्या ज्यादा बिका।',
    salesReport: 'बिक्री रिपोर्ट',
    purchaseReport: 'खरीद रिपोर्ट',
    inventoryReport: 'स्टॉक की कीमत',
    profitReport: 'मुनाफ़ा रिपोर्ट',
    lowStockReport: 'कम स्टॉक वाले सामान',
    exportCsv: 'CSV डाउनलोड',
    exportPdf: 'PDF डाउनलोड',
    today: 'आज',
    thisWeek: 'इस हफ्ते',
    thisMonth: 'इस महीने',
    customRange: 'तारीख चुनें',
  },

  // Settings Page
  settings: {
    title: 'सेटिंग्स',
    subtitle: 'भाषा, बोलकर काम करने वाले सहायक और दुकान की प्राथमिकताओं को बदलें।',
    profileTab: 'प्रोफ़ाइल',
    businessTab: 'दुकान का विवरण',
    inventoryTab: 'स्टॉक के नियम',
    voiceTab: 'वॉयस व AI',
    notificationsTab: 'अलर्ट',
    securityTab: 'सुरक्षा',
    appearanceTab: 'दिखावट',
    backupTab: 'डेटा बैकअप',
    simpleMode: 'सरल मोड (बड़ा टेक्स्ट)',
    simpleModeDesc: 'आसानी से पढ़ने के लिए बड़े अक्षर और बड़े बटन।',
    voiceResponses: 'बोलकर जवाब दें (Text-to-Speech)',
    voiceResponsesDesc: 'स्वर्णनिधि काम पूरा होने पर खुद बोलकर बताएगा।',
    languageLabel: 'सहायक की भाषा',
  },

  // Connectivity
  connectivity: {
    online: 'ऑनलाइन',
    offline: 'ऑफलाइन',
    offlineTooltip: 'आप ऑफलाइन हैं। आपका डेटा आपके फ़ोन/कंप्यूटर में सुरक्षित है।',
  },
};

export default hi;
