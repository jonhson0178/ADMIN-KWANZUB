

import React, { useState, useMemo, useEffect } from 'react';
import DataTable from './DataTable';
import { useMockData } from '../hooks/useMockData';
// FIX: Changed import path for HighlightableEntity type to fix module resolution error.
import { Order, OrderStatus, PaymentStatus, LogisticStatus, BadgeType, HighlightableEntity } from '../types';
import { useLocale } from '../context/LocaleContext';

interface OrdersProps {
  onSelectOrder: (orderId: string) => void;
  highlightedEntity: HighlightableEntity | null;
  onHighlightComplete: () => void;
  searchTerm: string;
}

const Orders: React.FC<OrdersProps> = ({ onSelectOrder, highlightedEntity, onHighlightComplete, searchTerm }) => {
  const { orders, suppliers } = useMockData();
  const { t } = useLocale();
  
  // State for filters
  const [statusFilter, setStatusFilter] = useState<OrderStatus | 'All'>('All');
  const [supplierFilter, setSupplierFilter] = useState<string | 'All'>('All');
  const [periodFilter, setPeriodFilter] = useState<string>('All');

  useEffect(() => {
    if (highlightedEntity && highlightedEntity.type === 'order') {
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

  const getStatusBadge = (status: OrderStatus) => {
    const statusMap = {
      [OrderStatus.Processing]: 'bg-yellow-900 text-yellow-300',
      [OrderStatus.Shipped]: 'bg-blue-900 text-blue-300',
      [OrderStatus.Delivered]: 'bg-green-900 text-green-300',
      [OrderStatus.Cancelled]: 'bg-red-900 text-red-300',
      [OrderStatus.Pending]: 'bg-gray-700 text-gray-300',
      [OrderStatus.Refunded]: 'bg-purple-900 text-purple-300',
    };
    return <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${statusMap[status] || 'bg-gray-700 text-gray-300'}`}>{status}</span>;
  };

  const getPaymentStatusBadge = (status: PaymentStatus) => {
     const statusMap = {
      [PaymentStatus.Paid]: 'bg-green-900 text-green-300',
      [PaymentStatus.Pending]: 'bg-yellow-900 text-yellow-300',
      [PaymentStatus.Expired]: 'bg-red-900 text-red-300', // Assuming 'Expired' can mean 'Failed'
      [PaymentStatus.Blocked]: 'bg-orange-900 text-orange-300',
    };
    return <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${statusMap[status] || 'bg-gray-700 text-gray-300'}`}>{status}</span>;
  }

  const getLogisticStatusBadge = (status: LogisticStatus) => {
    const statusMap = {
        [LogisticStatus.AwaitingShipment]: 'text-gray-300',
        [LogisticStatus.InTransit]: 'text-blue-300',
        [LogisticStatus.OutForDelivery]: 'text-yellow-300',
        [LogisticStatus.Delivered]: 'text-green-300',
    };
     return <span className={`text-xs font-semibold ${statusMap[status]}`}>{status}</span>;
  }
  
  const formatCurrency = (value: number) => `Kz ${value.toLocaleString('pt-AO', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

  const filteredData = useMemo(() => {
    return orders.filter(order => {
      const matchesSearch = order.id.toLowerCase().includes(searchTerm.toLowerCase()) || 
                            order.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            order.items.some(item => item.productName.toLowerCase().includes(searchTerm.toLowerCase()));
      const matchesStatus = statusFilter === 'All' || order.status === statusFilter;
      const matchesSupplier = supplierFilter === 'All' || order.supplierId === supplierFilter;
      let matchesPeriod = true;
      if (periodFilter !== 'All') {
        const now = new Date();
        const daysToSubtract = parseInt(periodFilter, 10);
        const cutoffDate = new Date();
        cutoffDate.setDate(now.getDate() - daysToSubtract);
        matchesPeriod = new Date(order.date) >= cutoffDate;
      }
      return matchesSearch && matchesStatus && matchesSupplier && matchesPeriod;
    });
  }, [orders, searchTerm, statusFilter, supplierFilter, periodFilter]);

  const columns = [
    { header: t('orders.orderId'), accessor: (row: Order) => <button onClick={() => onSelectOrder(row.id)} className="font-mono text-sm text-kwanzub-primary hover:underline">{row.id.toUpperCase()}</button> },
    { header: t('orders.product'), accessor: (row: Order) => (
      <div>
        <span>{row.items[0].productName}</span>
        {row.items.length > 1 && <span className="text-xs text-kwanzub-light ml-1">+{row.items.length - 1} more</span>}
      </div>
    )},
    { header: t('orders.store'), accessor: (row: Order) => row.storeName },
    { header: t('orders.customer'), accessor: (row: Order) => row.customerName },
    { header: t('orders.total'), accessor: (row: Order) => formatCurrency(row.total) },
    { header: t('orders.profit'), accessor: (row: Order) => formatCurrency(row.marketplaceProfit) },
    { header: t('orders.orderStatus'), accessor: (row: Order) => getStatusBadge(row.status) },
    { header: t('orders.paymentStatus'), accessor: (row: Order) => getPaymentStatusBadge(row.paymentStatus) },
    { header: t('orders.logisticStatus'), accessor: (row: Order) => getLogisticStatusBadge(row.logisticStatus) },
    { header: t('orders.date'), accessor: (row: Order) => new Date(row.date).toLocaleDateString() },
    { header: t('orders.actions'), accessor: (row: Order) => (
      <button onClick={() => onSelectOrder(row.id)} className="px-3 py-1 text-sm bg-kwanzub-primary text-white rounded-md hover:bg-kwanzub-primary-hover">
        {t('financials.viewDetails')}
      </button>
    )},
  ];

  const FilterPanel = () => (
    <div className="flex flex-wrap gap-4 mb-4 p-4 bg-kwanzub-darker rounded-lg">
      <select onChange={e => setStatusFilter(e.target.value as any)} value={statusFilter} className="px-3 py-2 bg-gray-700 text-white rounded-md focus:outline-none focus:ring-2 focus:ring-kwanzub-primary">
        <option value="All">{t('orders.allStatuses')}</option>
        {Object.values(OrderStatus).map(s => <option key={s} value={s}>{s}</option>)}
      </select>
      <select onChange={e => setSupplierFilter(e.target.value)} value={supplierFilter} className="px-3 py-2 bg-gray-700 text-white rounded-md focus:outline-none focus:ring-2 focus:ring-kwanzub-primary">
        <option value="All">{t('orders.allSuppliers')}</option>
        {suppliers.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
      </select>
       <select onChange={e => setPeriodFilter(e.target.value)} value={periodFilter} className="px-3 py-2 bg-gray-700 text-white rounded-md focus:outline-none focus:ring-2 focus:ring-kwanzub-primary">
        <option value="All">{t('orders.allPeriods')}</option>
        <option value="1">{t('financials.daily')}</option>
        <option value="7">{t('financials.weekly')}</option>
        <option value="30">{t('financials.monthly')}</option>
        <option value="90">{t('orders.last3Months')}</option>
        <option value="180">{t('orders.last6Months')}</option>
        <option value="365">{t('financials.annually')}</option>
      </select>
    </div>
  );

  return (
    <div>
        <FilterPanel />
        <DataTable<Order>
          columns={columns}
          data={filteredData}
          title={t('orders.title')}
          exportable={true}
        />
    </div>
  );
};

export default Orders;