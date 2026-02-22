

import React, { useState, useMemo, useEffect } from 'react';
import DataTable from './DataTable';
import { useMockData } from '../hooks/useMockData';
// FIX: Changed import path for HighlightableEntity type to fix module resolution error.
import { InternalUser, InternalUserStatus, InternalUserRole, HighlightableEntity } from '../types';
import { EyeIcon, NoSymbolIcon, CheckCircleIcon, UsersIcon, UserPlusIcon, ShieldCheckIcon } from './Icons';
import StatCard from './StatCard';
import InternalUserDetailModal from './InternalUserDetailModal';
import { useLocale } from '../context/LocaleContext';

interface InternalTeamProps {
  highlightedEntity: HighlightableEntity | null;
  onHighlightComplete: () => void;
}

const InternalTeam: React.FC<InternalTeamProps> = ({ highlightedEntity, onHighlightComplete }) => {
  const { internalUsers, stats, updateInternalUserStatus, updateInternalUserRole } = useMockData();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<InternalUser | null>(null);
  const { t } = useLocale();


  const [statusFilter, setStatusFilter] = useState<InternalUserStatus | 'All'>('All');
  const [roleFilter, setRoleFilter] = useState<InternalUserRole | 'All'>('All');
  
  useEffect(() => {
    if (highlightedEntity && highlightedEntity.type === 'internalUser') {
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

  const handleViewDetails = (user: InternalUser) => {
    setSelectedUser(user);
    setIsModalOpen(true);
  };
  
  const filteredData = useMemo(() => {
    return internalUsers.filter(user => {
      const matchesStatus = statusFilter === 'All' || user.status === statusFilter;
      const matchesRole = roleFilter === 'All' || user.role === roleFilter;
      return matchesStatus && matchesRole;
    });
  }, [internalUsers, statusFilter, roleFilter]);


  const getRoleBadge = (role: InternalUserRole) => {
    const roleText = role === InternalUserRole.SuperAdmin ? 'Super Admin' : t(`internalTeam.${role.toLowerCase()}`);
    switch (role) {
      case InternalUserRole.SuperAdmin:
        return <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-900 text-red-300">{roleText}</span>;
      case InternalUserRole.Admin:
        return <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-indigo-900 text-indigo-300">{roleText}</span>;
      case InternalUserRole.Moderator:
        return <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-gray-700 text-gray-300">{roleText}</span>;
    }
  };
  
  const getStatusBadge = (status: InternalUserStatus) => {
    const statusText = t(`internalTeam.${status.toLowerCase()}`);
    switch (status) {
      case InternalUserStatus.Active:
        return <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-900 text-green-300">{statusText}</span>;
      case InternalUserStatus.Suspended:
        return <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-900 text-red-300">{statusText}</span>;
    }
  };
  
  const columns = [
    { header: t('internalTeam.member'), accessor: (row: InternalUser) => (
       <div>
        <div className="font-medium text-white">{row.name}</div>
        <div className="text-kwanzub-light text-xs">{row.email}</div>
      </div>
    )},
    { header: t('internalTeam.role'), accessor: (row: InternalUser) => getRoleBadge(row.role) },
    { header: t('internalTeam.status'), accessor: (row: InternalUser) => getStatusBadge(row.status) },
    { header: t('internalTeam.lastLogin'), accessor: (row: InternalUser) => new Date(row.lastLogin).toLocaleString() },
    { header: t('internalTeam.totalActions'), accessor: (row: InternalUser) => row.totalActions },
    { header: t('internalTeam.actions'), accessor: (row: InternalUser) => (
      <div className="space-x-2 flex items-center">
        <button onClick={() => handleViewDetails(row)} className="p-2 text-blue-400 hover:text-blue-200 rounded-full hover:bg-gray-700" title="View Details"><EyeIcon /></button>
        {row.role !== InternalUserRole.SuperAdmin && row.status !== InternalUserStatus.Suspended && (
            <button onClick={() => updateInternalUserStatus(row.id, InternalUserStatus.Suspended)} className="p-2 text-red-400 hover:text-red-200 rounded-full hover:bg-gray-700" title="Suspend Member"><NoSymbolIcon /></button>
        )}
         {row.role !== InternalUserRole.SuperAdmin && row.status === InternalUserStatus.Suspended && (
            <button onClick={() => updateInternalUserStatus(row.id, InternalUserStatus.Active)} className="p-2 text-green-400 hover:text-green-200 rounded-full hover:bg-gray-700" title="Activate Member"><CheckCircleIcon /></button>
        )}
      </div>
    )},
  ];

  return (
    <div className="space-y-6">
        <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-5">
            <StatCard title={t('internalTeam.totalMembers')} value={stats.totalInternalMembers.toString()} icon={<ShieldCheckIcon />} />
            <StatCard title={t('internalTeam.admins')} value={stats.totalAdmins.toString()} icon={<UsersIcon className="text-indigo-400" />} />
            <StatCard title={t('internalTeam.moderators')} value={stats.totalModerators.toString()} icon={<UsersIcon className="text-gray-400" />} />
            <StatCard title={t('internalTeam.activeMembers')} value={stats.activeInternalMembers.toString()} icon={<UsersIcon className="text-green-400" />} />
            <StatCard title={t('internalTeam.newThisMonth')} value={stats.newInternalMembersThisMonth.toString()} icon={<UserPlusIcon />} />
        </div>
        
        <div className="bg-kwanzub-dark rounded-lg shadow-lg p-6">
             <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold text-white">{t('internalTeam.title')}</h2>
                <div className="flex items-center space-x-2">

                    <select value={roleFilter} onChange={e => setRoleFilter(e.target.value as any)} className="px-3 py-2 bg-gray-700 text-white rounded-md focus:outline-none focus:ring-2 focus:ring-kwanzub-primary">
                        <option value="All">{t('internalTeam.allRoles')}</option>
                        <option value={InternalUserRole.Admin}>{t('internalTeam.admin')}</option>
                        <option value={InternalUserRole.Moderator}>{t('internalTeam.moderator')}</option>
                    </select>
                    <select value={statusFilter} onChange={e => setStatusFilter(e.target.value as any)} className="px-3 py-2 bg-gray-700 text-white rounded-md focus:outline-none focus:ring-2 focus:ring-kwanzub-primary">
                        <option value="All">{t('internalTeam.allStatuses')}</option>
                        <option value={InternalUserStatus.Active}>{t('internalTeam.active')}</option>
                        <option value={InternalUserStatus.Suspended}>{t('internalTeam.suspended')}</option>
                    </select>
                </div>
            </div>
             <DataTable<InternalUser>
                columns={columns}
                data={filteredData}

                title=""
                exportable={true}
            />
        </div>

        {isModalOpen && selectedUser && (
            <InternalUserDetailModal user={selectedUser} onClose={() => setIsModalOpen(false)} onStatusChange={updateInternalUserStatus} onRoleChange={updateInternalUserRole}/>
        )}
    </div>
  );
};

export default InternalTeam;