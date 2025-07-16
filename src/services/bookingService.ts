import { 
  collection, 
  doc, 
  addDoc, 
  updateDoc, 
  getDoc, 
  getDocs, 
  query, 
  where, 
  orderBy, 
  Timestamp 
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Booking, BookingStatus, PaymentStatus } from '@/types';

export class BookingService {
  // Create a new booking
  static async createBooking(bookingData: Omit<Booking, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    if (!db) throw new Error('Database not initialized');
    
    const docRef = await addDoc(collection(db, 'bookings'), {
      ...bookingData,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    });
    
    return docRef.id;
  }

  // Update booking status
  static async updateBookingStatus(bookingId: string, status: BookingStatus): Promise<void> {
    if (!db) throw new Error('Database not initialized');
    
    const bookingRef = doc(db, 'bookings', bookingId);
    await updateDoc(bookingRef, {
      status,
      updatedAt: Timestamp.now(),
    });
  }

  // Update payment status
  static async updatePaymentStatus(bookingId: string, paymentStatus: PaymentStatus, paymentIntentId?: string): Promise<void> {
    if (!db) throw new Error('Database not initialized');
    
    const bookingRef = doc(db, 'bookings', bookingId);
    const updateData: any = {
      paymentStatus,
      updatedAt: Timestamp.now(),
    };
    
    if (paymentIntentId) {
      updateData.paymentIntentId = paymentIntentId;
    }
    
    await updateDoc(bookingRef, updateData);
  }

  // Get booking by ID
  static async getBooking(bookingId: string): Promise<Booking | null> {
    if (!db) throw new Error('Database not initialized');
    
    const bookingRef = doc(db, 'bookings', bookingId);
    const bookingSnap = await getDoc(bookingRef);
    
    if (bookingSnap.exists()) {
      return { id: bookingId, ...bookingSnap.data() } as Booking;
    }
    
    return null;
  }

  // Get bookings by customer
  static async getBookingsByCustomer(customerId: string): Promise<Booking[]> {
    if (!db) throw new Error('Database not initialized');
    
    const q = query(
      collection(db, 'bookings'),
      where('customerId', '==', customerId),
      orderBy('createdAt', 'desc')
    );
    
    const querySnapshot = await getDocs(q);
    const bookings: Booking[] = [];
    
    querySnapshot.forEach((doc) => {
      bookings.push({ id: doc.id, ...doc.data() } as Booking);
    });
    
    return bookings;
  }

  // Get bookings by provider
  static async getBookingsByProvider(providerId: string): Promise<Booking[]> {
    if (!db) throw new Error('Database not initialized');
    
    const q = query(
      collection(db, 'bookings'),
      where('providerId', '==', providerId),
      orderBy('createdAt', 'desc')
    );
    
    const querySnapshot = await getDocs(q);
    const bookings: Booking[] = [];
    
    querySnapshot.forEach((doc) => {
      bookings.push({ id: doc.id, ...doc.data() } as Booking);
    });
    
    return bookings;
  }

  // Cancel booking
  static async cancelBooking(bookingId: string, reason?: string): Promise<void> {
    if (!db) throw new Error('Database not initialized');
    
    const bookingRef = doc(db, 'bookings', bookingId);
    await updateDoc(bookingRef, {
      status: 'cancelled',
      cancellationReason: reason,
      updatedAt: Timestamp.now(),
    });
  }

  // Complete booking
  static async completeBooking(bookingId: string): Promise<void> {
    if (!db) throw new Error('Database not initialized');
    
    const bookingRef = doc(db, 'bookings', bookingId);
    await updateDoc(bookingRef, {
      status: 'completed',
      completedAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    });
  }

