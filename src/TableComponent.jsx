import React from 'react';

function TableComponent({ data, darkMode }) {
    console.log(data);
  if (!Array.isArray(data) || data.length === 0) {
    return <p className="text-center py-4">No data available</p>;
  }

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

  // Extract column names dynamically
  const columns = Object.keys(data[0]);

  return (
    <div className={`overflow-auto ${darkMode ? 'text-white' : 'text-gray-800'}`} style={{ maxHeight: '100%' }}>
      <table className={`min-w-full border-collapse border ${darkMode ? 'border-gray-600' : 'border-gray-200'}`}>
        <thead>
          <tr className={darkMode ? 'bg-gray-800' : 'bg-gray-100'}>
            {columns.map((column, index) => (
              <th
                key={index}
                className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider border border-gray-300"
              >
                {column.toUpperCase()}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((row, rowIndex) => (
            <tr key={rowIndex} className={rowIndex % 2 === 0 ? (darkMode ? 'bg-gray-700' : 'bg-gray-50') : ''}>
              {columns.map((column, colIndex) => (
                <td key={colIndex} className="px-4 py-3 text-sm border border-gray-300">
                  {formatCellValue(row[column])}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default TableComponent;