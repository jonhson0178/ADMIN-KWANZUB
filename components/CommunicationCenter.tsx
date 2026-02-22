
import React, { useState, useMemo, useRef, useEffect } from 'react';
import { useMockData } from '../hooks/useMockData';
import { useLocale } from '../context/LocaleContext';
import { Conversation, Message, ConversationParticipant, Ticket, MarketplaceUserType, TicketStatus, TicketPriority, ConversationType } from '../types';
import { PaperAirplaneIcon, PaperClipIcon, TicketIcon } from './Icons';

// Sub-component: FilterButton
const FilterButton: React.FC<{ label: string; active: boolean; onClick: () => void }> = ({ label, active, onClick }) => (
    <button
        onClick={onClick}
        className={`px-3 py-1 text-sm rounded-full ${
            active ? 'bg-kwanzub-primary text-white' : 'bg-gray-700 text-kwanzub-light hover:bg-gray-600'
        }`}
    >
        {label}
    </button>
);

// Sub-component: ConversationItem
const ConversationItem: React.FC<{ conversation: Conversation; isSelected: boolean; onClick: () => void }> = ({ conversation, isSelected, onClick }) => {
    const { t } = useLocale();
    const otherParticipant = conversation.participants.find(p => p.id !== 'int-usr1');
    const participantName = conversation.name || otherParticipant?.name || 'Unknown';
    const lastMessage = conversation.lastMessage;

    return (
        <div
            onClick={onClick}
            className={`flex p-3 cursor-pointer border-b border-gray-700 ${isSelected ? 'bg-kwanzub-primary/20' : 'hover:bg-gray-800/50'}`}
        >
            <div className="relative mr-3">
                 <div className="w-12 h-12 bg-gray-700 rounded-full flex items-center justify-center text-kwanzub-light font-bold">
                    {participantName.charAt(0)}
                </div>
                {conversation.isOnline && <span className="absolute bottom-0 right-0 block h-3 w-3 rounded-full bg-green-500 ring-2 ring-kwanzub-dark"></span>}
            </div>
            <div className="flex-1 overflow-hidden">
                <div className="flex justify-between items-center">
                    <h4 className="font-semibold text-white truncate">{participantName}</h4>
                    <span className="text-xs text-gray-500">{new Date(lastMessage.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                </div>
                <div className="flex justify-between items-start">
                    <p className="text-sm text-kwanzub-light truncate pr-2">{lastMessage.content}</p>
                    {conversation.unreadCount > 0 && (
                        <span className="bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                            {conversation.unreadCount}
                        </span>
                    )}
                </div>
            </div>
        </div>
    );
};

// Sub-component: ChatHeader
const ChatHeader: React.FC<{ participant: ConversationParticipant | undefined, conversation: Conversation }> = ({ participant, conversation }) => {
    const { t } = useLocale();
    const name = conversation.name || participant?.name || "Conversation";
    return (
        <div className="p-4 border-b border-gray-700 flex items-center">
            <div className="w-10 h-10 bg-gray-700 rounded-full flex items-center justify-center text-kwanzub-light font-bold mr-3">{name.charAt(0)}</div>
            <div>
                <h3 className="font-semibold text-white">{name}</h3>
                <p className="text-xs text-green-400">{conversation.isOnline ? t('communicationCenter.online') : ''}</p>
            </div>
        </div>
    );
};


// Sub-component: MessageList
const MessageList: React.FC<{ messages: Message[] }> = ({ messages }) => {
    const messagesEndRef = useRef<HTMLDivElement>(null);
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    return (
        <div className="flex-1 p-4 overflow-y-auto space-y-4">
            {messages.map(msg => {
                const isAdmin = msg.senderId.startsWith('int-');
                return (
                    <div key={msg.id} className={`flex ${isAdmin ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-md p-3 rounded-lg ${isAdmin ? 'bg-kwanzub-primary text-white' : 'bg-gray-700 text-kwanzub-lighter'}`}>
                            <p className="text-sm">{msg.content}</p>
                            <p className="text-xs text-right mt-1 opacity-70">{new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                        </div>
                    </div>
                );
            })}
            <div ref={messagesEndRef} />
        </div>
    );
};


// Sub-component: MessageInput
const MessageInput: React.FC<{ conversationId: string; onSendMessage: (conversationId: string, content: string) => void }> = ({ conversationId, onSendMessage }) => {
    const { t } = useLocale();
    const [message, setMessage] = useState('');

    const handleSend = () => {
        if (message.trim()) {
            onSendMessage(conversationId, message);
            setMessage('');
        }
    };
    
    return (
        <div className="p-4 border-t border-gray-700">
            <div className="flex items-center bg-gray-800 rounded-lg p-2">
                <button className="p-2 text-kwanzub-light hover:text-white"><PaperClipIcon /></button>
                <input
                    type="text"
                    value={message}
                    onChange={e => setMessage(e.target.value)}
                    onKeyPress={e => e.key === 'Enter' && handleSend()}
                    placeholder={t('communicationCenter.messagePlaceholder')}
                    className="flex-1 bg-transparent px-3 text-white focus:outline-none"
                />
                <button onClick={handleSend} className="p-2 text-kwanzub-primary hover:text-kwanzub-primary-hover"><PaperAirplaneIcon /></button>
            </div>
        </div>
    );
};

// Sub-component: ParticipantDetails
const ParticipantDetails: React.FC<{ participant: ConversationParticipant }> = ({ participant }) => {
    const { t } = useLocale();
    const isMarketplaceUser = 'type' in participant;
    
    return (
        <div className="mb-6">
            <h4 className="text-lg font-semibold text-white mb-3 border-b border-gray-700 pb-2">{t('communicationCenter.participantDetails')}</h4>
            <div className="space-y-2 text-sm">
                <p><strong className="text-kwanzub-light">{t('users.user')}:</strong> {participant.name}</p>
                <p><strong className="text-kwanzub-light">{t('communicationCenter.userType')}:</strong> {isMarketplaceUser ? (participant as any).type : (participant as any).role}</p>
                <p><strong className="text-kwanzub-light">{t('communicationCenter.status')}:</strong> {participant.status}</p>
                <p><strong className="text-kwanzub-light">{t('communicationCenter.memberSince')}:</strong> {new Date(participant.createdAt).toLocaleDateString()}</p>
                {isMarketplaceUser && (participant as any).type === MarketplaceUserType.Buyer && <p><strong className="text-kwanzub-light">{t('communicationCenter.totalOrders')}:</strong> {(participant as any).totalOrders}</p>}
                <button className="mt-2 text-sm text-kwanzub-primary hover:underline">{t('communicationCenter.viewProfile')}</button>
            </div>
        </div>
    );
};


// Sub-component: TicketDetails
const TicketDetails: React.FC<{ ticket: Ticket }> = ({ ticket }) => {
    const { t } = useLocale();
    const getStatusColor = (status: TicketStatus) => {
        switch(status) {
            case TicketStatus.Open: return 'text-yellow-400';
            case TicketStatus.InProgress: return 'text-blue-400';
            case TicketStatus.Resolved:
            case TicketStatus.Closed:
                return 'text-green-400';
            default: return 'text-kwanzub-light';
        }
    };
    return (
        <div>
            <h4 className="text-lg font-semibold text-white mb-3 border-b border-gray-700 pb-2">{t('communicationCenter.ticketDetails')}</h4>
            <div className="space-y-2 text-sm">
                <p><strong className="text-kwanzub-light">{t('communicationCenter.ticketId')}:</strong> {ticket.id}</p>
                <p><strong className="text-kwanzub-light">{t('communicationCenter.ticketStatus')}:</strong> <span className={getStatusColor(ticket.status)}>{ticket.status}</span></p>
                <p><strong className="text-kwanzub-light">{t('communicationCenter.ticketPriority')}:</strong> {ticket.priority}</p>
                <p><strong className="text-kwanzub-light">{t('communicationCenter.createdAt')}:</strong> {new Date(ticket.createdAt).toLocaleString()}</p>
            </div>
            <div className="mt-4 flex space-x-2">
                 <button className="flex-1 px-4 py-2 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700">{t('communicationCenter.createTicket')}</button>
                 <button className="flex-1 px-4 py-2 text-sm bg-green-600 text-white rounded-md hover:bg-green-700">{t('communicationCenter.resolveTicket')}</button>
            </div>
        </div>
    );
};

// Main Component
const CommunicationCenter: React.FC = () => {
    const { conversations, messages, tickets, sendMessage } = useMockData();
    const { t } = useLocale();

    const [chatMode, setChatMode] = useState<'Marketplace' | 'Internal'>('Marketplace');
    const [selectedConversationId, setSelectedConversationId] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [filter, setFilter] = useState<'All' | 'Unread' | 'Tickets'>('All');

    useEffect(() => {
        // Select first conversation by default if none is selected
        if (!selectedConversationId && conversations.length > 0) {
            setSelectedConversationId(conversations[0].id);
        }
    }, [conversations, selectedConversationId]);

    const filteredConversations = useMemo(() => {
        return conversations
            .filter(c => { // Filter by chatMode first
                if (chatMode === 'Internal') {
                    // All participants must be internal users
                    return c.participants.every(p => 'role' in p);
                }
                // Marketplace: at least one participant is a marketplace user or it's a broadcast
                return c.participants.some(p => 'type' in p) || c.type === ConversationType.Broadcast;
            })
            .filter(c => {
                if (filter === 'Unread') return c.unreadCount > 0;
                if (filter === 'Tickets' && chatMode === 'Marketplace') return !!c.ticketId;
                return true;
            })
            .filter(c => {
                const participant = c.participants.find(p => p.id !== 'int-usr1'); // Assuming admin is int-usr1
                const name = c.name || participant?.name || '';
                return name.toLowerCase().includes(searchTerm.toLowerCase());
            })
            .sort((a, b) => new Date(b.lastMessage.timestamp).getTime() - new Date(a.lastMessage.timestamp).getTime());
    }, [conversations, filter, searchTerm, chatMode]);

    useEffect(() => {
        if(filteredConversations.length > 0 && !filteredConversations.find(c => c.id === selectedConversationId)) {
            setSelectedConversationId(filteredConversations[0].id);
        } else if (filteredConversations.length === 0) {
            setSelectedConversationId(null);
        }
    }, [filteredConversations, selectedConversationId]);

    const selectedConversation = useMemo(() => {
        if (!selectedConversationId) return null;
        return conversations.find(c => c.id === selectedConversationId);
    }, [conversations, selectedConversationId]);

    const conversationMessages = useMemo(() => {
        if (!selectedConversationId) return [];
        return messages.filter(m => m.conversationId === selectedConversationId)
                       .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
    }, [messages, selectedConversationId]);

    const conversationTicket = useMemo(() => {
        if (!selectedConversation?.ticketId) return null;
        return tickets.find(t => t.id === selectedConversation.ticketId);
    }, [tickets, selectedConversation]);

    const otherParticipant = useMemo(() => {
        if (!selectedConversation) return null;
        return selectedConversation.participants.find(p => p.id !== 'int-usr1');
    }, [selectedConversation]);

    return (
        <div className="flex h-full max-h-[calc(100vh-7rem)] bg-kwanzub-dark rounded-lg shadow-lg">
            <div className="w-full md:w-1/3 lg:w-1/4 border-r border-gray-700 flex flex-col">
                <div className="p-4 border-b border-gray-700">
                    <div className="flex bg-gray-800 rounded-lg p-1 mb-4">
                        <button
                            onClick={() => setChatMode('Marketplace')}
                            className={`w-1/2 py-2 text-sm font-semibold rounded-md transition-colors ${chatMode === 'Marketplace' ? 'bg-kwanzub-primary text-white' : 'text-kwanzub-light hover:bg-gray-700'}`}
                        >
                            {t('communicationCenter.marketplace')}
                        </button>
                        <button
                            onClick={() => setChatMode('Internal')}
                            className={`w-1/2 py-2 text-sm font-semibold rounded-md transition-colors ${chatMode === 'Internal' ? 'bg-kwanzub-primary text-white' : 'text-kwanzub-light hover:bg-gray-700'}`}
                        >
                            {t('communicationCenter.internalTeam')}
                        </button>
                    </div>
                    <input
                        type="text"
                        placeholder={t('communicationCenter.searchPlaceholder')}
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                        className="w-full px-3 py-2 bg-gray-800 text-white rounded-md focus:outline-none focus:ring-2 focus:ring-kwanzub-primary"
                    />
                    <div className="flex justify-around mt-3">
                        <FilterButton label={t('communicationCenter.filterAll')} active={filter === 'All'} onClick={() => setFilter('All')} />
                        <FilterButton label={t('communicationCenter.filterUnread')} active={filter === 'Unread'} onClick={() => setFilter('Unread')} />
                        {chatMode === 'Marketplace' && <FilterButton label={t('communicationCenter.filterTickets')} active={filter === 'Tickets'} onClick={() => setFilter('Tickets')} />}
                    </div>
                </div>
                <div className="flex-1 overflow-y-auto">
                    {filteredConversations.map(conv => (
                        <ConversationItem
                            key={conv.id}
                            conversation={conv}
                            isSelected={selectedConversationId === conv.id}
                            onClick={() => setSelectedConversationId(conv.id)}
                        />
                    ))}
                </div>
            </div>

            <div className="flex-1 flex flex-col">
                {selectedConversation ? (
                    <>
                        <ChatHeader participant={otherParticipant} conversation={selectedConversation} />
                        <MessageList messages={conversationMessages} />
                        <MessageInput conversationId={selectedConversation.id} onSendMessage={sendMessage} />
                    </>
                ) : (
                    <div className="flex-1 flex items-center justify-center text-kwanzub-light">
                        {t('communicationCenter.selectConversation')}
                    </div>
                )}
            </div>

            {selectedConversation && (otherParticipant || conversationTicket) && (
                <div className="hidden lg:block lg:w-1/4 border-l border-gray-700 p-4 overflow-y-auto">
                    {otherParticipant && <ParticipantDetails participant={otherParticipant} />}
                    {conversationTicket && <TicketDetails ticket={conversationTicket} />}
                </div>
            )}
        </div>
    );
};

export default CommunicationCenter;
