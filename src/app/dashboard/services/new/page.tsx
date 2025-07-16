'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { ArrowLeft, DollarSign, Clock, MapPin, Tag, Upload } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import ImageUpload from '@/components/ui/ImageUpload';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import { SERVICE_CATEGORIES, PRICING_UNITS } from '@/constants';
import { ServiceService } from '@/services/serviceService';
import { getErrorMessage } from '@/utils';
import { ServiceCategory, ServiceLocation } from '@/types';
import Link from 'next/link';

const serviceSchema = yup.object({
  title: yup.string().required('Service title is required'),
  description: yup.string().required('Service description is required'),
  category: yup.string().required('Category is required'),
  subcategory: yup.string().required('Subcategory is required'),
  basePrice: yup.number().min(0, 'Price must be positive').required('Price is required'),
  unit: yup.string().required('Pricing unit is required'),
  duration: yup.number().min(15, 'Duration must be at least 15 minutes').required('Duration is required'),
  location: yup.string().required('Service location is required'),
  tags: yup.string().optional(),
});

type ServiceFormData = yup.InferType<typeof serviceSchema>;

function NewServiceContent() {
  const { user } = useAuth();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [images, setImages] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<ServiceFormData>({
    resolver: yupResolver(serviceSchema),
    defaultValues: {
      category: 'home_services',
      location: 'at_customer',
      unit: 'hour',
      duration: 60,
    },
  });

  const selectedCategory = watch('category') as ServiceCategory;
  const subcategories = SERVICE_CATEGORIES[selectedCategory]?.subcategories || [];

  const onSubmit = async (data: ServiceFormData) => {
    if (!user) return;

    try {
      setIsLoading(true);
      setError('');

      // In a real app, this would create the service and upload images
      console.log('Creating service:', {
        ...data,
        providerId: user.id,
        images: imagePreviews,
        tags: data.tags ? data.tags.split(',').map(tag => tag.trim()) : [],
        pricing: {
          serviceType: data.title,
          basePrice: data.basePrice,
          unit: data.unit,
          description: `${data.title} - ${data.unit} rate`,
        },
      });

      // Mock success - in real app would call ServiceService.createService
      router.push('/dashboard/services');
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setIsLoading(false);
    }
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

  if (user?.role !== 'service_provider') {
    return (
      <DashboardLayout>
        <div className="text-center py-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Access Denied</h2>
          <p className="text-gray-600">This page is only available for service providers.</p>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center space-x-4">
          <Link href="/dashboard/services">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Services
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Create New Service</h1>
            <p className="text-gray-600">Add a new service to your offerings</p>
          </div>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {error && (
            <div className="bg-destructive/10 border border-destructive/20 text-destructive px-4 py-3 rounded-md text-sm">
              {error}
            </div>
          )}

          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle>Basic Information</CardTitle>
              <CardDescription>Provide the essential details about your service</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <Input
                {...register('title')}
                label="Service Title"
                placeholder="e.g., Professional House Cleaning"
                error={errors.title?.message}
              />

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Service Description
                </label>
                <textarea
                  {...register('description')}
                  rows={4}
                  className="w-full px-3 py-2 border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-ring"
                  placeholder="Describe your service in detail..."
                />
                {errors.description && (
                  <p className="text-sm text-destructive mt-1">{errors.description.message}</p>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Category
                  </label>
                  <select
                    {...register('category')}
                    className="w-full px-3 py-2 border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-ring"
                  >
                    {Object.entries(SERVICE_CATEGORIES).map(([key, category]) => (
                      <option key={key} value={key}>
                        {category.label}
                      </option>
                    ))}
                  </select>
                  {errors.category && (
                    <p className="text-sm text-destructive mt-1">{errors.category.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Subcategory
                  </label>
                  <select
                    {...register('subcategory')}
                    className="w-full px-3 py-2 border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-ring"
                  >
                    <option value="">Select a subcategory</option>
                    {subcategories.map((subcategory) => (
                      <option key={subcategory} value={subcategory}>
                        {subcategory}
                      </option>
                    ))}
                  </select>
                  {errors.subcategory && (
                    <p className="text-sm text-destructive mt-1">{errors.subcategory.message}</p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Pricing & Duration */}
          <Card>
            <CardHeader>
              <CardTitle>Pricing & Duration</CardTitle>
              <CardDescription>Set your rates and service duration</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Input
                  {...register('basePrice')}
                  type="number"
                  step="0.01"
                  label="Base Price"
                  placeholder="0.00"
                  leftIcon={<DollarSign className="h-5 w-5" />}
                  error={errors.basePrice?.message}
                />

                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Pricing Unit
                  </label>
                  <select
                    {...register('unit')}
                    className="w-full px-3 py-2 border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-ring"
                  >
                    {PRICING_UNITS.map((unit) => (
                      <option key={unit.value} value={unit.value}>
                        {unit.label}
                      </option>
                    ))}
                  </select>
                  {errors.unit && (
                    <p className="text-sm text-destructive mt-1">{errors.unit.message}</p>
                  )}
                </div>

                <Input
                  {...register('duration')}
                  type="number"
                  label="Duration (minutes)"
                  placeholder="60"
                  leftIcon={<Clock className="h-5 w-5" />}
                  error={errors.duration?.message}
                />
              </div>
            </CardContent>
          </Card>

          {/* Service Location */}
          <Card>
            <CardHeader>
              <CardTitle>Service Location</CardTitle>
              <CardDescription>Where do you provide this service?</CardDescription>
            </CardHeader>
            <CardContent>
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Location Type
                </label>
                <select
                  {...register('location')}
                  className="w-full px-3 py-2 border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-ring"
                >
                  <option value="at_customer">At Customer's Location</option>
                  <option value="at_provider">At My Location</option>
                  <option value="remote">Remote/Online</option>
                  <option value="flexible">Flexible</option>
                </select>
                {errors.location && (
                  <p className="text-sm text-destructive mt-1">{errors.location.message}</p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Images */}
          <Card>
            <CardHeader>
              <CardTitle>Service Images</CardTitle>
              <CardDescription>Add photos to showcase your service</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {imagePreviews.map((preview, index) => (
                  <div key={index} className="relative">
                    <img
                      src={preview}
                      alt={`Service image ${index + 1}`}
                      className="w-full h-32 object-cover rounded-lg"
                    />
                    <button
                      type="button"
                      onClick={() => removeImage(index)}
                      className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                    >
                      ×
                    </button>
                  </div>
                ))}
                
                {imagePreviews.length < 5 && (
                  <div className="border-2 border-dashed border-gray-300 rounded-lg h-32 flex items-center justify-center">
                    <ImageUpload
                      onImageChange={handleImageUpload}
                      size="sm"
                      shape="square"
                    />
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Tags */}
          <Card>
            <CardHeader>
              <CardTitle>Tags</CardTitle>
              <CardDescription>Add tags to help customers find your service</CardDescription>
            </CardHeader>
            <CardContent>
              <Input
                {...register('tags')}
                label="Tags (comma-separated)"
                placeholder="e.g., professional, eco-friendly, experienced"
                leftIcon={<Tag className="h-5 w-5" />}
                helperText="Separate tags with commas"
              />
            </CardContent>
          </Card>

          <div className="flex justify-end space-x-4">
            <Link href="/dashboard/services">
              <Button variant="outline">Cancel</Button>
            </Link>
            <Button type="submit" loading={isLoading} disabled={isLoading}>
              Create Service
            </Button>
          </div>
        </form>
      </div>
    </DashboardLayout>
  );
}

export default function NewServicePage() {
  return (
    <ProtectedRoute allowedRoles={['service_provider']}>
      <NewServiceContent />
    </ProtectedRoute>
  );
}
