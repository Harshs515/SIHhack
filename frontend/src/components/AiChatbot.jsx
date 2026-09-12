import React, { useState, useEffect, useRef } from "react";
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
} from "lucide-react";
import { API_BASE_URL } from "../api/api";

const CHAT_API_URL = `${API_BASE_URL}/chat`;

const getTimestamp = () =>
  new Date().toLocaleTimeString("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
  });

const INITIAL_MESSAGE = {
  id: "initial-bot-message",
  sender: "bot",
  text: `Hello Officer! I am TRINETRA AI Assistant.

I can guide you through intelligence modules, explain AI forecasts, help trace mule account chains, and navigate the platform.

You can speak directly using the microphone or type your question below.`,
  route: null,
  routeLabel: null,
  timestamp: getTimestamp(),
};

export default function AiChatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState([INITIAL_MESSAGE]);
  const [inputValue, setInputValue] = useState("");
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const messagesEndRef = useRef(null);
  const recognitionRef = useRef(null);

  const navigate = useNavigate();

  /* ============================================================
     SPEECH RECOGNITION
  ============================================================ */

  useEffect(() => {
    if (typeof window === "undefined") return;

    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      recognitionRef.current = null;
      return;
    }

    const recognition = new SpeechRecognition();

    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = "en-IN";

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
          "Microphone permission was denied. Please allow microphone access.",
        );
      }
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognitionRef.current = recognition;

    return () => {
      try {
        recognition.stop();
      } catch {
        // Already stopped
      }

      recognitionRef.current = null;
    };
  }, []);

  /* ============================================================
     AUTO SCROLL
  ============================================================ */

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({
      behavior: "smooth",
    });
  }, [messages, isOpen, isLoading]);

  /* ============================================================
     TEXT TO SPEECH
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
        .replace(/\n+/g, ". ")
        .trim();

      if (!cleanSpeech) return;

      const utterance = new SpeechSynthesisUtterance(cleanSpeech);

      utterance.rate = 1;
      utterance.pitch = 1;
      utterance.volume = 1;
      utterance.lang = "en-IN";

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
     MUTE
  ============================================================ */

  const toggleMute = () => {
    if (!isMuted) {
      stopSpeaking();
      setIsMuted(true);
    } else {
      setIsMuted(false);
    }
  };

  /* ============================================================
     MICROPHONE
  ============================================================ */

  const toggleMic = () => {
    if (!recognitionRef.current) {
      alert(
        "Microphone speech recognition is not supported. Please use Google Chrome or Microsoft Edge.",
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
        }),
      });

      if (!response.ok) {
        let errorMessage = `Chat API returned HTTP ${response.status}`;

        try {
          const errorData = await response.json();

          if (errorData?.error) {
            errorMessage = errorData.error;
          }
        } catch {
          // Response wasn't JSON
        }

        throw new Error(errorMessage);
      }

      const data = await response.json();

      const botReply =
        data?.reply ||
        "I received your request, but the AI service did not return a response.";

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
        text: `I'm unable to connect to the TRINETRA AI backend right now.

Please make sure your Node.js backend is running on port 5000.

Technical error: ${error.message}`,
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
     QUICK PROMPTS
  ============================================================ */

  const handleQuickPrompt = (promptText) => {
    if (isLoading) return;

    handleSendMessage(promptText);
  };

  /* ============================================================
     NAVIGATION
  ============================================================ */

  const handleNavigate = (path) => {
    if (!path) return;

    navigate(path);
  };

  /* ============================================================
     CLOSE
  ============================================================ */

  const handleClose = () => {
    stopSpeaking();

    if (isListening && recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch {
        // Already stopped
      }
    }

    setIsListening(false);
    setIsOpen(false);
  };

  /* ============================================================
     RENDER
  ============================================================ */

  return (
    <>
      {/* ==========================================================
          FLOATING BUTTON
      ========================================================== */}

      {!isOpen && (
        <div className="trinetra-chat-launcher">
          <button
            onClick={() => setIsOpen(true)}
            className="trinetra-chat-button"
            title="Open TRINETRA AI Assistant"
          >
            <Bot size={27} strokeWidth={2.5} />

            <span className="trinetra-online-dot" />
          </button>
        </div>
      )}

      {/* ==========================================================
          CHAT WINDOW
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
                <Bot size={18} strokeWidth={2.5} />
              </div>

              <div className="trinetra-header-info">
                <div className="trinetra-title-row">
                  <h4>TRINETRA Assistant</h4>

                  <span className="trinetra-voice-badge">VOICE AI</span>
                </div>

                <p>
                  {isLoading
                    ? "AI is thinking..."
                    : isSpeaking
                      ? "Speaking response..."
                      : isListening
                        ? "Listening to voice..."
                        : isMuted
                          ? "Voice Muted"
                          : "Voice Active"}
                </p>
              </div>
            </div>

            {/* HEADER CONTROLS */}

            <div className="trinetra-header-controls">
              {isSpeaking && (
                <button
                  onClick={stopSpeaking}
                  className="trinetra-stop-button"
                  title="Stop audio"
                >
                  <Square size={10} fill="currentColor" />
                  <span>Stop</span>
                </button>
              )}

              <button
                onClick={toggleMute}
                className={`trinetra-icon-button ${isMuted ? "muted" : ""}`}
                title={
                  isMuted ? "Unmute Assistant Voice" : "Mute Assistant Voice"
                }
              >
                {isMuted ? <VolumeX size={16} /> : <Volume2 size={16} />}
              </button>

              <button
                onClick={() => setIsMinimized(!isMinimized)}
                className="trinetra-icon-button"
                title={isMinimized ? "Expand" : "Minimize"}
              >
                {isMinimized ? (
                  <Maximize2 size={15} />
                ) : (
                  <Minimize2 size={15} />
                )}
              </button>

              <button
                onClick={handleClose}
                className="trinetra-icon-button close"
                title="Close Assistant"
              >
                <X size={17} />
              </button>
            </div>
          </div>

          {/* ======================================================
              CHAT BODY
          ====================================================== */}

          {!isMinimized && (
            <>
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
                      {/* AVATAR */}

                      <div
                        className={`trinetra-avatar ${
                          msg.sender === "user" ? "user-avatar" : "bot-avatar"
                        }`}
                      >
                        {msg.sender === "user" ? (
                          <User size={14} />
                        ) : (
                          <Bot size={14} />
                        )}
                      </div>

                      {/* MESSAGE */}

                      <div
                        className={`trinetra-bubble ${
                          msg.sender === "user" ? "user-bubble" : "bot-bubble"
                        } ${msg.isError ? "error-bubble" : ""}`}
                      >
                        <div className="trinetra-message-text">{msg.text}</div>

                        {/* BOT CONTROLS */}

                        {msg.sender === "bot" && (
                          <div className="trinetra-bot-actions">
                            <button
                              onClick={() => speakText(msg.text)}
                              disabled={isMuted}
                              className={`trinetra-read-button ${
                                isMuted ? "disabled" : ""
                              }`}
                              title="Read response aloud"
                            >
                              <Volume2 size={12} />
                              <span>Read Aloud</span>
                            </button>

                            {msg.route && (
                              <button
                                onClick={() => handleNavigate(msg.route)}
                                className="trinetra-route-button"
                              >
                                <span>
                                  {msg.routeLabel || "Jump to Module"}
                                </span>

                                <ArrowRight size={11} />
                              </button>
                            )}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* TIMESTAMP */}

                    <span className="trinetra-timestamp">{msg.timestamp}</span>
                  </div>
                ))}

                {/* LOADING */}

                {isLoading && (
                  <div className="trinetra-loading-row">
                    <div className="trinetra-avatar bot-avatar">
                      <Bot size={14} />
                    </div>

                    <div className="trinetra-loading-bubble">
                      <Loader2 size={15} className="trinetra-spin" />

                      <span>TRINETRA AI is thinking...</span>
                    </div>
                  </div>
                )}

                <div ref={messagesEndRef} />
              </div>

              {/* ==================================================
                  QUICK PROMPTS
              ================================================== */}

              <div className="trinetra-quick-prompts">
                <button
                  onClick={() =>
                    handleQuickPrompt(
                      "How do I track ATM cash withdrawal hotspots?",
                    )
                  }
                  disabled={isLoading}
                  className="trinetra-chip"
                >
                  ATM Hotspots
                </button>

                <button
                  onClick={() =>
                    handleQuickPrompt(
                      "Explain SHAP feature factors in AI Engine",
                    )
                  }
                  disabled={isLoading}
                  className="trinetra-chip"
                >
                  AI & SHAP
                </button>

                <button
                  onClick={() =>
                    handleQuickPrompt(
                      "How do I trace and freeze mule accounts?",
                    )
                  }
                  disabled={isLoading}
                  className="trinetra-chip"
                >
                  Mule Accounts
                </button>

                <button
                  onClick={() =>
                    handleQuickPrompt("How to dispatch police PCR units?")
                  }
                  disabled={isLoading}
                  className="trinetra-chip"
                >
                  Police Dispatch
                </button>
              </div>

              {/* ==================================================
                  INPUT
              ================================================== */}

              <div className="trinetra-input-area">
                <button
                  onClick={toggleMic}
                  disabled={isLoading}
                  className={`trinetra-mic-button ${
                    isListening ? "listening" : ""
                  }`}
                  title={isListening ? "Stop Listening" : "Speak to Assistant"}
                >
                  {isListening ? <MicOff size={18} /> : <Mic size={18} />}
                </button>

                <input
                  type="text"
                  placeholder={
                    isLoading
                      ? "TRINETRA AI is thinking..."
                      : isListening
                        ? "Listening..."
                        : "Type or speak your question..."
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

                <button
                  onClick={() => handleSendMessage()}
                  disabled={!inputValue.trim() || isLoading}
                  className="trinetra-send-button"
                  title="Send message"
                >
                  {isLoading ? (
                    <Loader2 size={15} className="trinetra-spin" />
                  ) : (
                    <Send size={15} />
                  )}
                </button>
              </div>
            </>
          )}
        </div>
      )}

      {/* ==========================================================
          CHATBOT CSS
      ========================================================== */}

      <style>
        {`
          /* ========================================================
             GLOBAL CHATBOT RESET
          ======================================================== */

          .trinetra-chat-window,
          .trinetra-chat-window *,
          .trinetra-chat-launcher,
          .trinetra-chat-launcher * {
            box-sizing: border-box;
          }

          .trinetra-chat-window button,
          .trinetra-chat-launcher button {
            font-family: inherit;
          }

          /* ========================================================
             FLOATING BUTTON
          ======================================================== */

          .trinetra-chat-launcher {
            position: fixed;
            right: 24px;
            bottom: 24px;
            z-index: 9999;
          }

          .trinetra-chat-button {
            width: 58px;
            height: 58px;
            padding: 0;
            border: 2px solid rgba(255, 255, 255, 0.35);
            border-radius: 50%;
            background: linear-gradient(
              135deg,
              #00e5ff 0%,
              #3a7bd5 100%
            );
            color: #040914;
            display: flex;
            align-items: center;
            justify-content: center;
            cursor: pointer;
            position: relative;
            box-shadow:
              0 8px 30px rgba(0, 229, 255, 0.45),
              0 0 25px rgba(0, 229, 255, 0.15);
            transition:
              transform 0.25s ease,
              box-shadow 0.25s ease;
          }

          .trinetra-chat-button:hover {
            transform: translateY(-3px) scale(1.06);
            box-shadow:
              0 12px 35px rgba(0, 229, 255, 0.6),
              0 0 30px rgba(0, 229, 255, 0.2);
          }

          .trinetra-online-dot {
            position: absolute;
            width: 14px;
            height: 14px;
            right: -1px;
            top: -1px;
            border-radius: 50%;
            background: #00e676;
            border: 2px solid #080d1a;
            box-shadow: 0 0 8px #00e676;
          }

          /* ========================================================
             CHAT WINDOW
          ======================================================== */

          .trinetra-chat-window {
            position: fixed;
            right: 24px;
            bottom: 24px;

            width: min(410px, calc(100vw - 32px));
            height: min(620px, calc(100vh - 48px));

            min-width: 0;
            min-height: 0;

            display: flex;
            flex-direction: column;

            overflow: hidden;

            z-index: 9999;

            border: 1px solid rgba(0, 229, 255, 0.32);
            border-radius: 18px;

            background:
              linear-gradient(
                180deg,
                rgba(9, 15, 28, 0.98),
                rgba(4, 9, 20, 0.98)
              );

            box-shadow:
              0 20px 60px rgba(0, 0, 0, 0.75),
              0 0 35px rgba(0, 229, 255, 0.08);

            backdrop-filter: blur(28px);
            -webkit-backdrop-filter: blur(28px);

            animation: trinetra-chat-open 0.25s ease-out;
          }

          .trinetra-chat-minimized {
            width: min(360px, calc(100vw - 32px));
            height: 64px;
          }

          @keyframes trinetra-chat-open {
            from {
              opacity: 0;
              transform: translateY(15px) scale(0.97);
            }

            to {
              opacity: 1;
              transform: translateY(0) scale(1);
            }
          }

          /* ========================================================
             HEADER
          ======================================================== */

          .trinetra-chat-header {
            min-height: 66px;
            flex-shrink: 0;

            padding: 11px 13px;

            display: flex;
            align-items: center;
            justify-content: space-between;

            gap: 10px;

            border-bottom: 1px solid
              rgba(255, 255, 255, 0.08);

            background:
              linear-gradient(
                90deg,
                rgba(0, 229, 255, 0.12),
                rgba(59, 130, 246, 0.08)
              );
          }

          .trinetra-header-left {
            min-width: 0;
            display: flex;
            align-items: center;
            gap: 9px;
          }

          .trinetra-header-icon {
            width: 34px;
            height: 34px;
            flex-shrink: 0;

            border-radius: 9px;

            display: flex;
            align-items: center;
            justify-content: center;

            background:
              linear-gradient(
                135deg,
                #00e5ff,
                #3a7bd5
              );

            color: #040914;
          }

          .trinetra-header-info {
            min-width: 0;
          }

          .trinetra-title-row {
            display: flex;
            align-items: center;
            gap: 6px;
            min-width: 0;
          }

          .trinetra-title-row h4 {
            margin: 0;
            color: #ffffff;
            font-size: 0.9rem;
            font-weight: 800;

            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
          }

          .trinetra-voice-badge {
            flex-shrink: 0;

            padding: 2px 6px;

            border-radius: 5px;

            color: #00e5ff;
            background: rgba(0, 229, 255, 0.1);
            border: 1px solid rgba(0, 229, 255, 0.25);

            font-size: 0.54rem;
            font-weight: 800;
            letter-spacing: 0.04em;
          }

          .trinetra-header-info p {
            margin: 2px 0 0;

            color: #7f8ba3;

            font-size: 0.63rem;

            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
          }

          .trinetra-header-controls {
            flex-shrink: 0;

            display: flex;
            align-items: center;
            gap: 4px;
          }

          .trinetra-icon-button {
            width: 29px;
            height: 29px;

            padding: 0;

            border: 1px solid transparent;
            border-radius: 7px;

            display: flex;
            align-items: center;
            justify-content: center;

            background: transparent;
            color: #7f8ba3;

            cursor: pointer;

            transition:
              color 0.2s ease,
              background 0.2s ease,
              border 0.2s ease;
          }

          .trinetra-icon-button:hover {
            color: #ffffff;
            background: rgba(255, 255, 255, 0.06);
            border-color: rgba(255, 255, 255, 0.1);
          }

          .trinetra-icon-button.muted {
            color: #ff385c;
            background: rgba(255, 56, 92, 0.1);
            border-color: rgba(255, 56, 92, 0.25);
          }

          .trinetra-icon-button.close:hover {
            color: #ff385c;
            background: rgba(255, 56, 92, 0.08);
          }

          .trinetra-stop-button {
            height: 28px;

            padding: 0 7px;

            display: flex;
            align-items: center;
            gap: 4px;

            border-radius: 6px;

            background: rgba(255, 56, 92, 0.12);
            border: 1px solid rgba(255, 56, 92, 0.3);

            color: #ff385c;

            font-size: 0.58rem;
            font-weight: 700;

            cursor: pointer;
          }

          /* ========================================================
             MESSAGE AREA
          ======================================================== */

          .trinetra-messages {
            flex: 1;
            min-height: 0;

            overflow-y: auto;
            overflow-x: hidden;

            padding: 14px;

            display: flex;
            flex-direction: column;
            gap: 12px;

            scrollbar-width: thin;
            scrollbar-color:
              rgba(0, 229, 255, 0.25)
              transparent;
          }

          .trinetra-messages::-webkit-scrollbar {
            width: 5px;
          }

          .trinetra-messages::-webkit-scrollbar-track {
            background: transparent;
          }

          .trinetra-messages::-webkit-scrollbar-thumb {
            border-radius: 10px;
            background: rgba(0, 229, 255, 0.25);
          }

          /* ========================================================
             MESSAGE WRAPPER
          ======================================================== */

          .trinetra-message-wrapper {
            width: 100%;
            min-width: 0;

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
            max-width: 100%;

            display: flex;
            align-items: flex-start;

            gap: 7px;
          }

          .user-message .trinetra-message-row {
            flex-direction: row-reverse;
          }

          /* ========================================================
             AVATAR
          ======================================================== */

          .trinetra-avatar {
            width: 27px;
            height: 27px;

            flex: 0 0 27px;

            border-radius: 7px;

            display: flex;
            align-items: center;
            justify-content: center;

            margin-top: 2px;
          }

          .bot-avatar {
            color: #00e5ff;
            background: rgba(0, 229, 255, 0.13);
            border: 1px solid rgba(0, 229, 255, 0.16);
          }

          .user-avatar {
            color: #3b82f6;
            background: rgba(59, 130, 246, 0.13);
            border: 1px solid rgba(59, 130, 246, 0.16);
          }

          /* ========================================================
             MESSAGE BUBBLE
          ======================================================== */

          .trinetra-bubble {
            min-width: 0;
            max-width: calc(100% - 34px);

            padding: 10px 12px;

            border-radius: 13px;

            line-height: 1.5;

            overflow-wrap: anywhere;
            word-break: break-word;

            box-shadow:
              0 4px 14px rgba(0, 0, 0, 0.2);
          }

          .bot-bubble {
            color: #f8fafc;

            background: rgba(15, 23, 42, 0.94);

            border: 1px solid
              rgba(148, 163, 184, 0.16);
          }

          .user-bubble {
            color: #040914;

            background:
              linear-gradient(
                135deg,
                #00e5ff,
                #3a7bd5
              );

            border: none;

            font-weight: 600;
          }

          .error-bubble {
            color: #ffb4bd;

            background: rgba(255, 56, 92, 0.1);

            border-color:
              rgba(255, 56, 92, 0.3);
          }

          .trinetra-message-text {
            white-space: pre-line;

            font-size: 0.78rem;
          }

          /* ========================================================
             BOT ACTIONS
          ======================================================== */

          .trinetra-bot-actions {
            margin-top: 8px;
            padding-top: 7px;

            display: flex;
            align-items: center;
            justify-content: space-between;

            gap: 8px;

            border-top: 1px solid
              rgba(255, 255, 255, 0.07);
          }

          .trinetra-read-button {
            min-width: 0;

            padding: 0;

            display: flex;
            align-items: center;
            gap: 4px;

            border: none;
            background: transparent;

            color: #00e5ff;

            font-size: 0.64rem;

            cursor: pointer;
          }

          .trinetra-read-button.disabled {
            color: #64748b;
            cursor: default;
            opacity: 0.5;
          }

          .trinetra-route-button {
            max-width: 55%;

            padding: 4px 7px;

            display: flex;
            align-items: center;
            gap: 4px;

            border: none;
            border-radius: 6px;

            color: #040914;

            background:
              linear-gradient(
                135deg,
                #00e676,
                #00e5ff
              );

            font-size: 0.62rem;
            font-weight: 800;

            cursor: pointer;

            overflow: hidden;
          }

          .trinetra-route-button span {
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
          }

          /* ========================================================
             TIMESTAMP
          ======================================================== */

          .trinetra-timestamp {
            margin: 0 4px;

            color: #64748b;

            font-size: 0.57rem;
          }

          /* ========================================================
             LOADING
          ======================================================== */

          .trinetra-loading-row {
            display: flex;
            align-items: flex-start;
            gap: 7px;
          }

          .trinetra-loading-bubble {
            max-width: calc(100% - 34px);

            padding: 9px 12px;

            display: flex;
            align-items: center;
            gap: 7px;

            border-radius: 12px;

            color: #00e5ff;

            background: rgba(15, 23, 42, 0.94);

            border: 1px solid
              rgba(148, 163, 184, 0.16);

            font-size: 0.7rem;
          }

          .trinetra-spin {
            animation: trinetra-spin 1s linear infinite;
          }

          @keyframes trinetra-spin {
            from {
              transform: rotate(0deg);
            }

            to {
              transform: rotate(360deg);
            }
          }

          /* ========================================================
             QUICK PROMPTS
          ======================================================== */

          .trinetra-quick-prompts {
            flex-shrink: 0;

            padding: 7px 10px;

            display: flex;
            gap: 6px;

            overflow-x: auto;
            overflow-y: hidden;

            border-top: 1px solid
              rgba(255, 255, 255, 0.07);

            background: rgba(0, 0, 0, 0.2);

            scrollbar-width: none;
          }

          .trinetra-quick-prompts::-webkit-scrollbar {
            display: none;
          }

          .trinetra-chip {
            flex: 0 0 auto;

            padding: 5px 9px;

            border-radius: 999px;

            border: 1px solid
              rgba(0, 229, 255, 0.18);

            background: rgba(0, 229, 255, 0.06);

            color: #9cefff;

            font-size: 0.61rem;
            font-weight: 600;

            white-space: nowrap;

            cursor: pointer;

            transition:
              background 0.2s ease,
              border 0.2s ease,
              transform 0.2s ease;
          }

          .trinetra-chip:hover:not(:disabled) {
            background: rgba(0, 229, 255, 0.13);
            border-color: rgba(0, 229, 255, 0.35);
            transform: translateY(-1px);
          }

          .trinetra-chip:disabled {
            cursor: default;
            opacity: 0.4;
          }

          /* ========================================================
             INPUT AREA
          ======================================================== */

          .trinetra-input-area {
            flex-shrink: 0;

            min-width: 0;

            padding: 9px 10px;

            display: flex;
            align-items: center;

            gap: 7px;

            border-top: 1px solid
              rgba(255, 255, 255, 0.07);

            background: rgba(0, 0, 0, 0.38);
          }

          .trinetra-mic-button {
            width: 38px;
            height: 38px;

            flex: 0 0 38px;

            padding: 0;

            border-radius: 50%;

            display: flex;
            align-items: center;
            justify-content: center;

            color: #00e5ff;

            background: rgba(0, 229, 255, 0.1);

            border: 1px solid
              rgba(0, 229, 255, 0.3);

            cursor: pointer;

            transition:
              background 0.2s ease,
              transform 0.2s ease;
          }

          .trinetra-mic-button:hover:not(:disabled) {
            background: rgba(0, 229, 255, 0.18);
            transform: scale(1.04);
          }

          .trinetra-mic-button.listening {
            color: #ffffff;

            background: #ff385c;

            border-color: #ff385c;

            animation:
              trinetra-pulse 1.5s infinite;
          }

          .trinetra-mic-button:disabled {
            opacity: 0.45;
            cursor: not-allowed;
          }

          @keyframes trinetra-pulse {
            0% {
              box-shadow:
                0 0 0 0 rgba(255, 56, 92, 0.6);
            }

            70% {
              box-shadow:
                0 0 0 9px rgba(255, 56, 92, 0);
            }

            100% {
              box-shadow:
                0 0 0 0 rgba(255, 56, 92, 0);
            }
          }

          /* ========================================================
             INPUT
          ======================================================== */

          .trinetra-input {
            min-width: 0;
            width: 100%;
            height: 38px;

            flex: 1;

            padding: 0 12px;

            border-radius: 9px;

            outline: none;

            color: #f8fafc;

            background: rgba(15, 23, 42, 0.9);

            border: 1px solid
              rgba(148, 163, 184, 0.2);

            font-size: 0.74rem;

            transition:
              border 0.2s ease,
              box-shadow 0.2s ease;
          }

          .trinetra-input::placeholder {
            color: #64748b;
          }

          .trinetra-input:focus {
            border-color:
              rgba(0, 229, 255, 0.45);

            box-shadow:
              0 0 0 2px
              rgba(0, 229, 255, 0.08);
          }

          .trinetra-input:disabled {
            opacity: 0.55;
            cursor: not-allowed;
          }

          /* ========================================================
             SEND BUTTON
          ======================================================== */

          .trinetra-send-button {
            width: 38px;
            height: 38px;

            flex: 0 0 38px;

            padding: 0;

            border: none;
            border-radius: 9px;

            display: flex;
            align-items: center;
            justify-content: center;

            color: #040914;

            background:
              linear-gradient(
                135deg,
                #00e5ff,
                #3a7bd5
              );

            cursor: pointer;

            transition:
              transform 0.2s ease,
              opacity 0.2s ease;
          }

          .trinetra-send-button:hover:not(:disabled) {
            transform: translateY(-1px);
          }

          .trinetra-send-button:disabled {
            opacity: 0.35;
            cursor: default;
          }

          /* ========================================================
             MOBILE
          ======================================================== */

          @media (max-width: 600px) {
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

              max-height: none;

              border-radius: 16px;
            }

            .trinetra-chat-minimized {
              left: auto;
              right: 10px;
              width: calc(100vw - 20px);
              height: 62px;
            }

            .trinetra-chat-header {
              min-height: 62px;
              padding: 9px 10px;
            }

            .trinetra-header-icon {
              width: 31px;
              height: 31px;
            }

            .trinetra-title-row h4 {
              font-size: 0.82rem;
            }

            .trinetra-voice-badge {
              display: none;
            }

            .trinetra-stop-button span {
              display: none;
            }

            .trinetra-stop-button {
              width: 29px;
              padding: 0;

              align-items: center;
              justify-content: center;
            }

            .trinetra-messages {
              padding: 11px;
              gap: 10px;
            }

            .trinetra-bubble {
              max-width: calc(100% - 32px);
              padding: 9px 11px;
            }

            .trinetra-message-text {
              font-size: 0.75rem;
            }

            .trinetra-quick-prompts {
              padding: 6px 8px;
            }

            .trinetra-input-area {
              padding: 8px;
            }

            .trinetra-mic-button,
            .trinetra-send-button {
              width: 36px;
              height: 36px;
              flex-basis: 36px;
            }

            .trinetra-input {
              height: 36px;
              font-size: 0.72rem;
              padding: 0 10px;
            }
          }

          /* ========================================================
             VERY SMALL MOBILE
          ======================================================== */

          @media (max-width: 380px) {
            .trinetra-header-controls {
              gap: 1px;
            }

            .trinetra-icon-button {
              width: 27px;
              height: 27px;
            }

            .trinetra-messages {
              padding: 9px;
            }

            .trinetra-avatar {
              width: 25px;
              height: 25px;
              flex-basis: 25px;
            }

            .trinetra-bubble {
              max-width: calc(100% - 30px);
            }

            .trinetra-input-area {
              gap: 5px;
            }

            .trinetra-mic-button,
            .trinetra-send-button {
              width: 34px;
              height: 34px;
              flex-basis: 34px;
            }
          }
        `}
      </style>
    </>
  );
}
