import React from 'react';
import { X } from 'lucide-react';
import FileInfoDisplay from '../components/containers/uploaded'; // Adjust path if necessary

function FileInfoOverlay({ fileData, darkMode, onClose }) {
  // Prevent closing when clicking inside the content
  const handleContentClick = (e) => {
    e.stopPropagation();
  };

  if (!fileData) return null;

  return (
    // Backdrop
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center p-4 transition-opacity duration-300 ${darkMode ? 'bg-black/70' : 'bg-black/50'}`}
      onClick={onClose} // Close when clicking backdrop
    >
      {/* Content Box */}
      <div
        className={`relative w-full max-w-7xl mx-auto max-h-[90vh] overflow-auto rounded-lg shadow-xl transition-all duration-300 transform scale-100 ${darkMode ? 'bg-gray-800 text-white border border-gray-700' : 'bg-white text-gray-900'}`}
        onClick={handleContentClick} // Prevent backdrop click from triggering
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className={`absolute top-3 right-3 p-1 rounded-full transition-colors z-10 ${darkMode ? 'text-gray-400 hover:bg-gray-700 hover:text-white' : 'text-gray-500 hover:bg-gray-200 hover:text-gray-800'}`}
          aria-label="Close file information"
        >
          <X size={20} />
        </button>

        {/* FileInfoDisplay Content */}
        <div className="p-6 pt-10 overflow-y-auto"> {/* Add padding top to avoid overlap with close button */}
          <FileInfoDisplay
            uploadedFileData={fileData}
            darkMode={darkMode}
            // onQuestionClick={() => {}} // Optional: Decide if you need this functionality here
          />
        </div>
      </div>
    </div>
  );
}

export default FileInfoOverlay;