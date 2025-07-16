import React from 'react';
import { Star, Quote } from 'lucide-react';
import { Card, CardContent } from './Card';

interface Testimonial {
  id: string;
  name: string;
  role: string;
  company?: string;
  image?: string;
  rating: number;
  content: string;
  service: string;
  location: string;
  date: string;
}

interface TestimonialsProps {
  testimonials?: Testimonial[];
  title?: string;
  subtitle?: string;
  layout?: 'grid' | 'carousel' | 'single';
  showRating?: boolean;
  showService?: boolean;
  className?: string;
}

const defaultTestimonials: Testimonial[] = [
  {
    id: '1',
    name: 'Sarah Johnson',
    role: 'Homeowner',
    image: null,
    rating: 5,
    content: 'LocalLink made finding a reliable cleaning service so easy! The provider was professional, thorough, and my house has never looked better. I\'ll definitely be booking again.',
    service: 'House Cleaning',
    location: 'New York, NY',
    date: '2024-01-15',
  },
  {
    id: '2',
    name: 'Mike Wilson',
    role: 'Business Owner',
    company: 'Wilson Consulting',
    image: null,
    rating: 5,
    content: 'As a busy entrepreneur, I needed someone reliable for office cleaning. The service provider LocalLink connected me with exceeded all expectations. Highly recommended!',
    service: 'Office Cleaning',
    location: 'Los Angeles, CA',
    date: '2024-01-12',
  },
  {
    id: '3',
    name: 'Emily Davis',
    role: 'Working Mom',
    image: null,
    rating: 5,
    content: 'The personal trainer I found through LocalLink has been amazing! She\'s helped me get back in shape after having my second child. The booking process was seamless.',
    service: 'Personal Training',
    location: 'Chicago, IL',
    date: '2024-01-10',
  },
  {
    id: '4',
    name: 'David Brown',
    role: 'Homeowner',
    image: null,
    rating: 5,
    content: 'Had a plumbing emergency and found help through LocalLink within minutes. The plumber was professional, fixed the issue quickly, and the price was fair.',
    service: 'Plumbing Repair',
    location: 'Houston, TX',
    date: '2024-01-08',
  },
  {
    id: '5',
    name: 'Lisa Garcia',
    role: 'Property Manager',
    company: 'Garcia Properties',
    image: null,
    rating: 5,
    content: 'I manage multiple properties and LocalLink has become my go-to platform for finding reliable maintenance services. The quality of providers is consistently excellent.',
    service: 'Property Maintenance',
    location: 'Phoenix, AZ',
    date: '2024-01-05',
  },
  {
    id: '6',
    name: 'John Smith',
    role: 'Retiree',
    image: null,
    rating: 5,
    content: 'The lawn care service I booked through LocalLink transformed my yard! The provider was knowledgeable, punctual, and my neighbors have been asking for recommendations.',
    service: 'Lawn Care',
    location: 'Denver, CO',
    date: '2024-01-03',
  },
];

