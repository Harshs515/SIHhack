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

/*
|--------------------------------------------------------------------------
| API CONFIGURATION
|--------------------------------------------------------------------------
|
| Development:
|   Backend -> http://localhost:5000
|
| Chat endpoint:
|   POST http://localhost:5000/api/chat
|
| Request:
|   {
|     message: "your question"
|   }
|
| Response:
|   {
|     reply: "...",
|     route: "/gis-heatmap",
|     routeLabel: "Open GIS Risk Heatmap",
|     timestamp: "..."
|   }
|
|--------------------------------------------------------------------------
*/

const API_BASE_URL = "http://localhost:5000";

const CHAT_API_URL = `${API_BASE_URL}/api/chat`;

/*
|--------------------------------------------------------------------------
| Helper
|--------------------------------------------------------------------------
*/

const getTimestamp = () =>
  new Date().toLocaleTimeString("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
  });

/*
|--------------------------------------------------------------------------
| Initial message
|--------------------------------------------------------------------------
*/

const INITIAL_MESSAGE = {
  id: "initial-bot-message",
  sender: "bot",
  text: `Hello Officer! I am TRINETRA AI Assistant.

I can guide you through all intelligence modules, explain AI forecasts, help you trace mule account chains, and navigate anywhere on the platform.

You can speak directly using the microphone or type your question below.`,
  route: null,
  routeLabel: null,
  timestamp: getTimestamp(),
};

