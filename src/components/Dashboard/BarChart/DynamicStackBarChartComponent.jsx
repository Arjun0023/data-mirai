import React, { useMemo } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ReferenceLine
} from 'recharts';

const DynamicStackedBarChartComponent = ({
  data,
  darkMode,
  xAxisKey = null, // Optional: key to use for x-axis
  valueKey = null, // Optional: key containing numeric values
  categoryKey = null, // Optional: key for stacking/grouping
  colors = [], // Optional: custom colors array - but now, will be overridden by the data itself.
  mode = 'auto', // Optional: 'stacked', 'grouped', or 'difference'
  showSummaryStats = true,
  colorKey = 'color' // Add a property to define the color key in the data. Defaults to 'color'.
}) => {
  // Process the data to transform it for the chart format
  const processedData = useMemo(() => {
    if (!Array.isArray(data) || data.length === 0) {
      return { data: [], categoryKey: null, xAxisKey: null, categories: [], metrics: [], chartMode: 'stacked' };
    }

    // Detect if we have price comparison data
    const sampleItem = data[0];
    const keys = Object.keys(sampleItem);
    const hasAvgPrice = keys.includes('Average Price');
    const hasMSRP = keys.includes('MSRP');
    const hasDifference = keys.includes('Difference');
    const isPriceComparisonData = hasAvgPrice && hasMSRP;

    // Determine chart mode
    let chartMode = mode;
    if (chartMode === 'auto') {
      chartMode = isPriceComparisonData ? 'grouped' : 'stacked';
    }

    // For price comparison data, handle it differently
    if (isPriceComparisonData && (chartMode === 'grouped' || chartMode === 'difference')) {
      // Add index as ID for x-axis if needed
      const processedItems = data.map((item, index) => ({
        id: index + 1,
        ...item
      }));

      // Get all numeric metrics (excluding id)
      const metrics = Object.keys(sampleItem).filter(key =>
        key !== 'id' &&
        typeof sampleItem[key] === 'number'
      );

      return {
        data: processedItems,
        metrics,
        chartMode,
        isPriceComparisonData
      };
    }

    // Original stacked chart data processing
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
      return {
        data: [],
        categoryKey: null,
        xAxisKey: null,
        categories: [],
        chartMode: 'stacked',
        isPriceComparisonData: false
      };
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

      // Store the color
      acc[xValue][`${categoryValue}_color`] = item[colorKey]; // Store the color against the category.  Important for the render logic below.

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
      valueKey: detectedValueKey,
      chartMode: 'stacked',
      isPriceComparisonData: false
    };
  }, [data, xAxisKey, valueKey, categoryKey, mode, colorKey]); // Include `colorKey` in the dependency array


  // Format value for tooltip
  const formatValue = (value, name) => {
    // For price data, format as currency
    if (processedData.isPriceComparisonData) {
      return typeof value === 'number'
        ? [`$${value.toFixed(2)}`, name]
        : [value, name];
    }

    // For regular data
    return typeof value === 'number'
      ? [new Intl.NumberFormat('en').format(value), name]
      : [value, name];
  };

  // If no data available, show a message
  if (!processedData.data || processedData.data.length === 0) {
    return (
      <div className={`flex items-center justify-center h-64 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
        No data available for visualization
      </div>
    );
  }

  // For price comparison data
  if (processedData.isPriceComparisonData) {
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

      // For price comparison data, use specific colors
      if (processedData.isPriceComparisonData) {
        return [
          '#82ca9d', // Green for Average Price
          '#8884d8', // Purple for MSRP
          '#ff8042', // Orange for other metrics
          ...defaultColors.slice(3)
        ];
      }

      return Array(count).fill().map((_, i) => defaultColors[i % defaultColors.length]);
    };
    const chartColors = generateColors(processedData.metrics.length);

    // Determine which metrics to show in price comparison chart
    const priceMetrics = processedData.metrics.filter(metric =>
      metric !== 'Difference' &&
      metric !== 'id'
    );

    // Calculate summary statistics if needed
    let summaryStats = null;
    if (showSummaryStats) {
      const averageDifference = processedData.data.reduce(
        (sum, item) => sum + (item['Difference'] || 0), 0
      ) / processedData.data.length;

      const maxDiscount = Math.min(
        ...processedData.data.map(item => item['Difference'] || 0)
      );

      const aboveMSRPCount = processedData.data.filter(
        item => (item['Difference'] || 0) > 0
      ).length;

      summaryStats = { averageDifference, maxDiscount, aboveMSRPCount };
    }

    // For difference chart mode
    if (processedData.chartMode === 'difference') {
      return (
        <div className="flex flex-col h-full">
          <div className="text-center mb-2">
            <span className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              Price Difference Chart (Average Price - MSRP)
            </span>
          </div>
          <ResponsiveContainer width="100%" height={350}>
            <BarChart
              data={processedData.data}
              margin={{ top: 20, right: 30, left: 30, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke={darkMode ? '#444444' : '#e0e0e0'} />
              <XAxis
                dataKey="id"
                stroke={darkMode ? '#a0a0a0' : '#666666'}
                tick={{ fill: darkMode ? '#a0a0a0' : '#666666' }}
                label={{ value: 'Item ID', position: 'insideBottom', offset: -5, fill: darkMode ? '#a0a0a0' : '#666666' }}
              />
              <YAxis
                stroke={darkMode ? '#a0a0a0' : '#666666'}
                tick={{ fill: darkMode ? '#a0a0a0' : '#666666' }}
                label={{ value: 'Difference ($)', angle: -90, position: 'insideLeft', fill: darkMode ? '#a0a0a0' : '#666666' }}
                tickFormatter={(value) => new Intl.NumberFormat('en', {
                  maximumFractionDigits: 2
                }).format(value)}
              />
              <ReferenceLine y={0} stroke={darkMode ? '#777' : '#000'} />
              <Tooltip
                formatter={(value, name) => formatValue(value, name)}
                contentStyle={{
                  backgroundColor: darkMode ? '#1f2937' : '#fff',
                  borderColor: darkMode ? '#374151' : '#ccc',
                  color: darkMode ? '#e5e7eb' : '#333'
                }}
              />
              <Bar
                dataKey="Difference"
                fill={(entry) => (
                  (entry.Difference >= 0)
                    ? (darkMode ? '#4ade80' : '#82ca9d')  // Green for positive
                    : (darkMode ? '#f87171' : '#ff7675')  // Red for negative
                )}
                name="Price Difference"
              />
            </BarChart>
          </ResponsiveContainer>

          {/* Summary Statistics */}
          {showSummaryStats && summaryStats && (
            <div className="grid grid-cols-3 gap-4 mt-4">
              <div className={`p-4 rounded-lg ${darkMode ? 'bg-gray-800' : 'bg-gray-50'}`}>
                <h4 className={`text-sm font-semibold mb-1 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                  Average Difference
                </h4>
                <p className={`text-2xl font-bold ${summaryStats.averageDifference >= 0
                  ? (darkMode ? 'text-green-400' : 'text-green-600')
                  : (darkMode ? 'text-blue-400' : 'text-blue-600')}`}>
                  ${summaryStats.averageDifference.toFixed(2)}
                </p>
              </div>
              <div className={`p-4 rounded-lg ${darkMode ? 'bg-gray-800' : 'bg-gray-50'}`}>
                <h4 className={`text-sm font-semibold mb-1 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                  Max Discount
                </h4>
                <p className={`text-2xl font-bold ${darkMode ? 'text-green-400' : 'text-green-600'}`}>
                  ${summaryStats.maxDiscount.toFixed(2)}
                </p>
              </div>
              <div className={`p-4 rounded-lg ${darkMode ? 'bg-gray-800' : 'bg-gray-50'}`}>
                <h4 className={`text-sm font-semibold mb-1 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                  Above MSRP Items
                </h4>
                <p className={`text-2xl font-bold ${darkMode ? 'text-red-400' : 'text-red-600'}`}>
                  {summaryStats.aboveMSRPCount}
                </p>
              </div>
            </div>
          )}
        </div>
      );
    }

    // For grouped chart mode
    return (
      <div className="flex flex-col h-full">
        <div className="text-center mb-2">
          <span className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            Price Comparison Chart (MSRP vs Average Price)
          </span>
        </div>
        <ResponsiveContainer width="100%" height={350}>
          <BarChart
            data={processedData.data}
            margin={{ top: 20, right: 30, left: 30, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke={darkMode ? '#444444' : '#e0e0e0'} />
            <XAxis
              dataKey="id"
              stroke={darkMode ? '#a0a0a0' : '#666666'}
              tick={{ fill: darkMode ? '#a0a0a0' : '#666666' }}
            />
            <YAxis
              stroke={darkMode ? '#a0a0a0' : '#666666'}
              tick={{ fill: darkMode ? '#a0a0a0' : '#666666' }}
              tickFormatter={(value) => new Intl.NumberFormat('en', {
                maximumFractionDigits: 2
              }).format(value)}
            />
            <Tooltip
              formatter={(value, name) => formatValue(value, name)}
              contentStyle={{
                backgroundColor: darkMode ? '#1f2937' : '#fff',
                borderColor: darkMode ? '#374151' : '#ccc',
                color: darkMode ? '#e5e7eb' : '#333'
              }}
            />
            <Legend wrapperStyle={{ color: darkMode ? '#e5e7eb' : '#333' }} />
            {priceMetrics.map((metric, index) => (
              <Bar
                key={metric}
                dataKey={metric}
                name={metric}
                fill={chartColors[index]}
              />
            ))}
          </BarChart>
        </ResponsiveContainer>
      </div>
    );
  }

  // Regular stacked bar chart (original functionality)
  //Generate Colors is skipped here, the color is taken directly from the data in the render

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
            formatter={(value, name) => [new Intl.NumberFormat('en').format(value), name]}
            labelFormatter={(label) => `${processedData.xAxisKey}: ${label}`}
            contentStyle={{
              backgroundColor: darkMode ? '#1f2937' : '#fff',
              borderColor: darkMode ? '#374151' : '#ccc',
              color: darkMode ? '#e5e7eb' : '#333'
            }}
          />
          {/* <Legend wrapperStyle={{ color: darkMode ? '#e5e7eb' : '#333' }} /> */}
          {processedData.categories?.map((category, index) => (
            <Bar
              key={category}
              dataKey={category}
              stackId="a"
              name={category}
              fill={processedData.data.find(item => item[`${category}_color`])?.[`${category}_color`] || "#8884d8"} // Directly retrieve color from the processed data
            />
          ))}
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default DynamicStackedBarChartComponent;