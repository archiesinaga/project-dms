'use client';

import { Card } from '@/components/ui/card';
import { BarChart2, FileCheck, FileClock, FileX } from 'lucide-react';

interface DocumentStatsProps {
  stats: {
    total: number;
    approved: number;
    pending: number;
    rejected: number;
  };
}

export function DocumentStats({ stats }: DocumentStatsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
      <Card className="p-4 flex items-center space-x-4">
        <BarChart2 className="h-10 w-10 text-blue-500" />
        <div>
          <p className="text-sm text-gray-500">Total Documents</p>
          <p className="text-2xl font-bold">{stats.total}</p>
        </div>
      </Card>
      <Card className="p-4 flex items-center space-x-4">
        <FileCheck className="h-10 w-10 text-green-500" />
        <div>
          <p className="text-sm text-gray-500">Approved</p>
          <p className="text-2xl font-bold">{stats.approved}</p>
        </div>
      </Card>
      <Card className="p-4 flex items-center space-x-4">
        <FileClock className="h-10 w-10 text-yellow-500" />
        <div>
          <p className="text-sm text-gray-500">Pending</p>
          <p className="text-2xl font-bold">{stats.pending}</p>
        </div>
      </Card>
      <Card className="p-4 flex items-center space-x-4">
        <FileX className="h-10 w-10 text-red-500" />
        <div>
          <p className="text-sm text-gray-500">Rejected</p>
          <p className="text-2xl font-bold">{stats.rejected}</p>
        </div>
      </Card>
    </div>
  );
}