/*
|--------------------------------------------------------------------------
| Main Component
|--------------------------------------------------------------------------
*/

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

  /*
  |--------------------------------------------------------------------------
  | Speech Recognition Initialization
  |--------------------------------------------------------------------------
  */

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

        // IMPORTANT:
        // Send transcript directly instead of waiting for
        // React's setInputValue() state update.
        handleSendMessage(transcript);
      }
    };

    recognition.onerror = (event) => {
      console.warn("Speech recognition error:", event.error);

      setIsListening(false);

      if (event.error === "not-allowed") {
        alert(
          "Microphone permission was denied. Please allow microphone access in your browser.",
        );
      } else if (event.error === "no-speech") {
        console.log("No speech detected.");
      }
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognitionRef.current = recognition;

    return () => {
      try {
        recognition.stop();
      } catch (error) {
        // Recognition may already be stopped.
      }

      recognitionRef.current = null;
    };
  }, []);

  /*
  |--------------------------------------------------------------------------
  | Auto Scroll
  |--------------------------------------------------------------------------
  */

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({
      behavior: "smooth",
    });
  }, [messages, isOpen, isLoading]);

  /*
  |--------------------------------------------------------------------------
  | Text-to-Speech
  |--------------------------------------------------------------------------
  */

  const speakText = (text) => {
    if (!text) return;

    if (isMuted) return;

    if (typeof window === "undefined" || !("speechSynthesis" in window)) {
      console.warn("Text-to-speech is not supported.");
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

      utterance.rate = 1.0;
      utterance.pitch = 1.0;
      utterance.volume = 1.0;
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

  /*
  |--------------------------------------------------------------------------
  | Stop Speaking
  |--------------------------------------------------------------------------
  */

  const stopSpeaking = () => {
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.cancel();
    }

    setIsSpeaking(false);
  };

  /*
  |--------------------------------------------------------------------------
  | Mute / Unmute
  |--------------------------------------------------------------------------
  */

  const toggleMute = () => {
    if (!isMuted) {
      stopSpeaking();
      setIsMuted(true);
    } else {
      setIsMuted(false);
    }
  };

  /*
  |--------------------------------------------------------------------------
  | Microphone
  |--------------------------------------------------------------------------
  */

  const toggleMic = () => {
    if (!recognitionRef.current) {
      alert(
        "Microphone speech recognition is not supported on this browser. Please use Google Chrome or Microsoft Edge.",
      );

      return;
    }

    if (isLoading) {
      return;
    }

    if (isListening) {
      try {
        recognitionRef.current.stop();
      } catch (error) {
        console.error("Error stopping microphone:", error);
      }

      setIsListening(false);

      return;
    }

    stopSpeaking();

    try {
      recognitionRef.current.start();
    } catch (error) {
      console.error("Error starting speech recognition:", error);
    }
  };

  /*
  |--------------------------------------------------------------------------
  | Send Message To Backend
  |--------------------------------------------------------------------------
  */

  const handleSendMessage = async (textToSend = inputValue) => {
    const trimmed = String(textToSend || "").trim();

    if (!trimmed) {
      return;
    }

    // Prevent multiple simultaneous API requests.
    if (isLoading) {
      return;
    }

    stopSpeaking();

    /*
    |--------------------------------------------------------------------------
    | Add User Message
    |--------------------------------------------------------------------------
    */

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

    /*
    |--------------------------------------------------------------------------
    | Call Backend
    |--------------------------------------------------------------------------
    */

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

      /*
      |--------------------------------------------------------------------------
      | HTTP Error
      |--------------------------------------------------------------------------
      */

      if (!response.ok) {
        let errorMessage = `Chat API returned HTTP ${response.status}`;

        try {
          const errorData = await response.json();

          if (errorData?.error) {
            errorMessage = errorData.error;
          }
        } catch (error) {
          // Response was not JSON.
        }

        throw new Error(errorMessage);
      }

      /*
      |--------------------------------------------------------------------------
      | Parse Response
      |--------------------------------------------------------------------------
      */

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

      /*
      |--------------------------------------------------------------------------
      | Add AI Response
      |--------------------------------------------------------------------------
      */

      setMessages((prev) => [...prev, botMsg]);

      /*
      |--------------------------------------------------------------------------
      | Read AI Response
      |--------------------------------------------------------------------------
      */

      if (!isMuted) {
        speakText(botReply);
      }
    } catch (error) {
      console.error("Chat API Error:", error);

      const errorMsg = {
        id: `error-${Date.now()}-${Math.random()}`,
        sender: "bot",
        text: `I’m unable to connect to the TRINETRA AI backend right now.

Please make sure your Node.js backend is running on port 5000 and that the chat endpoint is available at:

/api/chat

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

  /*
  |--------------------------------------------------------------------------
  | Quick Prompt
  |--------------------------------------------------------------------------
  */

  const handleQuickPrompt = (promptText) => {
    if (isLoading) return;

    setInputValue(promptText);

    handleSendMessage(promptText);
  };

  /*
  |--------------------------------------------------------------------------
  | Navigate
  |--------------------------------------------------------------------------
  */

  const handleNavigate = (path) => {
    if (!path) return;

    navigate(path);
  };

  /*
  |--------------------------------------------------------------------------
  | Close Chat
  |--------------------------------------------------------------------------
  */

  const handleClose = () => {
    stopSpeaking();

    if (isListening && recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (error) {
        console.error(error);
      }
    }

    setIsListening(false);

    setIsOpen(false);
  };

  /*
  |--------------------------------------------------------------------------
  | Render
  |--------------------------------------------------------------------------
  */

  return (
    <>
      {/* ================================================================
          FLOATING CHATBOT BUTTON
      ================================================================= */}

      {!isOpen && (
        <div
          style={{
            position: "fixed",
            bottom: "24px",
            right: "24px",
            zIndex: 9999,
          }}
        >
          <button
            onClick={() => setIsOpen(true)}
            className="glass-panel"
            style={{
              width: "56px",
              height: "56px",
              borderRadius: "50%",
              background: "linear-gradient(135deg, #00e5ff 0%, #3a7bd5 100%)",
              border: "2px solid rgba(255,255,255,0.4)",
              color: "#040914",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
              boxShadow: "0 8px 30px rgba(0, 229, 255, 0.6)",
              transition: "all 0.3s cubic-bezier(0.16, 1, 0.3, 1)",
              position: "relative",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = "scale(1.08) translateY(-2px)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = "scale(1) translateY(0)";
            }}
            title="Open TRINETRA AI Voice & Chat Assistant"
          >
            <Bot size={28} strokeWidth={2.5} />

            <span
              style={{
                position: "absolute",
                top: "-2px",
                right: "-2px",
                width: "14px",
                height: "14px",
                borderRadius: "50%",
                background: "#00e676",
                border: "2px solid #080d1a",
                boxShadow: "0 0 8px #00e676",
              }}
            />
          </button>
        </div>
      )}

      {/* ================================================================
          CHAT WINDOW
      ================================================================= */}

      {isOpen && (
        <div
          className="glass-panel"
          style={{
            position: "fixed",
            bottom: "24px",
            right: "24px",
            width: isMinimized ? "340px" : "410px",
            height: isMinimized ? "60px" : "590px",
            borderRadius: "16px",
            display: "flex",
            flexDirection: "column",
            zIndex: 9999,
            boxShadow: "0 16px 48px rgba(0, 0, 0, 0.85)",
            border: "1.5px solid rgba(0, 229, 255, 0.35)",
            background: "rgba(9, 15, 28, 0.96)",
            backdropFilter: "blur(28px)",
            transition: "all 0.3s cubic-bezier(0.16, 1, 0.3, 1)",
            overflow: "hidden",
          }}
        >
          {/* ============================================================
              HEADER
          ============================================================= */}

          <div
            style={{
              padding: "12px 16px",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              borderBottom: "1px solid var(--border-glass)",
              background:
                "linear-gradient(90deg, rgba(0, 229, 255, 0.12) 0%, rgba(59, 130, 246, 0.08) 100%)",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "10px",
              }}
            >
              <div
                style={{
                  width: "32px",
                  height: "32px",
                  borderRadius: "8px",
                  background:
                    "linear-gradient(135deg, #00e5ff 0%, #3a7bd5 100%)",
                  color: "#040914",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Bot size={18} strokeWidth={2.5} />
              </div>

              <div>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "6px",
                  }}
                >
                  <h4
                    style={{
                      fontSize: "0.92rem",
                      fontWeight: 800,
                      color: "#fff",
                      margin: 0,
                    }}
                  >
                    TRINETRA Assistant
                  </h4>

                  <span
                    className="pulse-badge primary"
                    style={{
                      fontSize: "0.58rem",
                      padding: "1px 6px",
                    }}
                  >
                    VOICE AI
                  </span>
                </div>

                <p
                  style={{
                    fontSize: "0.66rem",
                    color: "var(--text-muted)",
                    margin: 0,
                  }}
                >
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

            {/* Header Controls */}

            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "6px",
              }}
            >
              {/* Stop Audio */}

              {isSpeaking && (
                <button
                  onClick={stopSpeaking}
                  title="Stop audio playback"
                  style={{
                    background: "rgba(255, 56, 92, 0.2)",
                    border: "1px solid rgba(255, 56, 92, 0.4)",
                    color: "#ff385c",
                    cursor: "pointer",
                    padding: "4px 8px",
                    borderRadius: "6px",
                    fontSize: "0.65rem",
                    fontWeight: 700,
                    display: "flex",
                    alignItems: "center",
                    gap: "4px",
                  }}
                >
                  <Square size={10} fill="#ff385c" />
                  Stop Audio
                </button>
              )}

              {/* Mute */}

              <button
                onClick={toggleMute}
                title={
                  isMuted ? "Unmute Assistant Voice" : "Mute Assistant Voice"
                }
                style={{
                  background: isMuted
                    ? "rgba(255, 56, 92, 0.15)"
                    : "rgba(0, 229, 255, 0.15)",
                  border: `1px solid ${
                    isMuted
                      ? "rgba(255, 56, 92, 0.3)"
                      : "rgba(0, 229, 255, 0.3)"
                  }`,
                  color: isMuted ? "#ff385c" : "#00e5ff",
                  cursor: "pointer",
                  padding: "5px",
                  borderRadius: "6px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                {isMuted ? <VolumeX size={16} /> : <Volume2 size={16} />}
              </button>

              {/* Minimize */}

              <button
                onClick={() => setIsMinimized(!isMinimized)}
                style={{
                  background: "transparent",
                  border: "none",
                  color: "var(--text-muted)",
                  cursor: "pointer",
                  padding: "4px",
                }}
                title={isMinimized ? "Expand" : "Minimize"}
              >
                {isMinimized ? (
                  <Maximize2 size={15} />
                ) : (
                  <Minimize2 size={15} />
                )}
              </button>

              {/* Close */}

              <button
                onClick={handleClose}
                style={{
                  background: "transparent",
                  border: "none",
                  color: "var(--text-muted)",
                  cursor: "pointer",
                  padding: "4px",
                }}
                title="Close Assistant"
              >
                <X size={17} />
              </button>
            </div>
          </div>

          {!isMinimized && (
            <>
              {/* ========================================================
                  MESSAGE LIST
              ========================================================= */}

              <div
                style={{
                  flex: 1,
                  overflowY: "auto",
                  padding: "14px",
                  display: "flex",
                  flexDirection: "column",
                  gap: "12px",
                  fontSize: "0.8rem",
                }}
              >
                {messages.map((msg) => (
                  <div
                    key={msg.id}
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      alignItems:
                        msg.sender === "user" ? "flex-end" : "flex-start",
                      gap: "4px",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        alignItems: "flex-start",
                        gap: "8px",
                        maxWidth: "90%",
                        flexDirection:
                          msg.sender === "user" ? "row-reverse" : "row",
                      }}
                    >
                      {/* Avatar */}

                      <div
                        style={{
                          width: "26px",
                          height: "26px",
                          borderRadius: "6px",
                          background:
                            msg.sender === "user"
                              ? "rgba(59, 130, 246, 0.2)"
                              : "rgba(0, 229, 255, 0.2)",
                          color: msg.sender === "user" ? "#3b82f6" : "#00e5ff",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          flexShrink: 0,
                          marginTop: "2px",
                        }}
                      >
                        {msg.sender === "user" ? (
                          <User size={14} />
                        ) : (
                          <Bot size={14} />
                        )}
                      </div>

                      {/* Bubble */}

                      <div
                        style={{
                          padding: "10px 14px",
                          borderRadius: "12px",
                          background:
                            msg.sender === "user"
                              ? "linear-gradient(135deg, #00e5ff 0%, #3a7bd5 100%)"
                              : msg.isError
                                ? "rgba(255, 56, 92, 0.12)"
                                : "rgba(15, 23, 42, 0.92)",
                          color: msg.sender === "user" ? "#040914" : "#f8fafc",
                          border:
                            msg.sender === "user"
                              ? "none"
                              : msg.isError
                                ? "1px solid rgba(255,56,92,0.35)"
                                : "1px solid var(--border-glass-bright)",
                          boxShadow: "0 4px 14px rgba(0,0,0,0.25)",
                          lineHeight: "1.5",
                          fontWeight: msg.sender === "user" ? 600 : 400,
                        }}
                      >
                        <div
                          style={{
                            whiteSpace: "pre-line",
                          }}
                        >
                          {msg.text}
                        </div>

                        {/* Bot Controls */}

                        {msg.sender === "bot" && (
                          <div
                            style={{
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "space-between",
                              gap: "8px",
                              marginTop: "8px",
                              borderTop: "1px solid rgba(255,255,255,0.08)",
                              paddingTop: "6px",
                            }}
                          >
                            {/* Replay */}

                            <button
                              onClick={() => speakText(msg.text)}
                              disabled={isMuted}
                              title={
                                isMuted
                                  ? "Unmute assistant to read aloud"
                                  : "Listen to this response again"
                              }
                              style={{
                                background: "transparent",
                                border: "none",
                                color: isMuted
                                  ? "var(--text-muted)"
                                  : "#00e5ff",
                                fontSize: "0.68rem",
                                cursor: isMuted ? "default" : "pointer",
                                display: "flex",
                                alignItems: "center",
                                gap: "4px",
                                padding: 0,
                                opacity: isMuted ? 0.5 : 1,
                              }}
                            >
                              <Volume2 size={12} />
                              Read Aloud
                            </button>

                            {/* Navigate */}

                            {msg.route && (
                              <button
                                onClick={() => handleNavigate(msg.route)}
                                className="cyber-btn"
                                style={{
                                  padding: "3px 8px",
                                  fontSize: "0.7rem",
                                  background:
                                    "linear-gradient(135deg, #00e676 0%, #00e5ff 100%)",
                                  color: "#040914",
                                  fontWeight: 800,
                                  display: "flex",
                                  alignItems: "center",
                                  gap: "4px",
                                }}
                              >
                                {msg.routeLabel || "Jump to Module"}

                                <ArrowRight size={11} />
                              </button>
                            )}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Timestamp */}

                    <span
                      style={{
                        fontSize: "0.62rem",
                        color: "var(--text-muted)",
                        margin: "0 4px",
                      }}
                    >
                      {msg.timestamp}
                    </span>
                  </div>
                ))}

                {/* ======================================================
                    LOADING INDICATOR
                ======================================================= */}

                {isLoading && (
                  <div
                    style={{
                      display: "flex",
                      alignItems: "flex-start",
                      gap: "8px",
                    }}
                  >
                    <div
                      style={{
                        width: "26px",
                        height: "26px",
                        borderRadius: "6px",
                        background: "rgba(0, 229, 255, 0.2)",
                        color: "#00e5ff",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <Bot size={14} />
                    </div>

                    <div
                      style={{
                        padding: "10px 14px",
                        borderRadius: "12px",
                        background: "rgba(15, 23, 42, 0.92)",
                        border: "1px solid var(--border-glass-bright)",
                        color: "#00e5ff",
                        display: "flex",
                        alignItems: "center",
                        gap: "8px",
                      }}
                    >
                      <Loader2
                        size={15}
                        style={{
                          animation: "spin 1s linear infinite",
                        }}
                      />

                      <span
                        style={{
                          fontSize: "0.75rem",
                        }}
                      >
                        TRINETRA AI is thinking...
                      </span>
                    </div>
                  </div>
                )}

                <div ref={messagesEndRef} />
              </div>

              {/* ========================================================
                  QUICK PROMPTS
              ========================================================= */}

              <div
                style={{
                  padding: "6px 12px",
                  borderTop: "1px solid var(--border-glass)",
                  display: "flex",
                  gap: "6px",
                  overflowX: "auto",
                  background: "rgba(0,0,0,0.2)",
                }}
              >
                <button
                  onClick={() =>
                    handleQuickPrompt(
                      "How do I track ATM cash withdrawal hotspots?",
                    )
                  }
                  disabled={isLoading}
                  className="interactive-chip"
                  style={{
                    fontSize: "0.66rem",
                    padding: "2px 8px",
                    whiteSpace: "nowrap",
                    opacity: isLoading ? 0.5 : 1,
                  }}
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
                  className="interactive-chip"
                  style={{
                    fontSize: "0.66rem",
                    padding: "2px 8px",
                    whiteSpace: "nowrap",
                    opacity: isLoading ? 0.5 : 1,
                  }}
                >
                  AI & SHAP Factors
                </button>

                <button
                  onClick={() =>
                    handleQuickPrompt(
                      "How do I trace and freeze mule accounts?",
                    )
                  }
                  disabled={isLoading}
                  className="interactive-chip"
                  style={{
                    fontSize: "0.66rem",
                    padding: "2px 8px",
                    whiteSpace: "nowrap",
                    opacity: isLoading ? 0.5 : 1,
                  }}
                >
                  Mule Account Freeze
                </button>

                <button
                  onClick={() =>
                    handleQuickPrompt("How to dispatch police PCR units?")
                  }
                  disabled={isLoading}
                  className="interactive-chip"
                  style={{
                    fontSize: "0.66rem",
                    padding: "2px 8px",
                    whiteSpace: "nowrap",
                    opacity: isLoading ? 0.5 : 1,
                  }}
                >
                  Police Dispatch
                </button>
              </div>

              {/* ========================================================
                  INPUT AREA
              ========================================================= */}

              <div
                style={{
                  padding: "10px 12px",
                  borderTop: "1px solid var(--border-glass)",
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  background: "rgba(0,0,0,0.4)",
                }}
              >
                {/* Microphone */}

                <button
                  onClick={toggleMic}
                  disabled={isLoading}
                  title={isListening ? "Stop Listening" : "Speak to Assistant"}
                  style={{
                    width: "38px",
                    height: "38px",
                    borderRadius: "50%",
                    background: isListening
                      ? "#ff385c"
                      : "rgba(0, 229, 255, 0.15)",
                    border: `1px solid ${
                      isListening ? "#ff385c" : "rgba(0, 229, 255, 0.4)"
                    }`,
                    color: isListening ? "#fff" : "#00e5ff",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    cursor: isLoading ? "not-allowed" : "pointer",
                    animation: isListening
                      ? "pulse-ring 1.5s infinite"
                      : "none",
                    transition: "all 0.2s ease",
                    flexShrink: 0,
                    opacity: isLoading ? 0.5 : 1,
                  }}
                >
                  {isListening ? <MicOff size={18} /> : <Mic size={18} />}
                </button>

                {/* Input */}

                <input
                  type="text"
                  placeholder={
                    isLoading
                      ? "TRINETRA AI is thinking..."
                      : isListening
                        ? "Listening to your voice..."
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
                  className="cyber-input"
                  style={{
                    flex: 1,
                    padding: "7px 12px",
                    fontSize: "0.78rem",
                  }}
                />

                {/* Send */}

                <button
                  onClick={() => handleSendMessage()}
                  disabled={!inputValue.trim() || isLoading}
                  className="cyber-btn"
                  style={{
                    padding: "8px",
                    borderRadius: "8px",
                    opacity: inputValue.trim() && !isLoading ? 1 : 0.5,
                    cursor:
                      inputValue.trim() && !isLoading ? "pointer" : "default",
                    flexShrink: 0,
                  }}
                >
                  {isLoading ? (
                    <Loader2
                      size={15}
                      style={{
                        animation: "spin 1s linear infinite",
                      }}
                    />
                  ) : (
                    <Send size={15} />
                  )}
                </button>
              </div>
            </>
          )}
        </div>
      )}

      {/* ================================================================
          ANIMATION FALLBACK
      ================================================================= */}

      <style>
        {`
          @keyframes spin {
            from {
              transform: rotate(0deg);
            }

            to {
              transform: rotate(360deg);
            }
          }

          @keyframes pulse-ring {
            0% {
              box-shadow: 0 0 0 0 rgba(255, 56, 92, 0.65);
            }

            70% {
              box-shadow: 0 0 0 10px rgba(255, 56, 92, 0);
            }

            100% {
              box-shadow: 0 0 0 0 rgba(255, 56, 92, 0);
            }
          }
        `}
      </style>
    </>
  );
}
