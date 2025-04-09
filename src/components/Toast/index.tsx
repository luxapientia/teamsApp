import React, { useEffect } from 'react';
import { makeStyles } from '@fluentui/react-components';
import { DismissRegular } from '@fluentui/react-icons';

interface ToastProps {
  message: string;
  type: 'success' | 'error' | 'warning';
  onClose: () => void;
  duration?: number;
}

const useStyles = makeStyles({
  toast: {
    position: 'fixed',
    top: '20px',
    right: '20px',
    padding: '16px 20px',
    borderRadius: '8px',
    color: 'white',
    zIndex: 1000,
    animation: 'slideIn 0.3s ease-in-out',
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    minWidth: '300px',
    maxWidth: '450px',
  },
  success: {
    backgroundColor: '#059669',
    borderLeft: '4px solid #047857',
  },
  error: {
    backgroundColor: '#DC2626',
    borderLeft: '4px solid #B91C1C',
  },
  warning: {
    backgroundColor: '#D97706',
    borderLeft: '4px solid #B45309',
  },
  message: {
    flex: 1,
    fontSize: '14px',
    fontWeight: 500,
  },
  closeButton: {
    background: 'none',
    border: 'none',
    color: 'white',
    cursor: 'pointer',
    padding: '4px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    opacity: 0.8,
    transition: 'opacity 0.2s',
    '&:hover': {
      opacity: 1,
    },
  },
  '@keyframes slideIn': {
    from: {
      transform: 'translateX(100%)',
      opacity: 0,
    },
    to: {
      transform: 'translateX(0)',
      opacity: 1,
    },
  },
});

export const Toast: React.FC<ToastProps> = ({ message, type, onClose, duration = 5000 }) => {
  const styles = useStyles();

  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onClose]);

  return (
    <div className={`${styles.toast} ${styles[type]}`}>
      <span className={styles.message}>{message}</span>
      <button 
        className={styles.closeButton}
        onClick={onClose}
        aria-label="Close notification"
      >
        <DismissRegular />
      </button>
    </div>
  );
}; 