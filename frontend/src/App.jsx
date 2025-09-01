import React, { useState, useEffect } from 'react';
import { Clock, Users, Utensils, Shield, CheckCircle, XCircle, Calendar, TrendingUp, User, Leaf, Coffee } from 'lucide-react';

// Mock API functions (replace with actual API calls)
const API_BASE = import.meta.env.VITE_API_BASE; // Vite

const api = {
  submitMeal: async (data) => {
    const response = await fetch(`${API_BASE}/meals`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return response.json();
  },
  
  adminLogin: async (passkey) => {
    const response = await fetch(`${API_BASE}/admin/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ passkey })
    });
    return response.json();
  },
  
  getMeals: async () => {
    const response = await fetch(`${API_BASE}/admin/meals`, {
      headers: { 'Authorization': `Bearer ${localStorage.getItem('adminToken')}` }
    });
    return response.json();
  }
};

// Helper function to determine breakfast date logic
const getBreakfastDateInfo = () => {
  const now = new Date();
  const hour = now.getHours();
  
  // Breakfast is for NEXT DAY if current time >= 6 AM
  // Breakfast is for SAME DAY if current time < 6 AM (midnight to 6 AM)
  const isNextDay = hour >= 6;
  const targetDate = new Date();
  
  if (isNextDay) {
    targetDate.setDate(targetDate.getDate() + 1);
  }
  
  return {
    isNextDay,
    targetDate: targetDate.toLocaleDateString('en-US', { 
      weekday: 'long', 
      month: 'long', 
      day: 'numeric' 
    }),
    timeRange: hour >= 6 ? "After 6 AM" : "Before 6 AM"
  };
};

// Homepage Component
// Day-wise menu data
const MENU = {
  Monday: {
    Breakfast: 'Veg Upma+ Ghuguni',
    Lunch: 'Rice, Dalma + Alu-Baigan Bharata, Saga Bhaja',
    Dinner: 'Rice, Soyabadi-Veg Mix Ghanta, Bhaja'
  },
  Tuesday: {
    Breakfast: 'Plane Idli + Dalma',
    Lunch: 'Rice, Chhole/ Veg Mix Curry + Bhaja',
    Dinner: 'Rice, Veg Biriyani +Raita'
  },
  Wednesday: {
    Breakfast: 'Simei Upma Halwa + Dalma',
    Lunch: 'Rice, Chicken/ Mushroom Curry, Bhaja/Salad',
    Dinner: 'Rice, Buta Dal Mix Curry + Bhaja'
  },
  Thursday: {
    Breakfast: 'Vegetable mix Idli+ Ghuguni',
    Lunch: 'Rice, Matar Mix Ghanta, Dahi Baigan, Saga Bhaja',
    Dinner: 'Rice, Dalma + Alu baigan Bharata'
  },
  Friday: {
    Breakfast: 'Uthapam + Chatni/ Ghuguni',
    Lunch: 'Rice, Fish Curry/ Paneer/mushroom curry, Bhaja',
    Dinner: 'Rice, Fish/ Mix Dalma ghanta, Alu-baigan Bharata'
  },
  Saturday: {
    Breakfast: 'Plane Idli + Ghuguni',
    Lunch: 'Rice, Veg Biriyani+ Raita',
    Dinner: 'Rice, Dal, Bhaja'
  },
  Sunday: {
    Breakfast: 'Bada, Ghuguni',
    Lunch: 'Rice, Chicken/ Paneer Curry, Mix Salad',
    Dinner: 'Rice, Egg Curry/ Potal-Ful kobi Curry, Bhaja'
  }
};
const Homepage = ({ setCurrentView, setIsAdmin }) => {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [formData, setFormData] = useState({
    name: '',
    mode: 'Lunch',
    status: '',
    type: ''
  });
  const [showTypeSelection, setShowTypeSelection] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Get today's menu
  const dayName = currentTime.toLocaleDateString('en-US', { weekday: 'long' });
  const todayMenu = MENU[dayName] || {};

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const handleStatusChange = (status) => {
    setFormData({ ...formData, status, type: '' });
    setShowTypeSelection(status === 'In');
  };

  const handleSubmit = async () => {
    if (!formData.name || !formData.status) {
      alert('Please fill in all required fields');
      return;
    }
    
    if (formData.status === 'In' && !formData.type) {
      alert('Please select Veg or Non-Veg');
      return;
    }

    setIsSubmitting(true);
    try {
      await api.submitMeal({
        name: formData.name,
        mode: formData.mode,
        status: formData.status,
        type: formData.status === 'In' ? formData.type : null
      });
      
      const breakfastInfo = getBreakfastDateInfo();
      if (formData.mode === 'Breakfast' && breakfastInfo.isNextDay) {
        alert(`Breakfast submission successful for ${breakfastInfo.targetDate}!`);
      } else if (formData.mode === 'Breakfast') {
        alert(`Breakfast submission successful for today!`);
      } else {
        alert('Submission successful!');
      }
      
      setFormData({ name: '', mode: 'Lunch', status: '', type: '' });
      setShowTypeSelection(false);
    } catch (error) {
      alert('Submission failed. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getGreeting = () => {
    const hour = currentTime.getHours();
    if (hour < 12) return "Good Morning";
    if (hour < 17) return "Good Afternoon";
    return "Good Evening";
  };

  const breakfastInfo = getBreakfastDateInfo();

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 p-4">
      <div className="max-w-lg mx-auto">
        {/* Today's Menu Card */}
        <div className="bg-white rounded-2xl shadow-xl p-6 mb-6 border border-green-200">
          <h2 className="text-xl font-bold text-green-700 mb-2 text-center">Today's Menu ({dayName})</h2>
          <div className="grid grid-cols-1 gap-2">
            <div>
              <span className="font-semibold text-yellow-700">Breakfast:</span>
              <span className="ml-2 text-green-700">{todayMenu.Breakfast || 'No menu available.'}</span>
            </div>
            <div>
              <span className="font-semibold text-green-700">Lunch:</span>
              <span className="ml-2 text-green-700">{todayMenu.Lunch || 'No menu available.'}</span>
            </div>
            <div>
              <span className="font-semibold text-blue-700">Dinner:</span>
              <span className="ml-2 text-green-700">{todayMenu.Dinner || 'No menu available.'}</span>
            </div>
          </div>
        </div>
        {/* Header Card */}
        <div className="bg-white rounded-2xl shadow-xl p-6 mb-6 border border-green-100">
          <div className="text-center mb-4">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl mb-4 shadow-lg">
              <Utensils className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-green-700 to-emerald-700 bg-clip-text text-transparent mb-2">
              VillaMart Catering
            </h1>
            <p className="text-green-600 font-medium">Daily Meal Tracker</p>
          </div>

          <div className="bg-gradient-to-r from-green-100 to-emerald-100 rounded-xl p-4 border border-green-200">
            <div className="flex items-center justify-center space-x-2 mb-2">
                {/* Show today's menu for selected meal type */}
                <div style={{ marginTop: '1rem', padding: '1rem', background: '#f6f6f6', borderRadius: '8px' }}>
                  <strong>Today's Menu for {formData.mode} ({dayName}):</strong>
                  <div style={{ marginTop: '0.5rem' }}>
                    {todayMenu[formData.mode] || 'No menu available.'}
                  </div>
                </div>
              <Clock className="w-5 h-5 text-green-600" />
              <span className="text-green-700 font-semibold">{getGreeting()}!</span>
            </div>
            <p className="text-green-700 font-semibold text-center">
              {currentTime.toLocaleDateString('en-US', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}
            </p>
            <p className="text-green-600 text-center text-lg font-mono">
              {currentTime.toLocaleTimeString()}
            </p>
          </div>
        </div>

        {/* Main Form Card */}
        <div className="bg-white rounded-2xl shadow-xl p-6 border border-green-100">
          <div className="space-y-6">
            {/* Name Input */}
            <div className="space-y-2">
              <label className="flex items-center space-x-2 text-green-700 font-semibold">
                <User className="w-4 h-4" />
                <span>Your Name</span>
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full p-4 border-2 border-green-200 rounded-xl focus:border-green-500 focus:outline-none transition-colors bg-green-50/50 placeholder-green-400"
                placeholder="Enter your full name"
              />
            </div>

            {/* Mode Selection */}
            <div className="space-y-3">
              <label className="flex items-center space-x-2 text-green-700 font-semibold">
                <Utensils className="w-4 h-4" />
                <span>Meal Type</span>
              </label>
              <div className="grid grid-cols-3 gap-3">
                {[
                  { mode: 'Breakfast', icon: '🌅', bgColor: 'from-yellow-500 to-orange-500' },
                  { mode: 'Lunch', icon: '🍽️', bgColor: 'from-green-500 to-emerald-500' },
                  { mode: 'Dinner', icon: '🌙', bgColor: 'from-blue-500 to-indigo-500' }
                ].map(({ mode, icon, bgColor }) => (
                  <label key={mode} className="relative">
                    <input
                      type="radio"
                      name="mode"
                      value={mode}
                      checked={formData.mode === mode}
                      onChange={(e) => setFormData({ ...formData, mode: e.target.value })}
                      className="sr-only"
                    />
                    <div className={`p-4 rounded-xl border-2 cursor-pointer transition-all text-center font-medium ${
                      formData.mode === mode
                        ? `border-transparent bg-gradient-to-r ${bgColor} text-white shadow-lg`
                        : 'border-green-200 bg-green-50 text-green-700 hover:border-green-300 hover:bg-green-100'
                    }`}>
                      <div className="text-2xl mb-1">{icon}</div>
                      <div className="text-sm">{mode}</div>
                    </div>
                  </label>
                ))}
              </div>
              
              {/* Breakfast Info Banner */}
              {formData.mode === 'Breakfast' && (
                <div className="bg-gradient-to-r from-yellow-100 to-orange-100 border-2 border-yellow-200 rounded-xl p-4 animate-in slide-in-from-top-2 duration-300">
                  <div className="flex items-start space-x-3">
                    <Coffee className="w-5 h-5 text-yellow-600 mt-0.5 flex-shrink-0" />
                    <div className="text-sm">
                      <p className="font-semibold text-yellow-800 mb-1">
                        Breakfast Selection ({breakfastInfo.timeRange})
                      </p>
                      <p className="text-yellow-700">
                        {breakfastInfo.isNextDay 
                          ? `You're selecting breakfast for tomorrow (${breakfastInfo.targetDate})`
                          : `You're selecting breakfast for today`
                        }
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Status Selection */}
            <div className="space-y-3">
              <label className="flex items-center space-x-2 text-green-700 font-semibold">
                <CheckCircle className="w-4 h-4" />
                <span>Attendance Status</span>
              </label>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { status: 'In', icon: '✅', color: 'green', label: 'I am In' },
                  { status: 'Out', icon: '❌', color: 'red', label: 'I am Out' }
                ].map(({ status, icon, color, label }) => (
                  <button
                    key={status}
                    type="button"
                    onClick={() => handleStatusChange(status)}
                    className={`p-4 rounded-xl font-semibold transition-all text-center border-2 ${
                      formData.status === status
                        ? color === 'green' 
                          ? 'bg-green-500 text-white border-green-500 shadow-lg'
                          : 'bg-red-500 text-white border-red-500 shadow-lg'
                        : 'bg-gray-50 text-gray-700 border-gray-200 hover:border-gray-300 hover:bg-gray-100'
                    }`}
                  >
                    <div className="text-2xl mb-1">{icon}</div>
                    {label}
                  </button>
                ))}
              </div>
            </div>

            {/* Type Selection (only if "In" is selected) */}
            {showTypeSelection && (
              <div className="space-y-3 animate-in slide-in-from-top-2 duration-300">
                <label className="flex items-center space-x-2 text-green-700 font-semibold">
                  <Leaf className="w-4 h-4" />
                  <span>Food Preference</span>
                </label>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { type: 'Veg', icon: '🌱', color: 'emerald' },
                    { type: 'Non-Veg', icon: '🍖', color: 'orange' }
                  ]
                    // Filter so Non-Veg appears only on Sunday (0), Wednesday (3), and Friday (5)
                    .filter(({ type }) => {
                      const today = new Date().getDay();
                      if (type === 'Non-Veg') {
                        return [0, 3, 5].includes(today);
                      }
                      return true; // Always keep Veg
                    })
                    .map(({ type, icon, color }) => (
                      <button
                        key={type}
                        type="button"
                        onClick={() => setFormData({ ...formData, type })}
                        className={`p-4 rounded-xl font-semibold transition-all text-center border-2 ${
                          formData.type === type
                            ? color === 'emerald'
                              ? 'bg-emerald-500 text-white border-emerald-500 shadow-lg'
                              : 'bg-orange-500 text-white border-orange-500 shadow-lg'
                            : 'bg-green-50 text-green-700 border-green-200 hover:border-green-300 hover:bg-green-100'
                        }`}
                      >
                        <div className="text-2xl mb-1">{icon}</div>
                        {type}
                      </button>
                    ))}
                </div>
              </div>
            )}

            {/* Submit Button */}
            <button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="w-full bg-gradient-to-r from-green-600 to-emerald-600 text-white p-4 rounded-xl font-semibold text-lg hover:from-green-700 hover:to-emerald-700 transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
            >
              {isSubmitting ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  <span>Submitting...</span>
                </>
              ) : (
                <>
                  <CheckCircle className="w-5 h-5" />
                  <span>Submit Entry</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Admin Access Card */}
        <div className="bg-white rounded-2xl shadow-xl p-6 mt-6 border border-green-100">
          <button
            onClick={() => setCurrentView('admin-login')}
            className="w-full bg-gradient-to-r from-green-800 to-emerald-800 text-white p-4 rounded-xl font-semibold hover:from-green-900 hover:to-emerald-900 transition-all shadow-lg hover:shadow-xl flex items-center justify-center space-x-2"
          >
            <Shield className="w-5 h-5" />
            <span>Admin Dashboard</span>
          </button>
        </div>

        {/* Footer */}
        <div className="text-center mt-6 text-green-600">
          <p className="text-sm">Powered by VillaMart Catering System</p>
        </div>
      </div>
    </div>
  );
};

