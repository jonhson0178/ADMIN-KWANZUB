
import React, { useState } from 'react';
import { Product, ProductStatus, ProductType, Variation, Media } from '../types';
import { useLocale } from '../context/LocaleContext';
import { useMockData } from '../hooks/useMockData';
import Modal from './Modal';
import { CubeIcon, CurrencyDollarIcon, ArchiveIcon, MagnifyingGlassIcon, TruckIcon, ShieldCheckIcon, DocumentTextIcon, VideoCameraIcon, TrashIcon, StarIcon, CheckCircleIcon, PencilIcon } from './Icons';

interface ProductEditModalProps {
    product: Product | null;
    onClose: () => void;
    onSave: (product: Product) => void;
}

type Tab = 'general' | 'inventory' | 'logistics' | 'seo' | 'variations' | 'media' | 'moderation';

const ProductEditModal: React.FC<ProductEditModalProps> = ({ product, onClose, onSave }) => {
    const { t } = useLocale();
    const { suppliers, productCategories } = useMockData();
    const [activeTab, setActiveTab] = useState<Tab>('general');
    const [productData, setProductData] = useState<Product>(
        product || {
            id: `new-${Date.now()}`,
            name: '',
            shortDescription: '',
            description: '',
            supplierId: suppliers[0]?.id || '',
            supplierName: suppliers[0]?.name || '',
            category: productCategories[0] || '',
            price: 0,
            promoPrice: undefined,
            cost: undefined,
            status: ProductStatus.Pending,
            stock: 0,
            imageUrl: 'https://placehold.co/600x400/1a202c/e2e8f0?text=New+Product',
            sku: '',
            ean: '',
            sales: 0,
            createdAt: new Date().toISOString(),
            brand: '',
            tags: [],
            type: ProductType.Simple,
            seo: { metaTitle: '', metaDescription: '', slug: '', keywords: '' },
            logistics: { weight: 0, width: 0, height: 0, length: 0, shippingClass: '', freeShipping: false },
            variations: [],
            media: [],
        }
    );

    const [editingVariation, setEditingVariation] = useState<Variation | 'new' | null>(null);
    const [currentVariationData, setCurrentVariationData] = useState<Partial<Variation>>({});
    const [newAttribute, setNewAttribute] = useState({ name: '', value: ''});


    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target;
        // @ts-ignore
        const isCheckbox = e.target.type === 'checkbox';
        // @ts-ignore
        const val = isCheckbox ? e.target.checked : value;
        
        if (name === 'type') {
            setProductData(prev => ({...prev, type: value as ProductType }));
            return;
        }

        setProductData(prev => ({ ...prev, [name]: val }));
    };
    
    const handleNestedInputChange = (section: 'seo' | 'logistics', e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        // @ts-ignore
        const isCheckbox = e.target.type === 'checkbox';
        // @ts-ignore
        const val = isCheckbox ? e.target.checked : value;
        setProductData(prev => ({
            ...prev,
            [section]: {
                ...prev[section],
                [name]: val
            }
        }));
    };
    
    // --- Variation Handlers ---
    const handleStartEditVariation = (variation: Variation | 'new') => {
        setEditingVariation(variation);
        if (variation === 'new') {
            setCurrentVariationData({ id: `var-${Date.now()}`, attributes: {}, price: 0, stock: 0, sku: '' });
        } else {
            setCurrentVariationData(variation);
        }
    };
    
    const handleVariationDataChange = (field: keyof Variation, value: any) => {
        setCurrentVariationData(prev => ({...prev, [field]: value}));
    };
    
    const handleVariationAttributeChange = (name: string, value: string) => {
        setCurrentVariationData(prev => ({
            ...prev,
            attributes: {
                ...(prev.attributes || {}),
                [name]: value
            }
        }));
    };

    const handleAddNewAttribute = () => {
        if (newAttribute.name && newAttribute.value) {
            handleVariationAttributeChange(newAttribute.name, newAttribute.value);
            setNewAttribute({ name: '', value: '' });
        }
    };

    const handleSaveVariation = () => {
        if (!currentVariationData.id) return;
        const variations = productData.variations || [];
        const existingIndex = variations.findIndex(v => v.id === currentVariationData.id);
        
        let newVariations: Variation[];
        if (existingIndex > -1) {
            newVariations = variations.map(v => v.id === currentVariationData.id ? currentVariationData as Variation : v);
        } else {
            newVariations = [...variations, currentVariationData as Variation];
        }
        setProductData(prev => ({ ...prev, variations: newVariations }));
        setEditingVariation(null);
    };
    
    const handleRemoveVariation = (id: string) => {
        setProductData(prev => ({...prev, variations: prev.variations?.filter(v => v.id !== id)}));
    };
    
     // --- Media Handlers ---
    const handleAddMedia = () => {
        const newMedia: Media = {
            id: `media-${Date.now()}`,
            type: 'image',
            url: `https://placehold.co/600x400/1a202c/e2e8f0?text=Image+${(productData.media?.length || 0) + 1}`,
            isPrimary: (productData.media?.length || 0) === 0,
        };
        setProductData(prev => ({...prev, media: [...(prev.media || []), newMedia]}));
    };
    
    const handleRemoveMedia = (id: string) => {
        setProductData(prev => {
            const newMedia = prev.media?.filter(m => m.id !== id) || [];
            // If the primary image was deleted, make the first one primary
            if (!newMedia.some(m => m.isPrimary) && newMedia.length > 0) {
                newMedia[0].isPrimary = true;
            }
            return {...prev, media: newMedia };
        });
    };
    
    const handleSetPrimaryMedia = (id: string) => {
        setProductData(prev => ({...prev, media: prev.media?.map(m => ({...m, isPrimary: m.id === id}))}));
    };


    const TabButton: React.FC<{tab: Tab, label: string, icon: React.ReactNode}> = ({ tab, label, icon }) => (
        <button onClick={() => setActiveTab(tab)} className={`flex items-center gap-2 ${activeTab === tab ? 'border-kwanzub-primary text-kwanzub-primary' : 'border-transparent text-gray-400 hover:text-gray-200 hover:border-gray-500'} whitespace-nowrap py-3 px-4 border-b-2 font-medium text-sm`}>
            {icon} {label}
        </button>
    );
    
    const renderContent = () => {
        switch (activeTab) {
            case 'general': return (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <InputField name="name" label={t('products.productName')} value={productData.name} onChange={handleInputChange} className="md:col-span-2" />
                    <TextAreaField name="shortDescription" label={t('products.shortDescription')} value={productData.shortDescription || ''} onChange={handleInputChange} className="md:col-span-2" rows={2}/>
                    <TextAreaField name="description" label={t('products.description')} value={productData.description} onChange={handleInputChange} className="md:col-span-2" />
                    <SelectField name="supplierId" label={t('products.supplier')} value={productData.supplierId} onChange={handleInputChange} options={suppliers.map(s => ({ value: s.id, label: s.name }))} />
                    <SelectField name="category" label={t('products.category')} value={productData.category} onChange={handleInputChange} options={productCategories.map(c => ({ value: c, label: c }))} />
                    <InputField name="brand" label={t('products.brand')} value={productData.brand || ''} onChange={handleInputChange} />
                    <InputField name="ean" label={t('products.ean')} value={productData.ean || ''} onChange={handleInputChange} />
                    <InputField name="tags" label={t('products.tags')} value={productData.tags?.join(', ') || ''} onChange={e => setProductData(p => ({...p, tags: e.target.value.split(',').map(t=>t.trim())}))} />
                    <SelectField name="type" label={t('products.productType')} value={productData.type} onChange={handleInputChange} options={[{value: ProductType.Simple, label: t('products.simple')}, {value: ProductType.Variable, label: t('products.variable')}]} />
                </div>
            );
            case 'inventory': return (
                 <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <InputField name="sku" label={t('products.sku')} value={productData.sku} onChange={handleInputChange} disabled={productData.type === ProductType.Variable}/>
                    {productData.type === ProductType.Simple && (
                        <InputField name="stock" label={t('products.stock')} value={productData.stock.toString()} onChange={handleInputChange} type="number"/>
                    )}
                    <InputField name="price" label={t('products.basePrice')} value={productData.price.toString()} onChange={handleInputChange} type="number" disabled={productData.type === ProductType.Variable} />
                    <InputField name="promoPrice" label={t('products.promoPrice')} value={productData.promoPrice?.toString() || ''} onChange={handleInputChange} type="number" />
                    <InputField name="cost" label={t('products.costPrice')} value={productData.cost?.toString() || ''} onChange={handleInputChange} type="number" />
                </div>
            );
            case 'logistics': return (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 items-end">
                    <InputField name="weight" label={`${t('products.weight')} (kg)`} value={productData.logistics.weight.toString()} onChange={e => handleNestedInputChange('logistics', e)} type="number" />
                    <InputField name="width" label={`${t('products.width')} (cm)`} value={productData.logistics.width.toString()} onChange={e => handleNestedInputChange('logistics', e)} type="number" />
                    <InputField name="height" label={`${t('products.height')} (cm)`} value={productData.logistics.height.toString()} onChange={e => handleNestedInputChange('logistics', e)} type="number" />
                    <InputField name="length" label={`${t('products.length')} (cm)`} value={productData.logistics.length.toString()} onChange={e => handleNestedInputChange('logistics', e)} type="number" />
                    <InputField name="shippingClass" label={t('products.shippingClass')} value={productData.logistics.shippingClass || ''} onChange={e => handleNestedInputChange('logistics', e)} className="col-span-2 md:col-span-3" />
                    <CheckboxField name="freeShipping" label={t('products.freeShipping')} checked={productData.logistics.freeShipping} onChange={e => handleNestedInputChange('logistics', e)} />
                </div>
            );
            case 'seo': return (
                <div className="space-y-4">
                    <InputField name="metaTitle" label={t('products.metaTitle')} value={productData.seo.metaTitle} onChange={e => handleNestedInputChange('seo', e)} />
                    <TextAreaField name="metaDescription" label={t('products.metaDescription')} value={productData.seo.metaDescription} onChange={e => handleNestedInputChange('seo', e)} />
                    <InputField name="slug" label={t('products.slug')} value={productData.seo.slug} onChange={e => handleNestedInputChange('seo', e)} />
                    <InputField name="keywords" label={t('products.keywords')} value={productData.seo.keywords || ''} onChange={e => handleNestedInputChange('seo', e)} />
                </div>
            );
            case 'variations': 
                if (productData.type === ProductType.Simple) {
                    return <button onClick={() => setProductData(p => ({...p, type: ProductType.Variable}))} className="px-4 py-2 bg-kwanzub-primary text-white rounded-md hover:bg-kwanzub-primary-hover">{t('products.convertToVariable')}</button>
                }
                return (
                    <div>
                        {editingVariation && (
                             <div className="bg-gray-700/50 p-4 rounded-lg mb-4 space-y-4">
                                <h4 className="text-lg font-semibold text-white">{editingVariation === 'new' ? t('products.addVariation') : t('products.editVariation')}</h4>
                                <div className="grid grid-cols-2 gap-4">
                                    <InputField label={t('products.sku')} value={currentVariationData.sku || ''} onChange={(e: any) => handleVariationDataChange('sku', e.target.value)} />
                                    <InputField label={t('products.price')} type="number" value={currentVariationData.price || ''} onChange={(e: any) => handleVariationDataChange('price', Number(e.target.value))} />
                                    <InputField label={t('products.stock')} type="number" value={currentVariationData.stock || ''} onChange={(e: any) => handleVariationDataChange('stock', Number(e.target.value))} />
                                </div>
                                <div>
                                    <h5 className="text-sm font-medium text-kwanzub-light mb-2">{t('products.attributes')}</h5>
                                    {Object.entries(currentVariationData.attributes || {}).map(([name, value]) => (
                                        <div key={name} className="flex items-center gap-2 mb-2">
                                            <span className="text-white font-semibold">{name}:</span>
                                            <span className="text-kwanzub-lighter">{value}</span>
                                        </div>
                                    ))}
                                    <div className="flex items-end gap-2 mt-2">
                                        <InputField label={t('products.attributeName')} value={newAttribute.name} onChange={(e: any) => setNewAttribute(p => ({...p, name: e.target.value}))}/>
                                        <InputField label={t('products.attributeValue')} value={newAttribute.value} onChange={(e: any) => setNewAttribute(p => ({...p, value: e.target.value}))}/>
                                        <button onClick={handleAddNewAttribute} className="px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm whitespace-nowrap">{t('products.addAttribute')}</button>
                                    </div>
                                </div>
                                <div className="flex justify-end gap-2">
                                    <button onClick={() => setEditingVariation(null)} className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700">{t('modals.close')}</button>
                                    <button onClick={handleSaveVariation} className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700">{t('products.saveVariation')}</button>
                                </div>
                             </div>
                        )}

                        <div className="space-y-2">
                            {(productData.variations || []).map(v => (
                                <div key={v.id} className="flex items-center justify-between p-3 bg-gray-700/50 rounded-lg">
                                    <div>
                                        <p className="text-white font-semibold">{Object.entries(v.attributes).map(([k, val]) => `${k}: ${val}`).join(' / ')}</p>
                                        <p className="text-sm text-kwanzub-light">SKU: {v.sku} | {t('products.price')}: {v.price} | {t('products.stock')}: {v.stock}</p>
                                    </div>
                                    <div className="flex gap-2">
                                        <button onClick={() => handleStartEditVariation(v)} className="p-2 text-blue-400 hover:text-blue-200"><PencilIcon/></button>
                                        <button onClick={() => handleRemoveVariation(v.id)} className="p-2 text-red-400 hover:text-red-200"><TrashIcon/></button>
                                    </div>
                                </div>
                            ))}
                        </div>
                        <button onClick={() => handleStartEditVariation('new')} className="mt-4 px-4 py-2 bg-kwanzub-primary text-white rounded-md hover:bg-kwanzub-primary-hover">{t('products.addVariation')}</button>
                    </div>
                );
            case 'media': return (
                 <div>
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                        {(productData.media || []).map(m => (
                            <div key={m.id} className="relative group">
                                <img src={m.url} alt="product media" className="w-full h-32 object-cover rounded-lg"/>
                                <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button onClick={() => handleSetPrimaryMedia(m.id)} className="p-2 text-yellow-400 hover:text-yellow-200" title={t('products.setPrimary')}><StarIcon /></button>
                                    <button onClick={() => handleRemoveMedia(m.id)} className="p-2 text-red-400 hover:text-red-200" title={t('products.removeImage')}><TrashIcon /></button>
                                </div>
                                {m.isPrimary && <div className="absolute top-1 right-1 bg-yellow-500 text-white text-xs px-2 py-0.5 rounded-full">{t('products.primary')}</div>}
                            </div>
                        ))}
                    </div>
                     <button onClick={handleAddMedia} className="mt-4 px-4 py-2 bg-kwanzub-primary text-white rounded-md hover:bg-kwanzub-primary-hover">{t('products.uploadImage')}</button>
                 </div>
            );
            case 'moderation': return (
                <div className="space-y-4">
                     <SelectField name="status" label={t('products.status')} value={productData.status} onChange={handleInputChange} options={Object.values(ProductStatus).map(s => ({ value: s, label: t(`products.${s.toLowerCase().replace('changesrequested', 'changesRequested')}`) }))} />
                     <TextAreaField name="rejectionReason" label={t('products.rejectionReason')} value={productData.rejectionReason || ''} onChange={handleInputChange} disabled={productData.status !== ProductStatus.ChangesRequested} />
                </div>
            );
            default: return null;
        }
    };

    return (
        <Modal onClose={onClose} title={product ? t('products.editProduct') : t('products.newProduct')}>
            <div className="border-b border-gray-700">
                <nav className="-mb-px flex space-x-4 overflow-x-auto" aria-label="Tabs">
                    <TabButton tab="general" label={t('products.generalInfo')} icon={<CubeIcon/>} />
                    <TabButton tab="inventory" label={t('products.inventory')} icon={<CurrencyDollarIcon/>} />
                    <TabButton tab="logistics" label={t('products.logistics')} icon={<TruckIcon/>} />
                    <TabButton tab="variations" label={t('products.variations')} icon={<ArchiveIcon/>} />
                    <TabButton tab="media" label={t('products.media')} icon={<VideoCameraIcon/>} />
                    <TabButton tab="seo" label={t('products.seo')} icon={<MagnifyingGlassIcon/>} />
                    <TabButton tab="moderation" label={t('products.moderation')} icon={<ShieldCheckIcon/>} />
                </nav>
            </div>
            <div className="pt-6 min-h-[300px]">{renderContent()}</div>
            <div className="mt-6 pt-4 border-t border-gray-700 flex justify-end gap-3">
                <button onClick={onClose} className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700">{t('modals.close')}</button>
                <button onClick={() => onSave(productData)} className="px-4 py-2 bg-kwanzub-primary text-white rounded-md hover:bg-kwanzub-primary-hover">{t('settings.save')}</button>
            </div>
        </Modal>
    );
};

