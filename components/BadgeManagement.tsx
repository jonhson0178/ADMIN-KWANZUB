
import React, { useState, useMemo } from 'react';
import { useMockData } from '../hooks/useMockData';
import { useLocale } from '../context/LocaleContext';
import { BadgeDefinition, SellerBadge, BadgeType, SellerBadgeStatus, Supplier, Plan } from '../types';
import StatCard from './StatCard';
import DataTable from './DataTable';
import Modal from './Modal';
import { BadgeCheckIcon, StarIcon, ShieldCheckIcon, SparklesIcon, TagIcon, PencilIcon, CheckCircleIcon, NoSymbolIcon, ExclamationTriangleIcon } from './Icons';

type Tab = 'definitions' | 'monitoring' | 'sellerManagement';

const BadgeManagement: React.FC = () => {
    const { t } = useLocale();
    const { suppliers, badgeDefinitions, sellerBadges, saveBadgeDefinition, assignSellerBadge, revokeSellerBadge, plans } = useMockData();
    const [activeTab, setActiveTab] = useState<Tab>('definitions');

    const [isDefModalOpen, setIsDefModalOpen] = useState(false);
    const [editingBadgeDef, setEditingBadgeDef] = useState<BadgeDefinition | null>(null);

    const [isSellerModalOpen, setIsSellerModalOpen] = useState(false);
    const [selectedSupplier, setSelectedSupplier] = useState<Supplier | null>(null);

    const stats = useMemo(() => {
        const activeBadges = sellerBadges.filter(sb => sb.status === SellerBadgeStatus.Active);
        const sellersWithBadges = new Map<string, Set<string>>();
        activeBadges.forEach(ab => {
            const def = badgeDefinitions.find(bd => bd.id === ab.badgeId);
            if(def) {
                if(!sellersWithBadges.has(def.type)) {
                    sellersWithBadges.set(def.type, new Set());
                }
                sellersWithBadges.get(def.type)!.add(ab.sellerId);
            }
        });

        const thirtyDaysFromNow = new Date();
        thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);
        
        return {
            verification: sellersWithBadges.get(BadgeType.Verification)?.size || 0,
            plan: sellersWithBadges.get(BadgeType.Plan)?.size || 0,
            trust: sellersWithBadges.get(BadgeType.Trust)?.size || 0,
            expiring: activeBadges.filter(ab => ab.expirationDate && new Date(ab.expirationDate) <= thirtyDaysFromNow).length,
        }
    }, [sellerBadges, badgeDefinitions]);

    const handleNewBadgeDef = () => {
        setEditingBadgeDef(null);
        setIsDefModalOpen(true);
    };

    const handleEditBadgeDef = (badge: BadgeDefinition) => {
        setEditingBadgeDef(badge);
        setIsDefModalOpen(true);
    };
    
    const handleManageSellerBadges = (supplier: Supplier) => {
        setSelectedSupplier(supplier);
        setIsSellerModalOpen(true);
    };

    const TabButton: React.FC<{tab: Tab, label: string}> = ({ tab, label }) => (
        <button onClick={() => setActiveTab(tab)} className={`${activeTab === tab ? 'border-kwanzub-primary text-kwanzub-primary' : 'border-transparent text-gray-400 hover:text-gray-200 hover:border-gray-500'} whitespace-nowrap py-3 px-4 border-b-2 font-medium text-sm`}>
            {label}
        </button>
    );

    const renderContent = () => {
        switch(activeTab) {
            case 'definitions': return <BadgeDefinitionsTable badgeDefinitions={badgeDefinitions} onEdit={handleEditBadgeDef} onNew={handleNewBadgeDef} />;
            case 'monitoring': return <MonitoringDashboard stats={stats} sellerBadges={sellerBadges} badgeDefinitions={badgeDefinitions} suppliers={suppliers} />;
            case 'sellerManagement': return <SellerBadgeManagement suppliers={suppliers} badgeDefinitions={badgeDefinitions} onManage={handleManageSellerBadges}/>
        }
    }

    return (
        <div className="space-y-6">
            <h2 className="text-2xl font-bold text-white">{t('badgeManagement.title')}</h2>
            <div className="border-b border-gray-700">
                <nav className="-mb-px flex space-x-4 overflow-x-auto" aria-label="Tabs">
                    <TabButton tab="definitions" label={t('badgeManagement.tabs.definitions')} />
                    <TabButton tab="monitoring" label={t('badgeManagement.tabs.monitoring')} />
                    <TabButton tab="sellerManagement" label={t('badgeManagement.tabs.sellerManagement')} />
                </nav>
            </div>
            <div>{renderContent()}</div>
            {isDefModalOpen && (
                <BadgeDefinitionModal
                    badge={editingBadgeDef}
                    onClose={() => setIsDefModalOpen(false)}
                    onSave={(badge) => {
                        saveBadgeDefinition(badge);
                        setIsDefModalOpen(false);
                    }}
                    plans={plans}
                />
            )}
            {isSellerModalOpen && selectedSupplier && (
                 <SellerBadgesModal
                    supplier={selectedSupplier}
                    badgeDefinitions={badgeDefinitions}
                    onClose={() => setIsSellerModalOpen(false)}
                    onGrant={assignSellerBadge}
                    onRevoke={revokeSellerBadge}
                />
            )}
        </div>
    );
};

