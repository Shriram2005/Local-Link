'use client';

import React from 'react';
import Link from 'next/link';
import { Search, MapPin, Star, Users, Shield, Clock } from 'lucide-react';
import Button from '@/components/ui/Button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import Input from '@/components/ui/Input';
import Testimonials, { TestimonialStats } from '@/components/ui/Testimonials';
import { APP_NAME, SERVICE_CATEGORIES } from '@/constants';

export default function Home() {
  const [searchQuery, setSearchQuery] = React.useState('');
  const [location, setLocation] = React.useState('');

  const features = [
    {
      icon: <Search className="h-8 w-8 text-primary" />,
      title: 'Easy Discovery',
      description: 'Find local service providers with advanced search and filtering options.'
    },
    {
      icon: <MapPin className="h-8 w-8 text-primary" />,
      title: 'Location-Based',
      description: 'Connect with service providers in your area with precise location matching.'
    },
    {
      icon: <Star className="h-8 w-8 text-primary" />,
      title: 'Verified Reviews',
      description: 'Read authentic reviews and ratings from real customers.'
    },
    {
      icon: <Shield className="h-8 w-8 text-primary" />,
      title: 'Trusted Providers',
      description: 'All service providers are verified and background-checked.'
    },
    {
      icon: <Clock className="h-8 w-8 text-primary" />,
      title: 'Real-time Booking',
      description: 'Book services instantly with real-time availability.'
    },
    {
      icon: <Users className="h-8 w-8 text-primary" />,
      title: 'Community Driven',
      description: 'Join a community of trusted service providers and customers.'
    }
  ];

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Implement search functionality
    console.log('Search:', { query: searchQuery, location });
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Enhanced Header */}
      <header className="bg-card/95 backdrop-blur-md shadow-lg border-b border-border sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-18">
            <div className="flex items-center">
              <Link href="/" className="text-2xl font-bold text-gradient hover:scale-105 transition-transform">
                {APP_NAME}
              </Link>
            </div>
            <nav className="hidden md:flex space-x-8">
              <Link href="/services" className="text-muted-foreground hover:text-foreground font-medium transition-colors relative group">
                Services
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-primary transition-all group-hover:w-full"></span>
              </Link>
              <Link href="/how-it-works" className="text-muted-foreground hover:text-foreground font-medium transition-colors relative group">
                How it Works
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-primary transition-all group-hover:w-full"></span>
              </Link>
              <Link href="/become-provider" className="text-muted-foreground hover:text-foreground font-medium transition-colors relative group">
                Become a Provider
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-primary transition-all group-hover:w-full"></span>
              </Link>
            </nav>
            <div className="flex items-center space-x-3">
              <Link href="/auth/login">
                <Button variant="ghost" size="md" className="font-medium">
                  Sign In
                </Button>
              </Link>
              <Link href="/auth/register">
                <Button size="md" className="font-medium shadow-md">
                  Get Started
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Enhanced Hero Section */}
      <section className="relative bg-gradient-to-br from-primary/5 via-background to-secondary/5 py-24 lg:py-32 overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
        <div className="absolute top-20 left-10 w-72 h-72 bg-primary/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-secondary/10 rounded-full blur-3xl"></div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center fade-in">
            <h1 className="text-5xl md:text-7xl font-bold text-foreground mb-8 leading-tight">
              Find Local Services
              <span className="text-gradient block mt-2">You Can Trust</span>
            </h1>
            <p className="text-xl md:text-2xl text-muted-foreground mb-12 max-w-4xl mx-auto leading-relaxed">
              Connect with verified local service providers for all your needs.
              From home repairs to personal services, find trusted professionals in your area.
            </p>

            {/* Enhanced Search Form */}
            <form onSubmit={handleSearch} className="max-w-5xl mx-auto slide-in">
              <div className="flex flex-col lg:flex-row gap-4 bg-card/80 backdrop-blur-sm p-6 rounded-2xl shadow-xl border border-border hover:shadow-2xl transition-all duration-300">
                <div className="flex-1">
                  <Input
                    placeholder="What service do you need?"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    leftIcon={<Search className="h-5 w-5 text-primary" />}
                    className="h-14 text-lg border-0 bg-background/50 focus:bg-background transition-colors"
                  />
                </div>
                <div className="flex-1">
                  <Input
                    placeholder="Enter your location"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    leftIcon={<MapPin className="h-5 w-5 text-primary" />}
                    className="h-14 text-lg border-0 bg-background/50 focus:bg-background transition-colors"
                  />
                </div>
                <Button type="submit" size="lg" className="lg:w-auto h-14 px-8 text-lg font-semibold shadow-lg hover:shadow-xl">
                  Search Services
                </Button>
              </div>
            </form>

            {/* Trust Indicators */}
            <div className="mt-16 flex flex-wrap justify-center items-center gap-8 text-muted-foreground">
              <div className="flex items-center gap-2">
                <Shield className="h-5 w-5 text-primary" />
                <span className="font-medium">Verified Providers</span>
              </div>
              <div className="flex items-center gap-2">
                <Star className="h-5 w-5 text-primary" />
                <span className="font-medium">Rated & Reviewed</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-primary" />
                <span className="font-medium">Quick Response</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Enhanced Service Categories */}
      <section className="py-20 bg-muted/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16 fade-in">
            <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-6">
              Popular Service Categories
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Discover trusted professionals across various service categories in your local area
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {Object.entries(SERVICE_CATEGORIES).map(([key, category], index) => (
              <Card
                key={key}
                variant="elevated"
                hover
                className="group cursor-pointer border-0 bg-card/60 backdrop-blur-sm"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <CardHeader className="pb-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-primary to-primary-hover rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                    <Users className="h-6 w-6 text-primary-foreground" />
                  </div>
                  <CardTitle className="text-xl font-semibold text-foreground group-hover:text-primary transition-colors">
                    {category.label}
                  </CardTitle>
                  <CardDescription className="text-muted-foreground leading-relaxed">
                    {category.subcategories.slice(0, 3).join(', ')}
                    {category.subcategories.length > 3 && ' & more'}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium text-muted-foreground">
                      {category.subcategories.length} services
                    </p>
                    <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                      <span className="text-xs font-bold text-primary">→</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Enhanced Features Section */}
      <section className="py-24 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-20 fade-in">
            <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-6">
              Why Choose <span className="text-gradient">{APP_NAME}</span>?
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              We make it easy to find and book trusted local services
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
            {features.map((feature, index) => (
              <div
                key={index}
                className="text-center group hover-lift"
                style={{ animationDelay: `${index * 150}ms` }}
              >
                <div className="flex justify-center mb-6">
                  <div className="w-16 h-16 bg-gradient-to-br from-primary/10 to-secondary/10 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                    {React.cloneElement(feature.icon, {
                      className: "h-8 w-8 text-primary group-hover:text-primary-hover transition-colors"
                    })}
                  </div>
                </div>
                <h3 className="text-2xl font-bold text-foreground mb-4 group-hover:text-primary transition-colors">
                  {feature.title}
                </h3>
                <p className="text-muted-foreground leading-relaxed text-lg">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <Testimonials />

      {/* Stats Section */}
      <TestimonialStats />

      {/* Enhanced CTA Section */}
      <section className="relative py-24 bg-gradient-to-br from-primary via-primary-hover to-secondary overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 bg-grid-pattern opacity-10"></div>
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-r from-primary/20 to-transparent"></div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="fade-in">
            <h2 className="text-4xl md:text-6xl font-bold text-primary-foreground mb-6">
              Ready to Get Started?
            </h2>
            <p className="text-xl md:text-2xl text-primary-foreground/90 mb-12 max-w-4xl mx-auto leading-relaxed">
              Join thousands of customers who trust <span className="font-semibold">{APP_NAME}</span> for their service needs
            </p>
            <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
              <Link href="/auth/register?role=customer">
                <Button
                  variant="secondary"
                  size="lg"
                  className="w-full sm:w-auto px-8 py-4 text-lg font-semibold shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all"
                >
                  Find Services
                </Button>
              </Link>
              <Link href="/auth/register?role=service_provider">
                <Button
                  variant="outline"
                  size="lg"
                  className="w-full sm:w-auto px-8 py-4 text-lg font-semibold bg-white/10 backdrop-blur-sm text-primary-foreground border-primary-foreground/30 hover:bg-white/20 hover:border-primary-foreground/50 shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all"
                >
                  Become a Provider
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Enhanced Footer */}
      <footer className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
            <div className="md:col-span-1">
              <h3 className="text-2xl font-bold text-gradient mb-4">{APP_NAME}</h3>
              <p className="text-gray-300 leading-relaxed mb-6">
                Connecting communities with trusted local service providers through innovative technology and exceptional service.
              </p>
              <div className="flex space-x-4">
                <div className="w-10 h-10 bg-primary/20 rounded-lg flex items-center justify-center hover:bg-primary/30 transition-colors cursor-pointer">
                  <Users className="h-5 w-5 text-primary" />
                </div>
                <div className="w-10 h-10 bg-primary/20 rounded-lg flex items-center justify-center hover:bg-primary/30 transition-colors cursor-pointer">
                  <Star className="h-5 w-5 text-primary" />
                </div>
                <div className="w-10 h-10 bg-primary/20 rounded-lg flex items-center justify-center hover:bg-primary/30 transition-colors cursor-pointer">
                  <Shield className="h-5 w-5 text-primary" />
                </div>
              </div>
            </div>
            <div>
              <h4 className="font-bold text-lg mb-6 text-white">For Customers</h4>
              <ul className="space-y-3">
                <li><Link href="/services" className="text-gray-300 hover:text-primary transition-colors flex items-center group">
                  <span className="w-1.5 h-1.5 bg-primary rounded-full mr-3 opacity-0 group-hover:opacity-100 transition-opacity"></span>
                  Find Services
                </Link></li>
                <li><Link href="/how-it-works" className="text-gray-300 hover:text-primary transition-colors flex items-center group">
                  <span className="w-1.5 h-1.5 bg-primary rounded-full mr-3 opacity-0 group-hover:opacity-100 transition-opacity"></span>
                  How it Works
                </Link></li>
                <li><Link href="/support" className="text-gray-300 hover:text-primary transition-colors flex items-center group">
                  <span className="w-1.5 h-1.5 bg-primary rounded-full mr-3 opacity-0 group-hover:opacity-100 transition-opacity"></span>
                  Support
                </Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold text-lg mb-6 text-white">For Providers</h4>
              <ul className="space-y-3">
                <li><Link href="/become-provider" className="text-gray-300 hover:text-primary transition-colors flex items-center group">
                  <span className="w-1.5 h-1.5 bg-primary rounded-full mr-3 opacity-0 group-hover:opacity-100 transition-opacity"></span>
                  Join as Provider
                </Link></li>
                <li><Link href="/provider-resources" className="text-gray-300 hover:text-primary transition-colors flex items-center group">
                  <span className="w-1.5 h-1.5 bg-primary rounded-full mr-3 opacity-0 group-hover:opacity-100 transition-opacity"></span>
                  Resources
                </Link></li>
                <li><Link href="/provider-support" className="text-gray-300 hover:text-primary transition-colors flex items-center group">
                  <span className="w-1.5 h-1.5 bg-primary rounded-full mr-3 opacity-0 group-hover:opacity-100 transition-opacity"></span>
                  Provider Support
                </Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold text-lg mb-6 text-white">Company</h4>
              <ul className="space-y-3">
                <li><Link href="/about" className="text-gray-300 hover:text-primary transition-colors flex items-center group">
                  <span className="w-1.5 h-1.5 bg-primary rounded-full mr-3 opacity-0 group-hover:opacity-100 transition-opacity"></span>
                  About Us
                </Link></li>
                <li><Link href="/privacy" className="text-gray-300 hover:text-primary transition-colors flex items-center group">
                  <span className="w-1.5 h-1.5 bg-primary rounded-full mr-3 opacity-0 group-hover:opacity-100 transition-opacity"></span>
                  Privacy Policy
                </Link></li>
                <li><Link href="/terms" className="text-gray-300 hover:text-primary transition-colors flex items-center group">
                  <span className="w-1.5 h-1.5 bg-primary rounded-full mr-3 opacity-0 group-hover:opacity-100 transition-opacity"></span>
                  Terms of Service
                </Link></li>
                <li><Link href="/blog" className="text-gray-300 hover:text-primary transition-colors flex items-center group">
                  <span className="w-1.5 h-1.5 bg-primary rounded-full mr-3 opacity-0 group-hover:opacity-100 transition-opacity"></span>
                  Blog
                </Link></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-700/50 mt-12 pt-8">
            <div className="flex flex-col md:flex-row justify-between items-center">
              <p className="text-gray-400 text-sm">&copy; 2024 {APP_NAME}. All rights reserved.</p>
              <div className="flex items-center space-x-6 mt-4 md:mt-0">
                <span className="text-gray-400 text-sm">Made with</span>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                  <span className="text-gray-400 text-sm">by the LocalLink team</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