export default function Testimonials({
  testimonials = defaultTestimonials,
  title = 'What Our Customers Say',
  subtitle = 'Don\'t just take our word for it - hear from our satisfied customers',
  layout = 'grid',
  showRating = true,
  showService = true,
  className = '',
}: TestimonialsProps) {
  const renderStars = (rating: number) => {
    return (
      <div className="flex items-center space-x-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`h-4 w-4 ${
              star <= rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'
            }`}
          />
        ))}
      </div>
    );
  };

  const renderTestimonial = (testimonial: Testimonial) => (
    <Card key={testimonial.id} className="h-full">
      <CardContent className="p-6">
        <div className="flex items-start space-x-4">
          <div className="flex-shrink-0">
            {testimonial.image ? (
              <img
                src={testimonial.image}
                alt={testimonial.name}
                className="w-12 h-12 rounded-full object-cover"
              />
            ) : (
              <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center">
                <span className="text-white font-medium text-sm">
                  {testimonial.name.charAt(0)}
                </span>
              </div>
            )}
          </div>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between mb-2">
              <div>
                <h4 className="font-medium text-gray-900">{testimonial.name}</h4>
                <p className="text-sm text-gray-500">
                  {testimonial.role}
                  {testimonial.company && ` at ${testimonial.company}`}
                </p>
              </div>
              {showRating && (
                <div className="flex-shrink-0">
                  {renderStars(testimonial.rating)}
                </div>
              )}
            </div>
            
            <div className="relative">
              <Quote className="absolute -top-2 -left-2 h-6 w-6 text-gray-300" />
              <p className="text-gray-700 italic pl-4 mb-4">
                "{testimonial.content}"
              </p>
            </div>
            
            {showService && (
              <div className="flex items-center justify-between text-sm text-gray-500">
                <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                  {testimonial.service}
                </span>
                <span>{testimonial.location}</span>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );

  if (layout === 'single') {
    return (
      <div className={`py-16 ${className}`}>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">{title}</h2>
          <p className="text-xl text-gray-600 mb-12">{subtitle}</p>
          
          <div className="max-w-2xl mx-auto">
            {renderTestimonial(testimonials[0])}
          </div>
        </div>
      </div>
    );
  }

  if (layout === 'carousel') {
    return (
      <div className={`py-16 bg-gray-50 ${className}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">{title}</h2>
            <p className="text-xl text-gray-600">{subtitle}</p>
          </div>
          
          <div className="relative">
            <div className="flex space-x-6 overflow-x-auto pb-4">
              {testimonials.map((testimonial) => (
                <div key={testimonial.id} className="flex-shrink-0 w-80">
                  {renderTestimonial(testimonial)}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Default grid layout
  return (
    <div className={`py-16 bg-gray-50 ${className}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">{title}</h2>
          <p className="text-xl text-gray-600">{subtitle}</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {testimonials.map((testimonial) => renderTestimonial(testimonial))}
        </div>
      </div>
    </div>
  );
}

// Testimonial stats component
interface TestimonialStatsProps {
  className?: string;
}

export function TestimonialStats({ className = '' }: TestimonialStatsProps) {
  const stats = [
    { label: 'Happy Customers', value: '10,000+' },
    { label: 'Average Rating', value: '4.9/5' },
    { label: 'Services Completed', value: '50,000+' },
    { label: 'Cities Served', value: '100+' },
  ];

  return (
    <div className={`py-16 bg-primary ${className}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
          {stats.map((stat, index) => (
            <div key={index} className="text-center">
              <div className="text-3xl lg:text-4xl font-bold text-white mb-2">
                {stat.value}
              </div>
              <div className="text-blue-100 text-sm lg:text-base">
                {stat.label}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// Featured testimonial component for hero sections
interface FeaturedTestimonialProps {
  testimonial?: Testimonial;
  className?: string;
}

export function FeaturedTestimonial({ 
  testimonial = defaultTestimonials[0], 
  className = '' 
}: FeaturedTestimonialProps) {
  return (
    <div className={`bg-white rounded-lg shadow-lg p-8 ${className}`}>
      <div className="flex items-center mb-6">
        <div className="flex-shrink-0 mr-4">
          {testimonial.image ? (
            <img
              src={testimonial.image}
              alt={testimonial.name}
              className="w-16 h-16 rounded-full object-cover"
            />
          ) : (
            <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center">
              <span className="text-white font-medium text-lg">
                {testimonial.name.charAt(0)}
              </span>
            </div>
          )}
        </div>
        <div>
          <h4 className="font-semibold text-gray-900 text-lg">{testimonial.name}</h4>
          <p className="text-gray-600">
            {testimonial.role}
            {testimonial.company && ` at ${testimonial.company}`}
          </p>
          <div className="flex items-center mt-1">
            {[1, 2, 3, 4, 5].map((star) => (
              <Star
                key={star}
                className={`h-4 w-4 ${
                  star <= testimonial.rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'
                }`}
              />
            ))}
          </div>
        </div>
      </div>
      
      <blockquote className="text-gray-700 text-lg italic mb-4">
        "{testimonial.content}"
      </blockquote>
      
      <div className="flex items-center justify-between text-sm text-gray-500">
        <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full">
          {testimonial.service}
        </span>
        <span>{testimonial.location}</span>
      </div>
    </div>
  );
}
