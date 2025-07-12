import React from 'react';

interface AlertModalProps {
  isOpen: boolean;
  message: string;
  onClose: () => void;
  title?: string; // Optional, e.g., "localhost:5173 says"
}

const AlertModal: React.FC<AlertModalProps> = ({ isOpen, message, onClose, title = 'localhost:5173 says' }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-center items-start bg-black bg-opacity-40">
      <div
        className="mt-8 bg-[#444] text-white rounded-lg shadow-2xl min-w-[400px] max-w-[95vw]"
        style={{ boxShadow: '0 8px 24px rgba(0,0,0,0.25)' }}
      >
        <div className="px-6 pt-5 pb-2">
          <span className="font-bold text-base text-white">{title}</span>
        </div>
        <div className="px-6 pb-4 text-base text-white">
          {message}
        </div>
        <div className="px-6 pb-5 flex justify-end">
          <button
            onClick={onClose}
            className="bg-[#1976d2] hover:bg-[#1565c0] text-white font-semibold px-7 py-2 rounded focus:outline-none text-base"
            autoFocus
          >
            OK
          </button>
        </div>
      </div>
    </div>
  );
};

export default AlertModal; 