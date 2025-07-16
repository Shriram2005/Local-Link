'use client';

import React, { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { UserRole } from '@/types';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: UserRole[];
  requireAuth?: boolean;
  redirectTo?: string;
}

export default function ProtectedRoute({
  children,
  allowedRoles,
  requireAuth = true,
  redirectTo,
}: ProtectedRouteProps) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (loading) return;

    // If authentication is required but user is not logged in
    if (requireAuth && !user) {
      const loginUrl = `/auth/login?redirect=${encodeURIComponent(pathname)}`;
      router.push(redirectTo || loginUrl);
      return;
    }

    // If user is logged in but doesn't have required role
    if (user && allowedRoles && !allowedRoles.includes(user.role)) {
      // Redirect based on user role
      const roleRedirects: Record<UserRole, string> = {
        customer: '/dashboard/customer',
        service_provider: '/dashboard/provider',
        admin: '/dashboard/admin',
      };
      
      router.push(roleRedirects[user.role] || '/dashboard');
      return;
    }

    // If user is logged in but trying to access auth pages
    if (!requireAuth && user && pathname.startsWith('/auth')) {
      const roleRedirects: Record<UserRole, string> = {
        customer: '/dashboard/customer',
        service_provider: '/dashboard/provider',
        admin: '/dashboard/admin',
      };
      
      router.push(roleRedirects[user.role] || '/dashboard');
      return;
    }
  }, [user, loading, requireAuth, allowedRoles, router, pathname, redirectTo]);

  // Show loading spinner while checking authentication
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="spinner mx-auto mb-4" style={{ width: '40px', height: '40px' }} />
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // If authentication is required but user is not logged in, don't render children
  if (requireAuth && !user) {
    return null;
  }

  // If user doesn't have required role, don't render children
  if (user && allowedRoles && !allowedRoles.includes(user.role)) {
    return null;
  }

  // If user is logged in but trying to access auth pages, don't render children
  if (!requireAuth && user && pathname.startsWith('/auth')) {
    return null;
  }

  return <>{children}</>;
}

// Higher-order component for easier usage
export function withAuth<P extends object>(
  Component: React.ComponentType<P>,
  options?: Omit<ProtectedRouteProps, 'children'>
) {
  return function AuthenticatedComponent(props: P) {
    return (
      <ProtectedRoute {...options}>
        <Component {...props} />
      </ProtectedRoute>
    );
  };
}

// Role-specific HOCs
export function withCustomerAuth<P extends object>(Component: React.ComponentType<P>) {
  return withAuth(Component, { allowedRoles: ['customer'] });
}

export function withProviderAuth<P extends object>(Component: React.ComponentType<P>) {
  return withAuth(Component, { allowedRoles: ['service_provider'] });
}

export function withAdminAuth<P extends object>(Component: React.ComponentType<P>) {
  return withAuth(Component, { allowedRoles: ['admin'] });
}

export function withAnyAuth<P extends object>(Component: React.ComponentType<P>) {
  return withAuth(Component, { allowedRoles: ['customer', 'service_provider', 'admin'] });
}
