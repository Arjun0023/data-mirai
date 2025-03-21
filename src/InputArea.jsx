import React, { useState,useEffect } from 'react';
import { Paperclip, Send, Mic, MicOff } from 'lucide-react';


const languageOptions = [
    {code:'en-IN', name:'Hinglish'},
    { code: 'en-US', name: 'English' },
    { code: 'hi-IN', name: 'Hindi' },
    { code: 'mr-IN', name: 'Marathi' },
    { code: 'ta-IN', name: 'Tamil' },
    { code: 'te-IN', name: 'Telugu' },
    { code: 'kn-IN', name: 'Kannada' }
  ];

function InputArea({
  darkMode,
  message,
  setMessage,
  inputDisabled,
  isProcessing,
  handleSubmit,
  handleFileChange,
  uploadedFileData,
  isUploading,
  onLanguageOptions
}) {
  const [isRecognizing, setIsRecognizing] = useState(false);
  const [recognitionLanguage, setRecognitionLanguage] = useState('en-US');

  // Language options for speech recognition
  useEffect(() => {
    // Call the callback to pass the options to the parent
    onLanguageOptions(recognitionLanguage);
  }, [recognitionLanguage]);
  const startRecognition = () => {
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
  };

  return (
    <div className={`p-6 border-t ${darkMode ? 'border-gray-700 bg-gray-900' : 'border-gray-200 bg-white'}`}>
      <form onSubmit={handleSubmit} className="max-w-2xl mx-auto">
        {/* Language selector for voice recognition */}

        {/* Message input area */}
        <div className={`flex items-end rounded-full border ${darkMode ? 'border-gray-700 bg-gray-800' : 'border-gray-300 bg-white'}`}>

          {/* Mic button */}
          <button
            type="button"
            onClick={startRecognition}
            disabled={isProcessing || isRecognizing}
            className={`p-5 focus:outline-none ${isRecognizing ? 'text-red-500' : darkMode ? 'text-gray-400 hover:text-gray-300' : 'text-gray-400 hover:text-gray-600'}`}
            aria-label={isRecognizing ? "Stop recording" : "Start recording"}
          >
            {isRecognizing ? <MicOff size={22} /> : <Mic size={22} />}
          </button>

          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder={inputDisabled ? "Upload a file to start..." : "Ask a question about your data..."}
            className={`flex-1 resize-none p-4 text-lg outline-none rounded-full ${
              darkMode ? 'bg-gray-800 text-white placeholder-gray-500' : 'bg-white text-gray-800 placeholder-gray-400'
            } ${inputDisabled || isProcessing ? 'cursor-not-allowed' : ''}`}
            rows="1"
            style={{ minHeight: '20px', maxHeight: '150px' }}
            disabled={inputDisabled || isProcessing}
          />

          <button
            type="submit"
            className={`p-4 m-1 rounded-full ${
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

        {/* <p className={`mt-3 text-sm text-center ${darkMode ? 'text-gray-500' : 'text-gray-500'}`}>
          {isRecognizing 
            ? "Listening... Speak now." 
            : uploadedFileData
              ? "Ask questions about your data to get insights."
              : "Your files will be processed and analyzed. Maximum file size: 200MB."}
        </p> */}
      </form>
      <div className="mt-2 flex justify-center">
          <select
            className={`text-xs rounded-md px-2 py-1 ${darkMode 
              ? 'bg-gray-700 text-gray-200 border border-gray-600' 
              : 'bg-gray-100 text-gray-700 border border-gray-300'}`}
            value={recognitionLanguage}
            onChange={(e) => setRecognitionLanguage(e.target.value)}
            disabled={isRecognizing}
          >
            {languageOptions.map(lang => (
              <option key={lang.code} value={lang.code}>
                {lang.name}
              </option>
            ))}
          </select>
        </div>
        
    </div>
  )
}

export default InputArea