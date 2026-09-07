import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
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
  Square
} from 'lucide-react';

// Clean conversational responses without any raw markdown symbols (no **, no ##, no ``)
const KNOWLEDGE_BASE = [
  {
    keywords: ['gis', 'heatmap', 'map', 'location', 'atm cluster', 'zones', 'radius'],
    route: '/gis-heatmap',
    routeLabel: 'Open GIS Risk Heatmap',
    reply: `The GIS Risk Heatmap visualizes real-time and forecasted ATM cash withdrawal risk zones across all focus states.

• Red Zones: High-probability withdrawal clusters identified by spatial clustering algorithms.
• Candidate ATMs: Orange markers indicate ATMs categorized by monthly transaction density and proximity.
• Police Jurisdictions: Blue markers display local Cyber Police Stations and active patrol units.

You can adjust the buffer radius slider between 500 meters to 3 kilometers and apply time window filters to see where cashouts are most likely to occur.`
  },
  {
    keywords: ['mule', 'graph', 'neo4j', 'chain', 'hop', 'freeze', 'bank', 'account', 'transfer'],
    route: '/mule-graph',
    routeLabel: 'Open Mule Chain Graph',
    reply: `The Mule Chain Graph maps out multi-hop money routing from the victim to final cashout accounts using graph traversal:

• Layer Tracking: Shows how money moves from the victim through Layer 1 and Layer 2 mule accounts to the ATM withdrawal point.
• Velocity Score: Measures how rapidly funds are transferred between different banks.
• Quick Action: You can trigger an emergency account freeze directly through the 1930 portal or alert the bank nodal risk desk.`
  },
  {
    keywords: ['police', 'dispatch', 'pcr', 'patrol', 'lea', 'intercept', 'station', 'officer'],
    route: '/lea-interface',
    routeLabel: 'Open Police & LEA Dispatch',
    reply: `The Police & LEA Dispatch console is designed for tactical field interception:

• Proximity Matching: Automatically routes the alert to the nearest Cyber Police Station.
• Patrol Vectoring: Assigns PCR patrol teams with estimated arrival times to target ATMs before the cash is extracted.
• Action Logging: Officers can update their status from dispatched to on-scene and record successful cash seizures.`
  },
  {
    keywords: ['alert', 'fcm', 'push', 'broadcast', 'sms', 'notification', 'p1', 'p2'],
    route: '/alerts-center',
    routeLabel: 'Open Real-Time Alerts Hub',
    reply: `The Real-Time Alerts Hub broadcasts emergency warnings across multiple channels:

• P1 High Priority Alerts: Instant push notifications sent to field officer Android devices, designed to bypass Do Not Disturb.
• Bank Pre-Alerts: Automatically notifies bank managers and cash replenishment agencies to hold ATM dispensing.
• SMS & Email: Transmits emergency incident dispatches via secure government gateways.`
  },
  {
    keywords: ['ncrp', 'complaint', '1930', 'file', 'lodge', 'nlp', 'spark', 'ner'],
    route: '/ncrp-complaints',
    routeLabel: 'Open NCRP Complaint Triage',
    reply: `The NCRP Complaint Triage module ingests 1930 helpline complaints and uses natural language processing to extract key data:

• Entity Recognition: Identifies victim locations, fraud typologies, stolen amounts, and mentioned beneficiary banks from free-text descriptions.
• Live Presets: You can try sample scam scenarios with one tap to see how entities are extracted into machine learning feature vectors.`
  },
  {
    keywords: ['report', 'analytics', 'dossier', 'pdf', 'recovery', 'statistics', 'benchmark'],
    route: '/analytics-reports',
    routeLabel: 'Open Analytics & Reports',
    reply: `The Analytics & Reports section tracks overall performance and generates intelligence dossiers:

• Fund Recovery: Demonstrates a 78.4% proactive recovery rate compared to the legacy 22.4% baseline.
• Withdrawal Patterns: Highlights peak cash extraction windows within 30 to 90 minutes of the crime.
• Official Dossiers: Lets you export official restricted intelligence dossiers in PDF format for court and law enforcement use.`
  },
  {
    keywords: ['help', 'guide', 'start', 'how to use', 'features', 'tour'],
    route: '/',
    routeLabel: 'Go to Command Center',
    reply: `Welcome to TRINETRA CyberDrishti. Here is a quick guide to help you navigate:

• Command Center: Your central overview showing the live surveillance map and active alerts.
• GIS Risk Heatmap: View all 47 ATM clusters, candidate banks, and jurisdictional police stations.
• Mule Chain Graph: Trace how stolen funds travel across multiple accounts.
• Police Dispatch: Coordinate field patrol teams to intercept cashouts before they happen.`
  }
];

