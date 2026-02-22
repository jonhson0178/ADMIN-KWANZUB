
import React, { useState } from 'react';
import { useLocale } from '../context/LocaleContext';
import { PuzzlePieceIcon, CreditCardIcon, TruckIcon, ServerStackIcon, CodeBracketIcon, MegaphoneIcon, ChatBubbleLeftRightIcon, StorefrontIcon } from './Icons';
import Modal from './Modal';

// Mock data, this would come from a backend or config file
const initialIntegrations = [
    { id: 'stripe', name: 'Stripe', logo: 'https://cdn.worldvectorlogo.com/logos/stripe-4.svg', category: 'payment', active: true, description: 'Online payment processing for internet businesses.' },
    { id: 'paypal', name: 'PayPal', logo: 'https://cdn.worldvectorlogo.com/logos/paypal-3.svg', category: 'payment', active: false, description: 'Global online payment system.' },
    { id: 'dhl', name: 'DHL', logo: 'https://cdn.worldvectorlogo.com/logos/dhl-1.svg', category: 'logistics', active: true, description: 'International shipping & courier delivery.' },
    { id: 'sap', name: 'SAP', logo: 'https://cdn.worldvectorlogo.com/logos/sap-logo-svg.svg', category: 'erp', active: false, description: 'ERP & business management software.' },
    { id: 'google-analytics', name: 'Google Analytics', logo: 'https://cdn.worldvectorlogo.com/logos/google-analytics-3.svg', category: 'marketing', active: true, description: 'Web analytics service.' },
    { id: 'mailchimp', name: 'Mailchimp', logo: 'https://cdn.worldvectorlogo.com/logos/mailchimp-freddie-2.svg', category: 'marketing', active: false, description: 'Email marketing and automation.' },
    { id: 'twilio', name: 'Twilio', logo: 'https://cdn.worldvectorlogo.com/logos/twilio-2.svg', category: 'communication', active: false, description: 'APIs for SMS, voice, and messaging.' },
];

type Integration = typeof initialIntegrations[0];
type IntegrationCategory = 'payment' | 'logistics' | 'erp' | 'api' | 'marketing' | 'communication' | 'marketplace';

const IntegrationCard: React.FC<{integration: Integration, onConfigure: () => void, onToggle: (active: boolean) => void}> = ({ integration, onConfigure, onToggle }) => {
    return (
        <div className="bg-kwanzub-dark rounded-lg shadow-lg p-6 flex flex-col justify-between">
            <div>
                <div className="flex items-center justify-between mb-4">
                    <img src={integration.logo} alt={`${integration.name} logo`} className="h-8 w-auto bg-white p-1 rounded"/>
                    <label className="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" checked={integration.active} onChange={(e) => onToggle(e.target.checked)} className="sr-only peer" />
                        <div className="w-11 h-6 bg-gray-600 rounded-full peer peer-focus:ring-4 peer-focus:ring-blue-800 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-kwanzub-primary"></div>
                    </label>
                </div>
                <h4 className="text-lg font-semibold text-white">{integration.name}</h4>
                <p className="text-sm text-kwanzub-light mt-1">{integration.description}</p>
            </div>
            <button onClick={onConfigure} className="mt-6 w-full px-4 py-2 bg-gray-700 text-white rounded-md hover:bg-gray-600 transition-colors">
                Configure
            </button>
        </div>
    );
};

