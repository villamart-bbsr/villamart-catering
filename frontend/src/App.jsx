import React, { useState, useEffect } from 'react';

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

    try {
      await api.submitMeal({
        name: formData.name,
        mode: formData.mode,
        status: formData.status,
        type: formData.status === 'In' ? formData.type : null
      });
      
      alert('Submission successful!');
      setFormData({ name: '', mode: 'Lunch', status: '', type: '' });
      setShowTypeSelection(false);
    } catch (error) {
      alert('Submission failed. Please try again.');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-green-100 p-4">
      <div className="max-w-md mx-auto bg-white rounded-lg shadow-lg p-6">
        {/* Header with current time */}
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold text-green-800 mb-2">Meal Tracker</h1>
          <div className="bg-green-100 rounded-lg p-3">
            <p className="text-green-700 font-semibold">
              {currentTime.toLocaleDateString('en-US', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}
            </p>
            <p className="text-green-600">
              {currentTime.toLocaleTimeString()}
            </p>
          </div>
        </div>

        {/* Form */}
        <div className="space-y-4">
          {/* Name Input */}
          <div>
            <label className="block text-green-700 font-medium mb-2">Name</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full p-3 border-2 border-green-200 rounded-lg focus:border-green-500 focus:outline-none"
              placeholder="Enter your name"
            />
          </div>

          {/* Mode Selection */}
          <div>
            <label className="block text-green-700 font-medium mb-2">Mode</label>
            <div className="flex space-x-4">
              {['Lunch', 'Dinner'].map(mode => (
                <label key={mode} className="flex items-center">
                  <input
                    type="radio"
                    name="mode"
                    value={mode}
                    checked={formData.mode === mode}
                    onChange={(e) => setFormData({ ...formData, mode: e.target.value })}
                    className="mr-2 text-green-600"
                  />
                  <span className="text-green-700">{mode}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Status Selection */}
          <div>
            <label className="block text-green-700 font-medium mb-2">Status</label>
            <div className="flex space-x-4">
              {['In', 'Out'].map(status => (
                <button
                  key={status}
                  type="button"
                  onClick={() => handleStatusChange(status)}
                  className={`flex-1 p-3 rounded-lg font-medium transition-colors ${
                    formData.status === status
                      ? 'bg-green-600 text-white'
                      : 'bg-green-100 text-green-700 hover:bg-green-200'
                  }`}
                >
                  I am {status}
                </button>
              ))}
            </div>
          </div>

          {/* Type Selection (only if "In" is selected) */}
          {showTypeSelection && (
            <div>
              <label className="block text-green-700 font-medium mb-2">Food Type</label>
              <div className="flex space-x-4">
                {['Veg', 'Non-Veg'].map(type => (
                  <button
                    key={type}
                    type="button"
                    onClick={() => setFormData({ ...formData, type })}
                    className={`flex-1 p-3 rounded-lg font-medium transition-colors ${
                      formData.type === type
                        ? 'bg-green-600 text-white'
                        : 'bg-green-100 text-green-700 hover:bg-green-200'
                    }`}
                  >
                    {type}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Submit Button */}
          <button
            onClick={handleSubmit}
            className="w-full bg-green-600 text-white p-3 rounded-lg font-medium hover:bg-green-700 transition-colors"
          >
            Submit
          </button>
        </div>

        {/* Admin Button */}
        <div className="mt-6 pt-4 border-t border-green-200">
          <button
            onClick={() => setCurrentView('admin-login')}
            className="w-full bg-green-800 text-white p-3 rounded-lg font-medium hover:bg-green-900 transition-colors"
          >
            Admin Login
          </button>
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
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-green-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-6">
        <h2 className="text-2xl font-bold text-green-800 text-center mb-6">Admin Login</h2>
        
        <div className="space-y-4">
          <div>
            <label className="block text-green-700 font-medium mb-2">Admin Passkey</label>
            <input
              type="password"
              value={passkey}
              onChange={(e) => setPasskey(e.target.value)}
              className="w-full p-3 border-2 border-green-200 rounded-lg focus:border-green-500 focus:outline-none"
              placeholder="Enter admin passkey"
            />
          </div>
          
          <button
            onClick={handleLogin}
            disabled={loading}
            className="w-full bg-green-600 text-white p-3 rounded-lg font-medium hover:bg-green-700 transition-colors disabled:opacity-50"
          >
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </div>
        
        <button
          onClick={() => setCurrentView('homepage')}
          className="w-full mt-4 bg-gray-500 text-white p-3 rounded-lg font-medium hover:bg-gray-600 transition-colors"
        >
          Back to Homepage
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

  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    setIsAdmin(false);
    setCurrentView('homepage');
  };

  // Fixed date filtering logic
  const filteredMeals = meals.filter(meal => {
    // Extract date part from ISO string for comparison
    const mealDateStr = meal.date.substring(0, 10); // Gets "2025-08-12" from "2025-08-12T18:30:00.000Z"
    return mealDateStr === selectedDate;
  });

  const calculateTotals = (mode) => {
    return filteredMeals.filter(meal => 
      meal.mode === mode && meal.status === 'In'
    ).length;
  };

  // Helper function to get unique dates from meals for debugging
  const getAvailableDates = () => {
    const dates = meals.map(meal => meal.date.substring(0, 10));
    return [...new Set(dates)].sort();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-green-100 flex items-center justify-center">
        <div className="text-green-700 text-xl">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-green-100 p-4">
      <div className="max-w-6xl mx-auto bg-white rounded-lg shadow-lg p-6">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-green-800">Admin Dashboard</h1>
          <button
            onClick={handleLogout}
            className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
          >
            Logout
          </button>
        </div>

        {/* Date Selector */}
        <div className="mb-6">
          <label className="block text-green-700 font-medium mb-2">Select Date</label>
          <div className="flex flex-col sm:flex-row gap-4">
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="p-2 border-2 border-green-200 rounded-lg focus:border-green-500 focus:outline-none"
            />
            <div className="text-sm text-gray-600">
              Available dates: {getAvailableDates().join(', ')}
            </div>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div className="bg-green-100 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-green-800">Lunch Count</h3>
            <p className="text-2xl font-bold text-green-600">{calculateTotals('Lunch')} people</p>
          </div>
          <div className="bg-green-100 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-green-800">Dinner Count</h3>
            <p className="text-2xl font-bold text-green-600">{calculateTotals('Dinner')} people</p>
          </div>
        </div>

        {/* Data Table */}
        <div className="overflow-x-auto">
          <table className="w-full border-collapse border border-green-300">
            <thead>
              <tr className="bg-green-600 text-white">
                <th className="border border-green-300 p-3 text-left">Date</th>
                <th className="border border-green-300 p-3 text-left">Name</th>
                <th className="border border-green-300 p-3 text-left">Mode</th>
                <th className="border border-green-300 p-3 text-left">Status</th>
                <th className="border border-green-300 p-3 text-left">Type</th>
              </tr>
            </thead>
            <tbody>
              {filteredMeals.length === 0 ? (
                <tr>
                  <td colSpan="5" className="border border-green-300 p-3 text-center text-gray-500">
                    No data available for selected date ({selectedDate})
                    <br />
                    <small>Try selecting one of these dates: {getAvailableDates().join(', ')}</small>
                  </td>
                </tr>
              ) : (
                filteredMeals.map((meal, index) => (
                  <tr key={index} className="hover:bg-green-50">
                    <td className="border border-green-300 p-3">
                      {new Date(meal.date).toLocaleDateString()}
                    </td>
                    <td className="border border-green-300 p-3">{meal.name}</td>
                    <td className="border border-green-300 p-3">{meal.mode}</td>
                    <td className="border border-green-300 p-3">
                      <span className={`px-2 py-1 rounded text-sm ${
                        meal.status === 'In' 
                          ? 'bg-green-200 text-green-800' 
                          : 'bg-red-200 text-red-800'
                      }`}>
                        {meal.status}
                      </span>
                    </td>
                    <td className="border border-green-300 p-3">
                      {meal.type || '-'}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Debug Info (remove in production) */}
        <div className="mt-4 p-4 bg-gray-100 rounded-lg text-sm text-gray-600">
          <strong>Debug Info:</strong><br />
          Selected Date: {selectedDate}<br />
          Total Meals: {meals.length}<br />
          Filtered Meals: {filteredMeals.length}<br />
          Available Dates: {getAvailableDates().join(', ')}
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