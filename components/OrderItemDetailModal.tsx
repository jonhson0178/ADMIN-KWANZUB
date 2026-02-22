
import React from 'react';
import { Order, OrderItem, Supplier, OrderItemStatus } from '../types';
import Modal from './Modal';
import { useLocale } from '../context/LocaleContext';
import { BanknotesIcon, ArrowUturnLeftIcon } from './Icons';

interface OrderItemDetailModalProps {
  item: OrderItem;
  order: Order;
  supplier: Supplier;
  onClose: () => void;
  onUpdateStatus: (orderId: string, itemId: string, status: OrderItemStatus) => void;
}

const OrderItemDetailModal: React.FC<OrderItemDetailModalProps> = ({ item, order, supplier, onClose, onUpdateStatus }) => {
  const { t } = useLocale();

  const formatCurrency = (value: number) => `Kz ${value.toLocaleString('pt-AO', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

  const handleRefund = () => {
    onUpdateStatus(order.id, item.id, OrderItemStatus.Refunded);
    onClose();
  };
  
  const handleReturn = () => {
    onUpdateStatus(order.id, item.id, OrderItemStatus.Returned);
    onClose();
  };
  
  const getStatusBadge = (status: OrderItemStatus) => {
    const statusMap = {
      [OrderItemStatus.Fulfilled]: 'bg-green-900 text-green-300',
      [OrderItemStatus.Refunded]: 'bg-purple-900 text-purple-300',
      [OrderItemStatus.Returned]: 'bg-orange-900 text-orange-300',
    };
    const statusKey = `orders.${status.toLowerCase() as keyof object}`;
    const statusText = t(statusKey) || status;
    return <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${statusMap[status]}`}>{statusText}</span>;
  };


  return (
    <Modal onClose={onClose} title={`${t('orders.itemDetails')}: ${item.productName}`}>
      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Left Column */}
            <div className="space-y-3">
                 <p><strong className="text-kwanzub-light">{t('products.price')}:</strong> {formatCurrency(item.unitPrice)}</p>
                 <p><strong className="text-kwanzub-light">{t('orders.quantity')}:</strong> {item.quantity}</p>
                 <p><strong className="text-kwanzub-light">{t('orders.subtotal')}:</strong> {formatCurrency(item.unitPrice * item.quantity)}</p>
                 <p><strong className="text-kwanzub-light">{t('orders.itemStatus')}:</strong> {getStatusBadge(item.status)}</p>
            </div>
            {/* Right Column */}
            <div className="space-y-3">
                <p><strong className="text-kwanzub-light">{t('orders.soldBy')}:</strong> {supplier.name}</p>
                <p><strong className="text-kwanzub-light">{t('orders.address')}:</strong> {order.shippingAddress}</p>
            </div>
        </div>
        
        {/* Actions */}
        <div className="border-t border-gray-700 pt-4 flex justify-end space-x-2">
            {item.status === OrderItemStatus.Fulfilled && (
                <>
                    <button onClick={handleRefund} className="flex items-center px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700">
                        <BanknotesIcon /> <span className="ml-2">{t('orders.refundItem')}</span>
                    </button>
                    <button onClick={handleReturn} className="flex items-center px-4 py-2 bg-orange-600 text-white rounded-md hover:bg-orange-700">
                        <ArrowUturnLeftIcon /> <span className="ml-2">{t('orders.processReturn')}</span>
                    </button>
                </>
            )}
        </div>

      </div>
    </Modal>
  );
};

export default OrderItemDetailModal;
