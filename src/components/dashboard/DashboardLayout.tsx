'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import {
  Home,
  Search,
  Calendar,
  MessageSquare,
  Settings,
  LogOut,
  Menu,
  X,
  Star,
  CreditCard,
  Users,
  BarChart3,
  Shield,
  FileText,
  Gift,
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { ThemeToggle } from '@/contexts/ThemeContext';
import Button from '@/components/ui/Button';
import { NotificationBell } from '@/components/ui/NotificationCenter';
import { APP_NAME } from '@/constants';
import { UserRole } from '@/types';
import { cn } from '@/utils';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

interface NavItem {
  name: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  roles: UserRole[];
}

const navigation: NavItem[] = [
  { name: 'Dashboard', href: '/dashboard', icon: Home, roles: ['customer', 'service_provider', 'admin'] },
  { name: 'Find Services', href: '/dashboard/search', icon: Search, roles: ['customer'] },
  { name: 'My Services', href: '/dashboard/services', icon: Star, roles: ['service_provider'] },
  { name: 'Bookings', href: '/dashboard/bookings', icon: Calendar, roles: ['customer', 'service_provider'] },
  { name: 'Calendar', href: '/dashboard/calendar', icon: Calendar, roles: ['customer', 'service_provider'] },
  { name: 'Messages', href: '/dashboard/messages', icon: MessageSquare, roles: ['customer', 'service_provider'] },
  { name: 'Reviews', href: '/dashboard/reviews', icon: Star, roles: ['customer', 'service_provider'] },
  { name: 'Payments', href: '/dashboard/payments', icon: CreditCard, roles: ['customer', 'service_provider'] },
  { name: 'Referrals', href: '/dashboard/referrals', icon: Gift, roles: ['customer', 'service_provider'] },
  { name: 'Users', href: '/dashboard/admin/users', icon: Users, roles: ['admin'] },
  { name: 'Analytics', href: '/dashboard/analytics', icon: BarChart3, roles: ['admin'] },
  { name: 'Reports', href: '/dashboard/reports', icon: FileText, roles: ['admin'] },
  { name: 'Moderation', href: '/dashboard/moderation', icon: Shield, roles: ['admin'] },
];

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  const handleLogout = async () => {
    try {
      await logout();
      router.push('/');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const filteredNavigation = navigation.filter(item => 
    user && item.roles.includes(user.role)
  );

  const isActive = (href: string) => {
    if (href === '/dashboard') {
      return pathname === '/dashboard';
    }
    return pathname.startsWith(href);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Mobile sidebar */}
      <div className={`fixed inset-0 z-50 lg:hidden ${sidebarOpen ? 'block' : 'hidden'}`}>
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setSidebarOpen(false)} />
        <div className="fixed inset-y-0 left-0 flex w-72 flex-col bg-card border-r border-border shadow-xl">
          <div className="flex h-16 items-center justify-between px-6 border-b border-border">
            <Link href="/" className="text-xl font-bold text-gradient">
              {APP_NAME}
            </Link>
            <button
              onClick={() => setSidebarOpen(false)}
              className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
          <nav className="flex-1 space-y-2 px-4 py-6">
            {filteredNavigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  'nav-item group flex items-center px-4 py-3 text-sm font-medium rounded-xl transition-all duration-200',
                  isActive(item.href)
                    ? 'bg-primary text-primary-foreground shadow-md active'
                    : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
                )}
                onClick={() => setSidebarOpen(false)}
              >
                <item.icon className="mr-3 h-5 w-5 transition-transform group-hover:scale-110" />
                <span className="slide-in">{item.name}</span>
              </Link>
            ))}
          </nav>

          {/* User info in mobile sidebar */}
          <div className="p-4 border-t border-border">
            <div className="flex items-center space-x-3 p-3 rounded-lg bg-muted/50">
              <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                <span className="text-xs font-medium text-primary-foreground">
                  {user?.displayName?.charAt(0) || 'U'}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground truncate">
                  {user?.displayName || 'User'}
                </p>
                <p className="text-xs text-muted-foreground capitalize">
                  {user?.role?.replace('_', ' ')}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Desktop sidebar */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-72 lg:flex-col">
        <div className="flex flex-col flex-grow bg-card border-r border-border shadow-lg">
          <div className="flex h-16 items-center px-6 border-b border-border">
            <Link href="/" className="text-xl font-bold text-gradient">
              {APP_NAME}
            </Link>
          </div>
          <nav className="flex-1 space-y-2 px-4 py-6">
            {filteredNavigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  'nav-item group flex items-center px-4 py-3 text-sm font-medium rounded-xl transition-all duration-200',
                  isActive(item.href)
                    ? 'bg-primary text-primary-foreground shadow-md active'
                    : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
                )}
              >
                <item.icon className="mr-3 h-5 w-5 transition-transform group-hover:scale-110" />
                <span className="slide-in">{item.name}</span>
              </Link>
            ))}
          </nav>

          {/* User info in desktop sidebar */}
          <div className="p-4 border-t border-border">
            <div className="flex items-center space-x-3 p-3 rounded-lg bg-muted/50">
              <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center">
                <span className="text-sm font-medium text-primary-foreground">
                  {user?.displayName?.charAt(0) || 'U'}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground truncate">
                  {user?.displayName || 'User'}
                </p>
                <p className="text-xs text-muted-foreground capitalize">
                  {user?.role?.replace('_', ' ')}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="lg:pl-72">
        {/* Top navigation */}
        <div className="sticky top-0 z-40 bg-card/95 backdrop-blur-md shadow-sm border-b border-border">
          <div className="flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
            <button
              onClick={() => setSidebarOpen(true)}
              className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors lg:hidden"
            >
              <Menu className="h-5 w-5" />
            </button>

            <div className="flex items-center space-x-4">
              {/* Theme Toggle */}
              <ThemeToggle />

              {/* Notifications */}
              <div className="relative">
                <NotificationBell />
              </div>

              {/* Profile dropdown */}
              <div className="relative">
                <div className="flex items-center space-x-3 p-2 rounded-lg hover:bg-muted/50 transition-colors">
                  <div className="flex-shrink-0">
                    {user?.photoURL ? (
                      <img
                        className="h-9 w-9 rounded-full ring-2 ring-primary/20"
                        src={user.photoURL}
                        alt={user.displayName}
                      />
                    ) : (
                      <div className="h-9 w-9 rounded-full bg-gradient-to-br from-primary to-primary-hover flex items-center justify-center shadow-md">
                        <span className="text-sm font-medium text-primary-foreground">
                          {user?.displayName?.charAt(0).toUpperCase()}
                        </span>
                      </div>
                    )}
                  </div>
                  <div className="hidden md:block">
                    <div className="text-sm font-medium text-foreground">
                      {user?.displayName}
                    </div>
                    <div className="text-xs text-muted-foreground capitalize">
                      {user?.role?.replace('_', ' ')}
                    </div>
                  </div>
                </div>
              </div>

              {/* Settings and logout */}
              <div className="flex items-center space-x-1">
                <Link href="/dashboard/settings">
                  <Button variant="ghost" size="sm" className="rounded-lg">
                    <Settings className="h-4 w-4" />
                  </Button>
                </Link>
                <Button variant="ghost" size="sm" onClick={handleLogout} className="rounded-lg text-red-600 hover:text-red-700 hover:bg-red-50">
                  <LogOut className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Page content */}
        <main className="flex-1 min-h-screen">
          <div className="py-8">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="fade-in">
                {children}
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
