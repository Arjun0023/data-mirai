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
import FileInfoDisplay from './uploaded';
import {  FileText, Download, Code, HelpCircle } from 'lucide-react';


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
      console.log(data,"------")
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
    <div key={result.id} className={`p-4 rounded-lg ${darkMode ? 'bg-gray-800' : 'bg-white shadow-md'} w-full mb-3 border ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
      <div className="border-b pb-3 mb-3">
        <div className="flex justify-between items-start mb-1">
          <div className="flex items-center">
            <div className={`mr-3 p-1.5 rounded-lg ${darkMode ? 'bg-blue-900/40' : 'bg-blue-100'}`}>
              <FileText className={`h-5 w-5 ${darkMode ? 'text-blue-300' : 'text-blue-600'}`} />
            </div>
            <div>
              <h3 className="text-xl font-medium">"{result.question}"</h3>
              <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                {new Date(result.timestamp).toLocaleString()}
              </p>
            </div>
          </div>

          <div className="flex space-x-2">
            <button
              onClick={() => setDisplayMode('barchart')}
              className={`p-2 rounded transition-colors ${displayMode === 'barchart'
                ? darkMode ? 'bg-blue-800 text-white' : 'bg-blue-500 text-white'
                : darkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-200 hover:bg-gray-300'}`}
              aria-label="Show as bar chart"
            >
              <BarChart size={20} />
            </button>
            <button
              onClick={() => setDisplayMode('piechart')}
              className={`p-2 rounded transition-colors ${displayMode === 'piechart'
                ? darkMode ? 'bg-blue-800 text-white' : 'bg-blue-500 text-white'
                : darkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-200 hover:bg-gray-300'}`}
              aria-label="Show as pie chart"
            >
              <PieChart size={20} />
            </button>
            <button
              onClick={() => setDisplayMode('table')}
              className={`p-2 rounded transition-colors ${displayMode === 'table'
                ? darkMode ? 'bg-blue-800 text-white' : 'bg-blue-500 text-white'
                : darkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-200 hover:bg-gray-300'}`}
              aria-label="Show as table"
            >
              <Table size={20} />
            </button>
            <button
              onClick={() => setDisplayMode('stackedbarchart')}
              className={`p-2 rounded transition-colors ${displayMode === 'stackedbarchart'
                ? darkMode ? 'bg-blue-800 text-white' : 'bg-blue-500 text-white'
                : darkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-200 hover:bg-gray-300'}`}
              aria-label="Show as stacked bar chart"
            >
              <BarChart size={20} />
            </button>
            <button
              onClick={() => saveChartToDashboard(result)}
              disabled={isSaved}
              className={`p-2 rounded transition-colors ${isSaved
                ? darkMode ? 'bg-gray-700 text-gray-500 cursor-not-allowed' : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                : darkMode ? 'bg-green-700 hover:bg-green-600 text-white' : 'bg-green-500 hover:bg-green-600 text-white'}`}
              aria-label="Save to dashboard"
            >
              <BookmarkPlus size={20} />
            </button>
          </div>
        </div>
      </div>

      <div className={`flex flex-col lg:flex-row gap-2 w-full max-w-8xl mx-auto`}>
        <div className={`h-110 ${result.summary ? 'lg:w-2/3' : 'w-full'} border rounded-lg overflow-hidden ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
          {displayMode === 'barchart' && (
            <div className="h-full w-full">
              <BarChartComponent data={result.resultData.formatted} />
            </div>
          )}

          {displayMode === 'piechart' && (
            <div className="h-full w-full">
              <PieChartComponent data={result.resultData.formatted} colors={COLORS} />
            </div>
          )}

          {displayMode === 'table' && (
            <div className="h-full w-full overflow-auto">
              <TableComponent
                data={prepareDataForTable()}
                darkMode={darkMode}
              />
            </div>
          )}
          
          {displayMode === 'stackedbarchart' && (
            <div className="h-full w-full">
              <DynamicStackedBarChartComponent
                data={
                  (result.resultData.original?.result && Array.isArray(result.resultData.original.result))
                    ? result.resultData.original.result
                    : Array.isArray(result.resultData.formatted)
                      ? result.resultData.formatted
                      : []
                }
                darkMode={darkMode}
              />
            </div>
          )}
        </div>

        {result.summary && (
          <div className="lg:w-1/3">
            <div className={`p-4 rounded-lg border ${darkMode ? 'bg-gray-750 text-gray-300 border-gray-700' : 'bg-gray-50 text-gray-700 border-gray-200'} overflow-y-auto max-h-110`}>
              <div className="flex items-center mb-2 pb-2 border-b border-gray-600">
                <HelpCircle className={`h-4 w-4 mr-2 ${darkMode ? 'text-blue-400' : 'text-blue-500'}`} />
                <h4 className="font-medium">Summary</h4>
              </div>
              <div className={`prose prose-headings:mt-4 prose-headings:mb-2 prose-h1:text-xl prose-h2:text-lg prose-h3:text-base prose-sm max-w-none mt-0 ${darkMode ? 'prose-invert' : ''}`}>
                <ReactMarkdown
                  components={{
                    h1: ({node, ...props}) => <h1 className="text-l font-bold my-0" {...props} />,
                    h2: ({node, ...props}) => <h2 className="text-l font-bold my-0" {...props} />,
                    h3: ({node, ...props}) => <h3 className="text-base font-semibold my-2" {...props} />,
                    p: ({node, ...props}) => <p className="my-2" {...props} />,
                    ul: ({node, ...props}) => <ul className="list-disc pl-5 my-2" {...props} />,
                    ol: ({node, ...props}) => <ol className="list-decimal pl-5 my-2" {...props} />,
                    li: ({node, ...props}) => <li className="ml-2" {...props} />
                  }}
                >
                  {result.summary}
                </ReactMarkdown>
              </div>
            </div>
          </div>
        )}
      </div>

      {result.resultData.original && result.resultData.original.code && (
        <div className="mt-3">
          <details className={`${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
            <summary className="cursor-pointer font-medium flex items-center">
              <Code className={`h-4 w-4 mr-2 ${darkMode ? 'text-purple-400' : 'text-purple-600'}`} />
              <span>Show Code</span>
            </summary>
            <pre className={`mt-2 p-3 rounded overflow-auto ${darkMode ? 'bg-gray-900 text-gray-300 border border-gray-700' : 'bg-gray-100 text-gray-800 border border-gray-300'} max-h-96`}>
              <code>{result.resultData.original.code}</code>
            </pre>
          </details>
        </div>
      )}
      
      <div className={`mt-3 p-3 rounded-lg ${darkMode ? 'bg-blue-900/20 text-blue-300 border border-blue-900/30' : 'bg-blue-50 text-blue-700 border border-blue-100'} flex items-center`}>
        <div className={`p-1 rounded-full mr-2 ${darkMode ? 'bg-blue-800/50' : 'bg-blue-100'}`}>
          <Download className="h-4 w-4" />
        </div>
        <p className="text-sm">
          This chart visualization can be added to your dashboard for future reference
        </p>
      </div>
    </div>
  );
};
return (
  <div className={`flex flex-col h-screen transition-colors duration-300 ${darkMode ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-800'}`}>
    {/* Header */}
    <header className={`flex justify-between items-center p-4 border-b shadow-sm ${darkMode ? 'border-gray-700 bg-gray-800' : 'border-gray-200 bg-white'}`}>
      <div className="flex items-center">
        <h1 className="text-2xl font-semibold bg-gradient-to-r from-indigo-500 to-blue-600 bg-clip-text text-transparent">AI Assistant</h1>
        <button
          onClick={goToDashboard}
          className={`ml-6 px-4 py-2 rounded-lg flex items-center transition-colors ${
            darkMode ? 'bg-gray-700 hover:bg-gray-600 text-gray-200' : 'bg-white hover:bg-gray-50 text-gray-700 border border-gray-200 shadow-sm'
          }`}
        >
          <Layout size={18} className="mr-2" />
          Dashboard
          {savedCharts.length > 0 && (
            <span className={`ml-2 px-2 py-0.5 text-xs rounded-full ${
              darkMode ? 'bg-indigo-600 text-white' : 'bg-indigo-500 text-white'
            }`}>
              {savedCharts.length}
            </span>
          )}
        </button>
      </div>
      <button
        onClick={toggleDarkMode}
        className={`p-2 rounded-lg transition-colors ${darkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-white hover:bg-gray-50 border border-gray-200 shadow-sm'}`}
        aria-label={darkMode ? "Switch to light mode" : "Switch to dark mode"}
      >
        {darkMode ? <Sun size={20} className="text-gray-300" /> : <Moon size={20} className="text-gray-700" />}
      </button>
    </header>

    {/* Chat Area */}
    <main className={`flex-1 overflow-auto p-4 ${darkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
      <div className="max-w-7xl mx-auto">
        {!uploadedFileData && messages.length === 0 ? (
          <div className="text-center p-10">
            <h2 className="text-2xl font-medium mb-6">How can I help you today?</h2>

            {/* File Upload UI */}
            <div
              className={`mx-auto mt-8 mb-12 max-w-xl border-2 border-dashed rounded-xl p-8 text-center transition-all duration-200
              ${darkMode
                ? isDragging
                  ? 'border-indigo-500 bg-indigo-900/20'
                  : 'border-gray-600 hover:border-gray-500'
                : isDragging
                  ? 'border-indigo-500 bg-indigo-50'
                  : 'border-gray-300 hover:border-gray-400'
              } ${isUploading ? 'opacity-60' : ''} shadow-md`}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
            >
              {isUploading ? (
                <>
                  <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500 mx-auto mb-4"></div>
                  <h3 className="text-xl font-medium mb-3">Uploading...</h3>
                </>
              ) : (
                <>
                  <Upload size={48} className={`mx-auto mb-4 ${darkMode ? 'text-indigo-400' : 'text-indigo-500'}`} />
                  <h3 className="text-xl font-medium mb-3">Upload your Excel or CSV file</h3>
                  <p className={`text-base mb-4 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    Drag and drop file here
                  </p>
                  <p className={`text-sm mb-4 ${darkMode ? 'text-gray-500' : 'text-gray-500'}`}>
                    Limit 200MB per file • XLSX, CSV
                  </p>
                  <label className={`px-6 py-3 rounded-lg cursor-pointer inline-block font-medium transition-colors
                    ${darkMode
                      ? 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg shadow-indigo-900/20'
                      : 'bg-indigo-500 hover:bg-indigo-600 text-white shadow-md shadow-indigo-500/20'
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
          <div className="space-y-4 w-full">
            {/* Show file info only if not showing results */}
            {uploadedFileData && !isProcessing && allResults.length === 0 && (
              <div className="transition-all duration-300 ease-in-out max-w-fit" >
              <FileInfoDisplay 
              uploadedFileData={uploadedFileData} 
              darkMode={darkMode}/>
              </div>
            )}

            {/* Loading spinner during processing */}
            {isProcessing && (
              <div className={`flex flex-col items-center justify-center py-10 rounded-xl shadow-lg ${darkMode ? 'bg-gray-800 border border-gray-700' : 'bg-white border border-gray-200'}`}>
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500 mb-4"></div>
                <p className="text-lg font-medium">Analyzing your data...</p>
                <p className={`text-sm mt-2 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>This may take a moment</p>
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
      customClasses={{
        container: `${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} shadow-lg`,
        input: `${darkMode ? 'bg-gray-700 border-gray-600 focus:border-indigo-500' : 'bg-gray-50 border-gray-300 focus:border-indigo-500'} focus:ring-2 focus:ring-indigo-500/20`,
        button: `${darkMode ? 'bg-indigo-600 hover:bg-indigo-700' : 'bg-indigo-500 hover:bg-indigo-600'} shadow-md`
      }}
    />
  </div>
)
}

export default Home