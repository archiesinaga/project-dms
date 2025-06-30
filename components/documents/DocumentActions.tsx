'use client';

import { Download, Eye, Edit, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import { useRoleCheck } from '@/lib/useRoleCheck';

interface DocumentActionsProps {
  document: {
    id: string;
    title: string;
    filePath: string;
    fileType?: string;
  };
  onDownload: () => void;
  onView: () => void;
  onPreview?: () => void;
  onDelete: () => void;
  canPreview?: boolean;
}

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

export function DocumentActions({
  document,
  onDownload,
  onView,
  onPreview,
  onDelete,
  canPreview = false,
}: DocumentActionsProps) {
  const router = useRouter();
  const { isAdmin, isManager, isStandardization } = useRoleCheck();

  const getFileType = (fileType?: string): string => {
    if (!fileType) return 'unknown';
    if (fileType === FILE_TYPES.PDF) return 'pdf';
    if (FILE_TYPES.IMAGE.includes(fileType as any)) return 'image';
    if (FILE_TYPES.TEXT.includes(fileType as any)) return 'text';
    if (FILE_TYPES.OFFICE.includes(fileType as any)) return 'office';
    return 'unsupported';
  };

  const canPreviewFile = (fileType?: string): boolean => {
    const type = getFileType(fileType);
    return ['pdf', 'image', 'text'].includes(type);
  };

  return (
    <div className="flex justify-end gap-2">
      {(isManager || isStandardization || isAdmin) && (
        <>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={onDownload} 
            title="Download Document"
          >
            <Download className="h-4 w-4" />
          </Button>
          
          {canPreviewFile(document.fileType) && onPreview ? (
            <Button 
              variant="outline" 
              size="sm" 
              onClick={onPreview} 
              title="Preview Document"
            >
              <Eye className="h-4 w-4" />
            </Button>
          ) : (
            <Button 
              variant="outline" 
              size="sm" 
              onClick={onView} 
              title="View Document"
            >
              <Eye className="h-4 w-4" />
            </Button>
          )}
        </>
      )}
      {isAdmin && (
        <>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => router.push(`/documents/editor/${document.id}`)} 
            title="Edit Document"
          >
            <Edit className="h-4 w-4" />
          </Button>
          <Button 
            variant="destructive" 
            size="sm" 
            onClick={onDelete} 
            title="Delete Document"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </>
      )}
    </div>
  );
}