import React, { useState, useRef, useEffect } from 'react';
import { MessageSquare, Send, X, Bot, User, Sparkles, Zap, Brain, Terminal } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';
import { motion, AnimatePresence } from 'framer-motion';
const AIAssistant = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [message, setMessage] = useState('');
    const [messages, setMessages] = useState([
        {
            role: 'assistant',
            content: "Protocol Online. I am your BachatSaathi Financial Intelligence Unit. How shall we optimize your capital today?",
        },
    ]);
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef(null);
    const { user } = useAuth();
    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };
    useEffect(() => {
        if (isOpen) scrollToBottom();
    }, [messages, isOpen]);
    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!message.trim() || isLoading) return;
        const userMessage = { role: 'user', content: message };
        setMessages((prev) => [...prev, userMessage]);
        setMessage('');
        setIsLoading(true);
        try {
            const typingMessage = { role: 'assistant', content: 'Processing...', isTyping: true };
            setMessages(prev => [...prev, typingMessage]);
            const response = await api.post('/insights/assistant/chat', { message }, { timeout: 30000 });
            setMessages(prev => prev.filter(msg => !msg.isTyping));
            if (response.data?.data?.response) {
                setMessages(prev => [...prev, { role: 'assistant', content: response.data.data.response }]);
            } else {
                throw new Error('Signal loss.');
            }
        } catch (error) {
            setMessages(prev => prev.filter(msg => !msg.isTyping));
            setMessages(prev => [...prev, { role: 'assistant', content: 'Connection desync. Please re-authenticate your query.', isError: true }]);
        } finally {
            setIsLoading(false);
        }
    };
    return (
        <div className="fixed bottom-8 right-8 z-[1000]">
            <AnimatePresence>
                {isOpen ? (
                    <motion.div initial={{ opacity: 0, scale: 0.9, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9, y: 20 }} className="bg-background/80 backdrop-blur-2xl rounded-3xl shadow-2xl w-[400px] h-[650px] flex flex-col border border-primary/20 overflow-hidden mb-4 relative">
                        {}
                        <div className="gradient-primary p-6 flex justify-between items-center relative overflow-hidden">
                            <div className="absolute top-0 right-0 p-4 opacity-10 animate-pulse"><Brain className="w-16 h-16"/></div>
                            <div className="flex items-center gap-3 relative z-10">
                                <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-md flex items-center justify-center text-white"><Terminal className="w-5 h-5" /></div>
                                <div>
                                    <h3 className="font-black text-white text-lg tracking-tighter uppercase tracking-widest leading-none">Intelligence <span className="opacity-70">Unit</span></h3>
                                    <p className="text-[9px] font-black text-white/70 uppercase tracking-widest mt-1 italic">Operative: {user?.name || 'Authorized User'}</p>
                                </div>
                            </div>
                            <button onClick={() => setIsOpen(false)} className="p-2 rounded-xl hover:bg-white/20 transition-colors text-white relative z-10"><X className="h-5 w-5" /></button>
                        </div>
                        {}
                        <div className="flex-1 p-6 overflow-y-auto space-y-6 custom-scrollbar bg-primary/5">
                            {messages.map((msg, index) => (
                                <motion.div key={index} initial={{ opacity: 0, x: msg.role === 'user' ? 20 : -20 }} animate={{ opacity: 1, x: 0 }} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                    <div className={`flex max-w-[85%] gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 border ${msg.role === 'user' ? 'bg-primary border-primary/20 text-white' : 'bg-muted/50 border-border/50 text-primary'}`}>
                                            {msg.role === 'user' ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
                                        </div>
                                        <div className={`p-4 rounded-2xl text-[11px] font-medium leading-relaxed shadow-sm border ${msg.role === 'user' ? 'bg-primary text-white border-primary/20 rounded-tr-none' : 'bg-background border-border/50 text-foreground rounded-tl-none'}`}>
                                            {msg.isTyping ? (
                                                <div className="flex space-x-1 py-1">
                                                    <div className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce" />
                                                    <div className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce [animation-delay:0.2s]" />
                                                    <div className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce [animation-delay:0.4s]" />
                                                </div>
                                            ) : (
                                                <p className={msg.isError ? 'text-rose-500 font-black italic uppercase tracking-tighter' : ''}>{msg.content}</p>
                                            )}
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                            <div ref={messagesEndRef} />
                        </div>
                        {}
                        <div className="p-6 border-t border-border/20 bg-background/50">
                            <form onSubmit={handleSubmit} className="relative group">
                                <Input
                                    id="ai-assistant-input"
                                    name="message"
                                    value={message}
                                    onChange={(e) => setMessage(e.target.value)}
                                    placeholder="Enter query protocol..."
                                    className="pl-12 pr-12 py-4 text-[11px] font-black uppercase tracking-tighter"
                                    disabled={isLoading}
                                    aria-label="Ask AI Assistant"
                                />
                                <div className="absolute left-4 top-[22px] text-primary opacity-50 z-10"><MessageSquare className="w-4 h-4" /></div>
                                <button type="submit" disabled={!message.trim() || isLoading} className="absolute right-2 top-[6px] p-3 rounded-xl bg-primary text-white hover:opacity-90 disabled:opacity-30 transition-all z-10"><Send className="h-4 w-4" /></button>
                            </form>
                            <div className="mt-4 flex items-center justify-center gap-2 opacity-30">
                                <Zap className="w-3 h-3 text-primary" />
                                <span className="text-[8px] font-black uppercase tracking-widest italic">Encrypted AI Channel Active</span>
                            </div>
                        </div>
                    </motion.div>
                ) : (
                    <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} onClick={() => setIsOpen(true)} className="w-16 h-16 rounded-2xl gradient-primary text-white shadow-2xl shadow-primary/40 flex items-center justify-center relative overflow-hidden group">
                        <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity" />
                        <Sparkles className="w-8 h-8 animate-pulse" />
                        <div className="absolute -top-1 -right-1 w-4 h-4 bg-emerald-500 border-2 border-background rounded-full animate-ping" />
                    </motion.button>
                )}
            </AnimatePresence>
        </div>
    );
};
export default AIAssistant;
