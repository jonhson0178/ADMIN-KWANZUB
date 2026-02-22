

import React, { useState, useMemo, useRef, useEffect } from 'react';
import DataTable from './DataTable';
import { useMockData } from '../hooks/useMockData';
// FIX: Changed import path for HighlightableEntity type to fix module resolution error.
import { Store, StoreStatus, HighlightableEntity } from '../types';
import { ShieldCheckIcon, ShieldExclamationIcon, CurrencyDollarIcon, StarIcon, CheckCircleIcon, NoSymbolIcon, TrashIcon, EyeIcon, DotsVerticalIcon, StorefrontIcon } from './Icons';
import StatCard from './StatCard';
import { useLocale } from '../context/LocaleContext';
import StoreDetailModal from './StoreDetailModal';

interface StoresProps {
  highlightedEntity: HighlightableEntity | null;
  onHighlightComplete: () => void;
}

const Stores: React.FC<StoresProps> = ({ highlightedEntity, onHighlightComplete }) => {
  const { stores, suppliers, stats, storeCategories, updateStoreStatus } = useMockData();
  const { t } = useLocale();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedStore, setSelectedStore] = useState<Store | null>(null);
  const [activeActionsMenu, setActiveActionsMenu] = useState<string | null>(null);
  const actionsMenuRef = useRef<HTMLDivElement>(null);
  
  // Filters
  const [statusFilter, setStatusFilter] = useState<StoreStatus | 'All'>('All');
  const [categoryFilter, setCategoryFilter] = useState<string | 'All'>('All');

  useEffect(() => {
    if (highlightedEntity && highlightedEntity.type === 'store') {
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

  const formatCurrency = (value: number) => `Kz ${value.toLocaleString('pt-AO', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

  const handleViewDetails = (store: Store) => {
    setSelectedStore(store);
    setIsModalOpen(true);
    setActiveActionsMenu(null);
  };
  
  const handleStatusChange = (store: Store, status: StoreStatus) => {
    updateStoreStatus(store.id, status);
    setActiveActionsMenu(null);
  }
  
  const handleDelete = (store: Store) => {
    alert(`Deleting store ${store.name}. (This is a placeholder action)`);
    setActiveActionsMenu(null);
  }

  const filteredData = useMemo(() => {
    return stores.filter(store => {
        const matchesStatus = statusFilter === 'All' || store.status === statusFilter;
        const matchesCategory = categoryFilter === 'All' || store.category === categoryFilter;
        return matchesStatus && matchesCategory;
    });
  }, [stores, statusFilter, categoryFilter]);

  const getStatusBadge = (status: StoreStatus) => {
    const statusMap = {
      [StoreStatus.Active]: 'bg-green-900 text-green-300',
      [StoreStatus.Inactive]: 'bg-red-900 text-red-300',
      [StoreStatus.Pending]: 'bg-yellow-900 text-yellow-300',
    };
    const statusKey = `stores.status${status}`;
    return <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${statusMap[status]}`}>{t(statusKey)}</span>;
  };
  
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (actionsMenuRef.current && !actionsMenuRef.current.contains(event.target as Node)) {
        setActiveActionsMenu(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const columns = [
    { header: t('stores.storeName'), accessor: (row: Store) => (
      <div className="flex items-center">
        <div className="flex-shrink-0 h-10 w-10 bg-gray-700 rounded-full flex items-center justify-center font-bold text-white">
          {row.name.charAt(0)}
        </div>
        <div className="ml-4">
          <div className="text-sm font-medium text-white">{row.name}</div>
          <div className="text-sm text-kwanzub-light">{row.category}</div>
        </div>
      </div>
    )},
    { header: t('stores.supplier'), accessor: (row: Store) => (
      <div>
        <div className="text-sm text-white">{row.supplierName}</div>
        <div className="text-sm text-kwanzub-light">{suppliers.find(s=>s.id === row.supplierId)?.email}</div>
      </div>
    )},
    { header: t('stores.salesVolume'), accessor: (row: Store) => formatCurrency(row.totalSales) },
    { header: t('stores.rating'), accessor: (row: Store) => (
      <div className="flex items-center">
        <StarIcon className="w-5 h-5 text-yellow-400 mr-1"/> {row.averageRating.toFixed(1)}
      </div>
    )},
    { header: t('stores.status'), accessor: (row: Store) => getStatusBadge(row.status) },
    { header: t('stores.actions'), accessor: (row: Store) => (
      <div className="relative" ref={activeActionsMenu === row.id ? actionsMenuRef : null}>
        <button onClick={() => setActiveActionsMenu(activeActionsMenu === row.id ? null : row.id)} className="p-2 text-kwanzub-light hover:text-white rounded-full hover:bg-gray-700">
          <DotsVerticalIcon />
        </button>
        {activeActionsMenu === row.id && (
          <div className="absolute right-0 mt-2 w-48 bg-kwanzub-dark border border-gray-700 rounded-md shadow-lg z-10">
            <button onClick={() => handleViewDetails(row)} className="w-full text-left flex items-center px-4 py-2 text-sm text-kwanzub-lighter hover:bg-gray-700"><EyeIcon className="w-4 h-4 mr-2"/>{t('financials.viewDetails')}</button>
            {row.status !== StoreStatus.Active && <button onClick={() => handleStatusChange(row, StoreStatus.Active)} className="w-full text-left flex items-center px-4 py-2 text-sm text-kwanzub-lighter hover:bg-gray-700"><CheckCircleIcon className="w-4 h-4 mr-2"/>{t('stores.activate')}</button>}
            {row.status === StoreStatus.Active && <button onClick={() => handleStatusChange(row, StoreStatus.Inactive)} className="w-full text-left flex items-center px-4 py-2 text-sm text-kwanzub-lighter hover:bg-gray-700"><NoSymbolIcon className="w-4 h-4 mr-2"/>{t('stores.suspend')}</button>}
            <button onClick={() => handleDelete(row)} className="w-full text-left flex items-center px-4 py-2 text-sm text-red-400 hover:bg-gray-700"><TrashIcon className="w-4 h-4 mr-2"/>{t('stores.delete')}</button>
          </div>
        )}
      </div>
    )},
  ];

  const filterComponent = (
     <div className="flex items-center space-x-2">
      <select 
        value={categoryFilter} 
        onChange={e => setCategoryFilter(e.target.value as any)} 
        className="px-3 py-2 bg-gray-700 text-white rounded-md focus:outline-none focus:ring-2 focus:ring-kwanzub-primary"
      >
        <option value="All">{t('stores.allCategories')}</option>
        {storeCategories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
      </select>
      <select 
        value={statusFilter} 
        onChange={e => setStatusFilter(e.target.value as any)} 
        className="px-3 py-2 bg-gray-700 text-white rounded-md focus:outline-none focus:ring-2 focus:ring-kwanzub-primary"
      >
        <option value="All">{t('users.allStatuses')}</option>
        <option value={StoreStatus.Active}>{t('stores.statusActive')}</option>
        <option value={StoreStatus.Inactive}>{t('stores.statusInactive')}</option>
        <option value={StoreStatus.Pending}>{t('stores.statusPending')}</option>
      </select>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard title={t('stores.totalStores')} value={stats.totalStores.toString()} icon={<StorefrontIcon />} />
        <StatCard title={t('stores.activeStores')} value={stats.activeStores.toString()} icon={<CheckCircleIcon className="text-green-400" />} />
        <StatCard title={t('stores.totalSales')} value={formatCurrency(stats.totalStoreSales)} icon={<CurrencyDollarIcon />} />
        <StatCard title={t('stores.avgRating')} value={stats.averageStoreRating.toFixed(2)} icon={<StarIcon className="text-yellow-400" />} />
      </div>

      <DataTable<Store>
        columns={columns}
        data={filteredData}

        title={t('stores.title')}
        filterComponent={filterComponent}
        exportable
      />

      {isModalOpen && selectedStore && (
        <StoreDetailModal 
          store={selectedStore}
          onClose={() => setIsModalOpen(false)}
        />
      )}
    </div>
  );
};

export default Stores;