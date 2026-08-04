import { useEffect, useRef } from 'react';
import { IoClose } from 'react-icons/io5';

/**
 * Modal — full-screen on mobile, centered card on desktop.
 * z-index 60 — sits above the bottom nav (z-50).
 *
 * Props:
 *   open, onClose, title, children, footer, size
 */
export default function Modal({ open, onClose, title, children, footer, size = 'md' }) {
  const scrollRef = useRef(null);

  useEffect(() => {
    if (!open) return;
    const scrollY = window.scrollY;
    document.body.style.overflow = 'hidden';
    document.body.style.position = 'fixed';
    document.body.style.top = `-${scrollY}px`;
    document.body.style.width = '100%';
    return () => {
      document.body.style.overflow = '';
      document.body.style.position = '';
      document.body.style.top = '';
      document.body.style.width = '';
      window.scrollTo(0, scrollY);
    };
  }, [open]);

  if (!open) return null;

  const sizes = { sm: 'sm:max-w-sm', md: 'sm:max-w-md', lg: 'sm:max-w-lg', xl: 'sm:max-w-2xl' };

  return (
    // z-[60] beats the bottom nav z-50
    <div className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center sm:p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50 sm:block" onClick={onClose} />

      {/* Full-screen on mobile, card on desktop */}
      <div
        className={`relative bg-white w-full ${sizes[size]} flex flex-col
          h-full sm:h-auto sm:max-h-[90vh] sm:rounded-2xl sm:shadow-2xl`}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 flex-shrink-0 bg-white">
          <h2 className="text-base font-bold text-primary">{title}</h2>
          <button
            onClick={onClose}
            className="w-9 h-9 flex items-center justify-center hover:bg-gray-100 rounded-xl transition"
            aria-label="Close"
          >
            <IoClose size={22} className="text-gray-500" />
          </button>
        </div>

        {/* Scrollable content */}
        <div
          ref={scrollRef}
          className="flex-1 overflow-y-auto overscroll-contain px-5 pt-5 pb-2"
          style={{ WebkitOverflowScrolling: 'touch' }}
        >
          {children}
        </div>

        {/* Sticky footer — always visible, clears bottom nav on mobile */}
        {footer && (
          <div
            className="flex-shrink-0 px-5 pt-3 pb-3 bg-white border-t border-gray-100"
          >
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}
