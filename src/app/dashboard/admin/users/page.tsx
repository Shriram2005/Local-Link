'use client';

import React, { useState, useEffect } from 'react';
import { Search, Filter, MoreVertical, Shield, Ban, CheckCircle, XCircle, Eye, Edit } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import { VerificationBadges } from '@/components/ui/VerificationBadge';
import { UserService } from '@/services/userService';
import { formatDate, formatRelativeTime, getErrorMessage } from '@/utils';
import { User, UserRole } from '@/types';

function AdminUsersContent() {
  const { user } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<UserRole | 'all'>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive' | 'pending'>('all');

  useEffect(() => {
    loadUsers();
  }, [searchQuery, roleFilter, statusFilter]);

  const loadUsers = async () => {
    try {
      setLoading(true);

      // Get users from UserService
      const allUsers = await UserService.getAllUsers();

      // Apply filters
      let filteredUsers = allUsers;

      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        filteredUsers = filteredUsers.filter(user =>
          user.displayName?.toLowerCase().includes(query) ||
          user.email.toLowerCase().includes(query)
        );
      }

      if (roleFilter !== 'all') {
        filteredUsers = filteredUsers.filter(user => user.role === roleFilter);
      }

      if (statusFilter !== 'all') {
        filteredUsers = filteredUsers.filter(user => {
          switch (statusFilter) {
            case 'active':
              return user.isActive;
            case 'inactive':
              return !user.isActive;
            case 'pending':
              return !user.isVerified;
            default:
              return true;
          }
        });
      }

      setUsers(filteredUsers);
      setError('');
    } catch (err) {
      console.error('Error loading users:', err);
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const handleUserAction = async (userId: string, action: 'activate' | 'deactivate' | 'verify' | 'approve' | 'reject') => {
    try {
      switch (action) {
        case 'activate':
          await UserService.updateUserStatus(userId, true);
          break;
        case 'deactivate':
          await UserService.updateUserStatus(userId, false);
          break;
        case 'verify':
          await UserService.verifyUser(userId);
          break;
        case 'approve':
          await UserService.approveProvider(userId);
          break;
        case 'reject':
          await UserService.rejectProvider(userId);
          break;
      }

      // Reload users after action
      await loadUsers();
    } catch (err) {
      console.error('Error performing user action:', err);
      setError(getErrorMessage(err));
    }
  };

  const getUserStatusColor = (user: User) => {
    if (!user.isActive) return 'bg-red-100 text-red-800';
    if (user.role === 'service_provider' && !(user as any).isApproved) return 'bg-yellow-100 text-yellow-800';
    return 'bg-green-100 text-green-800';
  };

  const getUserStatusLabel = (user: User) => {
    if (!user.isActive) return 'Inactive';
    if (user.role === 'service_provider' && !(user as any).isApproved) return 'Pending Approval';
    return 'Active';
  };

  if (user?.role !== 'admin') {
    return (
      <DashboardLayout>
        <div className="text-center py-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Access Denied</h2>
          <p className="text-gray-600">This page is only available for administrators.</p>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">User Management</h1>
            <p className="text-gray-600">Manage platform users and service providers</p>
          </div>
        </div>

        {/* Filters */}
        <Card>
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search users..."
                leftIcon={<Search className="h-4 w-4" />}
              />
              
              <select
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value as any)}
                className="px-3 py-2 border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-ring"
              >
                <option value="all">All Roles</option>
                <option value="customer">Customers</option>
                <option value="service_provider">Service Providers</option>
                <option value="admin">Administrators</option>
              </select>
              
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as any)}
                className="px-3 py-2 border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-ring"
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="pending">Pending Approval</option>
              </select>
              
              <Button variant="outline">
                <Filter className="h-4 w-4 mr-2" />
                More Filters
              </Button>
            </div>
          </CardContent>
        </Card>

        {error && (
          <div className="bg-destructive/10 border border-destructive/20 text-destructive px-4 py-3 rounded-md text-sm">
            {error}
          </div>
        )}

        {/* Users Table */}
        <Card>
          <CardHeader>
            <CardTitle>Users ({users.length})</CardTitle>
            <CardDescription>Platform users and their details</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="space-y-4">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="animate-pulse flex items-center space-x-4 p-4 border rounded-lg">
                    <div className="w-12 h-12 bg-gray-200 rounded-full"></div>
                    <div className="flex-1 space-y-2">
                      <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                      <div className="h-3 bg-gray-200 rounded w-1/3"></div>
                    </div>
                    <div className="h-6 bg-gray-200 rounded w-20"></div>
                  </div>
                ))}
              </div>
            ) : users.length === 0 ? (
              <div className="text-center py-8">
                <Search className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No users found</h3>
                <p className="text-gray-600">Try adjusting your search criteria</p>
              </div>
            ) : (
              <div className="space-y-4">
                {users.map((userData) => (
                  <div key={userData.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50">
                    <div className="flex items-center space-x-4 flex-1">
                      <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center">
                        <span className="text-sm font-medium text-white">
                          {userData.displayName?.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      
                      <div className="flex-1">
                        <div className="flex items-center space-x-2">
                          <h4 className="font-medium text-gray-900">
                            {(userData as any).businessName || userData.displayName}
                          </h4>
                          {userData.verificationBadges && userData.verificationBadges.length > 0 && (
                            <VerificationBadges badges={userData.verificationBadges} size="sm" maxDisplay={2} />
                          )}
                        </div>
                        <div className="flex items-center space-x-4 text-sm text-gray-500">
                          <span>{userData.email}</span>
                          <span className="capitalize">{userData.role.replace('_', ' ')}</span>
                          {userData.role === 'service_provider' && (userData as any).rating && (
                            <span>★ {(userData as any).rating} ({(userData as any).reviewCount} reviews)</span>
                          )}
                          <span>Joined {formatRelativeTime(userData.createdAt.toDate())}</span>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-4">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getUserStatusColor(userData)}`}>
                          {getUserStatusLabel(userData)}
                        </span>
                        
                        <div className="relative group">
                          <button className="p-1 rounded hover:bg-gray-100">
                            <MoreVertical className="h-4 w-4" />
                          </button>
                          <div className="absolute right-0 top-8 bg-white border rounded-md shadow-lg py-1 z-10 hidden group-hover:block min-w-[150px]">
                            <button className="flex items-center w-full px-4 py-2 text-sm hover:bg-gray-50">
                              <Eye className="h-4 w-4 mr-2" />
                              View Details
                            </button>
                            <button className="flex items-center w-full px-4 py-2 text-sm hover:bg-gray-50">
                              <Edit className="h-4 w-4 mr-2" />
                              Edit User
                            </button>
                            {userData.role === 'service_provider' && !(userData as any).isApproved && (
                              <button
                                onClick={() => approveProvider(userData.id)}
                                className="flex items-center w-full px-4 py-2 text-sm text-green-600 hover:bg-green-50"
                              >
                                <CheckCircle className="h-4 w-4 mr-2" />
                                Approve Provider
                              </button>
                            )}
                            {userData.isActive ? (
                              <button
                                onClick={() => updateUserStatus(userData.id, false)}
                                className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                              >
                                <Ban className="h-4 w-4 mr-2" />
                                Deactivate
                              </button>
                            ) : (
                              <button
                                onClick={() => updateUserStatus(userData.id, true)}
                                className="flex items-center w-full px-4 py-2 text-sm text-green-600 hover:bg-green-50"
                              >
                                <CheckCircle className="h-4 w-4 mr-2" />
                                Activate
                              </button>
                            )}
                            <button className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50">
                              <XCircle className="h-4 w-4 mr-2" />
                              Delete User
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}

export default function AdminUsersPage() {
  return (
    <ProtectedRoute allowedRoles={['admin']}>
      <AdminUsersContent />
    </ProtectedRoute>
  );
}
