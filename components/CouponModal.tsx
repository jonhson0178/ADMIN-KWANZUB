import React, { useState } from 'react';
import { Coupon, CouponType, CouponStatus } from '../types';
import Modal from './Modal';
import { useLocale } from '../context/LocaleContext';
import { useMockData } from '../hooks/useMockData';

interface CouponModalProps {
  coupon: Coupon | null;
  onClose: () => void;
}

const CouponModal: React.FC<CouponModalProps> = ({ coupon, onClose }) => {
  const { t } = useLocale();
  const { addCoupon, updateCoupon } = useMockData();
  const [formData, setFormData] = useState<Partial<Coupon>>(
    coupon || {
      code: '',
      type: CouponType.Percentage,
      value: 10,
      status: CouponStatus.Active,
      usageLimit: 100,
      expiresAt: '',
    }
  );

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    // @ts-ignore
    const val = type === 'number' ? (value === '' ? '' : parseFloat(value)) : value;
    setFormData(prev => ({ ...prev, [name]: val }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (coupon) {
      updateCoupon(formData as Coupon);
    } else {
      addCoupon(formData as Omit<Coupon, 'id' | 'usageCount' | 'createdAt'>);
    }
    onClose();
  };

  return (
    <Modal onClose={onClose} title={coupon ? t('marketing.editCoupon') : t('marketing.newCoupon')}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <InputField name="code" label={t('marketing.code')} value={formData.code || ''} onChange={handleInputChange} required />
        <div className="grid grid-cols-2 gap-4">
          <SelectField 
            name="type" 
            label={t('marketing.type')} 
            value={formData.type || CouponType.Percentage} 
            onChange={handleInputChange}
            options={[
              { value: CouponType.Percentage, label: t('marketing.percentage') },
              { value: CouponType.Fixed, label: t('marketing.fixed') },
            ]}
          />
          <InputField name="value" label={t('marketing.value')} value={formData.value || ''} onChange={handleInputChange} type="number" required />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <SelectField 
            name="status" 
            label={t('marketing.status')} 
            value={formData.status || CouponStatus.Active} 
            onChange={handleInputChange}
            options={[
              { value: CouponStatus.Active, label: t('marketing.active') },
              { value: CouponStatus.Inactive, label: t('marketing.inactive') },
            ]}
          />
          <InputField name="usageLimit" label={t('marketing.usageLimit')} value={formData.usageLimit ?? ''} placeholder={t('marketing.unlimited')} onChange={handleInputChange} type="number" />
        </div>
        <InputField name="expiresAt" label={t('marketing.expiresAt')} value={formData.expiresAt ? (formData.expiresAt.split('T')[0]) : ''} onChange={handleInputChange} type="date" />
        <div className="flex justify-end pt-4 border-t border-gray-700">
          <button type="submit" className="px-6 py-2 bg-kwanzub-primary text-white rounded-md hover:bg-kwanzub-primary-hover">{t('marketing.save')}</button>
        </div>
      </form>
    </Modal>
  );
};

// --- Form Field Components ---
const InputField = ({ label, ...props }: { label: string, [key: string]: any }) => (
    <div>
        <label htmlFor={props.name} className="block text-sm font-medium text-kwanzub-light">{label}</label>
        <input id={props.name} {...props} className="mt-1 w-full px-3 py-2 bg-gray-700 text-white rounded-md focus:outline-none focus:ring-2 focus:ring-kwanzub-primary" />
    </div>
);

const SelectField = ({ label, options, ...props }: { label: string, options: { value: string, label: string }[], [key: string]: any }) => (
    <div>
        <label htmlFor={props.name} className="block text-sm font-medium text-kwanzub-light">{label}</label>
        <select id={props.name} {...props} className="mt-1 w-full px-3 py-2 bg-gray-700 text-white rounded-md focus:outline-none focus:ring-2 focus:ring-kwanzub-primary">
            {options.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
        </select>
    </div>
);


export default CouponModal;