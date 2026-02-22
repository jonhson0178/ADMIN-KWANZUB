
import React from 'react';
import { ArrowUpIcon, ArrowDownIcon } from './Icons';

interface StatCardProps {
  title: string;
  value: string;
  icon: React.ReactNode;
  percentageChange?: number;
  comparisonValue?: string;
  onClick?: () => void;
}

const StatCard: React.FC<StatCardProps> = ({ title, value, icon, percentageChange, comparisonValue, onClick }) => {
  const isPositive = percentageChange !== undefined && percentageChange >= 0;

  const cardContent = (
    <>
      <div>
        <p className="text-sm font-medium text-kwanzub-light whitespace-nowrap">{title}</p>
        <p className="text-[clamp(1.125rem,2vw,1.75rem)] font-semibold text-white whitespace-nowrap">{value}</p>
        {percentageChange !== undefined && (
          <div className="flex items-center text-xs mt-1">
            <span className={`flex items-center mr-2 whitespace-nowrap ${isPositive ? 'text-green-400' : 'text-red-400'}`}>
              {isPositive ? <ArrowUpIcon /> : <ArrowDownIcon />}
              <span className="ml-1 font-semibold">
                {percentageChange.toFixed(2)}%
              </span>
            </span>
            <span className="text-kwanzub-light whitespace-nowrap">{comparisonValue}</span>
          </div>
        )}
      </div>
      <div className="w-12 h-12 text-kwanzub-primary flex-shrink-0">
        {icon}
      </div>
    </>
  );
  
  const commonClasses = "p-4 bg-kwanzub-dark rounded-xl shadow-lg flex items-center justify-between gap-4 text-left min-w-[240px]";

  if (onClick) {
    return (
      <button 
        onClick={onClick}
        className={`${commonClasses} hover:bg-gray-800 transition-colors`}
      >
        {cardContent}
      </button>
    );
  }

  return (
    <div className={commonClasses}>
      {cardContent}
    </div>
  );
};

export default StatCard;
