'use client';

import React, { useState, useEffect } from 'react';
import { Bell, Check, X, Settings, Trash2, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import Button from './Button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './Card';
import { NotificationService } from '@/services/notificationService';
import { formatRelativeTime, getErrorMessage } from '@/utils';
import { Notification, NotificationType } from '@/types';

interface NotificationCenterProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function NotificationCenter({ isOpen, onClose }: NotificationCenterProps) {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState<'all' | 'unread'>('all');

  useEffect(() => {
    if (isOpen && user) {
      loadNotifications();
    }
  }, [isOpen, user, filter]);

  const loadNotifications = async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      
      // Mock notifications for demo
      const mockNotifications: Notification[] = [
        {
          id: '1',
          userId: user.id,
          type: 'booking_request',
          title: 'New Booking Request',
          message: 'You have a new booking request for House Cleaning',
          data: { bookingId: 'booking1', serviceTitle: 'House Cleaning' },
          status: 'unread',
          pushEnabled: true,
          emailEnabled: true,
          createdAt: { toDate: () => new Date(Date.now() - 3600000) } as any,
          updatedAt: { toDate: () => new Date(Date.now() - 3600000) } as any,
        },
        {
          id: '2',
          userId: user.id,
          type: 'booking_confirmed',
          title: 'Booking Confirmed',
          message: 'Your booking for Plumbing Repair has been confirmed',
          data: { bookingId: 'booking2', serviceTitle: 'Plumbing Repair' },
          status: 'read',
          pushEnabled: true,
          emailEnabled: true,
          readAt: { toDate: () => new Date(Date.now() - 1800000) } as any,
          createdAt: { toDate: () => new Date(Date.now() - 7200000) } as any,
          updatedAt: { toDate: () => new Date(Date.now() - 1800000) } as any,
        },
        {
          id: '3',
          userId: user.id,
          type: 'review_received',
          title: 'New Review Received',
          message: 'Sarah Johnson left a 5-star review for your service',
          data: { customerName: 'Sarah Johnson', rating: 5 },
          status: 'unread',
          pushEnabled: true,
          emailEnabled: true,
          createdAt: { toDate: () => new Date(Date.now() - 14400000) } as any,
          updatedAt: { toDate: () => new Date(Date.now() - 14400000) } as any,
        },
        {
          id: '4',
          userId: user.id,
          type: 'payment_received',
          title: 'Payment Received',
          message: 'You received a payment of $150.00',
          data: { amount: 150 },
          status: 'read',
          pushEnabled: true,
          emailEnabled: true,
          readAt: { toDate: () => new Date(Date.now() - 10800000) } as any,
          createdAt: { toDate: () => new Date(Date.now() - 86400000) } as any,
          updatedAt: { toDate: () => new Date(Date.now() - 10800000) } as any,
        },
        {
          id: '5',
          userId: user.id,
          type: 'new_message',
          title: 'New Message',
          message: 'Mike Wilson sent you a message',
          data: { senderName: 'Mike Wilson' },
          status: 'unread',
          pushEnabled: true,
          emailEnabled: false,
          createdAt: { toDate: () => new Date(Date.now() - 1800000) } as any,
          updatedAt: { toDate: () => new Date(Date.now() - 1800000) } as any,
        },
      ];
      
      let filteredNotifications = mockNotifications;
      
      if (filter === 'unread') {
        filteredNotifications = mockNotifications.filter(n => n.status === 'unread');
      }
      
      setNotifications(filteredNotifications);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (notificationId: string) => {
    try {
      // Mock update - in real app would call NotificationService.markAsRead
      setNotifications(prev => prev.map(notification => 
        notification.id === notificationId 
          ? { ...notification, status: 'read' as const, readAt: { toDate: () => new Date() } as any }
          : notification
      ));
    } catch (err) {
      setError(getErrorMessage(err));
    }
  };

  const markAllAsRead = async () => {
    try {
      // Mock update - in real app would call NotificationService.markAllAsRead
      setNotifications(prev => prev.map(notification => ({
        ...notification,
        status: 'read' as const,
        readAt: { toDate: () => new Date() } as any
      })));
    } catch (err) {
      setError(getErrorMessage(err));
    }
  };

  const getNotificationIcon = (type: NotificationType) => {
    switch (type) {
      case 'booking_request':
      case 'booking_confirmed':
      case 'booking_cancelled':
      case 'booking_completed':
        return '📅';
      case 'review_received':
        return '⭐';
      case 'new_message':
        return '💬';
      case 'payment_received':
      case 'payment_failed':
      case 'payout_processed':
        return '💰';
      case 'system_update':
        return '🔔';
      case 'promotion':
        return '🎉';
      default:
        return '📢';
    }
  };

  const getNotificationColor = (type: NotificationType) => {
    switch (type) {
      case 'booking_request':
        return 'bg-blue-100 text-blue-800';
      case 'booking_confirmed':
        return 'bg-green-100 text-green-800';
      case 'booking_cancelled':
        return 'bg-red-100 text-red-800';
      case 'review_received':
        return 'bg-yellow-100 text-yellow-800';
      case 'payment_received':
        return 'bg-green-100 text-green-800';
      case 'payment_failed':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const unreadCount = notifications.filter(n => n.status === 'unread').length;

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-start justify-end p-4 z-50">
      <Card className="w-full max-w-md max-h-[80vh] overflow-hidden">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <div>
            <CardTitle className="flex items-center space-x-2">
              <Bell className="h-5 w-5" />
              <span>Notifications</span>
              {unreadCount > 0 && (
                <span className="bg-red-500 text-white text-xs rounded-full px-2 py-1">
                  {unreadCount}
                </span>
              )}
            </CardTitle>
            <CardDescription>Stay updated with your latest activities</CardDescription>
          </div>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </CardHeader>
        
        <CardContent className="space-y-4">
          {error && (
            <div className="bg-destructive/10 border border-destructive/20 text-destructive px-3 py-2 rounded-md text-sm">
              {error}
            </div>
          )}

          {/* Filter Tabs */}
          <div className="flex space-x-2">
            <Button
              variant={filter === 'all' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilter('all')}
            >
              All
            </Button>
            <Button
              variant={filter === 'unread' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilter('unread')}
            >
              Unread ({unreadCount})
            </Button>
          </div>

          {/* Actions */}
          <div className="flex justify-between">
            <Button variant="outline" size="sm" onClick={markAllAsRead}>
              <Check className="h-4 w-4 mr-2" />
              Mark All Read
            </Button>
            <Button variant="ghost" size="sm">
              <Settings className="h-4 w-4 mr-2" />
              Settings
            </Button>
          </div>

          {/* Notifications List */}
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {loading ? (
              <div className="space-y-3">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="animate-pulse flex space-x-3 p-3 border rounded-lg">
                    <div className="w-8 h-8 bg-gray-200 rounded-full"></div>
                    <div className="flex-1 space-y-2">
                      <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                      <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                    </div>
                  </div>
                ))}
              </div>
            ) : notifications.length === 0 ? (
              <div className="text-center py-8">
                <Bell className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No notifications</h3>
                <p className="text-gray-600">
                  {filter === 'unread' ? 'No unread notifications' : 'You\'re all caught up!'}
                </p>
              </div>
            ) : (
              notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`flex space-x-3 p-3 border rounded-lg cursor-pointer hover:bg-gray-50 ${
                    notification.status === 'unread' ? 'bg-blue-50 border-blue-200' : ''
                  }`}
                  onClick={() => markAsRead(notification.id)}
                >
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center text-lg">
                      {getNotificationIcon(notification.type)}
                    </div>
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between">
                      <h4 className="text-sm font-medium text-gray-900 truncate">
                        {notification.title}
                      </h4>
                      <div className="flex items-center space-x-1 ml-2">
                        {notification.status === 'unread' && (
                          <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                        )}
                        <span className="text-xs text-gray-500">
                          {formatRelativeTime(notification.createdAt.toDate())}
                        </span>
                      </div>
                    </div>
                    
                    <p className="text-sm text-gray-600 mt-1">{notification.message}</p>
                    
                    <div className="flex items-center justify-between mt-2">
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getNotificationColor(notification.type)}`}>
                        {notification.type.replace('_', ' ')}
                      </span>
                      
                      <div className="flex space-x-1">
                        {notification.status === 'unread' ? (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              markAsRead(notification.id);
                            }}
                          >
                            <Eye className="h-3 w-3" />
                          </Button>
                        ) : (
                          <EyeOff className="h-3 w-3 text-gray-400" />
                        )}
                        <Button variant="ghost" size="sm">
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

interface NotificationBellProps {
  className?: string;
}

export function NotificationBell({ className }: NotificationBellProps) {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (user) {
      // Mock unread count - in real app would call NotificationService.getUnreadCount
      setUnreadCount(3);
    }
  }, [user]);

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className={`relative p-2 text-gray-600 hover:text-gray-900 ${className}`}
      >
        <Bell className="h-6 w-6" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>
      
      <NotificationCenter isOpen={isOpen} onClose={() => setIsOpen(false)} />
    </>
  );
}
