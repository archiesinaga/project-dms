'use client';

import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { usePathname } from 'next/navigation';
import { LogOut } from 'lucide-react';
import { Button } from './ui/button';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { signOut } from 'next-auth/react';

const navItems = [
  { name: 'Dashboard', href: '/dashboard', protected: true },
  { name: 'Documents', href: '/documents', protected: true },
  { name: 'Notifications', href: '/notifications', protected: true },
  { name: 'About', href: '/about', protected: false },
];

export default function Navbar() {
  const { data: session } = useSession();
  const pathname = usePathname();

  const handleLogout = () => {
    signOut({ callbackUrl: '/auth/login' });
  };

  return (
    <header className="sticky top-0 z-40 w-full bg-white/80 backdrop-blur border-b border-gray-200 shadow-sm">
      <div className="max-w-7xl mx-auto flex items-center justify-between px-4 py-3">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2">
          <img src="/logo.svg" alt="DMS Logo" className="h-8 w-8" />
          <span className="font-bold text-lg text-primary">DMS</span>
        </Link>
        {/* Navigation */}
        <nav className="hidden md:flex gap-6">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={
                pathname.startsWith(item.href)
                  ? 'text-primary font-semibold underline underline-offset-4'
                  : 'text-gray-700 hover:text-primary transition-colors'
              }
            >
              {item.name}
            </Link>
          ))}
        </nav>
        {/* User Menu */}
        <div className="flex items-center gap-4">
          {session?.user ? (
            <>
              <Avatar className="h-8 w-8">
                <AvatarImage src={session.user.image || undefined} alt={session.user.name || session.user.email} />
                <AvatarFallback>{session.user.name?.[0] || session.user.email?.[0]}</AvatarFallback>
              </Avatar>
              <span className="hidden md:inline text-sm text-gray-700 font-medium">{session.user.name || session.user.email}</span>
              <Button
                variant="outline"
                size="icon"
                className="ml-2"
                onClick={handleLogout}
                aria-label="Logout"
              >
                <LogOut className="h-5 w-5" />
              </Button>
            </>
          ) : (
            <Link href="/auth/login" className="btn-primary px-4 py-2 rounded text-white bg-primary hover:bg-primary/90 transition-colors">Login</Link>
          )}
        </div>
      </div>
      {/* Mobile nav */}
      <nav className="flex md:hidden gap-4 px-4 pb-2">
        {navItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={
              pathname.startsWith(item.href)
                ? 'text-primary font-semibold underline underline-offset-4'
                : 'text-gray-700 hover:text-primary transition-colors'
            }
          >
            {item.name}
          </Link>
        ))}
      </nav>
    </header>
  );
}