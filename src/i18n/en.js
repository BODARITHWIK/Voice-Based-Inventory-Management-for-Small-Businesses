// Swaranidhi English Translations - Friendly Shopkeeper Style

const en = {
  // Brand & General
  appName: 'Swaranidhi',
  tagline: 'Speak. Manage. Grow.',
  aiAssistant: 'Swaranidhi AI',
  smartAssistant: 'Smart Shop Assistant',

  // Navigation
  nav: {
    dashboard: 'Dashboard',
    products: 'My Stock',
    sales: 'Sales',
    purchases: 'Purchases',
    suppliers: 'Suppliers',
    customers: 'Customers (Khata)',
    reports: 'Reports',
    notifications: 'Alerts',
    settings: 'Settings',
  },

  // Greetings & Time-based
  greeting: {
    morning: 'Good morning! 👋',
    afternoon: 'Good afternoon! 👋',
    evening: 'Good evening! 👋',
    subtitle: "Let's take care of your shop today.",
    activeBadge: 'Voice AI Active',
  },

  // Stat Cards
  stats: {
    todaySales: "Today's Sales",
    myStock: 'My Stock',
    itemsInStock: 'Items in Stock',
    runningLow: 'Running Low',
    needsAttention: 'Needs attention',
    outOfStock: 'Out of Stock',
    requiresRestocking: 'Requires restocking',
    totalTxns: 'Total Sales',
    avgOrder: 'Average Sale',
    creditSales: 'Customer Credit',
    pendingCollection: 'Pending collection',
  },

  // Quick Actions
  quickActions: {
    title: 'Quick Actions',
    addItem: '+ Add Item',
    recordSale: '+ Record Sale',
    recordPurchase: '+ Record Purchase',
    speak: '🎙️ Speak',
    viewReports: '📊 View Reports',
  },

  // Voice Assistant
  voice: {
    howCanIHelp: 'How can I help you?',
    speakToAssistant: 'Speak to Swaranidhi',
    listening: "I'm listening... Speak naturally",
    processing: 'Understanding your request...',
    success: 'Done! Your stock has been updated.',
    error: "I couldn't understand that. Please try again.",
    startSpeaking: 'Start Speaking',
    orType: 'Or type your request',
    trySaying: 'Try saying naturally:',
    sample1: 'Add 20 packets of Maggi',
    sample2: 'Sold 5 kg rice',
    sample3: 'How much sugar is left?',
    sample4: 'Give 5 Maggi to Ramesh on credit',
    voiceAction: 'Voice Action',
    voiceAdd: 'Voice Add',
    voiceSale: 'Voice Sale',
    voicePurchase: 'Voice Purchase',
    unsupported: 'Voice recognition is not supported in this browser.',
  },

  // Confirmations
  confirm: {
    title: 'Please Confirm',
    voiceTitle: 'Voice Command Confirmation',
    speechReceived: 'What you said:',
    detected: 'Detected details:',
    action: 'Action',
    product: 'Item',
    quantity: 'Quantity',
    customer: 'Customer',
    amount: 'Amount',
    paymentMethod: 'Payment Method',
    yesConfirm: '✓ Yes, Confirm',
    cancel: 'Cancel',
    destructiveTitle: 'Remove Item?',
    destructivePrompt: 'Are you sure you want to remove this item from your stock?',
    largeAmountWarning: "💰 You're recording a large transaction of {amount}. Please verify.",
  },

  // Responses & Toasts
  toast: {
    stockAdded: '✅ Done! {qty} {unit} of {item} added to your stock.',
    stockSold: '✅ Sale recorded! {qty} {unit} of {item} sold.',
    saleCompleted: '✅ Done! Sale recorded successfully.',
    purchaseSaved: '✅ Purchase recorded and stock updated.',
    khataUpdated: "💰 ₹{amount} added to {customer}'s Khata.",
    itemRemoved: 'Item removed from your stock.',
    cancelled: 'Action cancelled.',
    errorGeneric: 'Something went wrong. Please try again.',
    offlineNotice: "You're offline. Your changes are saved safely on your device.",
  },

  // Products Page
  products: {
    title: 'My Stock',
    subtitle: 'Check, update, and manage the items you sell in your shop.',
    searchPlaceholder: 'Search items by name, category, or code...',
    allCategories: 'All Categories',
    allStatus: 'All Status',
    inStock: 'In Stock',
    runningLow: 'Running Low',
    outOfStock: 'Out of Stock',
    item: 'Item',
    category: 'Category',
    code: 'Item Code',
    stock: 'Stock Left',
    unit: 'Unit',
    buyPrice: 'Purchase Price',
    sellPrice: 'Selling Price',
    status: 'Status',
    actions: 'Actions',
    addItemBtn: '+ Add Item',
    editItem: 'Edit Item',
    itemDetails: 'Item Details',
    saveBtn: 'Save Item',
    minStock: 'Alert When Below (Min Stock)',
    supplier: 'Supplier / Vendor',
  },

  // Sales Page
  sales: {
    title: 'Sales & Billing',
    subtitle: 'Track daily customer purchases, cash, UPI, and credit transactions.',
    newSaleBtn: '+ Record New Sale',
    invoice: 'Bill #',
    customer: 'Customer Name',
    phone: 'Phone Number',
    itemsSold: 'Items Sold',
    amount: 'Amount (₹)',
    payment: 'Payment Mode',
    cash: 'Cash',
    upi: 'UPI',
    card: 'Card',
    credit: 'Credit (Khata / Udhaar)',
    status: 'Status',
    date: 'Date & Time',
  },

  // Purchases Page
  purchases: {
    title: 'Purchases & Stock In',
    subtitle: 'Keep track of items bought from distributors and wholesalers.',
    newPurchaseBtn: '+ Record Purchase',
    purchaseId: 'Order ID',
    supplier: 'Supplier',
    itemsOrdered: 'Items Received',
    cost: 'Total Cost (₹)',
  },

  // Suppliers Page
  suppliers: {
    title: 'Suppliers & Vendors',
    subtitle: 'List of distributors and wholesale dealers who supply your shop.',
    addSupplierBtn: '+ Add Supplier',
    name: 'Supplier Name',
    rep: 'Representative',
    contact: 'Contact Info',
    location: 'Location & GST',
    totalPurchases: 'Total Purchases',
    outstanding: 'Pending Due',
  },

  // Customers (Khata) Page
  customers: {
    title: 'Customers & Khata',
    subtitle: 'Keep accurate track of customer ledger, store credit, and udhaar balances.',
    addCustomerBtn: '+ Add Customer',
    customerName: 'Customer Name',
    phone: 'Phone',
    totalBought: 'Total Purchases',
    khataBalance: 'Khata Balance (Udhaar)',
    lastVisit: 'Last Visit',
    viewKhata: 'View Khata',
    recordPayment: 'Take Payment',
  },

  // Reports Page
  reports: {
    title: 'Reports & Business Health',
    subtitle: 'Understand how much profit and sales your shop made this week or month.',
    salesReport: 'Sales Report',
    purchaseReport: 'Purchase Report',
    inventoryReport: 'Stock Value',
    profitReport: 'Profit Summary',
    lowStockReport: 'Low Stock Items',
    exportCsv: 'Download CSV',
    exportPdf: 'Download PDF',
    today: 'Today',
    thisWeek: 'This Week',
    thisMonth: 'This Month',
    customRange: 'Custom Range',
  },

  // Settings Page
  settings: {
    title: 'Settings',
    subtitle: 'Customize language, voice assistant, alert notifications, and shop profile.',
    profileTab: 'Profile',
    businessTab: 'Shop Details',
    inventoryTab: 'Stock Rules',
    voiceTab: 'Voice & AI',
    notificationsTab: 'Alerts',
    securityTab: 'Security',
    appearanceTab: 'Appearance',
    backupTab: 'Data & Backup',
    simpleMode: 'Simple Mode (Easy Reading)',
    simpleModeDesc: 'Larger text and bigger buttons for effortless reading.',
    voiceResponses: 'Voice Responses (Text-to-Speech)',
    voiceResponsesDesc: 'Swaranidhi will speak back to confirm your actions.',
    languageLabel: 'Assistant Language',
  },

  // Connectivity
  connectivity: {
    online: 'Online',
    offline: 'Offline',
    offlineTooltip: "You're offline. Your changes are saved safely on your device.",
  },
};

export default en;
