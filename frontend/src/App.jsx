import React, { useState, useEffect } from 'react';
import { Clock, Users, Utensils, Shield, CheckCircle, XCircle, Calendar, TrendingUp, User, Leaf, Coffee, Star, Sparkles, ChefHat, Heart } from 'lucide-react';

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

// Homepage Component
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
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-20 -left-20 w-96 h-96 bg-gradient-to-r from-green-300/20 to-emerald-300/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute top-1/2 -right-20 w-80 h-80 bg-gradient-to-r from-teal-300/20 to-cyan-300/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute -bottom-20 left-1/3 w-72 h-72 bg-gradient-to-r from-emerald-300/20 to-green-300/20 rounded-full blur-3xl animate-pulse delay-500"></div>
      </div>

      <div className="relative z-10 p-4 md:p-6">
        <div className="max-w-lg mx-auto space-y-6">
          {/* Enhanced Header Card */}
          <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl p-8 border border-white/30 relative overflow-hidden">
            {/* Decorative elements */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-green-400/10 to-emerald-400/10 rounded-full -translate-y-16 translate-x-16"></div>
            <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-teal-400/10 to-cyan-400/10 rounded-full translate-y-12 -translate-x-12"></div>
            
            <div className="text-center mb-6 relative">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-green-500 via-emerald-500 to-teal-500 rounded-3xl mb-4 shadow-2xl relative">
                <div className="absolute inset-0 bg-gradient-to-br from-green-400 to-emerald-600 rounded-3xl animate-pulse"></div>
                <ChefHat className="w-10 h-10 text-white relative z-10" />
                <div className="absolute -top-1 -right-1 w-6 h-6 bg-yellow-400 rounded-full flex items-center justify-center">
                  <Sparkles className="w-3 h-3 text-yellow-800" />
                </div>
              </div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-green-700 via-emerald-600 to-teal-600 bg-clip-text text-transparent mb-3 tracking-tight">
                VillaMart Catering
              </h1>
              <div className="flex items-center justify-center space-x-2 mb-4">
                <Star className="w-4 h-4 text-yellow-500 fill-current" />
                <p className="text-emerald-600 font-semibold tracking-wide">Premium Daily Meals</p>
                <Star className="w-4 h-4 text-yellow-500 fill-current" />
              </div>
            </div>

            <div className="bg-gradient-to-r from-green-100 via-emerald-100 to-teal-100 rounded-2xl p-6 border border-green-200/50 backdrop-blur-sm">
              <div className="flex items-center justify-center space-x-3 mb-3">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <Clock className="w-5 h-5 text-green-600" />
                <span className="text-green-700 font-bold text-lg">{getGreeting()}!</span>
                <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse delay-300"></div>
              </div>
              <p className="text-green-700 font-semibold text-center mb-2">
                {currentTime.toLocaleDateString('en-US', { 
                  weekday: 'long', 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}
              </p>
              <p className="text-green-600 text-center text-xl font-mono bg-white/50 rounded-lg py-2 px-4">
                {currentTime.toLocaleTimeString()}
              </p>
            </div>
          </div>

          {/* Enhanced Menu Card */}
          <div className="bg-white/90 backdrop-blur-xl rounded-3xl shadow-2xl p-6 border border-white/30 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-green-500 via-emerald-500 to-teal-500"></div>
            
            <div className="flex items-center justify-center space-x-2 mb-4">
              <Utensils className="w-6 h-6 text-emerald-600" />
              <h2 className="text-2xl font-bold text-emerald-700">Today's Menu</h2>
              <div className="px-3 py-1 bg-emerald-100 text-emerald-700 rounded-full text-sm font-semibold">
                {dayName}
              </div>
            </div>
            
            <div className="grid grid-cols-1 gap-4">
              {[
                { key: 'Breakfast', icon: '🌅', color: 'from-yellow-500 to-orange-500', textColor: 'text-yellow-800' },
                { key: 'Lunch', icon: '🍽️', color: 'from-green-500 to-emerald-500', textColor: 'text-green-800' },
                { key: 'Dinner', icon: '🌙', color: 'from-blue-500 to-indigo-500', textColor: 'text-blue-800' }
              ].map(({ key, icon, color, textColor }) => (
                <div key={key} className="bg-gradient-to-r from-gray-50 to-white rounded-xl p-4 border border-gray-200 hover:shadow-lg transition-all duration-300 group">
                  <div className="flex items-start space-x-3">
                    <div className={`w-12 h-12 bg-gradient-to-r ${color} rounded-xl flex items-center justify-center text-xl shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                      {icon}
                    </div>
                    <div className="flex-1">
                      <span className={`font-bold text-lg ${textColor} block mb-1`}>{key}</span>
                      <span className="text-gray-700 text-sm leading-relaxed">
                        {todayMenu[key] || 'No menu available.'}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Enhanced Form Card */}
          <div className="bg-white/90 backdrop-blur-xl rounded-3xl shadow-2xl p-8 border border-white/30 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-teal-500 via-cyan-500 to-blue-500"></div>
            
            <div className="space-y-8">
              {/* Name Input */}
              <div className="space-y-3">
                <label className="flex items-center space-x-3 text-emerald-700 font-bold text-lg">
                  <div className="w-10 h-10 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-xl flex items-center justify-center shadow-lg">
                    <User className="w-5 h-5 text-white" />
                  </div>
                  <span>Your Name</span>
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full p-4 pl-12 border-2 border-emerald-200 rounded-2xl focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100 focus:outline-none transition-all bg-emerald-50/50 placeholder-emerald-400 text-lg font-medium"
                    placeholder="Enter your full name"
                  />
                  <div className="absolute left-4 top-1/2 transform -translate-y-1/2 w-4 h-4 bg-emerald-300 rounded-full"></div>
                </div>
              </div>

              {/* Meal Type Selection */}
              <div className="space-y-4">
                <label className="flex items-center space-x-3 text-emerald-700 font-bold text-lg">
                  <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-emerald-500 rounded-xl flex items-center justify-center shadow-lg">
                    <Utensils className="w-5 h-5 text-white" />
                  </div>
                  <span>Meal Type</span>
                </label>
                <div className="grid grid-cols-3 gap-4">
                  {[
                    { mode: 'Breakfast', icon: '🌅', bgColor: 'from-yellow-500 to-orange-500', hoverColor: 'hover:from-yellow-600 hover:to-orange-600' },
                    { mode: 'Lunch', icon: '🍽️', bgColor: 'from-green-500 to-emerald-500', hoverColor: 'hover:from-green-600 hover:to-emerald-600' },
                    { mode: 'Dinner', icon: '🌙', bgColor: 'from-blue-500 to-indigo-500', hoverColor: 'hover:from-blue-600 hover:to-indigo-600' }
                  ].map(({ mode, icon, bgColor, hoverColor }) => (
                    <label key={mode} className="relative group">
                      <input
                        type="radio"
                        name="mode"
                        value={mode}
                        checked={formData.mode === mode}
                        onChange={(e) => setFormData({ ...formData, mode: e.target.value })}
                        className="sr-only"
                      />
                      <div className={`p-4 rounded-2xl border-2 cursor-pointer transition-all text-center font-bold transform group-hover:scale-105 ${
                        formData.mode === mode
                          ? `border-transparent bg-gradient-to-r ${bgColor} text-white shadow-2xl scale-105`
                          : `border-emerald-200 bg-gradient-to-r from-emerald-50 to-teal-50 text-emerald-700 hover:border-emerald-300 hover:shadow-lg ${hoverColor} hover:text-white`
                      }`}>
                        <div className="text-3xl mb-2">{icon}</div>
                        <div className="text-sm">{mode}</div>
                      </div>
                    </label>
                  ))}
                </div>
                
                {/* Enhanced Breakfast Info */}
                {formData.mode === 'Breakfast' && (
                  <div className="bg-gradient-to-r from-yellow-100 via-orange-100 to-amber-100 border-2 border-yellow-300 rounded-2xl p-5 animate-in slide-in-from-top-3 duration-500 relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-yellow-400 to-orange-400"></div>
                    <div className="flex items-start space-x-4">
                      <div className="w-12 h-12 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-xl flex items-center justify-center shadow-lg flex-shrink-0">
                        <Coffee className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <p className="font-bold text-yellow-800 mb-2 text-lg">
                          Breakfast Selection ({breakfastInfo.timeRange})
                        </p>
                        <p className="text-yellow-700 font-medium">
                          {breakfastInfo.isNextDay 
                            ? `🌅 Selecting breakfast for tomorrow (${breakfastInfo.targetDate})`
                            : `☀️ Selecting breakfast for today`
                          }
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Menu Display for Selected Meal */}
                <div className="bg-gradient-to-r from-gray-50 to-white rounded-2xl p-5 border border-gray-200">
                  <div className="flex items-center space-x-2 mb-2">
                    <Heart className="w-5 h-5 text-red-500 fill-current" />
                    <strong className="text-gray-700">Today's {formData.mode} Menu ({dayName}):</strong>
                  </div>
                  <div className="text-gray-600 font-medium bg-white rounded-lg p-3 shadow-sm">
                    {todayMenu[formData.mode] || 'No menu available.'}
                  </div>
                </div>
              </div>

              {/* Status Selection */}
              <div className="space-y-4">
                <label className="flex items-center space-x-3 text-emerald-700 font-bold text-lg">
                  <div className="w-10 h-10 bg-gradient-to-r from-teal-500 to-cyan-500 rounded-xl flex items-center justify-center shadow-lg">
                    <CheckCircle className="w-5 h-5 text-white" />
                  </div>
                  <span>Attendance Status</span>
                </label>
                <div className="grid grid-cols-2 gap-4">
                  {[
                    { status: 'In', icon: '✅', color: 'green', label: 'I am In', bgGradient: 'from-green-500 to-emerald-500' },
                    { status: 'Out', icon: '❌', color: 'red', label: 'I am Out', bgGradient: 'from-red-500 to-pink-500' }
                  ].map(({ status, icon, color, label, bgGradient }) => (
                    <button
                      key={status}
                      type="button"
                      onClick={() => handleStatusChange(status)}
                      className={`p-5 rounded-2xl font-bold transition-all text-center border-2 transform hover:scale-105 ${
                        formData.status === status
                          ? `bg-gradient-to-r ${bgGradient} text-white border-transparent shadow-2xl scale-105`
                          : 'bg-gradient-to-r from-gray-50 to-white text-gray-700 border-gray-200 hover:border-gray-300 hover:shadow-lg'
                      }`}
                    >
                      <div className="text-3xl mb-2">{icon}</div>
                      <div className="text-sm">{label}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Enhanced Type Selection */}
              {showTypeSelection && (
                <div className="space-y-4 animate-in slide-in-from-top-3 duration-500">
                  <label className="flex items-center space-x-3 text-emerald-700 font-bold text-lg">
                    <div className="w-10 h-10 bg-gradient-to-r from-lime-500 to-green-500 rounded-xl flex items-center justify-center shadow-lg">
                      <Leaf className="w-5 h-5 text-white" />
                    </div>
                    <span>Food Preference</span>
                  </label>
                  <div className="grid grid-cols-2 gap-4">
                    {[
                      { type: 'Veg', icon: '🌱', color: 'emerald', bgGradient: 'from-emerald-500 to-green-500' },
                      { type: 'Non-Veg', icon: '🍖', color: 'orange', bgGradient: 'from-orange-500 to-red-500' }
                    ]
                      .filter(({ type }) => {
                        const today = new Date().getDay();
                        if (type === 'Non-Veg') {
                          return [0, 3, 5].includes(today);
                        }
                        return true;
                      })
                      .map(({ type, icon, color, bgGradient }) => (
                        <button
                          key={type}
                          type="button"
                          onClick={() => setFormData({ ...formData, type })}
                          className={`p-5 rounded-2xl font-bold transition-all text-center border-2 transform hover:scale-105 ${
                            formData.type === type
                              ? `bg-gradient-to-r ${bgGradient} text-white border-transparent shadow-2xl scale-105`
                              : 'bg-gradient-to-r from-green-50 to-emerald-50 text-emerald-700 border-emerald-200 hover:border-emerald-300 hover:shadow-lg'
                          }`}
                        >
                          <div className="text-3xl mb-2">{icon}</div>
                          <div className="text-sm">{type}</div>
                        </button>
                      ))}
                  </div>
                </div>
              )}

              {/* Enhanced Submit Button */}
              <button
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="w-full bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 text-white p-5 rounded-2xl font-bold text-xl hover:from-emerald-700 hover:via-teal-700 hover:to-cyan-700 transition-all shadow-2xl hover:shadow-3xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-3 transform hover:scale-105 hover:-translate-y-1"
              >
                {isSubmitting ? (
                  <>
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
                    <span>Submitting...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle className="w-6 h-6" />
                    <span>Submit Entry</span>
                    <Sparkles className="w-5 h-5" />
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Enhanced Admin Access Card */}
          <div className="bg-gradient-to-r from-slate-900 via-gray-800 to-slate-900 rounded-3xl shadow-2xl p-6 border border-gray-700 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500"></div>
            <div className="absolute -top-20 -right-20 w-40 h-40 bg-gradient-to-r from-blue-600/10 to-purple-600/10 rounded-full blur-2xl"></div>
            
            <button
              onClick={() => setCurrentView('admin-login')}
              className="w-full bg-gradient-to-r from-gray-700 via-slate-700 to-gray-700 hover:from-gray-600 hover:via-slate-600 hover:to-gray-600 text-white p-5 rounded-2xl font-bold text-lg transition-all shadow-xl hover:shadow-2xl flex items-center justify-center space-x-3 transform hover:scale-105 border border-gray-600"
            >
              <Shield className="w-6 h-6" />
              <span>Admin Dashboard</span>
              <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></div>
            </button>
          </div>

          {/* Enhanced Footer */}
          <div className="text-center py-6">
            <div className="flex items-center justify-center space-x-2 text-emerald-600 font-semibold">
              <Star className="w-4 h-4 fill-current" />
              <p>Powered by VillaMart Catering System</p>
              <Star className="w-4 h-4 fill-current" />
            </div>
            <div className="flex items-center justify-center space-x-1 mt-2 text-teal-500 text-sm">
              <Heart className="w-3 h-3 fill-current" />
              <span>Made with love for our community</span>
              <Heart className="w-3 h-3 fill-current" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Enhanced Admin Login Component
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
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-gray-900 to-slate-800 relative overflow-hidden">
      {/* Animated background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-gradient-to-r from-blue-600/10 to-purple-600/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-gradient-to-r from-purple-600/10 to-pink-600/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
      </div>

      <div className="relative z-10 min-h-screen flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white/10 backdrop-blur-2xl rounded-3xl shadow-2xl p-8 border border-white/20">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-blue-600 via-purple-600 to-pink-600 rounded-3xl mb-6 shadow-2xl relative">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500 to-purple-600 rounded-3xl animate-pulse"></div>
              <Shield className="w-10 h-10 text-white relative z-10" />
              <div className="absolute -top-1 -right-1 w-6 h-6 bg-yellow-400 rounded-full flex items-center justify-center">
                <Sparkles className="w-3 h-3 text-yellow-800" />
              </div>
            </div>
            <h2 className="text-4xl font-bold bg-gradient-to-r from-white via-gray-100 to-white bg-clip-text text-transparent mb-3">
              Admin Access
            </h2>
            <p className="text-gray-300 font-medium">VillaMart Catering Dashboard</p>
          </div>
          
          <div className="space-y-6">
            <div>
              <label className="block text-white font-bold mb-4 text-lg">Security Passkey</label>
              <div className="relative">
                <input
                  type="password"
                  value={passkey}
                  onChange={(e) => setPasskey(e.target.value)}
                  className="w-full p-5 bg-white/10 border-2 border-white/20 rounded-2xl focus:border-blue-400 focus:ring-4 focus:ring-blue-400/20 focus:outline-none transition-all text-white placeholder-gray-400 text-lg backdrop-blur-sm"
                  placeholder="Enter admin passkey"
                  onKeyPress={(e) => e.key === 'Enter' && handleLogin()}
                />
                <div className="absolute right-4 top-1/2 transform -translate-y-1/2 w-4 h-4 bg-blue-400 rounded-full animate-pulse"></div>
              </div>
            </div>
            
            <button
              onClick={handleLogin}
              disabled={loading}
              className="w-full bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 text-white p-5 rounded-2xl font-bold text-lg hover:from-blue-700 hover:via-purple-700 hover:to-pink-700 transition-all shadow-2xl hover:shadow-3xl disabled:opacity-50 flex items-center justify-center space-x-3 transform hover:scale-105"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
                  <span>Authenticating...</span>
                </>
              ) : (
                <>
                  <Shield className="w-6 h-6" />
                  <span>Access Dashboard</span>
                  <Sparkles className="w-5 h-5" />
                </>
              )}
            </button>
          </div>
          
          <button
            onClick={() => setCurrentView('homepage')}
            className="w-full mt-6 bg-white/10 backdrop-blur-sm text-gray-300 p-4 rounded-2xl font-semibold hover:bg-white/20 transition-all border border-white/20 hover:border-white/30"
          >
            ← Back to Home
          </button>
        </div>
      </div>
    </div>
  );
};

// Enhanced Admin Dashboard Component
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
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-gray-900 to-slate-800 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-500/30 border-t-blue-500 rounded-full animate-spin mx-auto mb-4"></div>
          <div className="text-white text-2xl font-bold mb-2">Loading Dashboard...</div>
          <div className="text-gray-400">Please wait while we fetch your data</div>
        </div>
      </div>
    );
  }

  const totalVegNonVeg = calculateTotalVegNonVeg();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-gray-900 to-slate-800 relative overflow-hidden">
      {/* Background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-0 w-96 h-96 bg-gradient-to-r from-blue-600/5 to-purple-600/5 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 right-0 w-80 h-80 bg-gradient-to-r from-purple-600/5 to-pink-600/5 rounded-full blur-3xl"></div>
      </div>

      <div className="relative z-10 p-4 md:p-6">
        <div className="max-w-7xl mx-auto space-y-6">
          {/* Enhanced Header */}
          <div className="bg-white/10 backdrop-blur-2xl rounded-3xl shadow-2xl p-8 border border-white/20 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500"></div>
            
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
              <div className="flex items-center space-x-4">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-600 via-purple-600 to-pink-600 rounded-2xl flex items-center justify-center shadow-2xl">
                  <TrendingUp className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h1 className="text-4xl font-bold bg-gradient-to-r from-white via-gray-100 to-white bg-clip-text text-transparent mb-2">
                    VillaMart Admin
                  </h1>
                  <p className="text-gray-300 font-medium">Advanced Catering Analytics</p>
                </div>
              </div>
              <div className="flex gap-3">
                <button 
                  onClick={handleDownload} 
                  className="bg-gradient-to-r from-green-600 to-emerald-600 text-white px-6 py-3 rounded-2xl hover:from-green-700 hover:to-emerald-700 transition-all font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 flex items-center space-x-2"
                >
                  <Calendar className="w-5 h-5" />
                  <span>Export Excel</span>
                </button>
                <button
                  onClick={handleLogout}
                  className="bg-gradient-to-r from-red-600 to-pink-600 text-white px-6 py-3 rounded-2xl font-semibold hover:from-red-700 hover:to-pink-700 transition-all shadow-lg hover:shadow-xl transform hover:scale-105"
                >
                  Logout
                </button>
              </div>
            </div>
          </div>

          {/* Enhanced Date Selector */}
          <div className="bg-white/10 backdrop-blur-2xl rounded-3xl shadow-2xl p-6 border border-white/20">
            <label className="flex items-center space-x-3 text-white font-bold text-lg mb-4">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl flex items-center justify-center shadow-lg">
                <Calendar className="w-5 h-5 text-white" />
              </div>
              <span>Select Date</span>
            </label>
            <div className="flex flex-col lg:flex-row gap-4 items-start">
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="p-4 bg-white/10 border-2 border-white/20 rounded-2xl focus:border-blue-400 focus:ring-4 focus:ring-blue-400/20 focus:outline-none text-white backdrop-blur-sm text-lg"
              />
              <div className="text-sm text-gray-300 bg-white/5 backdrop-blur-sm p-4 rounded-2xl border border-white/10 flex-1">
                <strong className="text-white">Recent dates:</strong> {getAvailableDates().slice(-5).join(', ') || 'No data available'}
              </div>
            </div>
          </div>

          {/* Enhanced Summary Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-7 gap-4">
            {/* Breakfast Card */}
            <div className="bg-gradient-to-br from-yellow-500 via-orange-500 to-red-500 rounded-3xl shadow-2xl p-6 text-white relative overflow-hidden transform hover:scale-105 transition-all duration-300">
              <div className="absolute top-0 right-0 w-20 h-20 bg-white/10 rounded-full -translate-y-10 translate-x-10"></div>
              <div className="relative z-10">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-sm">
                    <Coffee className="w-6 h-6" />
                  </div>
                  <TrendingUp className="w-5 h-5" />
                </div>
                <h3 className="text-lg font-bold mb-2">Breakfast</h3>
                <p className="text-3xl font-black mb-2">{calculateTotals('Breakfast')}</p>
                <div className="text-sm opacity-90 font-medium">
                  {(() => {
                    const { veg, nonVeg } = calculateVegNonVeg('Breakfast');
                    return `🌱 ${veg} Veg • 🍖 ${nonVeg} Non-Veg`;
                  })()}
                </div>
              </div>
            </div>

            {/* Lunch Card */}
            <div className="bg-gradient-to-br from-green-500 via-emerald-500 to-teal-500 rounded-3xl shadow-2xl p-6 text-white relative overflow-hidden transform hover:scale-105 transition-all duration-300">
              <div className="absolute top-0 right-0 w-20 h-20 bg-white/10 rounded-full -translate-y-10 translate-x-10"></div>
              <div className="relative z-10">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-sm">
                    <Utensils className="w-6 h-6" />
                  </div>
                  <TrendingUp className="w-5 h-5" />
                </div>
                <h3 className="text-lg font-bold mb-2">Lunch</h3>
                <p className="text-3xl font-black mb-2">{calculateTotals('Lunch')}</p>
                <div className="text-sm opacity-90 font-medium">
                  {(() => {
                    const { veg, nonVeg } = calculateVegNonVeg('Lunch');
                    return `🌱 ${veg} Veg • 🍖 ${nonVeg} Non-Veg`;
                  })()}
                </div>
              </div>
            </div>

            {/* Dinner Card */}
            <div className="bg-gradient-to-br from-blue-500 via-indigo-500 to-purple-500 rounded-3xl shadow-2xl p-6 text-white relative overflow-hidden transform hover:scale-105 transition-all duration-300">
              <div className="absolute top-0 right-0 w-20 h-20 bg-white/10 rounded-full -translate-y-10 translate-x-10"></div>
              <div className="relative z-10">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-sm">
                    <Utensils className="w-6 h-6" />
                  </div>
                  <TrendingUp className="w-5 h-5" />
                </div>
                <h3 className="text-lg font-bold mb-2">Dinner</h3>
                <p className="text-3xl font-black mb-2">{calculateTotals('Dinner')}</p>
                <div className="text-sm opacity-90 font-medium">
                  {(() => {
                    const { veg, nonVeg } = calculateVegNonVeg('Dinner');
                    return `🌱 ${veg} Veg • 🍖 ${nonVeg} Non-Veg`;
                  })()}
                </div>
              </div>
            </div>

            {/* Total Present Card */}
            <div className="bg-gradient-to-br from-teal-500 via-cyan-500 to-blue-500 rounded-3xl shadow-2xl p-6 text-white relative overflow-hidden transform hover:scale-105 transition-all duration-300">
              <div className="absolute top-0 right-0 w-20 h-20 bg-white/10 rounded-full -translate-y-10 translate-x-10"></div>
              <div className="relative z-10">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-sm">
                    <Users className="w-6 h-6" />
                  </div>
                  <CheckCircle className="w-5 h-5" />
                </div>
                <h3 className="text-lg font-bold mb-2">Present</h3>
                <p className="text-3xl font-black mb-2">{filteredMeals.filter(meal => meal.status === 'In').length}</p>
                <div className="text-sm opacity-90 font-medium">People dining</div>
              </div>
            </div>

            {/* Total Absent Card */}
            <div className="bg-gradient-to-br from-gray-600 via-slate-600 to-gray-700 rounded-3xl shadow-2xl p-6 text-white relative overflow-hidden transform hover:scale-105 transition-all duration-300">
              <div className="absolute top-0 right-0 w-20 h-20 bg-white/10 rounded-full -translate-y-10 translate-x-10"></div>
              <div className="relative z-10">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-sm">
                    <Users className="w-6 h-6" />
                  </div>
                  <XCircle className="w-5 h-5" />
                </div>
                <h3 className="text-lg font-bold mb-2">Absent</h3>
                <p className="text-3xl font-black mb-2">{filteredMeals.filter(meal => meal.status === 'Out').length}</p>
                <div className="text-sm opacity-90 font-medium">People out</div>
              </div>
            </div>

            {/* Total Veg Card */}
            <div className="bg-gradient-to-br from-lime-500 via-green-500 to-emerald-500 rounded-3xl shadow-2xl p-6 text-white relative overflow-hidden transform hover:scale-105 transition-all duration-300">
              <div className="absolute top-0 right-0 w-20 h-20 bg-white/10 rounded-full -translate-y-10 translate-x-10"></div>
              <div className="relative z-10">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-sm text-2xl">
                    🌱
                  </div>
                  <CheckCircle className="w-5 h-5" />
                </div>
                <h3 className="text-lg font-bold mb-2">Total Veg</h3>
                <p className="text-3xl font-black mb-2">{totalVegNonVeg.veg}</p>
                <div className="text-sm opacity-90 font-medium">Veg meals today</div>
              </div>
            </div>

            {/* Total Non-Veg Card */}
            <div className="bg-gradient-to-br from-orange-500 via-red-500 to-pink-500 rounded-3xl shadow-2xl p-6 text-white relative overflow-hidden transform hover:scale-105 transition-all duration-300">
              <div className="absolute top-0 right-0 w-20 h-20 bg-white/10 rounded-full -translate-y-10 translate-x-10"></div>
              <div className="relative z-10">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-sm text-2xl">
                    🍖
                  </div>
                  <CheckCircle className="w-5 h-5" />
                </div>
                <h3 className="text-lg font-bold mb-2">Non-Veg</h3>
                <p className="text-3xl font-black mb-2">{totalVegNonVeg.nonVeg}</p>
                <div className="text-sm opacity-90 font-medium">Non-veg meals</div>
              </div>
            </div>
          </div>

          {/* Enhanced Data Table */}
          <div className="bg-white/10 backdrop-blur-2xl rounded-3xl shadow-2xl overflow-hidden border border-white/20">
            <div className="p-6 border-b border-white/20 bg-gradient-to-r from-blue-600/10 to-purple-600/10">
              <h3 className="text-2xl font-bold text-white flex items-center space-x-3">
                <Calendar className="w-6 h-6" />
                <span>Daily Meal Records</span>
              </h3>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 text-white">
                  <tr>
                    <th className="p-4 text-left font-bold">Date</th>
                    <th className="p-4 text-left font-bold">Name</th>
                    <th className="p-4 text-left font-bold">Meal</th>
                    <th className="p-4 text-left font-bold">Status</th>
                    <th className="p-4 text-left font-bold">Type</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredMeals.length === 0 ? (
                    <tr>
                      <td colSpan="5" className="p-12 text-center text-gray-300">
                        <div className="flex flex-col items-center space-y-4">
                          <div className="w-20 h-20 bg-white/5 rounded-3xl flex items-center justify-center">
                            <Calendar className="w-10 h-10 text-gray-400" />
                          </div>
                          <div>
                            <p className="text-2xl font-bold text-white mb-2">No Data Available</p>
                            <p className="text-gray-400 mb-4">No records found for {selectedDate}</p>
                            {getAvailableDates().length > 0 && (
                              <p className="text-sm text-gray-500">
                                Try dates: {getAvailableDates().slice(-3).join(', ')}
                              </p>
                            )}
                          </div>
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
                      <tr key={index} className="hover:bg-white/5 transition-colors border-b border-white/10 text-white">
                        <td className="p-4 font-semibold">
                          {new Date(meal.date).toLocaleDateString()}
                        </td>
                        <td className="p-4 font-semibold">{meal.name}</td>
                        <td className="p-4">
                          <span className={`px-4 py-2 rounded-full text-sm font-bold ${
                            meal.mode === 'Breakfast' 
                              ? 'bg-gradient-to-r from-yellow-500 to-orange-500 text-white'
                              : meal.mode === 'Lunch'
                              ? 'bg-gradient-to-r from-green-500 to-emerald-500 text-white'
                              : 'bg-gradient-to-r from-blue-500 to-indigo-500 text-white'
                          }`}>
                            {meal.mode === 'Breakfast' && '🌅'} 
                            {meal.mode === 'Lunch' && '🍽️'} 
                            {meal.mode === 'Dinner' && '🌙'} 
                            {meal.mode}
                          </span>
                        </td>
                        <td className="p-4">
                          <span className={`px-4 py-2 rounded-full text-sm font-bold ${
                            meal.status === 'In' 
                              ? 'bg-gradient-to-r from-green-500 to-emerald-500 text-white' 
                              : 'bg-gradient-to-r from-red-500 to-pink-500 text-white'
                          }`}>
                            {meal.status === 'In' ? '✅ Present' : '❌ Absent'}
                          </span>
                        </td>
                        <td className="p-4">
                          {meal.type ? (
                            <span className={`px-4 py-2 rounded-full text-sm font-bold ${
                              meal.type === 'Veg' 
                                ? 'bg-gradient-to-r from-lime-500 to-green-500 text-white' 
                                : 'bg-gradient-to-r from-orange-500 to-red-500 text-white'
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