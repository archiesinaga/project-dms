'use client';
import { useState, useMemo, useCallback, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useNotification } from "./NotificationContext";
import { Search, Filter, Download, Eye, Edit, CheckCircle, XCircle, X, FileText, Image, File } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import DeleteButton from "./DeleteButton";
import EditDocument from "./EditDocument";
import LoadingSpinner from "./LoadingSpinner";
import { useRoleCheck } from "@/lib/useRoleCheck";

// UI Components
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

// Types
enum DocumentStatus {
  DRAFTED = 'DRAFTED',
  SUBMITTED = 'SUBMITTED',
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED'
}

interface DocumentListProps {
  onStatusChange?: (message: string) => void;
  onError?: (message: string) => void;
}

interface Document {
  id: string;
  title: string;
  description: string;
  status: DocumentStatus;
  createdAt: string;
  updatedAt: string;
  filePath: string;
  fileType?: string;
}

type StatusBadgeVariant = "default" | "destructive" | "outline" | "secondary";
type DocumentAction = 'APPROVED' | 'REJECTED';

// File type constants
const FILE_TYPES = {
  PDF: 'application/pdf',
  IMAGE: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'] as const,
  TEXT: ['text/plain', 'text/html', 'text/css', 'text/javascript'] as const,
  OFFICE: [
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'application/vnd.ms-powerpoint',
    'application/vnd.openxmlformats-officedocument.presentationml.presentation'
  ] as const
} as const;

// API functions
const fetchDocuments = async (): Promise<Document[]> => {
  const response = await fetch("/api/documents");
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to fetch documents');
  }
  return response.json();
};

const approveRejectDocument = async ({ documentId, action }: { documentId: string; action: DocumentAction }) => {
  const response = await fetch(`/api/documents/${documentId}/approve`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ status: action })
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to process document');
  }

  return response.json();
};

// Preview Components
const PDFPreview = ({ url }: { url: string }) => {
  const [error, setError] = useState(false);
  
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-[600px] space-y-4">
        <FileText className="h-16 w-16 text-gray-400" />
        <div className="text-center">
          <h3 className="text-lg font-semibold text-gray-900">PDF Preview Error</h3>
          <p className="text-gray-600 mb-4">Unable to load PDF preview</p>
          <Button onClick={() => window.open(url, '_blank')}>
            Open in New Tab
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-full">
      <iframe
        src={url}
        className="w-full h-[600px] border-0 rounded-lg"
        title="PDF Preview"
        onError={() => setError(true)}
        onLoad={() => setError(false)}
      />
    </div>
  );
};

const ImagePreview = ({ url }: { url: string }) => {
  const [error, setError] = useState(false);
  
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-[600px] space-y-4">
        <Image className="h-16 w-16 text-gray-400" />
        <div className="text-center">
          <h3 className="text-lg font-semibold text-gray-900">Image Preview Error</h3>
          <p className="text-gray-600 mb-4">Unable to load image preview</p>
          <Button onClick={() => window.open(url, '_blank')}>
            Open in New Tab
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex justify-center items-center w-full h-full">
      <img
        src={url}
        alt="Document Preview"
        className="max-w-full max-h-[600px] object-contain rounded-lg shadow-lg"
        onError={() => setError(true)}
        onLoad={() => setError(false)}
      />
    </div>
  );
};

const TextPreview = ({ content }: { content: string }) => (
  <div className="w-full h-[600px] overflow-auto">
    <pre className="whitespace-pre-wrap p-4 bg-gray-50 rounded-lg text-sm font-mono">
      {content}
    </pre>
  </div>
);

const OfficePreview = ({ url, title }: { url: string; title: string }) => (
  <div className="flex flex-col items-center justify-center h-[600px] space-y-4">
    <FileText className="h-16 w-16 text-gray-400" />
    <div className="text-center">
      <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
      <p className="text-gray-600 mb-4">This file type cannot be previewed directly</p>
      <Button onClick={() => window.open(url, '_blank')}>
        Open in New Tab
      </Button>
    </div>
  </div>
);

const UnsupportedPreview = ({ fileType }: { fileType: string }) => (
  <div className="flex flex-col items-center justify-center h-[600px] space-y-4">
    <File className="h-16 w-16 text-gray-400" />
    <div className="text-center">
      <h3 className="text-lg font-semibold text-gray-900">Unsupported File Type</h3>
      <p className="text-gray-600 mb-4">Preview is not available for {fileType}</p>
      <p className="text-sm text-gray-500">Please download the file to view it</p>
    </div>
  </div>
);

