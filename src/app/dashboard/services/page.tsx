'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Plus, Edit, Trash2, Eye, EyeOff, MoreVertical, DollarSign } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import Button from '@/components/ui/Button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import { ServiceService } from '@/services/serviceService';
import { Service } from '@/types';
import { formatCurrency, formatDate, getErrorMessage } from '@/utils';

function ServicesContent() {
  const { user } = useAuth();
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadServices();
  }, [user]);

  const loadServices = async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      // For demo purposes, we'll use mock data since Firebase isn't configured
      const mockServices: Service[] = [
        {
          id: '1',
          providerId: user.id,
          title: 'Professional House Cleaning',
          description: 'Deep cleaning service for your home with eco-friendly products',
          category: 'home_services',
          subcategory: 'Cleaner',
          pricing: { serviceType: 'cleaning', basePrice: 75, unit: 'hour', description: 'Standard cleaning rate' },
          duration: 120,
          location: 'at_customer',
          images: [],
          tags: ['cleaning', 'eco-friendly', 'professional'],
          isActive: true,
          createdAt: { toDate: () => new Date() } as any,
          updatedAt: { toDate: () => new Date() } as any,
        },
        {
          id: '2',
          providerId: user.id,
          title: 'Garden Maintenance',
          description: 'Complete garden care including pruning, weeding, and lawn maintenance',
          category: 'home_services',
          subcategory: 'Gardener',
          pricing: { serviceType: 'gardening', basePrice: 50, unit: 'hour', description: 'Garden maintenance rate' },
          duration: 180,
          location: 'at_customer',
          images: [],
          tags: ['gardening', 'maintenance', 'outdoor'],
          isActive: false,
          createdAt: { toDate: () => new Date(Date.now() - 86400000) } as any,
          updatedAt: { toDate: () => new Date(Date.now() - 86400000) } as any,
        },
      ];
      setServices(mockServices);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const toggleServiceStatus = async (serviceId: string, currentStatus: boolean) => {
    try {
      // Mock toggle - in real app would call ServiceService.toggleServiceStatus
      setServices(prev => prev.map(service => 
        service.id === serviceId 
          ? { ...service, isActive: !currentStatus }
          : service
      ));
    } catch (err) {
      setError(getErrorMessage(err));
    }
  };

  const deleteService = async (serviceId: string) => {
    if (!confirm('Are you sure you want to delete this service? This action cannot be undone.')) {
      return;
    }

    try {
      // Mock delete - in real app would call ServiceService.deleteService
      setServices(prev => prev.filter(service => service.id !== serviceId));
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
      <div className="space-y-8">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div className="space-y-2">
            <h1 className="text-3xl font-bold text-foreground">
              My <span className="text-gradient">Services</span>
            </h1>
            <p className="text-lg text-muted-foreground">Manage and optimize your service offerings</p>
          </div>
          <div className="flex flex-col sm:flex-row gap-3">
            <Link href="/dashboard/analytics">
              <Button variant="outline" size="lg" className="w-full sm:w-auto">
                <Eye className="h-5 w-5 mr-2" />
                View Analytics
              </Button>
            </Link>
            <Link href="/dashboard/services/new">
              <Button size="lg" className="w-full sm:w-auto shadow-lg">
                <Plus className="h-5 w-5 mr-2" />
                Add Service
              </Button>
            </Link>
          </div>
        </div>

        {error && (
          <div className="bg-destructive/10 border border-destructive/20 text-destructive px-4 py-3 rounded-lg text-sm font-medium animate-pulse">
            {error}
          </div>
        )}

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <Card key={i} className="animate-pulse">
                <CardHeader>
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                </CardHeader>
                <CardContent>
                  <div className="h-32 bg-gray-200 rounded mb-4"></div>
                  <div className="h-3 bg-gray-200 rounded w-full mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded w-2/3"></div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : services.length === 0 ? (
          <Card variant="elevated" className="border-0 bg-gradient-to-br from-primary/5 to-secondary/5">
            <CardContent className="text-center py-16">
              <div className="w-20 h-20 bg-gradient-to-br from-primary/20 to-secondary/20 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <Plus className="h-10 w-10 text-primary" />
              </div>
              <h3 className="text-2xl font-bold text-foreground mb-4">Ready to get started?</h3>
              <p className="text-lg text-muted-foreground mb-8 max-w-md mx-auto">
                Create your first service offering and start connecting with customers in your area
              </p>
              <Link href="/dashboard/services/new">
                <Button size="lg" className="shadow-lg">
                  <Plus className="h-5 w-5 mr-2" />
                  Create Your First Service
                </Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {services.map((service, index) => (
              <Card
                key={service.id}
                variant="elevated"
                hover
                className="relative overflow-hidden border-0 bg-card/80 backdrop-blur-sm"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <CardHeader className="pb-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-xl font-bold text-foreground group-hover:text-primary transition-colors">
                        {service.title}
                      </CardTitle>
                      <CardDescription className="capitalize text-muted-foreground font-medium">
                        {service.category.replace('_', ' ')} • {service.subcategory}
                      </CardDescription>
                    </div>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => toggleServiceStatus(service.id, service.isActive)}
                        className={`p-2 rounded-lg transition-all ${
                          service.isActive
                            ? 'text-green-600 bg-green-50 hover:bg-green-100'
                            : 'text-gray-400 bg-gray-50 hover:bg-gray-100'
                        }`}
                        title={service.isActive ? 'Service is active' : 'Service is inactive'}
                      >
                        {service.isActive ? (
                          <Eye className="h-4 w-4" />
                        ) : (
                          <EyeOff className="h-4 w-4" />
                        )}
                      </button>
                      <div className="relative group">
                        <button className="p-2 rounded-lg hover:bg-muted transition-colors">
                          <MoreVertical className="h-4 w-4 text-muted-foreground" />
                        </button>
                        <div className="absolute right-0 top-12 bg-card border border-border rounded-lg shadow-xl py-2 z-10 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 min-w-[140px]">
                          <Link
                            href={`/dashboard/services/${service.id}/edit`}
                            className="flex items-center px-4 py-2 text-sm text-foreground hover:bg-muted transition-colors"
                          >
                            <Edit className="h-4 w-4 mr-3 text-primary" />
                            Edit Service
                          </Link>
                          <button
                            onClick={() => deleteService(service.id)}
                            className="flex items-center w-full px-4 py-2 text-sm text-destructive hover:bg-destructive/10 transition-colors"
                          >
                            <Trash2 className="h-4 w-4 mr-3" />
                            Delete
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  {service.images && service.images.length > 0 ? (
                    <div className="relative mb-6 overflow-hidden rounded-xl">
                      <img
                        src={service.images[0]}
                        alt={service.title}
                        className="w-full h-40 object-cover transition-transform duration-300 hover:scale-105"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
                    </div>
                  ) : (
                    <div className="w-full h-40 bg-gradient-to-br from-primary/10 to-secondary/10 rounded-xl flex items-center justify-center mb-6">
                      <div className="text-center">
                        <div className="w-12 h-12 bg-primary/20 rounded-lg flex items-center justify-center mx-auto mb-2">
                          <Plus className="h-6 w-6 text-primary" />
                        </div>
                        <p className="text-sm text-muted-foreground">No image</p>
                      </div>
                    </div>
                  )}

                  <p className="text-muted-foreground mb-6 line-clamp-2 leading-relaxed">
                    {service.description}
                  </p>

                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <DollarSign className="h-4 w-4 text-primary" />
                        <span className="font-bold text-lg text-primary">
                          {formatCurrency(service.pricing.basePrice)}
                        </span>
                        <span className="text-sm text-muted-foreground">/ {service.pricing.unit}</span>
                      </div>
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${
                        service.isActive
                          ? 'bg-green-100 text-green-700 border border-green-200'
                          : 'bg-gray-100 text-gray-700 border border-gray-200'
                      }`}>
                        {service.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </div>

                    <div className="flex items-center justify-between pt-4 border-t border-border">
                      <span className="text-sm text-muted-foreground">
                        Created {formatDate(service.createdAt.toDate(), 'MMM d, yyyy')}
                      </span>

                      <div className="flex space-x-2">
                        <Link href={`/services/${service.id}`}>
                          <Button variant="outline" size="sm" className="hover:border-primary/50">
                            <Eye className="h-4 w-4 mr-1" />
                            View
                          </Button>
                        </Link>
                        <Link href={`/dashboard/services/${service.id}/edit`}>
                          <Button size="sm">
                            <Edit className="h-4 w-4 mr-1" />
                            Edit
                          </Button>
                        </Link>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}

export default function ServicesPage() {
  return (
    <ProtectedRoute allowedRoles={['service_provider']}>
      <ServicesContent />
    </ProtectedRoute>
  );
}