  // Get upcoming bookings
  static async getUpcomingBookings(userId: string, userRole: 'customer' | 'service_provider'): Promise<Booking[]> {
    if (!db) throw new Error('Database not initialized');
    
    const field = userRole === 'customer' ? 'customerId' : 'providerId';
    const now = Timestamp.now();
    
    const q = query(
      collection(db, 'bookings'),
      where(field, '==', userId),
      where('scheduledDate', '>', now),
      where('status', 'in', ['pending', 'confirmed']),
      orderBy('scheduledDate', 'asc')
    );
    
    const querySnapshot = await getDocs(q);
    const bookings: Booking[] = [];
    
    querySnapshot.forEach((doc) => {
      bookings.push({ id: doc.id, ...doc.data() } as Booking);
    });
    
    return bookings;
  }

  // Get booking history
  static async getBookingHistory(userId: string, userRole: 'customer' | 'service_provider'): Promise<Booking[]> {
    if (!db) throw new Error('Database not initialized');
    
    const field = userRole === 'customer' ? 'customerId' : 'providerId';
    
    const q = query(
      collection(db, 'bookings'),
      where(field, '==', userId),
      where('status', 'in', ['completed', 'cancelled']),
      orderBy('createdAt', 'desc')
    );
    
    const querySnapshot = await getDocs(q);
    const bookings: Booking[] = [];
    
    querySnapshot.forEach((doc) => {
      bookings.push({ id: doc.id, ...doc.data() } as Booking);
    });
    
    return bookings;
  }

  // Check availability
  static async checkAvailability(
    providerId: string, 
    serviceId: string, 
    date: Date, 
    duration: number
  ): Promise<boolean> {
    if (!db) throw new Error('Database not initialized');
    
    const startTime = Timestamp.fromDate(date);
    const endTime = Timestamp.fromDate(new Date(date.getTime() + duration * 60000));
    
    // Check for conflicting bookings
    const q = query(
      collection(db, 'bookings'),
      where('providerId', '==', providerId),
      where('status', 'in', ['pending', 'confirmed', 'in_progress']),
      where('scheduledDate', '>=', startTime),
      where('scheduledDate', '<', endTime)
    );
    
    const querySnapshot = await getDocs(q);
    
    // If no conflicting bookings found, the slot is available
    return querySnapshot.empty;
  }

  // Get booking statistics
  static async getBookingStats(userId: string, userRole: 'customer' | 'service_provider'): Promise<any> {
    if (!db) throw new Error('Database not initialized');
    
    const field = userRole === 'customer' ? 'customerId' : 'providerId';
    
    const q = query(
      collection(db, 'bookings'),
      where(field, '==', userId)
    );
    
    const querySnapshot = await getDocs(q);
    const bookings: Booking[] = [];
    
    querySnapshot.forEach((doc) => {
      bookings.push({ id: doc.id, ...doc.data() } as Booking);
    });
    
    const stats = {
      total: bookings.length,
      pending: bookings.filter(b => b.status === 'pending').length,
      confirmed: bookings.filter(b => b.status === 'confirmed').length,
      completed: bookings.filter(b => b.status === 'completed').length,
      cancelled: bookings.filter(b => b.status === 'cancelled').length,
      totalRevenue: bookings
        .filter(b => b.status === 'completed')
        .reduce((sum, b) => sum + b.totalAmount, 0),
      averageBookingValue: 0,
    };
    
    stats.averageBookingValue = stats.completed > 0 ? stats.totalRevenue / stats.completed : 0;
    
    return stats;
  }

  // Reschedule booking
  static async rescheduleBooking(bookingId: string, newDate: Date): Promise<void> {
    if (!db) throw new Error('Database not initialized');
    
    const bookingRef = doc(db, 'bookings', bookingId);
    await updateDoc(bookingRef, {
      scheduledDate: Timestamp.fromDate(newDate),
      updatedAt: Timestamp.now(),
    });
  }

  // Add notes to booking
  static async addBookingNotes(bookingId: string, notes: string): Promise<void> {
    if (!db) throw new Error('Database not initialized');
    
    const bookingRef = doc(db, 'bookings', bookingId);
    await updateDoc(bookingRef, {
      notes,
      updatedAt: Timestamp.now(),
    });
  }
}
