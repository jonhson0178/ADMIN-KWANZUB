import React, { useState } from 'react';
import { useMockData } from '../hooks/useMockData';
import { IpRule, IpRuleType, SecurityLog } from '../types';
import DataTable from './DataTable';
import { useLocale } from '../context/LocaleContext';
import { GlobeAltIcon, TrashIcon, PlusIcon } from './Icons';

const IpMonitoring: React.FC = () => {
  const { ipRules, securityLogs, addIpRule, removeIpRule } = useMockData();
  const { t } = useLocale();

  const [newIp, setNewIp] = useState('');
  const [newIpType, setNewIpType] = useState<IpRuleType>(IpRuleType.Allow);
  const [newIpNotes, setNewIpNotes] = useState('');

  const handleAddRule = () => {
    if (newIp.trim() === '') return;
    addIpRule({ ip: newIp, type: newIpType, notes: newIpNotes });
    setNewIp('');
    setNewIpNotes('');
  };

  const ipColumns = [
    { header: t('security.ipAddress'), accessor: (row: IpRule) => <span className="font-mono">{row.ip}</span> },
    {
      header: t('security.type'),
      accessor: (row: IpRule) => (
        <span
          className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
            row.type === IpRuleType.Allow ? 'bg-green-900 text-green-300' : 'bg-red-900 text-red-300'
          }`}
        >
          {row.type}
        </span>
      ),
    },
    { header: t('security.notes'), accessor: (row: IpRule) => row.notes },
    { header: t('security.addedBy'), accessor: (row: IpRule) => row.createdBy },
    { header: t('security.dateAdded'), accessor: (row: IpRule) => new Date(row.createdAt).toLocaleString() },
    {
      header: t('security.actions'),
      accessor: (row: IpRule) => (
        <button onClick={() => removeIpRule(row.id)} className="p-2 text-red-400 hover:text-red-200">
          <TrashIcon />
        </button>
      ),
    },
  ];

  const logColumns = [
    { header: t('security.timestamp'), accessor: (row: SecurityLog) => new Date(row.timestamp).toLocaleString() },
    { header: t('security.admin'), accessor: (row: SecurityLog) => row.adminName },
    { header: t('security.action'), accessor: (row: SecurityLog) => row.action },
    { header: t('security.details'), accessor: (row: SecurityLog) => row.details },
  ];

  return (
    <div className="space-y-6">
      {/* Add IP Rule Form */}
      <div className="bg-kwanzub-dark rounded-lg shadow-lg p-6">
        <h3 className="text-xl font-semibold text-white mb-4 flex items-center">
          <GlobeAltIcon className="mr-3" />
          {t('security.manageIpRules')}
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
          <div className="md:col-span-2">
            <label htmlFor="ip-address" className="block text-sm font-medium text-kwanzub-light">{t('security.ipAddress')}</label>
            <input
              type="text"
              id="ip-address"
              value={newIp}
              onChange={(e) => setNewIp(e.target.value)}
              placeholder="e.g., 192.168.1.1 or 10.0.0.0/16"
              className="mt-1 w-full px-3 py-2 bg-gray-700 text-white rounded-md focus:outline-none focus:ring-2 focus:ring-kwanzub-primary font-mono"
            />
          </div>
          <div>
            <label htmlFor="ip-type" className="block text-sm font-medium text-kwanzub-light">{t('security.type')}</label>
            <select
              id="ip-type"
              value={newIpType}
              onChange={(e) => setNewIpType(e.target.value as IpRuleType)}
              className="mt-1 w-full px-3 py-2 bg-gray-700 text-white rounded-md focus:outline-none focus:ring-2 focus:ring-kwanzub-primary"
            >
              <option value={IpRuleType.Allow}>{t('security.allow')}</option>
              <option value={IpRuleType.Deny}>{t('security.deny')}</option>
            </select>
          </div>
          <button
            onClick={handleAddRule}
            className="w-full md:w-auto px-4 py-2 bg-kwanzub-primary text-white rounded-md hover:bg-kwanzub-primary-hover flex items-center justify-center"
          >
            <PlusIcon className="mr-2" />
            {t('security.addRule')}
          </button>
          <div className="md:col-span-4">
             <label htmlFor="ip-notes" className="block text-sm font-medium text-kwanzub-light">{t('security.notes')}</label>
            <input
              type="text"
              id="ip-notes"
              value={newIpNotes}
              onChange={(e) => setNewIpNotes(e.target.value)}
              placeholder={t('security.notesPlaceholder')}
              className="mt-1 w-full px-3 py-2 bg-gray-700 text-white rounded-md focus:outline-none focus:ring-2 focus:ring-kwanzub-primary"
            />
          </div>
        </div>
      </div>

      {/* IP Rules Table */}
      <DataTable<IpRule> columns={ipColumns} data={ipRules} title={t('security.ipAccessRules')} />

      {/* Security Logs Table */}
      <DataTable<SecurityLog> columns={logColumns} data={securityLogs} title={t('security.securityLogs')} />
    </div>
  );
};

export default IpMonitoring;
