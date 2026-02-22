

import React, { useState, useMemo, useRef, useEffect } from 'react';
import DataTable from './DataTable';
import { useMockData } from '../hooks/useMockData';
// FIX: Changed import path for HighlightableEntity type to fix module resolution error.
import { Product, ProductStatus, HighlightableEntity } from '../types';
import { CubeIcon, CheckCircleIcon, ExclamationTriangleIcon, ShoppingCartIcon, DotsVerticalIcon, PencilIcon, TrashIcon, NoSymbolIcon, UserPlusIcon } from './Icons';
import StatCard from './StatCard';
import ProductEditModal from './ProductEditModal';
import { useLocale } from '../context/LocaleContext';

interface ProductsProps {
  highlightedEntity: HighlightableEntity | null;
  onHighlightComplete: () => void;
  searchTerm: string;
}

const Products: React.FC<ProductsProps> = ({ highlightedEntity, onHighlightComplete, searchTerm }) => {
  const { products, setProducts, suppliers, updateProductStatus } = useMockData();
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const { t } = useLocale();

  // State for selections and actions
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [activeActionsMenu, setActiveActionsMenu] = useState<string | null>(null);
  const actionsMenuRef = useRef<HTMLDivElement>(null);

  // Filters
  const [statusFilter, setStatusFilter] = useState<ProductStatus | 'All'>('All');
  const [supplierFilter, setSupplierFilter] = useState<string | 'All'>('All');
  const [categoryFilter, setCategoryFilter] = useState<string | 'All'>('All');
  
  useEffect(() => {
    if (highlightedEntity && highlightedEntity.type === 'product') {
        const row = document.querySelector(`[data-row-id='${highlightedEntity.id}']`);
        if (row) {
            row.scrollIntoView({ behavior: 'smooth', block: 'center' });
            row.classList.add('flash-animation');
            setTimeout(() => {
                row.classList.remove('flash-animation');
                onHighlightComplete();
            }, 2000); // Animation duration matches CSS
        } else {
            onHighlightComplete(); // Clear state even if row not visible
        }
    }
  }, [highlightedEntity, onHighlightComplete]);

  const handleOpenEditModal = (product: Product | null) => {
    setSelectedProduct(product);
    setIsEditModalOpen(true);
    setActiveActionsMenu(null);
  };
  
  const handleSaveProduct = (productToSave: Product) => {
      setProducts(prev => {
        const exists = prev.some(p => p.id === productToSave.id);
        if (exists) {
            return prev.map(p => p.id === productToSave.id ? productToSave : p);
        }
        return [...prev, productToSave];
      });
      setIsEditModalOpen(false);
  }
  
  const handleStatusChange = (product: Product, status: ProductStatus) => {
    updateProductStatus(product.id, status);
    setActiveActionsMenu(null);
  }
  
  const handleDelete = (product: Product) => {
    if(window.confirm(`Are you sure you want to delete "${product.name}"?`)){
        setProducts(prev => prev.filter(p => p.id !== product.id));
    }
    setActiveActionsMenu(null);
  }

  const handleSelectionChange = (id: string) => {
    setSelectedIds(prev => {
        const newSet = new Set(prev);
        if (newSet.has(id)) {
            newSet.delete(id);
        } else {
            newSet.add(id);
        }
        return newSet;
    });
  };

  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
        setSelectedIds(new Set(filteredData.map(p => p.id)));
    } else {
        setSelectedIds(new Set());
    }
  };

  const handleBulkStatusChange = (status: ProductStatus) => {
    setProducts(prev => prev.map(p => selectedIds.has(p.id) ? { ...p, status } : p));
    setSelectedIds(new Set());
  };

  const formatCurrency = (value: number) => `Kz ${value.toLocaleString('pt-AO', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

  const productStats = useMemo(() => ({
    total: products.length,
    active: products.filter(p => p.status === ProductStatus.Approved).length,
    pending: products.filter(p => p.status === ProductStatus.Pending).length,
    lowStock: products.filter(p => p.stock > 0 && p.stock < 10).length,
    topSeller: products.length > 0 ? products.reduce((prev, current) => (prev.sales > current.sales) ? prev : current) : { name: 'N/A', sales: 0 },
  }), [products]);
  
  const uniqueCategories = useMemo(() => [...new Set(products.map(p => p.category))], [products]);

  const filteredData = useMemo(() => {
    return products.filter(p => {
        const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = statusFilter === 'All' || p.status === statusFilter;
        const matchesSupplier = supplierFilter === 'All' || p.supplierId === supplierFilter;
        const matchesCategory = categoryFilter === 'All' || p.category === categoryFilter;
        return matchesSearch && matchesStatus && matchesSupplier && matchesCategory;
    });
  }, [products, searchTerm, statusFilter, supplierFilter, categoryFilter]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (actionsMenuRef.current && !actionsMenuRef.current.contains(event.target as Node)) {
        setActiveActionsMenu(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);
  
  const getStatusBadge = (status: ProductStatus) => {
    const statusKey = `products.${status.toLowerCase().replace('changesrequested', 'changesRequested')}`;
    const statusMap = {
        [ProductStatus.Approved]: 'bg-green-900 text-green-300',
        [ProductStatus.Pending]: 'bg-yellow-900 text-yellow-300',
        [ProductStatus.Removed]: 'bg-red-900 text-red-300',
        [ProductStatus.ChangesRequested]: 'bg-orange-900 text-orange-300'
    };
    return <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${statusMap[status]}`}>{t(statusKey)}</span>;
  };

  const columns = [
    { header: <input type="checkbox" onChange={handleSelectAll} className="form-checkbox h-4 w-4 bg-gray-700 border-gray-600 text-kwanzub-primary focus:ring-kwanzub-primary" />, accessor: (row: Product) => <input type="checkbox" checked={selectedIds.has(row.id)} onChange={() => handleSelectionChange(row.id)} className="form-checkbox h-4 w-4 bg-gray-700 border-gray-600 text-kwanzub-primary focus:ring-kwanzub-primary" />},
    { header: t('products.productName'), accessor: (row: Product) => <div className="flex items-center"><img src={row.imageUrl} alt={row.name} className="w-10 h-10 rounded-md mr-4 object-cover" /><div><div className="font-medium text-white">{row.name}</div><div className="text-kwanzub-light text-xs">{row.category}</div></div></div> },
    { header: t('products.supplier'), accessor: (row: Product) => row.supplierName },
    { header: t('products.price'), accessor: (row: Product) => formatCurrency(row.price) },
    { header: t('products.stock'), accessor: (row: Product) => row.stock },
    { header: t('products.sales'), accessor: (row: Product) => row.sales },
    { header: t('stores.createdAt'), accessor: (row: Product) => new Date(row.createdAt).toLocaleDateString() },
    { header: t('products.status'), accessor: (row: Product) => getStatusBadge(row.status) },
    { header: t('products.actions'), accessor: (row: Product) => (
      <div className="relative" ref={activeActionsMenu === row.id ? actionsMenuRef : null}>
        <button onClick={() => setActiveActionsMenu(activeActionsMenu === row.id ? null : row.id)} className="p-2 text-kwanzub-light hover:text-white rounded-full hover:bg-gray-700"><DotsVerticalIcon /></button>
        {activeActionsMenu === row.id && (
          <div className="absolute right-0 mt-2 w-56 bg-kwanzub-dark border border-gray-700 rounded-md shadow-lg z-10">
            <button onClick={() => handleOpenEditModal(row)} className="w-full text-left flex items-center px-4 py-2 text-sm text-kwanzub-lighter hover:bg-gray-700"><PencilIcon className="w-4 h-4 mr-2"/>{t('products.editProduct')}</button>
            {row.status !== ProductStatus.Approved && <button onClick={() => handleStatusChange(row, ProductStatus.Approved)} className="w-full text-left flex items-center px-4 py-2 text-sm text-green-400 hover:bg-gray-700"><CheckCircleIcon className="w-4 h-4 mr-2"/>{t('products.approved')}</button>}
            {row.status !== ProductStatus.ChangesRequested && <button onClick={() => handleStatusChange(row, ProductStatus.ChangesRequested)} className="w-full text-left flex items-center px-4 py-2 text-sm text-yellow-400 hover:bg-gray-700"><PencilIcon className="w-4 h-4 mr-2"/>{t('products.requestChanges')}</button>}
            {row.status !== ProductStatus.Removed && <button onClick={() => handleStatusChange(row, ProductStatus.Removed)} className="w-full text-left flex items-center px-4 py-2 text-sm text-red-400 hover:bg-gray-700"><NoSymbolIcon className="w-4 h-4 mr-2"/>{t('products.suspend')}</button>}
            <button onClick={() => handleDelete(row)} className="w-full text-left flex items-center px-4 py-2 text-sm text-red-400 hover:bg-gray-700"><TrashIcon className="w-4 h-4 mr-2"/>{t('stores.delete')}</button>
          </div>
        )}
      </div>
    )},
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <StatCard title={t('products.totalProducts')} value={productStats.total.toString()} icon={<CubeIcon />} />
        <StatCard title={t('products.activeProducts')} value={productStats.active.toString()} icon={<CheckCircleIcon className="text-green-400" />} />
        <StatCard title={t('products.pendingApproval')} value={productStats.pending.toString()} icon={<ExclamationTriangleIcon className="text-yellow-400" />} />
        <StatCard title={t('products.lowStock')} value={productStats.lowStock.toString()} icon={<ShoppingCartIcon className="text-orange-400" />} />
        <StatCard title={t('products.topSeller')} value={`${productStats.topSeller.name} (${productStats.topSeller.sales} sales)`} icon={<UserPlusIcon />} />
      </div>

      <div className="bg-kwanzub-dark rounded-lg shadow-lg p-6">
        <div className="flex justify-between items-center mb-4 flex-wrap gap-4">
          <h2 className="text-xl font-semibold text-white">{t('products.title')}</h2>
          <div className="flex items-center space-x-2 flex-wrap gap-2">
            <select value={statusFilter} onChange={e => setStatusFilter(e.target.value as any)} className="px-3 py-2 bg-gray-700 text-white rounded-md focus:outline-none focus:ring-2 focus:ring-kwanzub-primary">
              <option value="All">{t('products.allStatuses')}</option>
              {Object.values(ProductStatus).map(s => <option key={s} value={s}>{t(`products.${s.toLowerCase().replace('changesrequested', 'changesRequested')}`)}</option>)}
            </select>
            <select value={supplierFilter} onChange={e => setSupplierFilter(e.target.value)} className="px-3 py-2 bg-gray-700 text-white rounded-md focus:outline-none focus:ring-2 focus:ring-kwanzub-primary">
              <option value="All">{t('orders.allSuppliers')}</option>
              {suppliers.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
            <select value={categoryFilter} onChange={e => setCategoryFilter(e.target.value)} className="px-3 py-2 bg-gray-700 text-white rounded-md focus:outline-none focus:ring-2 focus:ring-kwanzub-primary">
              <option value="All">{t('stores.allCategories')}</option>
              {uniqueCategories.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
            <button onClick={() => handleOpenEditModal(null)} className="px-4 py-2 bg-kwanzub-primary text-white rounded-md hover:bg-kwanzub-primary-hover">{t('products.newProduct')}</button>
          </div>
        </div>

        {selectedIds.size > 0 && (
          <div className="bg-gray-700 p-3 rounded-md mb-4 flex items-center justify-between">
            <span className="text-white">{selectedIds.size} {t('products.itemsSelected')}</span>
            <div className="flex space-x-2">
              <span className="text-sm self-center mr-2">{t('products.bulkActions')}:</span>
              <button onClick={() => handleBulkStatusChange(ProductStatus.Approved)} className="px-3 py-1 text-xs bg-green-600 hover:bg-green-700 rounded">{t('products.approve')}</button>
              <button onClick={() => handleBulkStatusChange(ProductStatus.Removed)} className="px-3 py-1 text-xs bg-red-600 hover:bg-red-700 rounded">{t('products.suspend')}</button>
            </div>
          </div>
        )}

        <DataTable<Product> columns={columns} data={filteredData} title="" />
      </div>

      {isEditModalOpen && <ProductEditModal product={selectedProduct} onClose={() => setIsEditModalOpen(false)} onSave={handleSaveProduct} />}
    </div>
  );
};

export default Products;