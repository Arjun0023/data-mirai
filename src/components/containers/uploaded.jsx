import React from 'react';
import { BarChart, DownloadCloud, FileText, Info, Layers, Terminal } from 'lucide-react';

const FileInfoDisplay = ({ uploadedFileData, darkMode, onQuestionClick }) => {
  if (!uploadedFileData) return null;

  const getStatusColor = (status) => {
    if (status === "Shipped") return "text-green-500";
    if (status === "Disputed") return "text-red-500";
    if (status === "In Process") return "text-yellow-500";
    if (status === "On Hold") return "text-gray-500";
    if (status === "Cancelled") return "text-gray-500";
    return "text-gray-500";
  };

  const formatDate = (dateString) => {
    try {
      return new Date(dateString).toLocaleDateString();
    } catch (e) {
      return dateString;
    }
  };

  return (
    <div className={`flex flex-col h-full ${darkMode ? 'bg-neutral-900 text-gray-100' : 'bg-white text-gray-800'}`}>
      {/* Header */}
      <div className={`px-6 py-4 border-b ${darkMode ? 'border-neutral-700 bg-neutral-950' : 'border-gray-200 bg-gray-50'} flex items-center justify-between flex-shrink-0`}>
        <div className="flex items-center space-x-3">
          <div className={`p-2 rounded-lg ${darkMode ? 'bg-neutral-700' : 'bg-gray-100'}`}>
            <FileText className={`h-5 w-5 ${darkMode ? 'text-gray-200' : 'text-gray-600'}`} />
          </div>
          <div>
            <h2 className="text-lg font-semibold">{uploadedFileData.filename}</h2>
            <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
              {uploadedFileData.num_rows_total.toLocaleString()} rows • {formatDate(new Date().toISOString())}
            </p>
          </div>
        </div>
        <div className="flex space-x-2">
          <button
            className={`p-2 rounded-lg ${darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'} transition-colors`}
            title="Download data"
          >
            <DownloadCloud className={`h-4 w-4 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`} />
          </button>
        </div>
      </div>

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 p-6">
          {/* Left Column - File Details */}
          <div className="space-y-6">
            <div className={`p-4 rounded-xl ${darkMode ? 'bg-neutral-800 border border-neutral-700' : 'bg-gray-50'}`}>
              <div className="flex items-center space-x-2 mb-3">
                <Info className={`h-4 w-4 ${darkMode ? 'text-gray-300' : 'text-gray-500'}`} />
                <h3 className={`font-medium ${darkMode ? 'text-white' : 'text-gray-700'}`}>File Details</h3>
              </div>
              <ul className="space-y-2 text-sm">
                <li className="flex justify-between">
                  <span className={darkMode ? 'text-gray-400' : 'text-gray-500'}>Total Rows</span>
                  <span className="font-medium">{uploadedFileData.num_rows_total.toLocaleString()}</span>
                </li>
                <li className="flex justify-between">
                  <span className={darkMode ? 'text-gray-400' : 'text-gray-500'}>Encoding</span>
                  <span className="font-medium">{uploadedFileData.encoding_used}</span>
                </li>
                <li className="flex justify-between">
                  <span className={darkMode ? 'text-gray-400' : 'text-gray-500'}>Columns</span>
                  <span className="font-medium">{uploadedFileData.columns.length}</span>
                </li>
                <li className="flex justify-between">
                  <span className={darkMode ? 'text-gray-400' : 'text-gray-500'}>Status</span>
                  <span className={`font-medium ${darkMode ? 'text-green-400' : 'text-green-500'}`}>
                    {uploadedFileData.message.includes("successfully") ? "Ready" : "Error"}
                  </span>
                </li>
              </ul>
            </div>

            <div className={`p-4 rounded-xl ${darkMode ? 'bg-neutral-800 border border-neutral-700' : 'bg-gray-50'}`}>
              <div className="flex items-center space-x-2 mb-3">
                <Terminal className={`h-4 w-4 ${darkMode ? 'text-gray-300' : 'text-gray-500'}`} />
                <h3 className={`font-medium ${darkMode ? 'text-white' : 'text-gray-700'}`}>Suggested Questions</h3>
              </div>
              <div className="space-y-2">
                {uploadedFileData.insights?.question.map((question, idx) => (
                  <div
                    key={idx}
                    className={`text-sm p-2 rounded-lg cursor-pointer ${darkMode ? 'bg-neutral-700 hover:bg-neutral-600 text-gray-100' : 'bg-white hover:bg-gray-100'} border ${darkMode ? 'border-neutral-600' : 'border-gray-200'} transition-colors`}
                    onClick={() => onQuestionClick && onQuestionClick(question)}
                  >
                    {question}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Middle and Right Columns - Table Preview */}
          <div className="md:col-span-2 space-y-6">
            <div className={`p-4 rounded-xl ${darkMode ? 'bg-neutral-800 border border-neutral-700' : 'bg-gray-50'}`}>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-2">
                  <Layers className={`h-4 w-4 ${darkMode ? 'text-gray-300' : 'text-gray-500'}`} />
                  <h3 className={`font-medium ${darkMode ? 'text-white' : 'text-gray-700'}`}>Columns</h3>
                </div>
                <span className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                  {uploadedFileData.columns.length} total
                </span>
              </div>
              <div className="flex flex-wrap gap-2">
                {uploadedFileData.columns.map((column, index) => (
                  <div
                    key={index}
                    className={`text-xs py-1 px-2 rounded-full ${darkMode
                      ? 'bg-neutral-700 text-gray-100 border border-neutral-600'
                      : 'bg-gray-100 text-gray-700 border border-gray-200'
                      }`}
                  >
                    {column}
                  </div>
                ))}
              </div>
            </div>

            {uploadedFileData.first_10_rows && (
              <div className={`rounded-xl overflow-hidden border ${darkMode ? 'border-neutral-700' : 'border-gray-200'}`}>
                <div className={`flex items-center justify-between p-3 ${darkMode ? 'bg-neutral-800' : 'bg-gray-50'} border-b ${darkMode ? 'border-neutral-700' : 'border-gray-200'}`}>
                  <div className="flex items-center space-x-2">
                    <BarChart className={`h-4 w-4 ${darkMode ? 'text-gray-300' : 'text-gray-500'}`} />
                    <h3 className={`font-medium ${darkMode ? 'text-white' : 'text-gray-700'}`}>Data Preview</h3>
                  </div>
                  <span className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                    First 10 of {uploadedFileData.num_rows_total.toLocaleString()} rows
                  </span>
                </div>
                <div className={`overflow-auto ${darkMode ? 'bg-neutral-900' : 'bg-white'}`} style={{ maxHeight: '400px' }}>
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className={`sticky top-0 ${darkMode ? 'bg-neutral-800' : 'bg-gray-50'}`}>
                      <tr>
                        {uploadedFileData.columns.slice(0, 6).map((column, index) => (
                          <th
                            key={index}
                            scope="col"
                            className={`px-3 py-2 text-left text-xs font-medium ${darkMode ? 'text-gray-400' : 'text-gray-500'
                              } uppercase tracking-wider`}
                          >
                            {column}
                          </th>
                        ))}
                        {uploadedFileData.columns.length > 6 && (
                          <th
                            scope="col"
                            className={`px-3 py-2 text-left text-xs font-medium ${darkMode ? 'text-gray-400' : 'text-gray-500'
                              } uppercase tracking-wider`}
                          >
                            ...
                          </th>
                        )}
                      </tr>
                    </thead>
                    <tbody className={`divide-y ${darkMode ? 'divide-gray-700' : 'divide-gray-200'}`}>
                      {uploadedFileData.first_10_rows.map((row, rowIndex) => (
                        <tr
                          key={rowIndex}
                          className={`${rowIndex % 2 === 0
                            ? (darkMode ? 'bg-neutral-900' : 'bg-white')
                            : (darkMode ? 'bg-neutral-800/50' : 'bg-gray-50')
                            } hover:${darkMode ? 'bg-neutral-700' : 'bg-gray-100'} transition-colors`}
                        >
                          {uploadedFileData.columns.slice(0, 6).map((column, colIndex) => {
                            let cellContent = row[column] !== null ? String(row[column]) : '-';
                            let cellClass = "px-3 py-2 text-xs ";

                            // Style by column type
                            if (column === "STATUS") {
                              cellClass += getStatusColor(cellContent);
                            } else if (column === "SALES" || column === "PRICEEACH") {
                              cellClass += "font-mono ";
                            } else if (column === "ORDERDATE") {
                              cellContent = formatDate(cellContent);
                            }

                            cellClass += darkMode ? 'text-gray-300' : 'text-gray-700';

                            return (
                              <td key={colIndex} className={cellClass}>
                                {cellContent}
                              </td>
                            );
                          })}
                          {uploadedFileData.columns.length > 6 && (
                            <td className={`px-3 py-2 text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                              ...
                            </td>
                          )}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default FileInfoDisplay;