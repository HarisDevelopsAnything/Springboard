import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import weightService from '../services/weightService';
import ProfileService from '../services/profileService';
import './BmiCalculator.css';
import { FiActivity, FiTrendingUp, FiInfo } from 'react-icons/fi';

const BmiCalculator = () => {
  const [profile, setProfile] = useState(null);
  const [weight, setWeight] = useState('');
  const [height, setHeight] = useState('');
  const [bmiResult, setBmiResult] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      const result = await ProfileService.getProfile();
      if (result.success && result.data) {
        setProfile(result.data);
        setWeight(result.data.weight || '');
        setHeight(result.data.height || '');
      }
    } catch (error) {
      console.error('Failed to load profile:', error);
    }
  };

  const calculateBmi = async () => {
    if (!weight || !height) {
      toast.error('Please enter both weight and height');
      return;
    }

    if (weight <= 0 || height <= 0) {
      toast.error('Weight and height must be positive values');
      return;
    }

    setLoading(true);
    try {
      const result = await weightService.calculateBmi(parseFloat(weight), parseFloat(height));
      if (result.success) {
        setBmiResult(result.data);
      } else {
        toast.error(result.message || 'Failed to calculate BMI');
      }
    } catch (error) {
      toast.error('Failed to calculate BMI');
    } finally {
      setLoading(false);
    }
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

  const getBmiLabel = (category) => {
    switch (category) {
      case 'UNDERWEIGHT': return 'Underweight';
      case 'NORMAL': return 'Normal Weight';
      case 'OVERWEIGHT': return 'Overweight';
      case 'OBESE': return 'Obese';
      default: return '';
    }
  };

  return (
    <div className="bmi-calculator">
      <div className="bmi-header">
        <FiActivity className="bmi-icon" />
        <h2>BMI Calculator</h2>
        <p>Calculate your Body Mass Index and get personalized recommendations</p>
      </div>

      <div className="bmi-input-section">
        <div className="input-group">
          <label>Weight (kg)</label>
          <input
            type="number"
            value={weight}
            onChange={(e) => setWeight(e.target.value)}
            placeholder="Enter weight in kg"
            step="0.1"
            min="0"
          />
        </div>

        <div className="input-group">
          <label>Height (cm)</label>
          <input
            type="number"
            value={height}
            onChange={(e) => setHeight(e.target.value)}
            placeholder="Enter height in cm"
            step="0.1"
            min="0"
          />
        </div>

        <button 
          className="btn-calculate"
          onClick={calculateBmi}
          disabled={loading}
        >
          {loading ? 'Calculating...' : 'Calculate BMI'}
        </button>
      </div>

      {bmiResult && (
        <div className="bmi-result">
          <div className="bmi-value-card" style={{ borderColor: getBmiColor(bmiResult.category) }}>
            <div className="bmi-value" style={{ color: getBmiColor(bmiResult.category) }}>
              {bmiResult.bmi}
            </div>
            <div className="bmi-category" style={{ backgroundColor: getBmiColor(bmiResult.category) }}>
              {getBmiLabel(bmiResult.category)}
            </div>
          </div>

          <div className="ideal-weight-card">
            <FiTrendingUp className="card-icon" />
            <h3>Ideal Weight Range</h3>
            <p className="weight-range">
              {bmiResult.idealWeightMin?.toFixed(1)} - {bmiResult.idealWeightMax?.toFixed(1)} kg
            </p>
          </div>

          <div className="recommendation-card workout-recommendation">
            <div className="card-header">
              <FiInfo className="card-icon" />
              <h3>Workout Recommendation</h3>
            </div>
            <p>{bmiResult.workoutRecommendation}</p>
          </div>

          <div className="recommendation-card nutrition-recommendation">
            <div className="card-header">
              <FiInfo className="card-icon" />
              <h3>Nutrition Recommendation</h3>
            </div>
            <p>{bmiResult.nutritionRecommendation}</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default BmiCalculator;
