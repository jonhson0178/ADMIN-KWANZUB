
import React, { useState } from 'react';
import { InternalUser, InternalUserStatus, InternalUserRole, AuditLog, LoginAttempt } from '../types';
import { NoSymbolIcon, CheckCircleIcon, ArrowUpIcon, ArrowDownIcon } from './Icons';
import Modal from './Modal';
import { useLocale } from '../context/LocaleContext';

interface InternalUserDetailModalProps {
    user: InternalUser;
    onClose: () => void;
    onStatusChange: (id: string, status: InternalUserStatus) => void;
    onRoleChange: (id: string, role: InternalUserRole) => void;
}

type Tab = 'summary' | 'actions' | 'logins' | 'permissions';

const InternalUserDetailModal: React.FC<InternalUserDetailModalProps> = ({ user, onClose, onStatusChange, onRoleChange }) => {
    const [activeTab, setActiveTab] = useState<Tab>('summary');
    const { t } = useLocale();

    const getRoleBadge = (role: InternalUserRole) => {
        const roleText = role === InternalUserRole.SuperAdmin ? 'Super Admin' : t(`internalTeam.${role.toLowerCase()}`);
        switch (role) {
            case InternalUserRole.SuperAdmin: return <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-900 text-red-300">{roleText}</span>;
            case InternalUserRole.Admin: return <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-indigo-900 text-indigo-300">{roleText}</span>;
            case InternalUserRole.Moderator: return <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-gray-700 text-gray-300">{roleText}</span>;
        }
    };
    
    const getStatusBadge = (status: InternalUserStatus) => {
        const statusText = t(`internalTeam.${status.toLowerCase()}`);
        return status === InternalUserStatus.Active
            ? <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-900 text-green-300">{statusText}</span>
            : <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-900 text-red-300">{statusText}</span>;
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
                             <h4 className="text-lg font-semibold text-white">{t('modals.memberDetails')}</h4>
                             <p><strong className="text-kwanzub-light">{t('modals.id')}:</strong> {user.id}</p>
                             <p><strong className="text-kwanzub-light">{t('modals.email')}:</strong> {user.email}</p>
                             <p><strong className="text-kwanzub-light">{t('modals.role')}:</strong> {getRoleBadge(user.role)}</p>
                             <p><strong className="text-kwanzub-light">{t('modals.status')}:</strong> {getStatusBadge(user.status)}</p>
                             <p><strong className="text-kwanzub-light">{t('modals.memberSince')}:</strong> {new Date(user.createdAt).toLocaleDateString()}</p>
                             <p><strong className="text-kwanzub-light">{t('modals.lastLogin')}:</strong> {new Date(user.lastLogin).toLocaleString()}</p>
                        </div>
                        <div className="space-y-4">
                             <h4 className="text-lg font-semibold text-white">{t('modals.actions')}</h4>
                             {user.role !== InternalUserRole.SuperAdmin && (
                                <div className="flex flex-col space-y-2">
                                    {user.status !== InternalUserStatus.Suspended ? (
                                        <button onClick={() => onStatusChange(user.id, InternalUserStatus.Suspended)} className="flex items-center justify-center px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700">
                                            <NoSymbolIcon /> <span className="ml-2">{t('modals.suspendMember')}</span>
                                        </button>
                                    ) : (
                                        <button onClick={() => onStatusChange(user.id, InternalUserStatus.Active)} className="flex items-center justify-center px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700">
                                            <CheckCircleIcon /> <span className="ml-2">{t('modals.reactivateMember')}</span>
                                        </button>
                                    )}
                                    {user.role === InternalUserRole.Moderator && (
                                         <button onClick={() => onRoleChange(user.id, InternalUserRole.Admin)} className="flex items-center justify-center px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700">
                                            <ArrowUpIcon /> <span className="ml-2">{t('modals.promoteAdmin')}</span>
                                        </button>
                                    )}
                                     {user.role === InternalUserRole.Admin && (
                                         <button onClick={() => onRoleChange(user.id, InternalUserRole.Moderator)} className="flex items-center justify-center px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700">
                                            <ArrowDownIcon /> <span className="ml-2">{t('modals.demoteModerator')}</span>
                                        </button>
                                    )}
                                </div>
                             )}
                        </div>
                    </div>
                );
            case 'actions':
                return <MiniTable<AuditLog> data={user.actionHistory} columns={[ { header: t('auditLogs.timestamp'), accessor: (row) => new Date(row.timestamp).toLocaleString() }, { header: t('auditLogs.action'), accessor: (row) => <code className="px-2 py-1 text-xs font-mono bg-gray-700 rounded">{row.action}</code> }, { header: t('auditLogs.details'), accessor: (row) => row.details }, ]} />;
            case 'logins':
                 return <MiniTable<LoginAttempt> data={user.loginHistory} columns={[ { header: t('auditLogs.timestamp'), accessor: (row) => new Date(row.timestamp).toLocaleString() }, { header: 'IP Address', accessor: (row) => row.ipAddress }, { header: t('modals.status'), accessor: (row) => <span className={row.status === 'Success' ? 'text-green-400' : 'text-red-400'}>{row.status}</span> }, ]} />;
            case 'permissions':
                const permissions = {
                    [InternalUserRole.SuperAdmin]: [t('permissions.superAdmin')],
                    [InternalUserRole.Admin]: [t('permissions.admin')],
                    [InternalUserRole.Moderator]: [t('permissions.moderator')],
                };
                return (
                    <div>
                        <h4 className="text-lg font-semibold text-white mb-2">{t('modals.permissionsFor')} {user.role}</h4>
                        <ul className="list-disc list-inside text-kwanzub-lighter space-y-1">
                            {permissions[user.role].map((perm, i) => <li key={i}>{perm}</li>)}
                        </ul>
                    </div>
                )
        }
    }


    return (
        <Modal onClose={onClose} title={`${user.name} (${user.role})`}>
            <div className="border-b border-gray-700">
                <nav className="-mb-px flex space-x-4" aria-label="Tabs">
                    <TabButton tab="summary" label={t('modals.summaryActions')} />
                    <TabButton tab="actions" label={`${t('modals.activityLogs')} (${user.actionHistory.length})`} />
                    <TabButton tab="logins" label={`${t('modals.loginHistory')} (${user.loginHistory.length})`} />
                    <TabButton tab="permissions" label={t('modals.permissions')} />
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

export default InternalUserDetailModal;
