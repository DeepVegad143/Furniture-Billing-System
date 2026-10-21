import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

const resources = {
  en: {
    translation: {
      appName: 'Deep Furniture',
      tagline: 'Timeless Craftsmenship',
      demoMode: 'Demo Mode — You can test and create data freely',
      wakingServer: 'Connecting to server...',
      wakingSubtext: 'The server may take a few seconds to wake up. Please wait.',
      
      // Auth
      login: 'Login',
      tryDemo: 'Try Demo',
      username: 'Username',
      password: 'Password',
      loggingIn: 'Logging in...',
      logout: 'Logout',
      logoutConfirm: 'Are you sure you want to log out?',

      // Navigation
      navHome: 'Home',
      navCustomers: 'Customers',
      navRates: 'Billing Rate',
      navSettings: 'Settings',
      quickActions: 'Quick Actions',

      // Dashboard
      welcomeBack: 'Welcome back,',
      totalPending: 'Total Pending',
      billsThisMonth: 'Bills This Month',
      totalCustomers: 'Total Customers',
      recentBooks: 'Recent Books',
      noRecentBooks: 'No recent books yet',
      newCustomer: 'New Customer',
      newBook: 'New Book',
      billingRate: 'Billing Rate',

      // Customers
      searchCustomers: 'Search customer name or phone...',
      noCustomersFound: 'No customers found',
      addCustomer: 'Add Customer',
      customerName: 'Customer Name',
      phone: 'Phone Number',
      address: 'Address',
      notes: 'Notes / Remarks',
      editCustomer: 'Edit Customer',
      deleteCustomer: 'Delete Customer',
      deleteCustomerConfirm: 'Are you sure you want to delete this customer? All their books and quotes will also be removed.',
      booksCount: 'Books',
      pending: 'Pending',
      partial: 'Partial',
      paid: 'Paid',
      save: 'Save',
      saving: 'Saving...',
      saved: 'Saved ✓',
      cancel: 'Cancel',
      delete: 'Delete',
      confirm: 'Confirm',

      // Customer Detail
      customerInfo: 'Customer Information',
      allBooks: 'Job Books',
      rateQuotesHistory: 'Saved Rate Quotes',
      noBooksYet: 'No job books created yet for this customer',
      noQuotesYet: 'No saved rate quotes yet',
      date: 'Date',
      grandTotal: 'Grand Total',
      paidTotal: 'Paid Amount',
      balance: 'Balance Pending',

      // Book Editor
      bookTitle: 'Job Title (e.g. 2BHK Interior)',
      billNumber: 'Bill No.',
      page: 'Page',
      pageTitle: 'Page Title (e.g. Master Bedroom)',
      addPage: 'Add Page',
      deletePage: 'Delete Page',
      deletePageConfirm: 'Are you sure you want to delete this entire page and its items?',
      addItem: 'Add Item',
      customEntry: 'Custom Item Entry',
      selectItemFromCatalog: 'Select item from catalog',
      searchCatalog: 'Search catalog items...',
      unit: 'Unit',
      length: 'Length',
      width: 'Width',
      sqft: 'Sq. Feet',
      runningFeet: 'R. Feet',
      qty: 'Qty',
      rate: 'Rate (₹)',
      amount: 'Amount (₹)',
      itemNote: 'Item Note / Description',
      moveItem: 'Move to another page',
      moveToPage: 'Select destination page:',
      deleteItem: 'Delete Item',
      deleteItemConfirm: 'Are you sure you want to remove this item?',
      pageTotal: 'Page Total',
      payments: 'Payments & Advances',
      addPayment: 'Add Payment',
      paymentAmount: 'Amount Received (₹)',
      paymentDate: 'Payment Date',
      paymentNote: 'Payment Note (Cash, GPay, Cheque)',
      deletePaymentConfirm: 'Are you sure you want to delete this payment record?',
      generatePdf: 'Generate PDF',
      shareWhatsApp: 'Share on WhatsApp',
      deleteBook: 'Delete Book',
      deleteBookConfirm: 'Are you sure you want to permanently delete this job book?',

      // Billing Rate Page
      billingRateTitle: 'Rate Quote Calculator',
      billingRateSubtitle: 'Create and generate a professional rate quotation PDF for a client',
      selectCustomer: 'Select Customer',
      orEnterNewCustomer: 'Or enter customer details manually',
      resetToDefaultRates: 'Reset to Default Rates',
      quoteGenerated: 'Rate quote generated & saved to history!',

      // Settings
      businessInfo: 'Business Information',
      businessName: 'Business Name',
      ownerPhone: 'Contact Phone',
      gstin: 'GSTIN (Optional)',
      upiId: 'UPI ID (Optional)',
      defaultPrices: 'Default Price Catalog',
      defaultPricesSubtitle: 'Edit standard rates for all 26 job items. Changes apply to new bills.',
      addCatalogItem: 'Add Catalog Item',
      exportExcel: 'Backup & Export to Excel',
      exportExcelSubtitle: 'Download all customers, books, items, and payments as an Excel spreadsheet.',
      downloadingExcel: 'Generating Excel file...',
      languageSetting: 'Language',
      termsAndConditions: 'Terms & Conditions',

      // PDF & Sharing
      downloadPdf: 'Download PDF',
      preparingPdf: 'Preparing PDF...',
      pdfReady: 'PDF Ready',
      whatsappMessage: 'Namaste! Please find your billing estimate from Deep Furniture attached.',
      manualAttachNotice: 'Opening WhatsApp chat. Please attach the downloaded PDF file into the chat.'
    }
  },
  gu: {
    translation: {
      appName: 'દીપ ફર્નિચર',
      tagline: 'ફર્નિચર અને સુથારી જોબ વર્ક',
      demoMode: 'ડેમો મોડ — તમે અહીં નવો ડેટા બનાવી અને ચકાસી શકો છો',
      wakingServer: 'સર્વર સાથે જોડાઈ રહ્યું છે...',
      wakingSubtext: 'સર્વર શરૂ થવામાં થોડી સેકંડ લાગી શકે છે. કૃપા કરીને રાહ જુઓ.',

      // Auth
      login: 'લોગિન કરો',
      tryDemo: 'ડેમો અજમાવો',
      username: 'વપરાશકર્તા નામ',
      password: 'પાસવર્ડ',
      loggingIn: 'લોગિન થઈ રહ્યું છે...',
      logout: 'લોગઆઉટ',
      logoutConfirm: 'શું તમે ખરેખર લોગઆઉટ કરવા માંગો છો?',

      // Navigation
      navHome: 'હોમ',
      navCustomers: 'ગ્રાહકો',
      navRates: 'ભાવ પત્રક',
      navSettings: 'સેટિંગ્સ',
      quickActions: 'ઝડપી વિકલ્પો',

      // Dashboard
      welcomeBack: 'સ્વાગત છે,',
      totalPending: 'કુલ બાકી રકમ',
      billsThisMonth: 'આ મહિનાના બિલ',
      totalCustomers: 'કુલ ગ્રાહકો',
      recentBooks: 'તાજેતરના બિલ',
      noRecentBooks: 'હજી સુધી કોઈ બિલ નથી',
      newCustomer: 'નવા ગ્રાહક',
      newBook: 'નવું બિલ બુક',
      billingRate: 'ભાવ પત્રક',

      // Customers
      searchCustomers: 'ગ્રાહકનું નામ અથવા મોબાઈલ શોધો...',
      noCustomersFound: 'કોઈ ગ્રાહક મળ્યા નથી',
      addCustomer: 'નવા ગ્રાહક ઉમેરો',
      customerName: 'ગ્રાહકનું નામ',
      phone: 'મોબાઈલ નંબર',
      address: 'સરનામું',
      notes: 'નોંધ / વિગત',
      editCustomer: 'ગ્રાહક વિગત સુધારો',
      deleteCustomer: 'ગ્રાહક કાઢી નાખો',
      deleteCustomerConfirm: 'શું તમે આ ગ્રાહકને કાઢી નાખવા માંગો છો? તેમના તમામ બિલ પણ નીકળી જશે.',
      booksCount: 'બિલ બુક',
      pending: 'બાકી',
      partial: 'અડધું ચૂકવેલ',
      paid: 'ચૂકતે',
      save: 'સાચવો',
      saving: 'સાચવી રહ્યું છે...',
      saved: 'સેવ થઈ ગયું ✓',
      cancel: 'રદ કરો',
      delete: 'કાઢી નાખો',
      confirm: 'ખાતરી કરો',

      // Customer Detail
      customerInfo: 'ગ્રાહકની માહિતી',
      allBooks: 'જોબ બિલ બુક',
      rateQuotesHistory: 'સાચવેલ ભાવ પત્રક',
      noBooksYet: 'આ ગ્રાહક માટે હજી સુધી કોઈ બિલ બનેલ નથી',
      noQuotesYet: 'કોઈ સેવ કરેલ ભાવ પત્રક નથી',
      date: 'તારીખ',
      grandTotal: 'કુલ રકમ',
      paidTotal: 'મળેલ રકમ',
      balance: 'બાકી રકમ',

      // Book Editor
      bookTitle: 'કામનું નામ (દા.ત. 2BHK ફ્લેટ)',
      billNumber: 'બિલ નં.',
      page: 'પેજ',
      pageTitle: 'પેજ નામ (દા.ત. માસ્ટર બેડરૂમ)',
      addPage: 'નવું પેજ ઉમેરો',
      deletePage: 'પેજ કાઢી નાખો',
      deletePageConfirm: 'શું તમે આ આખું પેજ અને તેના તમામ આઇટમ કાઢી નાખવા માંગો છો?',
      addItem: 'આઇટમ ઉમેરો',
      customEntry: 'અન્ય નવી આઇટમ',
      selectItemFromCatalog: 'લિસ્ટમાંથી આઇટમ પસંદ કરો',
      searchCatalog: 'આઇટમ શોધો...',
      unit: 'માપનો પ્રકાર',
      length: 'લંબાઈ',
      width: 'પહોળાઈ',
      sqft: 'સ્ક્વેર ફીટ',
      runningFeet: 'રનિંગ ફીટ',
      qty: 'સંખ્યા',
      rate: 'ભાવ (₹)',
      amount: 'રકમ (₹)',
      itemNote: 'આઇટમની વધારાની વિગત',
      moveItem: 'બીજા પેજમાં ખસેડો',
      moveToPage: 'કયા પેજમાં ખસેડવું છે તે પસંદ કરો:',
      deleteItem: 'આઇટમ કાઢી નાખો',
      deleteItemConfirm: 'શું તમે આ આઇટમ કાઢી નાખવા માંગો છો?',
      pageTotal: 'પેજ કુલ',
      payments: 'ઉપાડ / જમા થયેલ રકમ',
      addPayment: 'નવી રકમ ઉમેરો',
      paymentAmount: 'મળેલ રકમ (₹)',
      paymentDate: 'ચૂકવણી તારીખ',
      paymentNote: 'વિગત (રોકડ, ગુગલ પે, ચેક)',
      deletePaymentConfirm: 'શું તમે આ પેમેન્ટ એન્ટ્રી કાઢી નાખવા માંગો છો?',
      generatePdf: 'PDF બનાવો',
      shareWhatsApp: 'WhatsApp પર મોકલો',
      deleteBook: 'બિલ બુક કાઢી નાખો',
      deleteBookConfirm: 'શું તમે આ બિલ બુક કાયમ માટે કાઢી નાખવા માંગો છો?',

      // Billing Rate Page
      billingRateTitle: 'ભાવ પત્રક કેલ્ક્યુલેટર',
      billingRateSubtitle: 'ગ્રાહક માટે વ્યવસાયિક ભાવ પત્રક PDF તૈયાર કરો',
      selectCustomer: 'ગ્રાહક પસંદ કરો',
      orEnterNewCustomer: 'અથવા જાતે ગ્રાહકની વિગત લખો',
      resetToDefaultRates: 'મૂળ ભાવ રીસેટ કરો',
      quoteGenerated: 'ભાવ પત્રક તૈયાર થઈ ગયું અને ઇતિહાસમાં સાચવવામાં આવ્યું!',

      // Settings
      businessInfo: 'ધંધાની માહિતી',
      businessName: 'પેઢીનું નામ',
      ownerPhone: 'સંપર્ક મોબાઈલ',
      gstin: 'જીએસટી નંબર (મરજિયાત)',
      upiId: 'યુપીઆઈ આઈડી (UPI)',
      defaultPrices: 'મૂળ ભાવ યાદી (૨૬ આઇટમ)',
      defaultPricesSubtitle: 'તમામ ૨૬ કામના મૂળ દર સુધારો. નવા બિલમાં આ જ દર આપમેળે આવશે.',
      addCatalogItem: 'નવી આઇટમ ઉમેરો',
      exportExcel: 'એક્સેલ (Excel) બેકઅપ ડાઉનલોડ',
      exportExcelSubtitle: 'બધા ગ્રાહકો, બિલ, માપ અને પેમેન્ટ એક્સેલ ફાઈલમાં ડાઉનલોડ કરો.',
      downloadingExcel: 'એક્સેલ ફાઈલ બની રહી છે...',
      languageSetting: 'ભાષા (Language)',
      termsAndConditions: 'નિયમો અને શરતો',

      // PDF & Sharing
      downloadPdf: 'PDF ડાઉનલોડ કરો',
      preparingPdf: 'PDF તૈયાર થઈ રહી છે...',
      pdfReady: 'PDF તૈયાર છે',
      whatsappMessage: 'નમસ્તે! દીપ ફર્નિચર તરફથી તમારું બિલ / ભાવ અંદાજ પત્રક મોકલેલ છે.',
      manualAttachNotice: 'WhatsApp ખૂલી રહ્યું છે. કૃપા કરીને ડાઉનલોડ કરેલ PDF ફાઈલ ચેટમાં મોકલો.'
    }
  }
};

const savedLanguage = localStorage.getItem('deep_furniture_lang') || 'en';

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: savedLanguage,
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false,
    },
  });

export default i18n;