const Integrations: React.FC = () => {
    const { t } = useLocale();
    const [activeTab, setActiveTab] = useState<IntegrationCategory>('payment');
    const [integrations, setIntegrations] = useState(initialIntegrations);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedIntegration, setSelectedIntegration] = useState<Integration | null>(null);

    const handleToggle = (id: string, active: boolean) => {
        setIntegrations(prev => prev.map(i => i.id === id ? { ...i, active } : i));
    };

    const handleConfigure = (integration: Integration) => {
        setSelectedIntegration(integration);
        setIsModalOpen(true);
    };

    const tabs: { id: IntegrationCategory; label: string; icon: React.ReactNode }[] = [
        { id: 'payment', label: t('integrations.payment'), icon: <CreditCardIcon/> },
        { id: 'logistics', label: t('integrations.logistics'), icon: <TruckIcon/> },
        { id: 'erp', label: t('integrations.erp'), icon: <ServerStackIcon/> },
        { id: 'api', label: t('integrations.api'), icon: <CodeBracketIcon/> },
        { id: 'marketing', label: t('integrations.marketing'), icon: <MegaphoneIcon/> },
        { id: 'communication', label: t('integrations.communication'), icon: <ChatBubbleLeftRightIcon/> },
        { id: 'marketplace', label: t('integrations.marketplace'), icon: <StorefrontIcon/> },
    ];
    
    const TabButton: React.FC<{tab: IntegrationCategory, label: string, icon: React.ReactNode}> = ({ tab, label, icon }) => (
        <button onClick={() => setActiveTab(tab)} className={`flex items-center gap-2 ${activeTab === tab ? 'border-kwanzub-primary text-kwanzub-primary' : 'border-transparent text-gray-400 hover:text-gray-200 hover:border-gray-500'} whitespace-nowrap py-3 px-4 border-b-2 font-medium text-sm`}>
            {icon} {label}
        </button>
    );

    const renderContent = () => {
        const filtered = integrations.filter(i => i.category === activeTab);
        if (activeTab === 'api') {
            return <div className="p-6 bg-kwanzub-dark rounded-lg">API & Webhooks management UI will be here.</div>;
        }
        return (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filtered.map(int => (
                    <IntegrationCard key={int.id} integration={int} onConfigure={() => handleConfigure(int)} onToggle={(active) => handleToggle(int.id, active)} />
                ))}
            </div>
        );
    }
    
    return (
        <div className="space-y-6">
            <h2 className="text-2xl font-bold text-white flex items-center gap-3"><PuzzlePieceIcon/> {t('integrations.title')}</h2>
            <div className="border-b border-gray-700 overflow-x-auto">
                <nav className="-mb-px flex space-x-4">
                    {tabs.map(tab => <TabButton key={tab.id} tab={tab.id} label={tab.label} icon={tab.icon} />)}
                </nav>
            </div>
            <div>{renderContent()}</div>

            {isModalOpen && selectedIntegration && (
                <Modal onClose={() => setIsModalOpen(false)} title={`Configure ${selectedIntegration.name}`}>
                    <form className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-kwanzub-light">API Key</label>
                            <input type="text" defaultValue="pk_test_************************" className="mt-1 w-full px-3 py-2 bg-gray-700 text-white rounded-md focus:outline-none focus:ring-2 focus:ring-kwanzub-primary" />
                        </div>
                         <div>
                            <label className="block text-sm font-medium text-kwanzub-light">Secret Key</label>
                            <input type="password" defaultValue="sk_test_123456789" className="mt-1 w-full px-3 py-2 bg-gray-700 text-white rounded-md focus:outline-none focus:ring-2 focus:ring-kwanzub-primary" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-kwanzub-light">Webhook URL</label>
                            <input type="text" readOnly value={`https://api.kwanzub.com/webhooks/${selectedIntegration.id}`} className="mt-1 w-full px-3 py-2 bg-gray-800 text-gray-400 rounded-md cursor-not-allowed" />
                        </div>
                        <div className="flex items-center">
                            <input id="sandbox-mode" type="checkbox" className="h-4 w-4 bg-gray-700 border-gray-600 rounded text-kwanzub-primary focus:ring-kwanzub-primary" />
                            <label htmlFor="sandbox-mode" className="ml-2 block text-sm text-kwanzub-light">Enable Sandbox/Test Mode</label>
                        </div>
                         <div className="flex justify-end pt-4 border-t border-gray-700 space-x-3">
                            <button type="button" className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">Test Connection</button>
                            <button type="submit" className="px-6 py-2 bg-kwanzub-primary text-white rounded-md hover:bg-kwanzub-primary-hover">Save</button>
                        </div>
                    </form>
                </Modal>
            )}
        </div>
    );
};

export default Integrations;
