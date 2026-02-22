import React, { useState, useCallback } from 'react';
import { LocaleProvider } from './context/LocaleContext';

// App-level Types
import { Page, HighlightableEntity } from './types';

// Page Components
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import Dashboard from './components/Dashboard';
import Suppliers from './components/Suppliers';
import Products from './components/Products';
import Orders from './components/Orders';
import OrderDetail from './components/OrderDetail';
import Financials from './components/Financials';
import Reputation from './components/Reputation';
import Documents from './components/Documents';
import AuditLogs from './components/AuditLogs';
import Settings from './components/Settings';
import Users from './components/Users';
import InternalTeam from './components/InternalTeam';
import Stores from './components/Stores';
import BadgeManagement from './components/BadgeManagement';
import PaidVerifications from './components/PaidVerifications';
import CommunicationCenter from './components/CommunicationCenter';
import NotificationCenter from './components/NotificationCenter';
import Marketing from './components/Marketing';
import Moderation from './components/Moderation';
import Security from './components/Security';
import Integrations from './components/Integrations';
import Permissions from './components/Permissions';
import CommercialPlans from './components/CommercialPlans';



const App: React.FC = () => {
  const [currentPage, setCurrentPage] = useState<Page>('Dashboard');
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
  const [highlightedEntity, setHighlightedEntity] = useState<HighlightableEntity | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  const handleSetCurrentPage = useCallback((page: Page) => {
    setCurrentPage(page);
    setSelectedOrderId(null); // Reset order detail view
    setHighlightedEntity(null); // Reset any highlights
  }, []);

  const handleNavigation = useCallback((page: Page, entity: HighlightableEntity | null) => {
    setCurrentPage(page);
    setSelectedOrderId(null);
    setHighlightedEntity(entity);
  }, []);

  const handleHighlightComplete = useCallback(() => {
    setHighlightedEntity(null);
  }, []);
  
  const handleSelectOrder = useCallback((orderId: string) => {
    setSelectedOrderId(orderId);
  }, []);

  const handleSearch = (term: string) => {
    setSearchTerm(term);
  };


  const renderPage = () => {
    if (selectedOrderId) {
      return <OrderDetail orderId={selectedOrderId} onBack={() => setSelectedOrderId(null)} />;
    }

    switch (currentPage) {
      case 'Dashboard':
        return <Dashboard onNavigate={handleNavigation} />;
      case 'Marketplace Users':
        return <Users highlightedEntity={highlightedEntity} onHighlightComplete={handleHighlightComplete} searchTerm={searchTerm} />;
       case 'Internal Team':
        return <InternalTeam highlightedEntity={highlightedEntity} onHighlightComplete={handleHighlightComplete} />;
      case 'Suppliers':
        return <Suppliers highlightedEntity={highlightedEntity} onHighlightComplete={handleHighlightComplete} />;
      case 'Stores':
        return <Stores highlightedEntity={highlightedEntity} onHighlightComplete={handleHighlightComplete} />;
      case 'Products':
        return <Products highlightedEntity={highlightedEntity} onHighlightComplete={handleHighlightComplete} searchTerm={searchTerm} />;
      case 'Orders':
        return <Orders onSelectOrder={handleSelectOrder} highlightedEntity={highlightedEntity} onHighlightComplete={handleHighlightComplete} searchTerm={searchTerm} />;
      case 'Financials':
        return <Financials highlightedEntity={highlightedEntity} onHighlightComplete={handleHighlightComplete} />;
      case 'Reputation':
        return <Reputation />;
      case 'Documents':
        return <Documents />;
      case 'Badge Management':
        return <BadgeManagement />;
      case 'Paid Verifications':
        return <PaidVerifications />;
      case 'Audit Logs':
        return <AuditLogs highlightedEntity={highlightedEntity} onHighlightComplete={handleHighlightComplete} />;
      case 'Settings':
        return <Settings />;
      case 'Communication Center':
        return <CommunicationCenter />;
      case 'Notification Center':
        return <NotificationCenter onNavigate={handleNavigation} />;
      case 'Marketing':
        return <Marketing />;
      case 'Moderation':
        return <Moderation onNavigate={handleNavigation} />;
      case 'Security':
        return <Security />;
      case 'Integrations':
        return <Integrations />;
      case 'Permissions':
        return <Permissions />;
      case 'Commercial Plans':
        return <CommercialPlans />;
      default:
        return <Dashboard onNavigate={handleNavigation} />;
    }
  };

  return (
    <LocaleProvider>
        <div className="flex h-screen bg-kwanzub-darker text-kwanzub-lighter">
            <Sidebar currentPage={currentPage} setCurrentPage={handleSetCurrentPage} />
            <div className="flex-1 flex flex-col overflow-hidden">
                <Header currentPage={currentPage} onNavigate={handleSetCurrentPage} onSearch={handleSearch} />
                <main className="flex-1 overflow-x-hidden overflow-y-auto bg-kwanzub-darker p-6">
                    {renderPage()}
                </main>
            </div>
        </div>
    </LocaleProvider>
  );
};

export default App;
