
import React, { useState, useMemo } from 'react';
import { useLocale } from '../context/LocaleContext';
import { useMockData, SYSTEM_MODULES, PERMISSION_ACTIONS } from '../hooks/useMockData';
import { Role, SystemModule, PermissionAction } from '../types';
import Modal from './Modal';
import { UserGroupIcon, ClipboardListIcon, UsersIcon, ClockIcon, CogIcon, PencilIcon, DotsVerticalIcon } from './Icons';

type PermissionsTab = 'roles' | 'matrix' | 'usersAndRoles' | 'history' | 'advanced';

const Permissions: React.FC = () => {
    const { t } = useLocale();
    const [activeTab, setActiveTab] = useState<PermissionsTab>('roles');
    const { roles, saveRole, updatePermission } = useMockData();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingRole, setEditingRole] = useState<Role | null>(null);

    const handleNewRole = () => {
        setEditingRole(null);
        setIsModalOpen(true);
    };

    const handleEditRole = (role: Role) => {
        setEditingRole(role);
        setIsModalOpen(true);
    };

    const handleSaveRole = (roleData: Pick<Role, 'name' | 'description' | 'hierarchyLevel'>) => {
        const roleToSave: Role = editingRole
            ? { ...editingRole, ...roleData }
            : {
                id: `role-${Date.now()}`,
                ...roleData,
                userCount: 0,
                permissions: {},
            };
        saveRole(roleToSave);
        setIsModalOpen(false);
    };
    
    const TabButton: React.FC<{tab: PermissionsTab, label: string, icon: React.ReactNode}> = ({ tab, label, icon }) => (
        <button onClick={() => setActiveTab(tab)} className={`flex items-center gap-2 ${activeTab === tab ? 'border-kwanzub-primary text-kwanzub-primary' : 'border-transparent text-gray-400 hover:text-gray-200 hover:border-gray-500'} whitespace-nowrap py-3 px-4 border-b-2 font-medium text-sm`}>
            {icon} {label}
        </button>
    );
    
    const renderContent = () => {
        switch (activeTab) {
            case 'roles':
                return <RolesList roles={roles} onEdit={handleEditRole} onNew={handleNewRole} />;
            case 'matrix':
                return <PermissionMatrix roles={roles} onPermissionChange={updatePermission} />;
            case 'usersAndRoles':
                return <div className="p-6 bg-kwanzub-dark rounded-lg text-kwanzub-light">{t('permissions.usersAndRolesDesc')}</div>;
            case 'history':
                 return <div className="p-6 bg-kwanzub-dark rounded-lg text-kwanzub-light">{t('permissions.historyDesc')}</div>;
            case 'advanced':
                 return <div className="p-6 bg-kwanzub-dark rounded-lg text-kwanzub-light">{t('permissions.advancedDesc')}</div>;
            default:
                return null;
        }
    };

    return (
        <div className="space-y-6">
            <h2 className="text-2xl font-bold text-white flex items-center gap-3"><UserGroupIcon /> {t('permissions.title')}</h2>
            <div className="border-b border-gray-700 overflow-x-auto">
                <nav className="-mb-px flex space-x-4">
                    <TabButton tab="roles" label={t('permissions.roles')} icon={<UsersIcon />} />
                    <TabButton tab="matrix" label={t('permissions.matrix')} icon={<ClipboardListIcon />} />
                    <TabButton tab="usersAndRoles" label={t('permissions.usersAndRoles')} icon={<UserGroupIcon />} />
                    <TabButton tab="history" label={t('permissions.history')} icon={<ClockIcon />} />
                    <TabButton tab="advanced" label={t('permissions.advanced')} icon={<CogIcon />} />
                </nav>
            </div>
            <div>
                {renderContent()}
            </div>
            {isModalOpen && <RoleEditModal role={editingRole} onClose={() => setIsModalOpen(false)} onSave={handleSaveRole} />}
        </div>
    );
};

const RolesList: React.FC<{ roles: Role[], onEdit: (role: Role) => void, onNew: () => void }> = ({ roles, onEdit, onNew }) => {
    const { t } = useLocale();
    return (
        <div className="bg-kwanzub-dark rounded-lg shadow-lg p-6">
            <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-semibold text-white">{t('permissions.roleList')}</h3>
                <button onClick={onNew} className="px-4 py-2 bg-kwanzub-primary text-white rounded-md hover:bg-kwanzub-primary-hover">{t('permissions.newRole')}</button>
            </div>
            <div className="space-y-3">
                {roles.map(role => (
                    <div key={role.id} className="flex items-center justify-between p-4 bg-gray-700/50 rounded-lg">
                        <div>
                            <p className="font-semibold text-white">{role.name} <span className="text-sm font-normal text-kwanzub-light">({t('permissions.level')} {role.hierarchyLevel})</span></p>
                            <p className="text-sm text-kwanzub-light">{role.description}</p>
                            <p className="text-xs text-gray-400 mt-1">{role.userCount} {t('permissions.users')}</p>
                        </div>
                        <button onClick={() => onEdit(role)} className="p-2 text-blue-400 hover:text-blue-200"><PencilIcon /></button>
                    </div>
                ))}
            </div>
        </div>
    );
};

