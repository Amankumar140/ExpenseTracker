import { useState } from 'react';
import { uploadReceipt } from '../services/api';
import { useTheme } from '../context/ThemeContext';

const UploadReceipt = ({ onUploadSuccess }) => {
  const { isDark } = useTheme();
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState(null);
  const [dragActive, setDragActive] = useState(false);
  const [uploadStage, setUploadStage] = useState('idle'); // idle, uploading, scanning, categorizing, done

  const handleFileChange = (selectedFile) => {
    if (selectedFile && selectedFile.type.startsWith('image/')) {
      setFile(selectedFile);
      setError(null);
      
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result);
      };
      reader.readAsDataURL(selectedFile);
    } else {
      setError('Please select a valid image file');
    }
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileChange(e.dataTransfer.files[0]);
    }
  };

  const formatSize = (bytes) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / 1048576).toFixed(1) + ' MB';
  };

  const handleUpload = async () => {
    if (!file) {
      setError('Please select a file first');
      return;
    }

    setUploading(true);
    setError(null);
    setProgress(0);
    setUploadStage('uploading');

    try {
      const result = await uploadReceipt(file, (percent) => {
        setProgress(percent);
        if (percent >= 100) {
          setUploadStage('scanning');
          setTimeout(() => setUploadStage('categorizing'), 800);
        }
      });
      
      setUploadStage('done');
      setTimeout(() => {
        setFile(null);
        setPreview(null);
        setProgress(0);
        setUploadStage('idle');
        
        if (onUploadSuccess) {
          onUploadSuccess(result.expense);
        }
      }, 1200);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to upload receipt');
      setUploadStage('idle');
      console.error('Upload error:', err);
    } finally {
      setUploading(false);
    }
  };

  const stages = [
    { id: 'uploading', label: 'Uploading', icon: '📤' },
    { id: 'scanning', label: 'Scanning OCR', icon: '🔍' },
    { id: 'categorizing', label: 'Categorizing', icon: '🏷️' },
    { id: 'done', label: 'Complete', icon: '✅' },
  ];

  const getStageIndex = () => stages.findIndex(s => s.id === uploadStage);

  return (
    <div className={`rounded-2xl shadow-sm p-5 sm:p-7 transition-all duration-300 animate-scale-in ${isDark ? 'bg-slate-800/50 border border-slate-700/50' : 'bg-white/80 border border-slate-200/50'}`}>
      <div className="flex items-center gap-3 mb-5">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center shadow-lg shadow-indigo-500/20">
          <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
          </svg>
        </div>
        <div>
          <h2 className={`text-xl font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>Upload Receipt</h2>
          <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Drag & drop or click to upload</p>
        </div>
      </div>
      
      {/* Upload Zone */}
      <div
        className={`relative rounded-2xl p-6 sm:p-10 text-center transition-all duration-300 cursor-pointer ${
          dragActive 
            ? 'gradient-border-animated scale-[1.01]'
            : 'border-2 border-dashed'
        } ${
          dragActive
            ? isDark ? 'bg-indigo-950/30' : 'bg-indigo-50/50'
            : isDark ? 'border-slate-600 hover:border-indigo-500/50 hover:bg-slate-700/30' : 'border-slate-300 hover:border-indigo-400/50 hover:bg-indigo-50/30'
        }`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onClick={() => !preview && document.getElementById('file-upload').click()}
      >
        {preview ? (
          <div className="space-y-4 animate-scale-in">
            <div className={`inline-block rounded-xl overflow-hidden shadow-xl ${isDark ? 'ring-1 ring-slate-700' : 'ring-1 ring-slate-200'}`}>
              <img 
                src={preview} 
                alt="Receipt preview" 
                className="max-h-48 sm:max-h-64 object-contain"
              />
            </div>
            <div className={`flex items-center justify-center gap-3 text-sm ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
              <span className="font-medium">{file?.name}</span>
              <span className={`px-2 py-0.5 rounded-full text-xs ${isDark ? 'bg-slate-700 text-slate-400' : 'bg-slate-100 text-slate-500'}`}>
                {formatSize(file?.size)}
              </span>
            </div>
            <button
              onClick={(e) => {
                e.stopPropagation();
                setFile(null);
                setPreview(null);
              }}
              className="text-red-500 hover:text-red-600 text-sm font-semibold transition-colors flex items-center gap-1.5 mx-auto"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
              Remove
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            <div className={`mx-auto w-16 h-16 rounded-2xl flex items-center justify-center animate-bounce-subtle ${isDark ? 'bg-gradient-to-br from-indigo-900/50 to-purple-900/50' : 'bg-gradient-to-br from-indigo-100 to-purple-100'}`}>
              <svg
                className={`h-8 w-8 ${isDark ? 'text-indigo-400' : 'text-indigo-500'}`}
                stroke="currentColor"
                fill="none"
                viewBox="0 0 48 48"
              >
                <path
                  d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                  strokeWidth={2}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
            <div>
              <label htmlFor="file-upload" className="cursor-pointer">
                <span className={`text-base font-semibold ${isDark ? 'text-indigo-400 hover:text-indigo-300' : 'text-indigo-600 hover:text-indigo-700'}`}>
                  Click to upload
                </span>
                <span className={isDark ? 'text-slate-400' : 'text-slate-500'}> or drag and drop</span>
              </label>
              <input
                id="file-upload"
                type="file"
                className="hidden"
                accept="image/*"
                onChange={(e) => handleFileChange(e.target.files[0])}
              />
            </div>
            <p className={`text-xs ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>PNG, JPG, GIF up to 10MB</p>
          </div>
        )}
      </div>

      {/* Error */}
      {error && (
        <div className={`mt-4 p-3.5 rounded-xl text-sm flex items-center gap-2.5 animate-slide-up ${isDark ? 'bg-red-500/10 border border-red-500/20 text-red-400' : 'bg-red-50 border border-red-200 text-red-700'}`}>
          <svg className="w-5 h-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          {error}
        </div>
      )}

      {/* Upload Progress - Multi-Step */}
      {uploading && (
        <div className="mt-5 animate-slide-up">
          {/* Steps */}
          <div className="flex justify-between mb-4">
            {stages.map((stage, i) => (
              <div key={stage.id} className="flex flex-col items-center flex-1">
                <div className={`w-9 h-9 rounded-full flex items-center justify-center text-sm transition-all duration-500 ${
                  i <= getStageIndex()
                    ? 'bg-gradient-to-r from-indigo-500 to-purple-500 text-white shadow-lg shadow-indigo-500/30 scale-110'
                    : isDark ? 'bg-slate-700 text-slate-500' : 'bg-slate-200 text-slate-400'
                }`}>
                  {stage.icon}
                </div>
                <span className={`text-xs mt-1.5 font-medium ${i <= getStageIndex() ? (isDark ? 'text-indigo-400' : 'text-indigo-600') : (isDark ? 'text-slate-500' : 'text-slate-400')}`}>
                  {stage.label}
                </span>
              </div>
            ))}
          </div>
          
          {/* Progress Bar */}
          <div className={`w-full rounded-full h-2 overflow-hidden ${isDark ? 'bg-slate-700' : 'bg-slate-200'}`}>
            <div
              className="bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 h-2 rounded-full transition-all duration-500 progress-stripe"
              style={{ width: `${Math.max(progress, (getStageIndex() + 1) * 25)}%` }}
            ></div>
          </div>
          <p className={`text-xs mt-2 text-center font-medium ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
            {uploadStage === 'uploading' && `Uploading... ${progress}%`}
            {uploadStage === 'scanning' && 'Scanning receipt with OCR...'}
            {uploadStage === 'categorizing' && 'AI categorizing expense...'}
            {uploadStage === 'done' && '✨ Receipt processed successfully!'}
          </p>
        </div>
      )}

      {/* Upload Button */}
      <button
        onClick={handleUpload}
        disabled={!file || uploading}
        className={`mt-5 w-full py-3.5 px-6 rounded-xl font-semibold transition-all duration-300 text-sm ${
          !file || uploading 
            ? isDark ? 'bg-slate-700/50 text-slate-500 cursor-not-allowed' : 'bg-slate-200 text-slate-400 cursor-not-allowed' 
            : 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg shadow-indigo-500/25 hover:shadow-xl hover:shadow-indigo-500/30 hover:scale-[1.02] active:scale-[0.98]'
        }`}
      >
        {uploading ? (
          <span className="flex items-center justify-center gap-2">
            <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Processing...
          </span>
        ) : (
          <span className="flex items-center justify-center gap-2">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
            </svg>
            Upload & Process Receipt
          </span>
        )}
      </button>
    </div>
  );
};

export default UploadReceipt;
