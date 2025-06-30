'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { useRoleCheck } from '@/lib/useRoleCheck';
import { cn } from '@/lib/utils';
import {
  LayoutDashboard,
  FileText,
  Clock,
  CheckSquare,
  Settings,
  Users,
  FolderOpen,
  PenTool,
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  LogOut,
  Info
} from 'lucide-react';
import { Button } from './ui/button';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from './ui/tooltip';

const sidebarItems = [
  {
    name: 'Dashboard',
    href: '/dashboard',
    icon: <LayoutDashboard className="h-5 w-5" />, 
    protected: true,
  },
  {
    name: 'Documents',
    href: '/documents',
    icon: <FileText className="h-5 w-5" />, 
    protected: true,
  },
  {
    name: 'Notifications',
    href: '/notifications',
    icon: <AlertCircle className="h-5 w-5" />, 
    protected: true,
  },
  {
    name: 'Settings',
    href: '/settings',
    icon: <Settings className="h-5 w-5" />, 
    protected: true,
  },
  {
    name: 'About',
    href: '/about',
    icon: <Info className="h-5 w-5" />, 
    protected: false,
  },
];

export default function Sidebar() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const { isAdmin, isManager, isStandardization } = useRoleCheck();
  const [collapsed, setCollapsed] = useState(true);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
      if (window.innerWidth >= 768) setCollapsed(true);
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const canViewItem = (item: any) => {
    if (!item.protected) return true;
    if (isAdmin || isManager || isStandardization) return true;
    return false;
  };

  // Hover handlers for desktop
  const handleMouseEnter = () => {
    if (!isMobile) setCollapsed(false);
  };
  const handleMouseLeave = () => {
    if (!isMobile) setCollapsed(true);
  };

  return (
    <aside
      className={cn(
        'bg-white/90 border-r border-gray-200 flex flex-col h-screen transition-all duration-300',
        collapsed ? 'w-16' : 'w-64',
        'fixed md:static z-30'
      )}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {/* Logo & Collapse Button */}
      <div className="flex items-center justify-between p-4 border-b border-gray-100">
        <Link href="/" className="flex items-center gap-2">
          <img src="/logo.svg" alt="DMS Logo" className="h-8 w-8" />
          {!collapsed && <span className="font-bold text-lg text-primary transition-opacity duration-200">DMS</span>}
        </Link>
        {isMobile && (
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setCollapsed((c) => !c)}
            aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {collapsed ? <ChevronRight className="h-5 w-5" /> : <ChevronLeft className="h-5 w-5" />}
          </Button>
        )}
      </div>

      {/* User Info */}
      {!collapsed && session?.user && (
        <div className="flex flex-col items-center py-6 border-b border-gray-100 transition-opacity duration-200">
          <Avatar className="h-14 w-14 mb-2">
            <AvatarImage src={session.user.image || undefined} alt={session.user.name || session.user.email} />
            <AvatarFallback>{session.user.name?.[0] || session.user.email?.[0]}</AvatarFallback>
          </Avatar>
          <div className="font-semibold text-gray-900">{session.user.name || session.user.email}</div>
          <div className="text-xs text-gray-500 capitalize">{session.user.role?.toLowerCase()}</div>
        </div>
      )}

      {/* Navigation */}
      <nav className="flex-1 py-4 overflow-y-auto">
        <ul className="space-y-1">
          {sidebarItems.filter(canViewItem).map((item) => (
            <li key={item.href}>
              <Link
                href={item.href}
                className={cn(
                  'flex items-center gap-3 px-4 py-2 rounded-lg transition-colors',
                  pathname.startsWith(item.href)
                    ? 'bg-primary text-white font-semibold shadow'
                    : 'text-gray-700 hover:bg-primary/10 hover:text-primary',
                  collapsed && 'justify-center px-2'
                )}
                aria-current={pathname.startsWith(item.href) ? 'page' : undefined}
              >
                {item.icon}
                {!collapsed && <span className="transition-opacity duration-200">{item.name}</span>}
              </Link>
            </li>
          ))}
        </ul>
      </nav>

      {/* Logout Button */}
      {!collapsed && session?.user && (
        <div className="p-4 border-t border-gray-100 transition-opacity duration-200">
          <Button
            variant="destructive"
            className="w-full flex items-center gap-2"
            onClick={() => window.location.href = '/auth/logout'}
          >
            <LogOut className="h-5 w-5" />
            Logout
          </Button>
        </div>
      )}
    </aside>
  );
}