// --- Form Field Components ---
const InputField = ({ label, className = '', ...props }) => (
    <div className={className}>
        <label htmlFor={props.name} className="block text-sm font-medium text-kwanzub-light">{label}</label>
        <input id={props.name} {...props} className="mt-1 w-full px-3 py-2 bg-gray-700 text-white rounded-md focus:outline-none focus:ring-2 focus:ring-kwanzub-primary disabled:bg-gray-800 disabled:cursor-not-allowed" />
    </div>
);

const TextAreaField = ({ label, className = '', ...props }) => (
    <div className={className}>
        <label htmlFor={props.name} className="block text-sm font-medium text-kwanzub-light">{label}</label>
        <textarea id={props.name} {...props} className="mt-1 w-full px-3 py-2 bg-gray-700 text-white rounded-md focus:outline-none focus:ring-2 focus:ring-kwanzub-primary" />
    </div>
);

const SelectField = ({ label, options, ...props }) => (
    <div>
        <label htmlFor={props.name} className="block text-sm font-medium text-kwanzub-light">{label}</label>
        <select id={props.name} {...props} className="mt-1 w-full px-3 py-2 bg-gray-700 text-white rounded-md focus:outline-none focus:ring-2 focus:ring-kwanzub-primary">
            {options.map((opt: any) => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
        </select>
    </div>
);

const CheckboxField = ({ label, ...props }) => (
  <div className="flex items-center h-full pt-6">
    <input id={props.name} type="checkbox" {...props} className="h-4 w-4 bg-gray-700 border-gray-600 rounded text-kwanzub-primary focus:ring-kwanzub-primary" />
    <label htmlFor={props.name} className="ml-2 block text-sm font-medium text-kwanzub-light">{label}</label>
  </div>
);


export default ProductEditModal;
