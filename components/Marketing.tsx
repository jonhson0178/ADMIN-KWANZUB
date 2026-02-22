
import React, { useState } from 'react';
import { useMockData } from '../hooks/useMockData';
import { useLocale } from '../context/LocaleContext';
import { Coupon, CouponStatus, CouponType } from '../types';
import DataTable from './DataTable';
import CouponModal from './CouponModal';
import { TagIcon, PencilIcon, CheckCircleIcon, NoSymbolIcon } from './Icons';

const Marketing: React.FC = () => {
    const { coupons, updateCoupon } = useMockData();
    const { t } = useLocale();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingCoupon, setEditingCoupon] = useState<Coupon | null>(null);

    const handleNew = () => {
        setEditingCoupon(null);
        setIsModalOpen(true);
    };

    const handleEdit = (coupon: Coupon) => {
        setEditingCoupon(coupon);
        setIsModalOpen(true);
    };
    
    const handleCloseModal = () => {
        setIsModalOpen(false);
        setEditingCoupon(null);
    }

    const handleToggleStatus = (coupon: Coupon) => {
        const newStatus = coupon.status === CouponStatus.Active ? CouponStatus.Inactive : CouponStatus.Active;
        updateCoupon({ ...coupon, status: newStatus });
    };

    const getStatusBadge = (status: CouponStatus) => {
        const statusMap = {
            [CouponStatus.Active]: 'bg-green-900 text-green-300',
            [CouponStatus.Inactive]: 'bg-gray-700 text-gray-300',
            [CouponStatus.Expired]: 'bg-red-900 text-red-300',
        };
        const key = `marketing.${status.toLowerCase()}`;
        return <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${statusMap[status]}`}>{t(key)}</span>;
    };

    const columns = [
        { header: t('marketing.code'), accessor: (row: Coupon) => <span className="font-mono text-sm font-semibold">{row.code}</span> },
        { header: t('marketing.type'), accessor: (row: Coupon) => t(`marketing.${row.type.toLowerCase()}`) },
        { header: t('marketing.value'), accessor: (row: Coupon) => row.type === CouponType.Percentage ? `${row.value}%` : `Kz ${row.value.toLocaleString()}` },
        { header: t('marketing.status'), accessor: (row: Coupon) => getStatusBadge(row.status) },
        { header: t('marketing.usage'), accessor: (row: Coupon) => `${row.usageCount} / ${row.usageLimit ?? t('marketing.unlimited')}` },
        { header: t('marketing.expiresAt'), accessor: (row: Coupon) => row.expiresAt ? new Date(row.expiresAt).toLocaleDateString() : t('marketing.unlimited') },
        {
            header: t('marketing.actions'), accessor: (row: Coupon) => (
                <div className="flex items-center space-x-2">
                    <button onClick={() => handleEdit(row)} className="p-2 text-blue-400 hover:text-blue-200" title={t('marketing.editCoupon')}><PencilIcon /></button>
                    {row.status === CouponStatus.Active && <button onClick={() => handleToggleStatus(row)} className="p-2 text-red-400 hover:text-red-200" title={t('users.suspended')}><NoSymbolIcon /></button>}
                    {row.status === CouponStatus.Inactive && <button onClick={() => handleToggleStatus(row)} className="p-2 text-green-400 hover:text-green-200" title={t('users.active')}><CheckCircleIcon /></button>}
                </div>
            )
        },
    ];

    return (
        <div className="space-y-6">
            <h2 className="text-2xl font-bold text-white flex items-center">
                <TagIcon />
                <span className="ml-3">{t('marketing.title')}</span>
            </h2>

            <div className="bg-kwanzub-dark rounded-lg shadow-lg">
                <div className="p-6">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-xl font-semibold text-white">{t('marketing.coupons')}</h3>
                        <button onClick={handleNew} className="px-4 py-2 bg-kwanzub-primary text-white rounded-md hover:bg-kwanzub-primary-hover">{t('marketing.newCoupon')}</button>
                    </div>
                     <DataTable<Coupon>
                        columns={columns}
                        data={coupons}

                        title=""
                    />
                </div>
            </div>
            
            {isModalOpen && <CouponModal coupon={editingCoupon} onClose={handleCloseModal} />}
        </div>
    );
};

export default Marketing;
