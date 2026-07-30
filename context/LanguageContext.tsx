'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

type Language = 'en' | 'fr' | 'ar';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
  isRTL: boolean;
}

const translations: Record<Language, Record<string, string>> = {
  en: {
    catalog: 'Catalog',
    dtfPrints: 'DTF Prints',
    lookbook: 'Lookbook',
    trackOrder: 'Track Order',
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
    orderSummary: 'Order Summary',
    totalToPay: 'Total Amount',
    emptyCart: 'Your basket is empty',
    returnToStore: 'Return to Store',
    bankDetailsTitle: 'CIH BANK DETAILS',
    orderRecorded: 'Order Placed!',
    transferNotice: 'Perform the bank transfer to our CIH account below to confirm shipment.',
    accountHolder: 'Account Holder',
    transferReason: 'Transfer Reference / Reason',
    viewInAccount: 'View Order in My Account',
  },
  fr: {
    catalog: 'Catalogue',
    dtfPrints: 'Impressions DTF',
    lookbook: 'Lookbook',
    trackOrder: 'Suivre Commande',
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
    orderSummary: 'Récapitulatif',
    totalToPay: 'Total à Payer',
    emptyCart: 'Votre panier est vide',
    returnToStore: 'Retour au Store',
    bankDetailsTitle: 'COORDONNÉES CIH BANK',
    orderRecorded: 'Commande Enregistrée !',
    transferNotice: 'Effectuez le virement bancaire sur notre compte CIH ci-dessous pour valider l\'expédition.',
    accountHolder: 'Titulaire du compte',
    transferReason: 'Motif du Virement',
    viewInAccount: 'Voir ma commande dans l\'Espace Client',
  },
  ar: {
    catalog: 'الكتالوج',
    dtfPrints: 'طباعة DTF',
    lookbook: 'كتليب الصور',
    trackOrder: 'تتبع الطلب',
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
    orderSummary: 'ملخص الطلب',
    totalToPay: 'المبلغ الإجمالي',
    emptyCart: 'سلة التسوق فارغة',
    returnToStore: 'العودة للمتجر',
    bankDetailsTitle: 'معلومات حساب CIH BANK',
    orderRecorded: 'تم تسجيل طلبك بنجاح!',
    transferNotice: 'يرجى إجراء التحويل البنكي إلى حسابنا أدنتاه لتأكيد شحن طلبك.',
    accountHolder: 'صاحب الحساب',
    transferReason: 'سبب التحويل / رقم الطلب',
    viewInAccount: 'عرض الطلب في حسابي',
  },
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<Language>('en');

  useEffect(() => {
    const savedLang = localStorage.getItem('zyn_lang') as Language;
    if (savedLang && ['en', 'fr', 'ar'].includes(savedLang)) {
      setLanguageState(savedLang);
    }
  }, []);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem('zyn_lang', lang);
    document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.lang = lang;
  };

  const t = (key: string) => {
    return translations[language]?.[key] || translations['en'][key] || key;
  };

  const isRTL = language === 'ar';

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t, isRTL }}>
      <div dir={isRTL ? 'rtl' : 'ltr'}>{children}</div>
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}