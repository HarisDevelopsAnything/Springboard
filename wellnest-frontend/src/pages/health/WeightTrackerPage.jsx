import React from 'react';
import WeightTracker from '../../components/WeightTracker';
import './WeightTrackerPage.css';

const WeightTrackerPage = () => {
  return (
    <div className="weight-tracker-page">
      <div className="page-header">
        <h1>Weight Tracker</h1>
        <p>Track your daily weight and monitor your BMI progress over time</p>
      </div>
      <WeightTracker />
    </div>
  );
};

export default WeightTrackerPage;
