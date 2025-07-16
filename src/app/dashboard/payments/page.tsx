'use client';

import React, { useState, useEffect } from 'react';
import { CreditCard, DollarSign, TrendingUp, Calendar, Download, Plus, Eye } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import Button from '@/components/ui/Button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import { PaymentService } from '@/services/paymentService';
import { formatCurrency, formatDate, getErrorMessage } from '@/utils';
import { PaymentStatus } from '@/types';

function PaymentsContent() {
  const { user } = useAuth();
  const [transactions, setTransactions] = useState<any[]>([]);
  const [earnings, setEarnings] = useState<any>(null);
  const [paymentMethods, setPaymentMethods] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState<'all' | 'completed' | 'pending' | 'refunded'>('all');

  useEffect(() => {
    loadPaymentData();
  }, [user, filter]);

  const loadPaymentData = async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      
      // Load transaction history
      const transactionHistory = await PaymentService.getTransactionHistory(user.id, user.role as any);
      setTransactions(transactionHistory);
      
      // Load earnings summary for service providers
      if (user.role === 'service_provider') {
        const earningsSummary = await PaymentService.getEarningsSummary(user.id);
        setEarnings(earningsSummary);
      }
      
      // Load payment methods for customers
      if (user.role === 'customer') {
        const methods = await PaymentService.getPaymentMethods(user.id);
        setPaymentMethods(methods);
      }
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const requestPayout = async () => {
    if (!earnings || earnings.pendingPayouts <= 0) return;
    
    try {
      const result = await PaymentService.requestPayout(user!.id, earnings.pendingPayouts);
      if (result.success) {
        // Refresh data
        loadPaymentData();
      } else {
        setError(result.error || 'Payout request failed');
      }
    } catch (err) {
      setError(getErrorMessage(err));
    }
  };

  const getStatusColor = (status: PaymentStatus) => {
    const statusInfo = PaymentService.getPaymentStatusInfo(status);
    switch (statusInfo.color) {
      case 'green':
        return 'bg-green-100 text-green-800';
      case 'yellow':
        return 'bg-yellow-100 text-yellow-800';
      case 'red':
        return 'bg-red-100 text-red-800';
      case 'blue':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const filteredTransactions = transactions.filter(transaction => {
    if (filter === 'all') return true;
    return transaction.status === filter;
  });

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Payments</h1>
            <p className="text-gray-600">
              {user?.role === 'customer' 
                ? 'Manage your payment methods and transaction history' 
                : 'Track your earnings and manage payouts'}
            </p>
          </div>
          {user?.role === 'customer' && (
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add Payment Method
            </Button>
          )}
        </div>

        {/* Service Provider Earnings Overview */}
        {user?.role === 'service_provider' && earnings && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Earnings</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{formatCurrency(earnings.totalEarnings)}</div>
                <p className="text-xs text-muted-foreground">
                  From {earnings.completedBookings} completed bookings
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">This Month</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{formatCurrency(earnings.thisMonth)}</div>
                <p className="text-xs text-muted-foreground">
                  +{Math.round(((earnings.thisMonth - earnings.lastMonth) / earnings.lastMonth) * 100)}% from last month
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Pending Payouts</CardTitle>
                <Calendar className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{formatCurrency(earnings.pendingPayouts)}</div>
                <p className="text-xs text-muted-foreground">
                  Available for withdrawal
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button 
                  size="sm" 
                  className="w-full"
                  onClick={requestPayout}
                  disabled={earnings.pendingPayouts <= 0}
                >
                  Request Payout
                </Button>
                <Button variant="outline" size="sm" className="w-full">
                  <Download className="h-4 w-4 mr-2" />
                  Download Report
                </Button>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Customer Payment Methods */}
        {user?.role === 'customer' && (
          <Card>
            <CardHeader>
              <CardTitle>Payment Methods</CardTitle>
              <CardDescription>Manage your saved payment methods</CardDescription>
            </CardHeader>
            <CardContent>
              {paymentMethods.length === 0 ? (
                <div className="text-center py-8">
                  <CreditCard className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No payment methods</h3>
                  <p className="text-gray-600 mb-4">Add a payment method to make bookings easier</p>
                  <Button>Add Payment Method</Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {paymentMethods.map((method) => (
                    <div key={method.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center space-x-3">
                        <CreditCard className="h-6 w-6 text-gray-400" />
                        <div>
                          <p className="font-medium">**** **** **** {method.last4}</p>
                          <p className="text-sm text-gray-500">{method.brand.toUpperCase()} • Expires {method.exp_month}/{method.exp_year}</p>
                        </div>
                      </div>
                      <div className="flex space-x-2">
                        <Button variant="outline" size="sm">Edit</Button>
                        <Button variant="destructive" size="sm">Remove</Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Transaction History */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Transaction History</CardTitle>
                <CardDescription>
                  {user?.role === 'customer' 
                    ? 'Your payment history for services' 
                    : 'Your earnings from completed services'}
                </CardDescription>
              </div>
              <Button variant="outline" size="sm">
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {/* Filter Tabs */}
            <div className="border-b border-gray-200 mb-6">
              <nav className="-mb-px flex space-x-8">
                {[
                  { key: 'all', label: 'All' },
                  { key: 'completed', label: 'Completed' },
                  { key: 'pending', label: 'Pending' },
                  { key: 'refunded', label: 'Refunded' },
                ].map((tab) => (
                  <button
                    key={tab.key}
                    onClick={() => setFilter(tab.key as any)}
                    className={`py-2 px-1 border-b-2 font-medium text-sm ${
                      filter === tab.key
                        ? 'border-primary text-primary'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </nav>
            </div>

            {loading ? (
              <div className="space-y-4">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="animate-pulse flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex-1 space-y-2">
                      <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                      <div className="h-3 bg-gray-200 rounded w-1/3"></div>
                    </div>
                    <div className="h-6 bg-gray-200 rounded w-20"></div>
                  </div>
                ))}
              </div>
            ) : filteredTransactions.length === 0 ? (
              <div className="text-center py-8">
                <DollarSign className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No transactions found</h3>
                <p className="text-gray-600">
                  {filter === 'all' 
                    ? "You haven't made any transactions yet" 
                    : `No ${filter} transactions found`}
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredTransactions.map((transaction) => (
                  <div key={transaction.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50">
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <h4 className="font-medium text-gray-900">{transaction.serviceTitle}</h4>
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(transaction.status)}`}>
                          {PaymentService.getPaymentStatusInfo(transaction.status).label}
                        </span>
                      </div>
                      <div className="flex items-center justify-between mt-1">
                        <p className="text-sm text-gray-500">
                          {formatDate(transaction.createdAt, 'PPP')}
                        </p>
                        <div className="text-right">
                          <p className="font-medium text-gray-900">
                            {formatCurrency(transaction.amount)}
                          </p>
                          {user?.role === 'service_provider' && transaction.commissionAmount && (
                            <p className="text-xs text-gray-500">
                              Commission: {formatCurrency(transaction.commissionAmount)}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                    <Button variant="ghost" size="sm" className="ml-4">
                      <Eye className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {error && (
          <div className="bg-destructive/10 border border-destructive/20 text-destructive px-4 py-3 rounded-md text-sm">
            {error}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}

export default function PaymentsPage() {
  return (
    <ProtectedRoute allowedRoles={['customer', 'service_provider']}>
      <PaymentsContent />
    </ProtectedRoute>
  );
}
