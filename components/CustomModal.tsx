'use client';

import { useEffect, useRef } from 'react';

interface CustomModalProps {
  show: boolean;
  message: string;
  onClose: () => void;
}

export default function CustomModal({ show, message, onClose }: CustomModalProps) {
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

  return (
    <div 
      id="custom-modal" 
      className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-[60] transition-opacity duration-300 opacity-100"
      onClick={onClose} // Allows clicking outside to close
    >
      <div 
        ref={contentRef}
        className="bg-white p-6 rounded-lg shadow-xl max-w-sm w-full transform transition-transform duration-300 scale-95 opacity-0" 
        onClick={(e) => e.stopPropagation()} // Prevent closing when clicking modal content
      >
        <p className="text-gray-700 mb-4 whitespace-pre-wrap">{message}</p>
        <button 
          onClick={onClose} 
          className="w-full bg-blue-500 text-white py-2 rounded hover:bg-blue-600 transition"
        >
          OK
        </button>
      </div>
    </div>
  );
}