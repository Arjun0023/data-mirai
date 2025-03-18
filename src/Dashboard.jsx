import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Sun, Moon, Trash2, BarChart, PieChart, Table, Download } from 'lucide-react';
import BarChartComponent from './BarChartComponent';
import PieChartComponent from './PieChartComponent';
import TableComponent from './TableComponent';
import ReactMarkdown from "react-markdown";
import domtoimage from 'dom-to-image';

function Dashboard() {
  const navigate = useNavigate();
  const [darkMode, setDarkMode] = useState(false);
  const [savedCharts, setSavedCharts] = useState([]);
  const [chartDisplayModes, setChartDisplayModes] = useState({});
  const [isSaving, setIsSaving] = useState(false);
  const dashboardRef = useRef(null);
  
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d', '#ffc658', '#8dd1e1', '#a4de6c', '#d0ed57'];

  useEffect(() => {
    const savedChartsData = localStorage.getItem('savedCharts');
    console.log('Loading saved charts from localStorage:', savedChartsData);
    if (savedChartsData) {
      const charts = JSON.parse(savedChartsData);
      console.log('Parsed charts:', charts);
      if (charts && charts.length > 0) {
        setSavedCharts(charts);
        
        // Initialize display modes for each chart
        const modes = {};
        charts.forEach(chart => {
          modes[chart.id] = chart.displayMode || 'barchart';
        });
        setChartDisplayModes(modes);
      }
    }
  }, []);
  
  useEffect(() => {
    if (savedCharts.length > 0) {
      localStorage.setItem('savedCharts', JSON.stringify(savedCharts));
    }
  }, [savedCharts]);

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
  };

  const goBack = () => {
    navigate('/home');
  };

  const removeChart = (chartId) => {
    setSavedCharts(savedCharts.filter(chart => chart.id !== chartId));
  };

  const changeChartDisplayMode = (chartId, mode) => {
    setChartDisplayModes(prev => ({ ...prev, [chartId]: mode }));
    
    // Also update the chart's stored display mode
    setSavedCharts(savedCharts.map(chart => 
      chart.id === chartId ? { ...chart, displayMode: mode } : chart
    ));
  };

  // Function to flatten the data for the table
  const prepareDataForTable = (resultData) => {
    if (!Array.isArray(resultData.formatted)) {
      return [];
    }
    
    const flattenedData = resultData.formatted.map(item => {
      if (item.name !== undefined && item.value !== undefined && typeof item.value === 'object') {
        return item.value;
      }
      return item;
    });
    
    return flattenedData;
  };

  // Function to save the dashboard as an image using dom-to-image
  const saveDashboardAsImage = () => {
    if (!dashboardRef.current) return;
    
    setIsSaving(true);
    
    // Using dom-to-image instead of html2canvas
    domtoimage.toJpeg(dashboardRef.current, {
      quality: 0.95,
      bgcolor: darkMode ? '#1a202c' : '#ffffff',
      height: dashboardRef.current.offsetHeight,
      width: dashboardRef.current.offsetWidth,
      style: {
        'transform': 'scale(1)',
        'transform-origin': 'top left'
      }
    })
    .then(function(dataUrl) {
      const link = document.createElement('a');
      link.download = `dashboard-${new Date().toISOString().slice(0, 10)}.jpg`;
      link.href = dataUrl;
      link.click();
      setIsSaving(false);
    })
    .catch(function(error) {
      console.error('Error saving dashboard:', error);
      
      // Try the fallback approach of capturing individual charts
      tryFallbackMethod();
    });
  };
  
  // Fallback method - create screenshots using browser API
  const tryFallbackMethod = () => {
    // Alert user about trying a different approach
    alert('Trying a different method to capture your dashboard...');
    
    try {
      // 1. Create a canvas element and get the 2D context
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      
      if (!dashboardRef.current || !ctx) {
        throw new Error("Failed to create canvas context");
      }
      
      // 2. Set canvas dimensions
      const width = dashboardRef.current.offsetWidth;
      const height = dashboardRef.current.offsetHeight;
      const scale = 2; // Higher resolution
      canvas.width = width * scale;
      canvas.height = height * scale;
      
      // 3. Set background based on theme
      ctx.fillStyle = darkMode ? '#1a202c' : '#ffffff';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      // 4. Draw content using SVG foreignObject (works better with modern CSS)
      const data = `
        <svg xmlns="http://www.w3.org/2000/svg" width="${width * scale}" height="${height * scale}">
          <foreignObject width="100%" height="100%" style="transform: scale(${scale}); transform-origin: top left;">
            ${new XMLSerializer().serializeToString(dashboardRef.current)}
          </foreignObject>
        </svg>
      `;
      
      // 5. Create an image from the SVG
      const img = new Image();
      img.onload = function() {
        ctx.drawImage(img, 0, 0);
        
        // 6. Convert canvas to JPEG and download
        try {
          const link = document.createElement('a');
          link.download = `dashboard-${new Date().toISOString().slice(0, 10)}.jpg`;
          link.href = canvas.toDataURL('image/jpeg', 0.95);
          link.click();
        } catch (e) {
          console.error("Failed in final image conversion:", e);
          alert("Sorry, couldn't capture the dashboard. Please use your browser's screenshot feature instead.");
        } finally {
          setIsSaving(false);
        }
      };
      
      img.onerror = function() {
        console.error("Failed to load SVG image");
        setIsSaving(false);
        alert("Sorry, couldn't capture the dashboard. Please use your browser's screenshot feature instead.");
      };
      
      // Set the image source to the SVG data
      img.src = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(data);
    } catch (err) {
      console.error("Fallback method failed:", err);
      setIsSaving(false);
      alert("Sorry, couldn't capture the dashboard. Please use your browser's screenshot feature instead.");
    }
  };

  return (
    <div className={`flex flex-col min-h-screen transition-colors duration-200 ${darkMode ? 'bg-gray-900 text-white' : 'bg-white text-gray-800'}`}>
      {/* Header */}
      <header className={`flex justify-between items-center p-4 border-b ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
        <button 
          onClick={goBack} 
          className={`flex items-center gap-2 px-3 py-2 rounded-lg ${darkMode ? 'hover:bg-gray-800' : 'hover:bg-gray-100'}`}
        >
          <ArrowLeft size={18} />
          <span>Back</span>
        </button>
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <div className="flex items-center gap-2">
          <button 
            onClick={saveDashboardAsImage} 
            disabled={isSaving}
            className={`flex items-center gap-2 px-3 py-2 rounded-lg ${darkMode ? 'bg-blue-600 hover:bg-blue-700' : 'bg-blue-500 hover:bg-blue-600'} text-white ${isSaving ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            <Download size={18} />
            <span>{isSaving ? 'Saving...' : 'Save as Image'}</span>
          </button>
          <button 
            onClick={toggleDarkMode} 
            className={`p-2 rounded-full ${darkMode ? 'hover:bg-gray-800' : 'hover:bg-gray-100'}`}
          >
            {darkMode ? <Sun size={18} /> : <Moon size={18} />}
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 p-6" ref={dashboardRef}>
        {savedCharts.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full">
            <p className="text-xl mb-4">No saved charts yet</p>
            <button 
              onClick={goBack} 
              className={`px-4 py-2 rounded-lg ${darkMode ? 'bg-blue-600 hover:bg-blue-700' : 'bg-blue-500 hover:bg-blue-600'} text-white`}
            >
              Create a new chart
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {savedCharts.map((chart) => (
              <div 
                key={chart.id} 
                className={`rounded-lg p-4 shadow-lg ${darkMode ? 'bg-gray-800' : 'bg-white'}`}
              >
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-semibold">{chart.title || 'Untitled Chart'}</h2>
                  <div className="flex gap-2">
                    <button 
                      onClick={() => changeChartDisplayMode(chart.id, 'barchart')}
                      className={`p-2 rounded ${chartDisplayModes[chart.id] === 'barchart' ? (darkMode ? 'bg-gray-700' : 'bg-gray-200') : ''}`}
                    >
                      <BarChart size={16} />
                    </button>
                    <button 
                      onClick={() => changeChartDisplayMode(chart.id, 'piechart')}
                      className={`p-2 rounded ${chartDisplayModes[chart.id] === 'piechart' ? (darkMode ? 'bg-gray-700' : 'bg-gray-200') : ''}`}
                    >
                      <PieChart size={16} />
                    </button>
                    <button 
                      onClick={() => changeChartDisplayMode(chart.id, 'table')}
                      className={`p-2 rounded ${chartDisplayModes[chart.id] === 'table' ? (darkMode ? 'bg-gray-700' : 'bg-gray-200') : ''}`}
                    >
                      <Table size={16} />
                    </button>
                    <button 
                      onClick={() => removeChart(chart.id)}
                      className={`p-2 rounded text-red-500 hover:${darkMode ? 'bg-gray-700' : 'bg-gray-200'}`}
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>

                <div className="h-64">
                  {chartDisplayModes[chart.id] === 'barchart' && (
                    <BarChartComponent 
                      data={chart.data.formatted || []} 
                      colors={COLORS} 
                      darkMode={darkMode}
                    />
                  )}
                  {chartDisplayModes[chart.id] === 'piechart' && (
                    <PieChartComponent 
                      data={chart.data.formatted || []} 
                      colors={COLORS} 
                      darkMode={darkMode}
                    />
                  )}
                  {chartDisplayModes[chart.id] === 'table' && (
                    <TableComponent 
                      data={prepareDataForTable(chart.data)} 
                      darkMode={darkMode}
                    />
                  )}
                </div>

                {chart.generatedAt && (
                  <div className={`mt-4 text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                    Created: {new Date(chart.generatedAt).toLocaleString()}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className={`p-4 text-center text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
        © {new Date().getFullYear()} Data Visualization Tool
      </footer>
    </div>
  );
}

export default Dashboard;