
import React, { useState, useMemo } from 'react';
import { Store, Product, Transaction, AuditLog } from '../types';
import { useMockData } from '../hooks/useMockData';
import Modal from './Modal';
import { useLocale } from '../context/LocaleContext';
import ChartComponent from './ChartComponent';
import { BanknotesIcon, CubeIcon, DocumentTextIcon, HomeIcon } from './Icons';

interface StoreDetailModalProps {
    store: Store;
    onClose: () => void;
}

type Tab = 'summary' | 'products' | 'financials' | 'logs';

const StoreDetailModal: React.FC<StoreDetailModalProps> = ({ store, onClose }) => {
    const { products, transactions, auditLogs } = useMockData();
    const [activeTab, setActiveTab] = useState<Tab>('summary');
    const { t } = useLocale();

    const storeProducts = products.filter(p => p.supplierId === store.supplierId);
    const storeTransactions = transactions.filter(t => t.supplierId === store.supplierId);
    const storeLogs = auditLogs.filter(log => log.entityId === store.id || log.entityId === store.supplierId);
    const monthlySalesData = useMemo(() => {
        const salesByMonth: Record<string, number> = {};
        storeTransactions.forEach(t => {
            const month = new Date(t.date).toLocaleString('default', { month: 'short' });
            if (!salesByMonth[month]) salesByMonth[month] = 0;
            salesByMonth[month] += t.amount;
        });
        return Object.entries(salesByMonth).map(([name, revenue]) => ({ name, revenue, sales: 0, orders: 0, stores:0, avgTicket:0, suppliers:0 }));
    }, [storeTransactions]);


    const formatCurrency = (value: number) => `Kz ${value.toLocaleString('pt-AO', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

    const TabButton: React.FC<{tab: Tab, label: string, icon: React.ReactNode}> = ({ tab, label, icon }) => (
        <button onClick={() => setActiveTab(tab)} className={`flex items-center gap-2 ${activeTab === tab ? 'border-kwanzub-primary text-kwanzub-primary' : 'border-transparent text-gray-400 hover:text-gray-200 hover:border-gray-500'} whitespace-nowrap py-3 px-4 border-b-2 font-medium text-sm`}>
            {icon} {label}
        </button>
    );

    const renderContent = () => {
        switch(activeTab) {
            case 'summary':
                return (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-4">
                            <h4 className="text-lg font-semibold text-white">{t('stores.storeDetails')}</h4>
                            <p><strong className="text-kwanzub-light">{t('modals.id')}:</strong> {store.id}</p>
                            <p><strong className="text-kwanzub-light">{t('stores.supplier')}:</strong> {store.supplierName}</p>
                            <p><strong className="text-kwanzub-light">{t('stores.phone')}:</strong> {store.phone}</p>
                            <p><strong className="text-kwanzub-light">{t('stores.category')}:</strong> {store.category}</p>
                            <p><strong className="text-kwanzub-light">{t('stores.createdAt')}:</strong> {new Date(store.createdAt).toLocaleDateString()}</p>
                        </div>
                        <div className="space-y-4">
                            <h4 className="text-lg font-semibold text-white">{t('modals.performance')}</h4>
                            <p><strong className="text-kwanzub-light">{t('stores.totalSales')}:</strong> {formatCurrency(store.totalSales)}</p>
                            <p><strong className="text-kwanzub-light">{t('reputation.avgRating')}:</strong> {store.averageRating.toFixed(1)} / 5</p>
                            <p><strong className="text-kwanzub-light">{t('stores.products')}:</strong> {store.productCount}</p>
                        </div>
                    </div>
                );
            case 'products':
                return <MiniTable<Product> data={storeProducts} columns={[ { header: t('products.productName'), accessor: row => row.name }, { header: t('products.price'), accessor: row => formatCurrency(row.price) }, { header: t('products.stock'), accessor: row => row.stock } ]} />;
            case 'financials':
                return (
                    <div>
                        <h4 className="text-lg font-semibold text-white mb-4">{t('stores.salesHistory')}</h4>
                        <div className="h-64">
                             <ChartComponent data={monthlySalesData} dataKey="revenue" legend1={t('dashboard.revenue')} />
                        </div>
                    </div>
                );
            case 'logs':
                return <MiniTable<AuditLog> 
                    data={storeLogs} 
                    columns={[ 
                        { header: t('auditLogs.timestamp'), accessor: row => new Date(row.timestamp).toLocaleString() }, 
                        { header: t('auditLogs.action'), accessor: row => <code className="px-2 py-1 text-xs font-mono bg-gray-700 rounded">{row.action}</code> },
                        { header: t('auditLogs.details'), accessor: row => row.details }
                    ]} 
                />;
        }
    };
    
    return (
        <Modal onClose={onClose} title={`${t('stores.storeDetails')} - ${store.name}`}>
            <div className="border-b border-gray-700">
                <nav className="-mb-px flex space-x-4 overflow-x-auto" aria-label="Tabs">
                    <TabButton tab="summary" label={t('modals.summaryActions')} icon={<HomeIcon />} />
                    <TabButton tab="products" label={`${t('sidebar.Products')} (${storeProducts.length})`} icon={<CubeIcon />} />
                    <TabButton tab="financials" label={`${t('sidebar.Financials')} (${storeTransactions.length})`} icon={<BanknotesIcon />} />
                    <TabButton tab="logs" label={`${t('modals.activityLogs')} (${storeLogs.length})`} icon={<DocumentTextIcon />} />
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

export default StoreDetailModal;
