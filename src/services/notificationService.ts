import { 
  collection, 
  doc, 
  addDoc, 
  updateDoc, 
  getDocs, 
  query, 
  where, 
  orderBy, 
  limit,
  Timestamp,
  writeBatch 
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Notification, NotificationType, NotificationStatus } from '@/types';

export class NotificationService {
  // Create a new notification
  static async createNotification(notificationData: Omit<Notification, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    if (!db) throw new Error('Database not initialized');
    
    const docRef = await addDoc(collection(db, 'notifications'), {
      ...notificationData,
      status: 'unread' as NotificationStatus,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    });
    
    // Send push notification if enabled
    if (notificationData.pushEnabled) {
      await this.sendPushNotification(notificationData);
    }
    
    // Send email notification if enabled
    if (notificationData.emailEnabled) {
      await this.sendEmailNotification(notificationData);
    }
    
    return docRef.id;
  }

  // Get notifications for a user
  static async getUserNotifications(userId: string, limitCount: number = 50): Promise<Notification[]> {
    if (!db) throw new Error('Database not initialized');
    
    const q = query(
      collection(db, 'notifications'),
      where('userId', '==', userId),
      orderBy('createdAt', 'desc'),
      limit(limitCount)
    );
    
    const querySnapshot = await getDocs(q);
    const notifications: Notification[] = [];
    
    querySnapshot.forEach((doc) => {
      notifications.push({ id: doc.id, ...doc.data() } as Notification);
    });
    
    return notifications;
  }

  // Mark notification as read
  static async markAsRead(notificationId: string): Promise<void> {
    if (!db) throw new Error('Database not initialized');
    
    const notificationRef = doc(db, 'notifications', notificationId);
    await updateDoc(notificationRef, {
      status: 'read' as NotificationStatus,
      readAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    });
  }

  // Mark all notifications as read for a user
  static async markAllAsRead(userId: string): Promise<void> {
    if (!db) throw new Error('Database not initialized');
    
    const q = query(
      collection(db, 'notifications'),
      where('userId', '==', userId),
      where('status', '==', 'unread')
    );
    
    const querySnapshot = await getDocs(q);
    const batch = writeBatch(db);
    
    querySnapshot.forEach((doc) => {
      batch.update(doc.ref, {
        status: 'read' as NotificationStatus,
        readAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
      });
    });
    
    await batch.commit();
  }

  // Get unread notification count
  static async getUnreadCount(userId: string): Promise<number> {
    if (!db) throw new Error('Database not initialized');
    
    const q = query(
      collection(db, 'notifications'),
      where('userId', '==', userId),
      where('status', '==', 'unread')
    );
    
    const querySnapshot = await getDocs(q);
    return querySnapshot.size;
  }

  // Send push notification
  static async sendPushNotification(notificationData: any): Promise<void> {
    try {
      // In a real app, this would use Firebase Cloud Messaging or similar
      console.log('Sending push notification:', notificationData);
      
      // Mock implementation
      if ('serviceWorker' in navigator && 'PushManager' in window) {
        const registration = await navigator.serviceWorker.ready;
        
        if (registration.pushManager) {
          // This would normally send to FCM
          console.log('Push notification sent');
        }
      }
    } catch (error) {
      console.error('Error sending push notification:', error);
    }
  }

