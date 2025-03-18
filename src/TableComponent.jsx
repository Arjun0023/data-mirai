import React from 'react';

function TableComponent({ data, darkMode }) {
  if (!Array.isArray(data) || data.length === 0) {
    return <p className="text-center py-4">No data available</p>;
  }

  // Extract column names dynamically
  const columns = Object.keys(data[0]);

  return (
    <div className={`overflow-auto ${darkMode ? 'text-white' : 'text-gray-800'}`} style={{ maxHeight: '100%' }}>
      <table className={`min-w-full border-collapse border ${darkMode ? 'border-gray-600' : 'border-gray-200'}`}>
        <thead>
          <tr className={darkMode ? 'bg-gray-800' : 'bg-gray-100'}>
            {columns.map((column) => (
              <th
                key={column}
                className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider border border-gray-300"
              >
                {column.toUpperCase()}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((row, index) => (
            <tr key={index} className={index % 2 === 0 ? (darkMode ? 'bg-gray-700' : 'bg-gray-50') : ''}>
              {columns.map((column) => (
                <td key={column} className="px-4 py-3 text-sm border border-gray-300">
                  {String(row[column])}
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