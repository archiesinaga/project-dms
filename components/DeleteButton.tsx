'use client';
import { useState } from "react";
import { useNotification } from "@/components/NotificationContext";
import { useRoleCheck } from '@/lib/useRoleCheck';
import { Trash2, AlertTriangle } from "lucide-react";
import { motion } from "framer-motion";

interface DeleteButtonProps {
  id: string;
  onSuccess?: () => void;
  documentTitle?: string;
  className?: string;
  variant?: 'default' | 'icon' | 'danger';
}

export default function DeleteButton({ 
  id, 
  onSuccess, 
  documentTitle = 'this document',
  className = '',
  variant = 'default'
}: DeleteButtonProps) {
  const [loading, setLoading] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const notification = useNotification();
  const { canDeleteDocuments } = useRoleCheck();

  const handleDelete = async () => {
    if (!canDeleteDocuments) {
      notification?.notify({ 
        message: "You don't have permission to delete documents.", 
        type: "ERROR" 
      });
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`/api/upload?id=${id}`, {
        method: "DELETE",
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      const data = await res.json();
      
      if (res.ok) {
        notification?.notify({ 
          message: "Document deleted successfully!", 
          type: "SUCCESS" 
        });
        if (onSuccess) onSuccess();
      } else {
        notification?.notify({ 
          message: data.error || "Failed to delete document.", 
          type: "ERROR" 
        });
      }
    } catch (err) {
      console.error('Delete error:', err);
      notification?.notify({ 
        message: "An error occurred while deleting the document.", 
        type: "ERROR" 
      });
    } finally {
      setLoading(false);
      setShowConfirm(false);
    }
  };

  const handleConfirmClick = () => {
    if (variant === 'default') {
      // For default variant, show browser confirm
      if (confirm(`Are you sure you want to delete ${documentTitle}? This action cannot be undone.`)) {
        handleDelete();
      }
    } else {
      // For other variants, show custom confirm dialog
      setShowConfirm(true);
    }
  };

  if (!canDeleteDocuments) {
    return null; // Don't render button if user can't delete
  }

  // Icon variant
  if (variant === 'icon') {
    return (
      <button 
        onClick={handleConfirmClick}
        disabled={loading}
        className={`p-2 text-gray-600 hover:text-red-600 dark:text-gray-400 dark:hover:text-red-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${className}`}
        title="Delete document"
      >
        {loading ? (
          <div className="w-4 h-4 border-2 border-red-600 border-t-transparent rounded-full animate-spin" />
        ) : (
          <Trash2 className="w-4 h-4" />
        )}
      </button>
    );
  }

  // Danger variant
  if (variant === 'danger') {
    return (
      <button 
        onClick={handleConfirmClick}
        disabled={loading}
        className={`bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 focus:ring-2 focus:ring-red-500 focus:ring-offset-2 transition-all duration-200 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center gap-2 ${className}`}
      >
        {loading ? (
          <>
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            Deleting...
          </>
        ) : (
          <>
            <Trash2 className="w-4 h-4" />
            Delete
          </>
        )}
      </button>
    );
  }

  // Default variant
  return (
    <div className="relative">
      <button 
        onClick={handleConfirmClick}
        disabled={loading}
        className={`bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center gap-2 ${className}`}
      >
        {loading ? (
          <>
            <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
            Deleting...
          </>
        ) : (
          <>
            <Trash2 className="w-3 h-3" />
            Delete
          </>
        )}
      </button>

      {/* Custom Confirm Dialog */}
      {showConfirm && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
          onClick={() => setShowConfirm(false)}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="bg-white dark:bg-gray-800 rounded-xl p-6 max-w-md w-full mx-4 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-red-100 dark:bg-red-900 rounded-full flex items-center justify-center">
                <AlertTriangle className="w-5 h-5 text-red-600 dark:text-red-400" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Delete Document
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  This action cannot be undone
                </p>
              </div>
            </div>
            
            <p className="text-gray-700 dark:text-gray-300 mb-6">
              Are you sure you want to delete <span className="font-medium">{documentTitle}</span>? 
              This will permanently remove the document and all its associated data.
            </p>
            
            <div className="flex gap-3">
              <button
                onClick={() => setShowConfirm(false)}
                className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={loading}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Deleting...
                  </>
                ) : (
                  'Delete'
                )}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
}