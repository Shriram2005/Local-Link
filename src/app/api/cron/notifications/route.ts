import { NextRequest, NextResponse } from 'next/server';
import { collection, query, where, getDocs, Timestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { NotificationService } from '@/services/notificationService';

export async function GET(request: NextRequest) {
  // Verify this is a cron request from Vercel
  const authHeader = request.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    if (!db) {
      throw new Error('Database not initialized');
    }

    let notificationCount = 0;

    // Send booking reminders (24 hours before)
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0);
    
    const dayAfterTomorrow = new Date(tomorrow);
    dayAfterTomorrow.setDate(dayAfterTomorrow.getDate() + 1);

    const upcomingBookingsQuery = query(
      collection(db, 'bookings'),
      where('status', '==', 'confirmed'),
      where('scheduledDate', '>=', Timestamp.fromDate(tomorrow)),
      where('scheduledDate', '<', Timestamp.fromDate(dayAfterTomorrow))
    );

    const upcomingBookings = await getDocs(upcomingBookingsQuery);
    
    for (const bookingDoc of upcomingBookings.docs) {
      const booking = bookingDoc.data();
      
      // Send reminder to customer
      await NotificationService.createNotification({
        userId: booking.customerId,
        type: 'booking_reminder',
        title: 'Booking Reminder',
        message: `Your booking is scheduled for tomorrow at ${new Date(booking.scheduledDate.toDate()).toLocaleTimeString()}`,
        data: { bookingId: bookingDoc.id },
        pushEnabled: true,
        emailEnabled: true,
      });

      // Send reminder to provider
      await NotificationService.createNotification({
        userId: booking.providerId,
        type: 'booking_reminder',
        title: 'Booking Reminder',
        message: `You have a booking scheduled for tomorrow at ${new Date(booking.scheduledDate.toDate()).toLocaleTimeString()}`,
        data: { bookingId: bookingDoc.id },
        pushEnabled: true,
        emailEnabled: true,
      });

      notificationCount += 2;
    }

    // Send payment reminders for overdue invoices
    const threeDaysAgo = Timestamp.fromDate(new Date(Date.now() - 3 * 24 * 60 * 60 * 1000));
    const overdueBookingsQuery = query(
      collection(db, 'bookings'),
      where('paymentStatus', '==', 'pending'),
      where('createdAt', '<', threeDaysAgo)
    );

    const overdueBookings = await getDocs(overdueBookingsQuery);
    
    for (const bookingDoc of overdueBookings.docs) {
      const booking = bookingDoc.data();
      
      await NotificationService.createNotification({
        userId: booking.customerId,
        type: 'payment_reminder',
        title: 'Payment Reminder',
        message: 'Your booking payment is overdue. Please complete the payment to confirm your booking.',
        data: { bookingId: bookingDoc.id },
        pushEnabled: true,
        emailEnabled: true,
      });

      notificationCount++;
    }

    console.log(`Notification cron completed: ${notificationCount} notifications sent`);

    return NextResponse.json({
      success: true,
      message: `Notification cron completed: ${notificationCount} notifications sent`,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Notification cron error:', error);
    return NextResponse.json(
      { success: false, error: 'Notification cron failed' },
      { status: 500 }
    );
  }
}
