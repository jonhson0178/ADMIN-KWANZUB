
import React, { useState, useRef, useEffect } from 'react';
// FIX: Changed import path for Page type to fix module resolution error.
import { Page } from '../types';
import { BellIcon, UserCircleIcon, GlobeIcon, ExclamationTriangleIcon, InformationCircleIcon, MagnifyingGlassIcon } from './Icons';
import { useLocale } from '../context/LocaleContext';
import { useMockData } from '../hooks/useMockData';
import { Notification, NotificationPriority } from '../types';

interface HeaderProps {
  currentPage: Page;
  onNavigate: (page: Page) => void;
  onSearch: (term: string) => void;
}

const Header: React.FC<HeaderProps> = ({ currentPage, onNavigate, onSearch }) => {
  const { t, setLocale, locale } = useLocale();
  const { stats, notifications } = useMockData();
  const [isLangDropdownOpen, setIsLangDropdownOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);

  const langDropdownRef = useRef<HTMLDivElement>(null);
  const notificationsDropdownRef = useRef<HTMLDivElement>(null);

  const unreadNotifications = notifications.filter(n => n.status === 'Unread').slice(0, 5);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (langDropdownRef.current && !langDropdownRef.current.contains(event.target as Node)) {
        setIsLangDropdownOpen(false);
      }
      if (notificationsDropdownRef.current && !notificationsDropdownRef.current.contains(event.target as Node)) {
        setIsNotificationsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleLocaleChange = (newLocale: 'pt' | 'en') => {
    setLocale(newLocale);
    setIsLangDropdownOpen(false);
  };
  
  const getNotificationIcon = (priority: NotificationPriority) => {
      switch(priority){
          case NotificationPriority.Critical: return <ExclamationTriangleIcon className="text-red-400"/>
          case NotificationPriority.Alert: return <ExclamationTriangleIcon className="text-yellow-400"/>
          default: return <InformationCircleIcon className="text-blue-400"/>
      }
  }

  return (
    <header className="flex items-center justify-between h-20 px-6 bg-kwanzub-dark border-b border-gray-700">
      <h2 className="text-2xl font-semibold text-white">{t(`pageTitle.${currentPage.replace(/\s/g, '')}`)}</h2>

      <div className="flex-1 flex justify-center px-4">
        <div className="relative w-full max-w-lg">
          <input
            type="text"
            placeholder="Search for products, orders, users..."
            className="w-full bg-kwanzub-dark border border-gray-700 text-white rounded-full py-2 pl-10 pr-4 focus:outline-none focus:ring-2 focus:ring-kwanzub-primary"
            onChange={(e) => onSearch(e.target.value)}
          />
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
          </div>
        </div>
      </div>

      <div className="flex items-center space-x-4">
        <div className="relative" ref={langDropdownRef}>
          <button 
            onClick={() => setIsLangDropdownOpen(!isLangDropdownOpen)}
            className="p-2 text-kwanzub-light rounded-full hover:bg-gray-700 hover:text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-kwanzub-dark focus:ring-white"
          >
            <GlobeIcon />
          </button>
          {isLangDropdownOpen && (
            <div className="absolute right-0 mt-2 w-40 bg-kwanzub-dark border border-gray-700 rounded-md shadow-lg z-20">
              <button 
                onClick={() => handleLocaleChange('pt')} 
                className={`w-full text-left px-4 py-2 text-sm ${locale === 'pt' ? 'text-white bg-kwanzub-primary' : 'text-kwanzub-lighter hover:bg-gray-700'}`}
              >
                Português
              </button>
              <button 
                onClick={() => handleLocaleChange('en')} 
                className={`w-full text-left px-4 py-2 text-sm ${locale === 'en' ? 'text-white bg-kwanzub-primary' : 'text-kwanzub-lighter hover:bg-gray-700'}`}
              >
                English
              </button>
            </div>
          )}
        </div>

        <div className="relative" ref={notificationsDropdownRef}>
            <button onClick={() => setIsNotificationsOpen(!isNotificationsOpen)} className="relative p-2 text-kwanzub-light rounded-full hover:bg-gray-700 hover:text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-kwanzub-dark focus:ring-white">
                <BellIcon />
                {stats.unreadNotifications > 0 && (
                    <span className="absolute top-0 right-0 h-4 w-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">{stats.unreadNotifications}</span>
                )}
            </button>
             {isNotificationsOpen && (
                <div className="absolute right-0 mt-2 w-80 bg-kwanzub-dark border border-gray-700 rounded-md shadow-lg z-20">
                    <div className="p-3 font-semibold text-white border-b border-gray-700">Notifications</div>
                    <div className="max-h-80 overflow-y-auto">
                        {unreadNotifications.length > 0 ? unreadNotifications.map(n => (
                             <div key={n.id} className="p-3 flex items-start hover:bg-gray-700/50 border-b border-gray-700/50">
                                <div className="w-6 h-6 mr-3 mt-1 flex-shrink-0">{getNotificationIcon(n.priority)}</div>
                                <div>
                                    <p className="text-sm font-medium text-white">{n.title}</p>
                                    <p className="text-xs text-kwanzub-light">{n.content.substring(0,50)}...</p>
                                    <p className="text-xs text-gray-500 mt-1">{new Date(n.timestamp).toLocaleString()}</p>
                                </div>
                             </div>
                        )) : <p className="text-sm text-center text-kwanzub-light py-4">No unread notifications</p>}
                    </div>
                    <button onClick={() => { onNavigate('Notification Center'); setIsNotificationsOpen(false); }} className="w-full text-center block px-4 py-2 text-sm text-kwanzub-primary hover:bg-gray-700/50">
                        View All Notifications
                    </button>
                </div>
            )}
        </div>

        <div className="flex items-center p-2 rounded-md">
          <span className="w-10 h-10 text-kwanzub-light">
            <UserCircleIcon />
          </span>
          <div className="ml-3 text-left">
            <p className="text-sm font-medium text-white">{t('header.superAdmin')}</p>
            <p className="text-xs text-kwanzub-light">superadmin@kwanzub.com</p>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;