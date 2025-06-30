'use client';

import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';
import { 
  Clock, 
  GitCompare, 
  Download,
  ChevronRight,
  AlertCircle
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/components/ui/use-toast';

interface Version {
  id: string;
  version: number;
  createdAt: string;
  createdBy: {
    name: string;
    email: string;
  };
  changes: string[];
  fileUrl: string;
}

interface VersionHistoryProps {
  documentId: string;
  className?: string;
}

interface TimelineItemProps {
  version: Version;
  isLatest: boolean;
  onCompare: (version: Version) => void;
}

// Loading component
const VersionHistorySkeleton = () => (
  <div className="space-y-4">
    {[...Array(3)].map((_, i) => (
      <div key={i} className="flex items-start gap-4">
        <Skeleton className="h-8 w-8 rounded-full" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-4 w-1/4" />
          <Skeleton className="h-3 w-3/4" />
        </div>
      </div>
    ))}
  </div>
);

// Timeline Item Component
const TimelineItem = ({ version, isLatest, onCompare }: TimelineItemProps) => {
  const { toast } = useToast();

  const handleDownload = async () => {
    try {
      const response = await fetch(version.fileUrl);
      if (!response.ok) throw new Error('Download failed');
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `document-v${version.version}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      toast({
        title: "Success",
        description: `Version ${version.version} downloaded successfully`,
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to download version",
      });
    }
  };

  return (
    <div className="flex items-start gap-4 p-4 rounded-lg hover:bg-gray-50 transition-colors">
      <div className="flex-shrink-0">
        <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
          <Clock className="w-4 h-4 text-blue-600" />
        </div>
      </div>
      
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium">Version {version.version}</span>
          {isLatest && (
            <Badge variant="secondary">Latest</Badge>
          )}
        </div>
        
        <p className="text-sm text-gray-600 mt-1">
          Updated by {version.createdBy.name || version.createdBy.email}
        </p>
        
        <time className="text-xs text-gray-500 block mt-1">
          {formatDistanceToNow(new Date(version.createdAt), { addSuffix: true })}
        </time>

        {version.changes.length > 0 && (
          <ul className="mt-2 space-y-1">
            {version.changes.map((change, index) => (
              <li key={index} className="text-sm text-gray-600 flex items-center gap-2">
                <ChevronRight className="w-3 h-3" />
                {change}
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={handleDownload}
        >
          <Download className="w-4 h-4 mr-1" />
          Download
        </Button>
        
        {version.version > 1 && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => onCompare(version)}
          >
            <GitCompare className="w-4 h-4 mr-1" />
            Compare
          </Button>
        )}
      </div>
    </div>
  );
};

// Main Component
export const VersionHistory = ({ documentId, className }: VersionHistoryProps) => {
  const [compareVersion, setCompareVersion] = useState<Version | null>(null);
  const { toast } = useToast();

  const { 
    data: versions,
    isLoading,
    error,
    refetch
  } = useQuery({
    queryKey: ['document-versions', documentId],
    queryFn: async () => {
      const response = await fetch(`/api/documents/${documentId}/versions`);
      if (!response.ok) {
        throw new Error('Failed to fetch versions');
      }
      return response.json();
    }
  });

  const handleCompare = (version: Version) => {
    setCompareVersion(version);
    // Implement comparison logic here
    toast({
      title: "Compare Versions",
      description: `Comparing current version with version ${version.version}`,
    });
  };

  if (isLoading) {
    return <VersionHistorySkeleton />;
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription className="flex items-center justify-between">
          <span>Failed to load version history</span>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => refetch()}
          >
            Retry
          </Button>
        </AlertDescription>
      </Alert>
    );
  }

  if (!versions?.length) {
    return (
      <Card className="p-4">
        <p className="text-center text-gray-500">No version history available</p>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <ScrollArea className="h-[400px]">
        <div className="space-y-2 p-4">
          {versions.map((version: Version, index: number) => (
            <TimelineItem
              key={version.id}
              version={version}
              isLatest={index === 0}
              onCompare={handleCompare}
            />
          ))}
        </div>
      </ScrollArea>
    </Card>
  );
}