
import React from 'react';
import { OrderEvent, OrderStatus } from '../types';
import { CheckBadgeIcon, CheckCircleIcon, CubeIcon, CurrencyDollarIcon, NoSymbolIcon, ShoppingBagIcon, TruckIcon } from './Icons';

interface TimelineProps {
  events: OrderEvent[];
}

const getEventIcon = (status: OrderStatus | 'Payment Confirmed') => {
    switch(status) {
        case 'Payment Confirmed': return <CurrencyDollarIcon />;
        case OrderStatus.Pending: return <ShoppingBagIcon />;
        case OrderStatus.Processing: return <CubeIcon />;
        case OrderStatus.Shipped: return <TruckIcon />;
        case OrderStatus.Delivered: return <CheckBadgeIcon />;
        case OrderStatus.Cancelled: return <NoSymbolIcon />;
        default: return <CheckCircleIcon />;
    }
}

const Timeline: React.FC<TimelineProps> = ({ events }) => {
  return (
    <ol className="relative border-l border-gray-700">
      {events.map((event, index) => (
        <li key={index} className="mb-6 ml-6">
          <span className="absolute flex items-center justify-center w-6 h-6 bg-blue-900 rounded-full -left-3 ring-8 ring-gray-900">
            {getEventIcon(event.status)}
          </span>
          <div className="ml-2">
            <h3 className="flex items-center mb-1 text-base font-semibold text-white">
              {event.status}
            </h3>
            <time className="block mb-2 text-xs font-normal leading-none text-gray-500">
              {new Date(event.timestamp).toLocaleString()}
            </time>
            <p className="text-sm font-normal text-gray-400">{event.details}</p>
          </div>
        </li>
      ))}
    </ol>
  );
};

export default Timeline;
