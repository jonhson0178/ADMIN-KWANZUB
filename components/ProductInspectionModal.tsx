

import React, { useState } from 'react';
import { Product, ProductStatus } from '../types';
import { useLocale } from '../context/LocaleContext';
import { XCircleIcon, CheckCircleIcon, NoSymbolIcon, PencilIcon } from './Icons';

interface ProductInspectionModalProps {
  product: Product;
  onClose: () => void;
  onAction: (product: Product, status: ProductStatus, reason?: string) => void;
}

type Tab = 'generalInfo' | 'media' | 'logisticsSeo';

const ProductInspectionModal: React.FC<ProductInspectionModalProps> = ({ product, onClose, onAction }) => {
    const { t } = useLocale();
    const [activeTab, setActiveTab] = useState<Tab>('generalInfo');
    const [reason, setReason] = useState(product.rejectionReason || '');

    const handleAction = (status: ProductStatus) => {
        // FIX: Changed ProductStatus.Rejected to ProductStatus.Removed as 'Rejected' does not exist in the enum.
        if ((status === ProductStatus.Removed || status === ProductStatus.ChangesRequested) && !reason.trim()) {
            alert(t('moderation.reasonForAction'));
            return;
        }
        onAction(product, status, reason);
    };

    const TabButton: React.FC<{tab: Tab, label: string}> = ({ tab, label }) => (
        <button onClick={() => setActiveTab(tab)} className={`px-4 py-2 text-sm font-medium rounded-t-lg ${activeTab === tab ? 'bg-kwanzub-darker text-white' : 'text-kwanzub-light hover:bg-gray-800'}`}>
            {label}
        </button>
    );

    const renderContent = () => {
        switch(activeTab) {
            case 'generalInfo': return (
                <div className="space-y-4 text-sm">
                    <p><strong>{t('products.productName')}:</strong> {product.name}</p>
                    <p><strong>{t('products.shortDescription')}:</strong> {product.shortDescription}</p>
                    <p><strong>{t('products.description')}:</strong> {product.description}</p>
                    <p><strong>{t('products.category')}:</strong> {product.category}</p>
                    <p><strong>{t('products.brand')}:</strong> {product.brand}</p>
                    <p><strong>{t('products.tags')}:</strong> {product.tags?.join(', ')}</p>
                </div>
            );
            case 'media': return (
                <div className="grid grid-cols-3 gap-4">
                    {product.media?.map(m => <img key={m.id} src={m.url} alt="media" className="w-full h-auto rounded-lg"/>)}
                    {!product.media && <img src={product.imageUrl} alt="primary" className="w-full h-auto rounded-lg"/>}
                </div>
            );
            case 'logisticsSeo': return (
                 <div className="space-y-4 text-sm grid grid-cols-2 gap-x-8">
                    <h4 className="text-lg font-semibold text-white col-span-2">{t('products.logistics')}</h4>
                    <p><strong>{t('products.weight')}:</strong> {product.logistics.weight} kg</p>
                    <p><strong>{t('products.dimensions')}:</strong> {product.logistics.length}x{product.logistics.width}x{product.logistics.height} cm</p>
                    <p><strong>{t('products.freeShipping')}:</strong> {product.logistics.freeShipping ? 'Yes' : 'No'}</p>

                     <h4 className="text-lg font-semibold text-white col-span-2 mt-4">{t('products.seo')}</h4>
                    <p><strong>{t('products.metaTitle')}:</strong> {product.seo.metaTitle}</p>
                    <p><strong>{t('products.slug')}:</strong> /{product.seo.slug}</p>
                    <p className="col-span-2"><strong>{t('products.metaDescription')}:</strong> {product.seo.metaDescription}</p>
                    <p><strong>{t('products.keywords')}:</strong> {product.seo.keywords}</p>
                </div>
            )
        }
    }

    return (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4" onClick={onClose}>
            <div className="bg-kwanzub-dark rounded-lg shadow-xl w-full max-w-4xl h-full max-h-[90vh] flex flex-col" onClick={e => e.stopPropagation()}>
                {/* Header */}
                <div className="flex justify-between items-center p-4 border-b border-gray-700 bg-kwanzub-darker rounded-t-lg">
                    <h2 className="text-xl font-semibold text-white">{t('moderation.productInspectionPanel')}</h2>
                    <button onClick={onClose} className="p-1 text-kwanzub-light hover:text-white"><XCircleIcon /></button>
                </div>

                {/* Actions Bar */}
                <div className="p-4 border-b border-gray-700 space-y-3">
                    <div className="flex flex-wrap gap-2">
                        <button onClick={() => handleAction(ProductStatus.Approved)} className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"><CheckCircleIcon /> {t('moderation.approve')}</button>
                        <button onClick={() => handleAction(ProductStatus.ChangesRequested)} className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-yellow-600 text-white rounded-md hover:bg-yellow-700"><PencilIcon /> {t('moderation.requestChanges')}</button>
                        {/* FIX: Changed ProductStatus.Rejected to ProductStatus.Removed as 'Rejected' does not exist in the enum. */}
                        <button onClick={() => handleAction(ProductStatus.Removed)} className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"><NoSymbolIcon /> {t('moderation.reject')}</button>
                    </div>
                    <div>
                        <textarea
                            value={reason}
                            onChange={e => setReason(e.target.value)}
                            placeholder={t('moderation.reasonForAction')}
                            className="w-full p-2 bg-gray-800 text-white rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-kwanzub-primary"
                            rows={2}
                        />
                    </div>
                </div>
                
                {/* Content */}
                <div className="flex-1 p-4 overflow-y-auto">
                    <div className="border-b border-gray-700 mb-4">
                        <nav className="-mb-px flex space-x-2" aria-label="Tabs">
                            <TabButton tab="generalInfo" label={t('moderation.generalInfo')} />
                            <TabButton tab="media" label={t('moderation.media')} />
                            <TabButton tab="logisticsSeo" label={t('moderation.logisticsSeo')} />
                        </nav>
                    </div>
                    <div className="bg-kwanzub-darker p-4 rounded-lg">
                        {renderContent()}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProductInspectionModal;
