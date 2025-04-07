// Ask.jsx
import React, { useState, useCallback, useMemo } from 'react';
import { BarChart, PieChart, Table, BookmarkPlus, FileText, Download, Code, HelpCircle } from 'lucide-react';
import ReactMarkdown from "react-markdown";
import BarChartComponent from '../components/Dashboard/BarChart/BarChartComponent';
import PieChartComponent from '../components/Dashboard/PieChart/PieChartComponent';
import TableComponent from '../components/Dashboard/Table/TableComponent';
import DynamicStackedBarChartComponent from '../components/Dashboard/BarChart/DynamicStackBarChartComponent';
import useData from '../components/data/useData'; // Import the hook
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/navbar/Navbar';
import InputArea from '../components/input/InputArea';

//
const ResultItem = React.memo(({ result, displayMode, darkMode, saveChartToDashboard, setDisplayMode, savedCharts, COLORS }) => {
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

    // Check if a chart is already saved
    const isChartSaved = (resultId) => {
        return savedCharts.some(chart => chart.originalId === resultId);
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
                            <PieChartComponent data={result.resultData.or} colors={COLORS} />
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
                                        h1: ({ node, ...props }) => <h1 className="text-l font-bold my-0" {...props} />,
                                        h2: ({ node, ...props }) => <h2 className="text-l font-bold my-0" {...props} />,
                                        h3: ({ node, ...props }) => <h3 className="text-base font-semibold my-2" {...props} />,
                                        p: ({ node, ...props }) => <p className="my-2" {...props} />,
                                        ul: ({ node, ...props }) => <ul className="list-disc pl-5 my-2" {...props} />,
                                        ol: ({ node, ...props }) => <ol className="list-decimal pl-5 my-2" {...props} />,
                                        li: ({ node, ...props }) => <li className="ml-2" {...props} />
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
});

const Ask = () => {
    const { allResults, setAllResults, savedCharts, setSavedCharts, displayMode, setDisplayMode, languageOptions, setLanguageOptions, uploadedFileData } = useData();
    const [darkMode, setDarkMode] = useState(false); // Or get from context, etc.
    const navigate = useNavigate();
    const [message, setMessage] = useState('');
    const [isProcessing, setIsProcessing] = useState(false);
    const [inputDisabled, setInputDisabled] = useState(false); // Enable input on /ask page
    const [isUploading, setIsUploading] = useState(false);

    const COLORS = useMemo(() => ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d', '#ffc658', '#8dd1e1', '#a4de6c', '#d0ed57'], []);

    const toggleDarkMode = useCallback(() => {
        setDarkMode(prevMode => !prevMode);
    }, []);

    const handleLanguageOptions = useCallback((options) => {
        setLanguageOptions(options);
    }, [setLanguageOptions]);

    // New function to fetch summary - memoized to prevent recreating on each render
    const fetchSummary = useCallback(async (question, resultData) => {
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
    }, [languageOptions]);

    const handleSubmit = useCallback(async (e) => {
        e.preventDefault();

        if (message.trim()) {
            setIsProcessing(true);

            try {
                // Create FormData object for the API call
                const formData = new FormData();
                formData.append('question', message);
                formData.append('session_id', 'session123');
                formData.append('language', languageOptions);
                console.log(formData)
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

                // No need to navigate, just stay on the page
            } catch (error) {
                console.error('Error processing query:', error);
                // Handle error as needed
            } finally {
                setIsProcessing(false);
                setMessage(''); // Clear the input
            }
        }
    }, [message, languageOptions, fetchSummary, displayMode, setAllResults]);

    const handleFileChange = useCallback(() => {
        // implement this logic
    }, []);

    // Memoized function to save chart to dashboard
    const saveChartToDashboard = useCallback((result) => {
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
    }, [displayMode, setSavedCharts]);

    // Memoized input area props for better performance
    const inputAreaProps = useMemo(() => ({
        darkMode,
        message,
        setMessage,
        inputDisabled,
        isProcessing,
        handleSubmit,
        handleFileChange,
        uploadedFileData,
        isUploading,
        onLanguageOptions: handleLanguageOptions,
        customClasses: {
            container: `${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} shadow-lg`,
            input: `${darkMode ? 'bg-gray-700 border-gray-600 focus:border-indigo-500' : 'bg-gray-50 border-gray-300 focus:border-indigo-500'} focus:ring-2 focus:ring-indigo-500/20`,
            button: `${darkMode ? 'bg-indigo-600 hover:bg-indigo-700' : 'bg-indigo-500 hover:bg-indigo-600'} shadow-md`
        }
    }), [darkMode, message, inputDisabled, isProcessing, handleSubmit, handleFileChange, uploadedFileData, isUploading, handleLanguageOptions]);

    return (
        <div className={`flex flex-col h-screen transition-colors duration-300 ${darkMode ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-800'}`}>
            <Navbar
                darkMode={darkMode}
                toggleDarkMode={toggleDarkMode}
                savedCharts={savedCharts}
            />

            <main className="flex-1 overflow-auto p-4">
                <div className="max-w-8xl mx-auto space-y-4">
                    {allResults.map((result) => (
                        <ResultItem 
                            key={result.id}
                            result={result}
                            displayMode={displayMode}
                            darkMode={darkMode}
                            saveChartToDashboard={saveChartToDashboard}
                            setDisplayMode={setDisplayMode}
                            savedCharts={savedCharts}
                            COLORS={COLORS}
                        />
                    ))}
                </div>
            </main>
            <InputArea {...inputAreaProps} />
        </div>
    );
};

export default Ask;