// Admin Login Component
const AdminLogin = ({ setCurrentView, setIsAdmin }) => {
  const [passkey, setPasskey] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    setLoading(true);
    
    try {
      const result = await api.adminLogin(passkey);
      if (result.success) {
        localStorage.setItem('adminToken', result.token);
        setIsAdmin(true);
        setCurrentView('admin-dashboard');
      } else {
        alert('Invalid passkey');
      }
    } catch (error) {
      alert('Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-2xl p-8 border border-green-100">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-green-600 to-emerald-700 rounded-2xl mb-4 shadow-lg">
            <Shield className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-3xl font-bold bg-gradient-to-r from-green-700 to-emerald-700 bg-clip-text text-transparent mb-2">
            Admin Access
          </h2>
          <p className="text-green-600">VillaMart Catering Dashboard</p>
        </div>
        
        <div className="space-y-6">
          <div>
            <label className="block text-green-700 font-semibold mb-3">Security Passkey</label>
            <input
              type="password"
              value={passkey}
              onChange={(e) => setPasskey(e.target.value)}
              className="w-full p-4 border-2 border-green-200 rounded-xl focus:border-green-500 focus:outline-none transition-colors bg-green-50/50"
              placeholder="Enter admin passkey"
              onKeyPress={(e) => e.key === 'Enter' && handleLogin()}
            />
          </div>
          
          <button
            onClick={handleLogin}
            disabled={loading}
            className="w-full bg-gradient-to-r from-green-600 to-emerald-600 text-white p-4 rounded-xl font-semibold hover:from-green-700 hover:to-emerald-700 transition-all shadow-lg hover:shadow-xl disabled:opacity-50 flex items-center justify-center space-x-2"
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                <span>Authenticating...</span>
              </>
            ) : (
              <>
                <Shield className="w-5 h-5" />
                <span>Access Dashboard</span>
              </>
            )}
          </button>
        </div>
        
        <button
          onClick={() => setCurrentView('homepage')}
          className="w-full mt-6 bg-gray-100 text-gray-700 p-4 rounded-xl font-semibold hover:bg-gray-200 transition-all border border-gray-200"
        >
          ← Back to Home
        </button>
      </div>
    </div>
  );
};

