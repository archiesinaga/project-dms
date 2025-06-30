'use client';

import { useState, useEffect } from 'react';
import { 
  Search,
  FileCheck,
  Download,
  Eye,
  Calendar,
  User,
  Clock,
  Filter
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { useRouter } from 'next/navigation';
import { useToast } from '@/components/ui/use-toast';
import { format, parseISO } from 'date-fns';

interface ApprovedDocument {
  id: string;
  title: string;
  description: string | null;
  fileType: string | null;
  uploadedAt: string;
  approvedAt: string | null;
  creator: {
    name: string | null;
    email: string;
  };
  approver: {
    name: string | null;
    email: string;
    role: string;
  } | null;
}

export default function ApprovedDocumentsPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [documents, setDocuments] = useState<ApprovedDocument[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [dateFilter, setDateFilter] = useState('all');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchApprovedDocuments();
  }, [dateFilter]);

  const fetchApprovedDocuments = async () => {
    try {
      const response = await fetch('/api/documents?status=APPROVED&approvedByStandardization=true');
      if (!response.ok) throw new Error('Failed to fetch approved documents');
      
      const data = await response.json();
      setDocuments(data);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch approved documents",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownload = async (id: string, title: string) => {
    try {
      const response = await fetch(`/api/documents/${id}/download`);
      if (!response.ok) throw new Error('Failed to download document');
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = title;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      toast({
        title: "Success",
        description: "Document downloaded successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to download document",
        variant: "destructive"
      });
    }
  };

  const handleView = async (id: string, title: string) => {
    try {
      const response = await fetch(`/api/documents/${id}/view`);
      if (!response.ok) throw new Error('Failed to view document');
      
      const data = await response.json();
      const baseUrl = window.location.origin;
      const viewUrl = data.viewUrl.startsWith('http') 
        ? data.viewUrl 
        : `${baseUrl}${data.viewUrl}`;
        
      window.open(viewUrl, '_blank');

      toast({
        title: "Success",
        description: "Document opened successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to view document",
        variant: "destructive"
      });
    }
  };

  const handlePreview = async (id: string, title: string, fileType?: string) => {
    try {
      const baseUrl = window.location.origin;
      const fileTypeCategory = getFileType(fileType);
      
      if (!canPreview(fileType)) {
        toast({
          title: "Preview Not Available",
          description: "Preview is not available for this file type",
          variant: "destructive"
        });
        return;
      }

      const response = await fetch(`/api/documents/${id}/view`);
      if (!response.ok) throw new Error('Failed to get document URL');
      
      const data = await response.json();
      const viewUrl = data.viewUrl.startsWith('http') 
        ? data.viewUrl 
        : `${baseUrl}${data.viewUrl}`;

      if (fileTypeCategory === 'pdf' || fileTypeCategory === 'image') {
        window.open(viewUrl, '_blank');
      } else if (fileTypeCategory === 'text') {
        // For text files, fetch and display content
        const textResponse = await fetch(viewUrl);
        if (!textResponse.ok) throw new Error('Failed to fetch text content');
        const content = await textResponse.text();
        
        const textWindow = window.open('', '_blank');
        if (textWindow) {
          textWindow.document.write(`
            <html>
              <head><title>${title}</title></head>
              <body style="font-family: monospace; padding: 20px; background: #f5f5f5;">
                <h2>${title}</h2>
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

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'N/A';
    try {
      return format(parseISO(dateString), 'PPP');
    } catch (error) {
      console.error('Error formatting date:', error);
      return 'Invalid date';
    }
  };

  const filteredDocuments = documents.filter(doc => 
    doc.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (doc.description?.toLowerCase() || '').includes(searchQuery.toLowerCase())
  );

  return (
    <div className="p-8">
      <Card className="bg-white rounded-lg shadow-lg p-6">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold">Approved Documents</h1>
            <p className="text-gray-600">Documents approved by Standardization Department</p>
          </div>
          <Badge variant="secondary" className="bg-green-100 text-green-800">
            <FileCheck className="h-5 w-5 mr-2" />
            Standardization Approved
          </Badge>
        </div>

        {/* Filters */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div className="relative">
            <Search className="h-4 w-4 absolute left-3 top-3 text-gray-400" />
            <Input
              placeholder="Search documents..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select
            value={dateFilter}
            onValueChange={setDateFilter}
          >
            <SelectTrigger>
              <Calendar className="h-4 w-4 mr-2" />
              <SelectValue placeholder="Filter by date" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Time</SelectItem>
              <SelectItem value="today">Today</SelectItem>
              <SelectItem value="week">This Week</SelectItem>
              <SelectItem value="month">This Month</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Documents List */}
        <div className="space-y-4">
          {filteredDocuments.map((doc) => (
            <Card key={doc.id} className="p-4 hover:bg-gray-50 transition-colors">
              <div className="flex justify-between items-start">
                <div className="space-y-2">
                  <h3 className="text-lg font-semibold">{doc.title}</h3>
                  <p className="text-gray-600">{doc.description}</p>
                  <div className="flex gap-4 text-sm text-gray-500">
                    <div className="flex items-center">
                      <User className="h-4 w-4 mr-1" />
                      Created by: {doc.creator.name || doc.creator.email}
                    </div>
                    <div className="flex items-center">
                      <Clock className="h-4 w-4 mr-1" />
                      Approved: {formatDate(doc.approvedAt)}
                    </div>
                    <div className="flex items-center">
                      <FileCheck className="h-4 w-4 mr-1" />
                      Approved by: {doc.approver?.name || doc.approver?.email || 'N/A'}
                    </div>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDownload(doc.id, doc.title)}
                  >
                    <Download className="h-4 w-4 mr-1" />
                    Download
                  </Button>
                  {canPreview(doc.fileType || undefined) ? (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handlePreview(doc.id, doc.title, doc.fileType || undefined)}
                    >
                      <Eye className="h-4 w-4 mr-1" />
                      Preview
                    </Button>
                  ) : (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleView(doc.id, doc.title)}
                    >
                      <Eye className="h-4 w-4 mr-1" />
                      View
                    </Button>
                  )}
                </div>
              </div>
            </Card>
          ))}

          {filteredDocuments.length === 0 && (
            <div className="text-center py-8">
              <FileCheck className="h-12 w-12 text-gray-400 mx-auto mb-3" />
              <h3 className="text-lg font-semibold text-gray-600">No approved documents found</h3>
              <p className="text-gray-500">
                {searchQuery 
                  ? "Try adjusting your search or filters"
                  : "Documents approved by Standardization will appear here"}
              </p>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}