'use client';

import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Plus, Clock, MapPin, User } from 'lucide-react';
import Button from './Button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './Card';
import { CalendarService } from '@/services/calendarService';
import { formatDate, formatTime, getErrorMessage } from '@/utils';
import { CalendarEvent, AvailabilitySlot } from '@/types';

interface CalendarProps {
  userId: string;
  userRole: 'customer' | 'service_provider';
  onEventClick?: (event: CalendarEvent) => void;
  onDateClick?: (date: Date) => void;
  showAvailability?: boolean;
}

export default function Calendar({
  userId,
  userRole,
  onEventClick,
  onDateClick,
  showAvailability = false,
}: CalendarProps) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [availability, setAvailability] = useState<AvailabilitySlot[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [view, setView] = useState<'month' | 'week' | 'day'>('month');

  useEffect(() => {
    loadCalendarData();
  }, [currentDate, userId, view]);

  const loadCalendarData = async () => {
    try {
      setLoading(true);
      
      const startDate = getViewStartDate();
      const endDate = getViewEndDate();
      
      // Load events
      const calendarEvents = await CalendarService.getCalendarEvents(userId, startDate, endDate);
      setEvents(calendarEvents);
      
      // Load availability for service providers
      if (userRole === 'service_provider' && showAvailability) {
        const providerAvailability = await CalendarService.getProviderAvailability(userId, startDate, endDate);
        setAvailability(providerAvailability);
      }
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const getViewStartDate = () => {
    const date = new Date(currentDate);
    switch (view) {
      case 'month':
        date.setDate(1);
        date.setDate(date.getDate() - date.getDay()); // Start from Sunday
        return date;
      case 'week':
        date.setDate(date.getDate() - date.getDay()); // Start from Sunday
        return date;
      case 'day':
        return date;
      default:
        return date;
    }
  };

  const getViewEndDate = () => {
    const date = new Date(currentDate);
    switch (view) {
      case 'month':
        date.setMonth(date.getMonth() + 1, 0); // Last day of month
        date.setDate(date.getDate() + (6 - date.getDay())); // End on Saturday
        return date;
      case 'week':
        date.setDate(date.getDate() - date.getDay() + 6); // End on Saturday
        return date;
      case 'day':
        return date;
      default:
        return date;
    }
  };

  const navigateDate = (direction: 'prev' | 'next') => {
    const newDate = new Date(currentDate);
    switch (view) {
      case 'month':
        newDate.setMonth(newDate.getMonth() + (direction === 'next' ? 1 : -1));
        break;
      case 'week':
        newDate.setDate(newDate.getDate() + (direction === 'next' ? 7 : -7));
        break;
      case 'day':
        newDate.setDate(newDate.getDate() + (direction === 'next' ? 1 : -1));
        break;
    }
    setCurrentDate(newDate);
  };

  const getEventsForDate = (date: Date) => {
    return events.filter(event => {
      const eventDate = new Date(event.startTime);
      return eventDate.toDateString() === date.toDateString();
    });
  };

  const getAvailabilityForDate = (date: Date) => {
    return availability.find(slot => 
      slot.date.toDateString() === date.toDateString()
    );
  };

  const renderMonthView = () => {
    const startDate = getViewStartDate();
    const days = [];
    const currentMonth = currentDate.getMonth();
    
    for (let i = 0; i < 42; i++) { // 6 weeks * 7 days
      const date = new Date(startDate);
      date.setDate(startDate.getDate() + i);
      
      const dayEvents = getEventsForDate(date);
      const dayAvailability = getAvailabilityForDate(date);
      const isCurrentMonth = date.getMonth() === currentMonth;
      const isToday = date.toDateString() === new Date().toDateString();
      
      days.push(
        <div
          key={i}
          className={`min-h-[100px] p-2 border border-gray-200 cursor-pointer hover:bg-gray-50 ${
            !isCurrentMonth ? 'bg-gray-50 text-gray-400' : ''
          } ${isToday ? 'bg-blue-50 border-blue-200' : ''}`}
          onClick={() => onDateClick?.(date)}
        >
          <div className="flex items-center justify-between mb-1">
            <span className={`text-sm font-medium ${isToday ? 'text-blue-600' : ''}`}>
              {date.getDate()}
            </span>
            {dayAvailability?.isAvailable && (
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            )}
          </div>
          
          <div className="space-y-1">
            {dayEvents.slice(0, 3).map((event) => (
              <div
                key={event.id}
                className={`text-xs p-1 rounded truncate cursor-pointer ${
                  event.type === 'booking' 
                    ? 'bg-blue-100 text-blue-800' 
                    : event.type === 'blocked'
                    ? 'bg-red-100 text-red-800'
                    : 'bg-gray-100 text-gray-800'
                }`}
                onClick={(e) => {
                  e.stopPropagation();
                  onEventClick?.(event);
                }}
              >
                {formatTime(event.startTime)} {event.title}
              </div>
            ))}
            {dayEvents.length > 3 && (
              <div className="text-xs text-gray-500">
                +{dayEvents.length - 3} more
              </div>
            )}
          </div>
        </div>
      );
    }
    
    return (
      <div className="grid grid-cols-7 gap-0">
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
          <div key={day} className="p-2 text-center font-medium text-gray-700 bg-gray-100 border border-gray-200">
            {day}
          </div>
        ))}
        {days}
      </div>
    );
  };

  const renderWeekView = () => {
    const startDate = getViewStartDate();
    const days = [];
    
    for (let i = 0; i < 7; i++) {
      const date = new Date(startDate);
      date.setDate(startDate.getDate() + i);
      
      const dayEvents = getEventsForDate(date);
      const isToday = date.toDateString() === new Date().toDateString();
      
      days.push(
        <div key={i} className="flex-1 border-r border-gray-200 last:border-r-0">
          <div className={`p-2 text-center border-b border-gray-200 ${isToday ? 'bg-blue-50' : ''}`}>
            <div className="text-sm font-medium">{formatDate(date, 'EEE')}</div>
            <div className={`text-lg ${isToday ? 'text-blue-600 font-bold' : ''}`}>
              {date.getDate()}
            </div>
          </div>
          
          <div className="p-2 space-y-1 min-h-[400px]">
            {dayEvents.map((event) => (
              <div
                key={event.id}
                className={`p-2 rounded text-sm cursor-pointer ${
                  event.type === 'booking' 
                    ? 'bg-blue-100 text-blue-800 border-l-4 border-blue-500' 
                    : event.type === 'blocked'
                    ? 'bg-red-100 text-red-800 border-l-4 border-red-500'
                    : 'bg-gray-100 text-gray-800 border-l-4 border-gray-500'
                }`}
                onClick={() => onEventClick?.(event)}
              >
                <div className="font-medium">{event.title}</div>
                <div className="text-xs opacity-75">
                  {formatTime(event.startTime)} - {formatTime(event.endTime)}
                </div>
                {event.location && (
                  <div className="text-xs opacity-75 flex items-center mt-1">
                    <MapPin className="h-3 w-3 mr-1" />
                    {event.location}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      );
    }
    
    return <div className="flex">{days}</div>;
  };

  const renderDayView = () => {
    const dayEvents = getEventsForDate(currentDate);
    const hours = Array.from({ length: 24 }, (_, i) => i);
    
    return (
      <div className="space-y-0">
        {hours.map((hour) => {
          const hourEvents = dayEvents.filter(event => {
            const eventHour = event.startTime.getHours();
            return eventHour === hour;
          });
          
          return (
            <div key={hour} className="flex border-b border-gray-100">
              <div className="w-16 p-2 text-sm text-gray-500 text-right">
                {hour === 0 ? '12 AM' : hour < 12 ? `${hour} AM` : hour === 12 ? '12 PM' : `${hour - 12} PM`}
              </div>
              <div className="flex-1 p-2 min-h-[60px] relative">
                {hourEvents.map((event) => (
                  <div
                    key={event.id}
                    className={`absolute left-2 right-2 p-2 rounded text-sm cursor-pointer ${
                      event.type === 'booking' 
                        ? 'bg-blue-100 text-blue-800 border-l-4 border-blue-500' 
                        : event.type === 'blocked'
                        ? 'bg-red-100 text-red-800 border-l-4 border-red-500'
                        : 'bg-gray-100 text-gray-800 border-l-4 border-gray-500'
                    }`}
                    style={{
                      top: `${(event.startTime.getMinutes() / 60) * 60}px`,
                      height: `${((event.endTime.getTime() - event.startTime.getTime()) / (1000 * 60 * 60)) * 60}px`,
                    }}
                    onClick={() => onEventClick?.(event)}
                  >
                    <div className="font-medium">{event.title}</div>
                    <div className="text-xs opacity-75">
                      {formatTime(event.startTime)} - {formatTime(event.endTime)}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  const getViewTitle = () => {
    switch (view) {
      case 'month':
        return formatDate(currentDate, 'MMMM yyyy');
      case 'week':
        const startDate = getViewStartDate();
        const endDate = getViewEndDate();
        return `${formatDate(startDate, 'MMM d')} - ${formatDate(endDate, 'MMM d, yyyy')}`;
      case 'day':
        return formatDate(currentDate, 'EEEE, MMMM d, yyyy');
      default:
        return '';
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>{getViewTitle()}</CardTitle>
            <CardDescription>
              {userRole === 'service_provider' ? 'Manage your schedule and availability' : 'View your bookings'}
            </CardDescription>
          </div>
          
          <div className="flex items-center space-x-2">
            <div className="flex rounded-md border">
              {(['month', 'week', 'day'] as const).map((viewType) => (
                <button
                  key={viewType}
                  onClick={() => setView(viewType)}
                  className={`px-3 py-1 text-sm capitalize ${
                    view === viewType 
                      ? 'bg-primary text-white' 
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  {viewType}
                </button>
              ))}
            </div>
            
            <Button variant="outline" size="sm" onClick={() => navigateDate('prev')}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            
            <Button variant="outline" size="sm" onClick={() => setCurrentDate(new Date())}>
              Today
            </Button>
            
            <Button variant="outline" size="sm" onClick={() => navigateDate('next')}>
              <ChevronRight className="h-4 w-4" />
            </Button>
            
            <Button size="sm">
              <Plus className="h-4 w-4 mr-2" />
              Add Event
            </Button>
          </div>
        </div>
      </CardHeader>
      
      <CardContent>
        {error && (
          <div className="bg-destructive/10 border border-destructive/20 text-destructive px-4 py-3 rounded-md text-sm mb-4">
            {error}
          </div>
        )}
        
        {loading ? (
          <div className="animate-pulse">
            <div className="h-96 bg-gray-200 rounded"></div>
          </div>
        ) : (
          <div className="overflow-hidden">
            {view === 'month' && renderMonthView()}
            {view === 'week' && renderWeekView()}
            {view === 'day' && renderDayView()}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
