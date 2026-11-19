import React, { createContext, useContext, useState, useEffect } from 'react';

export type LanguageCode = 'en' | 'hi' | 'kn' | 'ta' | 'te';

export interface LanguageInfo {
  code: LanguageCode;
  label: string;
  nativeLabel: string;
}

export const SUPPORTED_LANGUAGES: LanguageInfo[] = [
  { code: 'en', label: 'English', nativeLabel: 'English' },
  { code: 'hi', label: 'Hindi', nativeLabel: 'हिन्दी' },
  { code: 'kn', label: 'Kannada', nativeLabel: 'ಕನ್ನಡ' },
  { code: 'ta', label: 'Tamil', nativeLabel: 'தமிழ்' },
  { code: 'te', label: 'Telugu', nativeLabel: 'తెలుగు' },
];

export const TRANSLATIONS: Record<LanguageCode, Record<string, string>> = {
  en: {
    // Nav
    'nav.brand': 'MealMesh',
    'nav.home': 'Live Radar',
    'nav.donor': 'Donor Portal',
    'nav.ngo': 'NGO Hub',
    'nav.volunteer': 'Volunteer Missions',
    'nav.admin': 'Admin Operations',
    'nav.dsaLab': 'DSA Laboratory',
    'nav.logout': 'Sign Out',
    'nav.sync': 'Sync Offline',
    'nav.online': 'Online',
    'nav.offline': 'Offline Mode',

    // Features
    'feat.fairness': 'Fairness-Aware Allocation',
    'feat.forecasting': 'Demand & Surplus Forecast',
    'feat.safety': 'Cumulative Thermal Safety',
    'feat.disruption': 'Disruption Re-Planning',
    'feat.handoff': 'Verified QR Handoff',
    'feat.offline': 'Low-Connectivity Sync',

    // Actions
    'action.claim': 'Claim for Distribution',
    'action.replan': 'Simulate Disruption',
    'action.verifyPickup': 'Scan Pickup QR',
    'action.verifyDelivery': 'Confirm Recipient Handoff',
    'action.viewReceipt': 'Audit Certificate',
    'action.saveOffline': 'Save Offline Update',
    'action.syncNow': 'Sync Now',
    'action.updateCriteria': 'Save Community Need Profile',
    'action.pledge': 'Pledge Upcoming Surplus',

    // Status
    'status.safe': 'Optimal Safe Holding',
    'status.caution': 'Caution: Thermal Exposure',
    'status.qaReview': 'QA Review Mandated',
    'status.quarantined': 'Quarantined: Spoilage Hazard',
    'status.verified': 'Custody Verified',
    'status.inTransit': 'In Transit',
  },
  hi: {
    'nav.brand': 'मील-मेश (MealMesh)',
    'nav.home': 'लाइव रडार',
    'nav.donor': 'दाता पोर्टल',
    'nav.ngo': 'एनजीओ हब',
    'nav.volunteer': 'स्वयंसेवक मिशन',
    'nav.admin': 'प्रशासन केंद्र',
    'nav.dsaLab': 'डीएसए प्रयोगशाला',
    'nav.logout': 'लॉग आउट',
    'nav.sync': 'सिंक करें',
    'nav.online': 'ऑनलाइन',
    'nav.offline': 'ऑफ़लाइन मोड',

    'feat.fairness': 'न्यायसंगत आवंटन (Fairness)',
    'feat.forecasting': 'मांग और अधिशेष पूर्वानुमान',
    'feat.safety': 'तापमान सुरक्षा विश्लेषण',
    'feat.disruption': 'मार्ग व्यवधान पुनर्योजना',
    'feat.handoff': 'सत्यापित क्यूआर हैंडऑफ',
    'feat.offline': 'कम कनेक्टिविटी सिंक',

    'action.claim': 'वितरण के लिए दावा करें',
    'action.replan': 'व्यवधान का अनुकरण करें',
    'action.verifyPickup': 'पिकअप क्यूआर स्कैन करें',
    'action.verifyDelivery': 'वितरण पुष्टि करें',
    'action.viewReceipt': 'ऑडिट प्रमाणपत्र',
    'action.saveOffline': 'ऑफ़लाइन सुरक्षित करें',
    'action.syncNow': 'अभी सिंक करें',
    'action.updateCriteria': 'समुदाय प्राथमिकता सहेजें',
    'action.pledge': 'अधिशेष भोजन का संकल्प लें',

    'status.safe': 'इष्टतम सुरक्षित स्थिति',
    'status.caution': 'सावधानी: थर्मल प्रभाव',
    'status.qaReview': 'क्यूए समीक्षा आवश्यक',
    'status.quarantined': 'संगरोध: खराब भोजन',
    'status.verified': 'हिरासत सत्यापित',
    'status.inTransit': 'मार्ग में',
  },
  kn: {
    'nav.brand': 'ಮೀಲ್-ಮೆಶ್ (MealMesh)',
    'nav.home': 'ಲೈವ್ ರೇಡಾರ್',
    'nav.donor': 'ದಾನಿಗಳ ಪೋರ್ಟಲ್',
    'nav.ngo': 'ಎನ್‌ಜಿಒ ಹಬ್',
    'nav.volunteer': 'ಸ್ವಯಂಸೇವಕರ ಕಾರ್ಯ',
    'nav.admin': 'ಆಡಳಿತ ಕೇಂದ್ರ',
    'nav.dsaLab': 'ಡಿಎಸ್‌ಎ ಪ್ರಯೋಗಾಲಯ',
    'nav.logout': 'ಲಾಗ್ ಔಟ್',
    'nav.sync': 'ಸಿಂಕ್ ಮಾಡಿ',
    'nav.online': 'ಆನ್‌ಲೈನ್',
    'nav.offline': 'ಆಫ್‌ಲೈನ್ ಮೋಡ್',

    'feat.fairness': 'ನ್ಯಾಯಯುತ ಹಂಚಿಕೆ (Fairness)',
    'feat.forecasting': 'ಬೇಡಿಕೆ ಮತ್ತು ಉಳಿಕೆ ಮುನ್ಸೂಚನೆ',
    'feat.safety': 'ತಾಪಮಾನ ಸುರಕ್ಷತಾ ವಿಶ್ಲೇಷಣೆ',
    'feat.disruption': 'ಮಾರ್ಗ ಬದಲಾವಣೆ ಮರುಯೋಜನೆ',
    'feat.handoff': 'ದೃಢೀಕೃತ ಕ್ಯೂಆರ್ ಹಸ್ತಾಂತರ',
    'feat.offline': 'ಕಡಿಮೆ ಸಂಪರ್ಕ ಸಿಂಕ್',

    'action.claim': 'ವಿತರಣೆಗಾಗಿ ಸ್ವೀಕರಿಸಿ',
    'action.replan': 'ಅಡಚಣೆಯನ್ನು ಪರೀಕ್ಷಿಸಿ',
    'action.verifyPickup': 'ಪಿಕಪ್ ಕ್ಯೂಆರ್ ಸ್ಕ್ಯಾನ್ ಮಾಡಿ',
    'action.verifyDelivery': 'ವಿತರಣೆ ದೃಢೀಕರಿಸಿ',
    'action.viewReceipt': 'ಲೆಕ್ಕಪರಿಶೋಧನಾ ಪ್ರಮಾಣಪತ್ರ',
    'action.saveOffline': 'ಆಫ್‌ಲೈನ್ ಉಳಿಸಿ',
    'action.syncNow': 'ಈಗಲೇ ಸಿಂಕ್ ಮಾಡಿ',
    'action.updateCriteria': 'ಸಮುದಾಯ ಅಗತ್ಯ ಉಳಿಸಿ',
    'action.pledge': 'ಹೆಚ್ಚುವರಿ ಆಹಾರ ಪ್ರತಿಜ್ಞೆ',

    'status.safe': 'ಉತ್ತಮ ಸುರಕ್ಷಿತ ಸ್ಥಿತಿ',
    'status.caution': 'ಎಚ್ಚರಿಕೆ: ತಾಪಮಾನ ಏರಿಳಿತ',
    'status.qaReview': 'ಗುಣಮಟ್ಟ ಪರಿಶೀಲನೆ ಅಗತ್ಯ',
    'status.quarantined': 'ತಡೆಹಿಡಿಯಲಾಗಿದೆ: ಹಾಳಾದ ಆಹಾರ',
    'status.verified': 'ಸ್ವೀಕೃತಿ ದೃಢೀಕರಿಸಲಾಗಿದೆ',
    'status.inTransit': 'ಮಾರ್ಗಮಧ್ಯದಲ್ಲಿದೆ',
  },
  ta: {
    'nav.brand': 'மீல்-மெஷ் (MealMesh)',
    'nav.home': 'நேரலை ரேடார்',
    'nav.donor': 'நன்கொடையாளர் தளம்',
    'nav.ngo': 'அரசு சாரா அமைப்பு',
    'nav.volunteer': 'தன்னார்வலர் பணிகள்',
    'nav.admin': 'நிர்வாக மையம்',
    'nav.dsaLab': 'டிஎஸ்ஏ ஆய்வகம்',
    'nav.logout': 'வெளியேறு',
    'nav.sync': 'ஒத்திசைக்க',
    'nav.online': 'இணைப்பில் உள்ளது',
    'nav.offline': 'ஆஃப்லைன் முறை',

    'feat.fairness': 'நியாயமான உணவு ஒதுக்கீடு',
    'feat.forecasting': 'தேவை மற்றும் உபரி கணிப்பு',
    'feat.safety': 'வெப்பநிலை பாதுகாப்பு பகுப்பாய்வு',
    'feat.disruption': 'வழித்தட மாற்றுத் திட்டம்',
    'feat.handoff': 'சரிபார்க்கப்பட்ட QR ஒப்படைப்பு',
    'feat.offline': 'குறைந்த நெட்வொர்க் ஒத்திசைவு',

    'action.claim': 'விநியோகத்திற்கு கோருங்கள்',
    'action.replan': 'தடை உருவகப்படுத்துதல்',
    'action.verifyPickup': 'பிக்அப் QR ஸ்கேன் செய்',
    'action.verifyDelivery': 'விநியோகத்தை உறுதிப்படுத்து',
    'action.viewReceipt': 'தணிக்கை சான்றிதழ்',
    'action.saveOffline': 'ஆஃப்லைனில் சேமிக்கவும்',
    'action.syncNow': 'இப்போது ஒத்திசைக்கவும்',
    'action.updateCriteria': 'சமூக தேவையை சேமிக்கவும்',
    'action.pledge': 'உபரி உணவு உறுதிமொழி',

    'status.safe': 'பாதுகாப்பான நிலை',
    'status.caution': 'எச்சரிக்கை: வெப்பநிலை ஏற்ற இறக்கம்',
    'status.qaReview': 'தர ஆய்வு தேவை',
    'status.quarantined': 'தனிமைப்படுத்தப்பட்டது',
    'status.verified': 'சரிபார்க்கப்பட்டது',
    'status.inTransit': 'பயணத்தில் உள்ளது',
  },
  te: {
    'nav.brand': 'మీల్-మెష్ (MealMesh)',
    'nav.home': 'లైవ్ రాడార్',
    'nav.donor': 'దాతల పోర్టల్',
    'nav.ngo': 'ఎన్జీఓ హబ్',
    'nav.volunteer': 'వాలంటీర్ మిషన్లు',
    'nav.admin': 'అడ్మిన్ కేంద్రం',
    'nav.dsaLab': 'డీఎస్ఏ ప్రయోగశాల',
    'nav.logout': 'లాగ్ అవుట్',
    'nav.sync': 'సింక్ చేయండి',
    'nav.online': 'ఆన్‌లైన్',
    'nav.offline': 'ఆఫ్‌లైన్ మోడ్',

    'feat.fairness': 'సమానత్వ కేటాయింపు (Fairness)',
    'feat.forecasting': 'డిమాండ్ మరియు మిగులు అంచనా',
    'feat.safety': 'ఉష్ణోగ్రత భద్రతా విశ్లేషణ',
    'feat.disruption': 'మార్గాంతర ప్రణాళిక',
    'feat.handoff': 'ధృవీకరించబడిన QR బదిలీ',
    'feat.offline': 'తక్కువ నెట్‌వర్క్ సింక్',

    'action.claim': 'పంపిణీ కోసం క్లెయిమ్ చేయండి',
    'action.replan': 'అడ్డంకిని అనుకరించండి',
    'action.verifyPickup': 'పికప్ QR స్కాన్ చేయండి',
    'action.verifyDelivery': 'పంపిణీ ధృవీకరించండి',
    'action.viewReceipt': 'ఆడిట్ సర్టిఫికేట్',
    'action.saveOffline': 'ఆఫ్‌లైన్‌లో భద్రపరచండి',
    'action.syncNow': 'ఇప్పుడే సింక్ చేయండి',
    'action.updateCriteria': 'కమ్యూనిటీ అవసరాలు భద్రపరచండి',
    'action.pledge': 'మిగులు ఆహార వాగ్దానం',

    'status.safe': 'సరైన భద్రతా ఉష్ణోగ్రత',
    'status.caution': 'హెచ్చరిక: ఉష్ణోగ్రత మార్పు',
    'status.qaReview': 'నాణ్యత తనిఖీ అవసరం',
    'status.quarantined': 'నిరోధించబడింది',
    'status.verified': 'ధృవీకరించబడింది',
    'status.inTransit': 'మార్గంలో ఉంది',
  },
};

interface LanguageContextType {
  language: LanguageCode;
  setLanguage: (lang: LanguageCode) => void;
  t: (key: string, fallback?: string) => string;
}

const LanguageContext = createContext<LanguageContextType>({
  language: 'en',
  setLanguage: () => {},
  t: (k, fb) => fb || k,
});

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<LanguageCode>(() => {
    const saved = localStorage.getItem('mealmesh_lang') as LanguageCode;
    return saved && TRANSLATIONS[saved] ? saved : 'en';
  });

  const setLanguage = (lang: LanguageCode) => {
    setLanguageState(lang);
    localStorage.setItem('mealmesh_lang', lang);
  };

  const t = (key: string, fallback?: string): string => {
    const langDict = TRANSLATIONS[language] || TRANSLATIONS.en;
    if (langDict[key]) return langDict[key];
    if (TRANSLATIONS.en[key]) return TRANSLATIONS.en[key];
    return fallback || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => useContext(LanguageContext);
