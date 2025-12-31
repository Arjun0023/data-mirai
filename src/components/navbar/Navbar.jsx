import React, { useState } from 'react';
import { Sun, Moon, Eye } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';

/**
 * Modern, centered navigation bar with pill-shaped tabs
 * Implements clean UI pattern with subtle backgrounds and active state indicators
 */
function Navbar({
  darkMode,
  toggleDarkMode,
  savedCharts = [],
  showFileInfoIcon = false,
  onToggleFileInfoOverlay = () => { },
  uploadedFileData
}) {
  const navigate = useNavigate();
  const location = useLocation();

  // Hover state management for blue indicator
  const [hoveredTab, setHoveredTab] = useState(null);

  // Determine active route for visual feedback
  const isActive = (path) => location.pathname === path;

  return (
    <header
      className="flex justify-between items-center px-8 py-4"
      style={{
        backgroundColor: darkMode ? '#1a1a1a' : '#ffffff',
        borderBottom: `1px solid ${darkMode ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.1)'}`
      }}
    >
      {/* Logo */}
      <div className="flex items-center">
        <h1 className="text-lg font-semibold">
          <span className="text-blue-400">Autolytics</span>
          <span className={darkMode ? 'text-white' : 'text-gray-900'}>AI</span>
        </h1>
      </div>

      {/* Centered Navigation Tabs */}
      <nav className="absolute left-1/2 transform -translate-x-1/2 flex items-center gap-3">
        {/* Dashboard Tab */}
        <button
          onClick={() => navigate('/dashboard')}
          onMouseEnter={() => setHoveredTab('dashboard')}
          onMouseLeave={() => setHoveredTab(null)}
          className="relative px-6 py-2.5 rounded-full text-sm font-medium transition-all duration-200"
          style={{
            backgroundColor: isActive('/dashboard')
              ? darkMode ? '#2a2a2a' : '#f3f4f6'
              : hoveredTab === 'dashboard'
                ? darkMode ? 'rgba(42, 42, 42, 0.5)' : 'rgba(243, 244, 246, 0.5)'
                : 'transparent',
            color: isActive('/dashboard')
              ? darkMode ? '#ffffff' : '#111827'
              : darkMode ? '#9ca3af' : '#6b7280'
          }}
        >
          Dashboard
          {savedCharts && savedCharts.length > 0 && (
            <span
              className="ml-2 px-2 py-0.5 text-xs rounded-full bg-blue-500 text-white"
            >
              {savedCharts.length}
            </span>
          )}
          {/* Blue indicator - show on active OR hover */}
          {(isActive('/dashboard') || hoveredTab === 'dashboard') && (
            <div
              className="absolute left-1/2 transform -translate-x-1/2 bg-blue-500 rounded-full transition-opacity duration-200"
              style={{
                bottom: '4px',
                width: '48px',
                height: '3px',
                opacity: isActive('/dashboard') ? 1 : 0.7
              }}
            />
          )}
        </button>

        {/* Manual Mode Tab */}
        <button
          onClick={() => navigate('/manualmode')}
          onMouseEnter={() => setHoveredTab('manualmode')}
          onMouseLeave={() => setHoveredTab(null)}
          className="relative px-6 py-2.5 rounded-full text-sm font-medium transition-all duration-200"
          style={{
            backgroundColor: isActive('/manualmode')
              ? darkMode ? '#2a2a2a' : '#f3f4f6'
              : hoveredTab === 'manualmode'
                ? darkMode ? 'rgba(42, 42, 42, 0.5)' : 'rgba(243, 244, 246, 0.5)'
                : 'transparent',
            color: isActive('/manualmode')
              ? darkMode ? '#ffffff' : '#111827'
              : darkMode ? '#9ca3af' : '#6b7280'
          }}
        >
          Manual Mode
          {/* Blue indicator - show on active OR hover */}
          {(isActive('/manualmode') || hoveredTab === 'manualmode') && (
            <div
              className="absolute left-1/2 transform -translate-x-1/2 bg-blue-500 rounded-full transition-opacity duration-200"
              style={{
                bottom: '4px',
                width: '48px',
                height: '3px',
                opacity: isActive('/manualmode') ? 1 : 0.7
              }}
            />
          )}
        </button>
      </nav>

      {/* Right Side Actions */}
      <div className="flex items-center gap-2">
        {/* File Info Icon (conditional) */}
        {showFileInfoIcon && uploadedFileData && (
          <button
            onClick={onToggleFileInfoOverlay}
            className="p-2.5 rounded-lg transition-colors"
            style={{
              color: darkMode ? '#9ca3af' : '#6b7280'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = darkMode ? 'rgba(107, 114, 128, 0.1)' : 'rgba(107, 114, 128, 0.1)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'transparent';
            }}
            aria-label="Show uploaded file information"
            title="View file details"
          >
            <Eye size={18} />
          </button>
        )}

        {/* Theme Toggle */}
        <button
          onClick={toggleDarkMode}
          className="p-2 rounded-lg transition-colors hover:bg-gray-700"
          style={{
            color: darkMode ? '#9ca3af' : '#6b7280'
          }}
          aria-label={darkMode ? "Switch to light mode" : "Switch to dark mode"}
          title={darkMode ? "Light mode" : "Dark mode"}
        >
          {darkMode ? <Sun size={18} /> : <Moon size={18} />}
        </button>
      </div>
    </header>
  );
}

export default Navbar;