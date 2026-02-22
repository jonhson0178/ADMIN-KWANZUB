

import React, { useState, useMemo, useEffect } from 'react';
import DataTable from './DataTable';
import { useMockData } from '../hooks/useMockData';
// FIX: Changed import path for HighlightableEntity type to fix module resolution error.
import { Supplier, SupplierStatus, HighlightableEntity } from '../types';
import { useLocale } from '../context/LocaleContext';
import SupplierDetailModal from './SupplierDetailModal';

interface SuppliersProps {
  highlightedEntity: HighlightableEntity | null;
  onHighlightComplete: () => void;
}

const Suppliers: React.FC<SuppliersProps> = ({ highlightedEntity, onHighlightComplete }) => {
  const { suppliers, updateSupplierStatus } = useMockData();
  const { t } = useLocale();
  const [statusFilter, setStatusFilter] = useState<SupplierStatus | 'All'>('All');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedSupplier, setSelectedSupplier] = useState<Supplier | null>(null);

  useEffect(() => {
    if (highlightedEntity && highlightedEntity.type === 'supplier') {
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
    }
  }, [highlightedEntity, onHighlightComplete]);

  const handleViewDetails = (supplier: Supplier) => {
    setSelectedSupplier(supplier);
    setIsModalOpen(true);
  };
  
  const handleStatusChange = (id: string, status: SupplierStatus) => {
    updateSupplierStatus(id, status);
    // Update local state to show immediate change in modal
    setSelectedSupplier(prev => {
        if (!prev) return null;
        const newHistoryEntry = {
            status,
            timestamp: new Date().toISOString(),
            changedBy: 'Alice Johnson', // Mock admin
        };
        return {
            ...prev,
            status,
            statusHistory: [...prev.statusHistory, newHistoryEntry]
        };
    });
  };

  const filteredData = useMemo(() => {
    if (statusFilter === 'All') {
      return suppliers;
    }
    return suppliers.filter(supplier => supplier.status === statusFilter);
  }, [suppliers, statusFilter]);

  const getStatusBadge = (status: SupplierStatus) => {
    const statusKey = `suppliers.${status.toLowerCase() as keyof object}`;
    const statusText = t(statusKey) || status;
    switch (status) {
      case SupplierStatus.Approved:
        return <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-900 text-green-300">{statusText}</span>;
      case SupplierStatus.Pending:
        return <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-900 text-yellow-300">{statusText}</span>;
      case SupplierStatus.Blocked:
        return <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-900 text-red-300">{statusText}</span>;
      default:
        return <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-gray-700 text-gray-300">{statusText}</span>;
    }
  };

  const columns = [
    { header: t('suppliers.supplier'), accessor: (row: Supplier) => (
      <div>
        <div className="font-medium text-white">{row.name}</div>
        <div className="text-kwanzub-light">{row.storeName}</div>
      </div>
    )},
    { header: t('suppliers.email'), accessor: (row: Supplier) => row.email },
    { header: t('suppliers.status'), accessor: (row: Supplier) => getStatusBadge(row.status) },
    { header: t('suppliers.supplierScore'), accessor: (row: Supplier) => `${row.supplierScore}/100` },
    { header: t('suppliers.joinedDate'), accessor: (row: Supplier) => row.joinedDate },
    { header: t('suppliers.actions'), accessor: (row: Supplier) => (
       <button onClick={() => handleViewDetails(row)} className="px-3 py-1 text-sm bg-kwanzub-primary text-white rounded-md hover:bg-kwanzub-primary-hover">
          {t('financials.viewDetails')}
       </button>
    )},
  ];

  const filterComponent = (
    <select 
      value={statusFilter} 
      onChange={e => setStatusFilter(e.target.value as any)} 
      className="px-3 py-2 bg-gray-700 text-white rounded-md focus:outline-none focus:ring-2 focus:ring-kwanzub-primary"
    >
      <option value="All">{t('suppliers.allStatuses')}</option>
      <option value={SupplierStatus.Approved}>{t('suppliers.approved')}</option>
      <option value={SupplierStatus.Pending}>{t('suppliers.pending')}</option>
      <option value={SupplierStatus.Blocked}>{t('suppliers.blocked')}</option>
    </select>
  );

  return (
    <>
      <DataTable<Supplier>
        columns={columns}
        data={filteredData}

        title={t('suppliers.title')}
        filterComponent={filterComponent}
      />
      {isModalOpen && selectedSupplier && (
        <SupplierDetailModal 
            supplier={selectedSupplier}
            onClose={() => setIsModalOpen(false)}
            onStatusChange={handleStatusChange}
        />
      )}
    </>
  );
};

export default Suppliers;