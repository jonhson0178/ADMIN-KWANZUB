
import React, { useState, useRef, useEffect } from 'react';
import { useLocale } from '../context/LocaleContext';
import { ArrowUpIcon, ArrowDownIcon } from './Icons';

interface GlobalDateFilterProps {
  value: { start: Date; end: Date; label: string };
  onChange: (value: { start: Date; end: Date; label: string }) => void;
}

const GlobalDateFilter: React.FC<GlobalDateFilterProps> = ({ value, onChange }) => {
  const { t } = useLocale();
  const [isCustomOpen, setIsCustomOpen] = useState(false);
  const [customStart, setCustomStart] = useState(value.start.toISOString().split('T')[0]);
  const [customEnd, setCustomEnd] = useState(value.end.toISOString().split('T')[0]);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const presets = [
    { label: t('financials.daily'), key: 'daily' },
    { label: t('financials.weekly'), key: 'weekly' },
    { label: t('financials.monthly'), key: 'monthly' },
    { label: t('financials.quarterly'), key: 'quarterly' },
    { label: t('financials.semiAnnually'), key: 'semiAnnually' },
    { label: t('financials.annually'), key: 'annually' },
  ];

  const handlePresetClick = (key: string) => {
    const end = new Date();
    let start = new Date();
    switch (key) {
      case 'daily':
        start.setDate(end.getDate() - 1);
        break;
      case 'weekly':
        start.setDate(end.getDate() - 7);
        break;
      case 'monthly':
        start.setMonth(end.getMonth() - 1);
        break;
      case 'quarterly':
        start.setMonth(end.getMonth() - 3);
        break;
      case 'semiAnnually':
        start.setMonth(end.getMonth() - 6);
        break;
      case 'annually':
        start.setFullYear(end.getFullYear() - 1);
        break;
    }
    onChange({ start, end, label: key });
  };
  
  const handleCustomApply = () => {
    onChange({
        start: new Date(customStart),
        end: new Date(customEnd),
        label: 'custom'
    });
    setIsCustomOpen(false);
  };
  
   useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsCustomOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);


  return (
    <div className="bg-kwanzub-dark p-4 rounded-lg shadow-lg flex items-center justify-between flex-wrap gap-4">
      <div className="flex items-center space-x-2 flex-wrap">
        {presets.map(p => (
          <button
            key={p.key}
            onClick={() => handlePresetClick(p.key)}
            className={`px-4 py-2 text-sm font-medium rounded-md ${value.label === p.key ? 'bg-kwanzub-primary text-white' : 'bg-gray-700 text-kwanzub-light hover:bg-gray-600'}`}
          >
            {p.label}
          </button>
        ))}
        <div className="relative" ref={dropdownRef}>
            <button
                onClick={() => setIsCustomOpen(!isCustomOpen)}
                className={`px-4 py-2 text-sm font-medium rounded-md ${value.label === 'custom' ? 'bg-kwanzub-primary text-white' : 'bg-gray-700 text-kwanzub-light hover:bg-gray-600'}`}
            >
                {t('financials.custom')}
            </button>
            {isCustomOpen && (
                <div className="absolute top-full mt-2 bg-gray-800 border border-gray-700 p-4 rounded-lg shadow-xl z-10 w-64 space-y-3">
                    <div>
                        <label className="text-xs text-kwanzub-light">Start Date</label>
                        <input type="date" value={customStart} onChange={e => setCustomStart(e.target.value)} className="w-full bg-gray-700 text-white p-2 rounded mt-1"/>
                    </div>
                    <div>
                        <label className="text-xs text-kwanzub-light">End Date</label>
                        <input type="date" value={customEnd} onChange={e => setCustomEnd(e.target.value)} className="w-full bg-gray-700 text-white p-2 rounded mt-1"/>
                    </div>
                    <button onClick={handleCustomApply} className="w-full bg-kwanzub-primary text-white py-2 rounded">Apply</button>
                </div>
            )}
        </div>
      </div>
      
    </div>
  );
};

export default GlobalDateFilter;
