'use client';
import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Filter, Download, Eye, Edit, Trash2, CheckCircle, XCircle } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "react-query";
import { Document, DocumentStatus } from '@/types/prisma';
import { useRoleCheck } from '@/lib/useRoleCheck';
import { toast } from "react-hot-toast";
import { formatDistanceToNow } from "date-fns";
import DeleteButton from './DeleteButton';
import EditDocument from './EditDocument';

// Fetch documents function
const fetchDocuments = async (filters: {
  status: string;
  uploader: string;
  date: string;
  fileType: string;
  search: string;
}): Promise<Document[]> => {
  try {
    const params = new URLSearchParams();
    if (filters.status) params.append('status', filters.status);
    if (filters.uploader) params.append('uploader', filters.uploader);
    if (filters.date) params.append('date', filters.date);
    if (filters.fileType) params.append('fileType', filters.fileType);
    if (filters.search) params.append('search', filters.search);
    
    const res = await fetch(`/api/documents?${params.toString()}`);
    if (!res.ok) {
      throw new Error('Failed to fetch documents');
    }
    return res.json();
  } catch (error) {
    console.error('Error fetching documents:', error);
    return [];
  }
};

// Helper function to get file type label
const getFileTypeLabel = (fileType?: string): string => {
  switch (fileType) {
    case 'application/pdf':
      return 'PDF';
    case 'application/msword':
      return 'DOC';
    case 'application/vnd.openxmlformats-officedocument.wordprocessingml.document':
      return 'DOCX';
    case 'application/vnd.ms-excel':
      return 'XLS';
    case 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet':
      return 'XLSX';
    case 'text/plain':
      return 'TXT';
    default:
      return 'Unknown';
  }
};

// Helper function to format date
const formatDate = (date: string | Date): string => {
  try {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    return formatDistanceToNow(dateObj, { addSuffix: true });
  } catch (error) {
    return 'Unknown date';
  }
};

// Helper function to format file size
const formatFileSize = (bytes?: number): string => {
  if (!bytes) return 'Unknown size';
  
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
};

