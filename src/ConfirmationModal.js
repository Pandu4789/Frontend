import React from 'react';
import { FaExclamationTriangle, FaTimes } from 'react-icons/fa';
import './ConfirmationModal.css';

const ConfirmationModal = ({
  isOpen,
  onClose,
  onConfirm,
  title = "Please Confirm",
  message = "Are you sure you want to proceed?",
  confirmText = "Confirm",
  cancelText = "Cancel"
}) => {
  if (!isOpen) return null;

  return (
    <div className="cp-modal-overlay" onClick={onClose}>
      <div className="cp-modal-card confirm-mini" onClick={e => e.stopPropagation()}>
        <div className="cp-modal-header">
          <div className="cp-icon-circle warning">
            <FaExclamationTriangle />
          </div>
          <h2>{title}</h2>
          <p>{message}</p>
          <button onClick={onClose} className="cp-close-btn">
            <FaTimes />
          </button>
        </div>

        <div className="cp-actions">
          <button type="button" className="cp-btn-cancel" onClick={onClose}>
            {cancelText}
          </button>
          <button type="button" className="cp-btn-submit danger" onClick={onConfirm}>
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmationModal;