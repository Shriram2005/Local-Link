import { NextRequest, NextResponse } from 'next/server';
import { collection, addDoc, getDocs, query, where, orderBy, limit, startAfter, Timestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Service, SearchFilters } from '@/types';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const providerId = searchParams.get('providerId');
    const category = searchParams.get('category');
    const subcategory = searchParams.get('subcategory');
    const pageSize = parseInt(searchParams.get('pageSize') || '20');
    const lastDocId = searchParams.get('lastDoc');

    if (!db) {
      return NextResponse.json(
        { success: false, error: 'Database not initialized' },
        { status: 500 }
      );
    }

    let q = query(collection(db, 'services'), where('isActive', '==', true));

    // Apply filters
    if (providerId) {
      q = query(q, where('providerId', '==', providerId));
    }
    
    if (category) {
      q = query(q, where('category', '==', category));
    }
    
    if (subcategory) {
      q = query(q, where('subcategory', '==', subcategory));
    }

    // Add ordering and pagination
    q = query(q, orderBy('createdAt', 'desc'), limit(pageSize));

    if (lastDocId) {
      // In a real implementation, you'd need to get the document snapshot
      // For now, we'll skip this pagination feature
    }

    const querySnapshot = await getDocs(q);
    const services: Service[] = [];

    querySnapshot.forEach((doc) => {
      services.push({ id: doc.id, ...doc.data() } as Service);
    });

    return NextResponse.json({
      success: true,
      data: {
        services,
        totalCount: services.length,
        hasMore: querySnapshot.docs.length === pageSize
      }
    });
  } catch (error) {
    console.error('Services fetch error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch services' },
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
    const serviceData = {
      ...body,
      providerId: userId,
      isActive: true,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    };

    const docRef = await addDoc(collection(db, 'services'), serviceData);

    return NextResponse.json({
      success: true,
      data: { id: docRef.id },
      message: 'Service created successfully'
    });
  } catch (error) {
    console.error('Service creation error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create service' },
      { status: 500 }
    );
  }
}
