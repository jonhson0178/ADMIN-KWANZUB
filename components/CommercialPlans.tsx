
import React, { useState, useMemo } from 'react';
import { useMockData } from '../hooks/useMockData';
import { useLocale } from '../context/LocaleContext';
import { Plan, Supplier, SellerSalesStatus } from '../types';
import StatCard from './StatCard';
import { UsersIcon, PencilIcon } from './Icons';
import Modal from './Modal';
import DataTable from './DataTable';

const CommercialPlans: React.FC = () => {
    const { 
        plans, 
        suppliers, 
        updatePlan, 
        updateSupplierPlan, 
        updateSupplierSalesStatus, 
        approveManualExpansion 
    } = useMockData();
    const { t } = useLocale();

    const [isPlanModalOpen, setIsPlanModalOpen] = useState(false);
    const [isLimitModalOpen, setIsLimitModalOpen] = useState(false);
    const [editingPlan, setEditingPlan] = useState<Plan | null>(null);
    const [managingSupplier, setManagingSupplier] = useState<Supplier | null>(null);

    const planStats = useMemo(() => {
        const stats: Record<string, number> = {};
        plans.forEach(plan => {
            stats[plan.id] = suppliers.filter(s => s.planId === plan.id).length;
        });
        return stats;
    }, [suppliers, plans]);

    const handleEditPlan = (plan: Plan) => {
        setEditingPlan(plan);
        setIsPlanModalOpen(true);
    };
    
    const handleManageLimit = (supplier: Supplier) => {
        setManagingSupplier(supplier);
        setIsLimitModalOpen(true);
    }
    
    const formatCurrency = (value: number) => `Kz ${value.toLocaleString('pt-AO', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;

    const getProgressBarColor = (percentage: number) => {
        if (percentage >= 100) return 'bg-red-500';
        if (percentage > 80) return 'bg-yellow-500';
        return 'bg-green-500';
    };

    const supplierColumns = [
        { header: t('commercialPlans.supplier'), accessor: (row: Supplier) => row.name },
        { header: t('commercialPlans.currentPlan'), accessor: (row: Supplier) => (
            <select 
                value={row.planId} 
                onChange={(e) => updateSupplierPlan(row.id, e.target.value)}
                className="bg-gray-700 text-white rounded-md p-1 focus:outline-none focus:ring-1 focus:ring-kwanzub-primary"
            >
                {plans.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
            </select>
        )},
        { header: t('commercialPlans.salesVolume'), accessor: (row: Supplier) => {
            const plan = plans.find(p => p.id === row.planId);
            if (!plan) return 'N/A';
            const limit = row.manualExpansionAmount || plan.monthlyVolumeLimit;
            const percentage = (row.monthlySalesVolume / limit) * 100;
            return (
                <div>
                    <div className="flex justify-between text-xs mb-1">
                        <span>{formatCurrency(row.monthlySalesVolume)}</span>
                        <span className="text-kwanzub-light">{t('commercialPlans.of')} {formatCurrency(limit)}</span>
                    </div>
                    <div className="w-full bg-gray-700 rounded-full h-2.5">
                        <div className={`${getProgressBarColor(percentage)} h-2.5 rounded-full`} style={{ width: `${Math.min(percentage, 100)}%` }}></div>
                    </div>
                </div>
            )
        }},
        { header: t('commercialPlans.salesStatus'), accessor: (row: Supplier) => {
             const isBlocked = row.salesStatus === SellerSalesStatus.Blocked;
             return (
                <button 
                    onClick={() => updateSupplierSalesStatus(row.id, isBlocked ? SellerSalesStatus.Active : SellerSalesStatus.Blocked)}
                    className={`px-3 py-1 text-xs rounded-full ${isBlocked ? 'bg-red-900 text-red-300' : 'bg-green-900 text-green-300'}`}
                >
                    {isBlocked ? t('commercialPlans.blocked') : t('commercialPlans.active')}
                </button>
             )
        }},
        { header: t('commercialPlans.actions'), accessor: (row: Supplier) => {
            const plan = plans.find(p => p.id === row.planId);
            if (plan?.allowsManualExpansion) {
                return <button onClick={() => handleManageLimit(row)} className="px-3 py-1 text-sm bg-kwanzub-primary text-white rounded-md hover:bg-kwanzub-primary-hover">{t('commercialPlans.manageLimit')}</button>
            }
            return null;
        }},
    ];

    return (
        <div className="space-y-8">
            <h2 className="text-2xl font-bold text-white">{t('commercialPlans.title')}</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {plans.map(plan => (
                    <StatCard 
                        key={plan.id}
                        title={`${t('commercialPlans.suppliersOn')} ${plan.name}`}
                        value={planStats[plan.id]?.toString() || '0'}
                        icon={<UsersIcon />}
                    />
                ))}
            </div>

            <div className="bg-kwanzub-dark p-6 rounded-lg shadow-lg">
                <h3 className="text-xl font-semibold text-white mb-4">{t('commercialPlans.planConfiguration')}</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {plans.map(plan => (
                        <div key={plan.id} className="bg-gray-800/50 p-4 rounded-lg">
                            <div className="flex justify-between items-center mb-3">
                                <h4 className="text-lg font-bold text-white">{plan.name}</h4>
                                <button onClick={() => handleEditPlan(plan)} className="p-2 text-blue-400 hover:text-blue-300"><PencilIcon/></button>
                            </div>
                            <div className="space-y-2 text-sm">
                                <p><strong className="text-kwanzub-light">{t('commercialPlans.monthlyVolumeLimit')}:</strong> {formatCurrency(plan.monthlyVolumeLimit)}</p>
                                <p><strong className="text-kwanzub-light">{t('commercialPlans.transactionLimit')}:</strong> {formatCurrency(plan.transactionLimit)}</p>
                                <p><strong className="text-kwanzub-light">{t('commercialPlans.withdrawalLimit')}:</strong> {formatCurrency(plan.withdrawalRequestLimit)}</p>
                                <p><strong className="text-kwanzub-light">{t('commercialPlans.searchWeight')}:</strong> {plan.searchWeight}x</p>
                                <p><strong className="text-kwanzub-light">{t('commercialPlans.allowsManualExpansion')}:</strong> {plan.allowsManualExpansion ? t('commercialPlans.yes') : t('commercialPlans.no')}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            <DataTable<Supplier>
                columns={supplierColumns}
                data={suppliers}

                title={t('commercialPlans.supplierPlanStatus')}
            />

            {isPlanModalOpen && editingPlan && (
                <PlanEditModal 
                    plan={editingPlan} 
                    onClose={() => setIsPlanModalOpen(false)} 
                    onSave={(updated) => {
                        updatePlan(updated);
                        setIsPlanModalOpen(false);
                    }}
                />
            )}
            
            {isLimitModalOpen && managingSupplier && (
                <ManageLimitModal
                    supplier={managingSupplier}
                    plan={plans.find(p => p.id === managingSupplier.planId)!}
                    onClose={() => setIsLimitModalOpen(false)}
                    onSave={(newLimit) => {
                        approveManualExpansion(managingSupplier.id, newLimit);
                        setIsLimitModalOpen(false);
                    }}
                />
            )}
        </div>
    );
};

const PlanEditModal: React.FC<{plan: Plan, onClose: () => void, onSave: (plan: Plan) => void}> = ({ plan, onClose, onSave }) => {
    const { t } = useLocale();
    const [formData, setFormData] = useState(plan);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : Number(value) }));
    };

    return (
        <Modal onClose={onClose} title={`${t('commercialPlans.editCommercialPlan')} - ${plan.name}`}>
            <div className="space-y-4">
                <InputField label={t('commercialPlans.monthlyVolumeLimit')} name="monthlyVolumeLimit" type="number" value={formData.monthlyVolumeLimit} onChange={handleChange}/>
                <InputField label={t('commercialPlans.transactionLimit')} name="transactionLimit" type="number" value={formData.transactionLimit} onChange={handleChange}/>
                <InputField label={t('commercialPlans.withdrawalLimit')} name="withdrawalRequestLimit" type="number" value={formData.withdrawalRequestLimit} onChange={handleChange}/>
                <InputField label={t('commercialPlans.searchWeight')} name="searchWeight" type="number" value={formData.searchWeight} onChange={handleChange}/>
                <div className="flex items-center">
                    <input id="allowsManualExpansion" name="allowsManualExpansion" type="checkbox" checked={formData.allowsManualExpansion} onChange={handleChange} className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"/>
                    <label htmlFor="allowsManualExpansion" className="ml-2 block text-sm text-gray-300">{t('commercialPlans.allowsManualExpansion')}</label>
                </div>
                <div className="flex justify-end pt-4 border-t border-gray-700">
                    <button onClick={() => onSave(formData)} className="px-6 py-2 bg-kwanzub-primary text-white rounded-md hover:bg-kwanzub-primary-hover">{t('commercialPlans.savePlan')}</button>
                </div>
            </div>
        </Modal>
    );
};

const ManageLimitModal: React.FC<{supplier: Supplier, plan: Plan, onClose: () => void, onSave: (newLimit: number) => void}> = ({ supplier, plan, onClose, onSave }) => {
    const { t } = useLocale();
    const currentLimit = supplier.manualExpansionAmount || plan.monthlyVolumeLimit;
    const [newLimit, setNewLimit] = useState(currentLimit);

    return (
         <Modal onClose={onClose} title={`${t('commercialPlans.manageLimitExpansion')} - ${supplier.name}`}>
             <div className="space-y-4">
                <p><strong className="text-kwanzub-light">{t('commercialPlans.currentUsage')}:</strong> {`Kz ${supplier.monthlySalesVolume.toLocaleString()}`}</p>
                <p><strong className="text-kwanzub-light">{t('commercialPlans.currentLimit')}:</strong> {`Kz ${currentLimit.toLocaleString()}`}</p>
                <InputField label={t('commercialPlans.newTotalLimit')} type="number" value={newLimit} onChange={(e: any) => setNewLimit(Number(e.target.value))}/>

                 <div className="flex justify-end pt-4 border-t border-gray-700">
                    <button onClick={() => onSave(newLimit)} className="px-6 py-2 bg-kwanzub-primary text-white rounded-md hover:bg-kwanzub-primary-hover">{t('commercialPlans.approveNewLimit')}</button>
                </div>
            </div>
         </Modal>
    )
};


const InputField: React.FC<React.InputHTMLAttributes<HTMLInputElement> & {label: string}> = ({ label, ...props }) => (
    <div>
        <label htmlFor={props.name} className="block text-sm font-medium text-kwanzub-light">{label}</label>
        <input {...props} id={props.name} className="mt-1 block w-full bg-gray-700 border-gray-600 rounded-md shadow-sm py-2 px-3 text-white focus:outline-none focus:ring-kwanzub-primary focus:border-kwanzub-primary sm:text-sm" />
    </div>
);


export default CommercialPlans;
