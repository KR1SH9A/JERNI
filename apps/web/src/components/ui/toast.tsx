'use client';

import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';

export type ToastType = 'success' | 'error' | 'info';

interface ToastProps {
  message: string;
  type?: ToastType;
  actionText?: string;
  onAction?: () => void;
  onClose: () => void;
  duration?: number;
}

export function Toast({ message, type = 'info', actionText, onAction, onClose, duration = 5000 }: ToastProps) {
  const [mounted, setMounted] = useState(false);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    setMounted(true);
    // Slight delay to allow CSS transition to trigger after mount
    const t = setTimeout(() => setVisible(true), 50);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    if (duration > 0) {
      const timer = setTimeout(() => {
        handleClose();
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [duration]);

  const handleClose = () => {
    setVisible(false);
    setTimeout(onClose, 300); // Wait for fade-out transition
  };

  if (!mounted) return null;

  const bgColors = {
    success: '#10b981', // green
    error: '#ef4444', // red
    info: '#3b82f6', // blue
  };

  return createPortal(
    <div
      style={{
        position: 'fixed',
        bottom: '2rem',
        left: '50%',
        transform: `translate(-50%, ${visible ? '0' : '20px'})`,
        opacity: visible ? 1 : 0,
        transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
        zIndex: 9999,
        background: '#1a1a1a', // Dark modern background
        color: '#fff',
        padding: '12px 24px',
        borderRadius: '999px',
        boxShadow: '0 10px 30px -10px rgba(0,0,0,0.5)',
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        border: '1px solid rgba(255,255,255,0.1)',
        fontSize: '0.875rem',
        fontWeight: 500,
        whiteSpace: 'nowrap',
      }}
    >
      <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: bgColors[type] }} />
      <span>{message}</span>
      
      {actionText && onAction && (
        <button
          onClick={onAction}
          style={{
            background: 'transparent',
            border: 'none',
            color: 'rgba(255,255,255,0.7)',
            textDecoration: 'underline',
            cursor: 'pointer',
            padding: '0',
            marginLeft: '8px',
            fontSize: '0.875rem',
          }}
        >
          {actionText}
        </button>
      )}
    </div>,
    document.body
  );
}
