import React from 'react';
import BmiCalculator from '../../components/BmiCalculator';
import './BmiCalculatorPage.css';

const BmiCalculatorPage = () => {
  return (
    <div className="bmi-calculator-page">
      <div className="page-header">
        <h1>BMI Calculator & Recommendations</h1>
        <p>Calculate your Body Mass Index and get personalized workout and nutrition plans</p>
      </div>
      <BmiCalculator />
    </div>
  );
};

export default BmiCalculatorPage;
