'use client';

import React, { useState, useEffect } from 'react';
import { Search, MapPin, Filter, Star, Clock, DollarSign, Heart } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import { VerificationBadges } from '@/components/ui/VerificationBadge';
import { SERVICE_CATEGORIES } from '@/constants';
import { ServiceService } from '@/services/serviceService';
import { formatCurrency, calculateDistance, getErrorMessage } from '@/utils';
import { Service, ServiceProvider, SearchFilters, ServiceCategory } from '@/types';

function SearchContent() {
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [location, setLocation] = useState('');
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [filters, setFilters] = useState<SearchFilters>({});
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    // Load initial featured services
    loadFeaturedServices();
  }, []);

  const loadFeaturedServices = async () => {
    try {
      setLoading(true);

      // Load featured services from the API
      const response = await fetch('/api/services?featured=true&pageSize=10');
      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setServices(data.data.services);
        }
      } else {
        // Fallback to service service if API fails
        const featuredServices = await ServiceService.getFeaturedServices(10);
        setServices(featuredServices);
      }

      setError('');
    } catch (err) {
      console.error('Error loading featured services:', err);
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async () => {
    try {
      setLoading(true);
      setError('');

      // Build search parameters
      const searchParams = new URLSearchParams();
      if (searchQuery) searchParams.set('q', searchQuery);
      if (filters.category) searchParams.set('category', filters.category);
      if (filters.subcategory) searchParams.set('subcategory', filters.subcategory);
      if (filters.minPrice) searchParams.set('minPrice', filters.minPrice.toString());
      if (filters.maxPrice) searchParams.set('maxPrice', filters.maxPrice.toString());
      if (filters.sortBy) searchParams.set('sortBy', filters.sortBy);

      // Call the search API
      const response = await fetch(`/api/search/services?${searchParams.toString()}`);
      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setServices(data.data.services);
        } else {
          throw new Error(data.error || 'Search failed');
        }
      } else {
        throw new Error('Search request failed');
      }

      setError('');
    } catch (err) {
      console.error('Search error:', err);
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  // Helper function to get provider info for a service
  const getProviderInfo = async (providerId: string): Promise<ServiceProvider | null> => {
    try {
      const response = await fetch(`/api/auth/profile`, {
        headers: { 'x-user-id': providerId }
      });
      if (response.ok) {
        const data = await response.json();
        return data.success ? data.data : null;
      }
    } catch (error) {
      console.error('Error fetching provider info:', error);
    }
    return null;
  };

  if (user?.role !== 'customer') {
    return (
      <DashboardLayout>
        <div className="text-center py-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Access Denied</h2>
          <p className="text-gray-600">This page is only available for customers.</p>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-8">
        <div className="text-center lg:text-left">
          <h1 className="text-3xl font-bold text-foreground">
            Find <span className="text-gradient">Local Services</span>
          </h1>
          <p className="text-lg text-muted-foreground mt-2">Discover trusted service providers in your area</p>
        </div>

        {/* Enhanced Search Bar */}
        <Card variant="elevated" className="border-0 shadow-xl">
          <CardContent className="p-8">
            <div className="flex flex-col lg:flex-row gap-6">
              <div className="flex-1">
                <Input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="What service do you need?"
                  leftIcon={<Search className="h-5 w-5 text-primary" />}
                  size="lg"
                  className="border-border/50 focus:border-primary"
                />
              </div>
              <div className="flex-1">
                <Input
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="Enter your location"
                  leftIcon={<MapPin className="h-5 w-5 text-primary" />}
                  size="lg"
                  className="border-border/50 focus:border-primary"
                />
              </div>
              <div className="flex flex-col sm:flex-row gap-3">
                <Button
                  variant="outline"
                  size="lg"
                  onClick={() => setShowFilters(!showFilters)}
                  className="border-border/50 hover:border-primary/50"
                >
                  <Filter className="h-5 w-5 mr-2" />
                  Filters
                </Button>
                <Button onClick={handleSearch} loading={loading} size="lg" className="shadow-lg">
                  <Search className="h-5 w-5 mr-2" />
                  Search
                </Button>
              </div>
            </div>

            {/* Filters */}
            {showFilters && (
              <div className="mt-6 p-4 border rounded-lg bg-gray-50">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Category
                    </label>
                    <select
                      value={filters.category || ''}
                      onChange={(e) => setFilters(prev => ({ ...prev, category: e.target.value as ServiceCategory }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    >
                      <option value="">All Categories</option>
                      {Object.entries(SERVICE_CATEGORIES).map(([key, category]) => (
                        <option key={key} value={key}>
                          {category.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Min Price
                    </label>
                    <Input
                      type="number"
                      placeholder="0"
                      value={filters.priceRange?.min || ''}
                      onChange={(e) => setFilters(prev => ({
                        ...prev,
                        priceRange: { ...prev.priceRange, min: parseFloat(e.target.value) || 0, max: prev.priceRange?.max || 1000 }
                      }))}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Max Price
                    </label>
                    <Input
                      type="number"
                      placeholder="1000"
                      value={filters.priceRange?.max || ''}
                      onChange={(e) => setFilters(prev => ({
                        ...prev,
                        priceRange: { min: prev.priceRange?.min || 0, max: parseFloat(e.target.value) || 1000 }
                      }))}
                    />
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {error && (
          <div className="bg-destructive/10 border border-destructive/20 text-destructive px-4 py-3 rounded-md text-sm">
            {error}
          </div>
        )}

        {/* Results */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {loading ? (
            [...Array(4)].map((_, i) => (
              <Card key={i} className="animate-pulse">
                <CardHeader>
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                </CardHeader>
                <CardContent>
                  <div className="h-20 bg-gray-200 rounded mb-4"></div>
                  <div className="h-3 bg-gray-200 rounded w-full mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded w-2/3"></div>
                </CardContent>
              </Card>
            ))
          ) : services.length === 0 ? (
            <div className="col-span-full text-center py-12">
              <Search className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No services found</h3>
              <p className="text-gray-600">Try adjusting your search criteria</p>
            </div>
          ) : (
            services.map((service, index) => {
              const provider = mockProviders[service.providerId];
              return (
                <Card
                  key={service.id}
                  variant="elevated"
                  hover
                  className="overflow-hidden border-0 bg-card/80 backdrop-blur-sm"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <CardHeader className="pb-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="text-xl font-bold text-foreground hover:text-primary transition-colors">
                          {service.title}
                        </CardTitle>
                        <CardDescription className="flex items-center space-x-2 text-muted-foreground font-medium">
                          <span className="capitalize">{service.category.replace('_', ' ')}</span>
                          <span>•</span>
                          <span>{service.subcategory}</span>
                        </CardDescription>
                      </div>
                      <button className="text-gray-400 hover:text-red-500">
                        <Heart className="h-5 w-5" />
                      </button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                      {service.description}
                    </p>

                    {/* Provider Info */}
                    <div className="flex items-center space-x-3 mb-4 p-3 bg-gray-50 rounded-lg">
                      <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center">
                        <span className="text-sm font-medium text-white">
                          {provider?.displayName?.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-sm">{provider?.businessName}</p>
                        <div className="flex items-center space-x-2">
                          <div className="flex items-center">
                            <Star className="h-3 w-3 text-yellow-400 fill-current" />
                            <span className="text-xs text-gray-600 ml-1">
                              {provider?.rating} ({provider?.reviewCount} reviews)
                            </span>
                          </div>
                          {provider?.verificationBadges && (
                            <VerificationBadges badges={provider.verificationBadges} size="sm" maxDisplay={2} />
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Service Details */}
                    <div className="flex items-center justify-between text-sm mb-4">
                      <div className="flex items-center space-x-4">
                        <div className="flex items-center text-gray-600">
                          <Clock className="h-4 w-4 mr-1" />
                          {service.duration} min
                        </div>
                        <div className="flex items-center text-gray-600">
                          <MapPin className="h-4 w-4 mr-1" />
                          {service.location.replace('_', ' ')}
                        </div>
                      </div>
                      <span className="font-medium text-primary">
                        {formatCurrency(service.pricing.basePrice)} / {service.pricing.unit}
                      </span>
                    </div>

                    {/* Tags */}
                    <div className="flex flex-wrap gap-1 mb-4">
                      {service.tags.slice(0, 3).map((tag) => (
                        <span
                          key={tag}
                          className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-primary/10 text-primary"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>

                    {/* Actions */}
                    <div className="flex space-x-2">
                      <Button variant="outline" size="sm" className="flex-1">
                        View Details
                      </Button>
                      <Button size="sm" className="flex-1">
                        Book Now
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}

export default function SearchPage() {
  return (
    <ProtectedRoute allowedRoles={['customer']}>
      <SearchContent />
    </ProtectedRoute>
  );
}
