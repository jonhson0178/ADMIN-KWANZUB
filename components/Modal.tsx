
import React from 'react';
import { XCircleIcon } from './Icons';

interface ModalProps {
    onClose: () => void;
    title: string;
    children: React.ReactNode;
}

const Modal: React.FC<ModalProps> = ({ onClose, title, children }) => {
    return (
        <div 
            className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4"
            aria-labelledby="modal-title"
            role="dialog"
            aria-modal="true"
            onClick={onClose}
        >
            <div 
                className="bg-kwanzub-dark rounded-lg shadow-xl max-w-2xl w-full mx-auto overflow-hidden"
                onClick={(e) => e.stopPropagation()} // Prevent closing when clicking inside the modal
            >
                <div className="flex justify-between items-center p-4 border-b border-gray-700">
                    <h2 id="modal-title" className="text-xl font-semibold text-white">{title}</h2>
                    <button onClick={onClose} className="p-1 text-kwanzub-light hover:text-white" aria-label="Close modal">
                        <XCircleIcon />
                    </button>
                </div>
                <div className="p-6">
                    {children}
                </div>
            </div>
        </div>
    );
};

export default Modal;
