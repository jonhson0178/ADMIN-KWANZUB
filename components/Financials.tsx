

import React, { useState, useMemo, useEffect } from 'react';
import DataTable from './DataTable';
import { useMockData } from '../hooks/useMockData';
// FIX: Changed import path for HighlightableEntity type to fix module resolution error.
import { Transaction, TransactionStatus, Dispute, DisputeStatus, CommissionSettings, BadgeType, HighlightableEntity } from '../types';
import { BanknotesIcon, NoSymbolIcon, ExclamationTriangleIcon, ArrowPathIcon, ClockIcon, ArrowUturnLeftIcon, SparklesIcon, ReceiptPercentIcon } from './Icons';
import StatCard from './StatCard';
import GlobalDateFilter from './GlobalDateFilter';
import { useLocale } from '../context/LocaleContext';
import FinancialChartComponent from './FinancialChartComponent';

interface FinancialsProps {
  highlightedEntity: HighlightableEntity | null;
  onHighlightComplete: () => void;
}

type ActiveView = 'transactions' | 'disputes' | 'commission';

const Financials: React.FC<FinancialsProps> = ({ highlightedEntity, onHighlightComplete }) => {
  const { 
    transactions, 
    disputes,
    updateTransactionStatus,
    updateDisputeStatus,
    commissionSettings,
    updateCommissionSettings,
    productCategories,
  } = useMockData();
  const { t } = useLocale();

  const [activeView, setActiveView] = useState<ActiveView>('transactions');
  const [dateRange, setDateRange] = useState<{ start: Date; end: Date; label: string }>({
      start: new Date(new Date().setDate(new Date().getDate() - 30)),
      end: new Date(),
      label: 'monthly'
  });

  useEffect(() => {
    if (highlightedEntity && (highlightedEntity.type === 'transaction' || highlightedEntity.type === 'dispute')) {
        const targetView = highlightedEntity.type === 'transaction' ? 'transactions' : 'disputes';
        setActiveView(targetView);

        // A small delay to ensure the tab has rendered before trying to find the row
        setTimeout(() => {
            const row = document.querySelector(`[data-row-id='${highlightedEntity.id}']`);
            if (row) {
                row.scrollIntoView({ behavior: 'smooth', block: 'center' });
                row.classList.add('flash-animation');
                setTimeout(() => {
                    row.classList.remove('flash-animation');
                    onHighlightComplete();
                }, 2000);
            } else {
                onHighlightComplete();
            }
        }, 100);
    }
  }, [highlightedEntity, onHighlightComplete]);

  const filteredTransactions = useMemo(() => transactions.filter(t => {
    const tDate = new Date(t.date);
    return tDate >= dateRange.start && tDate <= dateRange.end;
  }), [transactions, dateRange]);
  
  const filteredDisputes = useMemo(() => disputes.filter(d => {
    const dDate = new Date(d.createdAt);
    return dDate >= dateRange.start && dDate <= dateRange.end;
  }), [disputes, dateRange]);


  const stats = useMemo(() => {
    return {
        totalRevenue: filteredTransactions.filter(t => t.status === TransactionStatus.Paid).reduce((sum, t) => sum + t.amount, 0),
        totalCommission: filteredTransactions.filter(t => t.status === TransactionStatus.Paid).reduce((sum, t) => sum + t.commission, 0),
        pendingPayments: filteredTransactions.filter(t => t.status === TransactionStatus.Pending).reduce((sum, t) => sum + t.amount, 0),
        blockedPayments: filteredTransactions.filter(t => t.status === TransactionStatus.Blocked).reduce((sum, t) => sum + t.amount, 0),
        totalRefunds: filteredTransactions.filter(t => t.status === TransactionStatus.Refunded).reduce((sum, t) => sum + t.amount, 0),
        paidBadgesRevenue: filteredTransactions.filter(t => t.type === 'selo_paid').reduce((sum, t) => sum + t.amount, 0),
        openDisputes: disputes.filter(d => d.status === DisputeStatus.Open || d.status === DisputeStatus.UnderReview).length,
    };
  }, [filteredTransactions, disputes]);

  const revenueVsProfitData = useMemo(() => {
    const dataByDate: Record<string, { revenue: number; profit: number }> = {};
    filteredTransactions.forEach(t => {
      const date = new Date(t.date).toISOString().split('T')[0];
      if (!dataByDate[date]) {
        dataByDate[date] = { revenue: 0, profit: 0 };
      }
      if (t.type === 'sale') {
        dataByDate[date].revenue += t.amount;
        dataByDate[date].profit += t.marketplace_profit;
      } else if (t.type === 'refund') {
        dataByDate[date].revenue -= t.amount;
        dataByDate[date].profit -= t.marketplace_profit;
      }
    });
    return Object.entries(dataByDate)
      .map(([date, values]) => ({ name: date, revenue: values.revenue, profit: values.profit }))
      .sort((a, b) => new Date(a.name).getTime() - new Date(b.name).getTime());
  }, [filteredTransactions]);

  const revenueByBusinessTypeData = useMemo(() => {
    const dataByType: Record<string, number> = {
// FIX: Changed BadgeType enum to string literals as BadgeType does not contain business types.
      'B2B': 0,
      'B2C': 0,
      'C2C': 0,
    };
    filteredTransactions.forEach(t => {
      if (t.type === 'sale') {
        dataByType[t.category_type] = (dataByType[t.category_type] || 0) + t.amount;
      }
    });
    return Object.entries(dataByType).map(([name, value]) => ({ name, value }));
  }, [filteredTransactions]);

  const commissionBySupplierData = useMemo(() => {
    const dataBySupplier: Record<string, { name: string; commission: number }> = {};
    filteredTransactions.forEach(t => {
      if (t.commission > 0) {
        if (!dataBySupplier[t.supplierId]) {
          dataBySupplier[t.supplierId] = { name: t.supplierName, commission: 0 };
        }
        dataBySupplier[t.supplierId].commission += t.commission;
      }
    });
    return Object.values(dataBySupplier)
      .sort((a, b) => b.commission - a.commission)
      .slice(0, 5);
  }, [filteredTransactions]);
  
  const formatCurrency = (value: number) => `Kz ${value.toLocaleString('pt-AO', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

  const TabButton: React.FC<{view: ActiveView, label: string, icon: React.ReactNode}> = ({ view, label, icon }) => (
    <button onClick={() => setActiveView(view)} className={`flex items-center gap-2 ${activeView === view ? 'border-kwanzub-primary text-kwanzub-primary' : 'border-transparent text-gray-400 hover:text-gray-200 hover:border-gray-500'} whitespace-nowrap py-3 px-4 border-b-2 font-medium text-sm`}>
        {icon} {label}
    </button>
  );

  const CommissionManagement = () => {
    const [localCommissions, setLocalCommissions] = useState<CommissionSettings>(commissionSettings);

    useEffect(() => {
        setLocalCommissions(commissionSettings);
    }, [commissionSettings]);

    const handleGlobalChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setLocalCommissions(prev => ({ ...prev, global: value === '' ? 0 : parseFloat(value) }));
    };

    const handleCategoryChange = (category: string, e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setLocalCommissions(prev => ({
            ...prev,
            categories: {
                ...prev.categories,
                [category]: value === '' ? '' : parseFloat(value)
            }
        }));
    };
    
    const handleSave = () => {
        updateCommissionSettings(localCommissions);
    };

    return (
        <div className="bg-kwanzub-dark rounded-lg shadow-lg p-6 max-w-4xl mx-auto">
            <h3 className="text-xl font-semibold text-white mb-4">{t('financials.commissionManagement')}</h3>
            <div className="space-y-6">
                <div>
                    <label htmlFor="global-commission" className="block text-sm font-medium text-kwanzub-light">{t('financials.globalCommission')}</label>
                    <input 
                        type="number" 
                        id="global-commission" 
                        value={localCommissions.global}
                        onChange={handleGlobalChange}
                        className="mt-1 w-full max-w-xs px-3 py-2 bg-gray-700 text-white rounded-md focus:outline-none focus:ring-2 focus:ring-kwanzub-primary" 
                    />
                </div>
                <div className="border-t border-gray-700 pt-4">
                     <h4 className="text-lg font-semibold text-white mb-2">{t('financials.categoryCommissions')}</h4>
                     <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {productCategories.map(category => (
                            <div key={category}>
                                <label htmlFor={`cat-${category}`} className="block text-sm font-medium text-kwanzub-light">{category}</label>
                                <input 
                                    type="number" 
                                    id={`cat-${category}`} 
                                    value={localCommissions.categories[category] ?? ''}
                                    placeholder={`${t('financials.usesGlobal')} (${localCommissions.global}%)`}
                                    onChange={(e) => handleCategoryChange(category, e)}
                                    className="mt-1 w-full px-3 py-2 bg-gray-700 text-white rounded-md focus:outline-none focus:ring-2 focus:ring-kwanzub-primary" 
                                />
                            </div>
                        ))}
                     </div>
                </div>
            </div>
             <div className="mt-6 pt-4 border-t border-gray-700 flex justify-end">
                <button onClick={handleSave} className="px-6 py-2 bg-kwanzub-primary text-white rounded-md hover:bg-kwanzub-primary-hover transition-colors">
                    {t('financials.saveCommissions')}
                </button>
            </div>
        </div>
    );
  };

  const renderContent = () => {
    switch(activeView) {
        case 'transactions':
            return <DataTable<Transaction>
                columns={[
                    { header: t('financials.transactionId'), accessor: (row: Transaction) => row.id.toUpperCase() },
                    { header: t('financials.date'), accessor: (row: Transaction) => row.date },
                    { header: t('financials.supplier'), accessor: (row: Transaction) => row.supplierName },
                    { header: t('financials.amount'), accessor: (row: Transaction) => formatCurrency(row.amount) },
                    { header: t('financials.status'), accessor: (row: Transaction) => row.status },
                     { header: t('financials.actions'), accessor: (row: Transaction) => {
                        if (row.status === TransactionStatus.Pending) {
                             return <div className="flex gap-2">
                                <button onClick={() => updateTransactionStatus(row.id, TransactionStatus.Paid)} className="px-3 py-1 text-xs bg-green-600 hover:bg-green-700 text-white rounded">{t('financials.approve')}</button>
                                <button onClick={() => updateTransactionStatus(row.id, TransactionStatus.Blocked)} className="px-3 py-1 text-xs bg-red-600 hover:bg-red-700 text-white rounded">{t('financials.block')}</button>
                            </div>
                        }
                        if (row.status === TransactionStatus.Blocked) {
                            return <button onClick={() => updateTransactionStatus(row.id, TransactionStatus.Paid)} className="px-3 py-1 text-xs bg-blue-600 hover:bg-blue-700 text-white rounded">{t('financials.unblock')}</button>
                        }
                        return null;
                    }},
                ]}
                data={filteredTransactions}
                title={t('financials.transactions')} exportable={true} />;
        case 'disputes':
            return <DataTable<Dispute>
                columns={[
                    { header: t('financials.disputeId'), accessor: (row: Dispute) => row.id },
                    { header: t('financials.date'), accessor: (row: Dispute) => new Date(row.createdAt).toLocaleDateString() },
                    { header: t('financials.customer'), accessor: (row: Dispute) => row.customerName },
                    { header: t('financials.supplier'), accessor: (row: Dispute) => row.supplierName },
                    { header: t('financials.reason'), accessor: (row: Dispute) => row.reason },
                    { header: t('financials.status'), accessor: (row: Dispute) => row.status },
                    { header: t('financials.actions'), accessor: (row: Dispute) => (
                         <button onClick={() => updateDisputeStatus(row.id, DisputeStatus.UnderReview)} className="px-3 py-1 text-xs bg-purple-600 hover:bg-purple-700 text-white rounded">{t('financials.updateStatus')}</button>
                    )},
                ]}
                data={filteredDisputes}
                title={t('financials.disputes')} exportable={true} />;
        case 'commission':
            return <CommissionManagement />;
        default:
             return <div>Select a view</div>
    }
  }

  return (
    <div className="space-y-6">
        <GlobalDateFilter value={dateRange} onChange={setDateRange} />

        <div className="grid gap-5 [grid-template-columns:repeat(auto-fit,minmax(240px,1fr))]">
            <StatCard title={t('financials.totalRevenue')} value={formatCurrency(stats.totalRevenue)} icon={<BanknotesIcon />} />
            <StatCard title={t('financials.commissionEarned')} value={formatCurrency(stats.totalCommission)} icon={<ReceiptPercentIcon />} />
            <StatCard title={t('financials.pendingPayments')} value={formatCurrency(stats.pendingPayments)} icon={<ClockIcon className="text-yellow-400" />} />
            <StatCard title={t('financials.blockedPayments')} value={formatCurrency(stats.blockedPayments)} icon={<NoSymbolIcon className="text-red-400" />} />
            <StatCard title={t('financials.totalRefunds')} value={formatCurrency(stats.totalRefunds)} icon={<ArrowUturnLeftIcon className="text-gray-400" />} />
            <StatCard title={t('financials.openDisputes')} value={stats.openDisputes.toString()} icon={<ExclamationTriangleIcon />} />
            <StatCard title={t('financials.paidBadgesRevenue')} value={formatCurrency(stats.paidBadgesRevenue)} icon={<SparklesIcon />} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
                 <FinancialChartComponent type="line" data={revenueVsProfitData} title={t('financials.revenueVsProfit')} />
            </div>
            <FinancialChartComponent type="pie" data={revenueByBusinessTypeData} title={t('financials.revenueByBusinessType')} />
            <div className="lg:col-span-3">
                 <FinancialChartComponent type="bar" data={commissionBySupplierData} title={t('financials.commissionBySupplier')} />
            </div>
        </div>

        <div>
            <div className="border-b border-gray-700">
                <nav className="-mb-px flex space-x-4 overflow-x-auto" aria-label="Tabs">
                    <TabButton view="transactions" label={t('financials.transactions')} icon={<BanknotesIcon />} />
                    <TabButton view="disputes" label={t('financials.disputes')} icon={<ExclamationTriangleIcon />} />
                    <TabButton view="commission" label={t('financials.commissionManagement')} icon={<ReceiptPercentIcon />} />
                </nav>
            </div>
            <div className="pt-6">
                {renderContent()}
            </div>
        </div>
    </div>
  );
};

export default Financials;