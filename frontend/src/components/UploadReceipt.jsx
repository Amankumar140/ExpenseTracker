import { useState } from 'react';
import { uploadReceipt } from '../services/api';
import Button from './ui/Button';
import Card from './ui/Card';
import {
  UploadCloud,
  FileText,
  Trash2,
  AlertCircle,
  CheckCircle2,
  Search,
  Tag,
  Check
} from 'lucide-react';

const UploadReceipt = ({ onUploadSuccess }) => {
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
      setError('Please select a valid image file (PNG, JPG, JPEG)');
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
      setError('Please select a receipt image first');
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
      }, 1000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to upload receipt');
      setUploadStage('idle');
      console.error('Upload error:', err);
    } finally {
      setUploading(false);
    }
  };

  const stages = [
    { id: 'uploading', label: 'Uploading', icon: <UploadCloud size={16} strokeWidth={2.5} /> },
    { id: 'scanning', label: 'Scanning OCR', icon: <Search size={16} strokeWidth={2.5} /> },
    { id: 'categorizing', label: 'Categorizing', icon: <Tag size={16} strokeWidth={2.5} /> },
    { id: 'done', label: 'Complete', icon: <Check size={16} strokeWidth={2.5} /> },
  ];

  const getStageIndex = () => stages.findIndex(s => s.id === uploadStage);

  return (
    <Card color="white" padding="default" className="border-2 border-gray-100">
      {/* Header */}
      <div className="flex items-center gap-3.5 mb-6">
        <div className="w-12 h-12 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center flex-shrink-0">
          <UploadCloud size={24} strokeWidth={2.5} />
        </div>
        <div>
          <h2 className="text-xl font-extrabold text-gray-900 tracking-tight">
            Upload & Process Receipt
          </h2>
          <p className="text-xs text-gray-500 font-medium uppercase tracking-wider">
            Drag & drop or browse image files
          </p>
        </div>
      </div>

      {/* Upload Drop Zone - Flat Design */}
      <div
        className={`relative rounded-lg p-6 sm:p-12 text-center transition-colors duration-200 cursor-pointer ${
          dragActive
            ? 'bg-blue-100 border-2 border-blue-500 scale-[1.01]'
            : 'bg-gray-100 border-2 border-dashed border-gray-300 hover:border-blue-500 hover:bg-blue-50/50'
        }`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onClick={() => !preview && document.getElementById('file-upload').click()}
      >
        {preview ? (
          <div className="space-y-4">
            <div className="inline-block rounded-md overflow-hidden border-2 border-gray-300 bg-white p-2">
              <img
                src={preview}
                alt="Receipt preview"
                className="max-h-56 sm:max-h-72 object-contain mx-auto rounded"
              />
            </div>
            <div className="flex items-center justify-center gap-3 text-sm text-gray-700">
              <span className="font-bold">{file?.name}</span>
              <span className="px-2 py-0.5 rounded bg-gray-200 text-gray-800 text-xs font-semibold">
                {formatSize(file?.size)}
              </span>
            </div>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setFile(null);
                setPreview(null);
              }}
              className="text-red-600 hover:text-red-700 text-sm font-bold inline-flex items-center gap-1.5 transition-colors"
            >
              <Trash2 size={16} strokeWidth={2.5} />
              Remove image
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="mx-auto w-16 h-16 rounded-full bg-white text-blue-500 flex items-center justify-center border-2 border-gray-200">
              <FileText size={32} strokeWidth={2.5} />
            </div>
            <div>
              <p className="text-base font-bold text-gray-900">
                <span className="text-blue-600 hover:underline">Click to upload</span> or drag and drop
              </p>
              <p className="text-xs text-gray-500 font-medium mt-1">PNG, JPG, or JPEG up to 10MB</p>
            </div>
            <input
              id="file-upload"
              type="file"
              className="hidden"
              accept="image/*"
              onChange={(e) => handleFileChange(e.target.files[0])}
            />
          </div>
        )}
      </div>

      {/* Error - Rule 14: rose border-2 + message text + icon */}
      {error && (
        <div className="mt-4 p-4 rounded-md bg-red-50 border-2 border-red-500 text-red-700 text-sm font-semibold flex items-center gap-2.5">
          <AlertCircle size={18} strokeWidth={2.5} className="flex-shrink-0 text-red-600" />
          <span>{error}</span>
        </div>
      )}

      {/* Multi-Step Upload Progress - Flat Treatment */}
      {uploading && (
        <div className="mt-6 p-4 rounded-md bg-gray-100 border-2 border-gray-200">
          <div className="flex justify-between mb-4">
            {stages.map((stage, i) => {
              const active = i <= getStageIndex();
              return (
                <div key={stage.id} className="flex flex-col items-center flex-1">
                  <div
                    className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold transition-colors ${
                      active
                        ? 'bg-blue-500 text-white'
                        : 'bg-gray-300 text-gray-600'
                    }`}
                  >
                    {stage.icon}
                  </div>
                  <span
                    className={`text-xs mt-1.5 font-bold uppercase tracking-wider ${
                      active ? 'text-blue-600' : 'text-gray-500'
                    }`}
                  >
                    {stage.label}
                  </span>
                </div>
              );
            })}
          </div>

          {/* Flat Progress Bar - Solid Color, No Gradients */}
          <div className="w-full rounded-full h-3 bg-gray-200 overflow-hidden">
            <div
              className="bg-blue-500 h-full rounded-full transition-all duration-300"
              style={{ width: `${Math.max(progress, (getStageIndex() + 1) * 25)}%` }}
            ></div>
          </div>
          <p className="text-xs mt-2.5 text-center font-bold text-gray-700 uppercase tracking-wider">
            {uploadStage === 'uploading' && `Uploading receipt... ${progress}%`}
            {uploadStage === 'scanning' && 'Scanning OCR receipt text...'}
            {uploadStage === 'categorizing' && 'Auto-classifying expense category...'}
            {uploadStage === 'done' && 'Receipt processed successfully!'}
          </p>
        </div>
      )}

      {/* Upload Button */}
      <div className="mt-6">
        <Button
          variant="primary"
          size="cta"
          onClick={handleUpload}
          disabled={!file || uploading}
          className="w-full"
        >
          {uploading ? (
            <span className="flex items-center gap-2">
              <span className="w-5 h-5 border-3 border-white border-t-transparent rounded-full animate-spin"></span>
              Processing Receipt...
            </span>
          ) : (
            <span className="flex items-center gap-2">
              <UploadCloud size={20} strokeWidth={2.5} />
              Process Receipt with OCR
            </span>
          )}
        </Button>
      </div>
    </Card>
  );
};

export default UploadReceipt;