const PermissionMatrix: React.FC<{ roles: Role[], onPermissionChange: (roleId: string, module: SystemModule, action: PermissionAction, granted: boolean) => void }> = ({ roles, onPermissionChange }) => {
    const { t } = useLocale();
    const [selectedRoleId, setSelectedRoleId] = useState(roles[0]?.id || '');

    const selectedRole = useMemo(() => roles.find(r => r.id === selectedRoleId), [roles, selectedRoleId]);
    
    return (
        <div className="bg-kwanzub-dark rounded-lg shadow-lg p-6">
            <div className="mb-4">
                 <label htmlFor="role-select" className="block text-sm font-medium text-kwanzub-light">{t('permissions.selectRole')}</label>
                 <select id="role-select" value={selectedRoleId} onChange={e => setSelectedRoleId(e.target.value)} className="mt-1 max-w-xs w-full px-3 py-2 bg-gray-700 text-white rounded-md focus:outline-none focus:ring-2 focus:ring-kwanzub-primary">
                    {roles.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
                 </select>
            </div>

            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-700 border border-gray-700">
                    <thead className="bg-gray-700/50">
                        <tr>
                            <th className="sticky left-0 bg-gray-700/50 px-4 py-3 text-left text-xs font-medium text-kwanzub-light uppercase tracking-wider">{t('permissions.module')}</th>
                            {PERMISSION_ACTIONS.map(action => <th key={action} className="px-4 py-3 text-center text-xs font-medium text-kwanzub-light uppercase tracking-wider">{t(`permissions.actions.${action}`)}</th>)}
                        </tr>
                    </thead>
                    <tbody className="bg-kwanzub-dark divide-y divide-gray-700">
                        {SYSTEM_MODULES.map(module => (
                            <tr key={module}>
                                <td className="sticky left-0 bg-kwanzub-dark px-4 py-3 whitespace-nowrap text-sm font-medium text-white">{t(`permissions.modules.${module}`)}</td>
                                {PERMISSION_ACTIONS.map(action => {
                                    const hasPermission = selectedRole?.permissions[module]?.includes(action) || false;
                                    return (
                                        <td key={action} className="px-4 py-3 text-center">
                                            <input
                                                type="checkbox"
                                                checked={hasPermission}
                                                onChange={e => onPermissionChange(selectedRoleId, module, action, e.target.checked)}
                                                className="h-4 w-4 bg-gray-700 border-gray-600 rounded text-kwanzub-primary focus:ring-kwanzub-primary"
                                                disabled={selectedRole?.hierarchyLevel === 1}
                                            />
                                        </td>
                                    );
                                })}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
             {selectedRole?.hierarchyLevel === 1 && <p className="text-xs text-yellow-400 mt-4">{t('permissions.superAdminWarning')}</p>}
        </div>
    );
};

const RoleEditModal: React.FC<{role: Role | null; onClose: () => void; onSave: (roleData: Pick<Role, 'name' | 'description' | 'hierarchyLevel'>) => void}> = ({ role, onClose, onSave }) => {
    const { t } = useLocale();
    const [name, setName] = useState(role?.name || '');
    const [description, setDescription] = useState(role?.description || '');
    const [hierarchyLevel, setHierarchyLevel] = useState(role?.hierarchyLevel || 5);

    const handleSubmit = () => {
        if(name) {
            onSave({ name, description, hierarchyLevel: Number(hierarchyLevel) });
        }
    }

    return (
        <Modal onClose={onClose} title={role ? t('permissions.editRole') : t('permissions.newRole')}>
            <div className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-kwanzub-light">{t('permissions.roleName')}</label>
                    <input type="text" value={name} onChange={e => setName(e.target.value)} className="mt-1 w-full px-3 py-2 bg-gray-700 text-white rounded-md" />
                </div>
                <div>
                    <label className="block text-sm font-medium text-kwanzub-light">{t('permissions.roleDescription')}</label>
                    <textarea value={description} onChange={e => setDescription(e.target.value)} rows={3} className="mt-1 w-full px-3 py-2 bg-gray-700 text-white rounded-md" />
                </div>
                 <div>
                    <label className="block text-sm font-medium text-kwanzub-light">{t('permissions.hierarchyLevel')}</label>
                    <input type="number" min="2" max="5" value={hierarchyLevel} onChange={e => setHierarchyLevel(Number(e.target.value))} className="mt-1 w-full px-3 py-2 bg-gray-700 text-white rounded-md" />
                     <p className="text-xs text-gray-400 mt-1">{t('permissions.levelHint')}</p>
                </div>
                <div className="flex justify-end pt-4 border-t border-gray-700 gap-3">
                     <button onClick={onClose} className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700">{t('modals.close')}</button>
                    <button onClick={handleSubmit} className="px-6 py-2 bg-kwanzub-primary text-white rounded-md hover:bg-kwanzub-primary-hover">{t('settings.save')}</button>
                </div>
            </div>
        </Modal>
    );
}

export default Permissions;
