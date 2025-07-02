import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Sun, Moon, Trash2, BarChart, PieChart, Table, Download, Move } from 'lucide-react';
import { DndProvider, useDrag, useDrop } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import BarChartComponent from '../components/Dashboard/BarChart/BarChartComponent';
import DynamicStackedBarChartComponent from '../components/Dashboard/BarChart/DynamicStackBarChartComponent';
import PieChartComponent from '../components/Dashboard/PieChart/PieChartComponent';
import TableComponent from '../components/Dashboard/Table/TableComponent';
import ReactMarkdown from "react-markdown";
import domtoimage from 'dom-to-image';

// Define drag type
const CHART_ITEM = 'chart';

// Chart Card Component with Drag and Drop
const ChartCard = ({ chart, index, moveChart, changeChartDisplayMode, removeChart, chartDisplayModes, COLORS, darkMode, prepareDataForTable }) => {
  const ref = useRef(null);
  
  // Set up drag source
  const [{ isDragging }, drag] = useDrag({
    type: CHART_ITEM,
    item: () => ({ id: chart.id, index }),
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  });
  
  // Set up drop target
  const [, drop] = useDrop({
    accept: CHART_ITEM,
    hover: (draggedItem, monitor) => {
      if (!ref.current) {
        return;
      }
      
      const dragIndex = draggedItem.index;
      const hoverIndex = index;
      
      // Don't replace items with themselves
      if (dragIndex === hoverIndex) {
        return;
      }
      
      // Get rectangle on screen
      const hoverBoundingRect = ref.current.getBoundingClientRect();
      
      // Get vertical middle
      const hoverMiddleY = (hoverBoundingRect.bottom - hoverBoundingRect.top) / 2;
      
      // Get mouse position
      const clientOffset = monitor.getClientOffset();
      
      // Get pixels to the top
      const hoverClientY = clientOffset.y - hoverBoundingRect.top;
      
      // Only perform the move when the mouse has crossed half of the items height
      // When dragging downward, only move when the cursor is below 50%
      // When dragging upward, only move when the cursor is above 50%
      
      // Dragging downward
      if (dragIndex < hoverIndex && hoverClientY < hoverMiddleY) {
        return;
      }
      
      // Dragging upward
      if (dragIndex > hoverIndex && hoverClientY > hoverMiddleY) {
        return;
      }
      
      // Time to actually perform the action
      moveChart(dragIndex, hoverIndex);
      
      // Note: we're mutating the monitor item here!
      // Generally it's better to avoid mutations,
      // but it's good here for the sake of performance
      // to avoid expensive index searches.
      draggedItem.index = hoverIndex;
    },
  });
  
  // Initialize drag and drop ref (combine drag and drop refs)
  drag(drop(ref));
  
  return (
    <div 
      ref={ref}
      className={`rounded-xl border ${darkMode ? 'border-gray-700 bg-gray-800/80' : 'border-gray-200 bg-white/90'} backdrop-blur-sm shadow-lg ${isDragging ? 'opacity-50 ring-2 ring-blue-500/50' : 'opacity-100'} transition-all duration-200 hover:shadow-xl`}
      style={{ 
        cursor: isDragging ? 'grabbing' : 'grab'
      }}
    >
      <div className="flex justify-between  items-center p-3 border-b border-dashed border-opacity-30">
        <div className="flex items-center gap-2">
          <Move size={16} className={`${darkMode ? 'text-gray-400' : 'text-gray-500'} transition-colors duration-150 hover:text-blue-500`} />
          <h2 className="text-l font-medium tracking-tight">{chart.title || 'Untitled Chart'}</h2>
        </div>
        <div className="flex items-center gap-1">
          <button 
            onClick={() => changeChartDisplayMode(chart.id, 'barchart')}
            className={`p-2 rounded-md transition-colors duration-150 ${chartDisplayModes[chart.id] === 'barchart' 
              ? (darkMode ? 'bg-gray-700 text-blue-400' : 'bg-blue-50 text-blue-600') 
              : (darkMode ? 'text-gray-400 hover:bg-gray-700' : 'text-gray-500 hover:bg-gray-100')}`}
            title="Bar Chart"
          >
            <BarChart size={16} />
          </button>
          <button 
            onClick={() => changeChartDisplayMode(chart.id, 'piechart')}
            className={`p-2 rounded-md transition-colors duration-150 ${chartDisplayModes[chart.id] === 'piechart' 
              ? (darkMode ? 'bg-gray-700 text-blue-400' : 'bg-blue-50 text-blue-600') 
              : (darkMode ? 'text-gray-400 hover:bg-gray-700' : 'text-gray-500 hover:bg-gray-100')}`}
            title="Pie Chart"
          >
            <PieChart size={16} />
          </button>
          <button 
            onClick={() => changeChartDisplayMode(chart.id, 'table')}
            className={`p-2 rounded-md transition-colors duration-150 ${chartDisplayModes[chart.id] === 'table' 
              ? (darkMode ? 'bg-gray-700 text-blue-400' : 'bg-blue-50 text-blue-600') 
              : (darkMode ? 'text-gray-400 hover:bg-gray-700' : 'text-gray-500 hover:bg-gray-100')}`}
            title="Table View"
          >
            <Table size={16} />
          </button>
          <div className="h-5 mx-1 border-l border-opacity-30 border-gray-400"></div>
          <button 
            onClick={() => removeChart(chart.id)}
            className={`p-2 rounded-md text-red-500 opacity-70 hover:opacity-100 transition-opacity duration-150 ${darkMode ? 'hover:bg-red-900/30' : 'hover:bg-red-50'}`}
            title="Remove Chart"
          >
            <Trash2 size={16} />
          </button>
        </div>
      </div>

      <div className="px-4 pb-4">
        <div className="h-64 w-full flex items-center justify-center bg-opacity-30 rounded-lg overflow-hidden">
          {chartDisplayModes[chart.id] === 'barchart' && (
            <DynamicStackedBarChartComponent
              data={chart.data.formatted || []} 
              
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
      </div>

      {chart.generatedAt && (
        <div className={`px-4 py-2 text-xs border-t ${darkMode ? 'border-gray-700 text-gray-400' : 'border-gray-200 text-gray-500'} flex justify-between items-center`}>
          <span>Created: {new Date(chart.generatedAt).toLocaleString()}</span>
          <Download size={14} className="opacity-60 hover:opacity-100 cursor-pointer" title="Download chart" />
        </div>
      )}
    </div>
  );
};


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

  // Function to move a chart from one position to another
  const moveChart = (fromIndex, toIndex) => {
    // Create a copy of the array to avoid direct mutation
    const newCharts = [...savedCharts];
    // Remove the chart at fromIndex and store it
    const [movedChart] = newCharts.splice(fromIndex, 1);
    // Insert the moved chart at toIndex
    newCharts.splice(toIndex, 0, movedChart);
    // Update state with the new order
    setSavedCharts(newCharts);
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
    <DndProvider backend={HTML5Backend}>
      <div className={`flex flex-col min-h-screen transition-colors duration-300 ${darkMode ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-800'}`}>
        {/* Header */}
        <header className={`sticky top-0 z-10 backdrop-blur-md ${darkMode ? 'bg-gray-900/90 border-gray-800' : 'bg-white/90 border-gray-200'} border-b px-6 py-3 flex justify-between items-center shadow-sm`}>
          <div className="flex items-center space-x-4">
            <button 
              onClick={goBack} 
              className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-colors duration-150 ${darkMode ? 'hover:bg-gray-800 text-gray-300' : 'hover:bg-gray-100 text-gray-600'}`}
            >
              <ArrowLeft size={18} />
              <span>Back</span>
            </button>
            
            <h1 className="text-2xl font-semibold tracking-tight">
              <span className={`${darkMode ? 'text-blue-400' : 'text-blue-600'}`}>Data</span>
              <span>Dashboard</span>
            </h1>
          </div>
          
          <div className="flex items-center gap-3">
            <button 
              onClick={saveDashboardAsImage} 
              disabled={isSaving}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-150 
                ${darkMode 
                  ? 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500' 
                  : 'bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-400 hover:to-indigo-400'} 
                text-white font-medium shadow-md hover:shadow-lg ${isSaving ? 'opacity-70 cursor-not-allowed' : ''}`}
            >
              <Download size={18} />
              <span>{isSaving ? 'Saving...' : 'Export Dashboard'}</span>
            </button>
            
            <button 
              onClick={toggleDarkMode} 
              className={`p-2 rounded-lg transition-colors duration-150 ${darkMode ? 'bg-gray-800 text-yellow-300 hover:bg-gray-700' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
            >
              {darkMode ? <Sun size={20} /> : <Moon size={20} />}
            </button>
          </div>
        </header>

        {/* Main Content */}
        <main className={`flex-1 px-6 py-8 transition-colors duration-300 ${darkMode ? 'bg-gradient-to-b from-gray-900 to-gray-950' : 'bg-gradient-to-b from-gray-50 to-white'}`} ref={dashboardRef}>
          {savedCharts.length === 0 ? (
            <div className={`flex flex-col items-center justify-center h-64 border-2 border-dashed rounded-xl p-8 ${darkMode ? 'border-gray-700 bg-gray-800/30' : 'border-gray-200 bg-gray-50/50'}`}>
              <div className={`flex items-center justify-center w-16 h-16 mb-6 rounded-full ${darkMode ? 'bg-gray-800' : 'bg-blue-50'}`}>
                <BarChart size={24} className={darkMode ? 'text-blue-400' : 'text-blue-500'} />
              </div>
              <p className="text-xl font-medium mb-4">No visualization data available</p>
              <p className={`text-sm mb-6 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Create a new chart to start analyzing your data</p>
              <button 
                onClick={goBack} 
                className={`flex items-center gap-2 px-5 py-2 rounded-lg transition-all duration-150 
                  ${darkMode 
                    ? 'bg-blue-600 hover:bg-blue-500 text-white' 
                    : 'bg-blue-500 hover:bg-blue-400 text-white'} 
                  font-medium shadow-sm hover:shadow-md`}
              >
                <PieChart size={16} />
                <span>Create New Visualization</span>
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {savedCharts.map((chart, index) => (
                <ChartCard
                  key={chart.id}
                  chart={chart}
                  index={index}
                  moveChart={moveChart}
                  changeChartDisplayMode={changeChartDisplayMode}
                  removeChart={removeChart}
                  chartDisplayModes={chartDisplayModes}
                  COLORS={COLORS}
                  darkMode={darkMode}
                  prepareDataForTable={prepareDataForTable}
                />
              ))}
            </div>
          )}
        </main>

        {/* Footer */}
        <footer className={`py-4 px-6 border-t ${darkMode ? 'border-gray-800 text-gray-400' : 'border-gray-200 text-gray-500'}`}>
          <div className="flex justify-between items-center">
            <div className="text-sm">
              © {new Date().getFullYear()} Data Visualization Tool
            </div>
            <div className="text-xs">
              <span className={darkMode ? 'text-blue-400' : 'text-blue-600'}>AI-Powered</span> Analytics Dashboard
            </div>
          </div>
        </footer>
      </div>
    </DndProvider>
  );
}

export default Dashboard;