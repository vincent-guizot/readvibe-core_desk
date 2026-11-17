'use client';

import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiX } from 'react-icons/fi';

export function Modal({
  isOpen,
  onClose,
  title,
  subtitle,
  children,
  maxWidth = '540px',
  className = '',
}) {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="rv-modal-overlay" onClick={onClose}>
          <motion.div
            className={`rv-modal-content ${className}`.trim()}
            style={{ maxWidth }}
            onClick={(e) => e.stopPropagation()}
            initial={{ opacity: 0, scale: 0.95, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0, transition: { duration: 0.24, ease: [0.16, 1, 0.3, 1] } }}
            exit={{ opacity: 0, scale: 0.95, y: 12, transition: { duration: 0.18 } }}
          >
            {(title || onClose) && (
              <div className="p-3 border-bottom d-flex align-items-center justify-content-between bg-white">
                <div>
                  {title && <h3 className="h5 fw-bold mb-0 rv-editorial">{title}</h3>}
                  {subtitle && <p className="small text-muted mb-0 mt-1">{subtitle}</p>}
                </div>
                {onClose && (
                  <button
                    type="button"
                    className="btn btn-sm btn-light rounded-circle p-2 d-flex align-items-center justify-content-center text-muted"
                    onClick={onClose}
                    aria-label="Close modal"
                  >
                    <FiX size={18} />
                  </button>
                )}
              </div>
            )}
            <div className="p-3">{children}</div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

export default Modal;
