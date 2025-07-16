'use client';

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { Camera, X } from 'lucide-react';
import Button from './Button';
import StarRating from './StarRating';
import ImageUpload from './ImageUpload';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './Card';
import { ReviewService } from '@/services/reviewService';
import { getErrorMessage } from '@/utils';

const reviewSchema = yup.object({
  rating: yup.number().min(1, 'Please select a rating').max(5).required('Rating is required'),
  comment: yup.string().min(10, 'Comment must be at least 10 characters').required('Comment is required'),
});

type ReviewFormData = yup.InferType<typeof reviewSchema>;

interface ReviewFormProps {
  bookingId: string;
  providerId: string;
  customerId: string;
  onSubmit?: (reviewId: string) => void;
  onCancel?: () => void;
}

export default function ReviewForm({
  bookingId,
  providerId,
  customerId,
  onSubmit,
  onCancel,
}: ReviewFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [images, setImages] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<ReviewFormData>({
    resolver: yupResolver(reviewSchema),
    defaultValues: {
      rating: 0,
      comment: '',
    },
  });

  const rating = watch('rating');

  const handleRatingChange = (newRating: number) => {
    setValue('rating', newRating);
  };

  const handleImageUpload = (file: File | null, previewUrl: string | null) => {
    if (file && previewUrl) {
      setImages(prev => [...prev, file]);
      setImagePreviews(prev => [...prev, previewUrl]);
    }
  };

  const removeImage = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index));
    setImagePreviews(prev => prev.filter((_, i) => i !== index));
  };

  const onFormSubmit = async (data: ReviewFormData) => {
    try {
      setIsLoading(true);
      setError('');

      // In a real app, would upload images first and get URLs
      const imageUrls: string[] = []; // Would be populated with uploaded image URLs

      const reviewData = {
        bookingId,
        customerId,
        providerId,
        rating: data.rating,
        comment: data.comment,
        images: imageUrls,
      };

      // For demo purposes, we'll simulate the review creation
      console.log('Creating review:', reviewData);
      
      // In real app: const reviewId = await ReviewService.createReview(reviewData);
      const reviewId = 'mock-review-id';
      
      if (onSubmit) {
        onSubmit(reviewId);
      }
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Write a Review</CardTitle>
        <CardDescription>
          Share your experience to help other customers
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-6">
          {error && (
            <div className="bg-destructive/10 border border-destructive/20 text-destructive px-4 py-3 rounded-md text-sm">
              {error}
            </div>
          )}

          {/* Rating */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-3">
              Overall Rating *
            </label>
            <div className="flex items-center space-x-4">
              <StarRating
                rating={rating}
                onRatingChange={handleRatingChange}
                size="lg"
              />
              {rating > 0 && (
                <span className="text-sm text-gray-600">
                  {rating === 1 && 'Poor'}
                  {rating === 2 && 'Fair'}
                  {rating === 3 && 'Good'}
                  {rating === 4 && 'Very Good'}
                  {rating === 5 && 'Excellent'}
                </span>
              )}
            </div>
            {errors.rating && (
              <p className="text-sm text-destructive mt-1">{errors.rating.message}</p>
            )}
          </div>

          {/* Comment */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Your Review *
            </label>
            <textarea
              {...register('comment')}
              rows={4}
              className="w-full px-3 py-2 border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-ring resize-none"
              placeholder="Tell others about your experience with this service provider..."
            />
            {errors.comment && (
              <p className="text-sm text-destructive mt-1">{errors.comment.message}</p>
            )}
          </div>

          {/* Images */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-3">
              Add Photos (Optional)
            </label>
            <div className="grid grid-cols-3 md:grid-cols-5 gap-4">
              {imagePreviews.map((preview, index) => (
                <div key={index} className="relative">
                  <img
                    src={preview}
                    alt={`Review image ${index + 1}`}
                    className="w-full h-20 object-cover rounded-lg"
                  />
                  <button
                    type="button"
                    onClick={() => removeImage(index)}
                    className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              ))}
              
              {imagePreviews.length < 5 && (
                <div className="border-2 border-dashed border-gray-300 rounded-lg h-20 flex items-center justify-center">
                  <ImageUpload
                    onImageChange={handleImageUpload}
                    size="sm"
                    shape="square"
                  />
                </div>
              )}
            </div>
            <p className="text-xs text-gray-500 mt-2">
              You can add up to 5 photos to your review
            </p>
          </div>

          {/* Guidelines */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h4 className="font-medium text-blue-900 mb-2">Review Guidelines</h4>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• Be honest and fair in your review</li>
              <li>• Focus on your experience with the service</li>
              <li>• Avoid personal attacks or inappropriate language</li>
              <li>• Include specific details that might help others</li>
            </ul>
          </div>

          {/* Actions */}
          <div className="flex justify-end space-x-4">
            {onCancel && (
              <Button type="button" variant="outline" onClick={onCancel}>
                Cancel
              </Button>
            )}
            <Button type="submit" loading={isLoading} disabled={isLoading || rating === 0}>
              Submit Review
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}

interface QuickReviewProps {
  bookingId: string;
  providerId: string;
  customerId: string;
  onSubmit?: (reviewId: string) => void;
  className?: string;
}

export function QuickReview({
  bookingId,
  providerId,
  customerId,
  onSubmit,
  className,
}: QuickReviewProps) {
  const [rating, setRating] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  const handleQuickReview = async () => {
    if (rating === 0) return;

    try {
      setIsLoading(true);
      
      const reviewData = {
        bookingId,
        customerId,
        providerId,
        rating,
        comment: `${rating} star rating`, // Minimal comment for quick review
        images: [],
      };

      // For demo purposes
      console.log('Creating quick review:', reviewData);
      const reviewId = 'mock-quick-review-id';
      
      if (onSubmit) {
        onSubmit(reviewId);
      }
    } catch (err) {
      console.error('Quick review error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={className}>
      <div className="flex items-center space-x-4">
        <span className="text-sm font-medium">Quick rating:</span>
        <StarRating
          rating={rating}
          onRatingChange={setRating}
          size="md"
        />
        <Button
          size="sm"
          onClick={handleQuickReview}
          disabled={rating === 0 || isLoading}
          loading={isLoading}
        >
          Submit
        </Button>
      </div>
    </div>
  );
}
