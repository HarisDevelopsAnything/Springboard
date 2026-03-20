import api from './api';

const fallbackTips = [
  'Drink enough water during the day to support energy, digestion, and temperature regulation.',
  'Aim for 7-9 hours of sleep each night to improve recovery and mental focus.',
  'Add vegetables and fruits to most meals for better fiber, vitamins, and mineral intake.',
  'Do at least 30 minutes of moderate movement daily, such as brisk walking or cycling.',
  'Take short movement and stretch breaks every hour if you sit for long periods.',
];

const healthTipService = {
  getRandomTip: async () => {
    try {
      const response = await api.get('/health-tips/random');
      const tip = response?.data?.data?.tip;
      const source = response?.data?.data?.source || 'WellNest Health Library';

      if (tip && typeof tip === 'string') {
        return {
          success: true,
          data: {
            tip,
            source,
          },
        };
      }
    } catch (error) {
      console.error('Failed to fetch random health tip:', error);
    }

    const randomFallback = fallbackTips[Math.floor(Math.random() * fallbackTips.length)];
    return {
      success: true,
      data: {
        tip: randomFallback,
        source: 'WellNest Health Library',
      },
    };
  },
};

export default healthTipService;
