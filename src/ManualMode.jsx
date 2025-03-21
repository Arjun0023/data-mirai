import React, { useState, useRef } from 'react';
import { AgGridReact } from 'ag-grid-react';
import { read, utils } from 'xlsx';

// Import AG Grid styles
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
  PaginationModule
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
  QuickFilterModule
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
  DateFilterModule,
  TextFilterModule,
  CheckboxEditorModule,
  ColumnApiModule,
  NumberEditorModule,
  DateEditorModule,
  RowApiModule,
  PaginationModule,
  
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

const ManualMode = () => {
  const [rowData, setRowData] = useState([]);
  const [columnDefs, setColumnDefs] = useState([]);
  const [gridApi, setGridApi] = useState(null);
  const [gridColumnApi, setGridColumnApi] = useState(null);
  const [isFileUploaded, setIsFileUploaded] = useState(false);
  const fileInput = useRef(null);

  const onGridReady = (params) => {
    setGridApi(params.api);
    setGridColumnApi(params.columnApi);
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    
    if (!file) return;

    const reader = new FileReader();
    
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
        
        // Create column definitions from headers
        const columnDefs = headers.map(header => ({
          headerName: header,
          field: header.toString(),
          sortable: true,
          filter: true,
          resizable: true
        }));
        
        // Transform remaining rows to row data
        const rows = [];
        for (let i = 1; i < jsonData.length; i++) {
          const row = {};
          for (let j = 0; j < headers.length; j++) {
            row[headers[j]] = jsonData[i][j];
          }
          rows.push(row);
        }
        
        setColumnDefs(columnDefs);
        setRowData(rows);
        setIsFileUploaded(true);
      }
    };
    
    reader.readAsArrayBuffer(file);
  };

  const defaultColDef = {
    flex: 1,
    minWidth: 100,
    filter: true,
    sortable: true,
    resizable: true,
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Manual Mode</h1>
      
      <div className="mb-6">
        <input
          type="file"
          ref={fileInput}
          onChange={handleFileUpload}
          accept=".csv, .xlsx, .xls"
          className="block w-full text-sm text-gray-500
            file:mr-4 file:py-2 file:px-4
            file:rounded-full file:border-0
            file:text-sm file:font-semibold
            file:bg-blue-50 file:text-blue-700
            hover:file:bg-blue-100"
        />
        <p className="mt-1 text-sm text-gray-500">
          Upload a CSV or Excel file to generate the grid
        </p>
      </div>
      
      {isFileUploaded && (
        <div 
          className="ag-theme-alpine" 
          style={{ height: '600px', width: '100%' }}
        >
          <AgGridReact
            rowData={rowData}
            columnDefs={columnDefs}
            defaultColDef={defaultColDef}
            onGridReady={onGridReady}
            rowModelType="clientSide"
            enableRangeSelection={true}
            enableCharts={true}
            enablePivot={true}
            rowGroupPanelShow="always"
            sideBar={true}
            pagination={true}
            paginationPageSize={100}
          />
        </div>
      )}
    </div>
  );
};

export default ManualMode;