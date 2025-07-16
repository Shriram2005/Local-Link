import { NextRequest, NextResponse } from 'next/server';
import { collection, addDoc, getDocs, query, where, orderBy, Timestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Review } from '@/types';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const providerId = searchParams.get('providerId');
    const customerId = searchParams.get('customerId');
    const bookingId = searchParams.get('bookingId');
    
    if (!db) {
      return NextResponse.json(
        { success: false, error: 'Database not initialized' },
        { status: 500 }
      );
    }

    let q = query(collection(db, 'reviews'), where('status', '==', 'approved'));

    // Apply filters
    if (providerId) {
      q = query(q, where('providerId', '==', providerId));
    }
    
    if (customerId) {
      q = query(q, where('customerId', '==', customerId));
    }
    
    if (bookingId) {
      q = query(q, where('bookingId', '==', bookingId));
    }

    q = query(q, orderBy('createdAt', 'desc'));

    const querySnapshot = await getDocs(q);
    const reviews: Review[] = [];

    querySnapshot.forEach((doc) => {
      reviews.push({ id: doc.id, ...doc.data() } as Review);
    });

    // Calculate average rating if for a provider
    let averageRating = 0;
    if (providerId && reviews.length > 0) {
      const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0);
      averageRating = totalRating / reviews.length;
    }

    return NextResponse.json({
      success: true,
      data: {
        reviews,
        averageRating: Math.round(averageRating * 10) / 10,
        totalCount: reviews.length
      }
    });
  } catch (error) {
    console.error('Reviews fetch error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch reviews' },
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
    const { bookingId, providerId, rating, comment, images = [] } = body;

    if (!bookingId || !providerId || !rating || rating < 1 || rating > 5) {
      return NextResponse.json(
        { success: false, error: 'Valid booking ID, provider ID, and rating (1-5) required' },
        { status: 400 }
      );
    }

    const reviewData = {
      bookingId,
      customerId: userId,
      providerId,
      rating,
      comment: comment || '',
      images,
      status: 'pending', // Reviews need moderation
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    };

    const docRef = await addDoc(collection(db, 'reviews'), reviewData);

    return NextResponse.json({
      success: true,
      data: { id: docRef.id },
      message: 'Review submitted successfully and is pending moderation'
    });
  } catch (error) {
    console.error('Review creation error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create review' },
      { status: 500 }
    );
  }
}
