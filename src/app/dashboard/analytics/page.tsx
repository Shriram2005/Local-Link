'use client';

import React, { useState, useEffect } from 'react';
import { TrendingUp, Users, DollarSign, Calendar, BarChart3, PieChart, Download, RefreshCw } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import Button from '@/components/ui/Button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import { formatCurrency, formatDate, getErrorMessage } from '@/utils';

function AnalyticsContent() {
  const { user } = useAuth();
  const [analytics, setAnalytics] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d' | '1y'>('30d');

  useEffect(() => {
    loadAnalytics();
  }, [timeRange]);

  const loadAnalytics = async () => {
    try {
      setLoading(true);
      
      // Mock analytics data for demo
      const mockAnalytics = {
        overview: {
          totalUsers: 1234,
          totalProviders: 456,
          totalBookings: 2890,
          totalRevenue: 145678.50,
          growthMetrics: {
            usersGrowth: 12.5,
            providersGrowth: 8.3,
            bookingsGrowth: 15.7,
            revenueGrowth: 22.1,
          },
        },
        userMetrics: {
          newUsers: [
            { date: '2024-01-01', customers: 45, providers: 12 },
            { date: '2024-01-02', customers: 52, providers: 8 },
            { date: '2024-01-03', customers: 38, providers: 15 },
            { date: '2024-01-04', customers: 61, providers: 10 },
            { date: '2024-01-05', customers: 47, providers: 18 },
            { date: '2024-01-06', customers: 55, providers: 14 },
            { date: '2024-01-07', customers: 42, providers: 11 },
          ],
          userDistribution: {
            customers: 778,
            providers: 456,
          },
          topLocations: [
            { city: 'New York', users: 234 },
            { city: 'Los Angeles', users: 189 },
            { city: 'Chicago', users: 156 },
            { city: 'Houston', users: 134 },
            { city: 'Phoenix', users: 98 },
          ],
        },
        bookingMetrics: {
          bookingsByStatus: {
            completed: 1890,
            confirmed: 234,
            pending: 156,
            cancelled: 610,
          },
          bookingsByCategory: [
            { category: 'Home Services', count: 1245, revenue: 78900 },
            { category: 'Personal Services', count: 890, revenue: 45600 },
            { category: 'Professional Services', count: 567, revenue: 34500 },
            { category: 'Automotive', count: 188, revenue: 12300 },
          ],
          averageBookingValue: 89.50,
          bookingTrends: [
            { date: '2024-01-01', bookings: 45, revenue: 4025 },
            { date: '2024-01-02', bookings: 52, revenue: 4654 },
            { date: '2024-01-03', bookings: 38, revenue: 3401 },
            { date: '2024-01-04', bookings: 61, revenue: 5459 },
            { date: '2024-01-05', bookings: 47, revenue: 4208 },
            { date: '2024-01-06', bookings: 55, revenue: 4923 },
            { date: '2024-01-07', bookings: 42, revenue: 3759 },
          ],
        },
        revenueMetrics: {
          totalRevenue: 145678.50,
          platformCommission: 7283.93,
          providerEarnings: 138394.57,
          monthlyRevenue: [
            { month: 'Jan', revenue: 12456.78 },
            { month: 'Feb', revenue: 13789.45 },
            { month: 'Mar', revenue: 15234.67 },
            { month: 'Apr', revenue: 14567.89 },
            { month: 'May', revenue: 16789.12 },
            { month: 'Jun', revenue: 18234.56 },
          ],
          topEarningProviders: [
            { name: 'CleanPro Services', earnings: 5678.90 },
            { name: 'Expert Plumbing', earnings: 4567.80 },
            { name: 'FitLife Training', earnings: 3456.70 },
            { name: 'Green Thumb Gardens', earnings: 2345.60 },
            { name: 'Tech Support Pro', earnings: 1234.50 },
          ],
        },
      };
      
      setAnalytics(mockAnalytics);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
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
            <h1 className="text-2xl font-bold text-gray-900">Analytics Dashboard</h1>
            <p className="text-gray-600">Platform performance and insights</p>
          </div>
          <div className="flex items-center space-x-4">
            <select
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value as any)}
              className="px-3 py-2 border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-ring"
            >
              <option value="7d">Last 7 days</option>
              <option value="30d">Last 30 days</option>
              <option value="90d">Last 90 days</option>
              <option value="1y">Last year</option>
            </select>
            <Button variant="outline" onClick={loadAnalytics}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
            <Button>
              <Download className="h-4 w-4 mr-2" />
              Export Report
            </Button>
          </div>
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
        ) : analytics && (
          <>
            {/* Overview Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Users</CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{analytics.overview.totalUsers.toLocaleString()}</div>
                  <p className="text-xs text-muted-foreground">
                    <span className="text-green-600">+{analytics.overview.growthMetrics.usersGrowth}%</span> from last period
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Service Providers</CardTitle>
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{analytics.overview.totalProviders.toLocaleString()}</div>
                  <p className="text-xs text-muted-foreground">
                    <span className="text-green-600">+{analytics.overview.growthMetrics.providersGrowth}%</span> from last period
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Bookings</CardTitle>
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{analytics.overview.totalBookings.toLocaleString()}</div>
                  <p className="text-xs text-muted-foreground">
                    <span className="text-green-600">+{analytics.overview.growthMetrics.bookingsGrowth}%</span> from last period
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{formatCurrency(analytics.overview.totalRevenue)}</div>
                  <p className="text-xs text-muted-foreground">
                    <span className="text-green-600">+{analytics.overview.growthMetrics.revenueGrowth}%</span> from last period
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Charts and Detailed Analytics */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* User Distribution */}
              <Card>
                <CardHeader>
                  <CardTitle>User Distribution</CardTitle>
                  <CardDescription>Breakdown of platform users</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                        <span className="text-sm">Customers</span>
                      </div>
                      <span className="font-medium">{analytics.userMetrics.userDistribution.customers}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                        <span className="text-sm">Service Providers</span>
                      </div>
                      <span className="font-medium">{analytics.userMetrics.userDistribution.providers}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Booking Status */}
              <Card>
                <CardHeader>
                  <CardTitle>Booking Status</CardTitle>
                  <CardDescription>Current booking distribution</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {Object.entries(analytics.bookingMetrics.bookingsByStatus).map(([status, count]) => (
                      <div key={status} className="flex items-center justify-between">
                        <span className="text-sm capitalize">{status}</span>
                        <span className="font-medium">{count as number}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Top Locations */}
              <Card>
                <CardHeader>
                  <CardTitle>Top Locations</CardTitle>
                  <CardDescription>Cities with most users</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {analytics.userMetrics.topLocations.map((location: any, index: number) => (
                      <div key={location.city} className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <span className="text-sm font-medium">#{index + 1}</span>
                          <span className="text-sm">{location.city}</span>
                        </div>
                        <span className="font-medium">{location.users}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Top Earning Providers */}
              <Card>
                <CardHeader>
                  <CardTitle>Top Earning Providers</CardTitle>
                  <CardDescription>Highest earning service providers</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {analytics.revenueMetrics.topEarningProviders.map((provider: any, index: number) => (
                      <div key={provider.name} className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <span className="text-sm font-medium">#{index + 1}</span>
                          <span className="text-sm">{provider.name}</span>
                        </div>
                        <span className="font-medium">{formatCurrency(provider.earnings)}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Category Performance */}
            <Card>
              <CardHeader>
                <CardTitle>Category Performance</CardTitle>
                <CardDescription>Bookings and revenue by service category</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {analytics.bookingMetrics.bookingsByCategory.map((category: any) => (
                    <div key={category.category} className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <h4 className="font-medium">{category.category}</h4>
                        <p className="text-sm text-gray-500">{category.count} bookings</p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">{formatCurrency(category.revenue)}</p>
                        <p className="text-sm text-gray-500">
                          Avg: {formatCurrency(category.revenue / category.count)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Revenue Breakdown */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Platform Commission</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{formatCurrency(analytics.revenueMetrics.platformCommission)}</div>
                  <p className="text-sm text-gray-500">5% of total revenue</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Provider Earnings</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{formatCurrency(analytics.revenueMetrics.providerEarnings)}</div>
                  <p className="text-sm text-gray-500">95% of total revenue</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Average Booking Value</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{formatCurrency(analytics.bookingMetrics.averageBookingValue)}</div>
                  <p className="text-sm text-gray-500">Per booking</p>
                </CardContent>
              </Card>
            </div>
          </>
        )}
      </div>
    </DashboardLayout>
  );
}

export default function AnalyticsPage() {
  return (
    <ProtectedRoute allowedRoles={['admin']}>
      <AnalyticsContent />
    </ProtectedRoute>
  );
}
