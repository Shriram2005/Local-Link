import { 
  collection, 
  doc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  getDoc, 
  getDocs, 
  query, 
  where, 
  orderBy, 
  limit,
  startAfter,
  Timestamp 
} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { db, storage } from '@/lib/firebase';
import { Service, SearchFilters, SearchResult } from '@/types';

export class ServiceService {
  // Create a new service
  static async createService(serviceData: Omit<Service, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    if (!db) throw new Error('Database not initialized');
    
    const docRef = await addDoc(collection(db, 'services'), {
      ...serviceData,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    });
    
    return docRef.id;
  }

  // Update a service
  static async updateService(serviceId: string, updates: Partial<Service>): Promise<void> {
    if (!db) throw new Error('Database not initialized');
    
    const serviceRef = doc(db, 'services', serviceId);
    await updateDoc(serviceRef, {
      ...updates,
      updatedAt: Timestamp.now(),
    });
  }

  // Delete a service
  static async deleteService(serviceId: string): Promise<void> {
    if (!db) throw new Error('Database not initialized');
    
    const serviceRef = doc(db, 'services', serviceId);
    const serviceSnap = await getDoc(serviceRef);
    
    if (serviceSnap.exists()) {
      const serviceData = serviceSnap.data() as Service;
      
      // Delete associated images from storage
      if (serviceData.images && storage) {
        for (const imageUrl of serviceData.images) {
          try {
            const imageRef = ref(storage, imageUrl);
            await deleteObject(imageRef);
          } catch (error) {
            console.error('Error deleting image:', error);
          }
        }
      }
      
      // Delete the service document
      await deleteDoc(serviceRef);
    }
  }

  // Get a single service
  static async getService(serviceId: string): Promise<Service | null> {
    if (!db) throw new Error('Database not initialized');
    
    const serviceRef = doc(db, 'services', serviceId);
    const serviceSnap = await getDoc(serviceRef);
    
    if (serviceSnap.exists()) {
      return { id: serviceId, ...serviceSnap.data() } as Service;
    }
    
    return null;
  }

  // Get services by provider
  static async getServicesByProvider(providerId: string): Promise<Service[]> {
    if (!db) throw new Error('Database not initialized');
    
    const q = query(
      collection(db, 'services'),
      where('providerId', '==', providerId),
      orderBy('createdAt', 'desc')
    );
    
    const querySnapshot = await getDocs(q);
    const services: Service[] = [];
    
    querySnapshot.forEach((doc) => {
      services.push({ id: doc.id, ...doc.data() } as Service);
    });
    
    return services;
  }

  // Search services with filters
  static async searchServices(filters: SearchFilters, pageSize: number = 20, lastDoc?: any): Promise<SearchResult> {
    if (!db) throw new Error('Database not initialized');
    
    let q = query(collection(db, 'services'), where('isActive', '==', true));
    
    // Apply filters
    if (filters.category) {
      q = query(q, where('category', '==', filters.category));
    }
    
    if (filters.subcategory) {
      q = query(q, where('subcategory', '==', filters.subcategory));
    }
    
    // Add ordering and pagination
    q = query(q, orderBy('createdAt', 'desc'), limit(pageSize));
    
    if (lastDoc) {
      q = query(q, startAfter(lastDoc));
    }
    
    const querySnapshot = await getDocs(q);
    const services: Service[] = [];
    
    querySnapshot.forEach((doc) => {
      services.push({ id: doc.id, ...doc.data() } as Service);
    });
    
    // Filter by location if provided (in production, use geospatial queries)
    let filteredServices = services;
    if (filters.location) {
      // This is a simplified location filter - in production, use proper geospatial queries
      filteredServices = services.filter(service => {
        // Mock distance calculation - replace with actual geospatial logic
        return true;
      });
    }
    
    // Filter by price range
    if (filters.priceRange) {
      filteredServices = filteredServices.filter(service => {
        const price = service.pricing.basePrice;
        return price >= filters.priceRange!.min && price <= filters.priceRange!.max;
      });
    }
    
    // Sort results
    if (filters.sortBy) {
      switch (filters.sortBy) {
        case 'price_low':
          filteredServices.sort((a, b) => a.pricing.basePrice - b.pricing.basePrice);
          break;
        case 'price_high':
          filteredServices.sort((a, b) => b.pricing.basePrice - a.pricing.basePrice);
          break;
        case 'rating':
          // Would need to join with provider ratings
          break;
        case 'distance':
          // Would need geospatial sorting
          break;
        default:
          // Keep default order (relevance/created date)
          break;
      }
    }
    
    return {
      services: filteredServices,
      providers: [], // Would be populated with provider data
      totalCount: filteredServices.length,
      hasMore: querySnapshot.docs.length === pageSize,
    };
  }

