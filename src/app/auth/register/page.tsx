'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { Eye, EyeOff, Mail, Lock, User, UserCheck } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import { APP_NAME } from '@/constants';
import { getErrorMessage } from '@/utils';
import { UserRole } from '@/types';

const registerSchema = yup.object({
  displayName: yup.string().min(2, 'Name must be at least 2 characters').required('Full name is required'),
  email: yup.string().email('Invalid email address').required('Email is required'),
  password: yup.string().min(6, 'Password must be at least 6 characters').required('Password is required'),
  confirmPassword: yup.string()
    .oneOf([yup.ref('password')], 'Passwords must match')
    .required('Please confirm your password'),
  role: yup.string().oneOf(['customer', 'service_provider'] as const).required('Please select your role'),
  agreeToTerms: yup.boolean().oneOf([true], 'You must agree to the terms and conditions'),
});

type RegisterFormData = yup.InferType<typeof registerSchema>;

export default function RegisterPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  
  const { register: registerUser, loginWithGoogle } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const defaultRole = (searchParams.get('role') as UserRole) || 'customer';

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<RegisterFormData>({
    resolver: yupResolver(registerSchema),
    defaultValues: {
      role: defaultRole,
    },
  });

  const selectedRole = watch('role');

  const onSubmit = async (data: RegisterFormData) => {
    try {
      setIsLoading(true);
      setError('');
      await registerUser(data.email, data.password, data.displayName, data.role as UserRole);
      router.push('/dashboard');
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignup = async () => {
    try {
      setIsLoading(true);
      setError('');
      await loginWithGoogle();
      router.push('/dashboard');
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-secondary/5 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
      <div className="absolute top-20 left-10 w-72 h-72 bg-primary/10 rounded-full blur-3xl"></div>
      <div className="absolute bottom-20 right-10 w-96 h-96 bg-secondary/10 rounded-full blur-3xl"></div>

      <div className="relative max-w-lg w-full space-y-8">
        <div className="text-center fade-in">
          <Link href="/" className="inline-block text-3xl font-bold text-gradient hover:scale-105 transition-transform">
            {APP_NAME}
          </Link>
          <h2 className="mt-8 text-4xl font-bold text-foreground">
            Join our community
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            Create your account to get started
          </p>
          <p className="mt-2 text-sm text-muted-foreground">
            Already have an account?{' '}
            <Link
              href="/auth/login"
              className="font-semibold text-primary hover:text-primary-hover transition-colors"
            >
              Sign in here
            </Link>
          </p>
        </div>

        <Card variant="elevated" className="backdrop-blur-sm bg-card/80 border-0 shadow-2xl slide-in">
          <CardHeader className="text-center pb-6">
            <CardTitle className="text-2xl font-bold text-foreground">Create Account</CardTitle>
            <CardDescription className="text-muted-foreground">
              Fill in your details to get started
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-0">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              {error && (
                <div className="bg-destructive/10 border border-destructive/20 text-destructive px-4 py-3 rounded-lg text-sm font-medium animate-pulse">
                  {error}
                </div>
              )}

              <div className="space-y-5">
                <Input
                  {...register('displayName')}
                  type="text"
                  label="Full Name"
                  placeholder="Enter your full name"
                  leftIcon={<User className="h-5 w-5 text-primary" />}
                  error={errors.displayName?.message}
                  autoComplete="name"
                  className="h-12 text-base border-border/50 focus:border-primary transition-colors"
                />

                <Input
                  {...register('email')}
                  type="email"
                  label="Email address"
                  placeholder="Enter your email"
                  leftIcon={<Mail className="h-5 w-5 text-primary" />}
                  error={errors.email?.message}
                  autoComplete="email"
                  className="h-12 text-base border-border/50 focus:border-primary transition-colors"
                />

                <div>
                  <label className="block text-sm font-semibold text-foreground mb-4">
                    I want to
                  </label>
                  <div className="grid grid-cols-1 gap-4">
                    <label className="relative">
                      <input
                        {...register('role')}
                        type="radio"
                        value="customer"
                        className="sr-only"
                      />
                      <div className={`p-5 border-2 rounded-xl cursor-pointer transition-all hover:shadow-md ${
                        selectedRole === 'customer'
                          ? 'border-primary bg-primary/10 shadow-md'
                          : 'border-border hover:border-primary/50 bg-card'
                      }`}>
                        <div className="flex items-center">
                          <div className={`w-10 h-10 rounded-lg flex items-center justify-center mr-4 ${
                            selectedRole === 'customer' ? 'bg-primary text-primary-foreground' : 'bg-primary/10 text-primary'
                          }`}>
                            <User className="h-5 w-5" />
                          </div>
                          <div>
                            <div className="font-semibold text-foreground">Find Services</div>
                            <div className="text-sm text-muted-foreground">Book local service providers</div>
                          </div>
                        </div>
                      </div>
                    </label>

                    <label className="relative">
                      <input
                        {...register('role')}
                        type="radio"
                        value="service_provider"
                        className="sr-only"
                      />
                      <div className={`p-5 border-2 rounded-xl cursor-pointer transition-all hover:shadow-md ${
                        selectedRole === 'service_provider'
                          ? 'border-primary bg-primary/10 shadow-md'
                          : 'border-border hover:border-primary/50 bg-card'
                      }`}>
                        <div className="flex items-center">
                          <div className={`w-10 h-10 rounded-lg flex items-center justify-center mr-4 ${
                            selectedRole === 'service_provider' ? 'bg-primary text-primary-foreground' : 'bg-primary/10 text-primary'
                          }`}>
                            <UserCheck className="h-5 w-5" />
                          </div>
                          <div>
                            <div className="font-semibold text-foreground">Provide Services</div>
                            <div className="text-sm text-muted-foreground">Offer your services to customers</div>
                          </div>
                        </div>
                      </div>
                    </label>
                  </div>
                  {errors.role && (
                    <p className="text-sm text-destructive mt-2 font-medium">{errors.role.message}</p>
                  )}
                </div>

                <Input
                  {...register('password')}
                  type={showPassword ? 'text' : 'password'}
                  label="Password"
                  placeholder="Create a password"
                  leftIcon={<Lock className="h-5 w-5 text-primary" />}
                  rightIcon={
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="focus:outline-none text-muted-foreground hover:text-foreground transition-colors p-1 rounded"
                    >
                      {showPassword ? (
                        <EyeOff className="h-5 w-5" />
                      ) : (
                        <Eye className="h-5 w-5" />
                      )}
                    </button>
                  }
                  error={errors.password?.message}
                  autoComplete="new-password"
                  helperText="Must be at least 6 characters"
                  className="h-12 text-base border-border/50 focus:border-primary transition-colors"
                />

                <Input
                  {...register('confirmPassword')}
                  type={showConfirmPassword ? 'text' : 'password'}
                  label="Confirm Password"
                  placeholder="Confirm your password"
                  leftIcon={<Lock className="h-5 w-5 text-primary" />}
                  rightIcon={
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="focus:outline-none text-muted-foreground hover:text-foreground transition-colors p-1 rounded"
                    >
                      {showConfirmPassword ? (
                        <EyeOff className="h-5 w-5" />
                      ) : (
                        <Eye className="h-5 w-5" />
                      )}
                    </button>
                  }
                  error={errors.confirmPassword?.message}
                  autoComplete="new-password"
                  className="h-12 text-base border-border/50 focus:border-primary transition-colors"
                />
              </div>

              <div className="space-y-4">
                <div className="flex items-start">
                  <input
                    {...register('agreeToTerms')}
                    id="agree-terms"
                    type="checkbox"
                    className="h-4 w-4 text-primary focus:ring-primary focus:ring-2 border-border rounded mt-1 transition-colors"
                  />
                  <label htmlFor="agree-terms" className="ml-3 block text-sm font-medium text-foreground cursor-pointer leading-relaxed">
                    I agree to the{' '}
                    <Link href="/terms" className="text-primary hover:text-primary-hover font-semibold transition-colors">
                      Terms of Service
                    </Link>{' '}
                    and{' '}
                    <Link href="/privacy" className="text-primary hover:text-primary-hover font-semibold transition-colors">
                      Privacy Policy
                    </Link>
                  </label>
                </div>
                {errors.agreeToTerms && (
                  <p className="text-sm text-destructive font-medium">{errors.agreeToTerms.message}</p>
                )}
              </div>

              <Button
                type="submit"
                className="w-full h-12 text-base font-semibold shadow-lg hover:shadow-xl"
                loading={isLoading}
                disabled={isLoading}
              >
                Create Account
              </Button>

              <div className="mt-8">
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-border" />
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-4 bg-card text-muted-foreground font-medium">Or continue with</span>
                  </div>
                </div>

                <div className="mt-6">
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full h-12 text-base font-semibold border-border/50 hover:border-primary/50 hover:bg-primary/5 transition-all"
                    onClick={handleGoogleSignup}
                    disabled={isLoading}
                  >
                    <svg className="w-5 h-5 mr-3" viewBox="0 0 24 24">
                      <path
                        fill="#4285F4"
                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                      />
                      <path
                        fill="#34A853"
                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                      />
                      <path
                        fill="#FBBC05"
                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                      />
                      <path
                        fill="#EA4335"
                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                      />
                    </svg>
                    Continue with Google
                  </Button>
                </div>
              </div>
            </form>
          </CardContent>
        </Card>

        <div className="text-center">
          <p className="text-sm text-gray-600">
            Already have an account?{' '}
            <Link
              href="/auth/login"
              className="font-medium text-primary hover:text-primary/80"
            >
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