// Component
export default function DocumentList({ onStatusChange, onError }: DocumentListProps) {
  // Hooks
  const { data: session } = useSession();
  const { addNotification } = useNotification();
  const { isManager, isStandardization } = useRoleCheck();
  const queryClient = useQueryClient();

  // State
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewData, setPreviewData] = useState<{
    url: string;
    title: string;
    fileType: string;
    content?: string;
  } | null>(null);
  const [isLoadingPreview, setIsLoadingPreview] = useState(false);

  // Queries
  const { 
    data: documents = [], 
    isLoading, 
    error, 
    refetch 
  } = useQuery({
    queryKey: ['documents'],
    queryFn: fetchDocuments,
    staleTime: 30000, // 30 seconds
    refetchOnWindowFocus: false,
    retry: 2,
  });

  // Handle success and error effects
  useEffect(() => {
    if (documents.length > 0) {
      onStatusChange?.('Documents loaded successfully');
    }
  }, [documents.length, onStatusChange]);

  useEffect(() => {
    if (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch documents';
      addNotification("Failed to fetch documents", "ERROR");
      onError?.(errorMessage);
    }
  }, [error, addNotification, onError]);

  // Mutations
  const approveRejectMutation = useMutation({
    mutationFn: approveRejectDocument,
    onSuccess: (data, variables) => {
      // Optimistically update the cache
      queryClient.setQueryData(['documents'], (oldData: Document[] | undefined) => {
        if (!oldData) return oldData;
        return oldData.map(doc => 
          doc.id === variables.documentId 
            ? { ...doc, status: variables.action === 'APPROVED' ? DocumentStatus.APPROVED : DocumentStatus.REJECTED }
            : doc
        );
      });

      addNotification(`Document ${variables.action.toLowerCase()} successfully`, "SUCCESS");
      onStatusChange?.(`Document ${variables.action.toLowerCase()} successfully`);
    },
    onError: (error: Error) => {
      const errorMessage = error instanceof Error ? error.message : 'Failed to process document';
      addNotification(errorMessage, "ERROR");
      onError?.(errorMessage);
      // Refetch to get the correct state
      queryClient.invalidateQueries({ queryKey: ['documents'] });
    }
  });

  // File type helpers
  const getFileType = useCallback((fileType?: string): string => {
    if (!fileType) return 'unknown';
    if (fileType === FILE_TYPES.PDF) return 'pdf';
    if (FILE_TYPES.IMAGE.includes(fileType as any)) return 'image';
    if (FILE_TYPES.TEXT.includes(fileType as any)) return 'text';
    if (FILE_TYPES.OFFICE.includes(fileType as any)) return 'office';
    return 'unsupported';
  }, []);

  const canPreview = useCallback((fileType?: string): boolean => {
    const type = getFileType(fileType);
    return ['pdf', 'image', 'text'].includes(type);
  }, [getFileType]);

  // Handlers
  const handleApproveReject = useCallback((documentId: string, action: DocumentAction) => {
    approveRejectMutation.mutate({ documentId, action });
  }, [approveRejectMutation]);

  const handleDownload = useCallback(async (filePath: string, title: string) => {
    try {
      const baseUrl = window.location.origin;
      const normalizedFilePath = filePath.startsWith('/') ? filePath : `/${filePath}`;
      window.open(`${baseUrl}${normalizedFilePath}`, '_blank');
      addNotification(`Downloaded ${title}`, "SUCCESS");
      onStatusChange?.(`Downloaded ${title} successfully`);
    } catch (error) {
      addNotification("Failed to download document", "ERROR");
      onError?.("Failed to download document");
    }
  }, [addNotification, onStatusChange, onError]);

  const handlePreview = useCallback(async (doc: Document) => {
    setIsLoadingPreview(true);
    try {
      const baseUrl = window.location.origin;
      const fileType = getFileType(doc.fileType);
      
      if (!canPreview(doc.fileType)) {
        addNotification('Preview not available for this file type', 'WARNING');
        onError?.('Preview not available for this file type');
        return;
      }

      let previewUrl = '';
      let content = '';

      // Ensure filePath starts with '/'
      const normalizedFilePath = doc.filePath.startsWith('/') ? doc.filePath : `/${doc.filePath}`;

      if (fileType === 'pdf') {
        previewUrl = `${baseUrl}${normalizedFilePath}`;
      } else if (fileType === 'image') {
        previewUrl = `${baseUrl}${normalizedFilePath}`;
      } else if (fileType === 'text') {
        // For text files, fetch the content
        try {
          const response = await fetch(`${baseUrl}${normalizedFilePath}`);
          if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
          }
          content = await response.text();
          previewUrl = `${baseUrl}${normalizedFilePath}`;
        } catch (fetchError) {
          console.error('Error fetching text content:', fetchError);
          addNotification('Failed to load text content. File may not exist or be accessible.', 'ERROR');
          onError?.('Failed to load text content');
          return;
        }
      }

      setPreviewData({
        url: previewUrl,
        title: doc.title,
        fileType: doc.fileType || 'unknown',
        content
      });
      setPreviewOpen(true);
    } catch (error) {
      console.error('Preview error:', error);
      addNotification('Failed to load preview. Please try again or download the file.', 'ERROR');
      onError?.('Failed to load preview');
    } finally {
      setIsLoadingPreview(false);
    }
  }, [addNotification, onError, getFileType, canPreview]);

  const handleView = useCallback(async (filePath: string, docId?: string) => {
    try {
      const baseUrl = window.location.origin;
      
      // Ensure filePath starts with '/'
      const normalizedFilePath = filePath.startsWith('/') ? filePath : `/${filePath}`;
      
      if (filePath.endsWith('.pdf')) {
        window.open(`${baseUrl}${normalizedFilePath}`, '_blank');
      } else if (docId) {
        const response = await fetch(`/api/documents/${docId}/view`);
        if (!response.ok) {
          const data = await response.json();
          const errorMessage = data.error || 'Failed to view document';
          addNotification(errorMessage, 'ERROR');
          onError?.(errorMessage);
          
          // If file not found, try to open directly as fallback
          if (response.status === 404) {
            addNotification('Trying to open file directly...', 'INFO');
            window.open(`${baseUrl}${normalizedFilePath}`, '_blank');
          }
          return;
        }
        const data = await response.json();
        const viewUrl = data.viewUrl.startsWith('http') ? data.viewUrl : `${baseUrl}${data.viewUrl}`;
        window.open(viewUrl, '_blank');
      } else {
        // Fallback: try to open file directly
        window.open(`${baseUrl}${normalizedFilePath}`, '_blank');
      }
    } catch (error) {
      console.error('View error:', error);
      addNotification('Failed to view document. Please try downloading the file.', 'ERROR');
      onError?.('Failed to view document');
    }
  }, [addNotification, onError]);

  // Memoized functions
  const getStatusBadgeVariant = useCallback((status: DocumentStatus): StatusBadgeVariant => {
    const variants: Record<DocumentStatus, StatusBadgeVariant> = {
      DRAFTED: "outline",
      SUBMITTED: "default",
      PENDING: "secondary",
      APPROVED: "default",
      REJECTED: "destructive"
    };
    return variants[status];
  }, []);

  const getStatusClassName = useCallback((status: DocumentStatus): string => {
    const classMap: Record<DocumentStatus, string> = {
      DRAFTED: 'text-gray-600',
      SUBMITTED: 'text-yellow-600',
      PENDING: 'text-blue-600',
      APPROVED: 'text-green-600',
      REJECTED: 'text-red-600'
    };
    return classMap[status];
  }, []);

  const canProcessDocument = useCallback((status: DocumentStatus): boolean => {
    if (isManager && status === DocumentStatus.SUBMITTED) return true;
    if (isStandardization && status === DocumentStatus.PENDING) return true;
    return false;
  }, [isManager, isStandardization]);

  // Memoized filtered documents
  const filteredDocuments = useMemo(() => {
    return documents.filter((doc: Document) => {
      const matchesSearch = doc.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        doc.description.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter === "all" || doc.status.toLowerCase() === statusFilter.toLowerCase();
      return matchesSearch && matchesStatus;
    });
  }, [documents, searchTerm, statusFilter]);

  // Render preview content
  const renderPreviewContent = () => {
    if (!previewData) return null;

    const fileType = getFileType(previewData.fileType);

    switch (fileType) {
      case 'pdf':
        return <PDFPreview url={previewData.url} />;
      case 'image':
        return <ImagePreview url={previewData.url} />;
      case 'text':
        return <TextPreview content={previewData.content || ''} />;
      case 'office':
        return <OfficePreview url={previewData.url} title={previewData.title} />;
      default:
        return <UnsupportedPreview fileType={previewData.fileType} />;
    }
  };

  // Error state
  if (error) {
    return (
      <div className="space-y-4">
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <XCircle className="h-5 w-5 text-red-400" />
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">
                Error loading documents
              </h3>
              <div className="mt-2 text-sm text-red-700">
                <p>{error instanceof Error ? error.message : 'An unknown error occurred'}</p>
              </div>
              <div className="mt-4">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => refetch()}
                  className="text-red-800 border-red-300 hover:bg-red-100"
                >
                  Try again
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Loading state
  if (isLoading) return <LoadingSpinner />;

  return (
    <>
      <div className="space-y-4">
        {/* Search and Filter Section */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <label htmlFor="search" className="sr-only">Search documents</label>
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              id="search"
              type="text"
              placeholder="Search documents..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          
          <div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="drafted">Drafted</SelectItem>
                <SelectItem value="submitted">Submitted</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="approved">Approved</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Documents Table */}
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Title</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Last Updated</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredDocuments.map((doc: Document) => (
                <TableRow key={doc.id}>
                  <TableCell className="font-medium">{doc.title}</TableCell>
                  <TableCell>
                    <Badge 
                      variant={getStatusBadgeVariant(doc.status)}
                      className={getStatusClassName(doc.status)}
                    >
                      {doc.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {formatDistanceToNow(new Date(doc.updatedAt), { addSuffix: true })}
                  </TableCell>
                  <TableCell>
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => handleDownload(doc.filePath, doc.title)}
                        className="hover:bg-blue-100 hover:text-blue-600"
                        disabled={approveRejectMutation.isPending}
                        title="Download Document"
                      >
                        <Download className="h-4 w-4" />
                      </Button>
                      
                      {canPreview(doc.fileType) ? (
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => handlePreview(doc)}
                          className="hover:bg-green-100 hover:text-green-600"
                          disabled={approveRejectMutation.isPending || isLoadingPreview}
                          title="Preview Document"
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                      ) : (
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => handleView(doc.filePath, doc.id)}
                          className="hover:bg-green-100 hover:text-green-600"
                          disabled={approveRejectMutation.isPending}
                          title="View Document"
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                      )}

                      {canProcessDocument(doc.status) && (
                        <>
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => handleApproveReject(doc.id, 'APPROVED')}
                            className="hover:bg-green-100 hover:text-green-600"
                            disabled={approveRejectMutation.isPending}
                            title="Approve Document"
                          >
                            <CheckCircle className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => handleApproveReject(doc.id, 'REJECTED')}
                            className="hover:bg-red-100 hover:text-red-600"
                            disabled={approveRejectMutation.isPending}
                            title="Reject Document"
                          >
                            <XCircle className="h-4 w-4" />
                          </Button>
                        </>
                      )}

                      <EditDocument
                        id={doc.id}
                        currentTitle={doc.title}
                        currentDescription={doc.description}
                        onSuccess={() => queryClient.invalidateQueries({ queryKey: ['documents'] })}
                      />
                      <DeleteButton
                        id={doc.id}
                        onDelete={() => queryClient.invalidateQueries({ queryKey: ['documents'] })}
                        documentTitle={doc.title}
                      />
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {filteredDocuments.length === 0 && (
                <TableRow>
                  <TableCell colSpan={4} className="text-center py-8 text-gray-500">
                    {searchTerm || statusFilter !== "all" 
                      ? "No documents match your search criteria" 
                      : "No documents found"}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Preview Modal */}
      <Dialog open={previewOpen} onOpenChange={setPreviewOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden">
          <DialogHeader className="flex flex-row items-center justify-between">
            <DialogTitle className="flex items-center gap-2">
              <Eye className="h-5 w-5" />
              {previewData?.title}
            </DialogTitle>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setPreviewOpen(false)}
              className="h-8 w-8"
            >
              <X className="h-4 w-4" />
            </Button>
          </DialogHeader>
          <div className="flex-1 overflow-auto">
            {isLoadingPreview ? (
              <div className="flex items-center justify-center h-[600px]">
                <LoadingSpinner />
              </div>
            ) : (
              renderPreviewContent()
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}