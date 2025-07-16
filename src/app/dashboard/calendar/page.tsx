'use client';

import React, { useState } from 'react';
import { Calendar as CalendarIcon, Clock, Plus, Settings, RefreshCw } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import Button from '@/components/ui/Button';
import Calendar from '@/components/ui/Calendar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import { CalendarService } from '@/services/calendarService';
import { formatDate, formatTime } from '@/utils';
import { CalendarEvent } from '@/types';

function CalendarContent() {
  const { user } = useAuth();
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);
  const [showEventModal, setShowEventModal] = useState(false);
  const [calendarStats, setCalendarStats] = useState<any>(null);

  React.useEffect(() => {
    if (user) {
      loadCalendarStats();
    }
  }, [user]);

  const loadCalendarStats = async () => {
    if (!user) return;
    
    try {
      const stats = await CalendarService.getCalendarStats(user.id);
      setCalendarStats(stats);
    } catch (error) {
      console.error('Error loading calendar stats:', error);
    }
  };

  const handleEventClick = (event: CalendarEvent) => {
    setSelectedEvent(event);
    setShowEventModal(true);
  };

  const handleDateClick = (date: Date) => {
    console.log('Date clicked:', date);
    // Could open a "create event" modal for this date
  };

  const syncWithExternalCalendar = async (calendarType: 'google' | 'outlook' | 'apple') => {
    if (!user) return;
    
    try {
      // In real app, would handle OAuth flow and get access token
      const mockAccessToken = 'mock-access-token';
      const success = await CalendarService.syncWithExternalCalendar(user.id, calendarType, mockAccessToken);
      
      if (success) {
        console.log(`Successfully synced with ${calendarType} calendar`);
      }
    } catch (error) {
      console.error(`Error syncing with ${calendarType} calendar:`, error);
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Calendar</h1>
            <p className="text-gray-600">
              {user?.role === 'service_provider' 
                ? 'Manage your schedule and availability' 
                : 'View your bookings and appointments'}
            </p>
          </div>
          
          <div className="flex items-center space-x-4">
            <Button variant="outline">
              <Settings className="h-4 w-4 mr-2" />
              Settings
            </Button>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add Event
            </Button>
          </div>
        </div>

        {/* Calendar Stats */}
        {calendarStats && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Events</CardTitle>
                <CalendarIcon className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{calendarStats.totalEvents}</div>
                <p className="text-xs text-muted-foreground">This month</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Bookings</CardTitle>
                <Clock className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{calendarStats.bookings}</div>
                <p className="text-xs text-muted-foreground">
                  {calendarStats.upcomingEvents} upcoming
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Busy Days</CardTitle>
                <CalendarIcon className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{calendarStats.busyDays}</div>
                <p className="text-xs text-muted-foreground">This month</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Blocked Time</CardTitle>
                <Clock className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{calendarStats.blockedTime}</div>
                <p className="text-xs text-muted-foreground">Personal events</p>
              </CardContent>
            </Card>
          </div>
        )}

        {/* External Calendar Sync */}
        <Card>
          <CardHeader>
            <CardTitle>External Calendar Sync</CardTitle>
            <CardDescription>
              Sync your LocalLink calendar with external calendar services
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-4">
              <Button
                variant="outline"
                onClick={() => syncWithExternalCalendar('google')}
                className="flex items-center space-x-2"
              >
                <RefreshCw className="h-4 w-4" />
                <span>Sync with Google Calendar</span>
              </Button>

              <Button
                variant="outline"
                onClick={() => syncWithExternalCalendar('outlook')}
                className="flex items-center space-x-2"
              >
                <RefreshCw className="h-4 w-4" />
                <span>Sync with Outlook</span>
              </Button>

              <Button
                variant="outline"
                onClick={() => syncWithExternalCalendar('apple')}
                className="flex items-center space-x-2"
              >
                <RefreshCw className="h-4 w-4" />
                <span>Sync with Apple Calendar</span>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Main Calendar */}
        <Calendar
          userId={user?.id || ''}
          userRole={user?.role as any || 'customer'}
          onEventClick={handleEventClick}
          onDateClick={handleDateClick}
          showAvailability={user?.role === 'service_provider'}
        />

        {/* Event Details Modal */}
        {showEventModal && selectedEvent && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <Card className="w-full max-w-md">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>{selectedEvent.title}</CardTitle>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowEventModal(false)}
                  >
                    ×
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Event Details</h4>
                  {selectedEvent.description && (
                    <p className="text-gray-600 mb-3">{selectedEvent.description}</p>
                  )}
                  
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center space-x-2">
                      <Clock className="h-4 w-4 text-gray-400" />
                      <span>
                        {formatDate(selectedEvent.startTime, 'PPP')} at{' '}
                        {formatTime(selectedEvent.startTime)} - {formatTime(selectedEvent.endTime)}
                      </span>
                    </div>
                    
                    {selectedEvent.location && (
                      <div className="flex items-center space-x-2">
                        <CalendarIcon className="h-4 w-4 text-gray-400" />
                        <span>{selectedEvent.location}</span>
                      </div>
                    )}
                    
                    <div className="flex items-center space-x-2">
                      <div className={`w-3 h-3 rounded-full ${
                        selectedEvent.type === 'booking' 
                          ? 'bg-blue-500' 
                          : selectedEvent.type === 'blocked'
                          ? 'bg-red-500'
                          : 'bg-gray-500'
                      }`}></div>
                      <span className="capitalize">{selectedEvent.type}</span>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <div className={`w-3 h-3 rounded-full ${
                        selectedEvent.status === 'confirmed' 
                          ? 'bg-green-500' 
                          : selectedEvent.status === 'pending'
                          ? 'bg-yellow-500'
                          : 'bg-red-500'
                      }`}></div>
                      <span className="capitalize">{selectedEvent.status}</span>
                    </div>
                  </div>
                </div>
                
                <div className="flex justify-end space-x-2">
                  <Button variant="outline" onClick={() => setShowEventModal(false)}>
                    Close
                  </Button>
                  {selectedEvent.type === 'booking' && (
                    <Button>
                      View Booking
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}

export default function CalendarPage() {
  return (
    <ProtectedRoute allowedRoles={['customer', 'service_provider']}>
      <CalendarContent />
    </ProtectedRoute>
  );
}