  // Send email notification
  static async sendEmailNotification(notificationData: any): Promise<void> {
    try {
      // In a real app, this would use SendGrid, AWS SES, or similar
      const response = await fetch('/api/notifications/email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(notificationData),
      });
      
      if (!response.ok) {
        throw new Error('Failed to send email notification');
      }
      
      console.log('Email notification sent');
    } catch (error) {
      console.error('Error sending email notification:', error);
    }
  }

  // Create booking-related notifications
  static async createBookingNotification(
    type: 'booking_created' | 'booking_confirmed' | 'booking_cancelled' | 'booking_completed',
    bookingId: string,
    customerId: string,
    providerId: string,
    serviceTitle: string
  ): Promise<void> {
    const notifications = [];
    
    switch (type) {
      case 'booking_created':
        notifications.push({
          userId: providerId,
          type: 'booking_request' as NotificationType,
          title: 'New Booking Request',
          message: `You have a new booking request for ${serviceTitle}`,
          data: { bookingId, serviceTitle },
          pushEnabled: true,
          emailEnabled: true,
        });
        break;
        
      case 'booking_confirmed':
        notifications.push({
          userId: customerId,
          type: 'booking_confirmed' as NotificationType,
          title: 'Booking Confirmed',
          message: `Your booking for ${serviceTitle} has been confirmed`,
          data: { bookingId, serviceTitle },
          pushEnabled: true,
          emailEnabled: true,
        });
        break;
        
      case 'booking_cancelled':
        notifications.push(
          {
            userId: customerId,
            type: 'booking_cancelled' as NotificationType,
            title: 'Booking Cancelled',
            message: `Your booking for ${serviceTitle} has been cancelled`,
            data: { bookingId, serviceTitle },
            pushEnabled: true,
            emailEnabled: true,
          },
          {
            userId: providerId,
            type: 'booking_cancelled' as NotificationType,
            title: 'Booking Cancelled',
            message: `Booking for ${serviceTitle} has been cancelled`,
            data: { bookingId, serviceTitle },
            pushEnabled: true,
            emailEnabled: false,
          }
        );
        break;
        
      case 'booking_completed':
        notifications.push({
          userId: customerId,
          type: 'booking_completed' as NotificationType,
          title: 'Service Completed',
          message: `Your ${serviceTitle} service has been completed. Please leave a review!`,
          data: { bookingId, serviceTitle },
          pushEnabled: true,
          emailEnabled: true,
        });
        break;
    }
    
    for (const notification of notifications) {
      await this.createNotification(notification);
    }
  }

  // Create review-related notifications
  static async createReviewNotification(
    providerId: string,
    customerName: string,
    serviceTitle: string,
    rating: number
  ): Promise<void> {
    await this.createNotification({
      userId: providerId,
      type: 'review_received' as NotificationType,
      title: 'New Review Received',
      message: `${customerName} left a ${rating}-star review for ${serviceTitle}`,
      data: { customerName, serviceTitle, rating },
      pushEnabled: true,
      emailEnabled: true,
    });
  }

  // Create message notifications
  static async createMessageNotification(
    recipientId: string,
    senderName: string,
    messagePreview: string
  ): Promise<void> {
    await this.createNotification({
      userId: recipientId,
      type: 'new_message' as NotificationType,
      title: `New message from ${senderName}`,
      message: messagePreview,
      data: { senderName },
      pushEnabled: true,
      emailEnabled: false,
    });
  }

  // Create payment notifications
  static async createPaymentNotification(
    type: 'payment_received' | 'payment_failed' | 'payout_processed',
    userId: string,
    amount: number,
    details: any
  ): Promise<void> {
    let title = '';
    let message = '';
    
    switch (type) {
      case 'payment_received':
        title = 'Payment Received';
        message = `You received a payment of $${amount.toFixed(2)}`;
        break;
      case 'payment_failed':
        title = 'Payment Failed';
        message = `Payment of $${amount.toFixed(2)} failed to process`;
        break;
      case 'payout_processed':
        title = 'Payout Processed';
        message = `Your payout of $${amount.toFixed(2)} has been processed`;
        break;
    }
    
    await this.createNotification({
      userId,
      type: type as NotificationType,
      title,
      message,
      data: { amount, ...details },
      pushEnabled: true,
      emailEnabled: true,
    });
  }

  // Get notification preferences for a user
  static async getNotificationPreferences(userId: string): Promise<any> {
    // Mock preferences - in real app would be stored in user profile
    return {
      email: {
        bookings: true,
        messages: false,
        reviews: true,
        payments: true,
        marketing: false,
      },
      push: {
        bookings: true,
        messages: true,
        reviews: true,
        payments: true,
      },
      sms: {
        bookings: true,
        urgent: true,
      },
    };
  }

  // Update notification preferences
  static async updateNotificationPreferences(userId: string, preferences: any): Promise<void> {
    if (!db) throw new Error('Database not initialized');
    
    // In real app, would update user document
    console.log('Updating notification preferences for user:', userId, preferences);
  }

  // Delete old notifications
  static async cleanupOldNotifications(daysOld: number = 30): Promise<void> {
    if (!db) throw new Error('Database not initialized');
    
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysOld);
    
    const q = query(
      collection(db, 'notifications'),
      where('createdAt', '<', Timestamp.fromDate(cutoffDate))
    );
    
    const querySnapshot = await getDocs(q);
    const batch = writeBatch(db);
    
    querySnapshot.forEach((doc) => {
      batch.delete(doc.ref);
    });
    
    await batch.commit();
  }

  // Get notification statistics
  static async getNotificationStats(userId: string): Promise<any> {
    const notifications = await this.getUserNotifications(userId, 1000);
    
    const stats = {
      total: notifications.length,
      unread: notifications.filter(n => n.status === 'unread').length,
      byType: {} as Record<string, number>,
      recent: notifications.slice(0, 5),
    };
    
    notifications.forEach(notification => {
      stats.byType[notification.type] = (stats.byType[notification.type] || 0) + 1;
    });
    
    return stats;
  }
}
