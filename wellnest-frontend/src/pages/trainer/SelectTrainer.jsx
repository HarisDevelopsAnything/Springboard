import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import TrainerService from '../../services/trainerService';
import { Users, CheckCircle, UserCheck } from 'lucide-react';
import '../dashboard/Dashboard.css';
import './SelectTrainer.css';

const SelectTrainer = () => {
  const [trainers, setTrainers] = useState([]);
  const [currentTrainer, setCurrentTrainer] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selecting, setSelecting] = useState(null); // trainerId being selected

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [trainersRes, currentRes] = await Promise.all([
        TrainerService.getAvailableTrainers(),
        TrainerService.getMyTrainerToday(),
      ]);
      if (trainersRes.success) setTrainers(trainersRes.data || []);
      if (currentRes.success) setCurrentTrainer(currentRes.data || null);
    } catch (error) {
      console.error('Failed to load trainers:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSelect = async (trainerId) => {
    setSelecting(trainerId);
    try {
      const result = await TrainerService.selectTrainer(trainerId);
      if (result.success) {
        toast.success(result.message);
        // Reload to reflect the change
        await loadData();
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to select trainer');
    } finally {
      setSelecting(null);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <div className="spinner"></div>
        <p className="text-text-muted text-sm">Loading trainers...</p>
      </div>
    );
  }

  return (
    <div className="select-trainer">
      {/* Reuse dashboard glow */}
      <div className="dashboard-glow">
        <div className="orb orb--green" />
        <div className="orb orb--purple" />
        <div className="orb orb--teal" />
      </div>

      <div className="select-trainer-content">
        {/* Header */}
        <div className="select-trainer-header">
          <h1>Select a Trainer</h1>
          <p className="subtitle">Choose a trainer for today. You can pick one trainer per day.</p>
        </div>

        {/* Current trainer banner */}
        {currentTrainer && (
          <div className="current-trainer-banner">
            <div className="banner-icon">
              <UserCheck style={{ width: 20, height: 20, color: '#4ecca3' }} />
            </div>
            <div className="banner-text">
              <p>
                Today's trainer: <strong>{currentTrainer.fullName}</strong>
              </p>
              <p>You can change your selection below.</p>
            </div>
          </div>
        )}

        {/* Trainers Grid */}
        {trainers.length === 0 ? (
          <div className="select-trainer-empty">
            <div className="select-trainer-empty-icon">
              <Users style={{ width: 36, height: 36, color: '#4ecca3' }} />
            </div>
            <h3>No trainers available</h3>
            <p>There are no trainers registered yet. Check back later!</p>
          </div>
        ) : (
          <div className="trainers-grid">
            {trainers.map((trainer) => {
              const isSelected = currentTrainer?.id === trainer.id;
              return (
                <div key={trainer.id} className="trainer-card">
                  <div className="trainer-card-avatar">
                    {trainer.fullName?.[0]?.toUpperCase() || 'T'}
                  </div>
                  <h3>{trainer.fullName}</h3>
                  <p className="trainer-username">@{trainer.username}</p>
                  <p className="trainee-count">
                    <span>{trainer.activeTraineeCount}</span> active trainee{trainer.activeTraineeCount !== 1 ? 's' : ''}
                  </p>
                  <button
                    className={`btn-select-trainer ${isSelected ? 'selected' : 'primary'}`}
                    onClick={() => !isSelected && handleSelect(trainer.id)}
                    disabled={isSelected || selecting === trainer.id}
                  >
                    {isSelected ? (
                      <>
                        <CheckCircle style={{ width: 14, height: 14, display: 'inline', marginRight: 4, verticalAlign: 'middle' }} />
                        Selected for Today
                      </>
                    ) : selecting === trainer.id ? (
                      'Selecting...'
                    ) : (
                      'Select Trainer'
                    )}
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default SelectTrainer;
