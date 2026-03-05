'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/context/AuthContext';
import { api } from '@/lib/api';
import toast from 'react-hot-toast';
import {
    ChatCircle as MessageCircle, PaperPlaneRight as Send, MagnifyingGlass as Search, DotsThreeVertical as MoreVertical, Phone, Video, Paperclip, Smiley as Smile, Check, Checks as CheckCheck, CaretLeft as ChevronLeft, FileText, X, Plus, UserPlus, Info
} from '@phosphor-icons/react';
import { BrandIcon } from '@/components/BrandIcon';
import LoadingSpinner from '@/components/LoadingSpinner';

export default function MessagesPage() {
    const { user } = useAuth();
    const [conversations, setConversations] = useState<any[]>([]);
    const [selectedConvId, setSelectedConvId] = useState<string | null>(null);
    const [tentativePartner, setTentativePartner] = useState<any | null>(null);
    const [messages, setMessages] = useState<any[]>([]);
    const [newMessage, setNewMessage] = useState('');
    const [attachment, setAttachment] = useState<File | null>(null);
    const [showMobileConv, setShowMobileConv] = useState(false);
    const [loadingConvs, setLoadingConvs] = useState(true);
    const [loadingMessages, setLoadingMessages] = useState(false);
    const [isNewChatModalOpen, setIsNewChatModalOpen] = useState(false);

    const messagesEndRef = useRef<HTMLDivElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        loadConversations();
    }, []);

    useEffect(() => {
        if (selectedConvId) {
            setTentativePartner(null);
            loadMessages(selectedConvId);
        }
    }, [selectedConvId]);

    useEffect(() => {
        // Scroll to bottom when messages load or change
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const loadConversations = async () => {
        try {
            const res = await api.getConversations() as any;
            const updatedConvs = res.conversations || [];
            setConversations(updatedConvs);
            setLoadingConvs(false);

            // Auto-select first conversation if exists and none selected/tentative
            if (!selectedConvId && !tentativePartner && updatedConvs.length > 0) {
                setSelectedConvId(updatedConvs[0].id);
            }
        } catch (error) {
            console.error("Failed to load conversations:", error);
            setLoadingConvs(false);
        }
    };

    const loadMessages = async (convId: string) => {
        setLoadingMessages(true);
        try {
            const res = await api.getMessages(convId) as any;
            setMessages(res.messages || []);
            setLoadingMessages(false);
        } catch (error) {
            console.error("Failed to load messages:", error);
            setLoadingMessages(false);
        }
    };

    const handleSendMessage = async () => {
        if ((!newMessage.trim() && !attachment) || (!selectedConvId && !tentativePartner) || !user) return;

        let receiverId: string;
        if (selectedConvId) {
            const currentConv = conversations.find(c => c.id === selectedConvId);
            if (!currentConv) return;
            receiverId = currentConv.participant1Id === user.id
                ? currentConv.participant2Id
                : currentConv.participant1Id;
        } else {
            receiverId = tentativePartner.id;
        }

        try {
            const res = await api.sendMessage(receiverId, newMessage, attachment) as any;

            // If it was a new conversation, we need to refresh list and select it
            if (!selectedConvId) {
                await loadConversations();
                // Find the new conversation id
                const newRes = await api.getConversations() as any;
                const newConv = newRes.conversations.find((c: any) =>
                    (c.participant1Id === user.id && c.participant2Id === receiverId) ||
                    (c.participant1Id === receiverId && c.participant2Id === user.id)
                );
                if (newConv) {
                    setSelectedConvId(newConv.id);
                    setTentativePartner(null);
                }
            } else {
                // Just add message locally for existing conv
                setMessages([...messages, res.message]);
            }

            setNewMessage('');
            setAttachment(null);
            if (fileInputRef.current) fileInputRef.current.value = '';

            // Reload to update sidebar sorting and last message
            loadConversations();
        } catch (error) {
            console.error("Failed to send message:", error);
            toast.error("Erreur lors de l'envoi du message");
        }
    };

    const handleStartNewChat = (partner: any) => {
        // Check if conversation already exists
        const existing = conversations.find(c =>
            c.participant1Id === partner.id || c.participant2Id === partner.id
        );

        if (existing) {
            setSelectedConvId(existing.id);
            setTentativePartner(null);
        } else {
            setSelectedConvId(null);
            setTentativePartner(partner);
            setMessages([]); // Clear messages for new chat
        }
        setIsNewChatModalOpen(false);
        setShowMobileConv(false);
    };

    const roleBadge: Record<string, string> = {
        'ACCOMPAGNATEUR': 'bg-success/10 text-success',
        'ADMIN': 'bg-accent/10 text-accent',
        'STUDENT': 'bg-info/10 text-info',
    };

    const formatRole = (role: string) => {
        if (role === 'STUDENT') return 'Étudiant';
        if (role === 'ACCOMPAGNATEUR') return 'Accompagnateur';
        if (role === 'ADMIN') return 'Admin';
        return role;
    };

    const currentConv = conversations.find(c => c.id === selectedConvId);

    // Helper to get the other participant in the conversation
    const getOtherParticipant = (conv: any) => {
        if (!user || !conv) return null;
        return conv.participant1Id === user.id ? conv.participant2 : conv.participant1;
    };

    const activeParticipant = tentativePartner || getOtherParticipant(currentConv);

    return (
        <div className="h-[calc(100dvh-6rem)] sm:h-[calc(100vh-8rem)] -mt-2 sm:mt-0">
            <div className="flex h-full rounded-2xl overflow-hidden border border-border-light bg-white shadow-sm relative">
                {/* Conversations List */}
                <div className={`w-full md:w-80 lg:w-96 border-r border-border-light flex flex-col ${(selectedConvId || tentativePartner) ? 'hidden md:flex' : 'flex'}`}>
                    {/* Header */}
                    <div className="p-3 sm:p-4 border-b border-border-light bg-bg-light/30">
                        <div className="flex items-center justify-between mb-3 sm:mb-4">
                            <h2 className="text-base sm:text-lg font-bold text-primary flex items-center gap-2">
                                <MessageCircle className="w-5 h-5 text-accent" />
                                Messages
                            </h2>
                            <span className="text-[10px] sm:text-xs bg-accent/10 text-accent px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-full font-semibold">
                                {conversations.reduce((acc, c) => acc + (c.unreadCount || 0), 0)} non lus
                            </span>
                        </div>
                        <div className="flex gap-2">
                            <div className="flex-1 flex items-center gap-2 bg-white rounded-xl px-3 py-2 border border-border-light shadow-sm">
                                <Search className="w-4 h-4 text-text-muted" />
                                <input type="text" placeholder="Rechercher..." className="bg-transparent text-xs sm:text-sm outline-none flex-1 text-text-primary" />
                            </div>
                            <button
                                onClick={() => setIsNewChatModalOpen(true)}
                                className="p-2 sm:p-2.5 bg-accent text-primary rounded-xl hover:bg-accent-dark shadow-sm transition-all"
                                title="Nouvelle discussion"
                            >
                                <UserPlus className="w-4 h-4 sm:w-5 sm:h-5" />
                            </button>
                        </div>
                    </div>

                    {/* Conversation List */}
                    <div className="flex-1 overflow-y-auto">
                        {loadingConvs ? (
                            <div className="flex justify-center p-8">
                                <LoadingSpinner size="sm" />
                            </div>
                        ) : conversations.length === 0 && !tentativePartner ? (
                            <div className="text-center p-8 text-text-secondary">
                                <p className="text-sm">Aucune conversation trouvée.</p>
                                <button
                                    onClick={() => setIsNewChatModalOpen(true)}
                                    className="mt-4 text-xs text-accent font-bold hover:underline"
                                >
                                    Démarrer une discussion
                                </button>
                            </div>
                        ) : (
                            <>
                                {tentativePartner && (
                                    <button
                                        onClick={() => { setSelectedConvId(null); setTentativePartner(tentativePartner); setShowMobileConv(false); }}
                                        className="w-full flex items-start gap-3 p-4 bg-accent/5 border-l-2 border-l-accent border-b border-border-light/50 text-left"
                                    >
                                        <div className="relative flex-shrink-0">
                                            <div className="w-12 h-12 rounded-full bg-primary flex items-center justify-center text-white font-bold text-sm">
                                                {tentativePartner.firstName[0]}{tentativePartner.lastName[0]}
                                            </div>
                                            <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-warning rounded-full border-2 border-white" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center justify-between">
                                                <span className="font-semibold text-sm text-primary truncate">{tentativePartner.firstName} {tentativePartner.lastName}</span>
                                            </div>
                                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${roleBadge[tentativePartner.role]} mt-0.5 inline-block`}>
                                                {formatRole(tentativePartner.role)}
                                            </span>
                                            <p className="text-xs text-accent mt-1 italic">Nouvelle discussion...</p>
                                        </div>
                                    </button>
                                )}
                                {conversations.map((conv) => {
                                    const other = getOtherParticipant(conv);
                                    if (!other) return null;

                                    return (
                                        <button
                                            key={conv.id}
                                            onClick={() => { setSelectedConvId(conv.id); setTentativePartner(null); }}
                                            className={`w-full flex items-start gap-3 p-4 hover:bg-bg-light transition-colors text-left border-b border-border-light/50 ${selectedConvId === conv.id ? 'bg-accent/5 border-l-2 border-l-accent' : ''
                                                }`}
                                        >
                                            <div className="relative flex-shrink-0">
                                                <div className="w-12 h-12 rounded-full bg-primary flex items-center justify-center text-white font-bold text-sm">
                                                    {other.firstName[0]}{other.lastName[0]}
                                                </div>
                                                <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-success rounded-full border-2 border-white" />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center justify-between">
                                                    <span className="font-semibold text-sm text-primary truncate">{other.firstName} {other.lastName}</span>
                                                    <span className="text-xs text-text-muted flex-shrink-0">
                                                        {conv.lastMessageAt ? new Date(conv.lastMessageAt).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }) : ''}
                                                    </span>
                                                </div>
                                                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${roleBadge[other.role]} mt-0.5 inline-block`}>
                                                    {formatRole(other.role)}
                                                </span>
                                                <p className="text-xs text-text-secondary mt-1 truncate">
                                                    {conv.messages?.[0]?.content || "Nouvelle conversation"}
                                                </p>
                                            </div>
                                            {conv.unreadCount > 0 && (
                                                <span className="w-5 h-5 bg-accent text-primary rounded-full text-xs flex items-center justify-center font-bold flex-shrink-0 mt-1">
                                                    {conv.unreadCount}
                                                </span>
                                            )}
                                        </button>
                                    );
                                })}
                            </>
                        )}
                    </div>
                </div>

                {/* Chat Area */}
                <div className={`flex-1 flex flex-col ${!(selectedConvId || tentativePartner) ? 'hidden md:flex' : 'flex'}`}>
                    {activeParticipant ? (
                        <>
                            {/* Chat Header */}
                            <div className="flex items-center justify-between px-3 sm:px-6 py-2.5 sm:py-4 border-b border-border-light bg-white shadow-sm z-10">
                                <div className="flex items-center gap-2 sm:gap-3">
                                    <button onClick={() => { setSelectedConvId(null); setTentativePartner(null); }} className="md:hidden p-1.5 -ml-1 text-primary hover:bg-bg-light rounded-lg transition-colors">
                                        <ChevronLeft className="w-5 h-5" />
                                    </button>
                                    <div className="relative">
                                        <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-primary flex items-center justify-center text-white font-bold text-xs sm:text-sm">
                                            {activeParticipant.firstName[0]}{activeParticipant.lastName[0]}
                                        </div>
                                        <div className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 sm:w-3 sm:h-3 bg-success rounded-full border-2 border-white" />
                                    </div>
                                    <div className="min-w-0">
                                        <div className="font-semibold text-primary text-xs sm:text-sm truncate max-w-[120px] sm:max-w-none">{activeParticipant.firstName} {activeParticipant.lastName}</div>
                                        <div className="text-[10px] sm:text-xs text-text-muted">{selectedConvId ? 'En ligne' : 'Prêt à discuter'}</div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-0.5 sm:gap-1">
                                    <button className="p-2 sm:p-2.5 rounded-xl hover:bg-bg-light text-text-secondary transition-colors"><Phone className="w-3.5 h-3.5 sm:w-4 sm:h-4" /></button>
                                    <button className="p-2 sm:p-2.5 rounded-xl hover:bg-bg-light text-text-secondary transition-colors"><Video className="w-3.5 h-3.5 sm:w-4 sm:h-4" /></button>
                                    <button className="p-2 sm:p-2.5 rounded-xl hover:bg-bg-light text-text-secondary transition-colors"><MoreVertical className="w-3.5 h-3.5 sm:w-4 sm:h-4" /></button>
                                </div>
                            </div>

                            {/* Messages */}
                            <div className="flex-1 overflow-y-auto px-3 sm:px-6 py-4 sm:py-6 space-y-4 bg-bg-light/30">
                                {loadingMessages ? (
                                    <div className="flex justify-center p-8">
                                        <LoadingSpinner size="sm" />
                                    </div>
                                ) : messages.length === 0 ? (
                                    <div className="h-full flex flex-col items-center justify-center text-center p-8">
                                        <BrandIcon icon={MessageCircle} size={64} className="mb-4 shadow-md ring-4 ring-accent/10" />
                                        <h4 className="font-bold text-primary mb-1">Démarrer la discussion</h4>
                                        <p className="text-xs text-text-secondary max-w-[200px]">Envoyez votre premier message pour lancer la conversation avec {activeParticipant.firstName}.</p>
                                    </div>
                                ) : (
                                    messages.map((msg, index) => {
                                        const isMe = msg.senderId === user?.id;
                                        return (
                                            <motion.div
                                                key={msg.id || index}
                                                initial={{ opacity: 0, y: 10 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}
                                            >
                                                <div className={`max-w-[85%] sm:max-w-[75%] ${isMe
                                                    ? 'bg-primary text-white rounded-2xl rounded-br-md shadow-md'
                                                    : 'bg-white text-text-primary rounded-2xl rounded-bl-md shadow-sm border border-border-light'
                                                    } px-4 py-3`}
                                                >
                                                    {msg.attachmentUrl && (
                                                        <div className="mb-2">
                                                            {msg.attachmentType === 'IMAGE' ? (
                                                                <a href={msg.attachmentUrl} target="_blank" rel="noopener noreferrer">
                                                                    <img src={msg.attachmentUrl} alt="Pièce jointe" className="max-w-[200px] rounded-lg max-h-48 object-cover cursor-pointer hover:opacity-90 transition-opacity border border-white/20" />
                                                                </a>
                                                            ) : (
                                                                <a href={msg.attachmentUrl} target="_blank" rel="noopener noreferrer" className={`flex items-center gap-2 p-2 rounded-lg ${isMe ? 'bg-white/20 hover:bg-white/30 text-white' : 'bg-primary/5 hover:bg-primary/10 text-primary'} transition-colors inline-block`}>
                                                                    <FileText className="w-3.5 h-3.5" />
                                                                    <span className="text-[10px] sm:text-xs font-semibold underline underline-offset-2">Voir le document</span>
                                                                </a>
                                                            )}
                                                        </div>
                                                    )}
                                                    {msg.content && <p className="text-sm whitespace-pre-wrap leading-relaxed">{msg.content}</p>}
                                                    <div className={`flex items-center gap-1 mt-1.5 ${isMe ? 'justify-end' : 'justify-start'}`}>
                                                        <span className={`text-[10px] uppercase font-semibold ${isMe ? 'text-white/50' : 'text-text-muted'}`}>
                                                            {new Date(msg.createdAt).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                                                        </span>
                                                        {isMe && (
                                                            msg.isRead ? <CheckCheck className="w-3.5 h-3.5 text-accent-light ml-0.5" /> : <Check className="w-3 h-3 text-white/50 ml-0.5" />
                                                        )}
                                                    </div>
                                                </div>
                                            </motion.div>
                                        );
                                    })
                                )}
                                <div ref={messagesEndRef} />
                            </div>

                            {/* Input */}
                            <div className="px-3 sm:px-6 py-3 sm:py-4 border-t border-border-light bg-white">
                                {attachment && (
                                    <div className="mb-3 flex items-center justify-between gap-2 bg-accent/10 border border-accent/20 text-accent px-3 py-2 rounded-xl text-sm font-medium w-fit max-w-sm">
                                        <div className="flex items-center gap-2 truncate">
                                            <Paperclip className="w-4 h-4 flex-shrink-0" />
                                            <span className="truncate">{attachment.name}</span>
                                        </div>
                                        <button onClick={() => {
                                            setAttachment(null);
                                            if (fileInputRef.current) fileInputRef.current.value = '';
                                        }} className="hover:bg-accent/20 p-1 rounded-lg transition-colors flex-shrink-0">
                                            <X className="w-3.5 h-3.5" />
                                        </button>
                                    </div>
                                )}
                                <div className="flex items-center gap-2 sm:gap-3 max-w-4xl mx-auto">
                                    <button onClick={() => fileInputRef.current?.click()} className="p-2 rounded-xl hover:bg-bg-light text-text-muted transition-colors relative">
                                        <Paperclip className="w-5 h-5 sm:w-5 sm:h-5" />
                                    </button>
                                    <input type="file" ref={fileInputRef} onChange={(e) => setAttachment(e.target.files?.[0] || null)} className="hidden" />
                                    <div className="flex-1 flex items-center gap-2 bg-bg-light rounded-xl px-3 sm:px-4 py-2 sm:py-3 border border-border-light focus-within:border-accent/50 focus-within:ring-2 focus-within:ring-accent/10 transition-all">
                                        <input
                                            type="text"
                                            value={newMessage}
                                            onChange={(e) => setNewMessage(e.target.value)}
                                            placeholder="Message..."
                                            className="flex-1 bg-transparent text-xs sm:text-sm outline-none text-text-primary"
                                            onKeyDown={(e) => e.key === 'Enter' && (newMessage.trim() || attachment) && handleSendMessage()}
                                        />
                                        <button className="text-text-muted hover:text-primary transition-colors hidden sm:block">
                                            <Smile className="w-5 h-5" />
                                        </button>
                                    </div>
                                    <button
                                        onClick={handleSendMessage}
                                        disabled={!newMessage.trim() && !attachment}
                                        className={`p-2.5 sm:p-3 rounded-xl transition-all ${newMessage.trim() || attachment
                                            ? 'bg-accent text-primary hover:bg-accent-dark shadow-lg shadow-accent/20'
                                            : 'bg-bg-light text-text-muted cursor-not-allowed'
                                            }`}
                                    >
                                        <Send className="w-4 h-4 sm:w-5 sm:h-5" />
                                    </button>
                                </div>
                            </div>
                        </>
                    ) : (
                        <div className="flex-1 flex items-center justify-center text-center bg-bg-light/30">
                            <div className="bg-white p-8 rounded-2xl shadow-sm border border-border-light flex flex-col items-center">
                                <BrandIcon icon={MessageCircle} size={80} className="mb-6 opacity-40 grayscale" />
                                <h3 className="text-xl font-bold text-primary mb-2">Vos Conversations</h3>
                                <p className="text-sm text-text-secondary mb-6 max-w-xs">Sélectionnez un contact pour démarrer une discussion sécurisée avec votre accompagnateur ou l'administration.</p>
                                <button
                                    onClick={() => setIsNewChatModalOpen(true)}
                                    className="btn-primary py-3 px-8 text-sm flex items-center gap-2"
                                >
                                    <UserPlus className="w-4 h-4" /> Nouvelle discussion
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* New Chat Modal */}
            <AnimatePresence>
                {isNewChatModalOpen && (
                    <NewChatModal
                        onClose={() => setIsNewChatModalOpen(false)}
                        onSelectPartner={handleStartNewChat}
                    />
                )}
            </AnimatePresence>
        </div>
    );
}

function NewChatModal({ onClose, onSelectPartner }: { onClose: () => void, onSelectPartner: (partner: any) => void }) {
    const [partners, setPartners] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');

    useEffect(() => {
        api.getChatPartners()
            .then(res => setPartners(res.partners))
            .catch(console.error)
            .finally(() => setLoading(false));
    }, []);

    const filteredPartners = partners.filter(p =>
        `${p.firstName} ${p.lastName}`.toLowerCase().includes(search.toLowerCase())
    );

    const roleBadge: Record<string, string> = {
        'ACCOMPAGNATEUR': 'bg-success/10 text-success',
        'ADMIN': 'bg-accent/10 text-accent',
        'STUDENT': 'bg-info/10 text-info',
    };

    return (
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-primary/40 backdrop-blur-sm" onClick={onClose} />
            <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }} className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden flex flex-col max-h-[80vh]">
                <div className="p-4 border-b border-border-light flex justify-between items-center bg-bg-light/30">
                    <h3 className="font-bold text-primary">Nouvelle discussion</h3>
                    <button onClick={onClose} className="p-2 hover:bg-bg-light rounded-xl transition-colors"><X className="w-5 h-5" /></button>
                </div>

                <div className="p-4 bg-white">
                    <div className="flex items-center gap-2 bg-bg-light rounded-xl px-3 py-2.5 border border-border-light">
                        <Search className="w-4 h-4 text-text-muted" />
                        <input
                            type="text"
                            placeholder="Rechercher un contact..."
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                            className="bg-transparent text-sm outline-none flex-1 text-text-primary"
                            autoFocus
                        />
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto p-2">
                    {loading ? (
                        <div className="flex justify-center p-8"><LoadingSpinner size="sm" /></div>
                    ) : filteredPartners.length === 0 ? (
                        <div className="text-center p-8 text-text-muted text-sm italic">Aucun contact trouvé</div>
                    ) : (
                        filteredPartners.map(p => (
                            <button
                                key={p.id}
                                onClick={() => onSelectPartner(p)}
                                className="w-full flex items-center gap-3 p-3 hover:bg-bg-light rounded-xl transition-colors text-left group"
                            >
                                <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-white font-bold text-sm shadow-sm group-hover:scale-105 transition-transform">
                                    {p.firstName[0]}{p.lastName[0]}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="font-semibold text-sm text-primary">{p.firstName} {p.lastName}</div>
                                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${roleBadge[p.role]}`}>
                                        {p.role === 'ADMIN' ? 'Admin' : p.role === 'ACCOMPAGNATEUR' ? 'Accompagnateur' : 'Étudiant'}
                                    </span>
                                </div>
                                <Plus className="w-4 h-4 text-accent opacity-0 group-hover:opacity-100 transition-opacity" />
                            </button>
                        ))
                    )}
                </div>

                <div className="p-4 bg-primary/5 text-[10px] text-primary/60 flex items-center gap-2 border-t border-primary/10">
                    <Info className="w-3 h-3" />
                    <span>Seuls vos partenaires académiques autorisés apparaissent ici.</span>
                </div>
            </motion.div>
        </div>
    );
}
