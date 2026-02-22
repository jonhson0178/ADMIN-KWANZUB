

import React, { useState } from 'react';
import { useMockData } from '../hooks/useMockData';
import StatCard from './StatCard';
import ChartComponent from './ChartComponent';
import { UsersIcon, ShoppingCartIcon, CurrencyDollarIcon, BanknotesIcon, CheckCircleIcon, CubeIcon, ExclamationTriangleIcon, ShieldExclamationIcon, BellIcon, BadgeCheckIcon } from './Icons';
// FIX: Changed import path for Page and HighlightableEntity types to fix module resolution error.
import { Alert, LoginAttempt, AuditLog, AlertType, Page, HighlightableEntity } from '../types';
import { useLocale } from '../context/LocaleContext';

interface DashboardProps {
  onNavigate: (page: Page, entity: HighlightableEntity | null) => void;
}

const Dashboard: React.FC<DashboardProps> = ({ onNavigate }) => {
  const { stats, monthlyData, alerts, loginAttempts, auditLogs, internalUsers } = useMockData();
  const [activeTab, setActiveTab] = useState<'notifications' | 'logs' | 'logins'>('notifications');
  const { t } = useLocale();

  const formatCurrency = (value: number) => {
    return `Kz ${value.toLocaleString('pt-AO', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };
  
  const handleAlertClick = (alert: Alert) => {
    let page: Page | null = null;
    let entity: HighlightableEntity | null = null;

    switch(alert.type) {
      case AlertType.Payment:
        page = 'Financials';
        entity = { type: 'transaction', id: alert.relatedId };
        break;
      case AlertType.Complaint:
        page = 'Suppliers';
        entity = { type: 'supplier', id: alert.relatedId };
        break;
      case AlertType.Dispute:
        page = 'Financials';
        entity = { type: 'dispute', id: alert.relatedId };
        break;
    }
    if (page) {
      onNavigate(page, entity);
    }
  };
  
  const handleLogClick = (log: AuditLog) => {
    if (!log.entityType || !log.entityId) return;
    let page: Page | null = null;
    let entityType: HighlightableEntity['type'] = 'user';

    switch(log.entityType) {
        case 'order': page = 'Orders'; entityType = 'order'; break;
        case 'product': page = 'Products'; entityType = 'product'; break;
        case 'store': page = 'Stores'; entityType = 'store'; break;
        case 'user': 
            // This could be a supplier or an internal team member.
            // For this mock, we assume it's a marketplace user.
            page = 'Marketplace Users'; 
            entityType = 'user';
            break;
    }
    
    if (page) {
        onNavigate(page, { type: entityType, id: log.entityId });
    }
  };

  const handleLoginAttemptClick = (attempt: LoginAttempt) => {
    const user = internalUsers.find(u => u.name === attempt.userName);
    if(user) {
        onNavigate('Internal Team', { type: 'internalUser', id: user.id });
    }
  };

  const criticalLogs = auditLogs.filter(log => log.isCritical);

  const renderAlertItem = (alert: Alert) => (
    <button onClick={() => handleAlertClick(alert)} key={alert.id} className="w-full text-left flex items-start p-3 hover:bg-gray-700/50 rounded-lg transition-colors">
      <div className="w-8 h-8 text-yellow-400 mr-3 mt-1 flex-shrink-0"><ExclamationTriangleIcon/></div>
      <div>
        <p className="text-sm text-white font-semibold">{alert.type}</p>
        <p className="text-xs text-kwanzub-light">{alert.message}</p>
        <p className="text-xs text-gray-500 mt-1">{new Date(alert.timestamp).toLocaleString()}</p>
      </div>
    </button>
  );

  const renderCriticalLogItem = (log: AuditLog) => (
     <button onClick={() => handleLogClick(log)} key={log.id} className="w-full text-left flex items-start p-3 hover:bg-gray-700/50 rounded-lg transition-colors">
        <div className="w-8 h-8 text-orange-400 mr-3 mt-1 flex-shrink-0"><ShieldExclamationIcon/></div>
        <div>
            <p className="text-sm text-white"><span className="font-semibold">{log.userName}</span> performed action: <code className="text-xs bg-gray-700 p-1 rounded">{log.action}</code></p>
            <p className="text-xs text-kwanzub-light">{log.details}</p>
            <p className="text-xs text-gray-500 mt-1">{new Date(log.timestamp).toLocaleString()}</p>
        </div>
    </button>
  );

  const renderLoginAttemptItem = (attempt: LoginAttempt) => (
     <button onClick={() => handleLoginAttemptClick(attempt)} key={attempt.id} className={`w-full text-left flex items-start p-3 hover:bg-gray-700/50 rounded-lg transition-colors ${attempt.isSuspicious ? 'border-l-2 border-red-500' : ''}`}>
        <div className={`w-8 h-8 ${attempt.isSuspicious ? 'text-red-500' : 'text-green-500'} mr-3 mt-1 flex-shrink-0`}>
          {attempt.isSuspicious ? <ShieldExclamationIcon/> : <CheckCircleIcon/>}
        </div>
        <div>
            <p className="text-sm text-white">Login <span className={attempt.status === 'Success' ? 'text-green-400' : 'text-red-400'}>{attempt.status}</span> for <span className="font-semibold">{attempt.userName}</span></p>
            <p className="text-xs text-kwanzub-light">IP: {attempt.ipAddress}</p>
            <p className="text-xs text-gray-500 mt-1">{new Date(attempt.timestamp).toLocaleString()}</p>
        </div>
    </button>
  );


  return (
    <div className="space-y-6">
      {/* Stat Cards */}
      <div className="flex flex-wrap gap-4">
        <StatCard title={t('dashboard.totalUsers')} value={stats.totalUsers.toString()} icon={<UsersIcon />} onClick={() => onNavigate('Marketplace Users', null)} />
        <StatCard title={t('dashboard.verifiedStores')} value={stats.verifiedStores.toString()} icon={<CheckCircleIcon />} onClick={() => onNavigate('Stores', null)} />
        <StatCard title={t('dashboard.activeProducts')} value={stats.activeProducts.toString()} icon={<CubeIcon />} onClick={() => onNavigate('Products', null)} />
        {/* FIX: Changed 'Verification Badges' to 'Badge Management' to match the Page type. */}
        <StatCard title={t('dashboard.totalBadges')} value={stats.totalBadges.toString()} icon={<BadgeCheckIcon />} onClick={() => onNavigate('Badge Management', null)} />
        <StatCard title={t('dashboard.totalRevenue')} value={formatCurrency(stats.totalRevenue)} icon={<CurrencyDollarIcon />} onClick={() => onNavigate('Financials', null)} />
        <StatCard title={t('dashboard.commissionEarned')} value={formatCurrency(stats.totalCommission)} icon={<BanknotesIcon />} onClick={() => onNavigate('Financials', null)} />
      </div>

      {/* Main Charts */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="p-4 bg-kwanzub-dark rounded-lg shadow-lg">
          <h3 className="text-lg font-semibold text-white">{t('dashboard.revenueAvgTicket')}</h3>
          <ChartComponent data={monthlyData} dataKey="revenue" secondaryDataKey="avgTicket" legend1={t('dashboard.revenue')} legend2={t('dashboard.avgTicket')} />
        </div>
        <div className="p-4 bg-kwanzub-dark rounded-lg shadow-lg">
          <h3 className="text-lg font-semibold text-white">{t('dashboard.supplierGrowth')}</h3>
          <ChartComponent data={monthlyData} dataKey="suppliers" legend1={t('dashboard.suppliers')} />
        </div>
      </div>
      
      {/* Alerts and Critical Info */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Real-time Alerts */}
        <div className="p-4 bg-kwanzub-dark rounded-lg shadow-lg lg:col-span-1">
          <h3 className="text-lg font-semibold text-white flex items-center"><ExclamationTriangleIcon className="mr-2 text-yellow-400"/>{t('dashboard.realTimeAlerts')}</h3>
          <div className="mt-4 space-y-2 max-h-96 overflow-y-auto">
            {alerts.map(renderAlertItem)}
          </div>
        </div>

        {/* Critical Info Panel */}
        <div className="p-4 bg-kwanzub-dark rounded-lg shadow-lg lg:col-span-2">
           <div className="border-b border-gray-700">
                <nav className="-mb-px flex space-x-6" aria-label="Tabs">
                    <button onClick={() => setActiveTab('notifications')} className={`${activeTab === 'notifications' ? 'border-kwanzub-primary text-kwanzub-primary' : 'border-transparent text-gray-400 hover:text-gray-200 hover:border-gray-500'} whitespace-nowrap py-3 px-1 border-b-2 font-medium text-sm`}>
                        {t('dashboard.criticalNotifications')}
                    </button>
                    <button onClick={() => setActiveTab('logs')} className={`${activeTab === 'logs' ? 'border-kwanzub-primary text-kwanzub-primary' : 'border-transparent text-gray-400 hover:text-gray-200 hover:border-gray-500'} whitespace-nowrap py-3 px-1 border-b-2 font-medium text-sm`}>
                        {t('dashboard.criticalLogs')}
                    </button>
                    <button onClick={() => setActiveTab('logins')} className={`${activeTab === 'logins' ? 'border-kwanzub-primary text-kwanzub-primary' : 'border-transparent text-gray-400 hover:text-gray-200 hover:border-gray-500'} whitespace-nowrap py-3 px-1 border-b-2 font-medium text-sm`}>
                        {t('dashboard.suspiciousLogins')}
                    </button>
                </nav>
            </div>
            <div className="mt-4 max-h-96 overflow-y-auto">
                {activeTab === 'notifications' && <div className="space-y-2">{alerts.map(renderAlertItem)}</div>}
                {activeTab === 'logs' && <div className="space-y-2">{criticalLogs.map(renderCriticalLogItem)}</div>}
                {activeTab === 'logins' && <div className="space-y-2">{loginAttempts.map(renderLoginAttemptItem)}</div>}
            </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;