export default function DocumentList() {
  const [filters, setFilters] = useState({
    status: '',
    uploader: '',
    date: '',
    fileType: '',
    search: ''
  });
  
  const { isAdmin, isManager, isStandardization, canEditDocuments, canDeleteDocuments } = useRoleCheck();
  const queryClient = useQueryClient();

  // React Query untuk data fetching
  const { data: documents = [], isLoading, error } = useQuery(
    ['documents', filters],
    () => fetchDocuments(filters),
    {
      staleTime: 30000,
      refetchOnWindowFocus: false
    }
  );

  const approvalMutation = useMutation(
    (data: { documentId: string; status: DocumentStatus; comment: string }) =>
      fetch(`/api/documents/${data.documentId}/approve`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      }),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['documents']);
        toast.success('Document status updated successfully');
      },
      onError: () => {
        toast.error('Failed to update document status');
      }
    }
  );

  const filteredDocuments = useMemo(() => {
    return documents.filter((doc: Document) => {
      if (filters.search && !doc.title.toLowerCase().includes(filters.search.toLowerCase())) return false;
      if (filters.status && doc.status !== filters.status) return false;
      if (filters.fileType && doc.fileType !== filters.fileType) return false;
      if (filters.uploader && doc.creator?.name && !doc.creator.name.toLowerCase().includes(filters.uploader.toLowerCase())) return false;
      if (filters.date) {
        const docDate = new Date(doc.uploadedAt).toISOString().split('T')[0];
        if (docDate !== filters.date) return false;
      }
      return true;
    });
  }, [documents, filters]);

  const handleEditSuccess = () => {
    queryClient.invalidateQueries(['documents']);
  };

  const handleDeleteSuccess = () => {
    queryClient.invalidateQueries(['documents']);
  };

  const clearFilters = () => {
    setFilters({
      status: '',
      uploader: '',
      date: '',
      fileType: '',
      search: ''
    });
  };

  if (error) {
    return (
      <div className="text-center py-12">
        <div className="w-16 h-16 mx-auto mb-4 bg-red-100 rounded-full flex items-center justify-center">
          <XCircle className="w-8 h-8 text-red-600" />
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">Error loading documents</h3>
        <p className="text-gray-500 mb-4">Failed to load documents. Please try again.</p>
        <button 
          onClick={() => queryClient.invalidateQueries(['documents'])}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Enhanced Filter Section */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-xl shadow-lg border border-gray-200 p-6"
      >
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Filter className="w-5 h-5 text-gray-500" />
            <h3 className="text-lg font-semibold text-gray-900">Advanced Filters</h3>
          </div>
          <button
            onClick={clearFilters}
            className="text-sm text-gray-500 hover:text-gray-700 transition-colors"
          >
            Clear all
          </button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search documents..."
              value={filters.search}
              onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg bg-white text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          
          <select
            value={filters.status}
            onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
            className="px-4 py-2 border border-gray-300 rounded-lg bg-white text-gray-900 focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All Status</option>
            <option value="DRAFTED">Drafted</option>
            <option value="SUBMITTED">Submitted</option>
            <option value="PENDING">Pending</option>
            <option value="APPROVED">Approved</option>
            <option value="REJECTED">Rejected</option>
          </select>

          <input
            type="text"
            placeholder="Search by uploader..."
            value={filters.uploader}
            onChange={(e) => setFilters(prev => ({ ...prev, uploader: e.target.value }))}
            className="px-4 py-2 border border-gray-300 rounded-lg bg-white text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />

          <input
            type="date"
            value={filters.date}
            onChange={(e) => setFilters(prev => ({ ...prev, date: e.target.value }))}
            className="px-4 py-2 border border-gray-300 rounded-lg bg-white text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />

          <select
            value={filters.fileType}
            onChange={(e) => setFilters(prev => ({ ...prev, fileType: e.target.value }))}
            className="px-4 py-2 border border-gray-300 rounded-lg bg-white text-gray-900 focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All Types</option>
            <option value="application/pdf">PDF</option>
            <option value="application/msword">DOC</option>
            <option value="application/vnd.openxmlformats-officedocument.wordprocessingml.document">DOCX</option>
            <option value="application/vnd.ms-excel">XLS</option>
            <option value="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet">XLSX</option>
            <option value="text/plain">TXT</option>
          </select>
        </div>
      </motion.div>

      {/* Results Summary */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-600">
          Showing {filteredDocuments.length} of {documents.length} documents
        </p>
        {Object.values(filters).some(filter => filter !== '') && (
          <p className="text-sm text-blue-600">
            Filters applied
          </p>
        )}
      </div>

      {/* Document Grid */}
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      ) : filteredDocuments.length === 0 ? (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-16"
        >
          <div className="w-24 h-24 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
            <Search className="w-12 h-12 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No documents found</h3>
          <p className="text-gray-500 mb-4">
            {Object.values(filters).some(filter => filter !== '') 
              ? 'Try adjusting your search or filter criteria' 
              : 'No documents have been uploaded yet'
            }
          </p>
          {Object.values(filters).some(filter => filter !== '') && (
            <button
              onClick={clearFilters}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Clear filters
            </button>
          )}
        </motion.div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <AnimatePresence>
            {filteredDocuments.map((doc: Document, index: number) => (
              <motion.div
                key={doc.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ delay: index * 0.1 }}
                className="bg-white rounded-xl shadow-lg border border-gray-200 p-6 hover:shadow-xl transition-all duration-300"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2">
                      {doc.title}
                    </h3>
                    <p className="text-sm text-gray-600 line-clamp-2">
                      {doc.description}
                    </p>
                  </div>
                  <DocumentStatusBadge status={doc.status} />
                </div>
                
                <div className="flex items-center gap-2 mb-4">
                  <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                    v{doc.version}
                  </span>
                  <span className="text-xs bg-purple-100 text-purple-800 px-2 py-1 rounded-full">
                    {getFileTypeLabel(doc.fileType)}
                  </span>
                  {doc.fileSize && (
                    <span className="text-xs bg-gray-100 text-gray-800 px-2 py-1 rounded-full">
                      {formatFileSize(doc.fileSize)}
                    </span>
                  )}
                </div>
                
                <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                  <span>By {doc.creator?.name || 'Unknown'}</span>
                  <span>{formatDate(doc.uploadedAt)}</span>
                </div>
                
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => window.open(`/uploads/${doc.filePath}`, '_blank')}
                    className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    <Eye className="w-4 h-4" />
                    View
                  </button>
                  
                  {canEditDocuments && (
                    <EditDocument 
                      id={doc.id}
                      currentTitle={doc.title}
                      currentDescription={doc.description}
                      onSuccess={handleEditSuccess}
                    />
                  )}
                  
                  {canDeleteDocuments && (
                    <DeleteButton 
                      id={doc.id}
                      variant="icon"
                      onSuccess={handleDeleteSuccess}
                      className="p-2 text-gray-600 hover:text-red-600 transition-colors"
                    />
                  )}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}

// Helper components
const DocumentStatusBadge = ({ status }: { status: DocumentStatus }) => {
  const statusConfig = {
    DRAFTED: { color: 'bg-gray-100 text-gray-800', icon: null },
    SUBMITTED: { color: 'bg-blue-100 text-blue-800', icon: null },
    PENDING: { color: 'bg-yellow-100 text-yellow-800', icon: null },
    APPROVED: { color: 'bg-green-100 text-green-800', icon: CheckCircle },
    REJECTED: { color: 'bg-red-100 text-red-800', icon: XCircle }
  };
  
  const config = statusConfig[status];
  const Icon = config.icon;
  
  return (
    <span className={`px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1 ${config.color}`}>
      {Icon && <Icon className="w-3 h-3" />}
      {status}
    </span>
  );
};