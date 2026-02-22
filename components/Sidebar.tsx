

import React, { useState } from 'react';
// FIX: Changed import path for Page type to fix module resolution error.
import { Page } from '../types';
import { ShoppingBagIcon, UsersIcon, CurrencyDollarIcon, DocumentTextIcon, HomeIcon, StorefrontIcon, ClipboardListIcon, StarIcon, CogIcon, ShieldCheckIcon, BadgeCheckIcon, ChatBubbleLeftRightIcon, BellIcon, TagIcon, ChartBarIcon, ChevronDownIcon, ShieldExclamationIcon, PuzzlePieceIcon, UserGroupIcon, CreditCardIcon } from './Icons';
import { useLocale } from '../context/LocaleContext';

interface SidebarProps {
  currentPage: Page;
  setCurrentPage: (page: Page) => void;
}

const NavLink: React.FC<{ name: Page; icon: React.ReactNode; currentPage: Page; setCurrentPage: (page: Page) => void; isSubItem?: boolean }> = ({ name, icon, currentPage, setCurrentPage, isSubItem = false }) => {
    const { t } = useLocale();
    const isActive = currentPage === name;
    return (
      <button
        onClick={() => setCurrentPage(name)}
        className={`flex items-center w-full text-sm font-medium text-left rounded-lg transition-colors duration-200 ${isSubItem ? 'px-4 py-2' : 'px-3 py-3'} ${
          isActive
            ? 'bg-kwanzub-primary text-white'
            : 'text-kwanzub-light hover:bg-gray-700 hover:text-white'
        }`}
      >
        <span className="w-6 h-6 mr-3">{icon}</span>
        {t(`sidebar.${name.replace(/\s/g, '')}`)}
      </button>
    );
};

const Accordion: React.FC<{title: string; children: React.ReactNode;}> = ({ title, children }) => {
    const [isOpen, setIsOpen] = useState(true);

    return (
        <div>
            <button onClick={() => setIsOpen(!isOpen)} className="flex items-center justify-between w-full px-3 py-2 text-xs font-semibold tracking-wider text-gray-500 uppercase hover:text-gray-300">
                <span>{title}</span>
                <ChevronDownIcon className={`w-5 h-5 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
            </button>
            {isOpen && <div className="mt-1 space-y-1">{children}</div>}
        </div>
    )
}

const Sidebar: React.FC<SidebarProps> = ({ currentPage, setCurrentPage }) => {
    const { t } = useLocale();

  return (
    <div className="flex flex-col w-64 bg-kwanzub-darker border-r border-gray-700">
      <div className="flex items-center justify-center h-20 border-b border-gray-700">
        <h1 className="text-2xl font-bold text-white">Kwanzub</h1>
      </div>
      <nav className="flex-1 px-4 py-6 space-y-4 overflow-y-auto">
        <Accordion title={t('sidebar.main')}>
            <NavLink name="Dashboard" icon={<HomeIcon />} currentPage={currentPage} setCurrentPage={setCurrentPage} />
            <NavLink name="Notification Center" icon={<BellIcon />} currentPage={currentPage} setCurrentPage={setCurrentPage} />
            <NavLink name="Communication Center" icon={<ChatBubbleLeftRightIcon />} currentPage={currentPage} setCurrentPage={setCurrentPage} />
        </Accordion>
        
        <Accordion title={t('sidebar.management')}>
            <NavLink name="Moderation" icon={<ShieldExclamationIcon />} currentPage={currentPage} setCurrentPage={setCurrentPage} />
            <NavLink name="Marketplace Users" icon={<UsersIcon />} currentPage={currentPage} setCurrentPage={setCurrentPage} />
            <NavLink name="Internal Team" icon={<ShieldCheckIcon />} currentPage={currentPage} setCurrentPage={setCurrentPage} />
            <NavLink name="Permissions" icon={<UserGroupIcon />} currentPage={currentPage} setCurrentPage={setCurrentPage} />
        </Accordion>
        
        <Accordion title={t('sidebar.marketplace')}>
            <NavLink name="Suppliers" icon={<UsersIcon />} currentPage={currentPage} setCurrentPage={setCurrentPage} />
            <NavLink name="Stores" icon={<StorefrontIcon />} currentPage={currentPage} setCurrentPage={setCurrentPage} />
            <NavLink name="Products" icon={<ShoppingBagIcon />} currentPage={currentPage} setCurrentPage={setCurrentPage} />
            <NavLink name="Orders" icon={<ClipboardListIcon />} currentPage={currentPage} setCurrentPage={setCurrentPage} />
            <NavLink name="Financials" icon={<CurrencyDollarIcon />} currentPage={currentPage} setCurrentPage={setCurrentPage} />
            <NavLink name="Reputation" icon={<StarIcon />} currentPage={currentPage} setCurrentPage={setCurrentPage} />
        </Accordion>

        <Accordion title={t('sidebar.monetization')}>
            <NavLink name="Commercial Plans" icon={<CreditCardIcon />} currentPage={currentPage} setCurrentPage={setCurrentPage} />
            <NavLink name="Badge Management" icon={<BadgeCheckIcon />} currentPage={currentPage} setCurrentPage={setCurrentPage} />
            <NavLink name="Paid Verifications" icon={<CurrencyDollarIcon />} currentPage={currentPage} setCurrentPage={setCurrentPage} />
        </Accordion>
        
        <Accordion title={t('sidebar.growth')}>
            <NavLink name="Marketing" icon={<TagIcon />} currentPage={currentPage} setCurrentPage={setCurrentPage} />
        </Accordion>

        <Accordion title={t('sidebar.platform')}>
            <NavLink name="Documents" icon={<DocumentTextIcon />} currentPage={currentPage} setCurrentPage={setCurrentPage} />
            <NavLink name="Audit Logs" icon={<DocumentTextIcon />} currentPage={currentPage} setCurrentPage={setCurrentPage} />
            <NavLink name="Security" icon={<ShieldCheckIcon />} currentPage={currentPage} setCurrentPage={setCurrentPage} />
            <NavLink name="Integrations" icon={<PuzzlePieceIcon />} currentPage={currentPage} setCurrentPage={setCurrentPage} />
            <NavLink name="Settings" icon={<CogIcon />} currentPage={currentPage} setCurrentPage={setCurrentPage} />
        </Accordion>

      </nav>
    </div>
  );
};

export default Sidebar;