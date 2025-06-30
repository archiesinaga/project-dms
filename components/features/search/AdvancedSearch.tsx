'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
// Removed import of DocumentSearchParams from '@/types' to avoid conflict with local declaration
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { DateRangePicker } from '@/components/ui/date-range-picker';
import { MultiSelect } from '@/components/ui/multi-select';
import { useToast } from '@/components/ui/use-toast';
import {
  Search,
  Tag,
  Building,
  Calendar,
  Save,
  Star,
  X,
  Filter
} from 'lucide-react';
import { DateRange } from 'react-day-picker';

// Update the DocumentSearchParams interface to use the correct DateRange type
interface DocumentSearchParams {
    fullText: string;
    metadata: Record<string, any>;
    dateRange: DateRange | null;  // Update this to use DateRange from react-day-picker
    tags: string[];
    departments: string[];
    status: string[];
  }

interface MetadataField {
  key: string;
  label: string;
  type: 'text' | 'number' | 'select';
  options?: { label: string; value: string }[];
}

interface SavedSearch {
  id: string;
  name: string;
  params: DocumentSearchParams;
  createdAt: Date;
}

// Metadata fields configuration
const metadataFields: MetadataField[] = [
  { key: 'department', label: 'Department', type: 'select', 
    options: [
      { label: 'HR', value: 'hr' },
      { label: 'Finance', value: 'finance' },
      { label: 'Operations', value: 'operations' }
    ]
  },
  { key: 'docType', label: 'Document Type', type: 'select',
    options: [
      { label: 'Policy', value: 'policy' },
      { label: 'Procedure', value: 'procedure' },
      { label: 'Form', value: 'form' }
    ]
  },
  { key: 'author', label: 'Author', type: 'text' }
];

// Full Text Search Component
const FullTextSearch = ({
  value,
  onChange
}: {
  value: string;
  onChange: (value: string) => void;
}) => (
  <div className="space-y-2">
    <Label htmlFor="search">Search Documents</Label>
    <div className="relative">
      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
      <Input
        id="search"
        type="text"
        placeholder="Search by title, content, or metadata..."
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="pl-10"
      />
    </div>
  </div>
);

// Metadata Filters Component
const MetadataFilters = ({
  fields,
  values,
  onChange
}: {
  fields: MetadataField[];
  values: Record<string, any>;
  onChange: (values: Record<string, any>) => void;
}) => (
  <div className="space-y-4 mt-4">
    <Label>Metadata Filters</Label>
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {fields.map((field) => (
        <div key={field.key} className="space-y-2">
          <Label htmlFor={field.key}>{field.label}</Label>
          {field.type === 'select' ? (
            <MultiSelect
              id={field.key}
              options={field.options || []}
              value={values[field.key] || []}
              onChange={(value) => onChange({ ...values, [field.key]: value })}
            />
          ) : (
            <Input
              id={field.key}
              type={field.type}
              value={values[field.key] || ''}
              onChange={(e) => onChange({ ...values, [field.key]: e.target.value })}
            />
          )}
        </div>
      ))}
    </div>
  </div>
);

// Tag Selector Component
const TagSelector = ({
    selected,
    onChange
  }: {
    selected: string[];
    onChange: (tags: string[]) => void;
  }) => {
    const { data: tags = [] } = useQuery<string[]>({
      queryKey: ['document-tags'],
      queryFn: async () => {
        const res = await fetch('/api/documents/tags');
        if (!res.ok) throw new Error('Failed to fetch tags');
        return res.json();
      }
    });

    return (
        <div className="space-y-2 mt-4">
          <Label>Tags</Label>
          <ScrollArea className="h-20">
            <div className="flex flex-wrap gap-2">
              {tags.map((tag: string) => (  // Add explicit type here
                <Badge
                  key={tag}
                  variant={selected.includes(tag) ? 'default' : 'outline'}
                  className="cursor-pointer"
                  onClick={() => {
                    const newTags = selected.includes(tag)
                      ? selected.filter((t) => t !== tag)
                      : [...selected, tag];
                    onChange(newTags);
                  }}
                >
                  <Tag className="w-3 h-3 mr-1" />
                  {tag}
                </Badge>
              ))}
            </div>
          </ScrollArea>
        </div>
      );
    };

