import React, { useState, useEffect, useCallback, memo } from 'react';
import { Paperclip, Send, Mic, MicOff, Settings, CornerDownLeft, Languages } from 'lucide-react';

const languageOptions = [
  { code: 'en-IN', name: 'Hinglish' },
  { code: 'en-US', name: 'English' },
  { code: 'hi-IN', name: 'Hindi' },
  { code: 'mr-IN', name: 'Marathi' },
  { code: 'ta-IN', name: 'Tamil' },
  { code: 'te-IN', name: 'Telugu' },
  { code: 'kn-IN', name: 'Kannada' }
];

// Use React.memo to prevent unnecessary re-renders
const InputArea = memo(function InputArea({
  darkMode,
  message,
  setMessage,
  inputDisabled,
  isProcessing,
  handleSubmit,
  handleFileChange,
  uploadedFileData,
  isUploading,
  onLanguageOptions,
  customClasses
}) {
  const [isRecognizing, setIsRecognizing] = useState(false);
  const [recognitionLanguage, setRecognitionLanguage] = useState('en-US');
  const [showLanguageSelector, setShowLanguageSelector] = useState(false);

  // Language options for speech recognition
  useEffect(() => {
    // Call the callback to pass the options to the parent
    if (onLanguageOptions) {
      onLanguageOptions(recognitionLanguage);
    }
  }, [recognitionLanguage, onLanguageOptions]);

  const startRecognition = useCallback(() => {
    if ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window) {
      const recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
      recognition.continuous = false;
      recognition.lang = recognitionLanguage;
      recognition.interimResults = false;
      recognition.maxAlternatives = 10;

      recognition.onstart = function () {
        setIsRecognizing(true);
        console.log('Voice recognition started. Try speaking into the microphone.');
      };

      let finalTranscript = '';

      recognition.onresult = function (event) {
        for (let i = event.resultIndex; i < event.results.length; i++) {
          if (event.results[i].isFinal) {
            finalTranscript = event.results[i][0].transcript;
            console.log("transcript:", finalTranscript);
          }
        }

        if (finalTranscript) {
          setMessage(currentMessage => currentMessage ? `${currentMessage} ${finalTranscript}` : finalTranscript);
        }
      };

      recognition.onerror = function (event) {
        setIsRecognizing(false);
        console.error('Recognition error:', event.error);
        if (event.error === 'network') {
          alert('Network error. Please check your internet connection and try again.');
        } else {
          alert('Recognition error. Please try again.');
        }
      };

      recognition.onend = function () {
        setIsRecognizing(false);
        console.log('Voice recognition ended.');
      };

      // Start recognition
      recognition.start();
    } else {
      console.error('Speech recognition not supported in this browser.');
      alert('Speech recognition not supported in this browser.');
    }
  }, [recognitionLanguage, setMessage]);

  const toggleLanguageSelector = useCallback(() => {
    setShowLanguageSelector(prev => !prev);
  }, []);

  const handleKeyDown = useCallback((e) => {
    // Submit on Enter (without Shift)
    if (e.key === 'Enter' && !e.shiftKey && message.trim()) {
      e.preventDefault();
      handleSubmit(e);
    }
  }, [message, handleSubmit]);

  const handleTextChange = useCallback((e) => {
    setMessage(e.target.value);
  }, [setMessage]);

  const handleLanguageSelect = useCallback((code) => {
    setRecognitionLanguage(code);
    setShowLanguageSelector(false);
  }, []);

  return (
    <div className={`border-t ${darkMode ? 'border-gray-700 bg-gray-800' : 'border-gray-200 bg-white'} py-4 px-4 sm:px-6`}>
      <div className="max-w-4xl mx-auto">
        <form onSubmit={handleSubmit} className="relative">
          <div className={`rounded-xl overflow-hidden shadow-sm border ${darkMode ? 'border-gray-700 bg-gray-900' : 'border-gray-300 bg-white'} transition-all duration-200 ${isRecognizing ? 'ring-2 ring-indigo-500' : ''}`}>
            <div className="flex items-center w-full">
              {/* Left side buttons container */}
              <div className="flex items-center space-x-1 pl-3">
                {/* Mic button */}
                <button
                  type="button"
                  onClick={startRecognition}
                  disabled={isProcessing || isRecognizing}
                  className={`p-2 rounded-lg transition-colors ${
                    isRecognizing
                      ? darkMode
                        ? 'text-red-400 bg-red-900/20' 
                        : 'text-red-600 bg-red-50'
                      : darkMode
                        ? 'text-gray-400 hover:text-gray-300 hover:bg-gray-800' 
                        : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
                  }`}
                  aria-label={isRecognizing ? "Stop recording" : "Start recording"}
                >
                  {isRecognizing ? <MicOff size={18} /> : <Mic size={18} />}
                </button>

                {/* Language settings */}
                <button
                  type="button"
                  onClick={toggleLanguageSelector}
                  disabled={isProcessing || isRecognizing}
                  className={`p-2 rounded-lg transition-colors ${
                    showLanguageSelector
                      ? darkMode
                        ? 'text-indigo-400 bg-indigo-900/20' 
                        : 'text-indigo-600 bg-indigo-50'
                      : darkMode
                        ? 'text-gray-400 hover:text-gray-300 hover:bg-gray-800' 
                        : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
                  }`}
                  aria-label="Language settings"
                >
                <Languages size={20}/>
                
                </button>
              </div>

              {/* Text input */}
              <textarea
                value={message}
                onChange={handleTextChange}
                onKeyDown={handleKeyDown}
                placeholder={inputDisabled ? "Upload a file to start..." : "Ask a question about your data..."}
                className={`flex-1 resize-none py-3 px-3 outline-none text-base ${
                  darkMode ? 'bg-gray-900 text-white placeholder-gray-500' : 'bg-white text-gray-800 placeholder-gray-400'
                } ${inputDisabled || isProcessing ? 'cursor-not-allowed' : ''}`}
                rows="1"
                style={{ minHeight: '48px', maxHeight: '150px' }}
                disabled={inputDisabled || isProcessing}
              />

              {/* Send button container */}
              <div className="flex items-center pr-3">
                <button
                  type="submit"
                  className={`p-2 rounded-lg flex items-center justify-center ${
                    message && !inputDisabled && !isProcessing
                      ? `${darkMode ? 'bg-indigo-600 hover:bg-indigo-700' : 'bg-indigo-500 hover:bg-indigo-600'} text-white`
                      : `${darkMode ? 'bg-gray-800 text-gray-600' : 'bg-gray-100 text-gray-400'} cursor-not-allowed`
                  } transition-colors`}
                  disabled={!message || inputDisabled || isProcessing}
                  aria-label="Send message"
                >
                  {isProcessing ? (
                    <div className="h-5 w-5 animate-spin rounded-full border-2 border-t-transparent border-white"></div>
                  ) : (
                    <CornerDownLeft size={18} />
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Keyboard shortcut hint */}
          <div className="flex justify-end">
            <p className={`mt-1.5 text-xs ${darkMode ? 'text-gray-500' : 'text-gray-500'}`}>
              Press Enter to send
            </p>
          </div>
        </form>

        {/* Language selector popup */}
        {showLanguageSelector && (
          <div className={`mt-2 p-3 rounded-lg shadow-md border ${
            darkMode ? 'bg-gray-900 border-gray-700' : 'bg-white border-gray-200'
          }`}>
            <p className={`text-xs mb-2 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              Select voice recognition language:
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {languageOptions.map(lang => (
                <button
                  key={lang.code}
                  className={`px-3 py-2 text-sm rounded-lg text-left transition-colors ${
                    recognitionLanguage === lang.code
                      ? darkMode
                        ? 'bg-indigo-900/30 text-indigo-300 border border-indigo-800'
                        : 'bg-indigo-50 text-indigo-700 border border-indigo-100'
                      : darkMode
                        ? 'hover:bg-gray-800 text-gray-300'
                        : 'hover:bg-gray-100 text-gray-700'
                  }`}
                  onClick={() => handleLanguageSelect(lang.code)}
                >
                  {lang.name}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Status message */}
        {isRecognizing && (
          <div className={`mt-2 p-2 rounded-lg text-center ${
            darkMode ? 'bg-indigo-900/20 text-indigo-300' : 'bg-indigo-50 text-indigo-700'
          }`}>
            <p className="text-sm flex items-center justify-center">
              <span className="relative flex h-3 w-3 mr-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                <span className={`relative inline-flex rounded-full h-3 w-3 ${darkMode ? 'bg-red-500' : 'bg-red-600'}`}></span>
              </span>
              Listening... Speak now in {languageOptions.find(l => l.code === recognitionLanguage)?.name || 'selected language'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
});

export default InputArea;