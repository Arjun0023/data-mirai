import React, { useState, useEffect } from 'react'
import { Paperclip, Sun, Moon, Send, Upload, BarChart, PieChart, Table } from 'lucide-react'
import ReactMarkdown from "react-markdown";
import BarChartComponent from './BarChartComponent'; // Import
import PieChartComponent from './PieChartComponent'; // Import
import TableComponent from './TableComponent'; // Import

function Home() {
  const [darkMode, setDarkMode] = useState(false)
  const [message, setMessage] = useState('')
  const [selectedFile, setSelectedFile] = useState(null)
  const [messages, setMessages] = useState([])
  const [isDragging, setIsDragging] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const [uploadedFileData, setUploadedFileData] = useState(null)
  const [inputDisabled, setInputDisabled] = useState(true)
  //const [resultData, setResultData] = useState(null)
  const [displayMode, setDisplayMode] = useState('barchart') // 'barchart', 'piechart', or 'table'
  //const [summary, setSummary] = useState(null) // New state for summary
  const [allResults, setAllResults] = useState([])
  
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d', '#ffc658', '#8dd1e1', '#a4de6c', '#d0ed57']
  
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
  
  const uploadFile = async (file) => {
    setIsUploading(true);
    
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('session_id', 'session123'); // Add session_id
  
      const response = await fetch('http://127.0.0.1:8080/upload', {
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
      // We don't clear previous results anymore
      
      try {
        // Create FormData object for the API call
        const formData = new FormData();
        formData.append('question', message);
        formData.append('session_id', 'session123');
        
        // Make the API call with FormData
        const response = await fetch('http://127.0.0.1:8080/ask', {
          method: 'POST',
          body: formData, // Use FormData instead of JSON
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
          timestamp: new Date().toISOString()
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
      const response = await fetch('http://127.0.0.1:8080/summarize', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          question: question,
          data: [resultData]
        }),
      });
      
      if (!response.ok) {
        throw new Error(`Summary failed: ${response.status} ${response.statusText}`);
      }
      
      const data = await response.json();
      console.log('Summary data:', data);
      return data.summary; // Return the summary instead of setting state
      
    } catch (error) {
      console.error('Error fetching summary:', error);
      return "Error generating summary."; // Return an error message
    }
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
  
  // Render visualization of results
  const renderResultItem = (result) => {
    if (!result || !result.resultData) return null;
    if (Array.isArray(result.resultData.formatted) && result.resultData.formatted.length > 0 && typeof result.resultData.formatted[0] === 'object' && result.resultData.formatted[0].name !== undefined && result.resultData.formatted[0].value !== undefined) {
      // Already in correct format, pass as is
  } else {
      // Transform single object into the expected format
      const formattedData = Object.entries(result.resultData.formatted).map(([key, value]) => ({
          name: key,
          value: value
      }));
      result.resultData.formatted = formattedData;
  }
    return (
      <div key={result.id} className={`p-6 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-white shadow-md'} w-full mb-8`}>
        <div className="border-b pb-3 mb-4">
          <h3 className="text-xl font-medium">"{result.question}"</h3>
          <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
            {new Date(result.timestamp).toLocaleString()}
          </p>
        </div>
      
        <div className="flex justify-between items-center mb-4">
          <h4 className="text-lg font-medium">Results</h4>
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
          </div>
        </div>
        
        {/* Modified layout with increased width and height */}
        <div className={`flex flex-col lg:flex-row gap-4 w-full max-w-6xl mx-auto`}>
          {/* Chart section with increased height */}
          <div className={`h-96 ${result.summary ? 'lg:w-2/3' : 'w-full'}`}>
            {displayMode === 'barchart' && (
             <BarChartComponent data={result.resultData.formatted} />
            )}
            
            {displayMode === 'piechart' && (
              <PieChartComponent data={result.resultData.formatted} colors={COLORS} />
            )}
            
            {displayMode === 'table' && (
             <TableComponent data={result.resultData.formatted} darkMode={darkMode} />
            )}
          </div>
          
          {/* Summary section with ReactMarkdown */}
          {result.summary && (
            <div className="lg:w-1/3">
              <div className={`p-4 rounded-lg ${darkMode ? 'bg-gray-800 text-gray-300' : 'bg-gray-100 text-gray-700'} overflow-y-auto max-h-96`}>
                <h4 className="font-medium mb-2 sticky top-0 bg-inherit pt-1 pb-2 border-b border-gray-600">Summary</h4>
                <div className={`prose prose-sm max-w-none mt-2 ${darkMode ? 'prose-invert' : ''}`}>
                  <ReactMarkdown>{result.summary}</ReactMarkdown>
                </div>
              </div>
            </div>
          )}
        </div>
        
        {result.resultData.original && result.resultData.original.code && (
          <div className="mt-6">
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
        <h1 className="text-2xl font-semibold">AI Assistant</h1>
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
              {/* Results visualization */}
              {/* {resultData && !isProcessing && renderResults()} */}
              
              {/* Messages */}
              {/* <div className="space-y-4">
                {messages.map((msg) => (
                  <div 
                    key={msg.id} 
                    className={`p-4 rounded-lg ${
                      msg.sender === 'user' 
                        ? darkMode ? 'bg-blue-900 ml-12' : 'bg-blue-100 ml-12' 
                        : msg.sender === 'system'
                          ? darkMode ? 'bg-gray-700 border border-gray-600' : 'bg-gray-100 border border-gray-300'
                          : darkMode ? 'bg-gray-700 mr-12' : 'bg-white mr-12 shadow-sm'
                    }`}
                  >
                    <p>{msg.text}</p>
                  </div>
                ))}
              </div> */}
            </div>
          )}
        </div>
      </main>
      
      {/* Input Area */}
      <div className={`p-6 border-t ${darkMode ? 'border-gray-700 bg-gray-900' : 'border-gray-200 bg-white'}`}>
        <form onSubmit={handleSubmit} className="max-w-2xl mx-auto">
          {/* Message input area */}
          <div className={`flex items-end rounded-full border ${darkMode ? 'border-gray-700 bg-gray-800' : 'border-gray-300 bg-white'}`}>
            {!uploadedFileData && (
              <label className="p-3 cursor-pointer">
                <input
                  type="file"
                  className="hidden"
                  onChange={handleFileChange}
                  accept=".xlsx,.csv"
                  aria-label="Upload file"
                  disabled={isUploading}
                />
                <Paperclip size={22} className={darkMode ? 'text-gray-400 hover:text-gray-300' : 'text-gray-400 hover:text-gray-600'} />
              </label>
            )}
            
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder={inputDisabled ? "Upload a file to start..." : "Ask a question about your data..."}
              className={`flex-1 resize-none p-4 text-lg outline-none rounded-full ${
                darkMode ? 'bg-gray-800 text-white placeholder-gray-500' : 'bg-white text-gray-800 placeholder-gray-400'
              } ${inputDisabled || isProcessing ? 'cursor-not-allowed' : ''}`}
              rows="1"
              style={{ minHeight: '56px', maxHeight: '200px' }}
              disabled={inputDisabled || isProcessing}
            />
            
            <button 
              type="submit" 
              className={`p-3 m-1 rounded-full ${
                message && !inputDisabled && !isProcessing
                  ? darkMode 
                    ? 'bg-blue-600 hover:bg-blue-700 text-white' 
                    : 'bg-blue-500 hover:bg-blue-600 text-white'
                  : darkMode
                    ? 'bg-gray-700 text-gray-400 cursor-not-allowed'
                    : 'bg-gray-200 text-gray-400 cursor-not-allowed'
              }`}
              disabled={!message || inputDisabled || isProcessing}
              aria-label="Send message"
            >
              {isProcessing ? (
                <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white"></div>
              ) : (
                <Send size={22} />
              )}
            </button>
          </div>
          
          <p className={`mt-3 text-sm text-center ${darkMode ? 'text-gray-500' : 'text-gray-500'}`}>
            {uploadedFileData 
              ? "Ask questions about your data to get insights."
              : "Your files will be processed and analyzed. Maximum file size: 200MB."}
          </p>
        </form>
      </div>
    </div>
  )
}

export default Home