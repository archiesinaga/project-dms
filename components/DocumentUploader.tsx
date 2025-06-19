'use client';
import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useDropzone } from "react-dropzone";
import { Upload, File, X, CheckCircle } from "lucide-react";
import { useNotification } from "@/components/NotificationContext";
import { useSession } from "next-auth/react";
import { useRoleCheck } from '@/lib/useRoleCheck';
import { toast } from "react-hot-toast";

export default function DocumentUploader() {
  const { data: session } = useSession();
  const { canUploadDocuments } = useRoleCheck();
  const [file, setFile] = useState<File | null>(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState<"DRAFTED" | "SUBMITTED">("DRAFTED");
  const [loading, setLoading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error('File size must be less than 5MB');
        return;
      }
      setFile(file);
      toast.success('File selected successfully');
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'application/msword': ['.doc'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx']
    },
    maxFiles: 1
  });

  if (!canUploadDocuments) {
    return (
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center py-8"
      >
        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-6">
          <div className="w-16 h-16 mx-auto mb-4 bg-yellow-100 rounded-full flex items-center justify-center">
            <X className="w-8 h-8 text-yellow-600" />
          </div>
          <h3 className="text-lg font-semibold text-yellow-800 mb-2">
            Upload Permission Required
          </h3>
          <p className="text-yellow-700">
            You don't have permission to upload documents. Only Admin users can upload documents.
          </p>
        </div>
      </motion.div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!file || !title) {
      toast.error("Please fill in all required fields");
      return;
    }

    setLoading(true);
    setUploadProgress(0);

    const formData = new FormData();
    formData.append("file", file);
    formData.append("title", title);
    formData.append("description", description);
    formData.append("status", status);

    try {
      // Simulate upload progress
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + 10;
        });
      }, 100);

      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      clearInterval(progressInterval);
      setUploadProgress(100);

      if (res.ok) {
        const statusText = status === "DRAFTED" ? "saved as draft" : "uploaded";
        toast.success(`Document successfully ${statusText}!`);
        setFile(null);
        setTitle("");
        setDescription("");
        setStatus("DRAFTED");
        setUploadProgress(0);
        
        // Trigger page reload to refresh document list
        setTimeout(() => window.location.reload(), 1000);
      } else {
        const errorData = await res.json();
        toast.error(errorData.error || "Failed to upload document");
      }
    } catch (err) {
      console.error("Error uploading document:", err);
      toast.error("An error occurred during upload. Please try again.");
    } finally {
      setLoading(false);
      setUploadProgress(0);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-2xl mx-auto p-6 bg-white rounded-xl shadow-lg border border-gray-200"
    >
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
          <Upload className="w-5 h-5 text-blue-600" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900">Upload Document</h2>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* File Upload Area */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Document File
          </label>
          <div
            {...getRootProps()}
            className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all duration-200 ${
              isDragActive
                ? 'border-blue-500 bg-blue-50'
                : 'border-gray-300 hover:border-gray-400'
            }`}
          >
            <input {...getInputProps()} />
            <AnimatePresence>
              {file ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="flex items-center justify-center gap-3"
                >
                  <File className="w-8 h-8 text-green-600" />
                  <div className="text-left">
                    <p className="font-medium text-gray-900">{file.name}</p>
                    <p className="text-sm text-gray-500">
                      {(file.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setFile(null);
                    }}
                    className="p-1 text-gray-400 hover:text-red-500 transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </motion.div>
              ) : (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="space-y-3"
                >
                  <Upload className="w-12 h-12 mx-auto text-gray-400" />
                  <div>
                    <p className="text-lg font-medium text-gray-900">
                      {isDragActive ? 'Drop the file here' : 'Drag & drop a file here'}
                    </p>
                    <p className="text-sm text-gray-500">
                      or click to browse (PDF, DOC, DOCX - Max 5MB)
                    </p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Form Fields */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Document Title *
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-gray-900 transition-all duration-200"
              placeholder="Enter document title"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Document Status
            </label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as "DRAFTED" | "SUBMITTED")}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-gray-900 transition-all duration-200"
            >
              <option value="DRAFTED">Save as Draft</option>
              <option value="SUBMITTED">Submit for Approval</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Description
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={4}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-gray-900 transition-all duration-200 resize-none"
            placeholder="Enter document description (optional)"
          />
        </div>

        {/* Upload Progress */}
        {loading && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="space-y-2"
          >
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">Uploading...</span>
              <span className="text-gray-900 font-medium">{uploadProgress}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <motion.div
                className="bg-blue-600 h-2 rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${uploadProgress}%` }}
                transition={{ duration: 0.3 }}
              />
            </div>
          </motion.div>
        )}

        <button
          type="submit"
          disabled={loading || !file || !title}
          className="w-full bg-blue-600 text-white font-semibold py-3 px-6 rounded-lg shadow-lg transition-all duration-200 hover:bg-blue-700 hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2 disabled:bg-gray-400 disabled:cursor-not-allowed disabled:shadow-none flex items-center justify-center gap-2"
        >
          {loading ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              Uploading...
            </>
          ) : (
            <>
              <CheckCircle className="w-4 h-4" />
              {status === "DRAFTED" ? "Save as Draft" : "Submit Document"}
            </>
          )}
        </button>
      </form>
    </motion.div>
  );
}