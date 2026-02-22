

import React, { useState } from 'react';
import { useLocale } from '../context/LocaleContext';
import StatCard from './StatCard';
import { useMockData } from '../hooks/useMockData';
// FIX: Import missing icon components
import { LockClosedIcon, ShieldExclamationIcon, UsersIcon, GlobeAltIcon, ExclamationTriangleIcon, CodeBracketIcon, KeyIcon, ScaleIcon, DocumentTextIcon, ShieldCheckIcon, BellAlertIcon } from './Icons';
// Import sub-components (assuming they will be created in a 'security' subfolder)
// import AccessControl from './security/AccessControl';
// import AuthenticationSettings from './security/AuthenticationSettings';
// import ActiveSessions from './security/ActiveSessions';
// import SecurityActivityLogs from './security/SecurityActivityLogs';
import IpMonitoring from './IpMonitoring';
// import PasswordPolicy from './security/PasswordPolicy';
// import ApiSecurity from './security/ApiSecurity';
// import AntiFraud from './security/AntiFraud';
// import Compliance from './security/Compliance';
// import SecurityAlerts from './security/SecurityAlerts';

type SecurityTab = 
    | 'accessControl' 
    | 'authentication' 
    | 'sessions' 
    | 'activityLogs' 
    | 'ipMonitoring' 
    | 'passwordPolicy' 
    | 'apiSecurity' 
    | 'antiFraud' 
    | 'compliance' 
    | 'securityAlerts';

const Security: React.FC = () => {
    const { t } = useLocale();
    const { securityStats } = useMockData();
    const [activeTab, setActiveTab] = useState<SecurityTab>('accessControl');
    
    const TabButton: React.FC<{tab: SecurityTab, label: string, icon: React.ReactNode}> = ({ tab, label, icon }) => (
        <button 
            onClick={() => setActiveTab(tab)} 
            className={`flex items-center gap-2 whitespace-nowrap py-3 px-4 border-b-2 font-medium text-sm transition-colors ${
                activeTab === tab 
                ? 'border-kwanzub-primary text-kwanzub-primary' 
                : 'border-transparent text-gray-400 hover:text-gray-200 hover:border-gray-500'
            }`}
        >
            {icon} {label}
        </button>
    );
    
    const renderContent = () => {
        // This is where sub-components will be rendered.
        // For now, it's a placeholder.
        const components: Record<SecurityTab, React.ReactNode> = {
            accessControl: <div className="p-6 bg-kwanzub-dark rounded-lg">Access Control (RBAC) settings will be here.</div>,
            authentication: <div className="p-6 bg-kwanzub-dark rounded-lg">Authentication settings (2FA, etc.) will be here.</div>,
            sessions: <div className="p-6 bg-kwanzub-dark rounded-lg">Active sessions list will be here.</div>,
            activityLogs: <div className="p-6 bg-kwanzub-dark rounded-lg">Detailed security activity logs will be here.</div>,
            ipMonitoring: <IpMonitoring />,
            passwordPolicy: <div className="p-6 bg-kwanzub-dark rounded-lg">Password policy configuration will be here.</div>,
            apiSecurity: <div className="p-6 bg-kwanzub-dark rounded-lg">API key management will be here.</div>,
            antiFraud: <div className="p-6 bg-kwanzub-dark rounded-lg">Anti-fraud dashboard and settings will be here.</div>,
            compliance: <div className="p-6 bg-kwanzub-dark rounded-lg">Compliance (LGPD/GDPR) tools will be here.</div>,
            securityAlerts: <div className="p-6 bg-kwanzub-dark rounded-lg">Security alert configuration will be here.</div>,
        };
        return components[activeTab] || null;
    };

    return (
        <div className="space-y-6">
            <h2 className="text-2xl font-bold text-white">{t('security.title')}</h2>

            {/* Stat Cards */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                <StatCard title={t('security.failedLogins')} value={securityStats.failedLogins.toString()} icon={<ExclamationTriangleIcon />} />
                <StatCard title={t('security.usersBlocked')} value={securityStats.usersBlocked.toString()} icon={<UsersIcon />} />
                <StatCard title={t('security.activeSessions')} value={securityStats.activeSessions.toString()} icon={<GlobeAltIcon />} />
                <StatCard title={t('security.criticalEvents')} value={securityStats.criticalEvents.toString()} icon={<ShieldExclamationIcon />} />
                <StatCard title={t('security.ipsBlocked')} value={securityStats.ipsBlocked.toString()} icon={<GlobeAltIcon />} />
                <StatCard title={t('security.avgRiskScore')} value={`${securityStats.avgRiskScore.toFixed(1)}/10`} icon={<ShieldCheckIcon />} />
            </div>

            {/* Tabs */}
            <div className="border-b border-gray-700 overflow-x-auto">
                <nav className="-mb-px flex space-x-4">
                    <TabButton tab="accessControl" label={t('security.accessControl')} icon={<UsersIcon />} />
                    <TabButton tab="authentication" label={t('security.authentication')} icon={<KeyIcon />} />
                    <TabButton tab="sessions" label={t('security.sessions')} icon={<GlobeAltIcon />} />
                    <TabButton tab="activityLogs" label={t('security.activityLogs')} icon={<DocumentTextIcon />} />
                    <TabButton tab="ipMonitoring" label={t('security.ipMonitoring')} icon={<GlobeAltIcon />} />
                    <TabButton tab="passwordPolicy" label={t('security.passwordPolicy')} icon={<LockClosedIcon />} />
                    <TabButton tab="apiSecurity" label={t('security.apiSecurity')} icon={<CodeBracketIcon />} />
                    <TabButton tab="antiFraud" label={t('security.antiFraud')} icon={<ShieldExclamationIcon />} />
                    <TabButton tab="compliance" label={t('security.compliance')} icon={<ScaleIcon />} />
                    <TabButton tab="securityAlerts" label={t('security.securityAlerts')} icon={<BellAlertIcon />} />
                </nav>
            </div>
            
            {/* Tab Content */}
            <div>
                {renderContent()}
            </div>
        </div>
    );
};

export default Security;
