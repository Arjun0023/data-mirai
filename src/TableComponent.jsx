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
      className={`w-full overflow-auto ${darkMode ? 'text-white' : 'text-gray-800'}`}
      style={{ maxHeight: maxHeight || '100%' }}
    >
      <table className={`w-full table-fixed border-collapse border ${darkMode ? 'border-gray-600' : 'border-gray-200'}`}>
        <thead className="sticky top-0 z-10">
          <tr className={darkMode ? 'bg-gray-800' : 'bg-gray-100'}>
            {columns.map((column, index) => (
              <th
                key={index}
                className="px-2 py-2 text-left font-medium uppercase tracking-wider border border-gray-300 truncate"
                style={{ 
                  width: columnWidths[index] ? `${columnWidths[index]}px` : 'auto',
                  fontSize: `${fontSize - 1}px`
                }}
                title={column.toUpperCase()}
              >
                {column.toUpperCase()}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((row, rowIndex) => (
            <tr key={rowIndex} className={rowIndex % 2 === 0 ? (darkMode ? 'bg-gray-700' : 'bg-gray-50') : ''}>
              {columns.map((column, colIndex) => {
                const cellValue = formatCellValue(row[column]);
                return (
                  <td 
                    key={colIndex} 
                    className="px-2 py-2 border border-gray-300 truncate"
                    style={{ 
                      width: columnWidths[colIndex] ? `${columnWidths[colIndex]}px` : 'auto',
                      fontSize: `${fontSize}px`
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
  );
}

export default TableComponent;