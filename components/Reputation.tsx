

import React from 'react';
import DataTable from './DataTable';
import { useMockData } from '../hooks/useMockData';
import { Supplier } from '../types';
import { StarIcon } from './Icons';

const Reputation: React.FC = () => {
  const { suppliers } = useMockData();

  const renderRating = (rating: number) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <StarIcon key={i} className={`h-5 w-5 ${i <= rating ? 'text-yellow-400' : 'text-gray-600'}`} />
      );
    }
    return <div className="flex items-center">{stars} <span className="ml-2 text-kwanzub-light text-sm">({rating.toFixed(1)})</span></div>;
  };

  const columns = [
    { header: 'Supplier', accessor: (row: Supplier) => (
      <div>
        <div className="font-medium text-white">{row.name}</div>
        <div className="text-kwanzub-light">{row.storeName}</div>
      </div>
    )},
    { header: 'Average Rating', accessor: (row: Supplier) => renderRating(row.averageRating) },
    { header: 'Total Reviews', accessor: (row: Supplier) => row.reviewCount },
    { header: 'Unresolved Complaints', accessor: (row: Supplier) => (
      <span className={row.unresolvedComplaints > 0 ? 'text-red-400 font-semibold' : 'text-green-400'}>
        {row.unresolvedComplaints}
      </span>
    )},
    { header: 'Supplier Score', accessor: (row: Supplier) => (
       <div className="w-full bg-gray-700 rounded-full h-2.5">
          <div className="bg-blue-500 h-2.5 rounded-full" style={{ width: `${row.supplierScore}%` }}></div>
        </div>
    )},
  ];

  return (
    <DataTable<Supplier>
      columns={columns}
      data={[...suppliers].sort((a, b) => b.averageRating - a.averageRating)}

      title="Supplier Reputation"
    />
  );
};

export default Reputation;
