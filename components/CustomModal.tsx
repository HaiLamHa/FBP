'use client';

import { useEffect, useRef } from 'react';

interface CustomModalProps {
  show: boolean;
  message: string;
  onClose: () => void;
  primaryLabel?: string;
  onPrimary?: () => void;
}

export default function CustomModal({ show, message, onClose, primaryLabel, onPrimary }: CustomModalProps) {
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (show) {
      // Add animation classes for appearance
      setTimeout(() => {
        if (contentRef.current) {
          contentRef.current.classList.remove('scale-95', 'opacity-0');
          contentRef.current.classList.add('scale-100', 'opacity-100');
        }
      }, 10);
    }
  }, [show]);

  if (!show) return null;

  const handlePrimaryClick = () => {
    if (onPrimary) {
      onPrimary();
    } else {
      onClose();
    }
  };

  return (
    <div 
      id="custom-modal" 
      className="fixed inset-0 z-[100] grid place-items-center w-full h-full transition-opacity duration-300 opacity-100 p-4 bg-black/40"
      onClick={onClose} // Allows clicking outside to close
    >
      <div 
        ref={contentRef}
        className="bg-white p-4 rounded-lg shadow-xl max-w-sm w-full transform transition-transform duration-300 scale-95 opacity-0 text-center flex flex-col items-center space-y-3"
        onClick={(e) => e.stopPropagation()} // Prevent closing when clicking modal content
      >
        <p className="text-gray-700 whitespace-pre-wrap">{message}</p>
        <button
          onClick={handlePrimaryClick}
          className="inline-flex items-center justify-center text-sm font-extrabold text-black rounded-md transition"
          style={{
            backgroundColor: '#F8EA48',
            padding: '6px 12px',
            borderRadius: '5px',
            border: 'none',
            fontWeight: 800,
          }}
        >
          {primaryLabel ?? 'OK'}
        </button>
      </div>
    </div>
  );
}
