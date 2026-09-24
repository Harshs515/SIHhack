import React, { useState, useEffect, useRef, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  X,
  Send,
  Bot,
  User,
  ArrowRight,
  Minimize2,
  Maximize2,
  Square,
  Loader2,
  Languages,
  RotateCcw,
  Copy,
  Check,
  Sparkles,
  ChevronDown,
  Globe,
  Radio,
  ExternalLink,
} from "lucide-react";
import { API_BASE_URL } from "../api/api";
import {
  SUPPORTED_LANGUAGES,
  LANGUAGE_LOCALES,
} from "../data/chatbotLanguages";

const CHAT_API_URL = `${API_BASE_URL}/chat`;

const getTimestamp = () =>
  new Date().toLocaleTimeString("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
  });

export default function AiChatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [selectedLang, setSelectedLang] = useState(() => {
    return localStorage.getItem("trinetra_chat_lang") || "en";
  });
  const [showLangMenu, setShowLangMenu] = useState(false);
  const [copiedId, setCopiedId] = useState(null);

  const currentLocale = useMemo(() => {
    return LANGUAGE_LOCALES[selectedLang] || LANGUAGE_LOCALES.en;
  }, [selectedLang]);

  const currentLangMeta = useMemo(() => {
    return (
      SUPPORTED_LANGUAGES.find((l) => l.code === selectedLang) ||
      SUPPORTED_LANGUAGES[0]
    );
  }, [selectedLang]);

  const [messages, setMessages] = useState(() => [
    {
      id: "initial-bot-msg",
      sender: "bot",
      text:
        (LANGUAGE_LOCALES[selectedLang] || LANGUAGE_LOCALES.en).welcome ||
        LANGUAGE_LOCALES.en.welcome,
      route: null,
      routeLabel: null,
      timestamp: getTimestamp(),
    },
  ]);

  const [inputValue, setInputValue] = useState("");
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const messagesEndRef = useRef(null);
  const recognitionRef = useRef(null);
  const langMenuRef = useRef(null);
  const navigate = useNavigate();

  // Save language preference
  useEffect(() => {
    localStorage.setItem("trinetra_chat_lang", selectedLang);
  }, [selectedLang]);

  // Close language menu on click outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (langMenuRef.current && !langMenuRef.current.contains(e.target)) {
        setShowLangMenu(false);
      }
    };
    if (showLangMenu) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showLangMenu]);

  /* ============================================================
     SPEECH RECOGNITION (Dynamic Language Switched)
  ============================================================ */

  useEffect(() => {
    if (typeof window === "undefined") return;

    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      recognitionRef.current = null;
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = currentLangMeta.speechLang || "en-IN";

      recognition.onstart = () => {
        setIsListening(true);
      };

      recognition.onresult = (event) => {
        const transcript = event.results?.[0]?.[0]?.transcript?.trim();
        if (transcript) {
          setInputValue(transcript);
          handleSendMessage(transcript);
        }
      };

      recognition.onerror = (event) => {
        console.warn("Speech recognition error:", event.error);
        setIsListening(false);
        if (event.error === "not-allowed") {
          alert(
            "Microphone permission was denied. Please allow microphone access to talk to TRINETRA."
          );
        }
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = recognition;
    } catch (err) {
      console.warn("Speech recognition init error:", err);
    }

    return () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch {
          // Already stopped
        }
      }
    };
  }, [currentLangMeta]);

  /* ============================================================
     AUTO SCROLL
  ============================================================ */

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({
      behavior: "smooth",
    });
  }, [messages, isOpen, isLoading]);

  /* ============================================================
     TEXT TO SPEECH (Multilingual TTS)
  ============================================================ */

  const speakText = (text) => {
    if (!text || isMuted) return;

    if (typeof window === "undefined" || !("speechSynthesis" in window)) {
      return;
    }

    try {
      window.speechSynthesis.cancel();

      const cleanSpeech = text
        .replace(/[*_#`>]/g, "")
        .replace(/•/g, "")
        .replace(/&rarr;/g, "to")
        .replace(/🔴|🟠|🔵|🗺️|🧠|🕸️|🚓|📑|📊|🎤/g, "")
        .replace(/\n+/g, ". ")
        .trim();

      if (!cleanSpeech) return;

      const utterance = new SpeechSynthesisUtterance(cleanSpeech);
      utterance.rate = 1.0;
      utterance.pitch = 1.0;
      utterance.volume = 1.0;
      utterance.lang = currentLangMeta.speechLang || "en-IN";

      // Attempt to pick a matching language voice if available
      const voices = window.speechSynthesis.getVoices();
      if (voices && voices.length > 0) {
        const matchingVoice = voices.find(
          (v) =>
            v.lang.toLowerCase() ===
              (currentLangMeta.speechLang || "en-IN").toLowerCase() ||
            v.lang.toLowerCase().startsWith(selectedLang)
        );
        if (matchingVoice) {
          utterance.voice = matchingVoice;
        }
      }

      utterance.onstart = () => {
        setIsSpeaking(true);
      };

      utterance.onend = () => {
        setIsSpeaking(false);
      };

      utterance.onerror = () => {
        setIsSpeaking(false);
      };

      window.speechSynthesis.speak(utterance);
    } catch (error) {
      console.error("Text-to-speech error:", error);
      setIsSpeaking(false);
    }
  };

  const stopSpeaking = () => {
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.cancel();
    }
    setIsSpeaking(false);
  };

  /* ============================================================
     MUTE & MIC TOGGLE
  ============================================================ */

  const toggleMute = () => {
    if (!isMuted) {
      stopSpeaking();
      setIsMuted(true);
    } else {
      setIsMuted(false);
    }
  };

  const toggleMic = () => {
    if (!recognitionRef.current) {
      alert(
        "Microphone speech recognition is not supported in this browser. Please use Chrome or Edge."
      );
      return;
    }

    if (isLoading) return;

    if (isListening) {
      try {
        recognitionRef.current.stop();
      } catch (error) {
        console.error(error);
      }
      setIsListening(false);
      return;
    }

    stopSpeaking();

    try {
      recognitionRef.current.start();
    } catch (error) {
      console.error("Microphone error:", error);
    }
  };

  /* ============================================================
     LANGUAGE SWITCH HANDLER
  ============================================================ */

  const handleLanguageChange = (langCode) => {
    setSelectedLang(langCode);
    setShowLangMenu(false);
    stopSpeaking();

    const newLocale = LANGUAGE_LOCALES[langCode] || LANGUAGE_LOCALES.en;
    const langInfo =
      SUPPORTED_LANGUAGES.find((l) => l.code === langCode) ||
      SUPPORTED_LANGUAGES[0];

    // Add a polite system message indicating language switch
    const switchMsg = {
      id: `lang-switch-${Date.now()}`,
      sender: "bot",
      text: newLocale.welcome,
      route: null,
      routeLabel: null,
      timestamp: getTimestamp(),
    };

    setMessages((prev) => [...prev, switchMsg]);
  };

  /* ============================================================
     SEND MESSAGE
  ============================================================ */

  const handleSendMessage = async (textToSend = inputValue) => {
    const trimmed = String(textToSend || "").trim();
    if (!trimmed || isLoading) return;

    stopSpeaking();

    const userMsg = {
      id: `user-${Date.now()}-${Math.random()}`,
      sender: "user",
      text: trimmed,
      route: null,
      routeLabel: null,
      timestamp: getTimestamp(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputValue("");
    setIsLoading(true);

    try {
      const response = await fetch(CHAT_API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: trimmed,
          lang: selectedLang,
        }),
      });

      if (!response.ok) {
        let errorMessage = `Server returned HTTP ${response.status}`;
        try {
          const errorData = await response.json();
          if (errorData?.error) errorMessage = errorData.error;
        } catch {
          // Non-JSON response
        }
        throw new Error(errorMessage);
      }

      const data = await response.json();
      const botReply =
        data?.reply ||
        "I received your inquiry, but no intelligence reply was generated.";

      const botMsg = {
        id: `bot-${Date.now()}-${Math.random()}`,
        sender: "bot",
        text: botReply,
        route: data?.route || null,
        routeLabel: data?.routeLabel || null,
        timestamp: getTimestamp(),
      };

      setMessages((prev) => [...prev, botMsg]);

      if (!isMuted) {
        speakText(botReply);
      }
    } catch (error) {
      console.error("Chat API Error:", error);

      const errorMsg = {
        id: `error-${Date.now()}-${Math.random()}`,
        sender: "bot",
        text: `⚠️ **Unable to connect to TRINETRA AI Service**\n\nPlease ensure your backend API server is running on port 5000.\n*Details: ${error.message}*`,
        route: null,
        routeLabel: null,
        timestamp: getTimestamp(),
        isError: true,
      };

      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  /* ============================================================
     RESET CHAT
  ============================================================ */

  const handleResetChat = () => {
    stopSpeaking();
    setMessages([
      {
        id: `initial-bot-${Date.now()}`,
        sender: "bot",
        text: currentLocale.welcome,
        route: null,
        routeLabel: null,
        timestamp: getTimestamp(),
      },
    ]);
  };

  /* ============================================================
     COPY MESSAGE
  ============================================================ */

  const handleCopy = (id, text) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => {
      setCopiedId(null);
    }, 2000);
  };

  /* ============================================================
     MARKDOWN / TEXT FORMATTER
  ============================================================ */

  const renderFormattedText = (text) => {
    if (!text) return null;

    const lines = text.split("\n");
    return lines.map((line, lineIndex) => {
      if (!line.trim()) {
        return <div key={lineIndex} className="trinetra-line-gap" />;
      }

      // Check if bullet point
      const isBullet = line.trim().startsWith("•") || line.trim().startsWith("-");
      const isNumbered = /^\d+\.\s/.test(line.trim());
      const isHeader = line.trim().startsWith("###") || line.trim().startsWith("##");

      // Format bold text **text**
      const formatInline = (str) => {
        const parts = str.split(/(\*\*.*?\*\*)/g);
        return parts.map((part, pIdx) => {
          if (part.startsWith("**") && part.endsWith("**")) {
            return (
              <strong key={pIdx} className="trinetra-bold-text">
                {part.slice(2, -2)}
              </strong>
            );
          }
          if (part.startsWith("*") && part.endsWith("*") && part.length > 2) {
            return (
              <em key={pIdx} className="trinetra-italic-text">
                {part.slice(1, -1)}
              </em>
            );
          }
          return part;
        });
      };

      if (isHeader) {
        const cleanHeader = line.replace(/^#+\s*/, "");
        return (
          <h5 key={lineIndex} className="trinetra-msg-header">
            {formatInline(cleanHeader)}
          </h5>
        );
      }

      if (isBullet) {
        const cleanBullet = line.trim().replace(/^[•\-]\s*/, "");
        return (
          <div key={lineIndex} className="trinetra-msg-bullet">
            <span className="trinetra-bullet-dot"></span>
            <span className="trinetra-bullet-content">
              {formatInline(cleanBullet)}
            </span>
          </div>
        );
      }

      if (isNumbered) {
        const match = line.trim().match(/^(\d+)\.\s*(.*)/);
        if (match) {
          return (
            <div key={lineIndex} className="trinetra-msg-numbered">
              <span className="trinetra-number-badge">{match[1]}</span>
              <span className="trinetra-number-content">
                {formatInline(match[2])}
              </span>
            </div>
          );
        }
      }

      return (
        <p key={lineIndex} className="trinetra-msg-p">
          {formatInline(line)}
        </p>
      );
    });
  };

  /* ============================================================
     RENDER
  ============================================================ */

  return (
    <>
      {/* ==========================================================
          FLOATING LAUNCHER BUTTON
      ========================================================== */}
      {!isOpen && (
        <div className="trinetra-chat-launcher">
          <button
            onClick={() => setIsOpen(true)}
            className="trinetra-chat-button"
            title="Open TRINETRA Multilingual AI Assistant"
            aria-label="Open AI Assistant"
          >
            <div className="trinetra-button-pulse-ring" />
            <div className="trinetra-button-icon-wrap">
              <Bot size={28} strokeWidth={2.4} />
            </div>

            {/* Language badge floating on launcher */}
            <span className="trinetra-launcher-lang-badge">
              {currentLangMeta.badge}
            </span>

            {/* Online Green Dot */}
            <span className="trinetra-online-dot" />
          </button>
        </div>
      )}

      {/* ==========================================================
          MAIN CHAT WINDOW
      ========================================================== */}
      {isOpen && (
        <div
          className={`trinetra-chat-window ${
            isMinimized ? "trinetra-chat-minimized" : ""
          }`}
        >
          {/* ======================================================
              HEADER
          ====================================================== */}
          <div className="trinetra-chat-header">
            <div className="trinetra-header-left">
              <div className="trinetra-header-icon">
                <Bot size={20} strokeWidth={2.5} />
              </div>

              <div className="trinetra-header-info">
                <div className="trinetra-title-row">
                  <h4>TRINETRA AI</h4>
                  <span className="trinetra-voice-badge">
                    <Sparkles size={10} className="mr-1" />
                    {currentLocale.onlineBadge}
                  </span>
                </div>

                <div className="trinetra-status-row">
                  <span
                    className={`trinetra-live-dot ${
                      isListening ? "recording" : isSpeaking ? "speaking" : ""
                    }`}
                  />
                  <p>
                    {isLoading
                      ? currentLocale.thinking
                      : isSpeaking
                      ? currentLocale.speaking
                      : isListening
                      ? currentLocale.listening
                      : isMuted
                      ? currentLocale.voiceMuted
                      : `${currentLocale.voiceActive} (${currentLangMeta.nativeLabel})`}
                  </p>
                </div>
              </div>
            </div>

            {/* HEADER CONTROLS */}
            <div className="trinetra-header-controls">
              {/* Language Selector Dropdown Button */}
              <div className="trinetra-lang-selector-wrap" ref={langMenuRef}>
                <button
                  onClick={() => setShowLangMenu(!showLangMenu)}
                  className={`trinetra-lang-pill-btn ${
                    showLangMenu ? "active" : ""
                  }`}
                  title="Change Indian Language"
                >
                  <Globe size={13} />
                  <span>{currentLangMeta.nativeLabel}</span>
                  <ChevronDown size={11} />
                </button>

                {/* Dropdown Menu for Languages */}
                {showLangMenu && (
                  <div className="trinetra-lang-dropdown">
                    <div className="trinetra-lang-dropdown-header">
                      <Languages size={14} />
                      <span>{currentLocale.selectLang} (11 Standard)</span>
                    </div>
                    <div className="trinetra-lang-list">
                      {SUPPORTED_LANGUAGES.map((lang) => (
                        <button
                          key={lang.code}
                          onClick={() => handleLanguageChange(lang.code)}
                          className={`trinetra-lang-item ${
                            selectedLang === lang.code ? "selected" : ""
                          }`}
                        >
                          <div className="trinetra-lang-item-left">
                            <span className="trinetra-lang-native">
                              {lang.nativeLabel}
                            </span>
                            <span className="trinetra-lang-english">
                              {lang.label} • {lang.region}
                            </span>
                          </div>
                          {selectedLang === lang.code && (
                            <Check size={14} className="trinetra-lang-check" />
                          )}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Stop Audio Button */}
              {isSpeaking && (
                <button
                  onClick={stopSpeaking}
                  className="trinetra-stop-button"
                  title="Stop audio readout"
                >
                  <Square size={10} fill="currentColor" />
                  <span>{currentLocale.stopAudio}</span>
                </button>
              )}

              {/* Mute Toggle */}
              <button
                onClick={toggleMute}
                className={`trinetra-icon-button ${isMuted ? "muted" : ""}`}
                title={isMuted ? "Unmute Assistant Voice" : "Mute Voice"}
              >
                {isMuted ? <VolumeX size={15} /> : <Volume2 size={15} />}
              </button>

              {/* Reset Chat */}
              <button
                onClick={handleResetChat}
                className="trinetra-icon-button"
                title={currentLocale.clearTooltip}
              >
                <RotateCcw size={14} />
              </button>

              {/* Minimize / Expand */}
              <button
                onClick={() => setIsMinimized(!isMinimized)}
                className="trinetra-icon-button"
                title={isMinimized ? "Expand Chat" : "Minimize"}
              >
                {isMinimized ? (
                  <Maximize2 size={14} />
                ) : (
                  <Minimize2 size={14} />
                )}
              </button>

              {/* Close Button */}
              <button
                onClick={() => {
                  stopSpeaking();
                  setIsOpen(false);
                }}
                className="trinetra-icon-button close"
                title="Close Assistant"
              >
                <X size={16} />
              </button>
            </div>
          </div>

          {/* ======================================================
              BODY (When not minimized)
          ====================================================== */}
          {!isMinimized && (
            <>
              {/* Quick Language Switcher Bar */}
              <div className="trinetra-quick-lang-bar">
                <span className="trinetra-lang-bar-label">
                  <Languages size={12} />
                  <span>LANG:</span>
                </span>
                <div className="trinetra-quick-lang-pills">
                  {SUPPORTED_LANGUAGES.map((l) => (
                    <button
                      key={l.code}
                      onClick={() => handleLanguageChange(l.code)}
                      className={`trinetra-mini-lang-pill ${
                        selectedLang === l.code ? "active" : ""
                      }`}
                    >
                      {l.nativeLabel}
                    </button>
                  ))}
                </div>
              </div>

              {/* Speaking / Listening Audio Visualizer Bar */}
              {(isSpeaking || isListening) && (
                <div className="trinetra-audio-visualizer-bar">
                  <span className="trinetra-wave-bar b1" />
                  <span className="trinetra-wave-bar b2" />
                  <span className="trinetra-wave-bar b3" />
                  <span className="trinetra-wave-bar b4" />
                  <span className="trinetra-wave-bar b5" />
                  <span className="trinetra-wave-text">
                    {isListening
                      ? `Listening in ${currentLangMeta.label}...`
                      : `Speaking in ${currentLangMeta.label}...`}
                  </span>
                  <span className="trinetra-wave-bar b5" />
                  <span className="trinetra-wave-bar b4" />
                  <span className="trinetra-wave-bar b3" />
                  <span className="trinetra-wave-bar b2" />
                  <span className="trinetra-wave-bar b1" />
                </div>
              )}

              {/* MESSAGE AREA */}
              <div className="trinetra-messages">
                {messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`trinetra-message-wrapper ${
                      msg.sender === "user" ? "user-message" : "bot-message"
                    }`}
                  >
                    <div className="trinetra-message-row">
                      {/* Avatar */}
                      <div
                        className={`trinetra-avatar ${
                          msg.sender === "user" ? "user-avatar" : "bot-avatar"
                        }`}
                      >
                        {msg.sender === "user" ? (
                          <User size={14} />
                        ) : (
                          <Bot size={15} />
                        )}
                      </div>

                      {/* Bubble */}
                      <div
                        className={`trinetra-bubble ${
                          msg.sender === "user"
                            ? "user-bubble"
                            : "bot-bubble"
                        } ${msg.isError ? "error-bubble" : ""}`}
                      >
                        <div className="trinetra-message-text">
                          {renderFormattedText(msg.text)}
                        </div>

                        {/* Bot Actions Card */}
                        {msg.sender === "bot" && (
                          <div className="trinetra-bot-actions">
                            <div className="trinetra-bot-action-buttons">
                              {/* Read Aloud Button */}
                              <button
                                onClick={() => speakText(msg.text)}
                                disabled={isMuted}
                                className={`trinetra-action-pill ${
                                  isMuted ? "disabled" : ""
                                }`}
                                title="Read aloud in current language"
                              >
                                <Volume2 size={12} />
                                <span>{currentLocale.readAloud}</span>
                              </button>

                              {/* Copy Button */}
                              <button
                                onClick={() => handleCopy(msg.id, msg.text)}
                                className="trinetra-action-pill"
                                title="Copy message text"
                              >
                                {copiedId === msg.id ? (
                                  <>
                                    <Check size={12} className="text-emerald-400" />
                                    <span className="text-emerald-400">
                                      {currentLocale.copied}
                                    </span>
                                  </>
                                ) : (
                                  <>
                                    <Copy size={12} />
                                    <span>{currentLocale.copyText}</span>
                                  </>
                                )}
                              </button>
                            </div>

                            {/* Direct Route Jump Button */}
                            {msg.route && (
                              <button
                                onClick={() => {
                                  navigate(msg.route);
                                }}
                                className="trinetra-route-button"
                                title={`Navigate to ${msg.route}`}
                              >
                                <span>
                                  {msg.routeLabel || currentLocale.jumpToModule}
                                </span>
                                <ArrowRight size={12} />
                              </button>
                            )}
                          </div>
                        )}
                      </div>
                    </div>

                    <span className="trinetra-timestamp">
                      {msg.timestamp}
                    </span>
                  </div>
                ))}

                {/* Loading / Thinking Bubble */}
                {isLoading && (
                  <div className="trinetra-loading-row">
                    <div className="trinetra-avatar bot-avatar">
                      <Bot size={15} />
                    </div>
                    <div className="trinetra-loading-bubble">
                      <Loader2 size={15} className="trinetra-spin" />
                      <span>{currentLocale.thinking}</span>
                    </div>
                  </div>
                )}

                <div ref={messagesEndRef} />
              </div>

              {/* ==================================================
                  QUICK PROMPTS (Localized Chips)
              ================================================== */}
              <div className="trinetra-quick-prompts-container">
                <div className="trinetra-quick-prompts-header">
                  <Sparkles size={11} />
                  <span>{currentLocale.suggestionTitle}</span>
                </div>
                <div className="trinetra-quick-prompts">
                  {currentLocale.chips.map((chip, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleSendMessage(chip.text)}
                      disabled={isLoading}
                      className="trinetra-chip"
                      title={chip.text}
                    >
                      {chip.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* ==================================================
                  INPUT BAR
              ================================================== */}
              <div className="trinetra-input-area">
                {/* Microphone Button with Pulse Radar */}
                <button
                  onClick={toggleMic}
                  disabled={isLoading}
                  className={`trinetra-mic-button ${
                    isListening ? "listening" : ""
                  }`}
                  title={
                    isListening
                      ? "Stop Listening"
                      : `Speak in ${currentLangMeta.label} (${currentLangMeta.nativeLabel})`
                  }
                >
                  {isListening ? (
                    <>
                      <div className="trinetra-mic-radar" />
                      <MicOff size={18} />
                    </>
                  ) : (
                    <Mic size={18} />
                  )}
                </button>

                {/* Text Input */}
                <div className="trinetra-input-wrapper">
                  <input
                    type="text"
                    placeholder={
                      isLoading
                        ? currentLocale.thinking
                        : isListening
                        ? currentLocale.listeningPlaceholder
                        : currentLocale.placeholder
                    }
                    value={inputValue}
                    disabled={isLoading}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && !e.shiftKey) {
                        e.preventDefault();
                        handleSendMessage();
                      }
                    }}
                    className="trinetra-input"
                  />
                  <span className="trinetra-input-lang-tag">
                    {currentLangMeta.badge}
                  </span>
                </div>

                {/* Send Button */}
                <button
                  onClick={() => handleSendMessage()}
                  disabled={!inputValue.trim() || isLoading}
                  className="trinetra-send-button"
                  title="Send message (Enter)"
                >
                  {isLoading ? (
                    <Loader2 size={16} className="trinetra-spin" />
                  ) : (
                    <Send size={16} />
                  )}
                </button>
              </div>
            </>
          )}
        </div>
      )}

      {/* ==========================================================
          STYLES (Enhanced Glassmorphism & Cyber Aesthetics)
      ========================================================== */}
      <style>{`
        /* ========================================================
           GLOBAL RESETS & CONTAINERS
        ======================================================== */
        .trinetra-chat-window,
        .trinetra-chat-window *,
        .trinetra-chat-launcher,
        .trinetra-chat-launcher * {
          box-sizing: border-box;
          font-family: 'Plus Jakarta Sans', 'Outfit', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        }

        /* ========================================================
           FLOATING LAUNCHER
        ======================================================== */
        .trinetra-chat-launcher {
          position: fixed;
          right: 24px;
          bottom: 24px;
          z-index: 9999;
        }

        .trinetra-chat-button {
          width: 62px;
          height: 62px;
          padding: 0;
          border: 2px solid rgba(0, 229, 255, 0.4);
          border-radius: 50%;
          background: linear-gradient(135deg, #00e5ff 0%, #2563eb 100%);
          color: #040914;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          position: relative;
          box-shadow: 0 10px 32px rgba(0, 229, 255, 0.45), 0 0 20px rgba(37, 99, 235, 0.35);
          transition: transform 0.25s cubic-bezier(0.175, 0.885, 0.32, 1.275), box-shadow 0.25s ease;
        }

        .trinetra-chat-button:hover {
          transform: translateY(-4px) scale(1.08);
          box-shadow: 0 14px 40px rgba(0, 229, 255, 0.65), 0 0 30px rgba(37, 99, 235, 0.5);
        }

        .trinetra-button-pulse-ring {
          position: absolute;
          inset: -6px;
          border-radius: 50%;
          border: 2px solid rgba(0, 229, 255, 0.5);
          animation: trinetra-ring-pulse 2.2s infinite ease-out;
          pointer-events: none;
        }

        @keyframes trinetra-ring-pulse {
          0% { transform: scale(0.95); opacity: 0.8; }
          100% { transform: scale(1.35); opacity: 0; }
        }

        .trinetra-launcher-lang-badge {
          position: absolute;
          left: -4px;
          top: -4px;
          padding: 2px 6px;
          background: #091122;
          color: #00e5ff;
          border: 1px solid rgba(0, 229, 255, 0.4);
          border-radius: 8px;
          font-size: 0.65rem;
          font-weight: 800;
          letter-spacing: 0.05em;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.4);
        }

        .trinetra-online-dot {
          position: absolute;
          width: 14px;
          height: 14px;
          right: -1px;
          bottom: 1px;
          border-radius: 50%;
          background: #00e676;
          border: 2.5px solid #080d1a;
          box-shadow: 0 0 10px #00e676;
        }

        /* ========================================================
           CHAT WINDOW
        ======================================================== */
        .trinetra-chat-window {
          position: fixed;
          right: 24px;
          bottom: 24px;
          width: min(450px, calc(100vw - 32px));
          height: min(690px, calc(100vh - 48px));
          display: flex;
          flex-direction: column;
          overflow: hidden;
          z-index: 9999;
          border: 1px solid rgba(0, 229, 255, 0.35);
          border-radius: 20px;
          background: linear-gradient(180deg, rgba(8, 14, 28, 0.98), rgba(4, 8, 18, 0.99));
          box-shadow: 0 25px 70px rgba(0, 0, 0, 0.85), 0 0 40px rgba(0, 229, 255, 0.12);
          backdrop-filter: blur(32px);
          -webkit-backdrop-filter: blur(32px);
          animation: trinetra-chat-open 0.28s cubic-bezier(0.16, 1, 0.3, 1);
        }

        .trinetra-chat-minimized {
          width: min(380px, calc(100vw - 32px));
          height: 68px;
        }

        @keyframes trinetra-chat-open {
          from { opacity: 0; transform: translateY(20px) scale(0.96); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }

        /* ========================================================
           HEADER
        ======================================================== */
        .trinetra-chat-header {
          min-height: 70px;
          flex-shrink: 0;
          padding: 12px 14px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 8px;
          border-bottom: 1px solid rgba(255, 255, 255, 0.09);
          background: linear-gradient(90deg, rgba(0, 229, 255, 0.14) 0%, rgba(37, 99, 235, 0.08) 100%);
        }

        .trinetra-header-left {
          min-width: 0;
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .trinetra-header-icon {
          width: 38px;
          height: 38px;
          flex-shrink: 0;
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: linear-gradient(135deg, #00e5ff, #2563eb);
          color: #040914;
          box-shadow: 0 4px 14px rgba(0, 229, 255, 0.3);
        }

        .trinetra-header-info {
          min-width: 0;
        }

        .trinetra-title-row {
          display: flex;
          align-items: center;
          gap: 6px;
        }

        .trinetra-title-row h4 {
          margin: 0;
          color: #ffffff;
          font-size: 0.96rem;
          font-weight: 800;
          letter-spacing: 0.01em;
        }

        .trinetra-voice-badge {
          display: inline-flex;
          align-items: center;
          padding: 2px 7px;
          border-radius: 6px;
          color: #00e5ff;
          background: rgba(0, 229, 255, 0.12);
          border: 1px solid rgba(0, 229, 255, 0.3);
          font-size: 0.58rem;
          font-weight: 800;
          letter-spacing: 0.04em;
        }

        .trinetra-status-row {
          display: flex;
          align-items: center;
          gap: 6px;
          margin-top: 3px;
        }

        .trinetra-live-dot {
          width: 7px;
          height: 7px;
          border-radius: 50%;
          background: #00e676;
          box-shadow: 0 0 6px #00e676;
        }

        .trinetra-live-dot.recording {
          background: #ff385c;
          box-shadow: 0 0 8px #ff385c;
          animation: trinetra-pulse 1.2s infinite;
        }

        .trinetra-live-dot.speaking {
          background: #00e5ff;
          box-shadow: 0 0 8px #00e5ff;
          animation: trinetra-pulse 1.2s infinite;
        }

        .trinetra-status-row p {
          margin: 0;
          color: #94a3b8;
          font-size: 0.68rem;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .trinetra-header-controls {
          flex-shrink: 0;
          display: flex;
          align-items: center;
          gap: 5px;
        }

        /* Language Pill in Header */
        .trinetra-lang-selector-wrap {
          position: relative;
        }

        .trinetra-lang-pill-btn {
          display: flex;
          align-items: center;
          gap: 4px;
          padding: 4px 8px;
          border-radius: 8px;
          border: 1px solid rgba(0, 229, 255, 0.3);
          background: rgba(0, 229, 255, 0.08);
          color: #7dd3fc;
          font-size: 0.7rem;
          font-weight: 700;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .trinetra-lang-pill-btn:hover,
        .trinetra-lang-pill-btn.active {
          background: rgba(0, 229, 255, 0.2);
          border-color: rgba(0, 229, 255, 0.6);
          color: #ffffff;
        }

        /* Language Dropdown */
        .trinetra-lang-dropdown {
          position: absolute;
          top: calc(100% + 8px);
          right: 0;
          width: 270px;
          max-height: 380px;
          background: #0b1326;
          border: 1px solid rgba(0, 229, 255, 0.35);
          border-radius: 12px;
          box-shadow: 0 16px 40px rgba(0, 0, 0, 0.8), 0 0 20px rgba(0, 229, 255, 0.15);
          z-index: 10001;
          display: flex;
          flex-direction: column;
          overflow: hidden;
          animation: trinetra-menu-slide 0.2s ease-out;
        }

        @keyframes trinetra-menu-slide {
          from { opacity: 0; transform: translateY(-8px); }
          to { opacity: 1; transform: translateY(0); }
        }

        .trinetra-lang-dropdown-header {
          padding: 8px 12px;
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 0.68rem;
          font-weight: 700;
          color: #00e5ff;
          background: rgba(0, 229, 255, 0.06);
          border-bottom: 1px solid rgba(255, 255, 255, 0.07);
        }

        .trinetra-lang-list {
          overflow-y: auto;
          max-height: 330px;
          padding: 6px;
        }

        .trinetra-lang-item {
          width: 100%;
          padding: 8px 10px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          border: 1px solid transparent;
          border-radius: 8px;
          background: transparent;
          cursor: pointer;
          transition: all 0.15s ease;
          text-align: left;
        }

        .trinetra-lang-item:hover {
          background: rgba(0, 229, 255, 0.1);
          border-color: rgba(0, 229, 255, 0.2);
        }

        .trinetra-lang-item.selected {
          background: rgba(0, 229, 255, 0.15);
          border-color: rgba(0, 229, 255, 0.4);
        }

        .trinetra-lang-item-left {
          display: flex;
          flex-direction: column;
        }

        .trinetra-lang-native {
          font-size: 0.82rem;
          font-weight: 700;
          color: #f8fafc;
        }

        .trinetra-lang-english {
          font-size: 0.62rem;
          color: #94a3b8;
        }

        .trinetra-lang-check {
          color: #00e5ff;
        }

        /* Icon Buttons */
        .trinetra-icon-button {
          width: 32px;
          height: 32px;
          padding: 0;
          border: 1px solid transparent;
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: transparent;
          color: #94a3b8;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .trinetra-icon-button:hover {
          color: #ffffff;
          background: rgba(255, 255, 255, 0.08);
          border-color: rgba(255, 255, 255, 0.15);
        }

        .trinetra-icon-button.muted {
          color: #ff385c;
          background: rgba(255, 56, 92, 0.12);
          border-color: rgba(255, 56, 92, 0.3);
        }

        .trinetra-icon-button.close:hover {
          color: #ff385c;
          background: rgba(255, 56, 92, 0.12);
        }

        .trinetra-stop-button {
          height: 30px;
          padding: 0 8px;
          display: flex;
          align-items: center;
          gap: 5px;
          border-radius: 7px;
          background: rgba(255, 56, 92, 0.15);
          border: 1px solid rgba(255, 56, 92, 0.4);
          color: #ff6b8b;
          font-size: 0.65rem;
          font-weight: 700;
          cursor: pointer;
        }

        /* ========================================================
           QUICK LANGUAGE BAR
        ======================================================== */
        .trinetra-quick-lang-bar {
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 6px 10px;
          background: rgba(0, 0, 0, 0.35);
          border-bottom: 1px solid rgba(255, 255, 255, 0.05);
          overflow-x: auto;
          scrollbar-width: none;
        }

        .trinetra-quick-lang-bar::-webkit-scrollbar {
          display: none;
        }

        .trinetra-lang-bar-label {
          display: flex;
          align-items: center;
          gap: 3px;
          color: #64748b;
          font-size: 0.6rem;
          font-weight: 800;
          letter-spacing: 0.05em;
          white-space: nowrap;
        }

        .trinetra-quick-lang-pills {
          display: flex;
          gap: 5px;
        }

        .trinetra-mini-lang-pill {
          padding: 3px 8px;
          border-radius: 999px;
          border: 1px solid rgba(255, 255, 255, 0.08);
          background: rgba(255, 255, 255, 0.03);
          color: #cbd5e1;
          font-size: 0.65rem;
          font-weight: 600;
          cursor: pointer;
          white-space: nowrap;
          transition: all 0.18s ease;
        }

        .trinetra-mini-lang-pill:hover {
          background: rgba(0, 229, 255, 0.1);
          border-color: rgba(0, 229, 255, 0.3);
          color: #ffffff;
        }

        .trinetra-mini-lang-pill.active {
          background: linear-gradient(135deg, rgba(0, 229, 255, 0.25), rgba(37, 99, 235, 0.25));
          border-color: #00e5ff;
          color: #00e5ff;
          font-weight: 700;
          box-shadow: 0 0 10px rgba(0, 229, 255, 0.2);
        }

        /* ========================================================
           AUDIO VISUALIZER
        ======================================================== */
        .trinetra-audio-visualizer-bar {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 4px;
          padding: 6px 12px;
          background: linear-gradient(90deg, rgba(0, 229, 255, 0.15), rgba(37, 99, 235, 0.15));
          border-bottom: 1px solid rgba(0, 229, 255, 0.2);
        }

        .trinetra-wave-bar {
          width: 3px;
          height: 14px;
          border-radius: 3px;
          background: #00e5ff;
          animation: trinetra-wave-anim 0.8s ease-in-out infinite alternate;
        }

        .trinetra-wave-bar.b1 { animation-delay: 0.1s; height: 8px; }
        .trinetra-wave-bar.b2 { animation-delay: 0.25s; height: 16px; }
        .trinetra-wave-bar.b3 { animation-delay: 0.4s; height: 20px; }
        .trinetra-wave-bar.b4 { animation-delay: 0.55s; height: 12px; }
        .trinetra-wave-bar.b5 { animation-delay: 0.7s; height: 6px; }

        @keyframes trinetra-wave-anim {
          0% { transform: scaleY(0.4); opacity: 0.5; }
          100% { transform: scaleY(1.3); opacity: 1; }
        }

        .trinetra-wave-text {
          font-size: 0.68rem;
          font-weight: 700;
          color: #00e5ff;
          margin: 0 8px;
        }

        /* ========================================================
           MESSAGE AREA
        ======================================================== */
        .trinetra-messages {
          flex: 1;
          min-height: 0;
          overflow-y: auto;
          overflow-x: hidden;
          padding: 16px;
          display: flex;
          flex-direction: column;
          gap: 14px;
          scrollbar-width: thin;
          scrollbar-color: rgba(0, 229, 255, 0.25) transparent;
        }

        .trinetra-messages::-webkit-scrollbar {
          width: 5px;
        }

        .trinetra-messages::-webkit-scrollbar-thumb {
          border-radius: 10px;
          background: rgba(0, 229, 255, 0.25);
        }

        .trinetra-message-wrapper {
          width: 100%;
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .trinetra-message-wrapper.user-message {
          align-items: flex-end;
        }

        .trinetra-message-wrapper.bot-message {
          align-items: flex-start;
        }

        .trinetra-message-row {
          width: 100%;
          display: flex;
          align-items: flex-start;
          gap: 9px;
        }

        .user-message .trinetra-message-row {
          flex-direction: row-reverse;
        }

        .trinetra-avatar {
          width: 30px;
          height: 30px;
          flex: 0 0 30px;
          border-radius: 9px;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-top: 2px;
        }

        .bot-avatar {
          color: #00e5ff;
          background: rgba(0, 229, 255, 0.12);
          border: 1px solid rgba(0, 229, 255, 0.25);
        }

        .user-avatar {
          color: #60a5fa;
          background: rgba(59, 130, 246, 0.15);
          border: 1px solid rgba(59, 130, 246, 0.3);
        }

        /* ========================================================
           BUBBLE STYLES & READABILITY
        ======================================================== */
        .trinetra-bubble {
          min-width: 0;
          max-width: calc(100% - 38px);
          padding: 12px 15px;
          border-radius: 15px;
          line-height: 1.6;
          overflow-wrap: anywhere;
          word-break: break-word;
          box-shadow: 0 6px 18px rgba(0, 0, 0, 0.3);
        }

        .bot-bubble {
          color: #f1f5f9;
          background: rgba(13, 22, 41, 0.94);
          border: 1px solid rgba(148, 163, 184, 0.18);
        }

        .user-bubble {
          color: #ffffff;
          background: linear-gradient(135deg, #0284c7 0%, #2563eb 100%);
          border: 1px solid rgba(255, 255, 255, 0.15);
          font-weight: 500;
        }

        .error-bubble {
          color: #fecdd3;
          background: rgba(225, 29, 72, 0.15);
          border-color: rgba(225, 29, 72, 0.4);
        }

        .trinetra-message-text {
          font-size: 0.84rem;
          letter-spacing: 0.01em;
        }

        .trinetra-msg-p {
          margin: 0 0 6px 0;
          line-height: 1.55;
        }

        .trinetra-msg-p:last-child {
          margin-bottom: 0;
        }

        .trinetra-bold-text {
          font-weight: 700;
          color: #ffffff;
        }

        .trinetra-italic-text {
          color: #94a3b8;
          font-style: italic;
        }

        .trinetra-msg-header {
          margin: 8px 0 4px;
          font-size: 0.88rem;
          font-weight: 800;
          color: #00e5ff;
        }

        .trinetra-msg-bullet {
          display: flex;
          align-items: flex-start;
          gap: 7px;
          margin: 4px 0;
        }

        .trinetra-bullet-dot {
          width: 5px;
          height: 5px;
          border-radius: 50%;
          background: #00e5ff;
          margin-top: 8px;
          flex-shrink: 0;
        }

        .trinetra-bullet-content {
          flex: 1;
        }

        .trinetra-msg-numbered {
          display: flex;
          align-items: flex-start;
          gap: 7px;
          margin: 4px 0;
        }

        .trinetra-number-badge {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          width: 17px;
          height: 17px;
          border-radius: 50%;
          background: rgba(0, 229, 255, 0.15);
          border: 1px solid rgba(0, 229, 255, 0.3);
          color: #00e5ff;
          font-size: 0.62rem;
          font-weight: 800;
          margin-top: 2px;
          flex-shrink: 0;
        }

        .trinetra-number-content {
          flex: 1;
        }

        .trinetra-line-gap {
          height: 6px;
        }

        /* ========================================================
           BOT ACTIONS & NAVIGATION
        ======================================================== */
        .trinetra-bot-actions {
          margin-top: 10px;
          padding-top: 9px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          flex-wrap: wrap;
          gap: 8px;
          border-top: 1px solid rgba(255, 255, 255, 0.08);
        }

        .trinetra-bot-action-buttons {
          display: flex;
          align-items: center;
          gap: 6px;
        }

        .trinetra-action-pill {
          display: flex;
          align-items: center;
          gap: 4px;
          padding: 3px 8px;
          border-radius: 6px;
          border: 1px solid rgba(255, 255, 255, 0.08);
          background: rgba(255, 255, 255, 0.04);
          color: #94a3b8;
          font-size: 0.66rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.18s ease;
        }

        .trinetra-action-pill:hover:not(:disabled) {
          background: rgba(0, 229, 255, 0.1);
          border-color: rgba(0, 229, 255, 0.3);
          color: #00e5ff;
        }

        .trinetra-action-pill.disabled {
          opacity: 0.4;
          cursor: not-allowed;
        }

        .trinetra-route-button {
          display: inline-flex;
          align-items: center;
          gap: 5px;
          padding: 5px 10px;
          border-radius: 8px;
          border: none;
          background: linear-gradient(135deg, #00e676 0%, #00e5ff 100%);
          color: #040914;
          font-size: 0.68rem;
          font-weight: 800;
          cursor: pointer;
          box-shadow: 0 4px 12px rgba(0, 230, 118, 0.25);
          transition: transform 0.18s ease, box-shadow 0.18s ease;
        }

        .trinetra-route-button:hover {
          transform: translateY(-1px);
          box-shadow: 0 6px 16px rgba(0, 230, 118, 0.4);
        }

        .trinetra-timestamp {
          margin: 0 4px;
          color: #64748b;
          font-size: 0.6rem;
        }

        /* Loading */
        .trinetra-loading-row {
          display: flex;
          align-items: flex-start;
          gap: 9px;
        }

        .trinetra-loading-bubble {
          padding: 10px 14px;
          display: flex;
          align-items: center;
          gap: 8px;
          border-radius: 14px;
          color: #00e5ff;
          background: rgba(13, 22, 41, 0.94);
          border: 1px solid rgba(0, 229, 255, 0.2);
          font-size: 0.78rem;
          font-weight: 600;
        }

        .trinetra-spin {
          animation: trinetra-spin 1s linear infinite;
        }

        @keyframes trinetra-spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }

        /* ========================================================
           QUICK PROMPT CHIPS
        ======================================================== */
        .trinetra-quick-prompts-container {
          flex-shrink: 0;
          padding: 8px 12px;
          background: rgba(0, 0, 0, 0.25);
          border-top: 1px solid rgba(255, 255, 255, 0.06);
        }

        .trinetra-quick-prompts-header {
          display: flex;
          align-items: center;
          gap: 4px;
          margin-bottom: 6px;
          color: #7dd3fc;
          font-size: 0.62rem;
          font-weight: 700;
          letter-spacing: 0.03em;
        }

        .trinetra-quick-prompts {
          display: flex;
          gap: 7px;
          overflow-x: auto;
          scrollbar-width: none;
        }

        .trinetra-quick-prompts::-webkit-scrollbar {
          display: none;
        }

        .trinetra-chip {
          flex: 0 0 auto;
          padding: 6px 11px;
          border-radius: 999px;
          border: 1px solid rgba(0, 229, 255, 0.22);
          background: rgba(0, 229, 255, 0.07);
          color: #e0f2fe;
          font-size: 0.68rem;
          font-weight: 600;
          cursor: pointer;
          white-space: nowrap;
          transition: all 0.2s ease;
        }

        .trinetra-chip:hover:not(:disabled) {
          background: rgba(0, 229, 255, 0.18);
          border-color: rgba(0, 229, 255, 0.5);
          transform: translateY(-1px);
          color: #ffffff;
        }

        .trinetra-chip:disabled {
          opacity: 0.4;
          cursor: default;
        }

        /* ========================================================
           INPUT AREA
        ======================================================== */
        .trinetra-input-area {
          flex-shrink: 0;
          padding: 10px 12px;
          display: flex;
          align-items: center;
          gap: 8px;
          border-top: 1px solid rgba(255, 255, 255, 0.08);
          background: rgba(0, 0, 0, 0.45);
        }

        .trinetra-mic-button {
          width: 42px;
          height: 42px;
          flex: 0 0 42px;
          padding: 0;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #00e5ff;
          background: rgba(0, 229, 255, 0.12);
          border: 1.5px solid rgba(0, 229, 255, 0.35);
          cursor: pointer;
          position: relative;
          transition: all 0.2s ease;
        }

        .trinetra-mic-button:hover:not(:disabled) {
          background: rgba(0, 229, 255, 0.22);
          transform: scale(1.05);
        }

        .trinetra-mic-button.listening {
          color: #ffffff;
          background: #ff385c;
          border-color: #ff385c;
        }

        .trinetra-mic-radar {
          position: absolute;
          inset: -6px;
          border-radius: 50%;
          border: 2px solid rgba(255, 56, 92, 0.6);
          animation: trinetra-radar-pulse 1.4s infinite ease-out;
        }

        @keyframes trinetra-radar-pulse {
          0% { transform: scale(0.9); opacity: 0.9; }
          100% { transform: scale(1.45); opacity: 0; }
        }

        .trinetra-input-wrapper {
          flex: 1;
          position: relative;
          display: flex;
          align-items: center;
        }

        .trinetra-input {
          width: 100%;
          height: 42px;
          padding: 0 38px 0 14px;
          border-radius: 11px;
          outline: none;
          color: #f8fafc;
          background: rgba(15, 23, 42, 0.95);
          border: 1px solid rgba(148, 163, 184, 0.25);
          font-size: 0.82rem;
          transition: all 0.2s ease;
        }

        .trinetra-input::placeholder {
          color: #64748b;
        }

        .trinetra-input:focus {
          border-color: rgba(0, 229, 255, 0.6);
          box-shadow: 0 0 0 3px rgba(0, 229, 255, 0.12);
        }

        .trinetra-input-lang-tag {
          position: absolute;
          right: 10px;
          font-size: 0.65rem;
          font-weight: 800;
          color: #00e5ff;
          background: rgba(0, 229, 255, 0.1);
          padding: 2px 5px;
          border-radius: 5px;
          pointer-events: none;
        }

        .trinetra-send-button {
          width: 42px;
          height: 42px;
          flex: 0 0 42px;
          padding: 0;
          border: none;
          border-radius: 11px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #040914;
          background: linear-gradient(135deg, #00e5ff 0%, #2563eb 100%);
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .trinetra-send-button:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 4px 14px rgba(0, 229, 255, 0.4);
        }

        .trinetra-send-button:disabled {
          opacity: 0.35;
          cursor: default;
        }

        /* ========================================================
           RESPONSIVENESS (Mobile / Tablets)
        ======================================================== */
        @media (max-width: 640px) {
          .trinetra-chat-launcher {
            right: 16px;
            bottom: 16px;
          }

          .trinetra-chat-button {
            width: 54px;
            height: 54px;
          }

          .trinetra-chat-window {
            left: 10px;
            right: 10px;
            bottom: 10px;
            width: auto;
            height: calc(100vh - 20px);
            height: calc(100dvh - 20px);
            border-radius: 18px;
          }

          .trinetra-chat-minimized {
            left: auto;
            right: 10px;
            width: calc(100vw - 20px);
            height: 64px;
          }

          .trinetra-voice-badge {
            display: none;
          }

          .trinetra-stop-button span {
            display: none;
          }

          .trinetra-messages {
            padding: 12px;
          }

          .trinetra-bubble {
            max-width: calc(100% - 32px);
            padding: 10px 12px;
          }

          .trinetra-message-text {
            font-size: 0.78rem;
          }

          .trinetra-lang-dropdown {
            width: 240px;
          }
        }
      `}</style>
    </>
  );
}
