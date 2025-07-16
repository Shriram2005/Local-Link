'use client';

import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import StatsCard from '@/components/ui/StatsCard';
import {
  Calendar,
  MessageSquare,
  Star,
  TrendingUp,
  Users,
  DollarSign,
  Clock,
  CheckCircle,
  Search,
  Plus,
  Settings,
  BookOpen,
  Heart,
  MapPin,
  AlertCircle,
  ArrowUpRight,
  CreditCard,
  Activity
} from 'lucide-react';
import Link from 'next/link';

function DashboardContent() {
  const { user } = useAuth();

  const renderCustomerDashboard = () => (
    <div className="space-y-8">
      {/* Welcome Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold text-foreground">
            Welcome back, <span className="text-gradient">{user?.displayName}!</span>
          </h1>
          <p className="text-muted-foreground text-lg">Find and book local services with ease</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3">
          <Link href="/dashboard/search">
            <Button size="lg" className="w-full sm:w-auto">
              <Search className="h-5 w-5 mr-2" />
              Find Services
            </Button>
          </Link>
          <Link href="/dashboard/bookings">
            <Button variant="outline" size="lg" className="w-full sm:w-auto">
              <Calendar className="h-5 w-5 mr-2" />
              My Bookings
            </Button>
          </Link>
        </div>
      </div>

      {/* Enhanced Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard
          title="Active Bookings"
          value={3}
          change={{ value: "+2 this week", type: "increase" }}
          icon={Calendar}
          description="Upcoming appointments"
          variant="gradient"
        />

        <StatsCard
          title="Completed Services"
          value={12}
          change={{ value: "+2 from last month", type: "increase" }}
          icon={CheckCircle}
          description="Successfully completed"
        />

        <StatsCard
          title="Messages"
          value={5}
          change={{ value: "2 unread", type: "neutral" }}
          icon={MessageSquare}
          description="Active conversations"
        />

        <StatsCard
          title="Total Spent"
          value="$1,234"
          change={{ value: "+$234 this month", type: "increase" }}
          icon={DollarSign}
          description="This year"
          variant="outlined"
        />
      </div>

      {/* Enhanced Activity Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Card variant="elevated" hover>
          <CardHeader gradient>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-primary" />
              Recent Bookings
            </CardTitle>
            <CardDescription>Your latest service appointments</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center space-x-4 p-3 rounded-lg bg-green-50 border border-green-200">
                <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-green-900">House Cleaning</p>
                  <p className="text-xs text-green-700">Tomorrow at 10:00 AM</p>
                </div>
                <span className="text-xs font-medium text-green-600 bg-green-100 px-2 py-1 rounded-full">Confirmed</span>
              </div>
              <div className="flex items-center space-x-4 p-3 rounded-lg bg-blue-50 border border-blue-200">
                <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-blue-900">Plumbing Repair</p>
                  <p className="text-xs text-blue-700">Dec 20 at 2:00 PM</p>
                </div>
                <span className="text-xs font-medium text-blue-600 bg-blue-100 px-2 py-1 rounded-full">Pending</span>
              </div>
              <div className="flex items-center space-x-4 p-3 rounded-lg bg-gray-50 border border-gray-200">
                <div className="w-3 h-3 bg-gray-500 rounded-full"></div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">Garden Maintenance</p>
                  <p className="text-xs text-gray-700">Dec 15 - Completed</p>
                </div>
                <span className="text-xs font-medium text-gray-600 bg-gray-100 px-2 py-1 rounded-full">Completed</span>
              </div>
            </div>
            <div className="mt-6">
              <Link href="/dashboard/bookings">
                <Button variant="outline" size="sm" className="w-full group">
                  View All Bookings
                  <ArrowUpRight className="h-4 w-4 ml-2 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>

        <Card variant="elevated" hover>
          <CardHeader gradient>
            <CardTitle className="flex items-center gap-2">
              <Heart className="h-5 w-5 text-primary" />
              Favorite Providers
            </CardTitle>
            <CardDescription>Service providers you love working with</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center space-x-4 p-3 rounded-lg border border-border hover:border-primary/50 transition-colors">
                <div className="w-12 h-12 bg-gradient-to-br from-primary to-primary-hover rounded-full flex items-center justify-center shadow-md">
                  <span className="text-sm font-medium text-primary-foreground">JD</span>
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-foreground">John's Cleaning Service</p>
                  <div className="flex items-center gap-1">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="h-3 w-3 text-yellow-400 fill-current" />
                    ))}
                    <span className="text-xs text-muted-foreground ml-1">4.9 (23 reviews)</span>
                  </div>
                </div>
                <Button variant="ghost" size="sm" className="text-primary hover:text-primary-hover">
                  <Heart className="h-4 w-4" />
                </Button>
              </div>
              <div className="flex items-center space-x-4 p-3 rounded-lg border border-border hover:border-primary/50 transition-colors">
                <div className="w-12 h-12 bg-gradient-to-br from-secondary to-secondary-hover rounded-full flex items-center justify-center shadow-md">
                  <span className="text-sm font-medium text-secondary-foreground">MP</span>
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-foreground">Mike's Plumbing</p>
                  <div className="flex items-center gap-1">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className={`h-3 w-3 ${i < 4 ? 'text-yellow-400 fill-current' : 'text-gray-300'}`} />
                    ))}
                    <span className="text-xs text-muted-foreground ml-1">4.8 (15 reviews)</span>
                  </div>
                </div>
                <Button variant="ghost" size="sm" className="text-primary hover:text-primary-hover">
                  <Heart className="h-4 w-4" />
                </Button>
              </div>
            </div>
            <div className="mt-6">
              <Link href="/dashboard/search">
                <Button variant="outline" size="sm" className="w-full group">
                  Find More Providers
                  <Search className="h-4 w-4 ml-2 group-hover:scale-110 transition-transform" />
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );

  const renderProviderDashboard = () => (
    <div className="space-y-8">
      {/* Provider Welcome Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold text-foreground">
            Welcome back, <span className="text-gradient">{user?.displayName}!</span>
          </h1>
          <p className="text-muted-foreground text-lg">Manage your services and grow your business</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3">
          <Link href="/dashboard/services/new">
            <Button size="lg" className="w-full sm:w-auto">
              <Plus className="h-5 w-5 mr-2" />
              Add Service
            </Button>
          </Link>
          <Link href="/dashboard/analytics">
            <Button variant="outline" size="lg" className="w-full sm:w-auto">
              <TrendingUp className="h-5 w-5 mr-2" />
              View Analytics
            </Button>
          </Link>
        </div>
      </div>

      {/* Enhanced Provider Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard
          title="Active Services"
          value={8}
          change={{ value: "2 pending approval", type: "neutral" }}
          icon={Star}
          description="Published services"
          variant="gradient"
        />

        <StatsCard
          title="This Month's Bookings"
          value={24}
          change={{ value: "+12% from last month", type: "increase" }}
          icon={Calendar}
          description="New appointments"
        />

        <StatsCard
          title="Average Rating"
          value="4.8"
          change={{ value: "Based on 47 reviews", type: "neutral" }}
          icon={Star}
          description="Customer satisfaction"
          variant="outlined"
        />

        <StatsCard
          title="Monthly Revenue"
          value="$3,456"
          change={{ value: "+8% from last month", type: "increase" }}
          icon={DollarSign}
          description="This month's earnings"
        />
      </div>

      {/* Enhanced Provider Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Card variant="elevated" hover>
          <CardHeader gradient>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-primary" />
              Recent Bookings
            </CardTitle>
            <CardDescription>Your latest service appointments</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center space-x-4 p-3 rounded-lg bg-green-50 border border-green-200">
                <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-green-900">House Cleaning - Sarah M.</p>
                  <p className="text-xs text-green-700">Tomorrow at 10:00 AM</p>
                </div>
                <span className="text-xs font-medium text-green-600 bg-green-100 px-2 py-1 rounded-full">Confirmed</span>
              </div>
              <div className="flex items-center space-x-4 p-3 rounded-lg bg-blue-50 border border-blue-200">
                <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-blue-900">Garden Work - Mike R.</p>
                  <p className="text-xs text-blue-700">Dec 20 at 2:00 PM</p>
                </div>
                <span className="text-xs font-medium text-blue-600 bg-blue-100 px-2 py-1 rounded-full">Pending</span>
              </div>
              <div className="flex items-center space-x-4 p-3 rounded-lg bg-gray-50 border border-gray-200">
                <div className="w-3 h-3 bg-gray-500 rounded-full"></div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">Plumbing - John D.</p>
                  <p className="text-xs text-gray-700">Dec 18 - Completed</p>
                </div>
                <span className="text-xs font-medium text-gray-600 bg-gray-100 px-2 py-1 rounded-full">Completed</span>
              </div>
            </div>
            <div className="mt-6">
              <Link href="/dashboard/bookings">
                <Button variant="outline" size="sm" className="w-full group">
                  View All Bookings
                  <ArrowUpRight className="h-4 w-4 ml-2 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>

        <Card variant="elevated" hover>
          <CardHeader gradient>
            <CardTitle className="flex items-center gap-2">
              <Star className="h-5 w-5 text-primary" />
              Recent Reviews
            </CardTitle>
            <CardDescription>What customers are saying about your services</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="border-l-4 border-green-500 pl-4 p-3 bg-green-50 rounded-r-lg">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-1">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="h-4 w-4 text-yellow-400 fill-current" />
                    ))}
                  </div>
                  <span className="text-xs text-muted-foreground">2 days ago</span>
                </div>
                <p className="text-sm text-green-900 font-medium mb-1">"Excellent service! Very professional and thorough."</p>
                <p className="text-xs text-green-700">- Sarah M.</p>
              </div>
              <div className="border-l-4 border-blue-500 pl-4 p-3 bg-blue-50 rounded-r-lg">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-1">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className={`h-4 w-4 ${i < 4 ? 'text-yellow-400 fill-current' : 'text-gray-300'}`} />
                    ))}
                  </div>
                  <span className="text-xs text-muted-foreground">1 week ago</span>
                </div>
                <p className="text-sm text-blue-900 font-medium mb-1">"Great work on the garden cleanup. Will book again!"</p>
                <p className="text-xs text-blue-700">- Mike R.</p>
              </div>
            </div>
            <div className="mt-6">
              <Link href="/dashboard/reviews">
                <Button variant="outline" size="sm" className="w-full group">
                  View All Reviews
                  <Star className="h-4 w-4 ml-2 group-hover:scale-110 transition-transform" />
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );

  const renderAdminDashboard = () => (
    <div className="space-y-8">
      {/* Admin Welcome Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold text-foreground">
            <span className="text-gradient">Admin Dashboard</span>
          </h1>
          <p className="text-muted-foreground text-lg">Manage and monitor the LocalLink platform</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3">
          <Link href="/dashboard/analytics">
            <Button size="lg" className="w-full sm:w-auto">
              <TrendingUp className="h-5 w-5 mr-2" />
              View Analytics
            </Button>
          </Link>
          <Link href="/dashboard/reports">
            <Button variant="outline" size="lg" className="w-full sm:w-auto">
              <Activity className="h-5 w-5 mr-2" />
              Generate Reports
            </Button>
          </Link>
        </div>
      </div>

      {/* Enhanced Admin Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard
          title="Total Users"
          value="1,234"
          change={{ value: "+12% from last month", type: "increase" }}
          icon={Users}
          description="Registered users"
          variant="gradient"
        />

        <StatsCard
          title="Active Providers"
          value={456}
          change={{ value: "23 pending approval", type: "neutral" }}
          icon={Star}
          description="Service providers"
        />

        <StatsCard
          title="Monthly Revenue"
          value="$45,678"
          change={{ value: "+18% from last month", type: "increase" }}
          icon={DollarSign}
          description="Platform earnings"
          variant="outlined"
        />

        <StatsCard
          title="Total Bookings"
          value="2,891"
          change={{ value: "+24% from last month", type: "increase" }}
          icon={Calendar}
          description="This month"
        />
      </div>

      {/* Enhanced Admin Management */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Card variant="elevated" hover>
          <CardHeader gradient>
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-primary" />
              Pending Approvals
            </CardTitle>
            <CardDescription>Items requiring immediate attention</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 rounded-lg bg-red-50 border border-red-200">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                  <span className="text-sm font-medium text-red-900">Service Provider Applications</span>
                </div>
                <span className="bg-red-100 text-red-800 text-xs font-medium px-3 py-1 rounded-full">23</span>
              </div>
              <div className="flex items-center justify-between p-3 rounded-lg bg-yellow-50 border border-yellow-200">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                  <span className="text-sm font-medium text-yellow-900">Reported Reviews</span>
                </div>
                <span className="bg-yellow-100 text-yellow-800 text-xs font-medium px-3 py-1 rounded-full">5</span>
              </div>
              <div className="flex items-center justify-between p-3 rounded-lg bg-blue-50 border border-blue-200">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <span className="text-sm font-medium text-blue-900">Support Tickets</span>
                </div>
                <span className="bg-blue-100 text-blue-800 text-xs font-medium px-3 py-1 rounded-full">12</span>
              </div>
            </div>
            <div className="mt-6">
              <Link href="/dashboard/moderation">
                <Button variant="outline" size="sm" className="w-full group">
                  Review All Items
                  <ArrowUpRight className="h-4 w-4 ml-2 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>

        <Card variant="elevated" hover>
          <CardHeader gradient>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5 text-primary" />
              Quick Actions
            </CardTitle>
            <CardDescription>Common administrative tasks and shortcuts</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <Link href="/dashboard/admin/users">
                <Button variant="outline" size="sm" className="w-full justify-start group hover:border-primary/50">
                  <Users className="h-4 w-4 mr-3 group-hover:scale-110 transition-transform" />
                  Manage Users
                  <ArrowUpRight className="h-4 w-4 ml-auto opacity-0 group-hover:opacity-100 transition-opacity" />
                </Button>
              </Link>
              <Link href="/dashboard/analytics">
                <Button variant="outline" size="sm" className="w-full justify-start group hover:border-primary/50">
                  <TrendingUp className="h-4 w-4 mr-3 group-hover:scale-110 transition-transform" />
                  View Analytics
                  <ArrowUpRight className="h-4 w-4 ml-auto opacity-0 group-hover:opacity-100 transition-opacity" />
                </Button>
              </Link>
              <Link href="/dashboard/reports">
                <Button variant="outline" size="sm" className="w-full justify-start group hover:border-primary/50">
                  <Activity className="h-4 w-4 mr-3 group-hover:scale-110 transition-transform" />
                  Generate Reports
                  <ArrowUpRight className="h-4 w-4 ml-auto opacity-0 group-hover:opacity-100 transition-opacity" />
                </Button>
              </Link>
              <Link href="/dashboard/settings">
                <Button variant="outline" size="sm" className="w-full justify-start group hover:border-primary/50">
                  <Settings className="h-4 w-4 mr-3 group-hover:scale-110 transition-transform" />
                  Platform Settings
                  <ArrowUpRight className="h-4 w-4 ml-auto opacity-0 group-hover:opacity-100 transition-opacity" />
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );

  const renderDashboard = () => {
    switch (user?.role) {
      case 'customer':
        return renderCustomerDashboard();
      case 'service_provider':
        return renderProviderDashboard();
      case 'admin':
        return renderAdminDashboard();
      default:
        return <div>Loading...</div>;
    }
  };

  return (
    <DashboardLayout>
      {renderDashboard()}
    </DashboardLayout>
  );
}

export default function DashboardPage() {
  return (
    <ProtectedRoute>
      <DashboardContent />
    </ProtectedRoute>
  );
}