// Saved Searches Component
const SavedSearches = ({
  onApply,
  onSave
}: {
  onApply: (params: DocumentSearchParams) => void;
  onSave: () => void;
}) => {
  const { toast } = useToast();
  const { data: savedSearches = [] } = useQuery<SavedSearch[]>({
    queryKey: ['saved-searches'],
    queryFn: async () => {
      const res = await fetch('/api/documents/saved-searches');
      if (!res.ok) throw new Error('Failed to fetch saved searches');
      return res.json();
    }
  });

  return (
    <div className="space-y-2 mt-4">
      <div className="flex items-center justify-between">
        <Label>Saved Searches</Label>
        <Button variant="outline" size="sm" onClick={onSave}>
          <Save className="w-4 h-4 mr-1" />
          Save Current
        </Button>
      </div>
      <ScrollArea className="h-32">
        <div className="space-y-2">
          {savedSearches.map((search) => (
            <div
              key={search.id}
              className="flex items-center justify-between p-2 rounded-md hover:bg-gray-100"
            >
              <div className="flex items-center gap-2">
                <Star className="w-4 h-4 text-yellow-500" />
                <span>{search.name}</span>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onApply(search.params)}
              >
                Apply
              </Button>
            </div>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
};

// Main Component


export const AdvancedSearch = () => {
  const [searchParams, setSearchParams] = useState<DocumentSearchParams>({
    fullText: '',
    metadata: {},
    dateRange: null,
    tags: [],
    departments: [],
    status: []
  });

  const { toast } = useToast();

  const handleSearch = async () => {
    try {
      const response = await fetch('/api/documents/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(searchParams)
      });

      if (!response.ok) throw new Error('Search failed');

      toast({
        title: "Search Complete",
        description: "Results updated successfully",
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Search Error",
        description: "Failed to perform search. Please try again.",
      });
    }
  };

  const saveCurrentSearch = async () => {
    try {
      const name = prompt('Enter a name for this search:');
      if (!name) return;

      const response = await fetch('/api/documents/saved-searches', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, params: searchParams })
      });

      if (!response.ok) throw new Error('Failed to save search');

      toast({
        title: "Search Saved",
        description: "Your search has been saved successfully",
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to save search. Please try again.",
      });
    }
  };

  return (
    <Card className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Advanced Search</h2>
        <Button onClick={handleSearch}>
          <Search className="w-4 h-4 mr-2" />
          Search
        </Button>
      </div>

      <FullTextSearch
        value={searchParams.fullText}
        onChange={(text) => setSearchParams({ ...searchParams, fullText: text })}
      />

      <MetadataFilters
        fields={metadataFields}
        values={searchParams.metadata}
        onChange={(metadata) => setSearchParams({ ...searchParams, metadata })}
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label>Date Range</Label>
          <DateRangePicker
            value={searchParams.dateRange}
            onChange={(dateRange) => setSearchParams({ ...searchParams, dateRange })}
          />
        </div>
        
        <div>
          <Label>Status</Label>
          <MultiSelect
            options={[
              { label: 'Draft', value: 'DRAFTED' },
              { label: 'Submitted', value: 'SUBMITTED' },
              { label: 'Approved', value: 'APPROVED' },
              { label: 'Rejected', value: 'REJECTED' }
            ]}
            value={searchParams.status}
            onChange={(status) => setSearchParams({ ...searchParams, status })}
          />
        </div>
      </div>

      <TagSelector
        selected={searchParams.tags}
        onChange={(tags) => setSearchParams({ ...searchParams, tags })}
      />

      <SavedSearches
        onApply={(saved) => setSearchParams(saved)}
        onSave={saveCurrentSearch}
      />
    </Card>
  );
};