// Admin Dashboard Component
const AdminDashboard = ({ setCurrentView, setIsAdmin }) => {
  const [meals, setMeals] = useState([]);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMeals();
  }, []);

  const fetchMeals = async () => {
    try {
      const result = await api.getMeals();
      if (result.success) {
        setMeals(result.data);
      }
    } catch (error) {
      console.error('Failed to fetch meals:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = () => {
    if (!selectedDate) return alert("Please select a date first!");
    window.open(`${API_BASE}/admin/export-excel?date=${selectedDate}`, '_blank');
  };

  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    setIsAdmin(false);
    setCurrentView('homepage');
  };

  const filteredMeals = meals.filter(meal => {
    const mealDateStr = meal.date.substring(0, 10);
    return mealDateStr === selectedDate;
  });

  const calculateTotals = (mode) => {
    return filteredMeals.filter(meal => 
      meal.mode === mode && meal.status === 'In'
    ).length;
  };

  const getAvailableDates = () => {
    const dates = meals.map(meal => meal.date.substring(0, 10));
    return [...new Set(dates)].sort();
  };

  const calculateVegNonVeg = (mode) => {
    const inMeals = filteredMeals.filter(meal => meal.mode === mode && meal.status === 'In');
    const veg = inMeals.filter(meal => meal.type === 'Veg').length;
    const nonVeg = inMeals.filter(meal => meal.type === 'Non-Veg').length;
    return { veg, nonVeg };
  };

  const calculateTotalVegNonVeg = () => {
    const inMeals = filteredMeals.filter(meal => meal.status === 'In');
    const veg = inMeals.filter(meal => meal.type === 'Veg').length;
    const nonVeg = inMeals.filter(meal => meal.type === 'Non-Veg').length;
    return { veg, nonVeg };
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <div className="text-green-700 text-xl font-semibold">Loading Dashboard...</div>
        </div>
      </div>
    );
  }

  const totalVegNonVeg = calculateTotalVegNonVeg();

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-xl p-6 mb-6 border border-green-100">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-green-700 to-emerald-700 bg-clip-text text-transparent mb-2">
                VillaMart Admin Dashboard
              </h1>
              <p className="text-green-600">Catering Management System</p>
            </div>
            <div className="flex gap-3">
              <button onClick={handleDownload} className="bg-green-500 text-white px-4 py-2 rounded-xl hover:bg-green-600 transition-colors">
                Download Excel
              </button>
              <button
                onClick={handleLogout}
                className="bg-gradient-to-r from-red-500 to-red-600 text-white px-6 py-3 rounded-xl font-semibold hover:from-red-600 hover:to-red-700 transition-all shadow-lg hover:shadow-xl"
              >
                Logout
              </button>
            </div>
          </div>
        </div>

        {/* Date Selector */}
        <div className="bg-white rounded-2xl shadow-xl p-6 mb-6 border border-green-100">
          <label className="flex items-center space-x-2 text-green-700 font-semibold mb-4">
            <Calendar className="w-5 h-5" />
            <span>Select Date</span>
          </label>
          <div className="flex flex-col lg:flex-row gap-4 items-start">
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="p-3 border-2 border-green-200 rounded-xl focus:border-green-500 focus:outline-none bg-green-50/50"
            />
            <div className="text-sm text-gray-600 bg-gray-50 p-3 rounded-xl">
              <strong>Available dates:</strong> {getAvailableDates().slice(-5).join(', ')}
            </div>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-7 gap-6 mb-6">
          {/* Breakfast Card */}
          <div className="bg-gradient-to-br from-yellow-500 to-orange-600 rounded-2xl shadow-xl p-6 text-white">
            <div className="flex items-center justify-between mb-4">
              <Coffee className="w-8 h-8" />
              <TrendingUp className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-semibold mb-2">Breakfast</h3>
            <p className="text-3xl font-bold mb-1">{calculateTotals('Breakfast')}</p>
            <div className="text-sm opacity-90">
              {(() => {
                const { veg, nonVeg } = calculateVegNonVeg('Breakfast');
                return `${veg} Veg • ${nonVeg} Non-Veg`;
              })()}
            </div>
          </div>

          {/* Lunch Card */}
          <div className="bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl shadow-xl p-6 text-white">
            <div className="flex items-center justify-between mb-4">
              <Utensils className="w-8 h-8" />
              <TrendingUp className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-semibold mb-2">Lunch</h3>
            <p className="text-3xl font-bold mb-1">{calculateTotals('Lunch')}</p>
            <div className="text-sm opacity-90">
              {(() => {
                const { veg, nonVeg } = calculateVegNonVeg('Lunch');
                return `${veg} Veg • ${nonVeg} Non-Veg`;
              })()}
            </div>
          </div>

          {/* Dinner Card */}
          <div className="bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl shadow-xl p-6 text-white">
            <div className="flex items-center justify-between mb-4">
              <Utensils className="w-8 h-8" />
              <TrendingUp className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-semibold mb-2">Dinner</h3>
            <p className="text-3xl font-bold mb-1">{calculateTotals('Dinner')}</p>
            <div className="text-sm opacity-90">
              {(() => {
                const { veg, nonVeg } = calculateVegNonVeg('Dinner');
                return `${veg} Veg • ${nonVeg} Non-Veg`;
              })()}
            </div>
          </div>

          {/* Total In */}
          <div className="bg-gradient-to-br from-teal-500 to-cyan-600 rounded-2xl shadow-xl p-6 text-white">
            <div className="flex items-center justify-between mb-4">
              <Users className="w-8 h-8" />
              <CheckCircle className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-semibold mb-2">Total Present</h3>
            <p className="text-3xl font-bold">{filteredMeals.filter(meal => meal.status === 'In').length}</p>
            <div className="text-sm opacity-90">People dining today</div>
          </div>

          {/* Total Out */}
          <div className="bg-gradient-to-br from-gray-500 to-gray-600 rounded-2xl shadow-xl p-6 text-white">
            <div className="flex items-center justify-between mb-4">
              <Users className="w-8 h-8" />
              <XCircle className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-semibold mb-2">Total Absent</h3>
            <p className="text-3xl font-bold">{filteredMeals.filter(meal => meal.status === 'Out').length}</p>
            <div className="text-sm opacity-90">People not dining</div>
          </div>

          {/* Total Veg Card */}
          <div className="bg-gradient-to-br from-lime-500 to-green-600 rounded-2xl shadow-xl p-6 text-white">
            <div className="flex items-center justify-between mb-4">
              <div className="text-2xl">🌱</div>
              <CheckCircle className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-semibold mb-2">Total Veg</h3>
            <p className="text-3xl font-bold">{totalVegNonVeg.veg}</p>
            <div className="text-sm opacity-90">Veg meals today</div>
          </div>

          {/* Total Non-Veg Card */}
          <div className="bg-gradient-to-br from-orange-500 to-red-600 rounded-2xl shadow-xl p-6 text-white">
            <div className="flex items-center justify-between mb-4">
              <div className="text-2xl">🍖</div>
              <CheckCircle className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-semibold mb-2">Total Non-Veg</h3>
            <p className="text-3xl font-bold">{totalVegNonVeg.nonVeg}</p>
            <div className="text-sm opacity-90">Non-veg meals today</div>
          </div>
        </div>

        {/* Data Table */}
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-green-100">
          <div className="p-6 border-b border-green-100">
            <h3 className="text-xl font-semibold text-green-800">Daily Meal Records</h3>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gradient-to-r from-green-600 to-emerald-600 text-white">
                <tr>
                  <th className="p-4 text-left font-semibold">Date</th>
                  <th className="p-4 text-left font-semibold">Name</th>
                  <th className="p-4 text-left font-semibold">Meal</th>
                  <th className="p-4 text-left font-semibold">Status</th>
                  <th className="p-4 text-left font-semibold">Type</th>
                </tr>
              </thead>
              <tbody>
                {filteredMeals.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="p-8 text-center text-gray-500">
                      <div className="flex flex-col items-center space-y-2">
                        <Calendar className="w-12 h-12 text-gray-300" />
                        <p className="text-lg font-semibold">No data available</p>
                        <p className="text-sm">No records found for {selectedDate}</p>
                        {getAvailableDates().length > 0 && (
                          <p className="text-sm">Try: {getAvailableDates().slice(-3).join(', ')}</p>
                        )}
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredMeals
                    .sort((a, b) => {
                      const mealOrder = { 'Breakfast': 1, 'Lunch': 2, 'Dinner': 3 };
                      return mealOrder[a.mode] - mealOrder[b.mode] || a.name.localeCompare(b.name);
                    })
                    .map((meal, index) => (
                    <tr key={index} className="hover:bg-green-50 transition-colors border-b border-green-50">
                      <td className="p-4 font-medium">
                        {new Date(meal.date).toLocaleDateString()}
                      </td>
                      <td className="p-4 font-medium text-gray-800">{meal.name}</td>
                      <td className="p-4">
                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                          meal.mode === 'Breakfast' 
                            ? 'bg-yellow-100 text-yellow-800'
                            : meal.mode === 'Lunch'
                            ? 'bg-green-100 text-green-800'
                            : 'bg-blue-100 text-blue-800'
                        }`}>
                          {meal.mode === 'Breakfast' && '🌅'} 
                          {meal.mode === 'Lunch' && '🍽️'} 
                          {meal.mode === 'Dinner' && '🌙'} 
                          {meal.mode}
                        </span>
                      </td>
                      <td className="p-4">
                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                          meal.status === 'In' 
                            ? 'bg-emerald-100 text-emerald-800' 
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {meal.status === 'In' ? '✅ Present' : '❌ Absent'}
                        </span>
                      </td>
                      <td className="p-4">
                        {meal.type ? (
                          <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                            meal.type === 'Veg' 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-orange-100 text-orange-800'
                          }`}>
                            {meal.type === 'Veg' ? '🌱 Veg' : '🍖 Non-Veg'}
                          </span>
                        ) : (
                          <span className="text-gray-400">-</span>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

// Main App Component
const App = () => {
  const [currentView, setCurrentView] = useState('homepage');
  const [isAdmin, setIsAdmin] = useState(false);

  const renderView = () => {
    switch (currentView) {
      case 'admin-login':
        return <AdminLogin setCurrentView={setCurrentView} setIsAdmin={setIsAdmin} />;
      case 'admin-dashboard':
        return <AdminDashboard setCurrentView={setCurrentView} setIsAdmin={setIsAdmin} />;
      default:
        return <Homepage setCurrentView={setCurrentView} setIsAdmin={setIsAdmin} />;
    }
  };

  return renderView();
};

export default App;