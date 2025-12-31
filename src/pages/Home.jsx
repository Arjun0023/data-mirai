import React, { useState, useCallback, useEffect } from 'react';
import { Upload, Mic, Send, Plus, FileText, Languages } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/navbar/Navbar';
import FileInfoDisplay from '../components/containers/uploaded';
import { useTheme } from '../context/ThemeContext';
import useData from '../components/data/useData';

const VOICE_LANGUAGE_OPTIONS = [
  { code: 'en-IN', name: 'Hinglish' },
  { code: 'en-US', name: 'English' },
  { code: 'hi-IN', name: 'Hindi' },
  { code: 'mr-IN', name: 'Marathi' },
  { code: 'ta-IN', name: 'Tamil' },
  { code: 'te-IN', name: 'Telugu' },
  { code: 'kn-IN', name: 'Kannada' }
];

function Home() {
  const navigate = useNavigate();
  const {
    uploadedFileData,
    setUploadedFileData,
    messages,
    setMessages,
    allResults,
    setAllResults,
    languageOptions,
    setLanguageOptions,
    savedCharts,
    setSavedCharts,
    displayMode,
    setDisplayMode
  } = useData();

  // Use centralized theme
  const { darkMode, toggleDarkMode } = useTheme();

  const [message, setMessage] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showFileInfo, setShowFileInfo] = useState(false);
  const [recognitionLanguage, setRecognitionLanguage] = useState('en-US');
  const [showLanguageSelector, setShowLanguageSelector] = useState(false);



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
      formData.append('session_id', 'session123');

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
      setShowFileInfo(true);

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
        const formData = new FormData();
        formData.append('question', message);
        formData.append('session_id', 'session123');
        formData.append('language', languageOptions);

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
          formatted: data.result
        };

        const aiResponse = {
          id: Date.now() + 1,
          text: `I've analyzed your data for "${message}"`,
          sender: 'ai',
        };
        setMessages(prevMessages => [...prevMessages, aiResponse]);

        const summaryText = await fetchSummary(message, data.result);

        const newResult = {
          id: Date.now(),
          question: message,
          resultData: formattedResult,
          summary: summaryText,
          timestamp: new Date().toISOString(),
          displayMode: displayMode
        };

        setAllResults(prevResults => [...prevResults, newResult]);
        navigate('/ask');

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

  const fetchSummary = async (question, resultData) => {
    try {
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



  return (
    <div className={`flex flex-col h-screen transition-colors duration-300 ${darkMode ? 'bg-neutral-900 text-white' : 'bg-gray-50 text-gray-900'}`}>
      {/* Header */}
      <Navbar
        darkMode={darkMode}
        toggleDarkMode={toggleDarkMode}
        savedCharts={savedCharts}
      />

      {/* Main Content */}
      <main className="flex-1 flex flex-col items-center justify-center px-4 pb-32 overflow-auto">
        {isProcessing ? (
          <div className="flex flex-col items-center justify-center py-10">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mb-4"></div>
            <p className="text-lg font-medium">Analyzing your data...</p>
            <p className="text-sm mt-2 text-gray-400">This may take a moment</p>
          </div>
        ) : (
          <div className="w-full max-w-4xl text-center">
            <h1 className={`text-4xl md:text-5xl font-normal mb-8 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              How can I analyse your data today?
            </h1>

            {/* File Upload Status */}
            {uploadedFileData && (
              <div className="mb-6">
                <button
                  onClick={() => setShowFileInfo(!showFileInfo)}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-lg glass-effect hover:bg-opacity-60 transition-all"
                >
                  <FileText size={16} className="text-blue-400" />
                  <span className="text-sm text-gray-300">{selectedFile?.name || 'File uploaded'}</span>
                  <span className="text-xs text-gray-500">Click to {showFileInfo ? 'hide' : 'view'} details</span>
                </button>

                {showFileInfo && (
                  <div className="mt-4 max-w-2xl mx-auto">
                    <FileInfoDisplay
                      uploadedFileData={uploadedFileData}
                      darkMode={darkMode}
                      onQuestionClick={(question) => setMessage(question)}
                    />
                  </div>
                )}
              </div>
            )}

            {/* Main Input Area */}
            <div className="relative">
              <form onSubmit={handleSubmit} className="w-full">
                <div
                  className={`rounded-xl p-3 flex items-center gap-3 border transition-all duration-300 ${darkMode
                    ? 'bg-neutral-800 border-neutral-700'
                    : 'bg-white border-gray-200 shadow-sm'
                    }`}
                >
                  {/* Plus/Upload Button */}
                  <label className="cursor-pointer hover:bg-gray-700 p-2 rounded-md transition-colors">
                    <Plus size={20} className="text-gray-400 hover:text-gray-300" />
                    <input
                      type="file"
                      className="hidden"
                      onChange={handleFileChange}
                      accept=".xlsx,.csv"
                      disabled={isUploading}
                    />
                  </label>

                  {/* Language Selector Button */}
                  <button
                    type="button"
                    onClick={() => setShowLanguageSelector(!showLanguageSelector)}
                    disabled={isProcessing}
                    className={`p-2 rounded-md transition-colors ${showLanguageSelector
                      ? 'bg-blue-900/30 text-blue-400'
                      : 'hover:bg-gray-700 text-gray-400 hover:text-gray-300'
                      }`}
                    title="Select language for voice input"
                  >
                    <Languages size={20} />
                  </button>

                  {/* Text Input */}
                  <input
                    type="text"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder={uploadedFileData ? "Assign a task or ask anything" : "Upload a file to start..."}
                    disabled={!uploadedFileData || isUploading}
                    className={`flex-1 bg-transparent border-none outline-none text-base transition-colors duration-300 ${darkMode
                      ? 'text-white placeholder-neutral-500'
                      : 'text-neutral-900 placeholder-neutral-400'
                      }`}
                  />

                  {/* Voice Input Button */}
                  <button
                    type="button"
                    disabled
                    className="p-2 rounded-md hover:bg-gray-700 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                    title="Voice input (coming soon)"
                  >
                    <Mic size={20} className="text-gray-400" />
                  </button>

                  {/* Send Button */}
                  <button
                    type="submit"
                    disabled={!message.trim() || isProcessing}
                    className={`p-2.5 rounded-full transition-colors ${message.trim() && !isProcessing
                      ? 'bg-gray-600 hover:bg-gray-500'
                      : 'bg-gray-700 opacity-50 cursor-not-allowed'
                      }`}
                  >
                    <Send size={16} className="text-gray-300" />
                  </button>
                </div>
              </form>

              {/* Upload Status Indicator */}
              {isUploading && (
                <div className="absolute -bottom-8 left-0 right-0 text-center">
                  <p className="text-sm text-gray-400">Uploading file...</p>
                </div>
              )}
            </div>

            {/* Language Selector Dropdown */}
            {showLanguageSelector && (
              <div
                className={`mt-3 p-3 rounded-xl border transition-all duration-300 ${darkMode
                  ? 'bg-neutral-800 border-neutral-700'
                  : 'bg-white border-gray-200 shadow-sm'
                  }`}
              >
                <p className={`text-xs mb-2 ${darkMode ? 'text-neutral-400' : 'text-neutral-600'}`}>
                  Select voice recognition language:
                </p>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {VOICE_LANGUAGE_OPTIONS && VOICE_LANGUAGE_OPTIONS.length > 0 ? (
                    VOICE_LANGUAGE_OPTIONS.map((lang) => {
                      const isSelected = recognitionLanguage === lang.code;
                      return (
                        <button
                          key={lang.code}
                          type="button"
                          onClick={() => {
                            setRecognitionLanguage(lang.code);
                            setShowLanguageSelector(false);
                            handleLanguageOptions(lang.code);
                          }}
                          className={
                            isSelected
                              ? 'px-3 py-2 text-sm rounded-lg text-left transition-colors bg-blue-900/30 text-blue-300 border border-blue-800'
                              : 'px-3 py-2 text-sm rounded-lg text-left transition-colors hover:bg-gray-700 text-gray-300'
                          }
                        >
                          {lang.name}
                        </button>
                      );
                    })
                  ) : (
                    <p className="text-gray-400 text-sm">No languages available</p>
                  )}
                </div>
              </div>
            )}



            {/* Helper Text */}
            {!uploadedFileData && (
              <p className={`mt-8 text-sm transition-colors duration-300 ${darkMode ? 'text-neutral-400' : 'text-neutral-600'}`}>
                Upload an Excel or CSV file to get started with data analysis
              </p>
            )}
          </div>
        )
        }
      </main >
    </div >
  );
}

export default Home;