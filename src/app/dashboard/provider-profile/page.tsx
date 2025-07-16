'use client';

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { Building, MapPin, DollarSign, Clock, Plus, X, Star } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import ImageUpload from '@/components/ui/ImageUpload';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import { SERVICE_CATEGORIES, PRICING_UNITS, DEFAULT_TIME_SLOTS } from '@/constants';
import { UserService } from '@/services/userService';
import { getErrorMessage } from '@/utils';
import { ServiceProvider, PricingInfo, TimeSlot } from '@/types';

const providerSchema = yup.object({
  businessName: yup.string().required('Business name is required'),
  businessDescription: yup.string().required('Business description is required'),
  services: yup.array().of(yup.string()).min(1, 'At least one service is required'),
  serviceAreas: yup.array().of(yup.string()).min(1, 'At least one service area is required'),
});

type ProviderFormData = yup.InferType<typeof providerSchema>;

function ProviderProfileContent() {
  const { user, refreshUser } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [newService, setNewService] = useState('');
  const [newServiceArea, setNewServiceArea] = useState('');
  const [pricing, setPricing] = useState<PricingInfo[]>([]);
  const [availability, setAvailability] = useState(DEFAULT_TIME_SLOTS);

  const serviceProvider = user as ServiceProvider;

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<ProviderFormData>({
    resolver: yupResolver(providerSchema),
    defaultValues: {
      businessName: serviceProvider?.businessName || '',
      businessDescription: serviceProvider?.businessDescription || '',
      services: serviceProvider?.services || [],
      serviceAreas: serviceProvider?.serviceAreas || [],
    },
  });

  const watchedServices = watch('services') || [];
  const watchedServiceAreas = watch('serviceAreas') || [];

  const onSubmit = async (data: ProviderFormData) => {
    try {
      setIsLoading(true);
      setError('');
      setSuccess('');
      
      await UserService.updateServiceProvider(user!.id, {
        businessName: data.businessName,
        businessDescription: data.businessDescription,
        services: data.services,
        serviceAreas: data.serviceAreas,
        pricing,
        availability: {
          schedule: {
            monday: { isAvailable: true, timeSlots: availability },
            tuesday: { isAvailable: true, timeSlots: availability },
            wednesday: { isAvailable: true, timeSlots: availability },
            thursday: { isAvailable: true, timeSlots: availability },
            friday: { isAvailable: true, timeSlots: availability },
            saturday: { isAvailable: true, timeSlots: availability },
            sunday: { isAvailable: false, timeSlots: [] },
          },
          exceptions: [],
          timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        },
      });
      
      await refreshUser();
      setSuccess('Provider profile updated successfully!');
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setIsLoading(false);
    }
  };

  const addService = () => {
    if (newService.trim()) {
      const updatedServices = [...watchedServices, newService.trim()];
      setValue('services', updatedServices);
      setNewService('');
    }
  };

  const removeService = (index: number) => {
    const updatedServices = watchedServices.filter((_, i) => i !== index);
    setValue('services', updatedServices);
  };

  const addServiceArea = () => {
    if (newServiceArea.trim()) {
      const updatedAreas = [...watchedServiceAreas, newServiceArea.trim()];
      setValue('serviceAreas', updatedAreas);
      setNewServiceArea('');
    }
  };

  const removeServiceArea = (index: number) => {
    const updatedAreas = watchedServiceAreas.filter((_, i) => i !== index);
    setValue('serviceAreas', updatedAreas);
  };

  const addPricing = () => {
    setPricing([...pricing, {
      serviceType: '',
      basePrice: 0,
      unit: 'hour',
      description: '',
    }]);
  };

  const updatePricing = (index: number, field: keyof PricingInfo, value: any) => {
    const updatedPricing = [...pricing];
    updatedPricing[index] = { ...updatedPricing[index], [field]: value };
    setPricing(updatedPricing);
  };

  const removePricing = (index: number) => {
    setPricing(pricing.filter((_, i) => i !== index));
  };

  const handlePortfolioUpload = async (file: File | null, previewUrl: string | null) => {
    if (!file || !user) return;

    try {
      setError('');
      await UserService.uploadPortfolioImage(user.id, file, 'Portfolio Image', 'Added from profile');
      await refreshUser();
      setSuccess('Portfolio image added successfully!');
    } catch (err) {
      setError(getErrorMessage(err));
    }
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
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Provider Profile</h1>
          <p className="text-gray-600">Manage your business information and services</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {error && (
            <div className="bg-destructive/10 border border-destructive/20 text-destructive px-4 py-3 rounded-md text-sm">
              {error}
            </div>
          )}

          {success && (
            <div className="bg-green-50 border border-green-200 text-green-800 px-4 py-3 rounded-md text-sm">
              {success}
            </div>
          )}

          {/* Business Information */}
          <Card>
            <CardHeader>
              <CardTitle>Business Information</CardTitle>
              <CardDescription>Tell customers about your business</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <Input
                {...register('businessName')}
                label="Business Name"
                placeholder="Enter your business name"
                leftIcon={<Building className="h-5 w-5" />}
                error={errors.businessName?.message}
              />

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Business Description
                </label>
                <textarea
                  {...register('businessDescription')}
                  rows={4}
                  className="w-full px-3 py-2 border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-ring"
                  placeholder="Describe your business and what makes you unique..."
                />
                {errors.businessDescription && (
                  <p className="text-sm text-destructive mt-1">{errors.businessDescription.message}</p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Services Offered */}
          <Card>
            <CardHeader>
              <CardTitle>Services Offered</CardTitle>
              <CardDescription>List the services you provide</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex space-x-2">
                <Input
                  value={newService}
                  onChange={(e) => setNewService(e.target.value)}
                  placeholder="Add a service..."
                  className="flex-1"
                />
                <Button type="button" onClick={addService}>
                  <Plus className="h-4 w-4" />
                </Button>
              </div>

              <div className="flex flex-wrap gap-2">
                {watchedServices.map((service, index) => (
                  <div
                    key={index}
                    className="flex items-center bg-primary/10 text-primary px-3 py-1 rounded-full text-sm"
                  >
                    {service}
                    <button
                      type="button"
                      onClick={() => removeService(index)}
                      className="ml-2 hover:text-destructive"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                ))}
              </div>
              {errors.services && (
                <p className="text-sm text-destructive">{errors.services.message}</p>
              )}
            </CardContent>
          </Card>

          {/* Service Areas */}
          <Card>
            <CardHeader>
              <CardTitle>Service Areas</CardTitle>
              <CardDescription>Where do you provide your services?</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex space-x-2">
                <Input
                  value={newServiceArea}
                  onChange={(e) => setNewServiceArea(e.target.value)}
                  placeholder="Add a service area..."
                  leftIcon={<MapPin className="h-5 w-5" />}
                  className="flex-1"
                />
                <Button type="button" onClick={addServiceArea}>
                  <Plus className="h-4 w-4" />
                </Button>
              </div>

              <div className="flex flex-wrap gap-2">
                {watchedServiceAreas.map((area, index) => (
                  <div
                    key={index}
                    className="flex items-center bg-secondary/10 text-secondary px-3 py-1 rounded-full text-sm"
                  >
                    {area}
                    <button
                      type="button"
                      onClick={() => removeServiceArea(index)}
                      className="ml-2 hover:text-destructive"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                ))}
              </div>
              {errors.serviceAreas && (
                <p className="text-sm text-destructive">{errors.serviceAreas.message}</p>
              )}
            </CardContent>
          </Card>

          {/* Pricing */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Pricing Information</CardTitle>
                  <CardDescription>Set your service rates</CardDescription>
                </div>
                <Button type="button" onClick={addPricing} variant="outline" size="sm">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Pricing
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {pricing.map((price, index) => (
                <div key={index} className="border rounded-lg p-4 space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium">Pricing #{index + 1}</h4>
                    <Button
                      type="button"
                      onClick={() => removePricing(index)}
                      variant="ghost"
                      size="sm"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Input
                      value={price.serviceType}
                      onChange={(e) => updatePricing(index, 'serviceType', e.target.value)}
                      placeholder="Service type"
                      label="Service Type"
                    />
                    
                    <Input
                      type="number"
                      value={price.basePrice}
                      onChange={(e) => updatePricing(index, 'basePrice', parseFloat(e.target.value) || 0)}
                      placeholder="0.00"
                      label="Base Price"
                      leftIcon={<DollarSign className="h-5 w-5" />}
                    />
                    
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-2">
                        Unit
                      </label>
                      <select
                        value={price.unit}
                        onChange={(e) => updatePricing(index, 'unit', e.target.value)}
                        className="w-full px-3 py-2 border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-ring"
                      >
                        {PRICING_UNITS.map((unit) => (
                          <option key={unit.value} value={unit.value}>
                            {unit.label}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                  
                  <Input
                    value={price.description}
                    onChange={(e) => updatePricing(index, 'description', e.target.value)}
                    placeholder="Description of this pricing tier..."
                    label="Description"
                  />
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Portfolio */}
          <Card>
            <CardHeader>
              <CardTitle>Portfolio</CardTitle>
              <CardDescription>Showcase your work with images</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {serviceProvider?.portfolio?.map((item, index) => (
                  <div key={item.id} className="relative group">
                    <img
                      src={item.imageUrl}
                      alt={item.title}
                      className="w-full h-32 object-cover rounded-lg"
                    />
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center">
                      <Button
                        type="button"
                        variant="destructive"
                        size="sm"
                        onClick={() => UserService.deletePortfolioImage(user!.id, item.id)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
                
                <div className="border-2 border-dashed border-gray-300 rounded-lg h-32 flex items-center justify-center">
                  <ImageUpload
                    onImageChange={handlePortfolioUpload}
                    size="sm"
                    shape="square"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-end">
            <Button type="submit" loading={isLoading} disabled={isLoading}>
              Save Profile
            </Button>
          </div>
        </form>
      </div>
    </DashboardLayout>
  );
}

export default function ProviderProfilePage() {
  return (
    <ProtectedRoute allowedRoles={['service_provider']}>
      <ProviderProfileContent />
    </ProtectedRoute>
  );
}
