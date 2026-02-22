

import React, { useMemo, useState } from 'react';
import DataTable from './DataTable';
import { useMockData } from '../hooks/useMockData';
import { DocumentStatus, Document } from '../types';
import { CheckCircleIcon, XCircleIcon, EyeIcon, NoSymbolIcon, ArrowPathIcon } from './Icons';
import Modal from './Modal';

interface DocumentRow extends Document {
    id: string; // Override id to be unique for the row
    supplierId: string;
    supplierName: string;
}

const Documents: React.FC = () => {
  const { suppliers, updateDocumentStatus } = useMockData();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedDocument, setSelectedDocument] = useState<{name: string, url: string} | null>(null);

  const handleViewDocument = (doc: {name: string, url: string}) => {
    setSelectedDocument(doc);
    setIsModalOpen(true);
  };

  const documentData: DocumentRow[] = useMemo(() => {
    return suppliers.flatMap(supplier => 
        supplier.documents.map(doc => ({
            ...doc,
            id: `${supplier.id}-${doc.id}`, // Create a unique ID for the row
            supplierId: supplier.id,
            supplierName: supplier.name,
        }))
    );
  }, [suppliers]);

  const getStatusBadge = (status: DocumentStatus) => {
    switch (status) {
      case DocumentStatus.Approved:
        return <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-900 text-green-300">{status}</span>;
      case DocumentStatus.Pending:
        return <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-900 text-yellow-300">{status}</span>;
      case DocumentStatus.Rejected:
        return <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-900 text-red-300">{status}</span>;
      case DocumentStatus.Suspended:
        return <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-orange-900 text-orange-300">{status}</span>;
      default:
        return <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-gray-700 text-gray-300">{status}</span>;
    }
  };

  const columns = [
    { header: 'Supplier', accessor: (row: DocumentRow) => row.supplierName },
    { header: 'Document Name', accessor: (row: DocumentRow) => row.name },
    { header: 'Submitted Date', accessor: (row: DocumentRow) => row.submittedDate },
    { header: 'Status', accessor: (row: DocumentRow) => getStatusBadge(row.status) },
    { header: 'Actions', accessor: (row: DocumentRow) => {
        const docId = row.id.split('-')[1];
        return (
            <div className="space-x-2 flex items-center">
                <button onClick={() => handleViewDocument(row)} className="p-2 text-blue-400 hover:text-blue-200 rounded-full hover:bg-gray-700" title="View Document"><EyeIcon /></button>
                {row.status === DocumentStatus.Pending && (
                <>
                    <button onClick={() => updateDocumentStatus(row.supplierId, docId, DocumentStatus.Approved)} className="p-2 text-green-400 hover:text-green-200 rounded-full hover:bg-gray-700" title="Approve Document"><CheckCircleIcon /></button>
                    <button onClick={() => updateDocumentStatus(row.supplierId, docId, DocumentStatus.Rejected)} className="p-2 text-red-400 hover:text-red-200 rounded-full hover:bg-gray-700" title="Reject Document"><XCircleIcon /></button>
                </>
                )}
                {row.status === DocumentStatus.Approved && (
                    <button onClick={() => updateDocumentStatus(row.supplierId, docId, DocumentStatus.Suspended)} className="p-2 text-orange-400 hover:text-orange-200 rounded-full hover:bg-gray-700" title="Suspend Document"><NoSymbolIcon /></button>
                )}
                {(row.status === DocumentStatus.Rejected || row.status === DocumentStatus.Suspended) && (
                    <button onClick={() => updateDocumentStatus(row.supplierId, docId, DocumentStatus.Pending)} className="p-2 text-yellow-400 hover:text-yellow-200 rounded-full hover:bg-gray-700" title="Set as Pending"><ArrowPathIcon /></button>
                )}
            </div>
        )
    }},
  ];

  return (
    <>
        <DataTable<DocumentRow>
        columns={columns}
        data={documentData}

        title="Document Verification"
        />
        {isModalOpen && selectedDocument && (
            <Modal onClose={() => setIsModalOpen(false)} title={selectedDocument.name}>
                <img src={selectedDocument.url} alt={`Preview of ${selectedDocument.name}`} className="w-full h-auto max-h-[80vh] object-contain" />
            </Modal>
        )}
    </>
  );
};

export default Documents;
