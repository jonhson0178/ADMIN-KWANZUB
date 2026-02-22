

import React, { useEffect } from 'react';
import DataTable from './DataTable';
import { useMockData } from '../hooks/useMockData';
// FIX: Changed import path for HighlightableEntity type to fix module resolution error.
import { AuditLog, HighlightableEntity } from '../types';
import { useLocale } from '../context/LocaleContext';

interface AuditLogsProps {
  highlightedEntity: HighlightableEntity | null;
  onHighlightComplete: () => void;
}

const AuditLogs: React.FC<AuditLogsProps> = ({ highlightedEntity, onHighlightComplete }) => {
  const { auditLogs } = useMockData();
  const { t } = useLocale();

  useEffect(() => {
    if (highlightedEntity) { // Highlighting any type of entity that might appear here
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

  const columns = [
    { header: t('auditLogs.timestamp'), accessor: (row: AuditLog) => new Date(row.timestamp).toLocaleString() },
    { header: t('auditLogs.user'), accessor: (row: AuditLog) => row.userName },
    { header: t('auditLogs.action'), accessor: (row: AuditLog) => <code className="px-2 py-1 text-xs font-mono bg-gray-700 rounded">{row.action}</code> },
    { header: t('auditLogs.details'), accessor: (row: AuditLog) => row.details },
    { header: t('auditLogs.critical'), accessor: (row: AuditLog) => (
        row.isCritical 
            ? <span className="text-red-400 font-semibold">Yes</span> 
            : <span className="text-gray-400">No</span>
    )},
  ];

  return (
    <DataTable<AuditLog>
      columns={columns}
      data={auditLogs}

      title={t('auditLogs.title')}
    />
  );
};

export default AuditLogs;