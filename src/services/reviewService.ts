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
  Timestamp,
  writeBatch 
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Review, ReviewStatus } from '@/types';

export class ReviewService {
  // Create a new review
  static async createReview(reviewData: Omit<Review, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    if (!db) throw new Error('Database not initialized');
    
    const docRef = await addDoc(collection(db, 'reviews'), {
      ...reviewData,
      status: 'pending' as ReviewStatus,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    });
    
    // Update provider's average rating
    await this.updateProviderRating(reviewData.providerId);
    
    return docRef.id;
  }

  // Update review status (for moderation)
  static async updateReviewStatus(reviewId: string, status: ReviewStatus, moderatorId?: string): Promise<void> {
    if (!db) throw new Error('Database not initialized');
    
    const reviewRef = doc(db, 'reviews', reviewId);
    const updateData: any = {
      status,
      updatedAt: Timestamp.now(),
    };
    
    if (moderatorId) {
      updateData.moderatedBy = moderatorId;
      updateData.moderatedAt = Timestamp.now();
    }
    
    await updateDoc(reviewRef, updateData);
    
    // Update provider rating if review is approved/rejected
    if (status === 'approved' || status === 'rejected') {
      const reviewSnap = await getDoc(reviewRef);
      if (reviewSnap.exists()) {
        const review = reviewSnap.data() as Review;
        await this.updateProviderRating(review.providerId);
      }
    }
  }

  // Get reviews for a provider
  static async getProviderReviews(providerId: string, status: ReviewStatus = 'approved'): Promise<Review[]> {
    if (!db) throw new Error('Database not initialized');
    
    const q = query(
      collection(db, 'reviews'),
      where('providerId', '==', providerId),
      where('status', '==', status),
      orderBy('createdAt', 'desc')
    );
    
    const querySnapshot = await getDocs(q);
    const reviews: Review[] = [];
    
    querySnapshot.forEach((doc) => {
      reviews.push({ id: doc.id, ...doc.data() } as Review);
    });
    
    return reviews;
  }

  // Get reviews by customer
  static async getCustomerReviews(customerId: string): Promise<Review[]> {
    if (!db) throw new Error('Database not initialized');
    
    const q = query(
      collection(db, 'reviews'),
      where('customerId', '==', customerId),
      orderBy('createdAt', 'desc')
    );
    
    const querySnapshot = await getDocs(q);
    const reviews: Review[] = [];
    
    querySnapshot.forEach((doc) => {
      reviews.push({ id: doc.id, ...doc.data() } as Review);
    });
    
    return reviews;
  }

  // Get review by booking
  static async getReviewByBooking(bookingId: string): Promise<Review | null> {
    if (!db) throw new Error('Database not initialized');
    
    const q = query(
      collection(db, 'reviews'),
      where('bookingId', '==', bookingId),
      limit(1)
    );
    
    const querySnapshot = await getDocs(q);
    
    if (!querySnapshot.empty) {
      const doc = querySnapshot.docs[0];
      return { id: doc.id, ...doc.data() } as Review;
    }
    
    return null;
  }

  // Update provider's average rating
  static async updateProviderRating(providerId: string): Promise<void> {
    if (!db) throw new Error('Database not initialized');
    
    const reviews = await this.getProviderReviews(providerId, 'approved');
    
    if (reviews.length === 0) {
      // No reviews, set default values
      const providerRef = doc(db, 'users', providerId);
      await updateDoc(providerRef, {
        rating: 0,
        reviewCount: 0,
        updatedAt: Timestamp.now(),
      });
      return;
    }
    
    const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0);
    const averageRating = totalRating / reviews.length;
    
