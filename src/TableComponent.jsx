import React, { useEffect, useRef, useState } from 'react';

function TableComponent({ data, darkMode, maxHeight }) {
  const tableRef = useRef(null);
  const [columnWidths, setColumnWidths] = useState([]);
  const [fontSize, setFontSize] = useState(14);
  
  // Format cell value for display
  const formatCellValue = (value) => {
    if (value === null || value === undefined) {
      return '';
    } else if (typeof value === 'object') {
      // If it's an object, convert to a readable string format
      try {
        return JSON.stringify(value);
      } catch (e) {
        return '[Complex Object]';
      }
    } else {
      return String(value);
    }
  };
  
  useEffect(() => {
    if (!Array.isArray(data) || data.length === 0 || !tableRef.current) return;
    
    // Calculate the available width
    const tableContainer = tableRef.current;
    const availableWidth = tableContainer.clientWidth;
    
    // Extract column names
    const columns = Object.keys(data[0]);
    const numColumns = columns.length;
    
    // Estimate content length for each column to determine relative widths
    const contentLengths = columns.map(column => {
      // Check column name length
      let maxLength = column.length;
      
      // Sample the data (check first 100 rows to avoid performance issues)
      const sampleSize = Math.min(data.length, 100);
      for (let i = 0; i < sampleSize; i++) {
        const cellValue = formatCellValue(data[i][column]);
        maxLength = Math.max(maxLength, cellValue.length);
      }
      
      return maxLength;
    });
    
    // Calculate total content length
    const totalContentLength = contentLengths.reduce((sum, length) => sum + length, 0);
    
    // Calculate proportional widths
    const widths = contentLengths.map(length => 
      Math.max(
        50, // Minimum column width in px
        Math.floor((length / totalContentLength) * availableWidth)
      )
    );
    
    setColumnWidths(widths);
    
    // Adjust font size based on data density
    const avgColumnWidth = availableWidth / numColumns;
    if (avgColumnWidth < 80) {
      setFontSize(11);
    } else if (avgColumnWidth < 120) {
      setFontSize(12);
    } else {
      setFontSize(14);
    }
    
  }, [data, tableRef.current?.clientWidth]);
  
  if (!Array.isArray(data) || data.length === 0) {
    return <p className="text-center py-4">No data available</p>;
  }
  
  // Extract column names dynamically
  const columns = Object.keys(data[0]);
  
  return (
    <div 
      ref={tableRef} 
      className={`w-full ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}
      style={{ maxHeight: maxHeight || '100%' }}
    >
      <div className={`rounded-lg overflow-hidden border ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 table-fixed">
            <thead className={`sticky top-0 z-10 ${darkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
              <tr>
                {columns.map((column, index) => (
                  <th
                    key={index}
                    scope="col"
                    className={`px-3 py-2 text-left text-xs font-medium ${
                      darkMode ? 'text-gray-400' : 'text-gray-500'
                    } uppercase tracking-wider`}
                    style={{ 
                      width: columnWidths[index] ? `${columnWidths[index]}px` : 'auto'
                    }}
                    title={column.toUpperCase()}
                  >
                    {column.toUpperCase()}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className={`divide-y ${darkMode ? 'divide-gray-700' : 'divide-gray-200'}`}>
              {data.map((row, rowIndex) => (
                <tr 
                  key={rowIndex} 
                  className={`${
                    rowIndex % 2 === 0 
                      ? (darkMode ? 'bg-gray-800' : 'bg-white') 
                      : (darkMode ? 'bg-gray-750' : 'bg-gray-50')
                  } hover:${darkMode ? 'bg-gray-700' : 'bg-gray-100'} transition-colors`}
                >
                  {columns.map((column, colIndex) => {
                    const cellValue = formatCellValue(row[column]);
                    return (
                      <td 
                        key={colIndex} 
                        className={`px-3 py-2 text-xs truncate ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}
                        style={{ 
                          width: columnWidths[colIndex] ? `${columnWidths[colIndex]}px` : 'auto'
                        }}
                        title={cellValue} // Show full content on hover
                      >
                        {cellValue}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className={`p-2 text-center text-xs ${darkMode ? 'bg-gray-900 text-gray-400' : 'bg-gray-50 text-gray-500'}`}>
          You can ask questions about this data using natural language
        </div>
      </div>
    </div>
  );
}

export default TableComponent;