import React, { useState, useRef, useEffect } from 'react';
import { AgGridReact } from 'ag-grid-react';
import { read, utils } from 'xlsx';
import { FileText, Upload, Database, BarChart, HelpCircle, Moon, Sun, ArrowLeft, Download } from 'lucide-react';

// Import AG Grid styles - using only what's needed based on the theme
import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-alpine.css';

// Import AG Grid Community modules
import { 
  ModuleRegistry, 
  ClientSideRowModelModule,
  ValidationModule,
  NumberFilterModule,
  RowSelectionModule,
  HighlightChangesModule,
  CellStyleModule,
  TextEditorModule,
  EventApiModule,
  SelectEditorModule,
  DateFilterModule,
  TextFilterModule,
  CheckboxEditorModule,
  ColumnApiModule,
  NumberEditorModule,
  DateEditorModule,
  RowApiModule,
  PaginationModule,
  RenderApiModule
} from 'ag-grid-community';

// Import AG Grid Enterprise modules
import {
  CellSelectionModule,
  ClipboardModule,
  ColumnMenuModule,
  ContextMenuModule,
  ExcelExportModule,
  IntegratedChartsModule,
  RowGroupingModule,
  ColumnsToolPanelModule,
  PivotModule,
  SetFilterModule,
  RowGroupingPanelModule, 
  QuickFilterModule,
  FiltersToolPanelModule
} from "ag-grid-enterprise";

// Import AG Charts Enterprise module
import { AgChartsEnterpriseModule } from 'ag-charts-enterprise';

import { LicenseManager } from "ag-grid-enterprise";

// Register all AG Grid modules
ModuleRegistry.registerModules([
  // Community modules
  ClientSideRowModelModule,
  ValidationModule,
  NumberFilterModule,
  RowSelectionModule,
  HighlightChangesModule,
  CellStyleModule,
  TextEditorModule,
  EventApiModule,
  SelectEditorModule,
  RenderApiModule,
  DateFilterModule,
  TextFilterModule,
  CheckboxEditorModule,
  ColumnApiModule,
  NumberEditorModule,
  DateEditorModule,
  RowApiModule,
  PaginationModule,
  FiltersToolPanelModule,
  // Enterprise modules
  ClipboardModule,
  ExcelExportModule,
  ColumnMenuModule,
  ContextMenuModule,
  CellSelectionModule,
  IntegratedChartsModule.with(AgChartsEnterpriseModule),
  RowGroupingModule,
  ColumnsToolPanelModule,
  PivotModule,
  SetFilterModule,
  RowGroupingPanelModule, 
  QuickFilterModule
]);

// Set license key
LicenseManager.setLicenseKey("TRIAL]_this_{AG_Charts_and_AG_Grid}_Enterprise_key_{AG-076337}_is_granted_for_evaluation_only___Use_in_production_is_not_permitted___Please_report_misuse_to_legal@ag-grid.com___For_help_with_purchasing_a_production_key_please_contact_info@ag-grid.com___You_are_granted_a_{Single_Application}_Developer_License_for_one_application_only___All_Front-End_JavaScript_developers_working_on_the_application_would_need_to_be_licensed___This_key_will_deactivate_on_{14 March 2025}____[v3]_[0102]_MTc0MTkxMDQwMDAwMA==f7c8723db6b2e4c55a843f86bf24e52d");

