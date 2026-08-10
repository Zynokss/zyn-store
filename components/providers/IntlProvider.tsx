'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

type Language = 'en' | 'fr' | 'ar';

interface LanguageContextType {
  language: Language;
  locale: Language;
  setLanguage: (lang: Language) => void;
  setLocale: (lang: Language) => void;
  t: (key: string) => string;
  isRTL: boolean;
}

const translations: Record<Language, Record<string, string>> = {
  en: {
    catalog: 'Catalog',
    dtfPrints: 'DTF Prints',
    lookbook: 'Lookbook',
    trackOrder: 'Track Order',
    returnToStore: 'Return to Store',
    orderSummary: 'Order Summary',
    totalToPay: 'Total Amount',
    emptyCart: 'Your basket is empty',
    checkoutTitle: 'Bank Transfer Payment',
    contactInfo: 'Contact Information',
    shippingAddress: 'Shipping Address',
    email: 'Email Address',
    phone: 'Phone Number (e.g. 0661234567)',
    firstName: 'First Name',
    lastName: 'Last Name',
    fullAddress: 'Full Address (Neighborhood, Street, No.)',
    city: 'City',
    confirmOrder: 'Confirm Order',
    processing: 'Processing...',
    'Cart.continue': 'Continue Shopping',
    'Cart.size': 'Size',
    'Cart.qty': 'Qty',
    'Checkout.processing': 'Processing request...',
    bankDetailsTitle: 'CIH BANK DETAILS',
    orderRecorded: 'Order Placed!',
    transferNotice: 'Perform the bank transfer to our CIH account below to confirm shipment.',
    accountHolder: 'Account Holder',
    transferReason: 'Transfer Reference / Reason',
    viewInAccount: 'View Order in My Account',
    'Account.title': 'My Account',
    'Account.signOut': 'Sign Out',
    'Account.noOrders': 'No orders found for this account.',
    'Account.viewCatalog': 'Browse Catalog',
    'Account.orderNo': 'ORDER NO.',
    'Account.itemsOrdered': 'ORDERED ITEMS',
    'Account.deliveryAddress': 'DELIVERY ADDRESS',
    'Account.transferNotice': 'Please perform the transfer of',
    'Account.ordersTab': 'Orders',
    'Account.profileTab': 'My Address & Info',
    'Account.defaultAddressHeader': 'DEFAULT SHIPPING ADDRESS',
    'Account.fullName': 'Full Name',
    'Account.addressLine1': 'Address Line 1',
    'Account.addressLine2': 'Address Line 2 (Optional)',
    'Account.postalCode': 'Postal Code',
    'Account.saveAddress': 'Save My Address',
    'Account.saveSuccess': 'Your shipping details have been updated!',
    'Account.saveError': 'Failed to save profile.',
    'Status.delivered': 'Delivered',
    'Status.shipped': 'Shipped',
    'Status.processing': 'Processing',
    'Status.canceled': 'Canceled',
    'Status.pendingPayment': 'Awaiting Transfer',
    'Status.pendingConfirmation': 'Awaiting Confirmation',
  },
  fr: {
    catalog: 'Catalogue',
    dtfPrints: 'Impressions DTF',
    lookbook: 'Lookbook',
    trackOrder: 'Suivre Commande',
    returnToStore: 'Retour au Store',
    orderSummary: 'Récapitulatif',
    totalToPay: 'Total à Payer',
    emptyCart: 'Votre panier est vide',
    checkoutTitle: 'Paiement Par Virement Bancaire',
    contactInfo: 'Informations de Contact',
    shippingAddress: 'Adresse de Livraison',
    email: 'Adresse Email',
    phone: 'Téléphone (ex: 0661234567)',
    firstName: 'Prénom',
    lastName: 'Nom',
    fullAddress: 'Adresse complète (Quartier, Rue, N°)',
    city: 'Ville',
    confirmOrder: 'Confirmer la commande',
    processing: 'Traitement en cours...',
    'Cart.continue': 'Continuer mes achats',
    'Cart.size': 'Taille',
    'Cart.qty': 'Qté',
    'Checkout.processing': 'Traitement en cours...',
    bankDetailsTitle: 'COORDONNÉES CIH BANK',
    orderRecorded: 'Commande Enregistrée !',
    transferNotice: 'Effectuez le virement bancaire sur notre compte CIH ci-dessous pour valider l\'expédition.',
    accountHolder: 'Titulaire du compte',
    transferReason: 'Motif du Virement',
    viewInAccount: 'Voir ma commande dans l\'Espace Client',
    'Account.title': 'Espace Client',
    'Account.signOut': 'Déconnexion',
    'Account.noOrders': 'Aucune commande trouvée pour ce compte.',
    'Account.viewCatalog': 'Consulter le catalogue',
    'Account.orderNo': 'COMMANDE N°',
    'Account.itemsOrdered': 'ARTICLES COMMANDÉS',
    'Account.deliveryAddress': 'ADRESSE DE LIVRAISON',
    'Account.transferNotice': 'Effectuez le virement de',
    'Account.ordersTab': 'Commandes',
    'Account.profileTab': 'Mon Adresse & Informations',
    'Account.defaultAddressHeader': 'ADRESSE DE LIVRAISON PAR DÉFAUT',
    'Account.fullName': 'Nom Complet',
    'Account.addressLine1': 'Adresse Ligne 1',
    'Account.addressLine2': 'Adresse Ligne 2 (Optionnel)',
    'Account.postalCode': 'Code Postal',
    'Account.saveAddress': 'Sauvegarder mon Adresse',
    'Account.saveSuccess': 'Vos informations de livraison ont été mises à jour !',
    'Account.saveError': 'Impossible de mettre à jour le profil.',
    'Status.delivered': 'Livré',
    'Status.shipped': 'Expédié',
    'Status.processing': 'En cours de traitement',
    'Status.canceled': 'Canceled',
    'Status.pendingPayment': 'En attente du virement',
    'Status.pendingConfirmation': 'En attente de confirmation',
  },
  ar: {
    catalog: 'الكتالوج',
    dtfPrints: 'طباعة DTF',
    lookbook: 'كتليب الصور',
    trackOrder: 'تتبع الطلب',
    returnToStore: 'العودة للمتجر',
    orderSummary: 'ملخص الطلب',
    totalToPay: 'المبلغ الإجمالي',
    emptyCart: 'سلة التسوق فارغة',
    checkoutTitle: 'الدفع عبر التحويل البنكي',
    contactInfo: 'معلومات الاتصال',
    shippingAddress: 'عنوان الشحن',
    email: 'البريد الإلكتروني',
    phone: 'رقم الهاتف (مثال: 0661234567)',
    firstName: 'الاسم الأول',
    lastName: 'النسب',
    fullAddress: 'العنوان الكامل (الحي، الشارع، الرقم)',
    city: 'المدينة',
    confirmOrder: 'تأكيد الطلب',
    processing: 'جاري المعالجة...',
    'Cart.continue': 'مواصلة التسوق',
    'Cart.size': 'المقاس',
    'Cart.qty': 'الكمية',
    'Checkout.processing': 'جاري المعالجة...',
    bankDetailsTitle: 'معلومات حساب CIH BANK',
    orderRecorded: 'تم تسجيل طلبك بنجاح!',
    transferNotice: 'يرجى إجراء التحويل البنكي إلى حسابنا أدنتاه لتأكيد شحن طلبك.',
    accountHolder: 'صاحب الحساب',
    transferReason: 'سبب التحويل / رقم الطلب',
    viewInAccount: 'عرض الطلب في حسابي',
    'Account.title': 'حسابي',
    'Account.signOut': 'تسجيل الخروج',
    'Account.noOrders': 'لا توجد طلبات لهذا الحساب.',
    'Account.viewCatalog': 'تصفح الكتالوج',
    'Account.orderNo': 'رقم الطلب',
    'Account.itemsOrdered': 'المنتجات المطلوبة',
    'Account.deliveryAddress': 'عنوان التوصيل',
    'Account.transferNotice': 'يرجى إجراء تحويل بمبلغ',
    'Account.ordersTab': 'الطلبات',
    'Account.profileTab': 'عنواني ومعلوماتي',
    'Account.defaultAddressHeader': 'عنوان التوصيل الافتراضي',
    'Account.fullName': 'الاسم الكامل',
    'Account.addressLine1': 'العنوان - السطر 1',
    'Account.addressLine2': 'العنوان - السطر 2 (اختياري)',
    'Account.postalCode': 'الرمز البريدي',
    'Account.saveAddress': 'حفظ العنوان',
    'Account.saveSuccess': 'تم تحديث معلومات التوصيل بنجاح!',
    'Account.saveError': 'فشل حفظ البيانات.',
    'Status.delivered': 'تم التوصيل',
    'Status.shipped': 'تم الشحن',
    'Status.processing': 'قيد المعالجة',
    'Status.canceled': 'ملغي',
    'Status.pendingPayment': 'في انتظار التحويل',
    'Status.pendingConfirmation': 'في انتظار التأكيد',
  },
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<Language>('en');

  useEffect(() => {
    const savedLang = localStorage.getItem('zyn_lang') as Language;
    if (savedLang && ['en', 'fr', 'ar'].includes(savedLang)) {
      queueMicrotask(() => setLanguageState(savedLang));
    }
  }, []);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem('zyn_lang', lang);
    document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.lang = lang;
  };

  const t = (key: string) => {
    return translations[language]?.[key] || translations['en']?.[key] || key;
  };

  const isRTL = language === 'ar';

  return (
    <LanguageContext.Provider
      value={{
        language,
        locale: language,
        setLanguage,
        setLocale: setLanguage,
        t,
        isRTL,
      }}
    >
      <div dir={isRTL ? 'rtl' : 'ltr'}>{children}</div>
    </LanguageContext.Provider>
  );
}

export const IntlProvider = LanguageProvider;
export default LanguageProvider;

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}

export const useTranslation = useLanguage;