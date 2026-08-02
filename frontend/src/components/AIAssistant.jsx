import React, { useState, useRef, useEffect, useCallback } from 'react';
import { MessageSquare, Send, X, Bot, User, Sparkles, RotateCcw, ChevronDown } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';
import { motion, AnimatePresence } from 'framer-motion';

/* ───────────────────────────────────────────
   Markdown-lite renderer – turns plain text
   from the AI into nicely formatted HTML.
   Supports: bold, italic, bullet lists,
   numbered lists, line breaks, and code.
   ─────────────────────────────────────────── */
const formatMessage = (text) => {
    if (!text) return '';

    // Split into lines for processing
    const lines = text.split('\n');
    const elements = [];
    let listBuffer = [];
    let listType = null; // 'ul' | 'ol'

    const flushList = () => {
        if (listBuffer.length === 0) return;
        const tag = listType === 'ol' ? 'ol' : 'ul';
        const listClass = listType === 'ol'
            ? 'ai-msg-ol'
            : 'ai-msg-ul';
        elements.push(
            React.createElement(tag, { key: `list-${elements.length}`, className: listClass },
                listBuffer.map((item, i) =>
                    React.createElement('li', { key: i, dangerouslySetInnerHTML: { __html: inlineFormat(item) } })
                )
            )
        );
        listBuffer = [];
        listType = null;
    };

    const inlineFormat = (str) => {
        return str
            // Bold **text** or __text__
            .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
            .replace(/__(.*?)__/g, '<strong>$1</strong>')
            // Italic *text* or _text_
            .replace(/(?<!\*)\*(?!\*)(.*?)(?<!\*)\*(?!\*)/g, '<em>$1</em>')
            // Inline code `text`
            .replace(/`([^`]+)`/g, '<code class="ai-msg-code">$1</code>');
    };

    lines.forEach((line, idx) => {
        const trimmed = line.trim();

        // Bullet list: •, -, *
        const bulletMatch = trimmed.match(/^(?:[•\-\*])\s+(.*)/);
        if (bulletMatch) {
            if (listType === 'ol') flushList();
            listType = 'ul';
            listBuffer.push(bulletMatch[1]);
            return;
        }

        // Numbered list: 1. 2. etc
        const numMatch = trimmed.match(/^(\d+)[.)]\s+(.*)/);
        if (numMatch) {
            if (listType === 'ul') flushList();
            listType = 'ol';
            listBuffer.push(numMatch[2]);
            return;
        }

        // Not a list item — flush any open list
        flushList();

        if (trimmed === '') {
            elements.push(React.createElement('div', { key: `br-${idx}`, className: 'h-2' }));
        } else {
            elements.push(
                React.createElement('p', {
                    key: `p-${idx}`,
                    className: 'ai-msg-paragraph',
                    dangerouslySetInnerHTML: { __html: inlineFormat(trimmed) }
                })
            );
        }
    });

    flushList();
    return elements;
};

/* ───────────────────────────────────────────
   Quick-suggestion chips
   ─────────────────────────────────────────── */
const SUGGESTIONS = [
    '💰 How can I save more?',
    '📊 Analyze my spending',
    '🎯 Set a savings goal',
];

/* ───────────────────────────────────────────
   Typing dots animation component
   ─────────────────────────────────────────── */
const TypingIndicator = () => (
    <div className="flex items-center gap-1.5 px-1 py-1">
        <span className="ai-typing-dot" style={{ animationDelay: '0ms' }} />
        <span className="ai-typing-dot" style={{ animationDelay: '160ms' }} />
        <span className="ai-typing-dot" style={{ animationDelay: '320ms' }} />
    </div>
);

/* ───────────────────────────────────────────
   Timestamp formatter
   ─────────────────────────────────────────── */
const formatTime = (date) => {
    if (!date) return '';
    return new Date(date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
};

/* ───────────────────────────────────────────
   Main AIAssistant component
   ─────────────────────────────────────────── */
const AIAssistant = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [message, setMessage] = useState('');
    const [messages, setMessages] = useState([
        {
            role: 'assistant',
            content:
                "Hey there! 👋 I'm your **Bachat Saathi** AI assistant.\n\nI can help you with:\n• Tracking your expenses\n• Setting savings goals\n• Analyzing spending patterns\n• Financial tips & advice\n\nHow can I help you today?",
            timestamp: new Date(),
        },
    ]);
    const [isLoading, setIsLoading] = useState(false);
    const [showScrollBtn, setShowScrollBtn] = useState(false);
    const messagesEndRef = useRef(null);
    const messagesContainerRef = useRef(null);
    const inputRef = useRef(null);
    const { user } = useAuth();

    /* Auto-scroll to bottom */
    const scrollToBottom = useCallback((behavior = 'smooth') => {
        messagesEndRef.current?.scrollIntoView({ behavior });
    }, []);

    useEffect(() => {
        if (isOpen) {
            scrollToBottom('auto');
            // Focus the input after opening
            setTimeout(() => inputRef.current?.focus(), 300);
        }
    }, [isOpen, scrollToBottom]);

    useEffect(() => {
        scrollToBottom();
    }, [messages, scrollToBottom]);

    /* Show / hide scroll-to-bottom button */
    const handleScroll = useCallback(() => {
        const container = messagesContainerRef.current;
        if (!container) return;
        const { scrollTop, scrollHeight, clientHeight } = container;
        setShowScrollBtn(scrollHeight - scrollTop - clientHeight > 100);
    }, []);

    /* Send message */
    const handleSubmit = async (e) => {
        e.preventDefault();
        const trimmed = message.trim();
        if (!trimmed || isLoading) return;

        const userMessage = { role: 'user', content: trimmed, timestamp: new Date() };
        setMessages((prev) => [...prev, userMessage]);
        setMessage('');
        setIsLoading(true);

        try {
            const response = await api.post('/insights/assistant/chat', { message: trimmed }, { timeout: 30000 });

            if (response.data?.data?.response) {
                setMessages((prev) => [
                    ...prev,
                    { role: 'assistant', content: response.data.data.response, timestamp: new Date() },
                ]);
            } else {
                throw new Error('No response');
            }
        } catch (error) {
            const errorMsg =
                error?.response?.status === 429
                    ? "You're sending messages too fast. Please wait a moment and try again."
                    : "Sorry, I couldn't process that request. Please try again.";
            setMessages((prev) => [
                ...prev,
                { role: 'assistant', content: errorMsg, isError: true, timestamp: new Date() },
            ]);
        } finally {
            setIsLoading(false);
            setTimeout(() => inputRef.current?.focus(), 100);
        }
    };

    /* Handle suggestion click */
    const handleSuggestion = (text) => {
        // Strip emoji prefix for the API call
        const cleanText = text.replace(/^[^\w]*\s*/, '');
        setMessage(cleanText);
        setTimeout(() => inputRef.current?.focus(), 50);
    };

    /* Reset conversation */
    const handleReset = () => {
        setMessages([
            {
                role: 'assistant',
                content:
                    "Conversation cleared! 🔄\n\nHow can I help you today?",
                timestamp: new Date(),
            },
        ]);
    };

    const showSuggestions = messages.length <= 1 && !isLoading;

    return (
        <div className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-[1000]">
            <AnimatePresence mode="wait">
                {isOpen ? (
                    /* ─── Chat Window ─── */
                    <motion.div
                        key="chat-window"
                        initial={{ opacity: 0, scale: 0.92, y: 24 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.92, y: 24 }}
                        transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                        className="ai-chat-window"
                    >
                        {/* ─── Header ─── */}
                        <div className="ai-chat-header">
                            {/* Decorative gradient orb */}
                            <div className="absolute -top-10 -right-10 w-32 h-32 rounded-full bg-white/10 blur-2xl pointer-events-none" />

                            <div className="flex items-center gap-3 relative z-10">
                                <div className="ai-chat-avatar-header">
                                    <Bot className="w-5 h-5" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-white text-[15px] leading-tight">
                                        Bachat Saathi
                                    </h3>
                                    <div className="flex items-center gap-1.5 mt-0.5">
                                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-300 animate-pulse" />
                                        <span className="text-[11px] text-white/70 font-medium">
                                            Always online
                                        </span>
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-center gap-1 relative z-10">
                                <button
                                    onClick={handleReset}
                                    className="ai-header-btn"
                                    title="Clear conversation"
                                    aria-label="Clear conversation"
                                >
                                    <RotateCcw className="w-4 h-4" />
                                </button>
                                <button
                                    onClick={() => setIsOpen(false)}
                                    className="ai-header-btn"
                                    title="Close chat"
                                    aria-label="Close chat"
                                >
                                    <X className="w-4 h-4" />
                                </button>
                            </div>
                        </div>

                        {/* ─── Messages ─── */}
                        <div
                            ref={messagesContainerRef}
                            onScroll={handleScroll}
                            className="ai-chat-messages"
                        >
                            {messages.map((msg, index) => (
                                <motion.div
                                    key={index}
                                    initial={{ opacity: 0, y: 12 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.25, ease: 'easeOut' }}
                                    className={`ai-msg-row ${msg.role === 'user' ? 'ai-msg-row-user' : 'ai-msg-row-bot'}`}
                                >
                                    {/* Avatar */}
                                    {msg.role === 'assistant' && (
                                        <div className="ai-msg-avatar ai-msg-avatar-bot">
                                            <Bot className="w-3.5 h-3.5" />
                                        </div>
                                    )}

                                    <div className={`ai-msg-content-wrapper ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
                                        {/* Bubble */}
                                        <div
                                            className={`ai-msg-bubble ${
                                                msg.role === 'user'
                                                    ? 'ai-msg-bubble-user'
                                                    : msg.isError
                                                    ? 'ai-msg-bubble-error'
                                                    : 'ai-msg-bubble-bot'
                                            }`}
                                        >
                                            <div className="ai-msg-text">
                                                {formatMessage(msg.content)}
                                            </div>
                                        </div>

                                        {/* Timestamp */}
                                        <span className="ai-msg-time">
                                            {formatTime(msg.timestamp)}
                                        </span>
                                    </div>

                                    {/* User avatar */}
                                    {msg.role === 'user' && (
                                        <div className="ai-msg-avatar ai-msg-avatar-user">
                                            <User className="w-3.5 h-3.5" />
                                        </div>
                                    )}
                                </motion.div>
                            ))}

                            {/* Typing indicator */}
                            {isLoading && (
                                <motion.div
                                    initial={{ opacity: 0, y: 8 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="ai-msg-row ai-msg-row-bot"
                                >
                                    <div className="ai-msg-avatar ai-msg-avatar-bot">
                                        <Bot className="w-3.5 h-3.5" />
                                    </div>
                                    <div className="ai-msg-bubble ai-msg-bubble-bot">
                                        <TypingIndicator />
                                    </div>
                                </motion.div>
                            )}

                            <div ref={messagesEndRef} className="h-1" />
                        </div>

                        {/* Scroll-to-bottom button */}
                        <AnimatePresence>
                            {showScrollBtn && (
                                <motion.button
                                    initial={{ opacity: 0, scale: 0.8 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0.8 }}
                                    onClick={() => scrollToBottom()}
                                    className="ai-scroll-btn"
                                >
                                    <ChevronDown className="w-4 h-4" />
                                </motion.button>
                            )}
                        </AnimatePresence>

                        {/* ─── Suggestions ─── */}
                        {showSuggestions && (
                            <div className="ai-suggestions">
                                {SUGGESTIONS.map((s, i) => (
                                    <button
                                        key={i}
                                        onClick={() => handleSuggestion(s)}
                                        className="ai-suggestion-chip"
                                    >
                                        {s}
                                    </button>
                                ))}
                            </div>
                        )}

                        {/* ─── Input ─── */}
                        <div className="ai-chat-input-area">
                            <form onSubmit={handleSubmit} className="ai-chat-form">
                                <input
                                    ref={inputRef}
                                    id="ai-assistant-input"
                                    name="message"
                                    value={message}
                                    onChange={(e) => setMessage(e.target.value)}
                                    placeholder="Type a message…"
                                    className="ai-chat-input"
                                    disabled={isLoading}
                                    autoComplete="off"
                                    aria-label="Type a message"
                                />
                                <button
                                    type="submit"
                                    disabled={!message.trim() || isLoading}
                                    className="ai-send-btn"
                                    aria-label="Send message"
                                >
                                    <Send className="w-4 h-4" />
                                </button>
                            </form>
                        </div>
                    </motion.div>
                ) : (
                    /* ─── Floating Action Button ─── */
                    <motion.button
                        key="fab"
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        exit={{ scale: 0 }}
                        whileHover={{ scale: 1.08 }}
                        whileTap={{ scale: 0.92 }}
                        transition={{ type: 'spring', stiffness: 400, damping: 20 }}
                        onClick={() => setIsOpen(true)}
                        className="ai-fab"
                        aria-label="Open AI assistant"
                    >
                        <Sparkles className="w-6 h-6 text-white" />
                        {/* Ping indicator */}
                        <span className="ai-fab-ping" />
                        <span className="ai-fab-ping-static" />
                    </motion.button>
                )}
            </AnimatePresence>
        </div>
    );
};

export default AIAssistant;
