

import React, { useState, useMemo, useEffect } from 'react';
import { useMockData } from '../hooks/useMockData';
import { useLocale } from '../context/LocaleContext';
// FIX: Changed import path for Page and HighlightableEntity types to fix module resolution error.
import { Notification, NotificationPriority, NotificationStatus, NotificationType, Page, HighlightableEntity } from '../types';
import { InformationCircleIcon, ExclamationTriangleIcon, BellAlertIcon, CheckCircleIcon, EyeSlashIcon } from './Icons';

interface NotificationCenterProps {
  onNavigate: (page: Page, entity: HighlightableEntity | null) => void;
}

const NotificationCenter: React.FC<NotificationCenterProps> = ({ onNavigate }) => {
    const { notifications, updateNotificationStatus } = useMockData();
    const { t } = useLocale();

    const [selectedNotificationId, setSelectedNotificationId] = useState<string | null>(null);
    const [statusFilter, setStatusFilter] = useState<'All' | NotificationStatus>('All');
    const [typeFilter, setTypeFilter] = useState<'All' | NotificationType>('All');
    const [priorityFilter, setPriorityFilter] = useState<'All' | NotificationPriority>('All');
    const [searchTerm, setSearchTerm] = useState('');

    const filteredNotifications = useMemo(() => {
        return notifications
            .filter(n => statusFilter === 'All' || n.status === statusFilter)
            .filter(n => typeFilter === 'All' || n.type === typeFilter)
            .filter(n => priorityFilter === 'All' || n.priority === priorityFilter)
            .filter(n => 
                n.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                n.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
                n.sender.toLowerCase().includes(searchTerm.toLowerCase())
            )
            .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    }, [notifications, statusFilter, typeFilter, priorityFilter, searchTerm]);

    useEffect(() => {
        if (filteredNotifications.length > 0 && !selectedNotificationId) {
            setSelectedNotificationId(filteredNotifications[0].id);
        } else if (filteredNotifications.length === 0) {
            setSelectedNotificationId(null);
        } else if (selectedNotificationId && !filteredNotifications.some(n => n.id === selectedNotificationId)) {
            // If the selected notification is filtered out, select the new first one
            setSelectedNotificationId(filteredNotifications[0]?.id || null);
        }
    }, [filteredNotifications, selectedNotificationId]);
    
    const selectedNotification = useMemo(() => {
        return notifications.find(n => n.id === selectedNotificationId);
    }, [notifications, selectedNotificationId]);

    const getPriorityProps = (priority: NotificationPriority) => {
        switch (priority) {
            case NotificationPriority.Critical: return { icon: <BellAlertIcon />, color: 'text-red-400', ring: 'ring-red-500/50' };
            case NotificationPriority.Alert: return { icon: <ExclamationTriangleIcon />, color: 'text-yellow-400', ring: 'ring-yellow-500/50' };
            case NotificationPriority.Info: return { icon: <InformationCircleIcon />, color: 'text-blue-400', ring: 'ring-blue-500/50' };
            default: return { icon: <InformationCircleIcon />, color: 'text-gray-400', ring: 'ring-gray-500/50' };
        }
    };

    const handleRelatedEntityClick = () => {
        if (selectedNotification?.relatedEntity) {
            const { type, id } = selectedNotification.relatedEntity;
            let page: Page | null = null;
            let entityType = type;
            switch(type) {
                case 'order': page = 'Orders'; break;
                case 'product': page = 'Products'; break;
                case 'user': page = 'Marketplace Users'; break;
                case 'store': page = 'Stores'; break;
                case 'ticket': page = 'Communication Center'; break;
            }
            if (page) {
                onNavigate(page, { type: entityType, id });
            }
        }
    }


    return (
        <div className="flex h-full max-h-[calc(100vh-7rem)] bg-kwanzub-dark rounded-lg shadow-lg">
            {/* Left Panel: Filters */}
            <div className="w-full md:w-1/4 border-r border-gray-700 flex flex-col p-4 space-y-4">
                 <input
                    type="text"
                    placeholder={t('dataTable.searchPlaceholder')}
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                    className="w-full px-3 py-2 bg-gray-800 text-white rounded-md focus:outline-none focus:ring-2 focus:ring-kwanzub-primary"
                />
                <div>
                    <label className="text-xs text-kwanzub-light font-semibold">Status</label>
                    <div className="flex space-x-2 mt-1">
                        <FilterChip active={statusFilter === 'All'} onClick={() => setStatusFilter('All')}>All</FilterChip>
                        <FilterChip active={statusFilter === NotificationStatus.Unread} onClick={() => setStatusFilter(NotificationStatus.Unread)}>Unread</FilterChip>
                        <FilterChip active={statusFilter === NotificationStatus.Read} onClick={() => setStatusFilter(NotificationStatus.Read)}>Read</FilterChip>
                    </div>
                </div>
                 <div>
                    <label className="text-xs text-kwanzub-light font-semibold">Type</label>
                    <div className="flex space-x-2 mt-1">
                        <FilterChip active={typeFilter === 'All'} onClick={() => setTypeFilter('All')}>All</FilterChip>
                        <FilterChip active={typeFilter === NotificationType.System} onClick={() => setTypeFilter(NotificationType.System)}>System</FilterChip>
                        <FilterChip active={typeFilter === NotificationType.Manual} onClick={() => setTypeFilter(NotificationType.Manual)}>Manual</FilterChip>
                    </div>
                </div>
                <div>
                    <label className="text-xs text-kwanzub-light font-semibold">Priority</label>
                    <div className="flex space-x-2 mt-1 flex-wrap gap-2">
                        <FilterChip active={priorityFilter === 'All'} onClick={() => setPriorityFilter('All')}>All</FilterChip>
                        <FilterChip active={priorityFilter === NotificationPriority.Critical} onClick={() => setPriorityFilter(NotificationPriority.Critical)}>Critical</FilterChip>
                        <FilterChip active={priorityFilter === NotificationPriority.Alert} onClick={() => setPriorityFilter(NotificationPriority.Alert)}>Alert</FilterChip>
                        <FilterChip active={priorityFilter === NotificationPriority.Info} onClick={() => setPriorityFilter(NotificationPriority.Info)}>Info</FilterChip>
                    </div>
                </div>
            </div>

            {/* Middle Panel: Notification List */}
            <div className="w-full md:w-1/3 border-r border-gray-700 flex flex-col">
                <div className="p-4 border-b border-gray-700 flex justify-between items-center">
                    <h3 className="text-lg font-semibold text-white">Inbox ({filteredNotifications.length})</h3>
                    <button className="px-3 py-1 text-sm bg-kwanzub-primary text-white rounded-md hover:bg-kwanzub-primary-hover">New Notification</button>
                </div>
                <div className="flex-1 overflow-y-auto">
                    {filteredNotifications.map(n => {
                        const { icon, color } = getPriorityProps(n.priority);
                        const isSelected = selectedNotificationId === n.id;
                        return (
                            <div key={n.id} onClick={() => setSelectedNotificationId(n.id)} className={`flex p-3 cursor-pointer border-b border-gray-700/50 ${isSelected ? 'bg-kwanzub-primary/20' : 'hover:bg-gray-800/50'}`}>
                                <div className={`w-8 h-8 mr-3 mt-1 flex-shrink-0 ${color}`}>{icon}</div>
                                <div className="flex-1 overflow-hidden">
                                    <div className="flex justify-between items-center">
                                        <h4 className={`font-semibold truncate ${n.status === NotificationStatus.Unread ? 'text-white' : 'text-kwanzub-light'}`}>{n.title}</h4>
                                        <span className="text-xs text-gray-500 flex-shrink-0 ml-2">{new Date(n.timestamp).toLocaleDateString()}</span>
                                    </div>
                                     <p className="text-sm text-kwanzub-light truncate pr-2">{n.content}</p>
                                     <p className="text-xs text-gray-500 mt-1">From: {n.sender}</p>
                                </div>
                            </div>
                        )
                    })}
                </div>
            </div>

            {/* Right Panel: Detail View */}
            <div className="w-full md:w-5/12 flex flex-col">
                {selectedNotification ? (
                    <>
                        <div className="p-4 border-b border-gray-700">
                             <div className="flex justify-between items-start">
                                <div className="flex items-start">
                                    <div className={`w-8 h-8 mr-3 mt-1 flex-shrink-0 ${getPriorityProps(selectedNotification.priority).color}`}>{getPriorityProps(selectedNotification.priority).icon}</div>
                                    <div>
                                        <h2 className="text-xl font-bold text-white">{selectedNotification.title}</h2>
                                        <p className="text-sm text-gray-400">From {selectedNotification.sender} &middot; {new Date(selectedNotification.timestamp).toLocaleString()}</p>
                                    </div>
                                </div>
                                <div className="flex space-x-2">
                                     {selectedNotification.status === NotificationStatus.Unread ? (
                                        <button onClick={() => updateNotificationStatus(selectedNotification.id, NotificationStatus.Read)} title="Mark as Read" className="p-2 text-green-400 hover:text-green-300"><CheckCircleIcon/></button>
                                     ) : (
                                        <button onClick={() => updateNotificationStatus(selectedNotification.id, NotificationStatus.Unread)} title="Mark as Unread" className="p-2 text-yellow-400 hover:text-yellow-300"><EyeSlashIcon/></button>
                                     )}
                                </div>
                             </div>
                        </div>
                        <div className="flex-1 p-6 overflow-y-auto">
                            <p className="text-kwanzub-lighter whitespace-pre-wrap">{selectedNotification.content}</p>
                            {selectedNotification.relatedEntity && (
                                <div className="mt-6 border-t border-gray-700 pt-4">
                                    <button onClick={handleRelatedEntityClick} className="text-kwanzub-primary hover:underline">
                                        View related {selectedNotification.relatedEntity.type}: {selectedNotification.relatedEntity.displayText}
                                    </button>
                                </div>
                            )}
                        </div>
                    </>
                ) : (
                    <div className="flex-1 flex items-center justify-center text-kwanzub-light">
                        Select a notification to view details.
                    </div>
                )}
            </div>
        </div>
    );
};

const FilterChip: React.FC<{active: boolean; onClick: () => void; children: React.ReactNode}> = ({ active, onClick, children }) => (
    <button onClick={onClick} className={`px-3 py-1 text-xs rounded-full ${active ? 'bg-kwanzub-primary text-white font-semibold' : 'bg-gray-700 text-kwanzub-light hover:bg-gray-600'}`}>
        {children}
    </button>
);


export default NotificationCenter;