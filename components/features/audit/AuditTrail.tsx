'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { AuditFilter } from '@/types';
import { auditService } from '@/lib/services/audit';
import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';

interface AuditFiltersProps {
  value: AuditFilter;
  onChange: (filters: AuditFilter) => void;
}

interface AuditTableProps {
  data: any[];
  isLoading?: boolean;
}

interface ExportAuditButtonProps {
  data: any[];
  isDisabled?: boolean;
}

// Loading component
const AuditTrailSkeleton = () => (
  <div className="space-y-4">
    {[...Array(5)].map((_, i) => (
      <Skeleton key={i} className="h-16 w-full" />
    ))}
  </div>
);

// Error component
const AuditTrailError = ({ error, onRetry }: { error: Error; onRetry: () => void }) => (
  <Alert variant="destructive">
    <AlertCircle className="h-4 w-4" />
    <AlertDescription className="flex items-center justify-between">
      <span>Failed to load audit trail: {error.message}</span>
      <Button variant="outline" size="sm" onClick={onRetry}>
        Retry
      </Button>
    </AlertDescription>
  </Alert>
);

// Filters component
const AuditFilters = ({ value, onChange }: AuditFiltersProps) => {
  const handleFilterChange = (newFilters: Partial<AuditFilter>) => {
    onChange({ ...value, ...newFilters });
  };

  return (
    <Card className="p-4 mb-4">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Date Range Filter */}
        <div>
          <label className="block text-sm font-medium mb-1">Date Range</label>
          <input
            type="date"
            className="w-full"
            value={value.startDate?.toISOString().split('T')[0] || ''}
            onChange={(e) => handleFilterChange({ startDate: new Date(e.target.value) })}
          />
        </div>
        
        {/* User Filter */}
        <div>
          <label className="block text-sm font-medium mb-1">User</label>
          <input
            type="text"
            className="w-full"
            value={value.userId || ''}
            onChange={(e) => handleFilterChange({ userId: e.target.value })}
          />
        </div>
        
        {/* Action Filter */}
        <div>
          <label className="block text-sm font-medium mb-1">Action</label>
          <select
            className="w-full"
            value={value.action?.[0] || ''}
            onChange={(e) => handleFilterChange({ action: e.target.value ? [e.target.value] : [] })}
          >
            <option value="">All Actions</option>
            <option value="CREATE">Create</option>
            <option value="UPDATE">Update</option>
            <option value="DELETE">Delete</option>
          </select>
        </div>
        
        {/* Resource Type Filter */}
        <div>
          <label className="block text-sm font-medium mb-1">Resource Type</label>
          <select
            className="w-full"
            value={value.resourceType?.[0] || ''}
            onChange={(e) => handleFilterChange({ resourceType: e.target.value ? [e.target.value] : [] })}
          >
            <option value="">All Resources</option>
            <option value="DOCUMENT">Document</option>
            <option value="USER">User</option>
            <option value="SETTING">Setting</option>
          </select>
        </div>
      </div>
    </Card>
  );
};

// Table component
const AuditTable = ({ data, isLoading }: AuditTableProps) => {
  if (isLoading) return <AuditTrailSkeleton />;
  
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Timestamp
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              User
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Action
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Resource
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Details
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {data.map((log) => (
            <tr key={log.id}>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {new Date(log.timestamp).toLocaleString()}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {log.user?.name || log.userId}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {log.action}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {log.resourceType}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {JSON.stringify(log.details)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

// Export button component
const ExportAuditButton = ({ data, isDisabled }: ExportAuditButtonProps) => {
  const { toast } = useToast();

  const handleExport = async () => {
    try {
      const csvContent = convertToCSV(data);
      downloadCSV(csvContent, `audit-trail-${new Date().toISOString()}.csv`);
      toast({
        title: "Export Successful",
        description: "Audit trail has been exported to CSV",
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Export Failed",
        description: "Failed to export audit trail",
      });
    }
  };

  return (
    <Button 
      onClick={handleExport} 
      disabled={isDisabled || data.length === 0}
      className="mt-4"
    >
      Export to CSV
    </Button>
  );
};

// Main component
export const AuditTrail = () => {
  const [filters, setFilters] = useState<AuditFilter>({});
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['audit-trail', filters],
    queryFn: () => auditService.getAuditTrail(filters),
    staleTime: 30000,
    refetchOnWindowFocus: false
  });

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold mb-4">Audit Trail</h2>
      
      <AuditFilters value={filters} onChange={setFilters} />
      
      {error ? (
        <AuditTrailError error={error as Error} onRetry={refetch} />
      ) : (
        <>
          <AuditTable data={data || []} isLoading={isLoading} />
          <ExportAuditButton data={data || []} isDisabled={isLoading} />
        </>
      )}
    </div>
  );
};

// Utility functions
const convertToCSV = (data: any[]) => {
  const headers = ['Timestamp', 'User', 'Action', 'Resource', 'Details'];
  const rows = data.map(log => [
    new Date(log.timestamp).toLocaleString(),
    log.user?.name || log.userId,
    log.action,
    log.resourceType,
    JSON.stringify(log.details)
  ]);
  
  return [headers, ...rows]
    .map(row => row.join(','))
    .join('\n');
};

const downloadCSV = (content: string, filename: string) => {
  const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = filename;
  link.click();
  URL.revokeObjectURL(link.href);
};