  // Upload service images
  static async uploadServiceImages(serviceId: string, files: File[]): Promise<string[]> {
    if (!storage) throw new Error('Storage not initialized');
    
    const uploadPromises = files.map(async (file, index) => {
      const fileExtension = file.name.split('.').pop();
      const fileName = `services/${serviceId}/${Date.now()}-${index}.${fileExtension}`;
      const storageRef = ref(storage, fileName);
      
      const snapshot = await uploadBytes(storageRef, file);
      return getDownloadURL(snapshot.ref);
    });
    
    return Promise.all(uploadPromises);
  }

  // Get featured services
  static async getFeaturedServices(limit: number = 10): Promise<Service[]> {
    if (!db) throw new Error('Database not initialized');
    
    const q = query(
      collection(db, 'services'),
      where('isActive', '==', true),
      orderBy('createdAt', 'desc'),
      limit(limit)
    );
    
    const querySnapshot = await getDocs(q);
    const services: Service[] = [];
    
    querySnapshot.forEach((doc) => {
      services.push({ id: doc.id, ...doc.data() } as Service);
    });
    
    return services;
  }

  // Get services by category
  static async getServicesByCategory(category: string, subcategory?: string): Promise<Service[]> {
    if (!db) throw new Error('Database not initialized');
    
    let q = query(
      collection(db, 'services'),
      where('isActive', '==', true),
      where('category', '==', category)
    );
    
    if (subcategory) {
      q = query(q, where('subcategory', '==', subcategory));
    }
    
    q = query(q, orderBy('createdAt', 'desc'));
    
    const querySnapshot = await getDocs(q);
    const services: Service[] = [];
    
    querySnapshot.forEach((doc) => {
      services.push({ id: doc.id, ...doc.data() } as Service);
    });
    
    return services;
  }

  // Toggle service active status
  static async toggleServiceStatus(serviceId: string, isActive: boolean): Promise<void> {
    if (!db) throw new Error('Database not initialized');
    
    const serviceRef = doc(db, 'services', serviceId);
    await updateDoc(serviceRef, {
      isActive,
      updatedAt: Timestamp.now(),
    });
  }

  // Get service statistics
  static async getServiceStats(serviceId: string): Promise<any> {
    if (!db) throw new Error('Database not initialized');
    
    // This would typically aggregate data from bookings, reviews, etc.
    // For now, return mock data structure
    return {
      totalBookings: 0,
      completedBookings: 0,
      averageRating: 0,
      reviewCount: 0,
      revenue: 0,
      viewCount: 0,
    };
  }

  // Bulk update services
  static async bulkUpdateServices(updates: { serviceId: string; data: Partial<Service> }[]): Promise<void> {
    if (!db) throw new Error('Database not initialized');
    
    const updatePromises = updates.map(({ serviceId, data }) => {
      const serviceRef = doc(db, 'services', serviceId);
      return updateDoc(serviceRef, {
        ...data,
        updatedAt: Timestamp.now(),
      });
    });
    
    await Promise.all(updatePromises);
  }
}
