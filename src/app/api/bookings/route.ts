import { NextRequest, NextResponse } from 'next/server';
import { collection, addDoc, getDocs, query, where, orderBy, Timestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Booking } from '@/types';
import { COMMISSION_RATE } from '@/constants';

export async function GET(request: NextRequest) {
  try {
    const userId = request.headers.get('x-user-id');
    const { searchParams } = new URL(request.url);
    const role = searchParams.get('role') || 'customer';
    
    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'User ID required' },
        { status: 401 }
      );
    }

    if (!db) {
      return NextResponse.json(
        { success: false, error: 'Database not initialized' },
        { status: 500 }
      );
    }

    const field = role === 'customer' ? 'customerId' : 'providerId';
    const q = query(
      collection(db, 'bookings'),
      where(field, '==', userId),
      orderBy('createdAt', 'desc')
    );

    const querySnapshot = await getDocs(q);
    const bookings: Booking[] = [];

    querySnapshot.forEach((doc) => {
      bookings.push({ id: doc.id, ...doc.data() } as Booking);
    });

    return NextResponse.json({
      success: true,
      data: bookings
    });
  } catch (error) {
    console.error('Bookings fetch error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch bookings' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const userId = request.headers.get('x-user-id');
    
    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'User ID required' },
        { status: 401 }
      );
    }

    if (!db) {
      return NextResponse.json(
        { success: false, error: 'Database not initialized' },
        { status: 500 }
      );
    }

    const body = await request.json();
    const { serviceId, providerId, scheduledDate, duration, location, notes, totalAmount } = body;

    const commissionAmount = totalAmount * COMMISSION_RATE;

    const bookingData = {
      customerId: userId,
      providerId,
      serviceId,
      status: 'pending',
      scheduledDate: Timestamp.fromDate(new Date(scheduledDate)),
      duration,
      location,
      notes: notes || '',
      totalAmount,
      commissionAmount,
      paymentStatus: 'pending',
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    };

    const docRef = await addDoc(collection(db, 'bookings'), bookingData);

    return NextResponse.json({
      success: true,
      data: { id: docRef.id },
      message: 'Booking created successfully'
    });
  } catch (error) {
    console.error('Booking creation error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create booking' },
      { status: 500 }
    );
  }
}
