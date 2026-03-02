import React, { useState, useEffect } from 'react';
import trackerService from '../../services/trackerService';
import NutrientBars from '../../components/NutrientBars';
import { Trash2, Plus, UtensilsCrossed } from 'lucide-react';
import './MealTracker.css';

export default function MealTracker() {
  const [meals, setMeals] = useState([]);
  const [form, setForm] = useState({ 
    date: new Date().toISOString().slice(0,10), 
    mealType: 'BREAKFAST', 
    calories: '', 
    protein: '', 
    carbs: '', 
    fats: '', 
    items: '' 
  });
  const [todayTotals, setTodayTotals] = useState({ protein: 0, carbs: 0, fats: 0, calories: 0 });

  useEffect(() => { fetchMeals(); }, []);

  const fetchMeals = async () => {
    try { 
      const res = await trackerService.listMeals(); 
      setMeals(res.data);
      calculateTodayTotals(res.data);
    } catch (e) { console.error(e); }
  };

  const calculateTodayTotals = (allMeals) => {
    const today = new Date().toISOString().slice(0, 10);
    const todayMeals = allMeals.filter(m => m.date === today);
    const totals = todayMeals.reduce((acc, meal) => ({
      protein: acc.protein + (meal.protein || 0),
      carbs: acc.carbs + (meal.carbs || 0),
      fats: acc.fats + (meal.fats || 0),
      calories: acc.calories + (meal.calories || 0)
    }), { protein: 0, carbs: 0, fats: 0, calories: 0 });
    setTodayTotals(totals);
  };

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    try {
      await trackerService.createMeal({
        date: form.date,
        mealType: form.mealType,
        calories: form.calories ? parseInt(form.calories) : null,
        protein: form.protein ? parseInt(form.protein) : null,
        carbs: form.carbs ? parseInt(form.carbs) : null,
        fats: form.fats ? parseInt(form.fats) : null,
        items: form.items,
      });
      setForm({ ...form, calories: '', protein: '', carbs: '', fats: '', items: '' });
      fetchMeals();
    } catch (e) { console.error(e); }
  };

  const remove = async (id) => { 
    try { 
      await trackerService.deleteMeal(id); 
      fetchMeals(); 
    } catch (e) { console.error(e); } 
  };

  const mealTypes = ['BREAKFAST', 'LUNCH', 'DINNER', 'SNACK'];
  const mealIcons = { BREAKFAST: '🍳', LUNCH: '🍱', DINNER: '🍽️', SNACK: '🍎' };

  return (
    <div className="meal-tracker-page">
      <h2 className="page-title">🍽️ Meal Tracker</h2>
      
      <div className="meal-tracker-layout">
        <div className="meal-form-card">
          <h3 className="card-title">Add New Meal</h3>
          <form onSubmit={submit} className="meal-form">
            <div className="form-row">
              <div className="form-group">
                <label>Date</label>
                <input type="date" name="date" value={form.date} onChange={handleChange} required />
              </div>
              <div className="form-group">
                <label>Meal Type</label>
                <select name="mealType" value={form.mealType} onChange={handleChange} required>
                  {mealTypes.map(type => (
                    <option key={type} value={type}>
                      {mealIcons[type]} {type.charAt(0) + type.slice(1).toLowerCase()}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="form-group">
              <label>Food Items</label>
              <textarea 
                name="items" 
                placeholder="e.g., 2 eggs, toast, orange juice" 
                value={form.items} 
                onChange={handleChange}
                rows="2"
              />
            </div>

            <div className="form-row nutrients-row">
              <div className="form-group">
                <label style={{ color: '#ef4444' }}>Protein (g)</label>
                <input name="protein" type="number" placeholder="0" value={form.protein} onChange={handleChange} />
              </div>
              <div className="form-group">
                <label style={{ color: '#f59e0b' }}>Carbs (g)</label>
                <input name="carbs" type="number" placeholder="0" value={form.carbs} onChange={handleChange} />
              </div>
              <div className="form-group">
                <label style={{ color: '#8b5cf6' }}>Fats (g)</label>
                <input name="fats" type="number" placeholder="0" value={form.fats} onChange={handleChange} />
              </div>
              <div className="form-group">
                <label style={{ color: '#10b981' }}>Calories</label>
                <input name="calories" type="number" placeholder="0" value={form.calories} onChange={handleChange} />
              </div>
            </div>

            <button type="submit" className="submit-btn">
              <Plus style={{ width: 18, height: 18 }} />
              Add Meal
            </button>
          </form>
        </div>

        <div className="today-summary-card">
          <h3 className="card-title">Today's Total</h3>
          <div className="calories-display">
            {todayTotals.calories} <span>kcal</span>
          </div>
          <NutrientBars 
            protein={todayTotals.protein} 
            carbs={todayTotals.carbs} 
            fats={todayTotals.fats} 
          />
        </div>
      </div>

      <div className="meals-history">
        <h3 className="section-title">Meal History</h3>
        <div className="meals-list">
          {meals.slice().reverse().map((meal) => (
            <div key={meal.id} className="meal-item">
              <div className="meal-item-header">
                <div className="meal-type-badge" data-type={meal.mealType}>
                  <span className="meal-icon">{mealIcons[meal.mealType]}</span>
                  <span className="meal-type-text">{meal.mealType}</span>
                </div>
                <div className="meal-date">
                  {new Date(meal.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                </div>
                <button className="delete-btn" onClick={() => remove(meal.id)}>
                  <Trash2 style={{ width: 16, height: 16 }} />
                </button>
              </div>
              
              {meal.items && <div className="meal-items">{meal.items}</div>}
              
              <div className="meal-macros">
                <div className="macro" style={{ color: '#ef4444' }}>
                  <strong>{meal.protein || 0}g</strong> Protein
                </div>
                <div className="macro" style={{ color: '#f59e0b' }}>
                  <strong>{meal.carbs || 0}g</strong> Carbs
                </div>
                <div className="macro" style={{ color: '#8b5cf6' }}>
                  <strong>{meal.fats || 0}g</strong> Fats
                </div>
                <div className="macro calories" style={{ color: '#10b981' }}>
                  <strong>{meal.calories || 0}</strong> kcal
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
