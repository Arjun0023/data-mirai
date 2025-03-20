// Home.js
import React, { useState, useEffect ,useCallback} from 'react'
import { Paperclip, Sun, Moon, Send, Upload, BarChart, PieChart, Table, BookmarkPlus, Layout } from 'lucide-react'
import ReactMarkdown from "react-markdown";
import { useNavigate } from 'react-router-dom'; // Import for navigation
import BarChartComponent from './BarChartComponent';
import PieChartComponent from './PieChartComponent';
import TableComponent from './TableComponent';
import DynamicStackedBarChartComponent from './DynamicStackBarChartComponent';
import InputArea from './InputArea'; // Import the new InputArea component

function Home() {
  const navigate = useNavigate(); // Initialize navigation
  const [darkMode, setDarkMode] = useState(false)
  const [message, setMessage] = useState('')
  const [selectedFile, setSelectedFile] = useState(null)
  const [messages, setMessages] = useState([])
  const [isDragging, setIsDragging] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const [uploadedFileData, setUploadedFileData] = useState(null)
  const [inputDisabled, setInputDisabled] = useState(true)
  const [displayMode, setDisplayMode] = useState('table') // 'barchart', 'piechart', or 'table'
  const [allResults, setAllResults] = useState([])
  const [savedCharts, setSavedCharts] = useState([]) // New state for saved charts
  const [languageOptions, setLanguageOptions] = useState([]); // new state

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d', '#ffc658', '#8dd1e1', '#a4de6c', '#d0ed57']

  // Load saved charts from localStorage on component mount
  useEffect(() => {
    const savedChartsData = localStorage.getItem('savedCharts');
    if (savedChartsData) {
      setSavedCharts(JSON.parse(savedChartsData));
    }
  }, []);

  // Save charts to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('savedCharts', JSON.stringify(savedCharts));
  }, [savedCharts]);

  const toggleDarkMode = () => {
    setDarkMode(!darkMode)
  }

  const handleFileChange = async (e) => {
    if (e.target.files[0]) {
      const file = e.target.files[0]
      setSelectedFile(file)
      await uploadFile(file)
    }
  }
  const handleLanguageOptions = useCallback((options) => {
    setLanguageOptions(options);
  }, []);
  const uploadFile = async (file) => {
    setIsUploading(true);

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('session_id', 'session123'); // Add session_id

      const response = await fetch('http://127.0.0.1:8000/upload', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Upload failed');
      }

      const data = await response.json();
      setUploadedFileData(data);
      setInputDisabled(false);

      // Add a system message showing the upload was successful
      const systemMessage = {
        id: Date.now(),
        text: `File uploaded successfully: ${file.name}`,
        sender: 'system',
      };
      setMessages([systemMessage]);

    } catch (error) {
      console.error('Error uploading file:', error);
      const errorMessage = {
        id: Date.now(),
        text: `Error uploading file: ${error.message}`,
        sender: 'system',
      };
      setMessages([errorMessage]);

    } finally {
      setIsUploading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (message.trim()) {
      const newMessage = {
        id: Date.now(),
        text: message,
        sender: 'user',
      }

      setMessages([...messages, newMessage])
      setIsProcessing(true)

      try {
        // Create FormData object for the API call
        const formData = new FormData();
        formData.append('question', message);
        formData.append('session_id', 'session123');
        formData.append('language', languageOptions);

        // Make the API call with FormData
        const response = await fetch('http://127.0.0.1:8000/ask', {
          method: 'POST',
          body: formData,
        });

        if (!response.ok) {
          throw new Error(`Query failed: ${response.status} ${response.statusText}`);
        }

        const data = await response.json();
        console.log('Query data:', data);
        const formattedResult = {
          original: data,
          formatted: Object.entries(data.result).map(([name, value]) => ({
            name,
            value
          }))
        };

        // Add AI response
        const aiResponse = {
          id: Date.now() + 1,
          text: `I've analyzed your data for "${message}"`,
          sender: 'ai',
        }
        setMessages(prevMessages => [...prevMessages, aiResponse])

        // Make the additional API call to /summarize
        const summaryText = await fetchSummary(message, data.result);

        // Create a new result object with all relevant data
        const newResult = {
          id: Date.now(),
          question: message,
          resultData: formattedResult,
          summary: summaryText,
          timestamp: new Date().toISOString(),
          displayMode: displayMode // Store current display mode
        };

        // Add the new result to our results array
        setAllResults(prevResults => [...prevResults, newResult]);

      } catch (error) {
        console.error('Error processing query:', error);
        const errorMessage = {
          id: Date.now() + 1,
          text: `Error processing your query: ${error.message}`,
          sender: 'system',
        };
        setMessages(prevMessages => [...prevMessages, errorMessage]);
      } finally {
        setIsProcessing(false)
        setMessage('')
      }
    }
  }

  // New function to fetch summary
  const fetchSummary = async (question, resultData) => {
    try {
      console.log(languageOptions,"a")
      const response = await fetch('http://127.0.0.1:8000/summarize', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          question: question,
          data: [resultData],
          language:languageOptions
        }),
      });
      
      if (!response.ok) {
        throw new Error(`Summary failed: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      console.log('Summary data:', data);
      return data.summary;

    } catch (error) {
      console.error('Error fetching summary:', error);
      return "Error generating summary.";
    }
  };

  // New function to save chart to dashboard
  const saveChartToDashboard = (result) => {
    // Create a saved chart object with the structure expected by Dashboard
    const savedChart = {
      id: `saved-${Date.now()}`,
      title: result.question,
      description: result.summary,
      data: result.resultData,
      displayMode: result.displayMode || displayMode,
      generatedAt: new Date().toISOString()
    };

    // Add to saved charts state
    setSavedCharts(prev => [...prev, savedChart]);

    // Show a message
    const saveMessage = {
      id: Date.now(),
      text: `Chart "${result.question}" saved to dashboard`,
      sender: 'system',
    };
    setMessages(prev => [...prev, saveMessage]);
  };
  useEffect(() => {
    localStorage.setItem('savedCharts', JSON.stringify(savedCharts));
  }, [savedCharts]);
  // Check if a chart is already saved
  const isChartSaved = (resultId) => {
    return savedCharts.some(chart => chart.originalId === resultId);
  };

  const handleDragOver = (e) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = () => {
    setIsDragging(false)
  }

  const handleDrop = async (e) => {
    e.preventDefault()
    setIsDragging(false)

    if (e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0]
      setSelectedFile(file)
      await uploadFile(file)
    }
  }

  // Navigate to dashboard
  const goToDashboard = () => {
    navigate('/dashboard');
  };

  // Render file data information
  const renderFileInfo = () => {
    if (!uploadedFileData) return null

    return (
      <div className={`p-6 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-white shadow-md'}`}>
        <h3 className="text-xl font-medium mb-4">File Information: {uploadedFileData.filename}</h3>

        <div className="space-y-4">
          <div>
            <h4 className="font-medium mb-2">File Details:</h4>
            <ul className="list-disc pl-5 space-y-1">
              <li>Total rows: {uploadedFileData.num_rows_total}</li>
              <li>Encoding: {uploadedFileData.encoding_used}</li>
              <li>Status: {uploadedFileData.message}</li>
            </ul>
          </div>

          <div>
            <h4 className="font-medium mb-2">Columns:</h4>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
              {uploadedFileData.columns.map((column, index) => (
                <div key={index} className={`p-2 rounded ${darkMode ? 'bg-gray-800' : 'bg-gray-100'}`}>
                  {column}
                </div>
              ))}
            </div>
          </div>

          {uploadedFileData.first_10_rows && (
            <div>
              <h4 className="font-medium mb-2">Preview (First 10 rows):</h4>
              <div className="overflow-x-auto">
                <table className={`min-w-full divide-y ${darkMode ? 'divide-gray-600' : 'divide-gray-200'}`}>
                  <thead>
                    <tr>
                      {uploadedFileData.columns.map((column, index) => (
                        <th
                          key={index}
                          className={`px-3 py-2 text-left text-xs font-medium ${darkMode ? 'bg-gray-800 text-gray-300' : 'bg-gray-50 text-gray-500'} uppercase tracking-wider`}
                        >
                          {column}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className={`divide-y ${darkMode ? 'divide-gray-600' : 'divide-gray-200'}`}>
                    {uploadedFileData.first_10_rows.map((row, rowIndex) => (
                      <tr key={rowIndex} className={rowIndex % 2 === 0 ? (darkMode ? 'bg-gray-800' : 'bg-gray-50') : ''}>
                        {uploadedFileData.columns.map((column, colIndex) => (
                          <td key={colIndex} className="px-3 py-2 text-sm">
                            {row[column] !== null ? String(row[column]) : '-'}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>
    )
  }
console.log(languageOptions)
  // Render visualization of results
  const renderResultItem = (result) => {
    if (!result || !result.resultData) return null;

    // Function to flatten the data for the table
    const prepareDataForTable = () => {
      if (!Array.isArray(result.resultData.formatted)) {
        return [];
      }

      // Extract the data from the nested structure
      const flattenedData = result.resultData.formatted.map(item => {
        // If the item has a name-value structure with a nested object in value
        if (item.name !== undefined && item.value !== undefined && typeof item.value === 'object') {
          return item.value; // Return the nested object directly
        }
        return item; // Return as is if it doesn't match our expected structure
      });

      return flattenedData;
    };

    // Determine if this chart is already saved
    const isSaved = isChartSaved(result.id);

    return (
      <div key={result.id} className={`p-4 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-white shadow-md'} w-full mb-2`}>
        <div className="border-b pb-0 mb-2">
          <div className="flex justify-between items-start mb-1">
            <div>
              <h3 className="text-xl font-medium">"{result.question}"</h3>
              <p className={`text-sm ml-3 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                {new Date(result.timestamp).toLocaleString()}
              </p>
            </div>

            <div className="flex space-x-2">
              <button
                onClick={() => setDisplayMode('barchart')}
                className={`p-2 rounded ${displayMode === 'barchart'
                  ? darkMode ? 'bg-blue-600 text-white' : 'bg-blue-500 text-white'
                  : darkMode ? 'bg-gray-600 hover:bg-gray-500' : 'bg-gray-200 hover:bg-gray-300'}`}
                aria-label="Show as bar chart"
              >
                <BarChart size={20} />
              </button>
              <button
                onClick={() => setDisplayMode('piechart')}
                className={`p-2 rounded ${displayMode === 'piechart'
                  ? darkMode ? 'bg-blue-600 text-white' : 'bg-blue-500 text-white'
                  : darkMode ? 'bg-gray-600 hover:bg-gray-500' : 'bg-gray-200 hover:bg-gray-300'}`}
                aria-label="Show as pie chart"
              >
                <PieChart size={20} />
              </button>
              <button
                onClick={() => setDisplayMode('table')}
                className={`p-2 rounded ${displayMode === 'table'
                  ? darkMode ? 'bg-blue-600 text-white' : 'bg-blue-500 text-white'
                  : darkMode ? 'bg-gray-600 hover:bg-gray-500' : 'bg-gray-200 hover:bg-gray-300'}`}
                aria-label="Show as table"
              >
                <Table size={20} />
              </button>
              <button
                onClick={() => setDisplayMode('stackedbarchart')}
                className={`p-2 rounded ${displayMode === 'stackedbarchart'
                  ? darkMode ? 'bg-blue-600 text-white' : 'bg-blue-500 text-white'
                  : darkMode ? 'bg-gray-600 hover:bg-gray-500' : 'bg-gray-200 hover:bg-gray-300'}`}
                aria-label="Show as stacked bar chart"
              >
                <BarChart size={20} />
              </button>
              <button
                onClick={() => saveChartToDashboard(result)}
                disabled={isSaved}
                className={`p-2 rounded ${isSaved
                  ? darkMode ? 'bg-gray-600 text-gray-400 cursor-not-allowed' : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                  : darkMode ? 'bg-green-600 hover:bg-green-700 text-white' : 'bg-green-500 hover:bg-green-600 text-white'}`}
                aria-label="Save to dashboard"
              >
                <BookmarkPlus size={20} />
              </button>
            </div>
          </div>
        </div>

        <div className={`flex flex-col lg:flex-row gap-2 w-full max-w-8xl mx-auto`}>
          <div className={`h-110 ${result.summary ? 'lg:w-2/3' : 'w-full'}`}>
            {displayMode === 'barchart' && (
              <BarChartComponent data={result.resultData.formatted} />
            )}

            {displayMode === 'piechart' && (
              <PieChartComponent data={result.resultData.formatted} colors={COLORS} />
            )}

            {displayMode === 'table' && (
              <TableComponent
                data={prepareDataForTable()}
                darkMode={darkMode}
              />
            )}
            {displayMode === 'stackedbarchart' && (
              <DynamicStackedBarChartComponent
                // The component will work with any structured data, but we need to make sure
                // we're passing the right portion of your API response
                data={
                  // Try different paths to find the actual data array in your result
                  (result.resultData.original?.result && Array.isArray(result.resultData.original.result))
                    ? result.resultData.original.result
                    : Array.isArray(result.resultData.formatted)
                      ? result.resultData.formatted
                      : []
                }
                darkMode={darkMode}
              />
            )}
          </div>

          {result.summary && (
            <div className="lg:w-1/3">
              <div className={`p-4 rounded-lg ${darkMode ? 'bg-gray-800 text-gray-300' : 'bg-gray-100 text-gray-700'} overflow-y-auto max-h-110`}>
                <h4 className="font-medium mb-0 top-1 bg-inherit pt-0 pb-2 border-b border-gray-600">Summary</h4>
                <div className={`prose prose-sm max-w-none mt-0 ${darkMode ? 'prose-invert' : ''}`}>
                  <ReactMarkdown>{result.summary}</ReactMarkdown>
                </div>
              </div>
            </div>
          )}
        </div>

        {result.resultData.original && result.resultData.original.code && (
          <div className="mt-0">
            <details className={`${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
              <summary className="cursor-pointer font-medium">Show Code</summary>
              <pre className={`mt-2 p-3 rounded overflow-auto ${darkMode ? 'bg-gray-800 text-gray-300' : 'bg-gray-100 text-gray-800'} max-h-96`}>
                <code>{result.resultData.original.code}</code>
              </pre>
            </details>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className={`flex flex-col h-screen transition-colors duration-200 ${darkMode ? 'bg-gray-900 text-white' : 'bg-white text-gray-800'}`}>
      {/* Header */}
      <header className={`flex justify-between items-center p-4 border-b ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
        <div className="flex items-center">
          <h1 className="text-2xl font-semibold">AI Assistant</h1>
          <button
            onClick={goToDashboard}
            className={`ml-6 px-4 py-2 rounded flex items-center ${
              darkMode ? 'bg-gray-800 hover:bg-gray-700' : 'bg-gray-100 hover:bg-gray-200'
            }`}
          >
            <Layout size={18} className="mr-2" />
            Dashboard
            {savedCharts.length > 0 && (
              <span className={`ml-2 px-2 py-1 text-xs rounded-full ${
                darkMode ? 'bg-blue-600 text-white' : 'bg-blue-500 text-white'
              }`}>
                {savedCharts.length}
              </span>
            )}
          </button>
        </div>
        <button
          onClick={toggleDarkMode}
          className={`p-2 rounded-full ${darkMode ? 'bg-gray-800 hover:bg-gray-700' : 'bg-gray-100 hover:bg-gray-200'}`}
          aria-label={darkMode ? "Switch to light mode" : "Switch to dark mode"}
        >
          {darkMode ? <Sun size={20} /> : <Moon size={20} />}
        </button>
      </header>

      {/* Chat Area */}
      <main className={`flex-1 overflow-auto p-4 ${darkMode ? 'bg-gray-800' : 'bg-gray-50'}`}>
        <div className="max-w-7xl mx-auto">
          {!uploadedFileData && messages.length === 0 ? (
            <div className="text-center p-10">
              <h2 className="text-2xl font-medium mb-6">How can I help you today?</h2>

              {/* File Upload UI */}
              <div
                className={`mx-auto mt-8 mb-12 max-w-xl border-2 border-dashed rounded-xl p-8 text-center
                ${darkMode
                  ? isDragging
                    ? 'border-blue-500 bg-blue-900/20'
                    : 'border-gray-600 hover:border-gray-500'
                  : isDragging
                    ? 'border-blue-500 bg-blue-100'
                    : 'border-gray-300 hover:border-gray-400'
                } ${isUploading ? 'opacity-60' : ''}`}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
              >
                {isUploading ? (
                  <>
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto mb-4"></div>
                    <h3 className="text-xl font-medium mb-3">Uploading...</h3>
                  </>
                ) : (
                  <>
                    <Upload size={48} className={`mx-auto mb-4 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`} />
                    <h3 className="text-xl font-medium mb-3">Upload your Excel or CSV file</h3>
                    <p className={`text-base mb-4 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                      Drag and drop file here
                    </p>
                    <p className={`text-sm mb-4 ${darkMode ? 'text-gray-500' : 'text-gray-500'}`}>
                      Limit 200MB per file • XLSX, CSV
                    </p>
                    <label className={`px-6 py-3 rounded-lg cursor-pointer inline-block font-medium
                      ${darkMode
                        ? 'bg-blue-600 hover:bg-blue-700 text-white'
                        : 'bg-blue-500 hover:bg-blue-600 text-white'
                      }`}
                    >
                      Browse Files
                      <input
                        type="file"
                        className="hidden"
                        onChange={handleFileChange}
                        accept=".xlsx,.csv"
                        disabled={isUploading}
                      />
                    </label>
                  </>
                )}
              </div>

              <p className={`text-base ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                and ask a question to get started
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Show file info only if not showing results */}
              {uploadedFileData && !isProcessing && allResults.length === 0 && (
                <div className="transition-all duration-300 ease-in-out">
                  {renderFileInfo()}
                </div>
              )}

              {/* Loading spinner during processing */}
              {isProcessing && (
                <div className="flex flex-col items-center justify-center py-10">
                  <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mb-4"></div>
                  <p className="text-lg font-medium">Analyzing your data...</p>
                </div>
              )}

              {allResults.length > 0 && !isProcessing && (
                <div className="space-y-8">
                  {allResults.map((result) => renderResultItem(result))}
                </div>
              )}
            </div>
          )}
        </div>
      </main>

      {/* Input Area */}
      <InputArea
        darkMode={darkMode}
        message={message}
        setMessage={setMessage}
        inputDisabled={inputDisabled}
        isProcessing={isProcessing}
        handleSubmit={handleSubmit}
        handleFileChange={handleFileChange}
        uploadedFileData={uploadedFileData}
        isUploading={isUploading}
        onLanguageOptions={handleLanguageOptions}
      />
    </div>
  )
}

export default Home