'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { 
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Skeleton } from '@/components/ui/skeleton';
import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';

// Types
interface User {
  id: string;
  name: string | null;
  email: string;
  role?: string;
  image?: string | null;
}

interface UserSelectProps {
  id?: string;
  value?: string[];
  onChange: (value: string[]) => void;
  placeholder?: string;
  disabled?: boolean;
  required?: boolean;
  multiple?: boolean;
  maxSelections?: number;
  excludeUsers?: string[];
  onlyRoles?: string[];
  className?: string;
  'aria-label'?: string;
}

export const UserSelect = ({
  id,
  value = [],
  onChange,
  placeholder = "Select users...",
  disabled = false,
  required = false,
  multiple = true,
  maxSelections,
  excludeUsers = [],
  onlyRoles = [],
  className,
  'aria-label': ariaLabel,
}: UserSelectProps) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedUsers, setSelectedUsers] = useState<string[]>(value);

  // Fetch users
  const { data: users = [], isLoading, error } = useQuery<User[]>({
    queryKey: ['users'],
    queryFn: async () => {
      const response = await fetch('/api/users');
      if (!response.ok) throw new Error('Failed to fetch users');
      return response.json();
    },
    staleTime: 30000,
  });

  // Filter users based on search, exclusions, and roles
  const filteredUsers = users.filter(user => {
    const matchesSearch = searchQuery.toLowerCase().trim() === '' ||
      user.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase());

    const isNotExcluded = !excludeUsers.includes(user.id);
    const matchesRole = onlyRoles.length === 0 || (user.role && onlyRoles.includes(user.role));

    return matchesSearch && isNotExcluded && matchesRole;
  });

  // Handle selection changes
  const handleSelectionChange = (userId: string) => {
    let newSelected: string[];
    
    if (multiple) {
      newSelected = selectedUsers.includes(userId)
        ? selectedUsers.filter(id => id !== userId)
        : [...selectedUsers, userId];
        
      if (maxSelections && newSelected.length > maxSelections) {
        return;
      }
    } else {
      newSelected = [userId];
    }
    
    setSelectedUsers(newSelected);
    onChange(newSelected);
  };

  // Get user display info
  const getSelectedUserInfo = (userId: string) => {
    const user = users.find(u => u.id === userId);
    return user ? {
      name: user.name || user.email,
      email: user.email,
      image: user.image
    } : null;
  };

  // Loading state
  if (isLoading) {
    return <Skeleton className="h-10 w-full" />;
  }

  // Error state
  if (error) {
    return (
      <div className="text-sm text-red-500">
        Failed to load users. Please try again.
      </div>
    );
  }

  return (
    <div className={className}>
      <Select
        value={selectedUsers[0] || ''} // Use first selected value for single select mode
        onValueChange={handleSelectionChange}
      >
        <SelectTrigger id={id} className="w-full">
          <SelectValue 
            placeholder={placeholder}
            aria-label={ariaLabel}
          >
            {selectedUsers.length > 0 ? (
              <div className="flex flex-wrap gap-1">
                {selectedUsers.map(userId => {
                  const userInfo = getSelectedUserInfo(userId);
                  return userInfo ? (
                    <Badge key={userId} variant="secondary" className="max-w-[150px]">
                      <span className="truncate">{userInfo.name}</span>
                    </Badge>
                  ) : null;
                })}
              </div>
            ) : (
              placeholder
            )}
          </SelectValue>
        </SelectTrigger>

        <SelectContent>
          <div className="p-2">
            <Input
              placeholder="Search users..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="mb-2"
            />
          </div>
          <ScrollArea className="max-h-[300px]">
            <SelectGroup>
              {filteredUsers.length === 0 ? (
                <div className="p-2 text-sm text-gray-500 text-center">
                  No users found
                </div>
              ) : (
                filteredUsers.map(user => (
                  <SelectItem
                    key={user.id}
                    value={user.id}
                    disabled={disabled || (maxSelections ? selectedUsers.length >= maxSelections && !selectedUsers.includes(user.id) : false)}
                    className="flex items-center gap-2 p-2"
                  >
                    <Avatar className="h-6 w-6">
                      {user.image ? (
                        <AvatarImage src={user.image} alt={user.name || user.email} />
                      ) : (
                        <AvatarFallback>
                          {(user.name || user.email).charAt(0).toUpperCase()}
                        </AvatarFallback>
                      )}
                    </Avatar>
                    <div className="flex flex-col">
                      <span className="font-medium">{user.name || user.email}</span>
                      {user.name && (
                        <span className="text-xs text-gray-500">{user.email}</span>
                      )}
                    </div>
                  </SelectItem>
                ))
              )}
            </SelectGroup>
          </ScrollArea>
        </SelectContent>
      </Select>

      {required && (
        <span className="sr-only" role="alert">
          This field is required
        </span>
      )}
    </div>
  );
};