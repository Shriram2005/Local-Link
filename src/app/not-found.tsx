import React from 'react';
import Link from 'next/link';
import { Home, Search, ArrowLeft, HelpCircle } from 'lucide-react';
import Button from '@/components/ui/Button';
import { APP_NAME } from '@/constants';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-secondary/5 flex items-center justify-center px-4 relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
      <div className="absolute top-20 left-10 w-72 h-72 bg-primary/10 rounded-full blur-3xl"></div>
      <div className="absolute bottom-20 right-10 w-96 h-96 bg-secondary/10 rounded-full blur-3xl"></div>
      
      <div className="relative max-w-2xl mx-auto text-center">
        {/* 404 Animation */}
        <div className="mb-8">
          <div className="text-8xl md:text-9xl font-bold text-gradient mb-4 animate-pulse">
            404
          </div>
          <div className="w-24 h-1 bg-gradient-to-r from-primary to-secondary mx-auto rounded-full"></div>
        </div>

        {/* Content */}
        <div className="space-y-6 fade-in">
          <h1 className="text-3xl md:text-4xl font-bold text-foreground">
            Oops! Page Not Found
          </h1>
          
          <p className="text-lg text-muted-foreground max-w-md mx-auto leading-relaxed">
            The page you're looking for doesn't exist or has been moved. 
            Let's get you back on track!
          </p>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mt-8">
            <Link href="/">
              <Button size="lg" className="w-full sm:w-auto shadow-lg">
                <Home className="h-5 w-5 mr-2" />
                Go Home
              </Button>
            </Link>
            
            <Link href="/services">
              <Button variant="outline" size="lg" className="w-full sm:w-auto">
                <Search className="h-5 w-5 mr-2" />
                Browse Services
              </Button>
            </Link>
          </div>

          {/* Help Section */}
          <div className="mt-12 p-6 bg-card/50 backdrop-blur-sm rounded-xl border border-border">
            <div className="flex items-center justify-center mb-4">
              <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                <HelpCircle className="h-6 w-6 text-primary" />
              </div>
            </div>
            
            <h3 className="text-lg font-semibold text-foreground mb-2">
              Need Help?
            </h3>
            
            <p className="text-muted-foreground text-sm mb-4">
              If you believe this is an error, please contact our support team.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link href="/support">
                <Button variant="ghost" size="sm" className="w-full sm:w-auto">
                  Contact Support
                </Button>
              </Link>
              
              <button 
                onClick={() => window.history.back()}
                className="text-sm text-primary hover:text-primary-hover transition-colors flex items-center justify-center gap-1"
              >
                <ArrowLeft className="h-4 w-4" />
                Go Back
              </button>
            </div>
          </div>

          {/* Popular Links */}
          <div className="mt-8">
            <p className="text-sm text-muted-foreground mb-4">
              Or try one of these popular pages:
            </p>
            
            <div className="flex flex-wrap gap-2 justify-center">
              {[
                { name: 'How it Works', href: '/how-it-works' },
                { name: 'Become a Provider', href: '/become-provider' },
                { name: 'About Us', href: '/about' },
                { name: 'Blog', href: '/blog' },
              ].map((link) => (
                <Link
                  key={link.name}
                  href={link.href}
                  className="px-3 py-1 text-sm text-primary hover:text-primary-hover bg-primary/10 hover:bg-primary/20 rounded-full transition-colors"
                >
                  {link.name}
                </Link>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-16 text-center">
          <Link 
            href="/" 
            className="text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            © 2024 {APP_NAME}. All rights reserved.
          </Link>
        </div>
      </div>
    </div>
  );
}
