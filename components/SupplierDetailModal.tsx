
import React, { useState } from 'react';
import { Supplier, Product, Document, StatusHistory, SupplierStatus } from '../types';
import { useMockData } from '../hooks/useMockData';
import Modal from './Modal';
import { useLocale } from '../context/LocaleContext';
import { HomeIcon, CubeIcon, DocumentTextIcon, ClockIcon, CheckCircleIcon, NoSymbolIcon } from './Icons';

interface SupplierDetailModalProps {
    supplier: Supplier;
    onClose: () => void;
    onStatusChange: (id: string, status: SupplierStatus) => void;
}

type Tab = 'summary' | 'products' | 'documents' | 'history';

const SupplierDetailModal: React.FC<SupplierDetailModalProps> = ({ supplier, onClose, onStatusChange }) => {
    const { products } = useMockData();
    const [activeTab, setActiveTab] = useState<Tab>('summary');
    const { t } = useLocale();

    const supplierProducts = products.filter(p => p.supplierId === supplier.id);

    const TabButton: React.FC<{tab: Tab, label: string, icon: React.ReactNode}> = ({ tab, label, icon }) => (
        <button onClick={() => setActiveTab(tab)} className={`flex items-center gap-2 ${activeTab === tab ? 'border-kwanzub-primary text-kwanzub-primary' : 'border-transparent text-gray-400 hover:text-gray-200 hover:border-gray-500'} whitespace-nowrap py-3 px-4 border-b-2 font-medium text-sm`}>
            {icon} {label}
        </button>
    );

    const getStatusBadge = (status: SupplierStatus) => {
        const statusKey = `suppliers.${status.toLowerCase() as keyof object}`;
        const statusText = t(statusKey) || status;
        const colorMap = {
            [SupplierStatus.Approved]: 'bg-green-900 text-green-300',
            [SupplierStatus.Pending]: 'bg-yellow-900 text-yellow-300',
            [SupplierStatus.Blocked]: 'bg-red-900 text-red-300'
        };
        return <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${colorMap[status]}`}>{statusText}</span>;
    };


    const renderContent = () => {
        switch(activeTab) {
            case 'summary':
                return (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {/* Column 1: Supplier Details */}
                        <div className="space-y-4">
                            <h4 className="text-lg font-semibold text-white">{t('modals.supplierDetails')}</h4>
                            <p><strong className="text-kwanzub-light">{t('modals.id')}:</strong> {supplier.id}</p>
                            <p><strong className="text-kwanzub-light">{t('stores.storeName')}:</strong> {supplier.storeName}</p>
                            <p><strong className="text-kwanzub-light">{t('modals.email')}:</strong> {supplier.email}</p>
                            <p><strong className="text-kwanzub-light">{t('modals.status')}:</strong> {getStatusBadge(supplier.status)}</p>
                            <p><strong className="text-kwanzub-light">{t('suppliers.joinedDate')}:</strong> {new Date(supplier.joinedDate).toLocaleDateString()}</p>
                        </div>
                        
                        {/* Column 2: Performance Metrics */}
                        <div className="space-y-4">
                            <h4 className="text-lg font-semibold text-white">{t('modals.performance')}</h4>
                            <p><strong className="text-kwanzub-light">{t('reputation.supplierScore')}:</strong> {supplier.supplierScore}/100</p>
                            <p><strong className="text-kwanzub-light">{t('reputation.avgRating')}:</strong> {supplier.averageRating.toFixed(1)} / 5</p>
                            <p><strong className="text-kwanzub-light">{t('reputation.totalReviews')}:</strong> {supplier.reviewCount}</p>
                            <p><strong className="text-kwanzub-light">{t('reputation.unresolvedComplaints')}:</strong> <span className={supplier.unresolvedComplaints > 0 ? 'text-red-400 font-bold' : 'text-green-400'}>{supplier.unresolvedComplaints}</span></p>
                            <p><strong className="text-kwanzub-light">{t('users.totalOrders')}:</strong> {supplier.totalOrders}</p>
                        </div>

                        {/* Column 3: Actions */}
                        <div className="space-y-4">
                            <h4 className="text-lg font-semibold text-white">{t('modals.actions')}</h4>
                            <div className="flex flex-col space-y-2">
                               {supplier.status !== SupplierStatus.Approved && <button onClick={() => onStatusChange(supplier.id, SupplierStatus.Approved)} className="flex items-center justify-center px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"><CheckCircleIcon/><span className="ml-2">{t('modals.approveSupplier')}</span></button>}
                               {supplier.status !== SupplierStatus.Blocked && <button onClick={() => onStatusChange(supplier.id, SupplierStatus.Blocked)} className="flex items-center justify-center px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"><NoSymbolIcon/><span className="ml-2">{t('modals.blockSupplier')}</span></button>}
                               {supplier.status === SupplierStatus.Blocked && <button onClick={() => onStatusChange(supplier.id, SupplierStatus.Pending)} className="flex items-center justify-center px-4 py-2 bg-yellow-600 text-white rounded-md hover:bg-yellow-700"><CheckCircleIcon/><span className="ml-2">{t('modals.setToPending')}</span></button>}
                            </div>
                        </div>
                    </div>
                );
            case 'products':
                return <MiniTable<Product> data={supplierProducts} columns={[ { header: t('products.productName'), accessor: row => row.name }, { header: t('products.price'), accessor: row => row.price }, { header: t('products.stock'), accessor: row => row.stock } ]} />;
            case 'documents':
                 return <MiniTable<Document> data={supplier.documents} columns={[ { header: t('documents.documentName'), accessor: row => row.name }, { header: t('documents.submittedDate'), accessor: row => row.submittedDate }, { header: t('documents.status'), accessor: row => row.status } ]} />;
            case 'history':
                return <MiniTable<StatusHistory & {id: string}> 
                    data={supplier.statusHistory.map((h, i) => ({...h, id: `${supplier.id}-hist-${i}`})).reverse()} 
                    columns={[ 
                        { header: t('modals.status'), accessor: row => getStatusBadge(row.status) }, 
                        { header: t('modals.changedAt'), accessor: row => new Date(row.timestamp).toLocaleString() }, 
                        { header: t('modals.changedBy'), accessor: row => row.changedBy } 
                    ]} 
                />;
        }
    };

    return (
        <Modal onClose={onClose} title={`${t('modals.supplierDetails')}: ${supplier.name}`}>
             <div className="border-b border-gray-700">
                <nav className="-mb-px flex space-x-4 overflow-x-auto" aria-label="Tabs">
                    <TabButton tab="summary" label={t('modals.summaryActions')} icon={<HomeIcon />} />
                    <TabButton tab="products" label={`${t('sidebar.Products')} (${supplierProducts.length})`} icon={<CubeIcon />} />
                    <TabButton tab="documents" label={`${t('sidebar.Documents')} (${supplier.documents.length})`} icon={<DocumentTextIcon />} />
                    <TabButton tab="history" label={t('modals.statusHistory')} icon={<ClockIcon />} />
                </nav>
            </div>
            <div className="pt-6">
                {renderContent()}
            </div>
        </Modal>
    );
};

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

export default SupplierDetailModal;
