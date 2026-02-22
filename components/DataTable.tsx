
import React, { useState, useMemo } from 'react';
import { useLocale } from '../context/LocaleContext';

// FIX: Allow header to be a ReactNode to support elements like checkboxes.
interface Column<T> {
  header: React.ReactNode;
  accessor: (row: T) => React.ReactNode;
}

interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  title: string;
  exportable?: boolean;
  filterComponent?: React.ReactNode;
}

const DataTable = <T extends { id: string }>(
  { columns, data, title, exportable = false, filterComponent }: DataTableProps<T>
) => {
  const { t } = useLocale();
  
  const filteredData = data;

  const handleExport = () => {
    // FIX: Handle non-string headers for CSV export.
    const headers = columns.map(c => typeof c.header === 'string' ? c.header : '').join(',');
    const rows = filteredData.map(row => {
        return columns.map(col => {
            const value = col.accessor(row);
            if (typeof value === 'string' || typeof value === 'number') {
                return `"${value}"`;
            }
            // Handle React elements like badges
            if (React.isValidElement(value)) {
                // FIX: Cast value.props to access children property safely.
                const text = (value.props as { children?: React.ReactNode }).children?.toString() || '';
                return `"${text}"`;
            }
            return '""';
        }).join(',');
    }).join('\n');
    const csvContent = `data:text/csv;charset=utf-8,${headers}\n${rows}`;
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `${title.toLowerCase().replace(' ', '_')}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="bg-kwanzub-dark rounded-lg shadow-lg p-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold text-white">{title}</h2>
        <div className="flex items-center space-x-4">
          {filterComponent}
          {exportable && (
            <button 
              onClick={handleExport}
              className="px-4 py-2 bg-kwanzub-primary text-white rounded-md hover:bg-kwanzub-primary-hover transition-colors"
            >
              {t('dataTable.exportCsv')}
            </button>
          )}
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-700">
          <thead className="bg-gray-700/50">
            <tr>
              {columns.map((col, index) => (
                <th key={index} scope="col" className="px-6 py-3 text-left text-xs font-medium text-kwanzub-light uppercase tracking-wider">
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-kwanzub-dark divide-y divide-gray-700">
            {filteredData.map((row) => (
              <tr key={row.id} data-row-id={row.id} className="hover:bg-gray-700/30">
                {columns.map((col, index) => (
                  <td key={index} className="px-6 py-4 whitespace-nowrap text-sm text-kwanzub-lighter">
                    {col.accessor(row)}
                  </td>
                ))}
              </tr>
            ))}
             {filteredData.length === 0 && (
              <tr>
                <td colSpan={columns.length} className="px-6 py-4 text-center text-kwanzub-light">
                  {t('dataTable.noRecords')}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default DataTable;