import { doc, updateDoc, getDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { updateProfile } from 'firebase/auth';
import { db, storage, auth } from '@/lib/firebase';
import { User, ServiceProvider, VerificationBadge } from '@/types';

export class UserService {
  // Update user profile
  static async updateProfile(userId: string, data: Partial<User>): Promise<void> {
    if (!db) throw new Error('Database not initialized');
    
    const userRef = doc(db, 'users', userId);
    await updateDoc(userRef, {
      ...data,
      updatedAt: new Date(),
    });

    // Update Firebase Auth profile if displayName or photoURL changed
    if (auth?.currentUser && (data.displayName || data.photoURL)) {
      await updateProfile(auth.currentUser, {
        displayName: data.displayName || auth.currentUser.displayName,
        photoURL: data.photoURL || auth.currentUser.photoURL,
      });
    }
  }

  // Upload profile picture
  static async uploadProfilePicture(userId: string, file: File): Promise<string> {
    if (!storage) throw new Error('Storage not initialized');
    
    const fileExtension = file.name.split('.').pop();
    const fileName = `profile-pictures/${userId}.${fileExtension}`;
    const storageRef = ref(storage, fileName);

    // Delete existing profile picture if it exists
    try {
      await deleteObject(storageRef);
    } catch (error) {
      // File doesn't exist, which is fine
    }

    // Upload new file
    const snapshot = await uploadBytes(storageRef, file);
    const downloadURL = await getDownloadURL(snapshot.ref);

    // Update user profile with new photo URL
    await this.updateProfile(userId, { photoURL: downloadURL });

    return downloadURL;
  }

  // Get user profile
  static async getProfile(userId: string): Promise<User | null> {
    if (!db) throw new Error('Database not initialized');
    
    const userRef = doc(db, 'users', userId);
    const userSnap = await getDoc(userRef);
    
    if (userSnap.exists()) {
      return { id: userId, ...userSnap.data() } as User;
    }
    
    return null;
  }

  // Update service provider specific data
  static async updateServiceProvider(userId: string, data: Partial<ServiceProvider>): Promise<void> {
    if (!db) throw new Error('Database not initialized');
    
    const providerRef = doc(db, 'serviceProviders', userId);
    await updateDoc(providerRef, {
      ...data,
      updatedAt: new Date(),
    });
  }

  // Add verification badge
  static async addVerificationBadge(userId: string, badge: VerificationBadge): Promise<void> {
    if (!db) throw new Error('Database not initialized');
    
    const userRef = doc(db, 'users', userId);
    const userSnap = await getDoc(userRef);
    
    if (userSnap.exists()) {
      const userData = userSnap.data() as User;
      const currentBadges = userData.verificationBadges || [];
      
      if (!currentBadges.includes(badge)) {
        await updateDoc(userRef, {
          verificationBadges: [...currentBadges, badge],
          updatedAt: new Date(),
        });
      }
    }
  }

  // Remove verification badge
  static async removeVerificationBadge(userId: string, badge: VerificationBadge): Promise<void> {
    if (!db) throw new Error('Database not initialized');
    
    const userRef = doc(db, 'users', userId);
    const userSnap = await getDoc(userRef);
    
    if (userSnap.exists()) {
      const userData = userSnap.data() as User;
      const currentBadges = userData.verificationBadges || [];
      
      await updateDoc(userRef, {
        verificationBadges: currentBadges.filter(b => b !== badge),
        updatedAt: new Date(),
      });
    }
  }

  // Update user preferences
  static async updatePreferences(userId: string, preferences: any): Promise<void> {
    if (!db) throw new Error('Database not initialized');
    
    const userRef = doc(db, 'users', userId);
    await updateDoc(userRef, {
      preferences: preferences,
      updatedAt: new Date(),
    });
  }

  // Deactivate user account
  static async deactivateAccount(userId: string): Promise<void> {
    if (!db) throw new Error('Database not initialized');
    
    const userRef = doc(db, 'users', userId);
    await updateDoc(userRef, {
      isActive: false,
      deactivatedAt: new Date(),
      updatedAt: new Date(),
    });
  }

  // Search users (admin function)
  static async searchUsers(searchTerm: string, role?: string): Promise<User[]> {
    if (!db) throw new Error('Database not initialized');
    
    let q = query(collection(db, 'users'));
    
    if (role) {
      q = query(collection(db, 'users'), where('role', '==', role));
    }
    
    const querySnapshot = await getDocs(q);
    const users: User[] = [];
    
    querySnapshot.forEach((doc) => {
      const userData = { id: doc.id, ...doc.data() } as User;
      
      // Simple search filter (in production, use proper search service)
      if (searchTerm) {
        const searchLower = searchTerm.toLowerCase();
        if (
          userData.displayName?.toLowerCase().includes(searchLower) ||
          userData.email?.toLowerCase().includes(searchLower)
        ) {
          users.push(userData);
        }
      } else {
        users.push(userData);
      }
    });
    
    return users;
  }

  // Get user statistics
  static async getUserStats(userId: string): Promise<any> {
    if (!db) throw new Error('Database not initialized');
    
    // This would typically aggregate data from multiple collections
    // For now, return mock data structure
    return {
      totalBookings: 0,
      completedBookings: 0,
      totalSpent: 0,
      averageRating: 0,
      reviewCount: 0,
      joinDate: new Date(),
    };
  }

  // Upload portfolio images (for service providers)
  static async uploadPortfolioImage(userId: string, file: File, title: string, description: string): Promise<string> {
    if (!storage) throw new Error('Storage not initialized');
    
    const fileExtension = file.name.split('.').pop();
    const fileName = `portfolio/${userId}/${Date.now()}.${fileExtension}`;
    const storageRef = ref(storage, fileName);

    const snapshot = await uploadBytes(storageRef, file);
    const downloadURL = await getDownloadURL(snapshot.ref);

    // Add to user's portfolio (this would be stored in a separate collection in production)
    const portfolioItem = {
      id: Date.now().toString(),
      title,
      description,
      imageUrl: downloadURL,
      createdAt: new Date(),
    };

    // Update user's portfolio array
    const userRef = doc(db, 'users', userId);
    const userSnap = await getDoc(userRef);
    
    if (userSnap.exists()) {
      const userData = userSnap.data() as ServiceProvider;
      const currentPortfolio = userData.portfolio || [];
      
      await updateDoc(userRef, {
        portfolio: [...currentPortfolio, portfolioItem],
        updatedAt: new Date(),
      });
    }

    return downloadURL;
  }

  // Delete portfolio image
  static async deletePortfolioImage(userId: string, imageId: string): Promise<void> {
    if (!db || !storage) throw new Error('Services not initialized');
    
    const userRef = doc(db, 'users', userId);
    const userSnap = await getDoc(userRef);
    
    if (userSnap.exists()) {
      const userData = userSnap.data() as ServiceProvider;
      const currentPortfolio = userData.portfolio || [];
      const imageToDelete = currentPortfolio.find(item => item.id === imageId);
      
      if (imageToDelete) {
        // Delete from storage
        try {
          const imageRef = ref(storage, imageToDelete.imageUrl);
          await deleteObject(imageRef);
        } catch (error) {
          console.error('Error deleting image from storage:', error);
        }
        
        // Remove from portfolio array
        await updateDoc(userRef, {
          portfolio: currentPortfolio.filter(item => item.id !== imageId),
          updatedAt: new Date(),
        });
      }
    }
  }
}
