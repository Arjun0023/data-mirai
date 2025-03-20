import React, { useMemo } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';

const DynamicStackedBarChartComponent = ({ 
  data, 
  darkMode,
  xAxisKey = null, // Optional: key to use for x-axis (if not provided, will detect automatically)
  valueKey = null, // Optional: key containing numeric values (if not provided, will detect automatically)
  categoryKey = null, // Optional: key for stacking/grouping (if not provided, will detect automatically)
  colors = [] // Optional: custom colors array
}) => {
  // Process the data to transform it for the stacked bar chart format
  const processedData = useMemo(() => {
    if (!Array.isArray(data) || data.length === 0) {
      return { data: [], categoryKey: null, xAxisKey: null, categories: [] };
    }
    
    // Sample first data item to detect structure
    const sampleItem = data[0];
    const keys = Object.keys(sampleItem);
    
    // Auto-detect keys if not provided
    let detectedXAxisKey = xAxisKey;
    let detectedValueKey = valueKey;
    let detectedCategoryKey = categoryKey;
    
    if (!detectedXAxisKey || !detectedValueKey || !detectedCategoryKey) {
      // Analyze data types to make educated guesses about key roles
      const keyTypes = {};
      
      keys.forEach(key => {
        // Check if this key contains numeric values across all items
        const isNumeric = data.every(item => {
          const val = item[key];
          return !isNaN(parseFloat(val)) && isFinite(val);
        });
        
        // Check if this key contains string values
        const isString = data.every(item => {
          const val = item[key];
          return typeof val === 'string' || val instanceof String;
        });
        
        keyTypes[key] = { isNumeric, isString };
      });
      
      // If value key not provided, use first numeric column found
      if (!detectedValueKey) {
        detectedValueKey = keys.find(key => keyTypes[key].isNumeric);
      }
      
      // If we have two string columns, use one for x-axis and one for categories
      const stringKeys = keys.filter(key => keyTypes[key].isString);
      
      if (stringKeys.length >= 2) {
        if (!detectedXAxisKey) {
          detectedXAxisKey = stringKeys[0];
        }
        
        if (!detectedCategoryKey) {
          // Use a different string key for categories
          detectedCategoryKey = stringKeys.find(key => key !== detectedXAxisKey);
        }
      } else if (stringKeys.length === 1) {
        // If only one string column, use it for x-axis
        if (!detectedXAxisKey) {
          detectedXAxisKey = stringKeys[0];
        }
        
        // For category, we might use the same as x-axis as fallback
        if (!detectedCategoryKey) {
          detectedCategoryKey = detectedXAxisKey;
        }
      }
    }
    
    // Ensure we have valid keys
    if (!detectedXAxisKey || !detectedValueKey || !detectedCategoryKey) {
      console.error('Could not detect appropriate keys for chart rendering');
      return { data: [], categoryKey: null, xAxisKey: null, categories: [] };
    }
    
    // Group by X-Axis value
    const groupedByX = data.reduce((acc, item) => {
      const xValue = item[detectedXAxisKey] || 'Unknown';
      if (!acc[xValue]) {
        acc[xValue] = {};
        acc[xValue][detectedXAxisKey] = xValue;
      }
      
      const categoryValue = item[detectedCategoryKey] || 'Unknown';
      // Add or accumulate the value for this category
      const numericValue = parseFloat(item[detectedValueKey]) || 0;
      
      if (acc[xValue][categoryValue]) {
        acc[xValue][categoryValue] += numericValue;
      } else {
        acc[xValue][categoryValue] = numericValue;
      }
      
      // Keep track of all categories for later use
      acc.categories = acc.categories || new Set();
      acc.categories.add(categoryValue);
      
      return acc;
    }, {});

    // Convert the grouped object to an array
    const result = Object.values(groupedByX).filter(item => item[detectedXAxisKey] !== undefined);
    
    // Extract the unique categories
    const categories = groupedByX.categories 
      ? Array.from(groupedByX.categories) 
      : [];
      
    return { 
      data: result, 
      categories, 
      xAxisKey: detectedXAxisKey, 
      categoryKey: detectedCategoryKey,
      valueKey: detectedValueKey
    };
  }, [data, xAxisKey, valueKey, categoryKey]);

  // Generate random colors for each category
  const generateColors = (count) => {
    // Use provided colors if available
    if (colors && colors.length > 0) {
      return Array(count).fill().map((_, i) => colors[i % colors.length]);
    }
    
    // Default color palette
    const defaultColors = [
      '#8884d8', '#83a6ed', '#8dd1e1', '#82ca9d', '#a4de6c',
      '#d0ed57', '#ffc658', '#ff8042', '#ff5252', '#ff7b25',
      '#2196f3', '#4caf50', '#9c27b0', '#ff9800', '#e91e63'
    ];
    
    return Array(count).fill().map((_, i) => defaultColors[i % defaultColors.length]);
  };

  // If no data available, show a message
  if (!processedData.data || processedData.data.length === 0) {
    return (
      <div className={`flex items-center justify-center h-64 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
        No data available for visualization
      </div>
    );
  }

  const chartColors = generateColors(processedData.categories.length);
  
  return (
    <div className="flex flex-col h-full">
      <div className="text-center mb-2">
        <span className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
          Stacked by: {processedData.categoryKey} | X-Axis: {processedData.xAxisKey} | Value: {processedData.valueKey}
        </span>
      </div>
      <ResponsiveContainer width="100%" height={400}>
        <BarChart
          data={processedData.data}
          margin={{ top: 20, right: 30, left: 30, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke={darkMode ? '#444444' : '#e0e0e0'} />
          <XAxis 
            dataKey={processedData.xAxisKey} 
            stroke={darkMode ? '#a0a0a0' : '#666666'} 
            tick={{ fill: darkMode ? '#a0a0a0' : '#666666' }}
          />
          <YAxis 
            stroke={darkMode ? '#a0a0a0' : '#666666'} 
            tick={{ fill: darkMode ? '#a0a0a0' : '#666666' }}
            tickFormatter={(value) => new Intl.NumberFormat('en', { 
              notation: 'compact',
              maximumFractionDigits: 1
            }).format(value)}
          />
          <Tooltip 
            formatter={(value) => [new Intl.NumberFormat('en').format(value), processedData.valueKey]}
            labelFormatter={(label) => `${processedData.xAxisKey}: ${label}`}
            contentStyle={{
              backgroundColor: darkMode ? '#1f2937' : '#fff',
              borderColor: darkMode ? '#374151' : '#ccc',
              color: darkMode ? '#e5e7eb' : '#333'
            }}
          />
          <Legend wrapperStyle={{ color: darkMode ? '#e5e7eb' : '#333' }} />
          {processedData.categories.map((category, index) => (
            <Bar 
              key={category}
              dataKey={category} 
              stackId="a" 
              name={category}
              fill={chartColors[index]} 
            />
          ))}
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default DynamicStackedBarChartComponent;