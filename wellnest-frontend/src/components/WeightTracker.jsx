import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import weightService from '../services/weightService';
import { FiTrendingDown, FiTrendingUp, FiPlus, FiTrash2, FiCalendar } from 'react-icons/fi';
import './WeightTracker.css';

const WeightTracker = () => {
  const [weightHistory, setWeightHistory] = useState([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    weight: '',
    notes: ''
  });

  useEffect(() => {
    loadWeightHistory();
  }, []);

  const loadWeightHistory = async () => {
    setLoading(true);
    try {
      const result = await weightService.getHistory();
      if (result.success) {
        setWeightHistory(result.data || []);
      }
    } catch (error) {
      console.error('Failed to load weight history:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddWeight = async (e) => {
    e.preventDefault();
    
    if (!formData.weight || formData.weight <= 0) {
      toast.error('Please enter a valid weight');
      return;
    }

    setLoading(true);
    try {
      const result = await weightService.addWeight({
        date: formData.date,
        weight: parseFloat(formData.weight),
        notes: formData.notes
      });

      if (result.success) {
        toast.success(result.message || 'Weight added successfully');
        setFormData({
          date: new Date().toISOString().split('T')[0],
          weight: '',
          notes: ''
        });
        setShowAddForm(false);
        loadWeightHistory();
      } else {
        toast.error(result.message || 'Failed to add weight');
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to add weight');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteEntry = async (entryId) => {
    if (!window.confirm('Are you sure you want to delete this entry?')) return;

    try {
      const result = await weightService.deleteEntry(entryId);
      if (result.success) {
        toast.success('Entry deleted successfully');
        loadWeightHistory();
      }
    } catch (error) {
      toast.error('Failed to delete entry');
    }
  };

  const getWeightTrend = () => {
    if (weightHistory.length < 2) return null;
    const latest = weightHistory[0].weight;
    const previous = weightHistory[1].weight;
    const diff = latest - previous;

    const status = diff < 0 ? 'improving' : diff > 0 ? 'deproving' : 'stable';
    return {
      direction: diff > 0 ? 'up' : diff < 0 ? 'down' : 'stable',
      status,
      value: Math.abs(diff).toFixed(1),
      rawDiff: diff
    };
  };

  const getBmiColor = (category) => {
    switch (category) {
      case 'UNDERWEIGHT': return '#3b82f6';
      case 'NORMAL': return '#10b981';
      case 'OVERWEIGHT': return '#f59e0b';
      case 'OBESE': return '#ef4444';
      default: return '#6b7280';
    }
  };

  const trend = getWeightTrend();
  const chartStroke = trend?.status === 'improving'
    ? '#10b981'
    : trend?.status === 'deproving'
      ? '#ef4444'
      : '#94a3b8';
  const chartFill = trend?.status === 'improving'
    ? 'rgba(16, 185, 129, 0.18)'
    : trend?.status === 'deproving'
      ? 'rgba(239, 68, 68, 0.18)'
      : 'rgba(148, 163, 184, 0.18)';

  // Prepare chart data (last 30 entries)
  const chartData = weightHistory.slice(0, 30).reverse();
  const maxWeight = chartData.length > 0 ? Math.max(...chartData.map(d => d.weight)) : 100;
  const minWeight = chartData.length > 0 ? Math.min(...chartData.map(d => d.weight)) : 0;
  const range = maxWeight - minWeight || 10;

  return (
    <div className="weight-tracker">
      <div className="tracker-header">
        <div>
          <h2>Weight Tracker</h2>
          <p>Track your daily weight and monitor your progress</p>
        </div>
        <button className="btn-add-weight" onClick={() => setShowAddForm(!showAddForm)}>
          <FiPlus /> Add Weight
        </button>
      </div>

      {showAddForm && (
        <form className="add-weight-form" onSubmit={handleAddWeight}>
          <div className="form-row">
            <div className="form-group">
              <label>Date</label>
              <div className="input-with-icon">
                <FiCalendar />
                <input
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  required
                />
              </div>
            </div>
            <div className="form-group">
              <label>Weight (kg)</label>
              <input
                type="number"
                value={formData.weight}
                onChange={(e) => setFormData({ ...formData, weight: e.target.value })}
                placeholder="Enter weight"
                step="0.1"
                min="0"
                required
              />
            </div>
          </div>
          <div className="form-group">
            <label>Notes (optional)</label>
            <input
              type="text"
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="Any notes about this entry"
            />
          </div>
          <div className="form-actions">
            <button type="submit" className="btn-submit" disabled={loading}>
              {loading ? 'Saving...' : 'Save Entry'}
            </button>
            <button type="button" className="btn-cancel" onClick={() => setShowAddForm(false)}>
              Cancel
            </button>
          </div>
        </form>
      )}

      {weightHistory.length > 0 && (
        <>
          <div className="weight-stats">
            <div className="stat-card current-weight">
              <h3>Current Weight</h3>
              <div className="stat-value">{weightHistory[0].weight} kg</div>
              <div className="stat-subtitle" style={{ color: getBmiColor(weightHistory[0].bmiCategory) }}>
                BMI: {weightHistory[0].bmi} ({weightHistory[0].bmiCategory})
              </div>
            </div>

            {trend && (
              <div className={`stat-card trend-card trend-${trend.status}`}>
                <h3>Weight Change</h3>
                <div className="stat-value">
                  {trend.status === 'deproving' ? <FiTrendingUp /> : <FiTrendingDown />}
                  {trend.value} kg
                </div>
                <div className="stat-subtitle">
                  {trend.status === 'improving' && 'Improving trend (down)'}
                  {trend.status === 'deproving' && 'Deproving trend (up)'}
                  {trend.status === 'stable' && 'Stable trend'}
                </div>
              </div>
            )}
          </div>

          {chartData.length > 1 && (
            <div className="weight-chart">
              <h3>Weight Progress Chart</h3>
              {trend && trend.status !== 'stable' && (
                <div className={`chart-trend-label ${trend.status}`}>
                  {trend.status === 'improving' ? <FiTrendingDown /> : <FiTrendingUp />}
                  <span>
                    {trend.status === 'improving' ? 'Improving' : 'Deproving'} by {Math.abs(trend.rawDiff).toFixed(1)} kg
                  </span>
                </div>
              )}
              <div className="chart-container">
                <div className="chart-y-axis">
                  <span>{maxWeight.toFixed(0)}</span>
                  <span>{((maxWeight + minWeight) / 2).toFixed(0)}</span>
                  <span>{minWeight.toFixed(0)}</span>
                </div>
                <div className="chart-area">
                  <svg className="chart-svg" viewBox={`0 0 ${chartData.length * 40} 200`}>
                    {/* Gradient definition */}
                    <defs>
                      <linearGradient id="areaGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                        <stop offset="0%" stopColor={chartFill} />
                        <stop offset="100%" stopColor="rgba(15, 23, 42, 0)" />
                      </linearGradient>
                    </defs>

                    {/* Grid lines */}
                    <line x1="0" y1="0" x2={chartData.length * 40} y2="0" stroke="#e2e8f0" strokeWidth="1" />
                    <line x1="0" y1="100" x2={chartData.length * 40} y2="100" stroke="#e2e8f0" strokeWidth="1" />
                    <line x1="0" y1="200" x2={chartData.length * 40} y2="200" stroke="#e2e8f0" strokeWidth="1" />

                    {/* Area fill under chart */}
                    <polygon
                      points={`20,200 ${chartData.map((entry, index) => {
                        const x = index * 40 + 20;
                        const y = 200 - ((entry.weight - minWeight) / range) * 180;
                        return `${x},${y}`;
                      }).join(' ')} ${(chartData.length - 1) * 40 + 20},200`}
                      fill="url(#areaGradient)"
                    />
                    
                    {/* Line chart */}
                    <polyline
                      fill="none"
                      stroke={chartStroke}
                      strokeWidth="3"
                      points={chartData.map((entry, index) => {
                        const x = index * 40 + 20;
                        const y = 200 - ((entry.weight - minWeight) / range) * 180;
                        return `${x},${y}`;
                      }).join(' ')}
                    />
                    
                    {/* Data points */}
                    {chartData.map((entry, index) => {
                      const x = index * 40 + 20;
                      const y = 200 - ((entry.weight - minWeight) / range) * 180;
                      const isLastPoint = index === chartData.length - 1;
                      return (
                        <g key={index}>
                          <circle cx={x} cy={y} r={isLastPoint ? '6' : '5'} fill={isLastPoint ? chartStroke : '#667eea'} />
                          <title>{`${entry.date}: ${entry.weight} kg`}</title>
                        </g>
                      );
                    })}
                  </svg>
                </div>
              </div>
            </div>
          )}

          <div className="weight-history-list">
            <h3>Weight History</h3>
            <div className="history-items">
              {weightHistory.map((entry) => (
                <div key={entry.id} className="history-item">
                  <div className="history-date">
                    <FiCalendar />
                    {new Date(entry.date).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric'
                    })}
                  </div>
                  <div className="history-details">
                    <div className="history-weight">{entry.weight} kg</div>
                    <div className="history-bmi" style={{ color: getBmiColor(entry.bmiCategory) }}>
                      BMI: {entry.bmi}
                    </div>
                  </div>
                  {entry.notes && <div className="history-notes">{entry.notes}</div>}
                  <button
                    className="btn-delete-entry"
                    onClick={() => handleDeleteEntry(entry.id)}
                    title="Delete entry"
                  >
                    <FiTrash2 />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </>
      )}

      {!loading && weightHistory.length === 0 && (
        <div className="empty-state">
          <FiTrendingDown className="empty-icon" />
          <p>No weight entries yet. Click "Add Weight" to start tracking!</p>
        </div>
      )}
    </div>
  );
};

export default WeightTracker;
