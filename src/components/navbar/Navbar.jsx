import React from 'react';
import { Sun, Moon, Layout } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

function Navbar({ darkMode, toggleDarkMode, savedCharts }) {
  const navigate = useNavigate();

  // Navigate to dashboard
  const goToDashboard = () => {
    navigate('/dashboard');
  };

  return (
    <header className={`flex justify-between items-center p-4 border-b shadow-sm ${darkMode ? 'border-gray-700 bg-gray-800' : 'border-gray-200 bg-white'}`}>
      <div className="flex items-center">
        <h1 className="text-2xl font-semibold bg-gradient-to-r from-indigo-500 to-blue-600 bg-clip-text text-transparent">AI Assistant</h1>
        <button
          onClick={goToDashboard}
          className={`ml-6 px-4 py-2 rounded-lg flex items-center transition-colors ${
            darkMode ? 'bg-gray-700 hover:bg-gray-600 text-gray-200' : 'bg-white hover:bg-gray-50 text-gray-700 border border-gray-200 shadow-sm'
          }`}
        >
          <Layout size={18} className="mr-2" />
          Dashboard
          {savedCharts.length > 0 && (
            <span className={`ml-2 px-2 py-0.5 text-xs rounded-full ${
              darkMode ? 'bg-indigo-600 text-white' : 'bg-indigo-500 text-white'
            }`}>
              {savedCharts.length}
            </span>
          )}
        </button>
      </div>
      <button
        onClick={toggleDarkMode}
        className={`p-2 rounded-lg transition-colors ${darkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-white hover:bg-gray-50 border border-gray-200 shadow-sm'}`}
        aria-label={darkMode ? "Switch to light mode" : "Switch to dark mode"}
      >
        {darkMode ? <Sun size={20} className="text-gray-300" /> : <Moon size={20} className="text-gray-700" />}
      </button>
    </header>
  );
}

export default Navbar;