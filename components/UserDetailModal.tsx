
import React, { useState } from 'react';
import { MarketplaceUser, MarketplaceUserStatus, MarketplaceUserType, Order, Transaction, AuditLog } from '../types';
import { NoSymbolIcon, CheckCircleIcon } from './Icons';
import Modal from './Modal';
import { useLocale } from '../context/LocaleContext';

interface UserDetailModalProps {
    user: MarketplaceUser;
    onClose: () => void;
    onStatusChange: (id: string, status: MarketplaceUserStatus) => void;
}

type Tab = 'summary' | 'orders' | 'financials' | 'logs';

const UserDetailModal: React.FC<UserDetailModalProps> = ({ user, onClose, onStatusChange }) => {
    const [activeTab, setActiveTab] = useState<Tab>('summary');
    const { t } = useLocale();

    const formatCurrency = (value: number) => `Kz ${value.toLocaleString('pt-AO', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

    const getTypeBadge = (type: MarketplaceUserType) => {
        return type === MarketplaceUserType.Supplier 
            ? <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-900 text-blue-300">{t('users.supplier')}</span>
            : <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-purple-900 text-purple-300">{t('users.buyer')}</span>;
    };
    
    const getStatusBadge = (status: MarketplaceUserStatus) => {
        switch (status) {
            case MarketplaceUserStatus.Active: return <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-900 text-green-300">{t('users.active')}</span>;
            case MarketplaceUserStatus.Pending: return <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-900 text-yellow-300">{t('users.pending')}</span>;
            case MarketplaceUserStatus.Suspended: return <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-900 text-red-300">{t('users.suspended')}</span>;
        }
    };

    const TabButton: React.FC<{tab: Tab, label: string}> = ({ tab, label }) => (
        <button onClick={() => setActiveTab(tab)} className={`${activeTab === tab ? 'border-kwanzub-primary text-kwanzub-primary' : 'border-transparent text-gray-400 hover:text-gray-200 hover:border-gray-500'} whitespace-nowrap py-3 px-4 border-b-2 font-medium text-sm`}>
            {label}
        </button>
    );
    
    const renderContent = () => {
        switch(activeTab) {
            case 'summary':
                return (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-4">
                             <h4 className="text-lg font-semibold text-white">{t('modals.userDetails')}</h4>
                             <p><strong className="text-kwanzub-light">{t('modals.id')}:</strong> {user.id}</p>
                             <p><strong className="text-kwanzub-light">{t('modals.email')}:</strong> {user.email}</p>
                             <p><strong className="text-kwanzub-light">{t('modals.type')}:</strong> {getTypeBadge(user.type)}</p>
                             <p><strong className="text-kwanzub-light">{t('modals.status')}:</strong> {getStatusBadge(user.status)}</p>
                             <p><strong className="text-kwanzub-light">{t('modals.memberSince')}:</strong> {new Date(user.createdAt).toLocaleDateString()}</p>
                             <p><strong className="text-kwanzub-light">{t('modals.lastVisit')}:</strong> {new Date(user.lastVisit).toLocaleString()}</p>
                        </div>
                        <div className="space-y-4">
                             <h4 className="text-lg font-semibold text-white">{t('modals.performance')}</h4>
                             <p><strong className="text-kwanzub-light">{t('modals.reputationScore')}:</strong> {user.reputationScore}/100</p>
                             <p><strong className="text-kwanzub-light">{t('modals.totalOrders')}:</strong> {user.totalOrders}</p>
                             <h4 className="text-lg font-semibold text-white pt-4">{t('modals.actions')}</h4>
                             <div className="flex space-x-2">
                                {user.status !== MarketplaceUserStatus.Suspended ? (
                                    <button onClick={() => onStatusChange(user.id, MarketplaceUserStatus.Suspended)} className="flex items-center px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700">
                                        <NoSymbolIcon /> <span className="ml-2">{t('modals.suspendUser')}</span>
                                    </button>
                                ) : (
                                    <button onClick={() => onStatusChange(user.id, MarketplaceUserStatus.Active)} className="flex items-center px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700">
                                        <CheckCircleIcon /> <span className="ml-2">{t('modals.reactivateUser')}</span>
                                    </button>
                                )}
                             </div>
                        </div>
                    </div>
                );
            case 'orders':
                return (
                    <MiniTable<Order>
                        data={user.orderHistory}
                        columns={[
                            { header: t('orders.orderId'), accessor: (row) => row.id.toUpperCase() },
                            { header: t('orders.date'), accessor: (row) => new Date(row.date).toLocaleDateString() },
                            { header: t('orders.total'), accessor: (row) => formatCurrency(row.total) },
                            { header: t('orders.status'), accessor: (row) => row.status },
                        ]}
                    />
                );
            case 'financials':
                 return (
                    <MiniTable<Transaction>
                        data={user.financialHistory}
                        columns={[
                            { header: t('financials.transactionId'), accessor: (row) => row.id },
                            { header: t('financials.date'), accessor: (row) => new Date(row.date).toLocaleDateString() },
                            { header: t('financials.amount'), accessor: (row) => formatCurrency(row.amount) },
                            { header: t('financials.status'), accessor: (row) => row.status },
                        ]}
                    />
                );
            case 'logs':
                return (
                    <MiniTable<AuditLog>
                        data={user.activityLogs}
                        columns={[
                            { header: t('auditLogs.timestamp'), accessor: (row) => new Date(row.timestamp).toLocaleString() },
                            { header: t('auditLogs.action'), accessor: (row) => <code className="px-2 py-1 text-xs font-mono bg-gray-700 rounded">{row.action}</code> },
                            { header: t('auditLogs.details'), accessor: (row) => row.details },
                        ]}
                    />
                );
        }
    }


    return (
        <Modal onClose={onClose} title={user.name}>
            <div className="border-b border-gray-700">
                <nav className="-mb-px flex space-x-4" aria-label="Tabs">
                    <TabButton tab="summary" label={t('modals.summaryActions')} />
                    <TabButton tab="orders" label={`${t('sidebar.Orders')} (${user.orderHistory.length})`} />
                    <TabButton tab="financials" label={`${t('sidebar.Financials')} (${user.financialHistory.length})`} />
                    <TabButton tab="logs" label={`${t('modals.activityLogs')} (${user.activityLogs.length})`} />
                </nav>
            </div>
            <div className="pt-6">
                {renderContent()}
            </div>
        </Modal>
    );
};


// A small, reusable table for the modal content
interface MiniTableProps<T> {
    columns: { header: string; accessor: (row: T) => React.ReactNode }[];
    data: T[];
}
const MiniTable = <T extends { id: string }>({ columns, data }: MiniTableProps<T>) => {
    const { t } = useLocale();
    if (data.length === 0) {
        return <p className="text-kwanzub-light">{t('dataTable.noRecords')}</p>;
    }
    return (
        <div className="overflow-x-auto max-h-96">
            <table className="min-w-full divide-y divide-gray-700">
                <thead className="bg-gray-700/50 sticky top-0">
                    <tr>{columns.map((c, i) => <th key={i} className="px-4 py-2 text-left text-xs font-medium text-kwanzub-light uppercase tracking-wider">{c.header}</th>)}</tr>
                </thead>
                <tbody className="bg-kwanzub-dark divide-y divide-gray-700">
                    {data.map((row) => (
                        <tr key={row.id} className="hover:bg-gray-700/30">
                            {columns.map((col, i) => <td key={i} className="px-4 py-3 whitespace-nowrap text-sm text-kwanzub-lighter">{col.accessor(row)}</td>)}
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default UserDetailModal;
