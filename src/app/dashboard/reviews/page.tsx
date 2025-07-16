'use client';

import React, { useState, useEffect } from 'react';
import { Star, MessageSquare, Calendar, User, Flag, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import Button from '@/components/ui/Button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import { StarDisplay, RatingBreakdown } from '@/components/ui/StarRating';
import ReviewForm from '@/components/ui/ReviewForm';
import { ReviewService } from '@/services/reviewService';
import { formatDate, formatRelativeTime, getErrorMessage } from '@/utils';
import { Review, ReviewStatus } from '@/types';

function ReviewsContent() {
  const { user } = useAuth();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState<'all' | 'pending' | 'approved' | 'flagged'>('all');
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [stats, setStats] = useState<any>(null);

  useEffect(() => {
    loadReviews();
    loadStats();
  }, [user, filter]);

  const loadReviews = async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      
      // Mock reviews data for demo
      const mockReviews: Review[] = [
        {
          id: '1',
          bookingId: 'booking1',
          customerId: user.role === 'customer' ? user.id : 'customer1',
          providerId: user.role === 'service_provider' ? user.id : 'provider1',
          rating: 5,
          comment: 'Excellent service! Very professional and thorough cleaning. Would definitely book again.',
          images: [],
          status: 'approved',
          createdAt: { toDate: () => new Date(Date.now() - 86400000) } as any,
          updatedAt: { toDate: () => new Date(Date.now() - 86400000) } as any,
        },
        {
          id: '2',
          bookingId: 'booking2',
          customerId: user.role === 'customer' ? user.id : 'customer2',
          providerId: user.role === 'service_provider' ? user.id : 'provider2',
          rating: 4,
          comment: 'Good service overall. Arrived on time and did a good job. Minor issues with communication.',
          images: [],
          status: 'approved',
          createdAt: { toDate: () => new Date(Date.now() - 172800000) } as any,
          updatedAt: { toDate: () => new Date(Date.now() - 172800000) } as any,
        },
        {
          id: '3',
          bookingId: 'booking3',
          customerId: user.role === 'customer' ? user.id : 'customer3',
          providerId: user.role === 'service_provider' ? user.id : 'provider3',
          rating: 3,
          comment: 'Service was okay but could be better. Some areas were missed during cleaning.',
          images: [],
          status: 'pending',
          createdAt: { toDate: () => new Date(Date.now() - 3600000) } as any,
          updatedAt: { toDate: () => new Date(Date.now() - 3600000) } as any,
        },
      ];
      
      let filteredReviews = mockReviews;
      
      if (filter !== 'all') {
        filteredReviews = mockReviews.filter(review => review.status === filter);
      }
      
      setReviews(filteredReviews);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    if (!user) return;
    
    try {
      // Mock stats for demo
      const mockStats = {
        total: 15,
        approved: 12,
        pending: 2,
        rejected: 1,
        averageRating: 4.3,
        ratingDistribution: {
          5: 6,
          4: 4,
          3: 2,
          2: 0,
          1: 0,
        },
      };
      
      setStats(mockStats);
    } catch (err) {
      console.error('Error loading stats:', err);
    }
  };

  const updateReviewStatus = async (reviewId: string, status: ReviewStatus) => {
    try {
      // Mock update - in real app would call ReviewService.updateReviewStatus
      setReviews(prev => prev.map(review => 
        review.id === reviewId 
          ? { ...review, status, updatedAt: { toDate: () => new Date() } as any }
          : review
      ));
    } catch (err) {
      setError(getErrorMessage(err));
    }
  };

  const getStatusColor = (status: ReviewStatus) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'approved':
        return 'bg-green-100 text-green-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      case 'flagged':
        return 'bg-orange-100 text-orange-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // Mock user data
  const mockUsers: Record<string, any> = {
    customer1: { displayName: 'Sarah Johnson', photoURL: null },
    customer2: { displayName: 'Mike Wilson', photoURL: null },
    customer3: { displayName: 'Emily Davis', photoURL: null },
    provider1: { displayName: 'John Smith', businessName: 'CleanPro Services' },
    provider2: { displayName: 'David Brown', businessName: 'Expert Plumbing' },
    provider3: { displayName: 'Lisa Garcia', businessName: 'FitLife Training' },
  };

  const mockServices: Record<string, any> = {
    booking1: { title: 'Professional House Cleaning' },
    booking2: { title: 'Plumbing Repair' },
    booking3: { title: 'Personal Training Session' },
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Reviews</h1>
            <p className="text-gray-600">
              {user?.role === 'customer' 
                ? 'Reviews you\'ve written for service providers' 
                : 'Reviews from your customers'}
            </p>
          </div>
          {user?.role === 'customer' && (
            <Button onClick={() => setShowReviewForm(true)}>
              Write Review
            </Button>
          )}
        </div>

        {/* Stats Overview */}
        {stats && user?.role === 'service_provider' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Reviews</CardTitle>
                <MessageSquare className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.total}</div>
                <p className="text-xs text-muted-foreground">
                  {stats.approved} approved
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Average Rating</CardTitle>
                <Star className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.averageRating}</div>
                <StarDisplay rating={stats.averageRating} size="sm" />
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Pending Reviews</CardTitle>
                <Eye className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.pending}</div>
                <p className="text-xs text-muted-foreground">
                  Awaiting moderation
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">This Month</CardTitle>
                <Calendar className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">8</div>
                <p className="text-xs text-muted-foreground">
                  +2 from last month
                </p>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Rating Breakdown */}
        {stats && user?.role === 'service_provider' && (
          <Card>
            <CardHeader>
              <CardTitle>Rating Breakdown</CardTitle>
              <CardDescription>Distribution of your ratings</CardDescription>
            </CardHeader>
            <CardContent>
              <RatingBreakdown
                ratings={stats.ratingDistribution}
                totalReviews={stats.approved}
              />
            </CardContent>
          </Card>
        )}

        {/* Filter Tabs */}
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            {[
              { key: 'all', label: 'All Reviews' },
              { key: 'approved', label: 'Approved' },
              { key: 'pending', label: 'Pending' },
              { key: 'flagged', label: 'Flagged' },
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

        {error && (
          <div className="bg-destructive/10 border border-destructive/20 text-destructive px-4 py-3 rounded-md text-sm">
            {error}
          </div>
        )}

        {/* Reviews List */}
        {loading ? (
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <Card key={i} className="animate-pulse">
                <CardHeader>
                  <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/3"></div>
                </CardHeader>
                <CardContent>
                  <div className="h-20 bg-gray-200 rounded"></div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : reviews.length === 0 ? (
          <Card>
            <CardContent className="text-center py-12">
              <MessageSquare className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No reviews found</h3>
              <p className="text-gray-600">
                {filter === 'all' 
                  ? "No reviews yet" 
                  : `No ${filter} reviews found`}
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {reviews.map((review) => {
              const otherUser = user?.role === 'customer' 
                ? mockUsers[review.providerId] 
                : mockUsers[review.customerId];
              const service = mockServices[review.bookingId];
              
              return (
                <Card key={review.id}>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center">
                            <span className="text-sm font-medium text-white">
                              {otherUser?.displayName?.charAt(0).toUpperCase()}
                            </span>
                          </div>
                          <div>
                            <CardTitle className="text-lg">
                              {otherUser?.businessName || otherUser?.displayName}
                            </CardTitle>
                            <CardDescription>
                              {service?.title} • {formatRelativeTime(review.createdAt.toDate())}
                            </CardDescription>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(review.status)}`}>
                          {review.status}
                        </span>
                        {user?.role === 'admin' && review.status === 'pending' && (
                          <div className="flex space-x-1">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => updateReviewStatus(review.id, 'approved')}
                            >
                              Approve
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => updateReviewStatus(review.id, 'rejected')}
                            >
                              Reject
                            </Button>
                          </div>
                        )}
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <StarDisplay rating={review.rating} />
                      
                      <p className="text-gray-700">{review.comment}</p>
                      
                      {review.images && review.images.length > 0 && (
                        <div className="grid grid-cols-3 gap-2">
                          {review.images.map((image, index) => (
                            <img
                              key={index}
                              src={image}
                              alt={`Review image ${index + 1}`}
                              className="w-full h-20 object-cover rounded-lg"
                            />
                          ))}
                        </div>
                      )}
                      
                      <div className="flex items-center justify-between text-sm text-gray-500">
                        <span>{formatDate(review.createdAt.toDate(), 'PPP')}</span>
                        {user?.role !== 'customer' && (
                          <Button variant="ghost" size="sm">
                            <Flag className="h-4 w-4 mr-2" />
                            Report
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}

        {/* Review Form Modal */}
        {showReviewForm && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <ReviewForm
                bookingId="demo-booking"
                providerId="demo-provider"
                customerId={user?.id || 'demo-customer'}
                onSubmit={() => {
                  setShowReviewForm(false);
                  loadReviews();
                }}
                onCancel={() => setShowReviewForm(false)}
              />
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}

export default function ReviewsPage() {
  return (
    <ProtectedRoute allowedRoles={['customer', 'service_provider', 'admin']}>
      <ReviewsContent />
    </ProtectedRoute>
  );
}
