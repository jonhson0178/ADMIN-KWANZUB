

import React, { useState } from 'react';
import { useMockData } from '../hooks/useMockData';
import { useLocale } from '../context/LocaleContext';
import { Order, OrderItem, Supplier, MarketplaceUser, OrderStatus, PaymentStatus } from '../types';
import Timeline from './Timeline';
import { ArrowUturnLeftIcon, BanknotesIcon, CheckCircleIcon, NoSymbolIcon, ShoppingBagIcon, StarIcon, TruckIcon, UserCircleIcon } from './Icons';
import OrderItemDetailModal from './OrderItemDetailModal';

interface OrderDetailProps {
  orderId: string;
  onBack: () => void;
}

const OrderDetail: React.FC<OrderDetailProps> = ({ orderId, onBack }) => {
  const { orders, suppliers, marketplaceUsers, updateOrderStatus, updatePaymentStatus, updateOrderItemStatus } = useMockData();
  const { t } = useLocale();
  const [selectedItem, setSelectedItem] = useState<OrderItem | null>(null);

  const order = orders.find(o => o.id === orderId);
  const supplier = suppliers.find(s => s.id === order?.supplierId);
  const buyer = marketplaceUsers.find(u => u.id === order?.buyerId);
  
  if (!order || !supplier || !buyer) {
    return (
      <div className="text-center p-10">
        <h2 className="text-2xl font-bold text-red-500">Order Not Found</h2>
        <button onClick={onBack} className="mt-4 px-4 py-2 bg-kwanzub-primary text-white rounded-md">
          Back to Orders
        </button>
      </div>
    );
  }

  const formatCurrency = (value: number) => `Kz ${value.toLocaleString('pt-AO', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  const formatDate = (dateStr: string | null) => dateStr ? new Date(dateStr).toLocaleString() : 'N/A';
  
  const handlePrint = () => {
    window.print();
  };

  const InfoCard: React.FC<{title: string; children: React.ReactNode; icon: React.ReactNode}> = ({title, children, icon}) => (
    <div className="bg-kwanzub-dark rounded-lg shadow-lg p-6">
      <div className="flex items-center mb-4">
        <div className="w-8 h-8 text-kwanzub-primary mr-3">{icon}</div>
        <h3 className="text-xl font-semibold text-white">{title}</h3>
      </div>
      <div className="space-y-2 text-sm text-kwanzub-lighter">{children}</div>
    </div>
  );
  
  return (
    <div className="order-detail-page">
      <style>{`
        @media print {
          body * {
            visibility: hidden;
          }
          .order-detail-page, .order-detail-page * {
            visibility: visible;
          }
          .order-detail-page {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
          }
          .no-print {
            display: none;
          }
           .print-bg-dark { background-color: #1a202c !important; -webkit-print-color-adjust: exact; }
           .print-text-white { color: white !important; -webkit-print-color-adjust: exact; }
        }
      `}</style>

      {/* Header */}
      <div className="flex justify-between items-center mb-6 no-print">
        <div>
          <button onClick={onBack} className="text-kwanzub-primary hover:underline">&larr; {t('orders.backToOrders')}</button>
          <h2 className="text-3xl font-bold text-white mt-1">{t('orders.orderDetails')} #{order.id.toUpperCase()}</h2>
        </div>
        <div className="flex space-x-2">
          <button onClick={() => updatePaymentStatus(order.id, PaymentStatus.Blocked)} className="px-4 py-2 bg-orange-600 text-white rounded-md hover:bg-orange-700">{t('financials.blockPayment')}</button>
          <button onClick={() => updatePaymentStatus(order.id, PaymentStatus.Paid)} className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700">{t('financials.approve')}</button>
          <button onClick={() => updateOrderStatus(order.id, OrderStatus.Refunded)} className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700">{t('financials.refundPayment')}</button>
          <button onClick={handlePrint} className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700">{t('orders.exportPdf')}</button>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column */}
        <div className="lg:col-span-2 space-y-6">
          <InfoCard title={t('orders.productDetails')} icon={<ShoppingBagIcon/>}>
             <table className="min-w-full">
              <thead className="text-xs text-kwanzub-light uppercase">
                <tr>
                  <th className="text-left py-2">{t('products.productName')}</th>
                  <th className="text-right py-2">{t('orders.quantity')}</th>
                  <th className="text-right py-2">{t('products.price')}</th>
                  <th className="text-right py-2">{t('orders.subtotal')}</th>
                </tr>
              </thead>
              <tbody>
                {order.items.map(item => (
                  <tr key={item.id} className="border-t border-gray-700">
                    <td className="py-2">
                      <button onClick={() => setSelectedItem(item)} className="text-kwanzub-primary hover:underline font-semibold text-left">
                        {item.productName}
                      </button>
                    </td>
                    <td className="text-right py-2">{item.quantity}</td>
                    <td className="text-right py-2">{formatCurrency(item.unitPrice)}</td>
                    <td className="text-right py-2">{formatCurrency(item.quantity * item.unitPrice)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </InfoCard>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <InfoCard title={t('orders.deliveryDetails')} icon={<TruckIcon/>}>
                <p><strong>{t('orders.address')}:</strong> {order.shippingAddress}</p>
                <p><strong>{t('orders.shippingCompany')}:</strong> {order.shippingCompany}</p>
                <p><strong>{t('orders.trackingCode')}:</strong> <span className="font-mono">{order.trackingCode}</span></p>
                <p><strong>{t('orders.shippedAt')}:</strong> {formatDate(order.shippedAt)}</p>
                <p><strong>{t('orders.deliveredAt')}:</strong> {formatDate(order.deliveredAt)}</p>
            </InfoCard>
            <InfoCard title={t('orders.financialDetails')} icon={<BanknotesIcon/>}>
                <p><strong>{t('orders.subtotal')}:</strong> {formatCurrency(order.items.reduce((sum, i) => sum + i.unitPrice * i.quantity, 0))}</p>
                <p><strong>{t('orders.shipping')}:</strong> {formatCurrency(order.shippingCost)}</p>
                <p><strong>{t('orders.total')}:</strong> <span className="font-bold text-white">{formatCurrency(order.total)}</span></p>
                <p><strong>{t('financials.commission')}:</strong> {formatCurrency(order.commission)}</p>
                <p><strong>{t('financials.profit')}:</strong> <span className="font-bold text-green-400">{formatCurrency(order.marketplaceProfit)}</span></p>
            </InfoCard>
          </div>
        </div>
        
        {/* Right Column */}
        <div className="space-y-6">
          <InfoCard title={t('orders.orderTimeline')} icon={<CheckCircleIcon/>}>
            <Timeline events={order.events} />
          </InfoCard>

           <InfoCard title={t('orders.buyerInfo')} icon={<UserCircleIcon/>}>
              <p><strong>{t('users.user')}:</strong> {buyer.name}</p>
              <p><strong>{t('users.type')}:</strong> {buyer.type}</p>
              <p><strong>{t('orders.purchaseHistory')}:</strong> {buyer.totalOrders} {t('orders.orders')}</p>
          </InfoCard>

           <InfoCard title={t('orders.storeInfo')} icon={<StarIcon/>}>
               <p><strong>{t('stores.storeName')}:</strong> {supplier.storeName}</p>
               <p><strong>{t('reputation.avgRating')}:</strong> {supplier.averageRating} / 5</p>
               <p><strong>{t('orders.completedOrders')}:</strong> {supplier.totalOrders} {t('orders.orders')}</p>
           </InfoCard>
        </div>
      </div>
       {selectedItem && supplier && (
        <OrderItemDetailModal
            item={selectedItem}
            order={order}
            supplier={supplier}
            onClose={() => setSelectedItem(null)}
            onUpdateStatus={updateOrderItemStatus}
        />
      )}
    </div>
  );
};

export default OrderDetail;