const Navbar = ({ darkMode, toggleDarkMode, isFileUploaded, fileDetails, resetFile }) => {
  return (
    <nav className={`px-6 py-3 border-b ${darkMode ? 'bg-gray-900 border-gray-700 text-white' : 'bg-white border-gray-200 text-gray-800'}`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className={`p-2 rounded-lg ${darkMode ? 'bg-indigo-900/40' : 'bg-indigo-100'}`}>
            <Database className={`h-5 w-5 ${darkMode ? 'text-indigo-300' : 'text-indigo-600'}`} />
          </div>
          <h1 className="text-xl font-semibold">Data Explorer</h1>
          
          {isFileUploaded && fileDetails && (
            <div className="flex items-center space-x-2">
              <span className={`text-xs px-2 py-1 rounded-full ${darkMode ? 'bg-gray-800' : 'bg-gray-100'}`}>
                {fileDetails.filename}
              </span>
              <span className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                {fileDetails.rows.toLocaleString()} rows • {fileDetails.columns} columns
              </span>
            </div>
          )}
        </div>
        <div className="flex items-center space-x-4">
          {isFileUploaded && (
            <>
              <button 
                className={`flex items-center space-x-1 text-sm py-1 px-3 rounded-lg ${
                  darkMode 
                    ? 'bg-gray-800 hover:bg-gray-700 text-gray-300' 
                    : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                } transition-colors`}
                onClick={resetFile}
              >
                <ArrowLeft className="h-4 w-4" />
                <span>Upload New</span>
              </button>
              <button 
                className={`flex items-center space-x-1 text-sm py-1 px-3 rounded-lg ${
                  darkMode 
                    ? 'bg-indigo-700 hover:bg-indigo-600 text-white' 
                    : 'bg-indigo-500 hover:bg-indigo-600 text-white'
                } transition-colors`}
              >
                <Download className="h-4 w-4" />
                <span>Export</span>
              </button>
            </>
          )}
          <button 
            className={`p-2 rounded-lg ${darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'} transition-colors`}
            onClick={toggleDarkMode}
            title={darkMode ? "Switch to light mode" : "Switch to dark mode"}
          >
            {darkMode ? <Sun className="h-5 w-5 text-gray-300" /> : <Moon className="h-5 w-5 text-gray-600" />}
          </button>
          <button 
            className={`p-2 rounded-lg ${darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'} transition-colors`}
            title="Help"
          >
            <HelpCircle className={`h-5 w-5 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`} />
          </button>
        </div>
      </div>
    </nav>
  );
};

const InputArea = ({ handleFileUpload, fileInput, darkMode }) => {
  return (
    <div className={`p-6 rounded-xl ${darkMode ? 'bg-gray-800 text-gray-100' : 'bg-white text-gray-800'} shadow-lg border ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
      <div className="flex items-center space-x-3 mb-4">
        <div className={`p-2 rounded-lg ${darkMode ? 'bg-indigo-900/40' : 'bg-indigo-100'}`}>
          <FileText className={`h-5 w-5 ${darkMode ? 'text-indigo-300' : 'text-indigo-600'}`} />
        </div>
        <h2 className="text-lg font-semibold">Upload File</h2>
      </div>
      
      <div className={`border-2 border-dashed rounded-lg p-10 text-center ${darkMode ? 'border-gray-700 bg-gray-900/50' : 'border-gray-200 bg-gray-50'}`}>
        <div className="flex flex-col items-center justify-center">
          <Upload className={`h-16 w-16 mb-4 ${darkMode ? 'text-gray-500' : 'text-gray-400'}`} />
          <p className={`mb-4 text-lg ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>Drag and drop your file here or</p>
          <label 
            htmlFor="file-upload" 
            className={`cursor-pointer px-6 py-3 rounded-md ${
              darkMode 
                ? 'bg-indigo-600 hover:bg-indigo-700 text-white' 
                : 'bg-indigo-500 hover:bg-indigo-600 text-white'
            } transition-colors font-medium`}
          >
            Browse Files
          </label>
          <input
            id="file-upload"
            type="file"
            ref={fileInput}
            onChange={handleFileUpload}
            accept=".csv, .xlsx, .xls"
            className="hidden"
          />
          <p className="mt-4 text-sm text-gray-500">
            Supported formats: CSV, Excel (.xlsx, .xls)
          </p>
        </div>
      </div>
    </div>
  );
};

const ManualMode = () => {
  const [rowData, setRowData] = useState([]);
  const [columnDefs, setColumnDefs] = useState([]);
  const [gridApi, setGridApi] = useState(null);
  const [gridColumnApi, setGridColumnApi] = useState(null);
  const [isFileUploaded, setIsFileUploaded] = useState(false);
  const [fileDetails, setFileDetails] = useState(null);
  const [darkMode, setDarkMode] = useState(false);
  const fileInput = useRef(null);
  const gridWrapperRef = useRef(null);

  const toggleDarkMode = () => {
    setDarkMode(prevMode => !prevMode);
  };

  // Add custom CSS for AG Grid styling
  useEffect(() => {
    const styleElement = document.createElement('style');
    styleElement.id = 'ag-grid-custom-styles';
    styleElement.innerHTML = `
      .ag-theme-alpine, .ag-theme-alpine-dark {
        --ag-font-size: 11px;
        --ag-font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen-Sans, Ubuntu, Cantarell, "Helvetica Neue", sans-serif;
        --ag-cell-horizontal-padding: 5px;
        --ag-row-height: 28px;
        --ag-header-height: 30px;
        --ag-list-item-height: 20px;
        --ag-font-weight: 400;
        --ag-grid-size: 4px;
        --ag-borders: solid 1px;
        --ag-border-color: var(--ag-secondary-border-color);
      }
      
      .ag-theme-alpine {
        --ag-background-color: #fff;
        --ag-foreground-color: #181d1f;
        --ag-border-color: #dde2eb;
        --ag-secondary-border-color: #dde2eb;
        --ag-header-background-color: #f5f7f7;
        --ag-odd-row-background-color: #fcfcfc;
        --ag-header-foreground-color: #181d1f;
        --ag-disabled-foreground-color: rgba(24, 29, 31, 0.5);
        --ag-background-color: #fff;
        --ag-alpine-active-color: #2196f3;
      }
      
      .ag-theme-alpine-dark {
        --ag-background-color: #212529;
        --ag-foreground-color: #fff;
        --ag-border-color: #424242;
        --ag-secondary-border-color: #424242;
        --ag-header-background-color: #282c31;
        --ag-odd-row-background-color: #282c31;
        --ag-header-foreground-color: #fff;
        --ag-disabled-foreground-color: rgba(255, 255, 255, 0.5);
        --ag-alpine-active-color: #2196f3;
      }
      
      /* Header cell styling */
      .ag-header-cell-text {
        font-weight: 500;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }
      
      /* Fix for specific AG Grid components */
      .ag-side-bar .ag-side-buttons, 
      .ag-side-bar .ag-side-button-button, 
      .ag-column-drop, 
      .ag-tab {
        height: auto !important;
      }
    `;
    document.head.appendChild(styleElement);
    
    return () => {
      const element = document.getElementById('ag-grid-custom-styles');
      if (element) {
        document.head.removeChild(element);
      }
    };
  }, []);
  
  // Update the theme based on darkMode
  useEffect(() => {
    if (gridWrapperRef.current) {
      gridWrapperRef.current.classList.remove('ag-theme-alpine', 'ag-theme-alpine-dark');
      gridWrapperRef.current.classList.add(darkMode ? 'ag-theme-alpine-dark' : 'ag-theme-alpine');
      
      // Force refresh the grid if it's ready
      if (gridApi) {
        gridApi.refreshCells({ force: true });
        gridApi.refreshHeader();
        gridApi.redrawRows();
        
        // Give AG Grid a moment to process the theme change
        setTimeout(() => {
          gridApi.sizeColumnsToFit();
        }, 100);
      }
    }
  }, [darkMode, gridApi]);

  const resetFile = () => {
    setIsFileUploaded(false);
    setFileDetails(null);
    setRowData([]);
    setColumnDefs([]);
    if (fileInput.current) {
      fileInput.current.value = "";
    }
  };
//
  const onGridReady = (params) => {
    setGridApi(params.api);
    setGridColumnApi(params.columnApi);
    
    // Set initial sizing
    params.api.sizeColumnsToFit();
    
    // Add resize listener
    window.addEventListener('resize', () => {
      setTimeout(() => {
        params.api.sizeColumnsToFit();
      }, 100);
    });
  };

  // Helper function to guess column type from data
  const guessColumnType = (values) => {
    // Filter out undefined and null values
    const definedValues = values.filter(v => v !== undefined && v !== null && v !== '');
    
    if (definedValues.length === 0) return 'string';
    
    // Check if all values are numbers
    const allNumbers = definedValues.every(v => !isNaN(Number(v)));
    if (allNumbers) return 'number';
    
    // Check if all values are dates (simple check)
    const dateRegex = /^\d{1,4}[-/.]\d{1,2}[-/.]\d{1,4}$|^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/;
    const allDates = definedValues.every(v => typeof v === 'string' && dateRegex.test(v));
    if (allDates) return 'date';
    
    // Default to string
    return 'string';
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    
    if (!file) return;

    const reader = new FileReader();//
    
    reader.onload = (event) => {
      const data = new Uint8Array(event.target.result);
      const workbook = read(data, { type: 'array' });
      
      // Get the first worksheet
      const worksheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[worksheetName];
      
      // Convert to JSON with headers
      const jsonData = utils.sheet_to_json(worksheet, { header: 1 });
      
      if (jsonData.length > 0) {
        // First row as headers
        const headers = jsonData[0];
        
        // Extract sample data to determine column types
        const sampleData = jsonData.slice(1, Math.min(21, jsonData.length)); // Take up to 20 rows for sampling
        
        // Create column definitions from headers with appropriate typing
        const columnDefs = headers.map((header, index) => {
          // Extract sample values for this column
          const sampleValues = sampleData.map(row => row[index]);
          const colType = guessColumnType(sampleValues);
          
          // Base column definition
          const colDef = {
            headerName: header,
            field: header.toString(),
            sortable: true,
            resizable: true,
            autoHeight: false,
            wrapText: false,
            width: 250,
            minWidth: 150,
            enableRowGroup: true,
            enablePivot: true,
            enableValue: colType === 'number', // Only enable value by default for numeric columns
          };
          
          // Add type-specific configurations
          if (colType === 'number') {
            colDef.filter = 'agNumberColumnFilter';
            colDef.valueFormatter = params => {
              if (params.value === undefined || params.value === null) return '';
              return isNaN(params.value) ? params.value : Number(params.value).toLocaleString();
            };
          } else if (colType === 'date') {
            colDef.filter = 'agDateColumnFilter';
          } else {
            colDef.filter = 'agTextColumnFilter';
          }
          
          return colDef;
        });
        
        // Transform remaining rows to row data with appropriate data type conversion
        const rows = [];
        for (let i = 1; i < jsonData.length; i++) {
          const row = {};
          for (let j = 0; j < headers.length; j++) {
            const value = jsonData[i][j];
            const headerKey = headers[j].toString();
            
            // Skip undefined values
            if (value === undefined) continue;
            
            // Convert value based on guessed column type
            const colType = guessColumnType([value]);
            if (colType === 'number' && !isNaN(Number(value))) {
              row[headerKey] = Number(value);
            } else {
              row[headerKey] = value;
            }
          }
          rows.push(row);
        }
        
        setColumnDefs(columnDefs);
        setRowData(rows);
        setIsFileUploaded(true);
        setFileDetails({
          filename: file.name,
          rows: rows.length,
          columns: headers.length
        });
      }
    };
    
    reader.readAsArrayBuffer(file);
  };

  const defaultColDef = {
    flex: 1,
    minWidth: 100,
    sortable: true,
    resizable: true,
    filter: true,
    enableRowGroup: true,
    enablePivot: true,
    enableValue: true, // Enable all columns for value aggregation
  };

  // AG Grid Enterprise specific props
  const autoGroupColumnDef = {
    minWidth: 200,
    cellRendererParams: {
      suppressCount: false, // Show row count
      checkbox: false, // No checkboxes
    },
  };

  return (
    <div className={`min-h-screen flex flex-col ${darkMode ? 'bg-gray-850' : 'bg-gray-100'}`}>
      <Navbar 
        darkMode={darkMode} 
        toggleDarkMode={toggleDarkMode} 
        isFileUploaded={isFileUploaded} 
        fileDetails={fileDetails}
        resetFile={resetFile}
      />
      
      <div className="flex-grow flex flex-col">
        {!isFileUploaded ? (
          <div className="container mx-auto p-6 flex items-center justify-center h-full">
            <div className="w-full max-w-2xl">
              <InputArea 
                handleFileUpload={handleFileUpload} 
                fileInput={fileInput} 
                darkMode={darkMode}
              />
            </div>
          </div>
        ) : (
          <div className="flex-grow flex flex-col">
            <div 
              ref={gridWrapperRef}
              className={darkMode ? 'ag-theme-alpine-dark' : 'ag-theme-alpine'} 
              style={{ height: 'calc(100vh - 120px)', width: '100%' }}
            >
              <AgGridReact
                rowData={rowData}
                columnDefs={columnDefs}
                defaultColDef={defaultColDef}
                autoGroupColumnDef={autoGroupColumnDef}
                onGridReady={onGridReady}
                rowSelection={{ type: 'multiple' }} // Fixed: using object notation
                cellSelection={true} // Fixed: using cellSelection instead of enableRangeSelection
                enableCharts={true}
                groupDisplayType="multipleColumns"
                groupDefaultExpanded={1}
                animateRows={true}
                suppressAggFuncInHeader={true}
                enableCellTextSelection={true}
                ensureDomOrder={true}
                allowContextMenuWithControlKey={true}
                suppressContextMenu={false}
                rowGroupPanelShow="always"
                pivotPanelShow="always"
                // Removed suppressPropertyNamesCheck
                rowHeight={28}
                headerHeight={35}
                theme={darkMode ? 'alpine-dark' : 'alpine'} // Added: explicit theme configuration
                sideBar={{
                  toolPanels: [
                    {
                      id: 'columns',
                      labelDefault: 'Columns',
                      labelKey: 'columns',
                      iconKey: 'columns',
                      toolPanel: 'agColumnsToolPanel',
                    },
                    {
                      id: 'filters',
                      labelDefault: 'Filters',
                      labelKey: 'filters',
                      iconKey: 'filter',
                      toolPanel: 'agFiltersToolPanel',
                    },
                  ],
                  defaultToolPanel: 'columns'
                }}
                // pagination={true}
                // paginationPageSize={100}
                domLayout="normal"
              />
            </div>
            
            <div className={`px-6 py-3 ${darkMode ? 'bg-indigo-900/20 text-indigo-300' : 'bg-indigo-50 text-indigo-700'} border-t ${darkMode ? 'border-indigo-900/50' : 'border-indigo-100'} flex items-center`}>
              <div className={`p-2 rounded-full mr-3 ${darkMode ? 'bg-indigo-800/50' : 'bg-indigo-100'}`}>
                <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 3L20.5 8V16L12 21L3.5 16V8L12 3Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="2"/>
                </svg>
              </div>
              <p className="text-sm">
                Data loaded successfully. Drag columns to the Row Groups or Pivot sections to analyze your data. You can also create charts from your data using the context menu.
              </p>
            </div>
          </div>//
        )}
      </div>
    </div>
  );
};

export default ManualMode;