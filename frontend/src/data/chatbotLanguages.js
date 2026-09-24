const ENGLISH_LOCALE = {
  welcome:
    "Hello. I am the TRINETRA AI assistant. Ask me about risk hotspots, complaints, alerts, dispatch, analytics, or the investigation workflow.",
  onlineBadge: "ONLINE",
  thinking: "Thinking...",
  speaking: "Speaking...",
  listening: "Listening...",
  voiceMuted: "Voice muted",
  voiceActive: "Voice active",
  selectLang: "Language",
  stopAudio: "Stop audio",
  clearTooltip: "Reset conversation",
  readAloud: "Read aloud",
  copied: "Copied",
  copyText: "Copy",
  jumpToModule: "Open module",
  suggestionTitle: "Try asking",
  listeningPlaceholder: "Listening...",
  placeholder: "Ask TRINETRA about cybercrime intelligence...",
  chips: [
    { label: "Risk hotspots", text: "Show me the current risk hotspots" },
    { label: "NCRP complaints", text: "Open NCRP complaint triage" },
    { label: "Active alerts", text: "Show the active alerts" },
    { label: "Help", text: "How do I use TRINETRA?" },
  ],
};

const LANGUAGE_DEFINITIONS = [
  { code: "en", label: "English", nativeLabel: "English", region: "India", speechLang: "en-IN", badge: "EN" },
  { code: "hi", label: "Hindi", nativeLabel: "हिन्दी", region: "भारत", speechLang: "hi-IN", badge: "हि" },
  { code: "bn", label: "Bengali", nativeLabel: "বাংলা", region: "ভারত", speechLang: "bn-IN", badge: "বা" },
  { code: "te", label: "Telugu", nativeLabel: "తెలుగు", region: "భారతదేశం", speechLang: "te-IN", badge: "తె" },
  { code: "mr", label: "Marathi", nativeLabel: "मराठी", region: "भारत", speechLang: "mr-IN", badge: "म" },
  { code: "ta", label: "Tamil", nativeLabel: "தமிழ்", region: "இந்தியா", speechLang: "ta-IN", badge: "த" },
  { code: "gu", label: "Gujarati", nativeLabel: "ગુજરાતી", region: "ભારત", speechLang: "gu-IN", badge: "ગુ" },
  { code: "kn", label: "Kannada", nativeLabel: "ಕನ್ನಡ", region: "ಭಾರತ", speechLang: "kn-IN", badge: "ಕ" },
  { code: "ml", label: "Malayalam", nativeLabel: "മലയാളം", region: "ഇന്ത്യ", speechLang: "ml-IN", badge: "മ" },
  { code: "pa", label: "Punjabi", nativeLabel: "ਪੰਜਾਬੀ", region: "ਭਾਰਤ", speechLang: "pa-IN", badge: "ਪੰ" },
  { code: "or", label: "Odia", nativeLabel: "ଓଡ଼ିଆ", region: "ଭାରତ", speechLang: "or-IN", badge: "ଓ" },
];

export const SUPPORTED_LANGUAGES = LANGUAGE_DEFINITIONS;

export const LANGUAGE_LOCALES = Object.fromEntries(
  LANGUAGE_DEFINITIONS.map(({ code }) => [code, ENGLISH_LOCALE])
);
