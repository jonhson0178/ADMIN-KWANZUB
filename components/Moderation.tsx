

import React, { useState, useMemo } from 'react';
import { useMockData } from '../hooks/useMockData';
import { useLocale } from '../context/LocaleContext';
// FIX: Changed import path for Page and HighlightableEntity types to fix module resolution error.
import { Product, ProductStatus, Page, HighlightableEntity } from '../types';
import ProductInspectionModal from './ProductInspectionModal';
import { ShieldExclamationIcon } from './Icons';

interface ModerationProps {
  onNavigate: (page: Page, entity: HighlightableEntity | null) => void;
}

type ModerationTab = 'pendingProducts' | 'pendingStores' | 'reviews';

const Moderation: React.FC<ModerationProps> = ({ onNavigate }) => {
    const { t } = useLocale();
    const { products, updateProductStatus } = useMockData();
    const [activeTab, setActiveTab] = useState<ModerationTab>('pendingProducts');
    const [inspectingProduct, setInspectingProduct] = useState<Product | null>(null);

    const pendingProducts = useMemo(() => {
        return products.filter(p => p.status === ProductStatus.Pending || p.status === ProductStatus.ChangesRequested);
    }, [products]);

    const handleAction = (product: Product, status: ProductStatus, reason?: string) => {
        updateProductStatus(product.id, status, reason);
        setInspectingProduct(null);
    };
    
    const getStatusBadge = (status: ProductStatus) => {
        const statusKey = `products.${status.toLowerCase().replace('changesrequested', 'changesRequested')}`;
        const statusMap = {
            [ProductStatus.Pending]: 'bg-yellow-900 text-yellow-300',
            [ProductStatus.ChangesRequested]: 'bg-orange-900 text-orange-300'
        };
        return <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${statusMap[status]}`}>{t(statusKey)}</span>;
    };


    const renderContent = () => {
        switch(activeTab) {
            case 'pendingProducts':
                return (
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-700">
                          <thead className="bg-gray-700/50">
                            <tr>
                              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-kwanzub-light uppercase tracking-wider">{t('moderation.product')}</th>
                              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-kwanzub-light uppercase tracking-wider">{t('moderation.store')}</th>
                              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-kwanzub-light uppercase tracking-wider">{t('moderation.price')}</th>
                              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-kwanzub-light uppercase tracking-wider">{t('products.status')}</th>
                              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-kwanzub-light uppercase tracking-wider">{t('moderation.submittedOn')}</th>
                              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-kwanzub-light uppercase tracking-wider">{t('users.actions')}</th>
                            </tr>
                          </thead>
                          <tbody className="bg-kwanzub-dark divide-y divide-gray-700">
                            {pendingProducts.map((product) => (
                              <tr key={product.id}>
                                <td className="px-6 py-4 whitespace-nowrap"><div className="flex items-center"><img src={product.imageUrl} alt={product.name} className="w-10 h-10 rounded-md mr-4 object-cover" /><div><div className="font-medium text-white">{product.name}</div><div className="text-kwanzub-light text-xs">{product.category}</div></div></div></td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-kwanzub-lighter">{product.supplierName}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-kwanzub-lighter">Kz {product.price.toLocaleString()}</td>
                                <td className="px-6 py-4 whitespace-nowrap">{getStatusBadge(product.status)}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-kwanzub-lighter">{new Date(product.createdAt).toLocaleDateString()}</td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <button onClick={() => setInspectingProduct(product)} className="px-4 py-2 bg-kwanzub-primary text-white rounded-md hover:bg-kwanzub-primary-hover">{t('moderation.inspect')}</button>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                    </div>
                );
            case 'pendingStores':
            case 'reviews':
                return <div className="text-center p-8 text-kwanzub-light">Feature coming soon.</div>
        }
    }

    const TabButton: React.FC<{tab: ModerationTab, label: string}> = ({ tab, label }) => (
        <button onClick={() => setActiveTab(tab)} className={`${activeTab === tab ? 'border-kwanzub-primary text-kwanzub-primary' : 'border-transparent text-gray-400 hover:text-gray-200 hover:border-gray-500'} whitespace-nowrap py-3 px-4 border-b-2 font-medium text-sm`}>
            {label}
        </button>
    );

    return (
        <div className="space-y-6">
             <h2 className="text-2xl font-bold text-white flex items-center">
                <ShieldExclamationIcon />
                <span className="ml-3">{t('moderation.title')}</span>
            </h2>

            <div className="bg-kwanzub-dark rounded-lg shadow-lg">
                <div className="border-b border-gray-700">
                    <nav className="-mb-px flex space-x-4 px-6" aria-label="Tabs">
                        <TabButton tab="pendingProducts" label={`${t('moderation.pendingProducts')} (${pendingProducts.length})`} />
                        <TabButton tab="pendingStores" label={t('moderation.pendingStores')} />
                        <TabButton tab="reviews" label={t('moderation.reviews')} />
                    </nav>
                </div>
                <div className="p-6">
                    {renderContent()}
                </div>
            </div>

            {inspectingProduct && (
                <ProductInspectionModal
                    product={inspectingProduct}
                    onClose={() => setInspectingProduct(null)}
                    onAction={handleAction}
                />
            )}
        </div>
    );
};

export default Moderation;