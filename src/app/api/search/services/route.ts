import { NextRequest, NextResponse } from 'next/server';
import { collection, query, where, orderBy, limit, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Service, SearchFilters } from '@/types';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const searchQuery = searchParams.get('q') || '';
    const category = searchParams.get('category');
    const subcategory = searchParams.get('subcategory');
    const minPrice = searchParams.get('minPrice');
    const maxPrice = searchParams.get('maxPrice');
    const sortBy = searchParams.get('sortBy') || 'relevance';
    const pageSize = parseInt(searchParams.get('pageSize') || '20');

    if (!db) {
      return NextResponse.json(
        { success: false, error: 'Database not initialized' },
        { status: 500 }
      );
    }

    let q = query(collection(db, 'services'), where('isActive', '==', true));

    // Apply filters
    if (category) {
      q = query(q, where('category', '==', category));
    }
    
    if (subcategory) {
      q = query(q, where('subcategory', '==', subcategory));
    }

    // Add ordering
    switch (sortBy) {
      case 'price_low':
        q = query(q, orderBy('pricing.basePrice', 'asc'));
        break;
      case 'price_high':
        q = query(q, orderBy('pricing.basePrice', 'desc'));
        break;
      case 'newest':
        q = query(q, orderBy('createdAt', 'desc'));
        break;
      default:
        q = query(q, orderBy('createdAt', 'desc'));
        break;
    }

    q = query(q, limit(pageSize));

    const querySnapshot = await getDocs(q);
    let services: Service[] = [];

    querySnapshot.forEach((doc) => {
      services.push({ id: doc.id, ...doc.data() } as Service);
    });

    // Apply text search filter (client-side for now)
    if (searchQuery) {
      const searchLower = searchQuery.toLowerCase();
      services = services.filter(service => 
        service.title.toLowerCase().includes(searchLower) ||
        service.description.toLowerCase().includes(searchLower) ||
        service.tags.some(tag => tag.toLowerCase().includes(searchLower))
      );
    }

    // Apply price range filter
    if (minPrice || maxPrice) {
      services = services.filter(service => {
        const price = service.pricing.basePrice;
        if (minPrice && price < parseFloat(minPrice)) return false;
        if (maxPrice && price > parseFloat(maxPrice)) return false;
        return true;
      });
    }

    return NextResponse.json({
      success: true,
      data: {
        services,
        totalCount: services.length,
        hasMore: false, // Simplified for now
        filters: {
          searchQuery,
          category,
          subcategory,
          minPrice,
          maxPrice,
          sortBy
        }
      }
    });
  } catch (error) {
    console.error('Service search error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to search services' },
      { status: 500 }
    );
  }
}
