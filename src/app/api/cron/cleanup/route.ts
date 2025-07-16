import { NextRequest, NextResponse } from 'next/server';
import { collection, query, where, getDocs, deleteDoc, Timestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';

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

    let cleanupCount = 0;

    // Clean up expired sessions (older than 30 days)
    const thirtyDaysAgo = Timestamp.fromDate(new Date(Date.now() - 30 * 24 * 60 * 60 * 1000));
    const expiredSessionsQuery = query(
      collection(db, 'sessions'),
      where('createdAt', '<', thirtyDaysAgo)
    );
    
    const expiredSessions = await getDocs(expiredSessionsQuery);
    for (const doc of expiredSessions.docs) {
      await deleteDoc(doc.ref);
      cleanupCount++;
    }

    // Clean up old notifications (older than 90 days)
    const ninetyDaysAgo = Timestamp.fromDate(new Date(Date.now() - 90 * 24 * 60 * 60 * 1000));
    const oldNotificationsQuery = query(
      collection(db, 'notifications'),
      where('createdAt', '<', ninetyDaysAgo),
      where('status', '==', 'read')
    );
    
    const oldNotifications = await getDocs(oldNotificationsQuery);
    for (const doc of oldNotifications.docs) {
      await deleteDoc(doc.ref);
      cleanupCount++;
    }

    // Clean up cancelled bookings (older than 7 days)
    const sevenDaysAgo = Timestamp.fromDate(new Date(Date.now() - 7 * 24 * 60 * 60 * 1000));
    const cancelledBookingsQuery = query(
      collection(db, 'bookings'),
      where('status', '==', 'cancelled'),
      where('updatedAt', '<', sevenDaysAgo)
    );
    
    const cancelledBookings = await getDocs(cancelledBookingsQuery);
    for (const doc of cancelledBookings.docs) {
      await deleteDoc(doc.ref);
      cleanupCount++;
    }

    console.log(`Cleanup completed: ${cleanupCount} documents removed`);

    return NextResponse.json({
      success: true,
      message: `Cleanup completed: ${cleanupCount} documents removed`,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Cleanup cron error:', error);
    return NextResponse.json(
      { success: false, error: 'Cleanup failed' },
      { status: 500 }
    );
  }
}
