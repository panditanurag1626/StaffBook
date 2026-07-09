import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { FiX } from 'react-icons/fi';

interface ModalProps {
  open: boolean;
  onClose: () => void;
  children: React.ReactNode;
}

const Modal: React.FC<ModalProps> = ({ open, onClose, children }) => {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  if (!open || !mounted) return null;

  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-gray-900/50 backdrop-blur-sm" onClick={onClose}>
      <div
        className="bg-white m-4 rounded-2xl shadow-2xl p-0 relative w-full md:max-w-full md:w-auto max-h-[90vh] sm:max-h-[80vh] overflow-y-auto animate-in fade-in zoom-in duration-200"
        onClick={e => e.stopPropagation()}
      >
        {children}
        <button
          className="absolute top-4 right-4 p-2 rounded-full bg-purple-50 text-purple-700 hover:bg-purple-100 transition-colors focus:outline-none z-50"
          onClick={onClose}
          aria-label="Close"
        >
          <FiX size={20} />
        </button>
      </div>
    </div>,
    document.body
  );
};

export default Modal;
