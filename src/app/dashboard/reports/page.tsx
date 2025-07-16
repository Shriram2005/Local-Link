'use client';

import React, { useState, useEffect } from 'react';
import { BarChart3, TrendingUp, Download, Filter, Calendar, Users, DollarSign, Star } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import Button from '@/components/ui/Button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import { AnalyticsService, AnalyticsData } from '@/services/analyticsService';
import { formatCurrency, formatDate, getErrorMessage } from '@/utils';

function ReportsContent() {
  const { user } = useAuth();
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [dateRange, setDateRange] = useState<'7d' | '30d' | '90d' | '1y'>('30d');
  const [reportType, setReportType] = useState<'overview' | 'users' | 'bookings' | 'revenue' | 'performance'>('overview');

  useEffect(() => {
    loadAnalyticsData();
  }, [dateRange]);

  const loadAnalyticsData = async () => {
    try {
      setLoading(true);
      
      const endDate = new Date();
      const startDate = new Date();
      
      switch (dateRange) {
        case '7d':
          startDate.setDate(endDate.getDate() - 7);
          break;
        case '30d':
          startDate.setDate(endDate.getDate() - 30);
          break;
        case '90d':
          startDate.setDate(endDate.getDate() - 90);
          break;
        case '1y':
          startDate.setFullYear(endDate.getFullYear() - 1);
          break;
      }
      
      const data = await AnalyticsService.getAnalyticsData(startDate, endDate);
      setAnalyticsData(data);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const exportReport = async (format: 'csv' | 'excel' | 'pdf') => {
    try {
      const endDate = new Date();
      const startDate = new Date();
      startDate.setDate(endDate.getDate() - 30);
      
      const blob = await AnalyticsService.exportAnalyticsData(format, 'all', startDate, endDate);
      
      // Create download link
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `locallink-report-${formatDate(new Date(), 'yyyy-MM-dd')}.${format === 'excel' ? 'xlsx' : format}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err) {
      setError(getErrorMessage(err));
    }
  };

  const renderOverviewReport = () => {
    if (!analyticsData) return null;

    return (
      <div className="space-y-6">
        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Users</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{analyticsData.userMetrics.totalUsers.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">
                <span className="text-green-600">+{analyticsData.userMetrics.userGrowthRate}%</span> from last period
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Bookings</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{analyticsData.bookingMetrics.totalBookings.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">
                {analyticsData.bookingMetrics.bookingCompletionRate}% completion rate
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(analyticsData.revenueMetrics.totalRevenue)}</div>
              <p className="text-xs text-muted-foreground">
                <span className="text-green-600">+{analyticsData.revenueMetrics.revenueGrowthRate}%</span> growth
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Avg. Rating</CardTitle>
              <Star className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{analyticsData.performanceMetrics.serviceQualityScore}</div>
              <p className="text-xs text-muted-foreground">
                Service quality score
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Charts and Detailed Data */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* User Growth */}
          <Card>
            <CardHeader>
              <CardTitle>User Growth</CardTitle>
              <CardDescription>New user registrations over time</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {analyticsData.userMetrics.userRegistrationTrend.slice(-7).map((data, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <span className="text-sm">{formatDate(new Date(data.date), 'MMM d')}</span>
                    <div className="flex items-center space-x-2">
                      <div className="w-32 bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-blue-500 h-2 rounded-full" 
                          style={{ width: `${(data.count! / 50) * 100}%` }}
                        ></div>
                      </div>
                      <span className="text-sm font-medium w-8">{data.count}</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Revenue by Category */}
          <Card>
            <CardHeader>
              <CardTitle>Revenue by Category</CardTitle>
              <CardDescription>Revenue distribution across service categories</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {analyticsData.revenueMetrics.revenueByCategory.map((category) => (
                  <div key={category.category} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">{category.category}</span>
                      <span className="text-sm">{formatCurrency(category.revenue)}</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-green-500 h-2 rounded-full" 
                        style={{ width: `${category.percentage}%` }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Top Performing Providers */}
          <Card>
            <CardHeader>
              <CardTitle>Top Performing Providers</CardTitle>
              <CardDescription>Highest rated and most booked providers</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {analyticsData.performanceMetrics.topPerformingProviders.slice(0, 5).map((provider, index) => (
                  <div key={provider.name} className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <span className="text-sm font-medium">#{index + 1}</span>
                      <div>
                        <p className="text-sm font-medium">{provider.name}</p>
                        <p className="text-xs text-gray-500">★ {provider.rating} • {provider.bookings} bookings</p>
                      </div>
                    </div>
                    <span className="text-sm font-medium">{formatCurrency(provider.revenue)}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Geographic Distribution */}
          <Card>
            <CardHeader>
              <CardTitle>Geographic Distribution</CardTitle>
              <CardDescription>Services by location</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {analyticsData.geographicMetrics.servicesByLocation.slice(0, 5).map((location) => (
                  <div key={`${location.city}-${location.state}`} className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium">{location.city}, {location.state}</p>
                      <p className="text-xs text-gray-500">{location.serviceCount} services</p>
                    </div>
                    <span className="text-sm font-medium">{formatCurrency(location.revenue)}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  };

  const renderUserReport = () => {
    if (!analyticsData) return null;

    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>User Distribution</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {Object.entries(analyticsData.userMetrics.usersByRole).map(([role, count]) => (
                  <div key={role} className="flex items-center justify-between">
                    <span className="text-sm capitalize">{role.replace('_', ' ')}</span>
                    <span className="font-medium">{count}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>User Metrics</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Active Users</span>
                  <span className="font-medium">{analyticsData.userMetrics.activeUsers}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">New Users</span>
                  <span className="font-medium">{analyticsData.userMetrics.newUsers}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Retention Rate</span>
                  <span className="font-medium">{analyticsData.userMetrics.userRetentionRate}%</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Growth Rate</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center">
                <div className="text-3xl font-bold text-green-600">
                  +{analyticsData.userMetrics.userGrowthRate}%
                </div>
                <p className="text-sm text-gray-500">This period</p>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Top Locations</CardTitle>
            <CardDescription>Cities with most users</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {analyticsData.userMetrics.usersByLocation.map((location, index) => (
                <div key={location.location} className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <span className="text-sm font-medium">#{index + 1}</span>
                    <span className="text-sm">{location.location}</span>
                  </div>
                  <span className="font-medium">{location.count}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    );
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
            <h1 className="text-2xl font-bold text-gray-900">Reports & Analytics</h1>
            <p className="text-gray-600">Comprehensive platform insights and reporting</p>
          </div>
          
          <div className="flex items-center space-x-4">
            <select
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value as any)}
              className="px-3 py-2 border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-ring"
            >
              <option value="7d">Last 7 days</option>
              <option value="30d">Last 30 days</option>
              <option value="90d">Last 90 days</option>
              <option value="1y">Last year</option>
            </select>
            
            <div className="relative group">
              <Button variant="outline">
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
              <div className="absolute right-0 top-8 bg-white border rounded-md shadow-lg py-1 z-10 hidden group-hover:block min-w-[120px]">
                <button
                  onClick={() => exportReport('csv')}
                  className="block w-full text-left px-4 py-2 text-sm hover:bg-gray-50"
                >
                  Export CSV
                </button>
                <button
                  onClick={() => exportReport('excel')}
                  className="block w-full text-left px-4 py-2 text-sm hover:bg-gray-50"
                >
                  Export Excel
                </button>
                <button
                  onClick={() => exportReport('pdf')}
                  className="block w-full text-left px-4 py-2 text-sm hover:bg-gray-50"
                >
                  Export PDF
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Report Type Tabs */}
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            {[
              { key: 'overview', label: 'Overview', icon: BarChart3 },
              { key: 'users', label: 'Users', icon: Users },
              { key: 'bookings', label: 'Bookings', icon: Calendar },
              { key: 'revenue', label: 'Revenue', icon: DollarSign },
              { key: 'performance', label: 'Performance', icon: TrendingUp },
            ].map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.key}
                  onClick={() => setReportType(tab.key as any)}
                  className={`flex items-center space-x-2 py-2 px-1 border-b-2 font-medium text-sm ${
                    reportType === tab.key
                      ? 'border-primary text-primary'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {error && (
          <div className="bg-destructive/10 border border-destructive/20 text-destructive px-4 py-3 rounded-md text-sm">
            {error}
          </div>
        )}

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => (
              <Card key={i} className="animate-pulse">
                <CardHeader>
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                </CardHeader>
                <CardContent>
                  <div className="h-8 bg-gray-200 rounded w-1/2"></div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <>
            {reportType === 'overview' && renderOverviewReport()}
            {reportType === 'users' && renderUserReport()}
            {/* Add other report types as needed */}
          </>
        )}
      </div>
    </DashboardLayout>
  );
}

export default function ReportsPage() {
  return (
    <ProtectedRoute allowedRoles={['admin']}>
      <ReportsContent />
    </ProtectedRoute>
  );
}
