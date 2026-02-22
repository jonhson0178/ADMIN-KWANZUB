

import React, { useState, useMemo } from 'react';
import DataTable from './DataTable';
import StatCard from './StatCard';
import { useMockData } from '../hooks/useMockData';
import { Supplier, PaidVerification, PaidVerificationPlan, BadgeType, PaymentStatus } from '../types';
import Modal from './Modal';
import { CurrencyDollarIcon, BadgeCheckIcon, ExclamationTriangleIcon, TrashIcon, ArrowPathIcon } from './Icons';
import { useLocale } from '../context/LocaleContext';

const PaidVerifications: React.FC = () => {
    const { suppliers, stats, assignPaidVerification, renewPaidVerification, removePaidVerification } = useMockData();
    const { t } = useLocale();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedSupplier, setSelectedSupplier] = useState<Supplier | null>(null);
    
    // Filters
    const [planFilter, setPlanFilter] = useState<PaidVerificationPlan | 'All'>('All');
// FIX: Changed BadgeType to string as it doesn't contain business types.
    const [businessTypeFilter, setBusinessTypeFilter] = useState<string | 'All'>('All');
    const [paymentStatusFilter, setPaymentStatusFilter] = useState<PaymentStatus | 'All'>('All');

    // State for new badge assignment
// FIX: Changed BadgeType to the correct string literal union type for business type.
    const [newPlan, setNewPlan] = useState<PaidVerificationPlan>(PaidVerificationPlan.BasicPaid);
    const [newBusinessType, setNewBusinessType] = useState<'B2B' | 'B2C' | 'C2C'>('B2B');

    const handleOpenModal = (supplier: Supplier) => {
        setSelectedSupplier(supplier);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setSelectedSupplier(null);
    };

    const handleAssign = () => {
        if (selectedSupplier) {
            assignPaidVerification(selectedSupplier.id, newPlan, newBusinessType);
        }
    };
    
    const formatCurrency = (value: number) => `Kz ${value.toLocaleString('pt-AO', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

    const filteredSuppliers = useMemo(() => {
        return suppliers.filter(supplier => {
            if (planFilter === 'All' && businessTypeFilter === 'All' && paymentStatusFilter === 'All') {
                return true;
            }
            return supplier.paidVerifications.some(pv => 
                (planFilter === 'All' || pv.plan === planFilter) &&
                (businessTypeFilter === 'All' || pv.businessType === businessTypeFilter) &&
                (paymentStatusFilter === 'All' || pv.paymentStatus === paymentStatusFilter)
            );
        });
    }, [suppliers, planFilter, businessTypeFilter, paymentStatusFilter]);

    const getPaymentStatusBadge = (status: PaymentStatus) => {
        switch (status) {
            case PaymentStatus.Paid: return <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-900 text-green-300">{status}</span>;
            case PaymentStatus.Pending: return <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-900 text-yellow-300">{status}</span>;
            case PaymentStatus.Expired: return <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-900 text-red-300">{status}</span>;
        }
    };
    
    const columns = [
        { header: t('paidVerifications.supplier'), accessor: (row: Supplier) => <div><div className="font-medium text-white">{row.name}</div><div className="text-kwanzub-light text-sm">{row.storeName}</div></div> },
        { header: t('paidVerifications.paidBadge'), accessor: (row: Supplier) => (
            <div className="flex flex-col gap-1">
                {row.paidVerifications.length > 0 ? row.paidVerifications.map(pv => (
                    <span key={pv.id} className={`text-xs font-semibold ${pv.plan === PaidVerificationPlan.PremiumGoldPaid ? 'text-yellow-400' : 'text-green-400'}`}>{pv.plan}</span>
                )) : <span className="text-kwanzub-light italic">None</span>}
            </div>
        )},
        { header: t('paidVerifications.businessType'), accessor: (row: Supplier) => (
            <div className="flex flex-col gap-1">
                {row.paidVerifications.length > 0 ? row.paidVerifications.map(pv => <span key={pv.id} className="text-xs">{pv.businessType}</span>) : '-'}
            </div>
        )},
        { header: t('paidVerifications.paymentStatus'), accessor: (row: Supplier) => (
            <div className="flex flex-col gap-1">
                {row.paidVerifications.length > 0 ? row.paidVerifications.map(pv => <div key={pv.id}>{getPaymentStatusBadge(pv.paymentStatus)}</div>) : '-'}
            </div>
        )},
        { header: t('paidVerifications.expiresAt'), accessor: (row: Supplier) => (
            <div className="flex flex-col gap-1">
                {row.paidVerifications.length > 0 ? row.paidVerifications.map(pv => <span key={pv.id} className="text-xs">{new Date(pv.expiresAt).toLocaleDateString()}</span>) : '-'}
            </div>
        )},
        { header: t('paidVerifications.actions'), accessor: (row: Supplier) => <button onClick={() => handleOpenModal(row)} className="px-4 py-2 bg-kwanzub-primary text-white text-sm rounded-md hover:bg-kwanzub-primary-hover transition-colors">{t('paidVerifications.manage')}</button> },
    ];

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <StatCard title={t('paidVerifications.activeBadges')} value={stats.activePaidVerifications.toString()} icon={<BadgeCheckIcon />} />
                <StatCard title={t('paidVerifications.expiredBadges')} value={stats.expiredPaidVerifications.toString()} icon={<ExclamationTriangleIcon />} />
                <StatCard title={t('paidVerifications.totalRevenue')} value={formatCurrency(stats.paidVerificationsRevenue)} icon={<CurrencyDollarIcon />} />
            </div>
            
            <div className="bg-kwanzub-dark rounded-lg shadow-lg p-6">
                <div className="flex flex-col md:flex-row justify-between md:items-center mb-4 gap-4">
                    <h2 className="text-xl font-semibold text-white">{t('paidVerifications.title')}</h2>
                    <div className="flex items-center space-x-2">
                        <select value={planFilter} onChange={e => setPlanFilter(e.target.value as any)} className="px-3 py-2 bg-gray-700 text-white rounded-md focus:outline-none focus:ring-2 focus:ring-kwanzub-primary">
                            <option value="All">{t('paidVerifications.allPlans')}</option>
                            <option value={PaidVerificationPlan.BasicPaid}>{PaidVerificationPlan.BasicPaid}</option>
                            <option value={PaidVerificationPlan.PremiumGoldPaid}>{PaidVerificationPlan.PremiumGoldPaid}</option>
                        </select>
                        <select value={businessTypeFilter} onChange={e => setBusinessTypeFilter(e.target.value as any)} className="px-3 py-2 bg-gray-700 text-white rounded-md focus:outline-none focus:ring-2 focus:ring-kwanzub-primary">
                            <option value="All">{t('paidVerifications.allBusinessTypes')}</option>
                            {/* FIX: Changed BadgeType to string literals. */}
                            <option value="B2B">B2B</option>
                            <option value="B2C">B2C</option>
                            <option value="C2C">C2C</option>
                        </select>
                         <select value={paymentStatusFilter} onChange={e => setPaymentStatusFilter(e.target.value as any)} className="px-3 py-2 bg-gray-700 text-white rounded-md focus:outline-none focus:ring-2 focus:ring-kwanzub-primary">
                            <option value="All">{t('paidVerifications.allPaymentStatuses')}</option>
                            <option value={PaymentStatus.Paid}>Paid</option>
                            <option value={PaymentStatus.Pending}>Pending</option>
                            <option value={PaymentStatus.Expired}>Expired</option>
                        </select>
                    </div>
                </div>
                 <DataTable<Supplier>
                    columns={columns}
                    data={filteredSuppliers}

                    title=""
                    exportable={true}
                />
            </div>

            {isModalOpen && selectedSupplier && (
                <Modal onClose={handleCloseModal} title={`${t('paidVerifications.manageFor')} ${selectedSupplier.name}`}>
                    <div className="space-y-6">
                        {/* Existing Badges */}
                        <div className="space-y-3">
                            {selectedSupplier.paidVerifications.map(pv => (
                                <div key={pv.id} className="flex items-center justify-between p-3 bg-gray-700/50 rounded-lg">
                                    <div>
                                        <p className={`font-semibold ${pv.plan === PaidVerificationPlan.PremiumGoldPaid ? 'text-yellow-400' : 'text-green-400'}`}>{pv.plan} ({pv.businessType})</p>
                                        <p className="text-sm text-kwanzub-light">Expires: {new Date(pv.expiresAt).toLocaleDateString()} - Status: {getPaymentStatusBadge(pv.paymentStatus)}</p>
                                    </div>
                                    <div className="flex space-x-2">
                                        <button onClick={() => renewPaidVerification(pv.id)} className="p-2 text-blue-400 hover:text-blue-200" title={t('paidVerifications.renew')}><ArrowPathIcon /></button>
                                        <button onClick={() => removePaidVerification(pv.id)} className="p-2 text-red-400 hover:text-red-200" title={t('paidVerifications.remove')}><TrashIcon /></button>
                                    </div>
                                </div>
                            ))}
                            {selectedSupplier.paidVerifications.length === 0 && <p className="text-kwanzub-light text-center italic">{t('badges.noBadges')}</p>}
                        </div>

                        {/* Assign New Badge */}
                        <div className="border-t border-gray-700 pt-4 space-y-3">
                             <h4 className="text-lg font-semibold text-white">{t('paidVerifications.assignNew')}</h4>
                             <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                 <div className="md:col-span-2">
                                     <label className="block text-sm font-medium text-kwanzub-light">{t('paidVerifications.plan')}</label>
                                     <select value={newPlan} onChange={e => setNewPlan(e.target.value as PaidVerificationPlan)} className="mt-1 w-full px-3 py-2 bg-gray-700 text-white rounded-md focus:outline-none focus:ring-2 focus:ring-kwanzub-primary">
                                        <option value={PaidVerificationPlan.BasicPaid}>{PaidVerificationPlan.BasicPaid}</option>
                                        <option value={PaidVerificationPlan.PremiumGoldPaid}>{PaidVerificationPlan.PremiumGoldPaid}</option>
                                    </select>
                                 </div>
                                  <div>
                                     <label className="block text-sm font-medium text-kwanzub-light">{t('paidVerifications.businessType')}</label>
                                     {/* FIX: Changed BadgeType to string literals and corrected the type assertion. */}
                                     <select value={newBusinessType} onChange={e => setNewBusinessType(e.target.value as 'B2B' | 'B2C' | 'C2C')} className="mt-1 w-full px-3 py-2 bg-gray-700 text-white rounded-md focus:outline-none focus:ring-2 focus:ring-kwanzub-primary">
                                        <option value="B2B">B2B</option>
                                        <option value="B2C">B2C</option>
                                        <option value="C2C">C2C</option>
                                    </select>
                                 </div>
                             </div>
                             <button onClick={handleAssign} className="w-full px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors">{t('paidVerifications.assign')}</button>
                        </div>
                    </div>
                </Modal>
            )}
        </div>
    );
};

export default PaidVerifications;
