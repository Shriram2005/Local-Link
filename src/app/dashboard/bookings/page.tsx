'use client';

import React, { useState, useEffect } from 'react';
import { Calendar, Clock, MapPin, User, Phone, MessageSquare, MoreVertical, CheckCircle, XCircle } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import Button from '@/components/ui/Button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import { BookingService } from '@/services/bookingService';
import { formatCurrency, formatDate, formatRelativeTime, getErrorMessage } from '@/utils';
import { Booking, BookingStatus } from '@/types';

function BookingsContent() {
  const { user } = useAuth();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState<'all' | 'upcoming' | 'completed' | 'cancelled'>('all');

  useEffect(() => {
    loadBookings();
  }, [user, filter]);

  const loadBookings = async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      
      // Mock bookings data for demo
      const mockBookings: Booking[] = [
        {
          id: '1',
          customerId: user.role === 'customer' ? user.id : 'customer1',
          providerId: user.role === 'service_provider' ? user.id : 'provider1',
          serviceId: 'service1',
          status: 'confirmed',
          scheduledDate: { toDate: () => new Date(Date.now() + 86400000) } as any, // Tomorrow
          duration: 120,
          location: {
            street: '123 Main St',
            city: 'Anytown',
            state: 'CA',
            zipCode: '12345',
            country: 'USA',
          },
          notes: 'Please bring eco-friendly cleaning supplies',
          totalAmount: 150,
          commissionAmount: 7.5,
          paymentStatus: 'paid',
          createdAt: { toDate: () => new Date() } as any,
          updatedAt: { toDate: () => new Date() } as any,
        },
        {
          id: '2',
          customerId: user.role === 'customer' ? user.id : 'customer2',
          providerId: user.role === 'service_provider' ? user.id : 'provider2',
          serviceId: 'service2',
          status: 'pending',
          scheduledDate: { toDate: () => new Date(Date.now() + 172800000) } as any, // Day after tomorrow
          duration: 90,
          location: {
            street: '456 Oak Ave',
            city: 'Anytown',
            state: 'CA',
            zipCode: '12345',
            country: 'USA',
          },
          totalAmount: 95,
          commissionAmount: 4.75,
          paymentStatus: 'pending',
          createdAt: { toDate: () => new Date(Date.now() - 3600000) } as any,
          updatedAt: { toDate: () => new Date(Date.now() - 3600000) } as any,
        },
        {
          id: '3',
          customerId: user.role === 'customer' ? user.id : 'customer3',
          providerId: user.role === 'service_provider' ? user.id : 'provider3',
          serviceId: 'service3',
          status: 'completed',
          scheduledDate: { toDate: () => new Date(Date.now() - 86400000) } as any, // Yesterday
          duration: 60,
          location: {
            street: '789 Pine St',
            city: 'Anytown',
            state: 'CA',
            zipCode: '12345',
            country: 'USA',
          },
          totalAmount: 60,
          commissionAmount: 3,
          paymentStatus: 'paid',
          createdAt: { toDate: () => new Date(Date.now() - 172800000) } as any,
          updatedAt: { toDate: () => new Date(Date.now() - 86400000) } as any,
        },
      ];
      
      let filteredBookings = mockBookings;
      
      if (filter !== 'all') {
        filteredBookings = mockBookings.filter(booking => {
          switch (filter) {
            case 'upcoming':
              return ['pending', 'confirmed'].includes(booking.status) && 
                     booking.scheduledDate.toDate() > new Date();
            case 'completed':
              return booking.status === 'completed';
            case 'cancelled':
              return booking.status === 'cancelled';
            default:
              return true;
          }
        });
      }
      
      setBookings(filteredBookings);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const updateBookingStatus = async (bookingId: string, status: BookingStatus) => {
    try {
      // Mock update - in real app would call BookingService.updateBookingStatus
      setBookings(prev => prev.map(booking => 
        booking.id === bookingId 
          ? { ...booking, status, updatedAt: { toDate: () => new Date() } as any }
          : booking
      ));
    } catch (err) {
      setError(getErrorMessage(err));
    }
  };

  const getStatusColor = (status: BookingStatus) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'confirmed':
        return 'bg-blue-100 text-blue-800';
      case 'in_progress':
        return 'bg-purple-100 text-purple-800';
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getPaymentStatusColor = (status: string) => {
    switch (status) {
      case 'paid':
        return 'text-green-600';
      case 'pending':
        return 'text-yellow-600';
      case 'failed':
        return 'text-red-600';
      default:
        return 'text-gray-600';
    }
  };

  // Mock service and user data
  const mockServices: Record<string, any> = {
    service1: { title: 'Professional House Cleaning' },
    service2: { title: 'Plumbing Repair' },
    service3: { title: 'Personal Training Session' },
  };

  const mockUsers: Record<string, any> = {
    customer1: { displayName: 'Sarah Johnson', email: 'sarah@email.com', phoneNumber: '(555) 123-4567' },
    customer2: { displayName: 'Mike Wilson', email: 'mike@email.com', phoneNumber: '(555) 234-5678' },
    customer3: { displayName: 'Emily Davis', email: 'emily@email.com', phoneNumber: '(555) 345-6789' },
    provider1: { displayName: 'John Smith', businessName: 'CleanPro Services', phoneNumber: '(555) 111-2222' },
    provider2: { displayName: 'David Brown', businessName: 'Expert Plumbing', phoneNumber: '(555) 222-3333' },
    provider3: { displayName: 'Lisa Garcia', businessName: 'FitLife Training', phoneNumber: '(555) 333-4444' },
  };

  return (
    <DashboardLayout>
      <div className="space-y-8">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div className="space-y-2">
            <h1 className="text-3xl font-bold text-foreground">
              My <span className="text-gradient">Bookings</span>
            </h1>
            <p className="text-lg text-muted-foreground">
              {user?.role === 'customer' ? 'Track your service bookings and appointments' : 'Manage your client appointments and schedule'}
            </p>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            {[
              { key: 'all', label: 'All Bookings' },
              { key: 'upcoming', label: 'Upcoming' },
              { key: 'completed', label: 'Completed' },
              { key: 'cancelled', label: 'Cancelled' },
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => setFilter(tab.key as any)}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  filter === tab.key
                    ? 'border-primary text-primary'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        {error && (
          <div className="bg-destructive/10 border border-destructive/20 text-destructive px-4 py-3 rounded-md text-sm">
            {error}
          </div>
        )}

        {/* Bookings List */}
        {loading ? (
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <Card key={i} className="animate-pulse">
                <CardHeader>
                  <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/3"></div>
                </CardHeader>
                <CardContent>
                  <div className="h-20 bg-gray-200 rounded"></div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : bookings.length === 0 ? (
          <Card>
            <CardContent className="text-center py-12">
              <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No bookings found</h3>
              <p className="text-gray-600">
                {filter === 'all' 
                  ? "You don't have any bookings yet" 
                  : `No ${filter} bookings found`}
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {bookings.map((booking) => {
              const service = mockServices[booking.serviceId];
              const otherUser = user?.role === 'customer' 
                ? mockUsers[booking.providerId] 
                : mockUsers[booking.customerId];
              
              return (
                <Card key={booking.id}>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="text-lg">{service?.title}</CardTitle>
                        <CardDescription className="flex items-center space-x-4 mt-1">
                          <span className="flex items-center">
                            <Calendar className="h-4 w-4 mr-1" />
                            {formatDate(booking.scheduledDate.toDate(), 'PPP')}
                          </span>
                          <span className="flex items-center">
                            <Clock className="h-4 w-4 mr-1" />
                            {formatDate(booking.scheduledDate.toDate(), 'p')} ({booking.duration} min)
                          </span>
                        </CardDescription>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(booking.status)}`}>
                          {booking.status.replace('_', ' ')}
                        </span>
                        <div className="relative group">
                          <button className="p-1 rounded hover:bg-gray-50">
                            <MoreVertical className="h-4 w-4" />
                          </button>
                          <div className="absolute right-0 top-8 bg-white border rounded-md shadow-lg py-1 z-10 hidden group-hover:block">
                            {booking.status === 'pending' && user?.role === 'service_provider' && (
                              <>
                                <button
                                  onClick={() => updateBookingStatus(booking.id, 'confirmed')}
                                  className="flex items-center w-full px-4 py-2 text-sm text-green-600 hover:bg-green-50"
                                >
                                  <CheckCircle className="h-4 w-4 mr-2" />
                                  Confirm
                                </button>
                                <button
                                  onClick={() => updateBookingStatus(booking.id, 'cancelled')}
                                  className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                                >
                                  <XCircle className="h-4 w-4 mr-2" />
                                  Decline
                                </button>
                              </>
                            )}
                            {['pending', 'confirmed'].includes(booking.status) && (
                              <button
                                onClick={() => updateBookingStatus(booking.id, 'cancelled')}
                                className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                              >
                                <XCircle className="h-4 w-4 mr-2" />
                                Cancel
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* Contact Info */}
                      <div>
                        <h4 className="font-medium text-gray-900 mb-3">
                          {user?.role === 'customer' ? 'Service Provider' : 'Customer'}
                        </h4>
                        <div className="space-y-2">
                          <div className="flex items-center">
                            <User className="h-4 w-4 text-gray-400 mr-2" />
                            <span className="text-sm">
                              {otherUser?.businessName || otherUser?.displayName}
                            </span>
                          </div>
                          {otherUser?.phoneNumber && (
                            <div className="flex items-center">
                              <Phone className="h-4 w-4 text-gray-400 mr-2" />
                              <span className="text-sm">{otherUser.phoneNumber}</span>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Location */}
                      <div>
                        <h4 className="font-medium text-gray-900 mb-3">Location</h4>
                        <div className="flex items-start">
                          <MapPin className="h-4 w-4 text-gray-400 mr-2 mt-0.5" />
                          <div className="text-sm">
                            <div>{booking.location.street}</div>
                            <div>{booking.location.city}, {booking.location.state} {booking.location.zipCode}</div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {booking.notes && (
                      <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                        <h4 className="font-medium text-gray-900 mb-1">Notes</h4>
                        <p className="text-sm text-gray-600">{booking.notes}</p>
                      </div>
                    )}

                    <div className="mt-4 flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <span className="text-lg font-medium text-gray-900">
                          {formatCurrency(booking.totalAmount)}
                        </span>
                        <span className={`text-sm font-medium ${getPaymentStatusColor(booking.paymentStatus)}`}>
                          Payment {booking.paymentStatus}
                        </span>
                      </div>
                      
                      <div className="flex space-x-2">
                        <Button variant="outline" size="sm">
                          <MessageSquare className="h-4 w-4 mr-2" />
                          Message
                        </Button>
                        {booking.status === 'confirmed' && user?.role === 'service_provider' && (
                          <Button 
                            size="sm"
                            onClick={() => updateBookingStatus(booking.id, 'completed')}
                          >
                            Mark Complete
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}

export default function BookingsPage() {
  return (
    <ProtectedRoute allowedRoles={['customer', 'service_provider']}>
      <BookingsContent />
    </ProtectedRoute>
  );
}
