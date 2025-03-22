import React, { useRef } from 'react';
import { useDrag, useDrop } from 'react-dnd';
import { GripVertical, Trash2, BarChart, LineChart as LineChartIcon, PieChart as PieChartIcon, Table, Copy } from 'lucide-react';

// Import the separate chart components
import BarChartComponent from './BarChartComponent';
import PieChartComponent from './PieChartComponent';
import TableComponent from './TableComponent';

const ItemTypes = {
  CHART: 'chart'
};

const ChartCard = ({ 
  chart, 
  index, 
  moveChart, 
  changeChartDisplayMode, 
  removeChart, 
  chartDisplayModes, 
  COLORS, 
  darkMode,
  prepareDataForTable
}) => {
  const ref = useRef(null);
  
  const [{ isDragging }, drag] = useDrag({
    type: ItemTypes.CHART,
    item: { index },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  });

  const [, drop] = useDrop({
    accept: ItemTypes.CHART,
    hover(item, monitor) {
      if (!ref.current) {
        return;
      }
      const dragIndex = item.index;
      const hoverIndex = index;
      
      if (dragIndex === hoverIndex) {
        return;
      }
      
      moveChart(dragIndex, hoverIndex);
      item.index = hoverIndex;
    },
  });

  drag(drop(ref));

  const renderChartContent = () => {
    const { data, title, xKey, yKey, displayMode } = chart;
    
    if (!data || data.length === 0) {
      return (
        <div className={`flex items-center justify-center h-64 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
          No data available
        </div>
      );
    }

    switch (displayMode) {
      case chartDisplayModes.BAR:
        return (
          <BarChartComponent 
            data={data} 
            xKey={xKey} 
            yKey={yKey} 
            colors={COLORS} 
            darkMode={darkMode} 
          />
        );
      case chartDisplayModes.LINE:
        // Assuming you have a LineChartComponent or using the BarChartComponent with a prop to change the type
        return (
          <BarChartComponent 
            data={data} 
            xKey={xKey} 
            yKey={yKey} 
            colors={COLORS} 
            darkMode={darkMode} 
            chartType="line"
          />
        );
      case chartDisplayModes.PIE:
        return (
          <PieChartComponent 
            data={data} 
            nameKey={xKey} 
            dataKey={yKey} 
            colors={COLORS} 
            darkMode={darkMode} 
          />
        );
      case chartDisplayModes.TABLE:
        const { headers, rows } = prepareDataForTable(data, xKey, yKey);
        return (
          <TableComponent 
            headers={headers} 
            rows={rows} 
            darkMode={darkMode} 
          />
        );
      default:
        return null;
    }
  };

  const renderChartTypeIcon = () => {
    switch (chart.displayMode) {
      case chartDisplayModes.BAR:
        return <BarChart className={`h-2 w-2 ${darkMode ? 'text-blue-400' : 'text-blue-500'}`} />;
      case chartDisplayModes.LINE:
        return <LineChartIcon className={`h-2 w-2 ${darkMode ? 'text-green-400' : 'text-green-500'}`} />;
      case chartDisplayModes.PIE:
        return <PieChartIcon className={`h-2 w-2 ${darkMode ? 'text-purple-400' : 'text-purple-500'}`} />;
      case chartDisplayModes.TABLE:
        return <Table className={`h-2 w-2 ${darkMode ? 'text-orange-400' : 'text-orange-500'}`} />;
      default:
        return <BarChart className={`h-2 w-2 ${darkMode ? 'text-blue-400' : 'text-blue-500'}`} />;
    }
  };

  return (
    <div 
      ref={ref} 
      className={`rounded-xl overflow-hidden ${darkMode ? 'bg-gray-800 text-gray-100' : 'bg-white text-gray-800'} shadow-lg border ${darkMode ? 'border-gray-700' : 'border-gray-200'} ${isDragging ? 'opacity-50' : 'opacity-100'}`}
    >
      {/* Header */}
      <div className={`px-4 py-2 border-b ${darkMode ? 'border-gray-700 bg-gray-900' : 'border-gray-200 bg-gray-50'} flex items-center justify-between`}>
        <div className="flex items-center space-x-3">
          <div className={`p-2 rounded-lg ${darkMode ? 'bg-indigo-900/40 cursor-move' : 'bg-indigo-100 cursor-move'}`} role="handle">
            <GripVertical className={`h-4 w-4 ${darkMode ? 'text-indigo-300' : 'text-indigo-600'}`} />
          </div>
          <div>
            <h2 className="text-lg font-semibold">{chart.title}</h2>
            <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
              {chart.data?.length || 0} data points
            </p>
          </div>
        </div>
        <div className="flex space-x-2">
          <button 
            onClick={() => changeChartDisplayMode(chart.id, chartDisplayModes.BAR)}
            className={`p-2 rounded-lg ${darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'} transition-colors ${chart.displayMode === chartDisplayModes.BAR ? (darkMode ? 'bg-gray-700' : 'bg-gray-100') : ''}`}
            title="Bar Chart"
          >
            <BarChart className={`h-4 w-4 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`} />
          </button>
          <button 
            onClick={() => changeChartDisplayMode(chart.id, chartDisplayModes.LINE)}
            className={`p-2 rounded-lg ${darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'} transition-colors ${chart.displayMode === chartDisplayModes.LINE ? (darkMode ? 'bg-gray-700' : 'bg-gray-100') : ''}`}
            title="Line Chart"
          >
            <LineChartIcon className={`h-4 w-4 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`} />
          </button>
          <button 
            onClick={() => changeChartDisplayMode(chart.id, chartDisplayModes.PIE)}
            className={`p-2 rounded-lg ${darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'} transition-colors ${chart.displayMode === chartDisplayModes.PIE ? (darkMode ? 'bg-gray-700' : 'bg-gray-100') : ''}`}
            title="Pie Chart"
          >
            <PieChartIcon className={`h-4 w-4 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`} />
          </button>
          <button 
            onClick={() => changeChartDisplayMode(chart.id, chartDisplayModes.TABLE)}
            className={`p-2 rounded-lg ${darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'} transition-colors ${chart.displayMode === chartDisplayModes.TABLE ? (darkMode ? 'bg-gray-700' : 'bg-gray-100') : ''}`}
            title="Table View"
          >
            <Table className={`h-4 w-4 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`} />
          </button>
          <button 
            onClick={() => removeChart(chart.id)}
            className={`p-2 rounded-lg ${darkMode ? 'hover:bg-red-900/50 text-red-400 hover:text-red-300' : 'hover:bg-red-100 text-red-500 hover:text-red-600'} transition-colors`}
            title="Remove Chart"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Chart Content */}
      <div className="p-4">
        <div className={`mb-2 p-4 rounded-lg ${darkMode ? 'bg-gray-900/50' : 'bg-gray-50'}`}>
          <div className="flex items-center space-x-2 mb-3">
            {renderChartTypeIcon()}
            <h3 className={`font-medium ${darkMode ? 'text-gray-200' : 'text-gray-700'}`}>
              {chart.displayMode === chartDisplayModes.BAR ? 'Bar Chart' :
               chart.displayMode === chartDisplayModes.LINE ? 'Line Chart' :
               chart.displayMode === chartDisplayModes.PIE ? 'Pie Chart' : 'Table View'}
            </h3>
          </div>
          {renderChartContent()}
        </div>
      </div>

      {/* Footer with data summary */}
      <div className={`px-6 py-4 ${darkMode ? 'bg-indigo-900/20 text-indigo-300' : 'bg-indigo-50 text-indigo-700'} border-t ${darkMode ? 'border-indigo-900/50' : 'border-indigo-100'} flex items-center justify-between`}>
        <div className="flex items-center">
          <div className={`p-2 rounded-full mr-3 ${darkMode ? 'bg-indigo-800/50' : 'bg-indigo-100'}`}>
            <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 3L20.5 8V16L12 21L3.5 16V8L12 3Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="2"/>
            </svg>
          </div>
          <p className="text-sm">
            {chart.data?.length || 0} data points • 
            <span className="font-medium ml-1">
              {chart.xKey}: {chart.yKey}
            </span>
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <button 
            className={`p-2 rounded-lg ${darkMode ? 'hover:bg-indigo-800/50' : 'hover:bg-indigo-100'} transition-colors`}
            title="Copy data"
          >
            <Copy className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChartCard;