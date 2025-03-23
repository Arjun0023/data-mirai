// Home.js
import React, { useState, useEffect, useCallback } from 'react';
import { Paperclip, Sun, Moon, Send, Upload, BarChart, PieChart, Table, BookmarkPlus, Layout } from 'lucide-react';
import ReactMarkdown from "react-markdown";
import { useNavigate } from 'react-router-dom'; // Import for navigation
import BarChartComponent from './BarChartComponent';
import PieChartComponent from './PieChartComponent';
import TableComponent from './TableComponent';
import DynamicStackedBarChartComponent from './DynamicStackBarChartComponent';
import InputArea from './InputArea'; // Import the new InputArea component
import FileInfoDisplay from './uploaded';
import { FileText, Download, Code, HelpCircle } from 'lucide-react';
import Navbar from './Navbar';
import useData from './useData'; // Import the hook

function Home() {
  const navigate = useNavigate();
  const { uploadedFileData, setUploadedFileData, messages, setMessages, allResults, setAllResults, languageOptions, setLanguageOptions,savedCharts, setSavedCharts, displayMode, setDisplayMode  } = useData(); // Use the context
  const [darkMode, setDarkMode] = useState(false);
  const [message, setMessage] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [inputDisabled, setInputDisabled] = useState(true);


  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d', '#ffc658', '#8dd1e1', '#a4de6c', '#d0ed57'];

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
  };

  const handleFileChange = async (e) => {
    if (e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedFile(file);
      await uploadFile(file);
    }
  };

  const handleLanguageOptions = useCallback((options) => {
    setLanguageOptions(options);
  }, [setLanguageOptions]);

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
      console.log(data, "------");
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
    e.preventDefault();
    if (message.trim()) {
      const newMessage = {
        id: Date.now(),
        text: message,
        sender: 'user',
      };

      setMessages([...messages, newMessage]);
      setIsProcessing(true);

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
        };
        setMessages(prevMessages => [...prevMessages, aiResponse]);

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
        navigate('/ask'); // Navigate to /ask

      } catch (error) {
        console.error('Error processing query:', error);
        const errorMessage = {
          id: Date.now() + 1,
          text: `Error processing your query: ${error.message}`,
          sender: 'system',
        };
        setMessages(prevMessages => [...prevMessages, errorMessage]);
      } finally {
        setIsProcessing(false);
        setMessage('');
      }
    }
  };

  // New function to fetch summary
  const fetchSummary = async (question, resultData) => {
    try {
      console.log(languageOptions, "a");
      const response = await fetch('http://127.0.0.1:8000/summarize', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          question: question,
          data: [resultData],
          language: languageOptions
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

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = async (e) => {
    e.preventDefault();
    setIsDragging(false);

    if (e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      setSelectedFile(file);
      await uploadFile(file);
    }
  };

  return (
    <div className={`flex flex-col h-screen transition-colors duration-300 ${darkMode ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-800'}`}>
      {/* Header */}
      <Navbar
        darkMode={darkMode}
        toggleDarkMode={toggleDarkMode}
        savedCharts={savedCharts}
      />

      {/* Chat Area */}
      <main className={`flex-1 overflow-auto p-4 ${darkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
        <div className="max-w-8xl mx-auto">
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
  {/* Show file info when data exists but not processing */}
  {uploadedFileData && !isProcessing && (
    <div className="transition-all duration-300 ease-in-out w-4/4 mx-auto">
      <FileInfoDisplay
        uploadedFileData={uploadedFileData}
        darkMode={darkMode} />
    </div>
  )}

  {/* Show most recent query result summary if available */}
  {allResults.length > 0 && !isProcessing && (
    <div className={`p-4 rounded-xl ${darkMode ? 'bg-gray-800' : 'bg-white'} shadow-md`}>
      <h3 className="font-medium mb-2">Last Query: {allResults[allResults.length-1].question}</h3>
      <p className={darkMode ? 'text-gray-300' : 'text-gray-600'}>
        {allResults[allResults.length-1].summary}
      </p>
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
  );
}

export default Home;