    const providerRef = doc(db, 'users', providerId);
    await updateDoc(providerRef, {
      rating: Math.round(averageRating * 10) / 10, // Round to 1 decimal place
      reviewCount: reviews.length,
      updatedAt: Timestamp.now(),
    });
  }

  // Delete a review
  static async deleteReview(reviewId: string): Promise<void> {
    if (!db) throw new Error('Database not initialized');
    
    const reviewRef = doc(db, 'reviews', reviewId);
    const reviewSnap = await getDoc(reviewRef);
    
    if (reviewSnap.exists()) {
      const review = reviewSnap.data() as Review;
      await deleteDoc(reviewRef);
      
      // Update provider rating after deletion
      await this.updateProviderRating(review.providerId);
    }
  }

  // Get pending reviews for moderation
  static async getPendingReviews(): Promise<Review[]> {
    if (!db) throw new Error('Database not initialized');
    
    const q = query(
      collection(db, 'reviews'),
      where('status', '==', 'pending'),
      orderBy('createdAt', 'asc')
    );
    
    const querySnapshot = await getDocs(q);
    const reviews: Review[] = [];
    
    querySnapshot.forEach((doc) => {
      reviews.push({ id: doc.id, ...doc.data() } as Review);
    });
    
    return reviews;
  }

  // Get review statistics
  static async getReviewStats(providerId?: string): Promise<any> {
    if (!db) throw new Error('Database not initialized');
    
    let q = query(collection(db, 'reviews'));
    
    if (providerId) {
      q = query(q, where('providerId', '==', providerId));
    }
    
    const querySnapshot = await getDocs(q);
    const reviews: Review[] = [];
    
    querySnapshot.forEach((doc) => {
      reviews.push({ id: doc.id, ...doc.data() } as Review);
    });
    
    const stats = {
      total: reviews.length,
      approved: reviews.filter(r => r.status === 'approved').length,
      pending: reviews.filter(r => r.status === 'pending').length,
      rejected: reviews.filter(r => r.status === 'rejected').length,
      averageRating: 0,
      ratingDistribution: {
        1: 0,
        2: 0,
        3: 0,
        4: 0,
        5: 0,
      },
    };
    
    const approvedReviews = reviews.filter(r => r.status === 'approved');
    
    if (approvedReviews.length > 0) {
      const totalRating = approvedReviews.reduce((sum, review) => sum + review.rating, 0);
      stats.averageRating = Math.round((totalRating / approvedReviews.length) * 10) / 10;
      
      // Calculate rating distribution
      approvedReviews.forEach(review => {
        stats.ratingDistribution[review.rating as keyof typeof stats.ratingDistribution]++;
      });
    }
    
    return stats;
  }

  // Report a review
  static async reportReview(reviewId: string, reporterId: string, reason: string): Promise<void> {
    if (!db) throw new Error('Database not initialized');
    
    const reportData = {
      reviewId,
      reporterId,
      reason,
      status: 'pending',
      createdAt: Timestamp.now(),
    };
    
    await addDoc(collection(db, 'reviewReports'), reportData);
    
    // Update review status to flagged
    const reviewRef = doc(db, 'reviews', reviewId);
    await updateDoc(reviewRef, {
      status: 'flagged' as ReviewStatus,
      updatedAt: Timestamp.now(),
    });
  }

  // Bulk approve/reject reviews
  static async bulkUpdateReviews(reviewIds: string[], status: ReviewStatus, moderatorId: string): Promise<void> {
    if (!db) throw new Error('Database not initialized');
    
    const batch = writeBatch(db);
    const providerIds = new Set<string>();
    
    for (const reviewId of reviewIds) {
      const reviewRef = doc(db, 'reviews', reviewId);
      const reviewSnap = await getDoc(reviewRef);
      
      if (reviewSnap.exists()) {
        const review = reviewSnap.data() as Review;
        providerIds.add(review.providerId);
        
        batch.update(reviewRef, {
          status,
          moderatedBy: moderatorId,
          moderatedAt: Timestamp.now(),
          updatedAt: Timestamp.now(),
        });
      }
    }
    
    await batch.commit();
    
    // Update ratings for affected providers
    for (const providerId of providerIds) {
      await this.updateProviderRating(providerId);
    }
  }

  // Get recent reviews
  static async getRecentReviews(limitCount: number = 10): Promise<Review[]> {
    if (!db) throw new Error('Database not initialized');
    
    const q = query(
      collection(db, 'reviews'),
      where('status', '==', 'approved'),
      orderBy('createdAt', 'desc'),
      limit(limitCount)
    );
    
    const querySnapshot = await getDocs(q);
    const reviews: Review[] = [];
    
    querySnapshot.forEach((doc) => {
      reviews.push({ id: doc.id, ...doc.data() } as Review);
    });
    
    return reviews;
  }
}
