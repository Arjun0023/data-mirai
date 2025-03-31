// DataContext.js
import React, { createContext, useState, useEffect } from 'react';

export const DataContext = createContext();

export const DataProvider = ({ children }) => {
    const [uploadedFileData, setUploadedFileData] = useState(null);
    const [messages, setMessages] = useState([]);
    const [allResults, setAllResults] = useState([]);
    const [languageOptions, setLanguageOptions] = useState([]);
    const [savedCharts, setSavedCharts] = useState([]);
    const [displayMode, setDisplayMode] = useState('table');

  useEffect(() => {
      // Load saved charts from localStorage on component mount
      const savedChartsData = localStorage.getItem('savedCharts');
      if (savedChartsData) {
        setSavedCharts(JSON.parse(savedChartsData));
      }
  }, []);
  
      // Save charts to localStorage whenever they change
  useEffect(() => {
      localStorage.setItem('savedCharts', JSON.stringify(savedCharts));
  }, [savedCharts]);
  

    const updateUploadedFileData = (data) => {
      setUploadedFileData(data);
    }

    useEffect(() => {
      // Load data from localStorage on component mount
      const storedUploadedFileData = localStorage.getItem('uploadedFileData');
      if (storedUploadedFileData) {
        setUploadedFileData(JSON.parse(storedUploadedFileData));
      }
  
      const storedMessages = localStorage.getItem('messages');
      if (storedMessages) {
        setMessages(JSON.parse(storedMessages));
      }
  
      const storedAllResults = localStorage.getItem('allResults');
      if (storedAllResults) {
        setAllResults(JSON.parse(storedAllResults));
      }
  
      const storedLanguageOptions = localStorage.getItem('languageOptions');
      if (storedLanguageOptions) {
        setLanguageOptions(JSON.parse(storedLanguageOptions));
      }
    }, []);
  
    useEffect(() => {
      // Save data to localStorage whenever it changes
      localStorage.setItem('uploadedFileData', JSON.stringify(uploadedFileData));
      localStorage.setItem('messages', JSON.stringify(messages));
      localStorage.setItem('allResults', JSON.stringify(allResults));
      localStorage.setItem('languageOptions', JSON.stringify(languageOptions));
    }, [uploadedFileData, messages, allResults, languageOptions]);

    return (
        <DataContext.Provider
            value={{
                uploadedFileData,
                setUploadedFileData: updateUploadedFileData,
                messages,
                setMessages,
                allResults,
                setAllResults,
                languageOptions,
                setLanguageOptions,
                savedCharts,
                setSavedCharts,
                displayMode,
                setDisplayMode,
            }}
        >
            {children}
        </DataContext.Provider>
    );
};