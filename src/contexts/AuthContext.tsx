'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { 
  User as FirebaseUser,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  updateProfile,
  sendPasswordResetEmail,
  GoogleAuthProvider,
  signInWithPopup
} from 'firebase/auth';
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';
import { User, UserRole } from '@/types';

interface AuthContextType {
  user: User | null;
  firebaseUser: FirebaseUser | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, displayName: string, role: UserRole) => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  updateUserProfile: (data: Partial<User>) => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

interface AuthProviderProps {
  children: React.ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [loading, setLoading] = useState(true);

  // Fetch user data from Firestore
  const fetchUserData = async (firebaseUser: FirebaseUser): Promise<User | null> => {
    try {
      const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
      if (userDoc.exists()) {
        return { id: firebaseUser.uid, ...userDoc.data() } as User;
      }
      return null;
    } catch (error) {
      console.error('Error fetching user data:', error);
      return null;
    }
  };

  // Create user document in Firestore
  const createUserDocument = async (
    firebaseUser: FirebaseUser,
    additionalData: { displayName: string; role: UserRole }
  ): Promise<User> => {
    const userData: Omit<User, 'id'> = {
      email: firebaseUser.email!,
      displayName: additionalData.displayName,
      photoURL: firebaseUser.photoURL,
      role: additionalData.role,
      phoneNumber: firebaseUser.phoneNumber,
      isVerified: false,
      createdAt: new Date() as any,
      updatedAt: new Date() as any,
    };

    await setDoc(doc(db, 'users', firebaseUser.uid), userData);
    return { id: firebaseUser.uid, ...userData };
  };

  // Login with email and password
  const login = async (email: string, password: string) => {
    try {
      setLoading(true);
      const result = await signInWithEmailAndPassword(auth, email, password);
      const userData = await fetchUserData(result.user);
      if (!userData) {
        throw new Error('User data not found');
      }
      setUser(userData);
    } catch (error: any) {
      throw new Error(error.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  // Register with email and password
  const register = async (
    email: string,
    password: string,
    displayName: string,
    role: UserRole
  ) => {
    try {
      setLoading(true);
      const result = await createUserWithEmailAndPassword(auth, email, password);
      
      // Update Firebase Auth profile
      await updateProfile(result.user, { displayName });
      
      // Create user document in Firestore
      const userData = await createUserDocument(result.user, { displayName, role });
      setUser(userData);
    } catch (error: any) {
      throw new Error(error.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  // Login with Google
  const loginWithGoogle = async () => {
    try {
      setLoading(true);
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      
      let userData = await fetchUserData(result.user);
      
      // If user doesn't exist in Firestore, create them with default role
      if (!userData) {
        userData = await createUserDocument(result.user, {
          displayName: result.user.displayName || 'User',
          role: 'customer'
        });
      }
      
      setUser(userData);
    } catch (error: any) {
      throw new Error(error.message || 'Google login failed');
    } finally {
      setLoading(false);
    }
  };

  // Logout
  const logout = async () => {
    try {
      await signOut(auth);
      setUser(null);
      setFirebaseUser(null);
    } catch (error: any) {
      throw new Error(error.message || 'Logout failed');
    }
  };

  // Reset password
  const resetPassword = async (email: string) => {
    try {
      await sendPasswordResetEmail(auth, email);
    } catch (error: any) {
      throw new Error(error.message || 'Password reset failed');
    }
  };

  // Update user profile
  const updateUserProfile = async (data: Partial<User>) => {
    if (!user || !firebaseUser) {
      throw new Error('No user logged in');
    }

    try {
      setLoading(true);
      
      // Update Firestore document
      await updateDoc(doc(db, 'users', user.id), {
        ...data,
        updatedAt: new Date(),
      });

      // Update Firebase Auth profile if displayName or photoURL changed
      if (data.displayName || data.photoURL) {
        await updateProfile(firebaseUser, {
          displayName: data.displayName || firebaseUser.displayName,
          photoURL: data.photoURL || firebaseUser.photoURL,
        });
      }

      // Update local state
      setUser(prev => prev ? { ...prev, ...data, updatedAt: new Date() as any } : null);
    } catch (error: any) {
      throw new Error(error.message || 'Profile update failed');
    } finally {
      setLoading(false);
    }
  };

  // Refresh user data
  const refreshUser = async () => {
    if (!firebaseUser) return;
    
    try {
      const userData = await fetchUserData(firebaseUser);
      setUser(userData);
    } catch (error) {
      console.error('Error refreshing user data:', error);
    }
  };

  // Listen to auth state changes
  useEffect(() => {
    if (!auth) {
      setLoading(false);
      return;
    }

    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setLoading(true);

      if (firebaseUser) {
        setFirebaseUser(firebaseUser);
        const userData = await fetchUserData(firebaseUser);
        setUser(userData);
      } else {
        setFirebaseUser(null);
        setUser(null);
      }

      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const value: AuthContextType = {
    user,
    firebaseUser,
    loading,
    login,
    register,
    loginWithGoogle,
    logout,
    resetPassword,
    updateUserProfile,
    refreshUser,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}
