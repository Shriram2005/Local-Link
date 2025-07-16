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
  limit,
  Timestamp 
} from 'firebase/firestore';
import { db } from '@/lib/firebase';

export interface ReferralCode {
  id: string;
  code: string;
  userId: string;
  type: 'customer' | 'service_provider';
  isActive: boolean;
  usageCount: number;
  maxUsage?: number;
  expiresAt?: Timestamp;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface ReferralUsage {
  id: string;
  referralCodeId: string;
  referrerId: string;
  referredUserId: string;
  referredUserEmail: string;
  status: 'pending' | 'completed' | 'cancelled';
  rewardAmount: number;
  rewardType: 'credit' | 'discount' | 'cash';
  bookingId?: string;
  createdAt: Timestamp;
  completedAt?: Timestamp;
}

export interface ReferralReward {
  id: string;
  userId: string;
  referralUsageId: string;
  amount: number;
  type: 'credit' | 'discount' | 'cash';
  status: 'pending' | 'paid' | 'expired';
  description: string;
  expiresAt?: Timestamp;
  paidAt?: Timestamp;
  createdAt: Timestamp;
}

export class ReferralService {
  // Generate a unique referral code
  static generateReferralCode(userId: string): string {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    for (let i = 0; i < 8; i++) {
      result += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    return `${result}-${userId.slice(-4).toUpperCase()}`;
  }

  // Create a referral code for a user
  static async createReferralCode(
    userId: string,
    type: 'customer' | 'service_provider',
    maxUsage?: number,
    expiresAt?: Date
  ): Promise<string> {
    if (!db) throw new Error('Database not initialized');
    
    const code = this.generateReferralCode(userId);
    
    const referralCodeData: Omit<ReferralCode, 'id'> = {
      code,
      userId,
      type,
      isActive: true,
      usageCount: 0,
      maxUsage,
      expiresAt: expiresAt ? Timestamp.fromDate(expiresAt) : undefined,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    };
    
    const docRef = await addDoc(collection(db, 'referralCodes'), referralCodeData);
    return docRef.id;
  }

  // Get referral code by code string
  static async getReferralCodeByCode(code: string): Promise<ReferralCode | null> {
    if (!db) throw new Error('Database not initialized');
    
    const q = query(
      collection(db, 'referralCodes'),
      where('code', '==', code),
      where('isActive', '==', true),
      limit(1)
    );
    
    const querySnapshot = await getDocs(q);
    
    if (!querySnapshot.empty) {
      const doc = querySnapshot.docs[0];
      return { id: doc.id, ...doc.data() } as ReferralCode;
    }
    
    return null;
  }

  // Get user's referral codes
  static async getUserReferralCodes(userId: string): Promise<ReferralCode[]> {
    if (!db) throw new Error('Database not initialized');
    
    const q = query(
      collection(db, 'referralCodes'),
      where('userId', '==', userId),
      orderBy('createdAt', 'desc')
    );
    
    const querySnapshot = await getDocs(q);
    const referralCodes: ReferralCode[] = [];
    
    querySnapshot.forEach((doc) => {
      referralCodes.push({ id: doc.id, ...doc.data() } as ReferralCode);
    });
    
    return referralCodes;
  }

  // Use a referral code
  static async useReferralCode(
    referralCode: string,
    referredUserId: string,
    referredUserEmail: string
  ): Promise<{ success: boolean; error?: string; referralUsageId?: string }> {
    if (!db) throw new Error('Database not initialized');
    
    try {
      // Get the referral code
      const code = await this.getReferralCodeByCode(referralCode);
      
      if (!code) {
        return { success: false, error: 'Invalid referral code' };
      }
      
      // Check if code is expired
      if (code.expiresAt && code.expiresAt.toDate() < new Date()) {
        return { success: false, error: 'Referral code has expired' };
      }
      
      // Check if code has reached max usage
      if (code.maxUsage && code.usageCount >= code.maxUsage) {
        return { success: false, error: 'Referral code has reached maximum usage' };
      }
      
      // Check if user is trying to refer themselves
      if (code.userId === referredUserId) {
        return { success: false, error: 'Cannot use your own referral code' };
      }
      
      // Check if user has already been referred
      const existingUsage = await this.getUserReferralUsage(referredUserId);
      if (existingUsage.length > 0) {
        return { success: false, error: 'User has already been referred' };
      }
      
      // Create referral usage record
      const rewardAmount = this.calculateRewardAmount(code.type);
      
      const referralUsageData: Omit<ReferralUsage, 'id'> = {
        referralCodeId: code.id,
        referrerId: code.userId,
        referredUserId,
        referredUserEmail,
        status: 'pending',
        rewardAmount,
        rewardType: 'credit',
        createdAt: Timestamp.now(),
      };
      
      const usageDocRef = await addDoc(collection(db, 'referralUsages'), referralUsageData);
      
      // Update referral code usage count
      const codeRef = doc(db, 'referralCodes', code.id);
      await updateDoc(codeRef, {
        usageCount: code.usageCount + 1,
        updatedAt: Timestamp.now(),
      });
      
      return { success: true, referralUsageId: usageDocRef.id };
    } catch (error) {
      console.error('Error using referral code:', error);
      return { success: false, error: 'Failed to use referral code' };
    }
  }

  // Complete a referral (when referred user makes first booking)
  static async completeReferral(referralUsageId: string, bookingId: string): Promise<boolean> {
    if (!db) throw new Error('Database not initialized');
    
    try {
      const usageRef = doc(db, 'referralUsages', referralUsageId);
      const usageSnap = await getDoc(usageRef);
      
      if (!usageSnap.exists()) {
        return false;
      }
      
      const usage = usageSnap.data() as ReferralUsage;
      
      if (usage.status !== 'pending') {
        return false;
      }
      
      // Update referral usage status
      await updateDoc(usageRef, {
        status: 'completed',
        bookingId,
        completedAt: Timestamp.now(),
      });
      
      // Create rewards for both referrer and referred user
      await this.createReferralReward(usage.referrerId, referralUsageId, usage.rewardAmount, 'credit', 'Referral reward');
      await this.createReferralReward(usage.referredUserId, referralUsageId, usage.rewardAmount, 'discount', 'Welcome bonus');
      
      return true;
    } catch (error) {
      console.error('Error completing referral:', error);
      return false;
    }
  }

  // Create a referral reward
  static async createReferralReward(
    userId: string,
    referralUsageId: string,
    amount: number,
    type: 'credit' | 'discount' | 'cash',
    description: string,
    expiresAt?: Date
  ): Promise<string> {
    if (!db) throw new Error('Database not initialized');
    
    const rewardData: Omit<ReferralReward, 'id'> = {
      userId,
      referralUsageId,
      amount,
      type,
      status: 'pending',
      description,
      expiresAt: expiresAt ? Timestamp.fromDate(expiresAt) : undefined,
      createdAt: Timestamp.now(),
    };
    
    const docRef = await addDoc(collection(db, 'referralRewards'), rewardData);
    return docRef.id;
  }

  // Get user's referral usage (as referred user)
  static async getUserReferralUsage(userId: string): Promise<ReferralUsage[]> {
    if (!db) throw new Error('Database not initialized');
    
    const q = query(
      collection(db, 'referralUsages'),
      where('referredUserId', '==', userId),
      orderBy('createdAt', 'desc')
    );
    
    const querySnapshot = await getDocs(q);
    const usages: ReferralUsage[] = [];
    
    querySnapshot.forEach((doc) => {
      usages.push({ id: doc.id, ...doc.data() } as ReferralUsage);
    });
    
    return usages;
  }

  // Get user's referral rewards
  static async getUserReferralRewards(userId: string): Promise<ReferralReward[]> {
    if (!db) throw new Error('Database not initialized');
    
    const q = query(
      collection(db, 'referralRewards'),
      where('userId', '==', userId),
      orderBy('createdAt', 'desc')
    );
    
    const querySnapshot = await getDocs(q);
    const rewards: ReferralReward[] = [];
    
    querySnapshot.forEach((doc) => {
      rewards.push({ id: doc.id, ...doc.data() } as ReferralReward);
    });
    
    return rewards;
  }

  // Get referral statistics for a user
  static async getReferralStats(userId: string): Promise<{
    totalReferrals: number;
    completedReferrals: number;
    pendingReferrals: number;
    totalRewards: number;
    availableRewards: number;
    referralCodes: ReferralCode[];
  }> {
    if (!db) throw new Error('Database not initialized');
    
    try {
      // Get user's referral codes
      const referralCodes = await this.getUserReferralCodes(userId);
      
      // Get referrals made by this user
      const q = query(
        collection(db, 'referralUsages'),
        where('referrerId', '==', userId)
      );
      
      const querySnapshot = await getDocs(q);
      const referrals: ReferralUsage[] = [];
      
      querySnapshot.forEach((doc) => {
        referrals.push({ id: doc.id, ...doc.data() } as ReferralUsage);
      });
      
      // Get user's rewards
      const rewards = await this.getUserReferralRewards(userId);
      
      const stats = {
        totalReferrals: referrals.length,
        completedReferrals: referrals.filter(r => r.status === 'completed').length,
        pendingReferrals: referrals.filter(r => r.status === 'pending').length,
        totalRewards: rewards.reduce((sum, reward) => sum + reward.amount, 0),
        availableRewards: rewards.filter(r => r.status === 'pending').reduce((sum, reward) => sum + reward.amount, 0),
        referralCodes,
      };
      
      return stats;
    } catch (error) {
      console.error('Error getting referral stats:', error);
      return {
        totalReferrals: 0,
        completedReferrals: 0,
        pendingReferrals: 0,
        totalRewards: 0,
        availableRewards: 0,
        referralCodes: [],
      };
    }
  }

  // Calculate reward amount based on referral type
  private static calculateRewardAmount(type: 'customer' | 'service_provider'): number {
    // Different reward amounts for different user types
    switch (type) {
      case 'customer':
        return 10.00; // $10 credit for customer referrals
      case 'service_provider':
        return 25.00; // $25 credit for service provider referrals
      default:
        return 10.00;
    }
  }

  // Deactivate a referral code
  static async deactivateReferralCode(codeId: string): Promise<boolean> {
    if (!db) throw new Error('Database not initialized');
    
    try {
      const codeRef = doc(db, 'referralCodes', codeId);
      await updateDoc(codeRef, {
        isActive: false,
        updatedAt: Timestamp.now(),
      });
      
      return true;
    } catch (error) {
      console.error('Error deactivating referral code:', error);
      return false;
    }
  }

  // Get referral leaderboard
  static async getReferralLeaderboard(limit: number = 10): Promise<Array<{
    userId: string;
    userName: string;
    totalReferrals: number;
    completedReferrals: number;
    totalRewards: number;
  }>> {
    // Mock leaderboard data for demo
    return [
      { userId: 'user1', userName: 'John Smith', totalReferrals: 25, completedReferrals: 20, totalRewards: 500 },
      { userId: 'user2', userName: 'Sarah Johnson', totalReferrals: 18, completedReferrals: 15, totalRewards: 375 },
      { userId: 'user3', userName: 'Mike Wilson', totalReferrals: 12, completedReferrals: 10, totalRewards: 250 },
      { userId: 'user4', userName: 'Emily Davis', totalReferrals: 8, completedReferrals: 7, totalRewards: 175 },
      { userId: 'user5', userName: 'David Brown', totalReferrals: 6, completedReferrals: 5, totalRewards: 125 },
    ];
  }
}
