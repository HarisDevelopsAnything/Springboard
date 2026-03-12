import React from 'react';
import { FiX, FiUser, FiMail, FiAlertCircle, FiCalendar } from 'react-icons/fi';
import './ReportDetailModal.css';

const ReportDetailModal = ({ report, isOpen, onClose, onUpdateStatus, onDelete }) => {
  if (!isOpen || !report) return null;

  const getStatusColor = (status) => {
    switch (status) {
      case 'PENDING': return 'status-pending';
      case 'REVIEWED': return 'status-reviewed';
      case 'RESOLVED': return 'status-resolved';
      case 'DISMISSED': return 'status-dismissed';
      default: return '';
    }
  };

  return (
    <div className="report-detail-modal-overlay" onClick={onClose}>
      <div className="report-detail-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Report Details</h2>
          <button className="close-btn" onClick={onClose}>
            <FiX />
          </button>
        </div>

        <div className="modal-content">
          <div className="report-status-bar">
            <span className={`status-badge ${getStatusColor(report.status)}`}>
              {report.status}
            </span>
            <span className="report-date">
              <FiCalendar />
              {new Date(report.createdAt).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}
            </span>
          </div>

          <div className="report-detail-section customer-section">
            <div className="section-header">
              <FiUser className="section-icon" />
              <h3>Customer Information</h3>
            </div>
            <div className="section-content">
              <div className="info-row">
                <span className="label">Name:</span>
                <span className="value">{report.customerName}</span>
              </div>
              <div className="info-row">
                <span className="label">Email:</span>
                <span className="value email-value">
                  <FiMail className="mail-icon" />
                  {report.customerEmail}
                </span>
              </div>
            </div>
          </div>

          <div className="report-detail-section trainer-section">
            <div className="section-header">
              <FiAlertCircle className="section-icon" />
              <h3>Reported Trainer</h3>
            </div>
            <div className="section-content">
              <div className="info-row">
                <span className="label">Name:</span>
                <span className="value">{report.trainerName}</span>
              </div>
              <div className="info-row">
                <span className="label">Email:</span>
                <span className="value email-value">
                  <FiMail className="mail-icon" />
                  {report.trainerEmail}
                </span>
              </div>
            </div>
          </div>

          <div className="report-detail-section message-section">
            <div className="section-header">
              <h3>Report Message</h3>
            </div>
            <div className="message-content">
              <p>{report.message}</p>
            </div>
          </div>
        </div>

        <div className="modal-footer">
          {report.status === 'PENDING' && (
            <div className="action-buttons">
              <button 
                className="btn-action btn-reviewed"
                onClick={() => {
                  onUpdateStatus(report.id, 'REVIEWED');
                  onClose();
                }}
              >
                Mark as Reviewed
              </button>
              <button 
                className="btn-action btn-resolved"
                onClick={() => {
                  onUpdateStatus(report.id, 'RESOLVED');
                  onClose();
                }}
              >
                Mark as Resolved
              </button>
              <button 
                className="btn-action btn-dismissed"
                onClick={() => {
                  onUpdateStatus(report.id, 'DISMISSED');
                  onClose();
                }}
              >
                Dismiss Report
              </button>
            </div>
          )}
          <div className="danger-zone">
            <button 
              className="btn-action btn-delete"
              onClick={() => {
                if (window.confirm('Are you sure you want to delete this report? This action cannot be undone.')) {
                  onDelete(report.id);
                  onClose();
                }
              }}
            >
              Delete Report
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReportDetailModal;