const BadgeDefinitionsTable: React.FC<{badgeDefinitions: BadgeDefinition[], onEdit: (b: BadgeDefinition) => void, onNew: () => void}> = ({badgeDefinitions, onEdit, onNew}) => {
    const { t } = useLocale();
    const columns = [
        { header: t('badgeManagement.definitionsTable.name'), accessor: (row: BadgeDefinition) => <span className="font-semibold" style={{color: row.color}}>{row.name}</span> },
        { header: t('badgeManagement.definitionsTable.type'), accessor: (row: BadgeDefinition) => t(`badgeManagement.modal.types.${row.type}`) },
        { header: t('badgeManagement.definitionsTable.highlight'), accessor: (row: BadgeDefinition) => `${t('badgeManagement.definitionsTable.level')} ${row.visualLevel}` },
        { header: t('badgeManagement.definitionsTable.status'), accessor: (row: BadgeDefinition) => <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${row.isActive ? 'bg-green-900 text-green-300' : 'bg-gray-800 text-gray-400'}`}>{row.isActive ? t('badgeManagement.definitionsTable.active') : t('badgeManagement.definitionsTable.inactive')}</span> },
        { header: t('badgeManagement.definitionsTable.actions'), accessor: (row: BadgeDefinition) => <button onClick={() => onEdit(row)} className="p-2 text-blue-400 hover:text-blue-300"><PencilIcon/></button> },
    ];
    return (
        <div className="bg-kwanzub-dark rounded-lg p-6">
            <div className="flex justify-between items-center mb-4">
                 <h3 className="text-xl font-semibold text-white">{t('badgeManagement.definitionsTable.title')}</h3>
                 <button onClick={onNew} className="px-4 py-2 bg-kwanzub-primary text-white rounded-md hover:bg-kwanzub-primary-hover">{t('badgeManagement.definitionsTable.newBadge')}</button>
            </div>
            <DataTable<BadgeDefinition> columns={columns} data={badgeDefinitions} title="" />
        </div>
    );
}

const MonitoringDashboard: React.FC<{stats: any, sellerBadges: SellerBadge[], badgeDefinitions: BadgeDefinition[], suppliers: Supplier[]}> = ({stats, sellerBadges, badgeDefinitions, suppliers}) => {
    const { t } = useLocale();
    const expiringBadges = useMemo(() => {
        const thirtyDaysFromNow = new Date();
        thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);
        return sellerBadges.filter(sb => sb.status === SellerBadgeStatus.Active && sb.expirationDate && new Date(sb.expirationDate) <= thirtyDaysFromNow);
    }, [sellerBadges]);

    const expiringColumns = [
        { header: t('badgeManagement.monitoring.seller'), accessor: (row: SellerBadge) => suppliers.find(s=>s.id === row.sellerId)?.name || 'N/A' },
        { header: t('badgeManagement.monitoring.badge'), accessor: (row: SellerBadge) => badgeDefinitions.find(b=>b.id === row.badgeId)?.name || 'N/A' },
        { header: t('badgeManagement.monitoring.expirationDate'), accessor: (row: SellerBadge) => new Date(row.expirationDate!).toLocaleDateString() },
    ]
    
    // For simplicity, history is just all badges
    const historyColumns = [
        { header: t('badgeManagement.monitoring.seller'), accessor: (row: SellerBadge) => suppliers.find(s=>s.id === row.sellerId)?.name || 'N/A' },
        { header: t('badgeManagement.monitoring.badge'), accessor: (row: SellerBadge) => badgeDefinitions.find(b=>b.id === row.badgeId)?.name || 'N/A' },
        { header: t('badgeManagement.monitoring.assignmentDate'), accessor: (row: SellerBadge) => new Date(row.startDate).toLocaleDateString() },
        { header: t('badgeManagement.monitoring.status'), accessor: (row: SellerBadge) => row.status },
    ];

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard title={t('badgeManagement.stats.verification')} value={stats.verification.toString()} icon={<ShieldCheckIcon />} />
                <StatCard title={t('badgeManagement.stats.plan')} value={stats.plan.toString()} icon={<StarIcon />} />
                <StatCard title={t('badgeManagement.stats.trust')} value={stats.trust.toString()} icon={<BadgeCheckIcon />} />
                <StatCard title={t('badgeManagement.stats.expiring')} value={stats.expiring.toString()} icon={<ExclamationTriangleIcon />} />
            </div>
            <DataTable<SellerBadge> columns={expiringColumns} data={expiringBadges} title={t('badgeManagement.monitoring.expiringTitle')} />
            <DataTable<SellerBadge> columns={historyColumns} data={sellerBadges} title={t('badgeManagement.monitoring.historyTitle')} />
        </div>
    );
};

const SellerBadgeManagement: React.FC<{suppliers: Supplier[], badgeDefinitions: BadgeDefinition[], onManage: (s: Supplier)=>void}> = ({suppliers, badgeDefinitions, onManage}) => {
    const { t } = useLocale();

    const getBadgeIcon = (iconName: string, color: string) => {
        const icons: {[key: string]: React.FC<any>} = { ShieldCheckIcon, StarIcon, SparklesIcon, BadgeCheckIcon, TagIcon };
        const IconComponent = icons[iconName] || BadgeCheckIcon;
        return <IconComponent style={{color}} className="w-5 h-5" />;
    }

    const columns = [
        { header: t('suppliers.supplier'), accessor: (row: Supplier) => row.name },
        { header: t('badgeManagement.sellerManagement.currentBadges'), accessor: (row: Supplier) => (
            <div className="flex flex-wrap gap-2">
                {row.badges.map(sb => {
                    const def = badgeDefinitions.find(d => d.id === sb.badgeId);
                    if (!def) return null;
                    return (
                        <div key={sb.id} className="flex items-center gap-1 bg-gray-700 px-2 py-1 rounded-full text-xs" title={def.name}>
                            {getBadgeIcon(def.icon, def.color)}
                            <span className="text-kwanzub-lighter">{def.name}</span>
                        </div>
                    )
                })}
                 {row.badges.length === 0 && <span className="text-kwanzub-light italic">{t('badgeManagement.sellerManagement.noBadges')}</span>}
            </div>
        )},
        { header: t('users.actions'), accessor: (row: Supplier) => <button onClick={()=> onManage(row)} className="px-3 py-1 text-sm bg-kwanzub-primary text-white rounded-md hover:bg-kwanzub-primary-hover">{t('badgeManagement.sellerManagement.manage')}</button> },
    ];
    return <DataTable<Supplier> columns={columns} data={suppliers} title={t('badgeManagement.sellerManagement.title')} />
}


const SellerBadgesModal: React.FC<{supplier: Supplier, badgeDefinitions: BadgeDefinition[], onClose: ()=>void, onGrant: (sellerId: string, badgeId: string) => void, onRevoke: (sellerBadgeId: string) => void}> = ({supplier, badgeDefinitions, onClose, onGrant, onRevoke}) => {
    const { t } = useLocale();
    return (
        <Modal onClose={onClose} title={`${t('badgeManagement.sellerManagement.manageFor')} ${supplier.name}`}>
            <div className="space-y-3">
                {badgeDefinitions.filter(b=>b.isActive).map(def => {
                    const sellerBadge = supplier.badges.find(b => b.badgeId === def.id);
                    return (
                        <div key={def.id} className="flex items-center justify-between p-3 bg-gray-700/50 rounded-lg">
                            <div>
                                <p className="font-semibold text-white">{def.name}</p>
                                <p className="text-sm text-kwanzub-light">{def.description}</p>
                            </div>
                            {sellerBadge ? (
                                <button onClick={() => onRevoke(sellerBadge.id)} className="px-3 py-1 bg-red-600 text-white text-sm rounded-md hover:bg-red-700">{t('badgeManagement.sellerManagement.revoke')}</button>
                            ) : (
                                <button onClick={() => onGrant(supplier.id, def.id)} className="px-3 py-1 bg-green-600 text-white text-sm rounded-md hover:bg-green-700">{t('badgeManagement.sellerManagement.grant')}</button>
                            )}
                        </div>
                    )
                })}
            </div>
        </Modal>
    );
};

const BadgeDefinitionModal: React.FC<{badge: BadgeDefinition | null, onClose: () => void, onSave: (badge: BadgeDefinition) => void, plans: Plan[]}> = ({badge, onClose, onSave, plans}) => {
    const { t } = useLocale();
    const [formData, setFormData] = useState<Partial<BadgeDefinition>>(badge || {
        id: `badge-${Date.now()}`, name: '', description: '', type: BadgeType.Promotional, icon: 'TagIcon', color: '#F472B6', visualLevel: 1, validForDays: 30, isAutomatic: false, isActive: true, rules: {}
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target;
        // @ts-ignore
        const isCheckbox = type === 'checkbox';
        // @ts-ignore
        const val = isCheckbox ? e.target.checked : (type === 'number' ? (value === '' ? null : Number(value)) : value);
        
        if (name.startsWith('rules.')) {
            const ruleName = name.split('.')[1];
            setFormData(p => ({...p, rules: {...p.rules, [ruleName]: val}}));
        } else {
            setFormData(p => ({...p, [name]: val}));
        }
    };
    
    return (
        <Modal onClose={onClose} title={badge ? t('badgeManagement.modal.editTitle') : t('badgeManagement.modal.createTitle')}>
            <div className="space-y-4 text-sm">
                <InputField label={t('badgeManagement.modal.name')} name="name" value={formData.name} onChange={handleChange} />
                <TextAreaField label={t('badgeManagement.modal.description')} name="description" value={formData.description} onChange={handleChange} />
                <div className="grid grid-cols-2 gap-4">
                    <InputField label={t('badgeManagement.modal.icon')} name="icon" value={formData.icon} onChange={handleChange} />
                    <InputField label={t('badgeManagement.modal.color')} name="color" value={formData.color} onChange={handleChange} />
                </div>
                <div className="grid grid-cols-2 gap-4">
                    <SelectField label={t('badgeManagement.modal.type')} name="type" value={formData.type} onChange={handleChange} options={Object.values(BadgeType).map(v => ({value: v, label: t(`badgeManagement.modal.types.${v}`)}))} />
                    <SelectField label={t('badgeManagement.modal.visualLevel')} name="visualLevel" value={formData.visualLevel} onChange={handleChange} options={[1,2,3].map(v => ({value: v, label: t(`badgeManagement.modal.levels.${v}`)}))} />
                </div>

                <div className="border-t border-gray-700 pt-4">
                    <h4 className="font-semibold text-white mb-2">{t('badgeManagement.modal.validity')}</h4>
                    <div className="grid grid-cols-2 gap-4 items-center">
                        <InputField label={t('badgeManagement.modal.validForDays')} name="validForDays" type="number" value={formData.validForDays || ''} onChange={handleChange} placeholder={t('badgeManagement.modal.validForDaysPlaceholder')} />
                        <CheckboxField label={t('badgeManagement.modal.displayValidityPublicly')} name="displayValidityPublicly" checked={formData.displayValidityPublicly || false} onChange={handleChange} />
                    </div>
                </div>

                <div className="border-t border-gray-700 pt-4">
                    <h4 className="font-semibold text-white mb-2">{t('badgeManagement.modal.automation')}</h4>
                    <CheckboxField label={t('badgeManagement.modal.isAutomatic')} name="isAutomatic" checked={formData.isAutomatic || false} onChange={handleChange} />
                    {formData.isAutomatic && (
                        <div className="mt-4 p-4 bg-gray-800/50 rounded-lg space-y-3">
                            <h5 className="text-xs font-bold uppercase text-kwanzub-light">{t('badgeManagement.modal.automationRules')}</h5>
                            <SelectField label={t('badgeManagement.modal.linkedPlan')} name="rules.planId" value={formData.rules?.planId || ''} onChange={handleChange} options={[{value: '', label: `(${t('badgeManagement.modal.selectPlan')})`},...plans.map(p => ({value: p.id, label: p.name}))]} />
                            <InputField label={t('badgeManagement.modal.minSales')} name="rules.minSales" type="number" value={formData.rules?.minSales || ''} onChange={handleChange} />
                            <InputField label={t('badgeManagement.modal.minRating')} name="rules.minRating" type="number" step="0.1" value={formData.rules?.minRating || ''} onChange={handleChange} />
                            <CheckboxField label={t('badgeManagement.modal.noDisputes')} name="rules.noDisputes" checked={formData.rules?.noDisputes || false} onChange={handleChange} />
                        </div>
                    )}
                </div>

                <div className="flex justify-end pt-4 border-t border-gray-700">
                    <button onClick={() => onSave(formData as BadgeDefinition)} className="px-6 py-2 bg-kwanzub-primary text-white rounded-md hover:bg-kwanzub-primary-hover">{badge ? t('badgeManagement.modal.save') : t('badgeManagement.modal.create')}</button>
                </div>
            </div>
        </Modal>
    );
};

// --- Form Field Components ---
const InputField = ({ label, className = '', ...props }: any) => (<div className={className}><label className="block text-xs font-medium text-kwanzub-light">{label}</label><input {...props} className="mt-1 w-full px-3 py-2 bg-gray-700 text-white rounded-md focus:outline-none focus:ring-2 focus:ring-kwanzub-primary" /></div>);
const TextAreaField = ({ label, ...props }: any) => (<div><label className="block text-xs font-medium text-kwanzub-light">{label}</label><textarea {...props} className="mt-1 w-full px-3 py-2 bg-gray-700 text-white rounded-md focus:outline-none focus:ring-2 focus:ring-kwanzub-primary" /></div>);
const SelectField = ({ label, options, ...props }: any) => (<div><label className="block text-xs font-medium text-kwanzub-light">{label}</label><select {...props} className="mt-1 w-full px-3 py-2 bg-gray-700 text-white rounded-md focus:outline-none focus:ring-2 focus:ring-kwanzub-primary">{options.map((opt: any) => <option key={opt.value} value={opt.value}>{opt.label}</option>)}</select></div>);
const CheckboxField = ({ label, ...props }: any) => (<div className="flex items-center"><input type="checkbox" {...props} className="h-4 w-4 bg-gray-700 border-gray-600 rounded text-kwanzub-primary focus:ring-kwanzub-primary" /><label className="ml-2 block text-sm text-kwanzub-light">{label}</label></div>);

export default BadgeManagement;

