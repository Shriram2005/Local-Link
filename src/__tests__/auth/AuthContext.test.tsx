import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { AuthProvider, useAuth } from '@/contexts/AuthContext';

// Mock Firebase
jest.mock('@/lib/firebase', () => ({
  auth: {
    onAuthStateChanged: jest.fn(),
    signInWithEmailAndPassword: jest.fn(),
    createUserWithEmailAndPassword: jest.fn(),
    signOut: jest.fn(),
    sendPasswordResetEmail: jest.fn(),
  },
  db: {},
}));

// Mock UserService
jest.mock('@/services/userService', () => ({
  UserService: {
    getUserProfile: jest.fn(),
    createUserProfile: jest.fn(),
  },
}));

// Test component that uses the auth context
function TestComponent() {
  const { user, loading, login, logout, register } = useAuth();
  
  if (loading) return <div>Loading...</div>;
  
  return (
    <div>
      <div data-testid="user-status">
        {user ? `Logged in as ${user.email}` : 'Not logged in'}
      </div>
      <button onClick={() => login('test@example.com', 'password')}>
        Login
      </button>
      <button onClick={() => register('test@example.com', 'password', 'Test User', 'customer')}>
        Register
      </button>
      <button onClick={logout}>Logout</button>
    </div>
  );
}

describe('AuthContext', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('provides authentication context', () => {
    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    expect(screen.getByTestId('user-status')).toHaveTextContent('Not logged in');
    expect(screen.getByText('Login')).toBeInTheDocument();
    expect(screen.getByText('Register')).toBeInTheDocument();
    expect(screen.getByText('Logout')).toBeInTheDocument();
  });

  it('shows loading state initially', () => {
    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    expect(screen.getByText('Loading...')).toBeInTheDocument();
  });

  it('handles user authentication state changes', async () => {
    const mockUser = {
      uid: 'test-uid',
      email: 'test@example.com',
      displayName: 'Test User',
    };

    const { auth } = require('@/lib/firebase');
    auth.onAuthStateChanged.mockImplementation((callback: any) => {
      callback(mockUser);
      return () => {}; // unsubscribe function
    });

    const { UserService } = require('@/services/userService');
    UserService.getUserProfile.mockResolvedValue({
      id: 'test-uid',
      email: 'test@example.com',
      displayName: 'Test User',
      role: 'customer',
    });

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId('user-status')).toHaveTextContent('Logged in as test@example.com');
    });
  });

  it('handles login functionality', async () => {
    const { auth } = require('@/lib/firebase');
    auth.signInWithEmailAndPassword.mockResolvedValue({
      user: {
        uid: 'test-uid',
        email: 'test@example.com',
      },
    });

    const { UserService } = require('@/services/userService');
    UserService.getUserProfile.mockResolvedValue({
      id: 'test-uid',
      email: 'test@example.com',
      role: 'customer',
    });

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    // Wait for initial loading to complete
    await waitFor(() => {
      expect(screen.queryByText('Loading...')).not.toBeInTheDocument();
    });

    // Test login functionality would be implemented here
    // This is a simplified version for demonstration
  });

  it('handles registration functionality', async () => {
    const { auth } = require('@/lib/firebase');
    auth.createUserWithEmailAndPassword.mockResolvedValue({
      user: {
        uid: 'new-user-uid',
        email: 'newuser@example.com',
      },
    });

    const { UserService } = require('@/services/userService');
    UserService.createUserProfile.mockResolvedValue({
      id: 'new-user-uid',
      email: 'newuser@example.com',
      role: 'customer',
    });

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    // Test registration functionality would be implemented here
  });

  it('handles logout functionality', async () => {
    const { auth } = require('@/lib/firebase');
    auth.signOut.mockResolvedValue(undefined);

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    // Test logout functionality would be implemented here
  });

  it('handles authentication errors', async () => {
    const { auth } = require('@/lib/firebase');
    auth.signInWithEmailAndPassword.mockRejectedValue(new Error('Invalid credentials'));

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    // Test error handling would be implemented here
  });
});

describe('useAuth Hook', () => {
  it('throws error when used outside AuthProvider', () => {
    // Suppress console.error for this test
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

    expect(() => {
      render(<TestComponent />);
    }).toThrow('useAuth must be used within an AuthProvider');

    consoleSpy.mockRestore();
  });

  it('provides correct context values', () => {
    let contextValue: any;

    function TestHook() {
      contextValue = useAuth();
      return null;
    }

    render(
      <AuthProvider>
        <TestHook />
      </AuthProvider>
    );

    expect(contextValue).toHaveProperty('user');
    expect(contextValue).toHaveProperty('loading');
    expect(contextValue).toHaveProperty('login');
    expect(contextValue).toHaveProperty('logout');
    expect(contextValue).toHaveProperty('register');
    expect(typeof contextValue.login).toBe('function');
    expect(typeof contextValue.logout).toBe('function');
    expect(typeof contextValue.register).toBe('function');
  });
});