export default function AiChatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState([
    {
      id: 1,
      sender: 'bot',
      text: `Hello Officer! I am TRINETRA AI Assistant. I can guide you through all intelligence modules, explain AI forecasts, help you trace mule account chains, and navigate anywhere on the platform.\n\nYou can speak directly using the microphone or type your question below.`,
      route: null,
      timestamp: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isMuted, setIsMuted] = useState(false);

  const messagesEndRef = useRef(null);
  const recognitionRef = useRef(null);
  const navigate = useNavigate();

  // Initialize Speech-to-Text (Web Speech API)
  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = 'en-IN'; // Indian English

      recognition.onstart = () => {
        setIsListening(true);
      };

      recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        if (transcript) {
          setInputValue(transcript);
          handleSendMessage(transcript);
        }
        setIsListening(false);
      };

      recognition.onerror = (event) => {
        console.warn('Speech recognition status:', event.error);
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = recognition;
    }
  }, [isMuted]);

  // Scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isOpen]);

  // Text-to-Speech output in natural voice
  const speakText = (text) => {
    if (isMuted || !window.speechSynthesis) return;

    window.speechSynthesis.cancel(); // Stop any active audio

    // Strip any markdown or special characters so speech sounds completely natural
    const cleanSpeech = text
      .replace(/[*_#`>]/g, '')
      .replace(/•/g, '')
      .replace(/&rarr;/g, 'to')
      .trim();

    const utterance = new SpeechSynthesisUtterance(cleanSpeech);
    utterance.rate = 1.0;
    utterance.pitch = 1.0;
    utterance.lang = 'en-IN';

    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    window.speechSynthesis.speak(utterance);
  };

  const stopSpeaking = () => {
    if (window.speechSynthesis) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    }
  };

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
      alert('Microphone speech recognition is not supported on this browser. Please use Google Chrome or Microsoft Edge.');
      return;
    }

    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      stopSpeaking();
      try {
        recognitionRef.current.start();
      } catch (err) {
        console.error('Speech recognition error:', err);
      }
    }
  };

  const handleSendMessage = (textToSend = inputValue) => {
    const trimmed = textToSend.trim();
    if (!trimmed) return;

    stopSpeaking();

    // Add clean user message
    const userMsg = {
      id: Date.now(),
      sender: 'user',
      text: trimmed,
      timestamp: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMsg]);
    setInputValue('');

    // Generate clean assistant response
    setTimeout(() => {
      const lower = trimmed.toLowerCase();
      let matchedEntry = KNOWLEDGE_BASE.find(k =>
        k.keywords.some(kw => lower.includes(kw))
      );

      let botReply = matchedEntry
        ? matchedEntry.reply
        : `I received your question regarding "${trimmed}". As your TRINETRA Assistant, I can help you investigate ATM cash withdrawal hotspots, understand AI model predictions, trace multi-hop mule transactions, coordinate police dispatches, or triage 1930 complaints. You can select one of the suggestion buttons below or ask me about any specific module.`;

      let botRoute = matchedEntry ? matchedEntry.route : null;
      let botRouteLabel = matchedEntry ? matchedEntry.routeLabel : null;

      const botMsg = {
        id: Date.now() + 1,
        sender: 'bot',
        text: botReply,
        route: botRoute,
        routeLabel: botRouteLabel,
        timestamp: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })
      };

      setMessages(prev => [...prev, botMsg]);
      speakText(botReply);
    }, 400);
  };

  const handleQuickPrompt = (promptText) => {
    setInputValue(promptText);
    handleSendMessage(promptText);
  };

  const handleNavigate = (path) => {
    navigate(path);
  };

  return (
    <>
      {/* Floating Trigger Widget Button */}
      {!isOpen && (
        <div style={{ position: 'fixed', bottom: '24px', right: '24px', zIndex: 9999 }}>
          <button
            onClick={() => setIsOpen(true)}
            className="glass-panel"
            style={{
              width: '56px',
              height: '56px',
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #00e5ff 0%, #3a7bd5 100%)',
              border: '2px solid rgba(255,255,255,0.4)',
              color: '#040914',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              boxShadow: '0 8px 30px rgba(0, 229, 255, 0.6)',
              transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
              position: 'relative'
            }}
            onMouseEnter={(e) => (e.currentTarget.style.transform = 'scale(1.08) translateY(-2px)')}
            onMouseLeave={(e) => (e.currentTarget.style.transform = 'scale(1) translateY(0)')}
            title="Open TRINETRA AI Voice & Chat Assistant"
          >
            <Bot size={28} strokeWidth={2.5} />
            <span style={{
              position: 'absolute',
              top: '-2px',
              right: '-2px',
              width: '14px',
              height: '14px',
              borderRadius: '50%',
              background: '#00e676',
              border: '2px solid #080d1a',
              boxShadow: '0 0 8px #00e676'
            }} />
          </button>
        </div>
      )}

      {/* Expandable Chatbot Window */}
      {isOpen && (
        <div
          className="glass-panel"
          style={{
            position: 'fixed',
            bottom: '24px',
            right: '24px',
            width: isMinimized ? '340px' : '410px',
            height: isMinimized ? '60px' : '590px',
            borderRadius: '16px',
            display: 'flex',
            flexDirection: 'column',
            zIndex: 9999,
            boxShadow: '0 16px 48px rgba(0, 0, 0, 0.85)',
            border: '1.5px solid rgba(0, 229, 255, 0.35)',
            background: 'rgba(9, 15, 28, 0.96)',
            backdropFilter: 'blur(28px)',
            transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
            overflow: 'hidden'
          }}
        >
          {/* Header */}
          <div style={{
            padding: '12px 16px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            borderBottom: '1px solid var(--border-glass)',
            background: 'linear-gradient(90deg, rgba(0, 229, 255, 0.12) 0%, rgba(59, 130, 246, 0.08) 100%)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{
                width: '32px',
                height: '32px',
                borderRadius: '8px',
                background: 'linear-gradient(135deg, #00e5ff 0%, #3a7bd5 100%)',
                color: '#040914',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <Bot size={18} strokeWidth={2.5} />
              </div>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <h4 style={{ fontSize: '0.92rem', fontWeight: 800, color: '#fff' }}>TRINETRA Assistant</h4>
                  <span className="pulse-badge primary" style={{ fontSize: '0.58rem', padding: '1px 6px' }}>
                    VOICE AI
                  </span>
                </div>
                <p style={{ fontSize: '0.66rem', color: 'var(--text-muted)' }}>
                  {isSpeaking ? 'Speaking response...' : isListening ? 'Listening to voice...' : isMuted ? 'Voice Muted' : 'Voice Active'}
                </p>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              {/* Stop Speaking button if active */}
              {isSpeaking && (
                <button
                  onClick={stopSpeaking}
                  title="Stop audio playback"
                  style={{
                    background: 'rgba(255, 56, 92, 0.2)',
                    border: '1px solid rgba(255, 56, 92, 0.4)',
                    color: '#ff385c',
                    cursor: 'pointer',
                    padding: '4px 8px',
                    borderRadius: '6px',
                    fontSize: '0.65rem',
                    fontWeight: 700,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px'
                  }}
                >
                  <Square size={10} fill="#ff385c" /> Stop Audio
                </button>
              )}

              {/* Mute / Unmute Toggle Button */}
              <button
                onClick={toggleMute}
                title={isMuted ? 'Unmute Assistant Voice' : 'Mute Assistant Voice'}
                style={{
                  background: isMuted ? 'rgba(255, 56, 92, 0.15)' : 'rgba(0, 229, 255, 0.15)',
                  border: `1px solid ${isMuted ? 'rgba(255, 56, 92, 0.3)' : 'rgba(0, 229, 255, 0.3)'}`,
                  color: isMuted ? '#ff385c' : '#00e5ff',
                  cursor: 'pointer',
                  padding: '5px',
                  borderRadius: '6px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transition: 'all 0.2s ease'
                }}
              >
                {isMuted ? <VolumeX size={16} /> : <Volume2 size={16} />}
              </button>

              {/* Minimize Window */}
              <button
                onClick={() => setIsMinimized(!isMinimized)}
                style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: '4px' }}
                title={isMinimized ? 'Expand' : 'Minimize'}
              >
                {isMinimized ? <Maximize2 size={15} /> : <Minimize2 size={15} />}
              </button>

              {/* Close */}
              <button
                onClick={() => {
                  stopSpeaking();
                  if (isListening && recognitionRef.current) recognitionRef.current.stop();
                  setIsOpen(false);
                }}
                style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: '4px' }}
                title="Close Assistant"
              >
                <X size={17} />
              </button>
            </div>
          </div>

          {!isMinimized && (
            <>
              {/* Message List */}
              <div style={{
                flex: 1,
                overflowY: 'auto',
                padding: '14px',
                display: 'flex',
                flexDirection: 'column',
                gap: '12px',
                fontSize: '0.8rem'
              }}>
                {messages.map((msg) => (
                  <div
                    key={msg.id}
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: msg.sender === 'user' ? 'flex-end' : 'flex-start',
                      gap: '4px'
                    }}
                  >
                    <div style={{
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: '8px',
                      maxWidth: '90%',
                      flexDirection: msg.sender === 'user' ? 'row-reverse' : 'row'
                    }}>
                      {/* Avatar */}
                      <div style={{
                        width: '26px',
                        height: '26px',
                        borderRadius: '6px',
                        background: msg.sender === 'user' ? 'rgba(59, 130, 246, 0.2)' : 'rgba(0, 229, 255, 0.2)',
                        color: msg.sender === 'user' ? '#3b82f6' : '#00e5ff',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0,
                        marginTop: '2px'
                      }}>
                        {msg.sender === 'user' ? <User size={14} /> : <Bot size={14} />}
                      </div>

                      {/* Bubble */}
                      <div style={{
                        padding: '10px 14px',
                        borderRadius: '12px',
                        background: msg.sender === 'user' ? 'linear-gradient(135deg, #00e5ff 0%, #3a7bd5 100%)' : 'rgba(15, 23, 42, 0.92)',
                        color: msg.sender === 'user' ? '#040914' : '#f8fafc',
                        border: msg.sender === 'user' ? 'none' : '1px solid var(--border-glass-bright)',
                        boxShadow: '0 4px 14px rgba(0,0,0,0.25)',
                        lineHeight: '1.5',
                        fontWeight: msg.sender === 'user' ? 600 : 400
                      }}>
                        <div style={{ whiteSpace: 'pre-line' }}>{msg.text}</div>

                        {/* Audio Replay Button for Bot Messages */}
                        {msg.sender === 'bot' && (
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '8px', borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: '6px' }}>
                            <button
                              onClick={() => speakText(msg.text)}
                              title="Listen to this response again"
                              style={{
                                background: 'transparent',
                                border: 'none',
                                color: '#00e5ff',
                                fontSize: '0.68rem',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '4px',
                                padding: 0
                              }}
                            >
                              <Volume2 size={12} /> Read Aloud
                            </button>

                            {/* Jump to Page Quick Action Button */}
                            {msg.route && (
                              <button
                                onClick={() => handleNavigate(msg.route)}
                                className="cyber-btn"
                                style={{
                                  padding: '3px 8px',
                                  fontSize: '0.7rem',
                                  background: 'linear-gradient(135deg, #00e676 0%, #00e5ff 100%)',
                                  color: '#040914',
                                  fontWeight: 800
                                }}
                              >
                                {msg.routeLabel || 'Jump to Module'} <ArrowRight size={11} />
                              </button>
                            )}
                          </div>
                        )}
                      </div>
                    </div>

                    <span style={{ fontSize: '0.62rem', color: 'var(--text-muted)', margin: '0 4px' }}>
                      {msg.timestamp}
                    </span>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>

              {/* Quick Suggestion Chips */}
              <div style={{
                padding: '6px 12px',
                borderTop: '1px solid var(--border-glass)',
                display: 'flex',
                gap: '6px',
                overflowX: 'auto',
                background: 'rgba(0,0,0,0.2)'
              }}>
                <button
                  onClick={() => handleQuickPrompt('How do I track ATM cash withdrawal hotspots?')}
                  className="interactive-chip"
                  style={{ fontSize: '0.66rem', padding: '2px 8px', whiteSpace: 'nowrap' }}
                >
                  ATM Hotspots
                </button>
                <button
                  onClick={() => handleQuickPrompt('Explain SHAP feature factors in AI Engine')}
                  className="interactive-chip"
                  style={{ fontSize: '0.66rem', padding: '2px 8px', whiteSpace: 'nowrap' }}
                >
                  AI & SHAP Factors
                </button>
                <button
                  onClick={() => handleQuickPrompt('How do I trace and freeze mule accounts?')}
                  className="interactive-chip"
                  style={{ fontSize: '0.66rem', padding: '2px 8px', whiteSpace: 'nowrap' }}
                >
                  Mule Account Freeze
                </button>
                <button
                  onClick={() => handleQuickPrompt('How to dispatch police PCR units?')}
                  className="interactive-chip"
                  style={{ fontSize: '0.66rem', padding: '2px 8px', whiteSpace: 'nowrap' }}
                >
                  Police Dispatch
                </button>
              </div>

              {/* Input & Voice Controls */}
              <div style={{
                padding: '10px 12px',
                borderTop: '1px solid var(--border-glass)',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                background: 'rgba(0,0,0,0.4)'
              }}>
                {/* Microphone Speech-To-Text Button */}
                <button
                  onClick={toggleMic}
                  title={isListening ? 'Stop Listening' : 'Speak to Assistant (Mic)'}
                  style={{
                    width: '38px',
                    height: '38px',
                    borderRadius: '50%',
                    background: isListening ? '#ff385c' : 'rgba(0, 229, 255, 0.15)',
                    border: `1px solid ${isListening ? '#ff385c' : 'rgba(0, 229, 255, 0.4)'}`,
                    color: isListening ? '#fff' : '#00e5ff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    animation: isListening ? 'pulse-ring 1.5s infinite' : 'none',
                    transition: 'all 0.2s ease',
                    flexShrink: 0
                  }}
                >
                  {isListening ? <MicOff size={18} /> : <Mic size={18} />}
                </button>

                {/* Text Query Input */}
                <input
                  type="text"
                  placeholder={isListening ? 'Listening to your voice...' : 'Type or speak your question...'}
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                  className="cyber-input"
                  style={{ flex: 1, padding: '7px 12px', fontSize: '0.78rem' }}
                />

                {/* Send Button */}
                <button
                  onClick={() => handleSendMessage()}
                  disabled={!inputValue.trim()}
                  className="cyber-btn"
                  style={{
                    padding: '8px',
                    borderRadius: '8px',
                    opacity: inputValue.trim() ? 1 : 0.5,
                    cursor: inputValue.trim() ? 'pointer' : 'default',
                    flexShrink: 0
                  }}
                >
                  <Send size={15} />
                </button>
              </div>
            </>
          )}
        </div>
      )}
    </>
  );
}
