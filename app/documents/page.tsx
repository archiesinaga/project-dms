'use client';

import { useState, useEffect } from 'react';
import { Plus, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useRouter } from 'next/navigation';
import { useToast } from '@/components/ui/use-toast';
import { useRoleCheck } from '@/lib/useRoleCheck';
import { useSession } from 'next-auth/react';
import { DocumentStats } from '@/components/documents/DocumentStats';
import { SearchAndFilter } from '@/components/documents/SearchAndFilter';
import { DocumentActions } from '@/components/documents/DocumentActions';

// Types
interface Document {
  id: string;
  title: string;
  status: DocumentStatus;
  lastUpdated: string;
  filePath: string;
  fileType?: string;
}

type DocumentStatus = 'DRAFTED' | 'SUBMITTED' | 'PENDING' | 'APPROVED' | 'REJECTED';
type BadgeVariant = "default" | "secondary" | "destructive" | "outline";

export default function DocumentsPage() {
  const router = useRouter();
  const { toast } = useToast();
  const { data: session } = useSession();
  const { isAdmin } = useRoleCheck();
  const [documents, setDocuments] = useState<Document[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState({
    total: 0,
    approved: 0,
    pending: 0,
    rejected: 0
  });

  useEffect(() => {
    fetchDocuments();
    fetchStats();
  }, [statusFilter]);

  const fetchStats = async () => {
    try {
      const response = await fetch('/api/dashboard/stats');
      if (!response.ok) throw new Error('Failed to fetch statistics');
      const data = await response.json();
      setStats(data);
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const fetchDocuments = async () => {
    try {
      const queryParams = new URLSearchParams();
      if (statusFilter !== 'ALL') {
        queryParams.append('status', statusFilter);
      }
      
      const response = await fetch(`/api/documents?${queryParams}`);
      if (!response.ok) throw new Error('Failed to fetch documents');
      
      const data = await response.json();
      setDocuments(data);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch documents",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownload = async (doc: Document) => {
    try {
      const response = await fetch(`/api/documents/${doc.id}/download`);
      if (!response.ok) throw new Error('Failed to download document');
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = doc.title;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      toast({
        title: "Success",
        description: "Document downloaded successfully"
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to download document",
        variant: "destructive"
      });
    }
  };

  const handleView = async (doc: Document) => {
    try {
      const baseUrl = window.location.origin;
      
      if (doc.filePath.endsWith('.pdf')) {
        window.open(`${baseUrl}${doc.filePath}`, '_blank');
      } else {
        const response = await fetch(`/api/documents/${doc.id}/view`);
        if (!response.ok) throw new Error('Failed to view document');
        
        const data = await response.json();
        const viewUrl = data.viewUrl.startsWith('http') 
          ? data.viewUrl 
          : `${baseUrl}${data.viewUrl}`;
          
        window.open(viewUrl, '_blank');
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to view document",
        variant: "destructive"
      });
    }
  };

  const handlePreview = async (doc: Document) => {
    try {
      const baseUrl = window.location.origin;
      const fileType = getFileType(doc.fileType);
      
      if (!canPreview(doc.fileType)) {
        toast({
          title: "Preview Not Available",
          description: "Preview is not available for this file type",
          variant: "destructive"
        });
        return;
      }

      let previewUrl = '';
      let content = '';

      if (fileType === 'pdf') {
        previewUrl = `${baseUrl}${doc.filePath}`;
      } else if (fileType === 'image') {
        previewUrl = `${baseUrl}${doc.filePath}`;
      } else if (fileType === 'text') {
        // For text files, fetch the content
        const response = await fetch(`${baseUrl}${doc.filePath}`);
        if (!response.ok) throw new Error('Failed to fetch text content');
        content = await response.text();
        previewUrl = `${baseUrl}${doc.filePath}`;
      }

      // Open preview in modal or new window
      if (fileType === 'pdf') {
        window.open(previewUrl, '_blank');
      } else if (fileType === 'image') {
        window.open(previewUrl, '_blank');
      } else if (fileType === 'text') {
        // For text files, show in alert or modal
        const textWindow = window.open('', '_blank');
        if (textWindow) {
          textWindow.document.write(`
            <html>
              <head><title>${doc.title}</title></head>
              <body style="font-family: monospace; padding: 20px; background: #f5f5f5;">
                <h2>${doc.title}</h2>
                <pre style="background: white; padding: 15px; border-radius: 5px; overflow: auto;">${content}</pre>
              </body>
            </html>
          `);
        }
      }

      toast({
        title: "Success",
        description: "Document preview opened"
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load preview",
        variant: "destructive"
      });
    }
  };

  // File type helpers
  const getFileType = (fileType?: string): string => {
    if (!fileType) return 'unknown';
    if (fileType === 'application/pdf') return 'pdf';
    if (['image/jpeg', 'image/png', 'image/gif', 'image/webp'].includes(fileType)) return 'image';
    if (['text/plain', 'text/html', 'text/css', 'text/javascript'].includes(fileType)) return 'text';
    if (['application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
         'application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
         'application/vnd.ms-powerpoint', 'application/vnd.openxmlformats-officedocument.presentationml.presentation'].includes(fileType)) return 'office';
    return 'unsupported';
  };

  const canPreview = (fileType?: string): boolean => {
    const type = getFileType(fileType);
    return ['pdf', 'image', 'text'].includes(type);
  };

  const handleDelete = async (id: string) => {
    if (!isAdmin) {
      toast({
        title: "Access Denied",
        description: "Only administrators can delete documents",
        variant: "destructive"
      });
      return;
    }

    try {
      const response = await fetch(`/api/documents/${id}`, { method: 'DELETE' });
      if (!response.ok) throw new Error('Failed to delete document');
      
      toast({
        title: "Success",
        description: "Document deleted successfully",
      });
      
      fetchDocuments();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete document",
        variant: "destructive"
      });
    }
  };

  const getStatusBadgeVariant = (status: DocumentStatus): BadgeVariant => {
    const variants: Record<DocumentStatus, BadgeVariant> = {
      DRAFTED: "outline",
      SUBMITTED: "default",
      PENDING: "secondary",
      APPROVED: "default",
      REJECTED: "destructive"
    };
    return variants[status];
  };

  const filteredDocuments = documents.filter(doc => 
    doc.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (isLoading) {
    return (
      <div className="p-8">
        <Card className="bg-white rounded-lg shadow-lg p-6">
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-8">
      <Card className="bg-white rounded-lg shadow-lg p-6">
        <DocumentStats stats={stats} />

        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Documents</h1>
          {isAdmin && (
            <Button onClick={() => router.push('/documents/editor')} className="bg-primary text-white">
              <Plus className="h-4 w-4 mr-2" />
              New Document
            </Button>
          )}
        </div>

        <SearchAndFilter
          searchQuery={searchQuery}
          statusFilter={statusFilter}
          onSearchChange={setSearchQuery}
          onStatusChange={setStatusFilter}
        />

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="text-left py-3 px-4">Title</th>
                <th className="text-left py-3 px-4">Status</th>
                <th className="text-left py-3 px-4">Last Updated</th>
                <th className="text-right py-3 px-4">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredDocuments.map((doc) => (
                <tr key={doc.id} className="border-b hover:bg-gray-50">
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2">
                      <FileText className="h-4 w-4 text-gray-400" />
                      {doc.title}
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <Badge variant={getStatusBadgeVariant(doc.status)}>
                      {doc.status}
                    </Badge>
                  </td>
                  <td className="py-3 px-4">{doc.lastUpdated}</td>
                  <td className="py-3 px-4">
                    <DocumentActions
                      document={doc}
                      onDownload={() => handleDownload(doc)}
                      onView={() => handleView(doc)}
                      onPreview={() => handlePreview(doc)}
                      onDelete={() => handleDelete(doc.id)}
                    />
                  </td>
                </tr>
              ))}
              {filteredDocuments.length === 0 && (
                <tr>
                  <td colSpan={4} className="text-center py-8 text-gray-500">
                    No documents found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}