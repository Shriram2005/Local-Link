import { loadStripe, Stripe } from '@stripe/stripe-js';
import { doc, updateDoc, getDoc, addDoc, collection, Timestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { PaymentIntent, PaymentMethod, PaymentStatus } from '@/types';

// Initialize Stripe
let stripePromise: Promise<Stripe | null>;
const getStripe = () => {
  if (!stripePromise) {
    stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || '');
  }
  return stripePromise;
};

export class PaymentService {
  // Create payment intent for booking
  static async createPaymentIntent(
    bookingId: string,
    amount: number,
    currency: string = 'usd',
    customerId?: string
  ): Promise<{ clientSecret: string; paymentIntentId: string }> {
    try {
      const response = await fetch('/api/payments/create-intent', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          bookingId,
          amount: Math.round(amount * 100), // Convert to cents
          currency,
          customerId,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to create payment intent');
      }

      const data = await response.json();
      return {
        clientSecret: data.clientSecret,
        paymentIntentId: data.paymentIntentId,
      };
    } catch (error) {
      console.error('Error creating payment intent:', error);
      throw error;
    }
  }

  // Confirm payment
  static async confirmPayment(
    clientSecret: string,
    paymentMethodId?: string,
    savePaymentMethod: boolean = false
  ): Promise<{ success: boolean; error?: string }> {
    try {
      const stripe = await getStripe();
      if (!stripe) {
        throw new Error('Stripe not initialized');
      }

      const { error, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
        payment_method: paymentMethodId,
        setup_future_usage: savePaymentMethod ? 'on_session' : undefined,
      });

      if (error) {
        return { success: false, error: error.message };
      }

      if (paymentIntent?.status === 'succeeded') {
        return { success: true };
      }

      return { success: false, error: 'Payment failed' };
    } catch (error) {
      console.error('Error confirming payment:', error);
      return { success: false, error: 'Payment confirmation failed' };
    }
  }

  // Create setup intent for saving payment method
  static async createSetupIntent(customerId: string): Promise<{ clientSecret: string }> {
    try {
      const response = await fetch('/api/payments/create-setup-intent', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ customerId }),
      });

      if (!response.ok) {
        throw new Error('Failed to create setup intent');
      }

      const data = await response.json();
      return { clientSecret: data.clientSecret };
    } catch (error) {
      console.error('Error creating setup intent:', error);
      throw error;
    }
  }

  // Get saved payment methods
  static async getPaymentMethods(customerId: string): Promise<PaymentMethod[]> {
    try {
      const response = await fetch(`/api/payments/payment-methods?customerId=${customerId}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch payment methods');
      }

      const data = await response.json();
      return data.paymentMethods;
    } catch (error) {
      console.error('Error fetching payment methods:', error);
      return [];
    }
  }

  // Delete payment method
  static async deletePaymentMethod(paymentMethodId: string): Promise<boolean> {
    try {
      const response = await fetch('/api/payments/delete-payment-method', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ paymentMethodId }),
      });

      return response.ok;
    } catch (error) {
      console.error('Error deleting payment method:', error);
      return false;
    }
  }

  // Process refund
  static async processRefund(
    paymentIntentId: string,
    amount?: number,
    reason?: string
  ): Promise<{ success: boolean; refundId?: string; error?: string }> {
    try {
      const response = await fetch('/api/payments/refund', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          paymentIntentId,
          amount: amount ? Math.round(amount * 100) : undefined,
          reason,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to process refund');
      }

      const data = await response.json();
      return {
        success: true,
        refundId: data.refundId,
      };
    } catch (error) {
      console.error('Error processing refund:', error);
      return { success: false, error: 'Refund failed' };
    }
  }

  // Update booking payment status
  static async updateBookingPaymentStatus(
    bookingId: string,
    status: PaymentStatus,
    paymentIntentId?: string,
    transactionId?: string
  ): Promise<void> {
    if (!db) throw new Error('Database not initialized');

    const bookingRef = doc(db, 'bookings', bookingId);
    const updateData: any = {
      paymentStatus: status,
      updatedAt: Timestamp.now(),
    };

    if (paymentIntentId) {
      updateData.paymentIntentId = paymentIntentId;
    }

    if (transactionId) {
      updateData.transactionId = transactionId;
    }

    await updateDoc(bookingRef, updateData);
  }

  // Record payment transaction
  static async recordTransaction(transactionData: {
    bookingId: string;
    customerId: string;
    providerId: string;
    amount: number;
    commissionAmount: number;
    paymentIntentId: string;
    status: PaymentStatus;
    paymentMethodId?: string;
  }): Promise<string> {
    if (!db) throw new Error('Database not initialized');

    const docRef = await addDoc(collection(db, 'transactions'), {
      ...transactionData,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    });

    return docRef.id;
  }

  // Calculate platform commission
  static calculateCommission(amount: number, commissionRate: number = 0.05): number {
    return Math.round(amount * commissionRate * 100) / 100;
  }

  // Get transaction history
  static async getTransactionHistory(userId: string, userRole: 'customer' | 'service_provider'): Promise<any[]> {
    // This would typically query the transactions collection
    // For demo purposes, return mock data
    return [
      {
        id: '1',
        bookingId: 'booking1',
        amount: 150,
        commissionAmount: 7.5,
        status: 'completed',
        createdAt: new Date(Date.now() - 86400000),
        serviceTitle: 'House Cleaning',
      },
      {
        id: '2',
        bookingId: 'booking2',
        amount: 95,
        commissionAmount: 4.75,
        status: 'completed',
        createdAt: new Date(Date.now() - 172800000),
        serviceTitle: 'Plumbing Repair',
      },
    ];
  }

  // Get earnings summary for service providers
  static async getEarningsSummary(providerId: string): Promise<{
    totalEarnings: number;
    thisMonth: number;
    lastMonth: number;
    pendingPayouts: number;
    completedBookings: number;
  }> {
    // This would typically aggregate transaction data
    // For demo purposes, return mock data
    return {
      totalEarnings: 2450.75,
      thisMonth: 680.25,
      lastMonth: 520.50,
      pendingPayouts: 125.00,
      completedBookings: 18,
    };
  }

  // Request payout for service providers
  static async requestPayout(providerId: string, amount: number): Promise<{ success: boolean; payoutId?: string; error?: string }> {
    try {
      const response = await fetch('/api/payments/request-payout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          providerId,
          amount: Math.round(amount * 100),
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to request payout');
      }

      const data = await response.json();
      return {
        success: true,
        payoutId: data.payoutId,
      };
    } catch (error) {
      console.error('Error requesting payout:', error);
      return { success: false, error: 'Payout request failed' };
    }
  }

  // Validate payment amount
  static validatePaymentAmount(amount: number): { isValid: boolean; error?: string } {
    if (amount <= 0) {
      return { isValid: false, error: 'Amount must be greater than 0' };
    }

    if (amount < 0.50) {
      return { isValid: false, error: 'Minimum payment amount is $0.50' };
    }

    if (amount > 999999.99) {
      return { isValid: false, error: 'Maximum payment amount is $999,999.99' };
    }

    return { isValid: true };
  }

  // Format payment amount for display
  static formatAmount(amount: number, currency: string = 'USD'): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency,
    }).format(amount);
  }

  // Get payment status display info
  static getPaymentStatusInfo(status: PaymentStatus): { label: string; color: string; description: string } {
    switch (status) {
      case 'pending':
        return {
          label: 'Pending',
          color: 'yellow',
          description: 'Payment is being processed',
        };
      case 'paid':
        return {
          label: 'Paid',
          color: 'green',
          description: 'Payment completed successfully',
        };
      case 'failed':
        return {
          label: 'Failed',
          color: 'red',
          description: 'Payment failed to process',
        };
      case 'refunded':
        return {
          label: 'Refunded',
          color: 'blue',
          description: 'Payment has been refunded',
        };
      case 'cancelled':
        return {
          label: 'Cancelled',
          color: 'gray',
          description: 'Payment was cancelled',
        };
      default:
        return {
          label: 'Unknown',
          color: 'gray',
          description: 'Unknown payment status',
        };
    }
  }
}
