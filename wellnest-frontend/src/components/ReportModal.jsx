import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import TrainerService from '../services/trainerService.js';
import ReportService from '../services/reportService.js';
import { FiX, FiAlertCircle } from 'react-icons/fi';
import './ReportModal.css';

const ReportModal = ({ isOpen, onClose }) => {
  const [trainers, setTrainers] = useState([]);
  const [formData, setFormData] = useState({
    trainerId: '',
    message: ''
  });
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      loadTrainers();
    }
  }, [isOpen]);

  const loadTrainers = async () => {
    setLoading(true);
    try {
      const res = await TrainerService.getAvailableTrainers();
      if (res.success) {
        setTrainers(res.data);
      }
    } catch (error) {
      toast.error('Failed to load trainers');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.trainerId) {
      toast.error('Please select a trainer');
      return;
    }

    if (formData.message.trim().length < 10) {
      toast.error('Please provide a detailed message (at least 10 characters)');
      return;
    }

    setSubmitting(true);
    try {
      const res = await ReportService.createReport(formData);
      if (res.success) {
        toast.success('Report submitted successfully. Admin will review it soon.');
        setFormData({ trainerId: '', message: '' });
        onClose();
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to submit report');
    } finally {
      setSubmitting(false);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-title-wrapper">
            <FiAlertCircle className="modal-title-icon" />
            <h2>Report a Trainer</h2>
          </div>
          <button className="modal-close-btn" onClick={onClose}>
            <FiX />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="modal-form">
          <div className="form-group">
            <label htmlFor="trainerId">Select Trainer *</label>
            {loading ? (
              <div className="loading-text">Loading trainers...</div>
            ) : (
              <select
                id="trainerId"
                name="trainerId"
                value={formData.trainerId}
                onChange={handleChange}
                required
                className="form-select"
              >
                <option value="">-- Select a trainer to report --</option>
                {trainers.map(trainer => (
                  <option key={trainer.id} value={trainer.id}>
                    {trainer.fullName} (@{trainer.username})
                  </option>
                ))}
              </select>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="message">Reason for Report *</label>
            <textarea
              id="message"
              name="message"
              value={formData.message}
              onChange={handleChange}
              placeholder="Please describe the issue in detail (minimum 10 characters)..."
              rows="5"
              required
              className="form-textarea"
            />
            <div className="char-count">
              {formData.message.length} characters
            </div>
          </div>

          <div className="modal-info">
            <FiAlertCircle />
            <p>Your report will be reviewed by an admin. Please provide accurate and detailed information.</p>
          </div>

          <div className="modal-actions">
            <button 
              type="button" 
              className="btn-cancel" 
              onClick={onClose}
              disabled={submitting}
            >
              Cancel
            </button>
            <button 
              type="submit" 
              className="btn-submit"
              disabled={submitting || loading}
            >
              {submitting ? 'Submitting...' : 'Submit Report'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ReportModal;
