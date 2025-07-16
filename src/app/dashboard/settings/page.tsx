'use client';

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { User, Mail, Phone, MapPin, Shield, Award, Upload } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import ImageUpload from '@/components/ui/ImageUpload';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import { VerificationBadges } from '@/components/ui/VerificationBadge';
import { UserService } from '@/services/userService';
import { getErrorMessage } from '@/utils';

const profileSchema = yup.object({
  displayName: yup.string().min(2, 'Name must be at least 2 characters').required('Name is required'),
  email: yup.string().email('Invalid email address').required('Email is required'),
  phoneNumber: yup.string().optional(),
  address: yup.object({
    street: yup.string().optional(),
    city: yup.string().optional(),
    state: yup.string().optional(),
    zipCode: yup.string().optional(),
    country: yup.string().optional(),
  }).optional(),
});

type ProfileFormData = yup.InferType<typeof profileSchema>;

function SettingsContent() {
  const { user, updateUserProfile, refreshUser } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [imageUploading, setImageUploading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ProfileFormData>({
    resolver: yupResolver(profileSchema),
    defaultValues: {
      displayName: user?.displayName || '',
      email: user?.email || '',
      phoneNumber: user?.phoneNumber || '',
      address: {
        street: user?.address?.street || '',
        city: user?.address?.city || '',
        state: user?.address?.state || '',
        zipCode: user?.address?.zipCode || '',
        country: user?.address?.country || '',
      },
    },
  });

  const onSubmit = async (data: ProfileFormData) => {
    try {
      setIsLoading(true);
      setError('');
      setSuccess('');

      await updateUserProfile({
        displayName: data.displayName,
        phoneNumber: data.phoneNumber,
        address: data.address,
      });

      setSuccess('Profile updated successfully!');
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setIsLoading(false);
    }
  };

  const handleImageUpload = async (file: File | null, previewUrl: string | null) => {
    if (!file || !user) return;

    try {
      setImageUploading(true);
      setError('');

      const downloadURL = await UserService.uploadProfilePicture(user.id, file);
      await refreshUser();
      setSuccess('Profile picture updated successfully!');
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setImageUploading(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-8">
        <div className="text-center lg:text-left">
          <h1 className="text-3xl font-bold text-foreground">
            Account <span className="text-gradient">Settings</span>
          </h1>
          <p className="text-lg text-muted-foreground mt-2">Manage your account settings and preferences</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Enhanced Profile Picture */}
          <Card variant="elevated" className="border-0 bg-card/80 backdrop-blur-sm">
            <CardHeader gradient>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5 text-primary" />
                Profile Picture
              </CardTitle>
              <CardDescription>Update your profile photo</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col items-center space-y-4">
              <ImageUpload
                currentImage={user?.photoURL || undefined}
                onImageChange={handleImageUpload}
                size="lg"
                loading={imageUploading}
              />

              {/* Verification Badges */}
              {user?.verificationBadges && user.verificationBadges.length > 0 && (
                <div className="text-center">
                  <p className="text-sm font-medium text-gray-700 mb-2">Verification Status</p>
                  <VerificationBadges badges={user.verificationBadges} showLabels />
                </div>
              )}
            </CardContent>
          </Card>

          {/* Profile Information */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Profile Information</CardTitle>
                <CardDescription>Update your personal information</CardDescription>
              </CardHeader>
              <CardContent>
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

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Input
                      {...register('displayName')}
                      label="Full Name"
                      placeholder="Enter your full name"
                      leftIcon={<User className="h-5 w-5" />}
                      error={errors.displayName?.message}
                    />

                    <Input
                      {...register('email')}
                      type="email"
                      label="Email Address"
                      placeholder="Enter your email"
                      leftIcon={<Mail className="h-5 w-5" />}
                      error={errors.email?.message}
                      disabled
                      helperText="Email cannot be changed"
                    />

                    <Input
                      {...register('phoneNumber')}
                      type="tel"
                      label="Phone Number"
                      placeholder="Enter your phone number"
                      leftIcon={<Phone className="h-5 w-5" />}
                      error={errors.phoneNumber?.message}
                    />

                    <div className="md:col-span-2">
                      <h3 className="text-lg font-medium text-gray-900 mb-4">Address</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="md:col-span-2">
                          <Input
                            {...register('address.street')}
                            label="Street Address"
                            placeholder="Enter your street address"
                            leftIcon={<MapPin className="h-5 w-5" />}
                            error={errors.address?.street?.message}
                          />
                        </div>

                        <Input
                          {...register('address.city')}
                          label="City"
                          placeholder="Enter your city"
                          error={errors.address?.city?.message}
                        />

                        <Input
                          {...register('address.state')}
                          label="State/Province"
                          placeholder="Enter your state"
                          error={errors.address?.state?.message}
                        />

                        <Input
                          {...register('address.zipCode')}
                          label="ZIP/Postal Code"
                          placeholder="Enter your ZIP code"
                          error={errors.address?.zipCode?.message}
                        />

                        <Input
                          {...register('address.country')}
                          label="Country"
                          placeholder="Enter your country"
                          error={errors.address?.country?.message}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-end">
                    <Button type="submit" loading={isLoading} disabled={isLoading}>
                      Save Changes
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Account Settings */}
        <Card>
          <CardHeader>
            <CardTitle>Account Settings</CardTitle>
            <CardDescription>Manage your account preferences</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-medium">Email Notifications</h4>
                  <p className="text-sm text-gray-500">Receive email updates about your bookings</p>
                </div>
                <input
                  type="checkbox"
                  className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
                  defaultChecked
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-medium">SMS Notifications</h4>
                  <p className="text-sm text-gray-500">Receive text messages for important updates</p>
                </div>
                <input
                  type="checkbox"
                  className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-medium">Marketing Communications</h4>
                  <p className="text-sm text-gray-500">Receive promotional emails and offers</p>
                </div>
                <input
                  type="checkbox"
                  className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
                />
              </div>

              <hr />

              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-medium">Two-Factor Authentication</h4>
                  <p className="text-sm text-gray-500">Add an extra layer of security to your account</p>
                </div>
                <Button variant="outline" size="sm">
                  Enable
                </Button>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-medium">Account Verification</h4>
                  <p className="text-sm text-gray-500">
                    Verify your identity to increase trust
                    {user?.isVerified && (
                      <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        Verified
                      </span>
                    )}
                  </p>
                </div>
                {!user?.isVerified && (
                  <Button variant="outline" size="sm">
                    Verify Now
                  </Button>
                )}
              </div>

              <hr />

              <div className="flex items-center justify-between text-red-600">
                <div>
                  <h4 className="text-sm font-medium">Delete Account</h4>
                  <p className="text-sm text-red-500">Permanently delete your account and all data</p>
                </div>
                <Button variant="destructive" size="sm">
                  Delete Account
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}

export default function SettingsPage() {
  return (
    <ProtectedRoute>
      <SettingsContent />
    </ProtectedRoute>
  );
}
