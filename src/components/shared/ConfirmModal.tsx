import React from 'react';
import Modal from './Modal';
import Button from './Button';

interface ConfirmModalProps {
    open: boolean;
    onClose: () => void;
    onConfirm: () => void;
    title?: string;
    message?: string;
    confirmLabel?: string;
    cancelLabel?: string;
    isLoading?: boolean;
}

const ConfirmModal: React.FC<ConfirmModalProps> = ({
    open,
    onClose,
    onConfirm,
    title = 'Confirm Deletion',
    message = 'Are you sure you want to delete this item? This action cannot be undone.',
    confirmLabel = 'Delete',
    cancelLabel = 'Cancel',
    isLoading = false,
}) => {
    return (
        <Modal open={open} onClose={onClose}>
            <div className="bg-white rounded-2xl w-full max-w-sm mx-auto p-4 sm:p-6 flex flex-col items-center text-center">
                <div className="w-16 h-16 rounded-full bg-red-50 flex items-center justify-center mb-4 text-red-500">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">{title}</h3>
                <p className="text-gray-500 mb-6">{message}</p>
                <div className="flex w-full gap-3">
                    <Button
                        type="button"
                        variant="outline"
                        className="flex-1 bg-gray-100 text-gray-700 border border-gray-200 hover:bg-gray-200"
                        onClick={onClose}
                        disabled={isLoading}
                    >
                        {cancelLabel}
                    </Button>
                    <Button
                        type="button"
                        variant="primary"
                        className="flex-1 !bg-red-500 hover:!bg-red-600 border-transparent text-white"
                        onClick={onConfirm}
                        disabled={isLoading}
                    >
                        {isLoading ? 'Wait...' : confirmLabel}
                    </Button>
                </div>
            </div>
        </Modal>
    );
};

export default ConfirmModal;
