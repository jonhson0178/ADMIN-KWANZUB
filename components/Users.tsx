

import React, { useState, useMemo, useEffect } from 'react';
import DataTable from './DataTable';
import { useMockData } from '../hooks/useMockData';
// FIX: Changed import path for HighlightableEntity type to fix module resolution error.
import { MarketplaceUser, MarketplaceUserStatus, MarketplaceUserType, HighlightableEntity } from '../types';
import { EyeIcon, NoSymbolIcon, CheckCircleIcon, UsersIcon, UserPlusIcon, UserMinusIcon } from './Icons';
import StatCard from './StatCard';
import UserDetailModal from './UserDetailModal';
import { useLocale } from '../context/LocaleContext';

interface UsersProps {
  highlightedEntity: HighlightableEntity | null;
  onHighlightComplete: () => void;
  searchTerm: string;
}

const Users: React.FC<UsersProps> = ({ highlightedEntity, onHighlightComplete, searchTerm }) => {
  const { marketplaceUsers, stats, updateMarketplaceUserStatus } = useMockData();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<MarketplaceUser | null>(null);
  const { t } = useLocale();
  const [statusFilter, setStatusFilter] = useState<MarketplaceUserStatus | 'All'>('All');
  const [typeFilter, setTypeFilter] = useState<MarketplaceUserType | 'All'>('All');
  
  useEffect(() => {
    if (highlightedEntity && highlightedEntity.type === 'user') {
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

  const handleViewDetails = (user: MarketplaceUser) => {
    setSelectedUser(user);
    setIsModalOpen(true);
  };
  
  const filteredData = useMemo(() => {
    return marketplaceUsers.filter(user => {
      const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) || user.email.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter === 'All' || user.status === statusFilter;
      const matchesType = typeFilter === 'All' || user.type === typeFilter;
      return matchesSearch && matchesStatus && matchesType;
    });
  }, [marketplaceUsers, searchTerm, statusFilter, typeFilter]);


  const getTypeBadge = (type: MarketplaceUserType) => {
    switch (type) {
      case MarketplaceUserType.Supplier:
        return <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-900 text-blue-300">{t('users.supplier')}</span>;
      case MarketplaceUserType.Buyer:
        return <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-purple-900 text-purple-300">{t('users.buyer')}</span>;
    }
  };
  
  const getStatusBadge = (status: MarketplaceUserStatus) => {
    switch (status) {
      case MarketplaceUserStatus.Active:
        return <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-900 text-green-300">{t('users.active')}</span>;
      case MarketplaceUserStatus.Pending:
        return <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-900 text-yellow-300">{t('users.pending')}</span>;
      case MarketplaceUserStatus.Suspended:
        return <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-900 text-red-300">{t('users.suspended')}</span>;
    }
  };
  
  const columns = [
    { header: t('users.user'), accessor: (row: MarketplaceUser) => (
       <div>
        <div className="font-medium text-white">{row.name}</div>
        <div className="text-kwanzub-light text-xs">{row.email}</div>
      </div>
    )},
    { header: t('users.type'), accessor: (row: MarketplaceUser) => getTypeBadge(row.type) },
    { header: t('users.status'), accessor: (row: MarketplaceUser) => getStatusBadge(row.status) },
    { header: t('users.lastVisit'), accessor: (row: MarketplaceUser) => new Date(row.lastVisit).toLocaleDateString() },
    { header: t('users.reputation'), accessor: (row: MarketplaceUser) => `${row.reputationScore}/100` },
    { header: t('users.totalOrders'), accessor: (row: MarketplaceUser) => row.totalOrders },
    { header: t('users.actions'), accessor: (row: MarketplaceUser) => (
      <div className="space-x-2 flex items-center">
        <button onClick={() => handleViewDetails(row)} className="p-2 text-blue-400 hover:text-blue-200 rounded-full hover:bg-gray-700" title="View Details"><EyeIcon /></button>
        {row.status !== MarketplaceUserStatus.Suspended && (
            <button onClick={() => updateMarketplaceUserStatus(row.id, MarketplaceUserStatus.Suspended)} className="p-2 text-red-400 hover:text-red-200 rounded-full hover:bg-gray-700" title="Suspend User"><NoSymbolIcon /></button>
        )}
         {row.status === MarketplaceUserStatus.Suspended && (
            <button onClick={() => updateMarketplaceUserStatus(row.id, MarketplaceUserStatus.Active)} className="p-2 text-green-400 hover:text-green-200 rounded-full hover:bg-gray-700" title="Activate User"><CheckCircleIcon /></button>
        )}
      </div>
    )},
  ];

  return (
    <div className="space-y-6">
        <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-5">
            <StatCard title={t('users.totalUsers')} value={stats.totalUsers.toString()} icon={<UsersIcon />} />
            <StatCard title={t('users.activeBuyers')} value={stats.activeBuyers.toString()} icon={<UsersIcon className="text-purple-400" />} />
            <StatCard title={t('users.activeSuppliers')} value={stats.activeSuppliers.toString()} icon={<UsersIcon className="text-blue-400" />} />
            <StatCard title={t('users.suspendedUsers')} value={stats.suspendedUsers.toString()} icon={<UserMinusIcon />} />
            <StatCard title={t('users.newThisMonth')} value={stats.newUsersThisMonth.toString()} icon={<UserPlusIcon />} />
        </div>
        
        <div className="bg-kwanzub-dark rounded-lg shadow-lg p-6">
             <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold text-white">{t('users.title')}</h2>
                <div className="flex items-center space-x-2">

                    <select value={typeFilter} onChange={e => setTypeFilter(e.target.value as any)} className="px-3 py-2 bg-gray-700 text-white rounded-md focus:outline-none focus:ring-2 focus:ring-kwanzub-primary">
                        <option value="All">{t('users.allTypes')}</option>
                        <option value={MarketplaceUserType.Buyer}>{t('users.buyer')}</option>
                        <option value={MarketplaceUserType.Supplier}>{t('users.supplier')}</option>
                    </select>
                    <select value={statusFilter} onChange={e => setStatusFilter(e.target.value as any)} className="px-3 py-2 bg-gray-700 text-white rounded-md focus:outline-none focus:ring-2 focus:ring-kwanzub-primary">
                        <option value="All">{t('users.allStatuses')}</option>
                        <option value={MarketplaceUserStatus.Active}>{t('users.active')}</option>
                        <option value={MarketplaceUserStatus.Pending}>{t('users.pending')}</option>
                        <option value={MarketplaceUserStatus.Suspended}>{t('users.suspended')}</option>
                    </select>
                </div>
            </div>
             <DataTable<MarketplaceUser>
                columns={columns}
                data={filteredData}

                title=""
                exportable={true}
            />
        </div>

        {isModalOpen && selectedUser && (
            <UserDetailModal user={selectedUser} onClose={() => setIsModalOpen(false)} onStatusChange={updateMarketplaceUserStatus} />
        )}
    </div>
  );
};

export default Users;