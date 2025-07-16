import { ServiceCategory } from '@/types';

// App Configuration
export const APP_NAME = 'LocalLink';
export const APP_DESCRIPTION = 'Connect with local service providers in your area';
export const COMMISSION_RATE = 0.05; // 5% platform fee

// Service Categories
export const SERVICE_CATEGORIES: Record<ServiceCategory, { label: string; subcategories: string[] }> = {
  home_services: {
    label: 'Home Services',
    subcategories: [
      'Electrician',
      'Plumber',
      'Carpenter',
      'Painter',
      'Cleaner',
      'Gardener',
      'Handyman',
      'HVAC Technician',
      'Locksmith',
      'Pest Control'
    ]
  },
  personal_services: {
    label: 'Personal Services',
    subcategories: [
      'Tutor',
      'Personal Trainer',
      'Massage Therapist',
      'Hair Stylist',
      'Makeup Artist',
      'Pet Groomer',
      'Dog Walker',
      'Babysitter',
      'Elder Care',
      'Life Coach'
    ]
  },
  food_services: {
    label: 'Food Services',
    subcategories: [
      'Personal Chef',
      'Caterer',
      'Baker',
      'Meal Prep',
      'Bartender',
      'Food Delivery',
      'Grocery Shopping',
      'Nutritionist',
      'Cooking Instructor'
    ]
  },
  other: {
    label: 'Other Services',
    subcategories: [
      'Photography',
      'Event Planning',
      'Transportation',
      'Moving Services',
      'IT Support',
      'Legal Services',
      'Accounting',
      'Consulting',
      'Translation',
      'Custom Services'
    ]
  }
};

// Time Slots
export const DEFAULT_TIME_SLOTS = [
  { startTime: '09:00', endTime: '10:00' },
  { startTime: '10:00', endTime: '11:00' },
  { startTime: '11:00', endTime: '12:00' },
  { startTime: '12:00', endTime: '13:00' },
  { startTime: '13:00', endTime: '14:00' },
  { startTime: '14:00', endTime: '15:00' },
  { startTime: '15:00', endTime: '16:00' },
  { startTime: '16:00', endTime: '17:00' },
  { startTime: '17:00', endTime: '18:00' },
  { startTime: '18:00', endTime: '19:00' }
];

// Days of the week
export const DAYS_OF_WEEK = [
  'monday',
  'tuesday',
  'wednesday',
  'thursday',
  'friday',
  'saturday',
  'sunday'
];

export const DAY_LABELS = {
  monday: 'Monday',
  tuesday: 'Tuesday',
  wednesday: 'Wednesday',
  thursday: 'Thursday',
  friday: 'Friday',
  saturday: 'Saturday',
  sunday: 'Sunday'
};

// Search Configuration
export const DEFAULT_SEARCH_RADIUS = 25; // kilometers
export const MAX_SEARCH_RADIUS = 100; // kilometers
export const SEARCH_RESULTS_PER_PAGE = 20;

// Pricing Units
export const PRICING_UNITS = [
  { value: 'hour', label: 'Per Hour' },
  { value: 'project', label: 'Per Project' },
  { value: 'day', label: 'Per Day' },
  { value: 'sqft', label: 'Per Square Foot' },
  { value: 'item', label: 'Per Item' },
  { value: 'session', label: 'Per Session' }
];

// Verification Badges
export const VERIFICATION_BADGES = {
  identity: {
    label: 'Identity Verified',
    description: 'Government-issued ID verified',
    icon: '🆔'
  },
  business: {
    label: 'Business Verified',
    description: 'Business license verified',
    icon: '🏢'
  },
  insurance: {
    label: 'Insured',
    description: 'Liability insurance verified',
    icon: '🛡️'
  },
  background_check: {
    label: 'Background Checked',
    description: 'Background check completed',
    icon: '✅'
  }
};

// Booking Status Labels
export const BOOKING_STATUS_LABELS = {
  pending: 'Pending Confirmation',
  confirmed: 'Confirmed',
  in_progress: 'In Progress',
  completed: 'Completed',
  cancelled: 'Cancelled'
};

// Payment Status Labels
export const PAYMENT_STATUS_LABELS = {
  pending: 'Payment Pending',
  paid: 'Paid',
  failed: 'Payment Failed',
  refunded: 'Refunded'
};

// Rating Configuration
export const MIN_RATING = 1;
export const MAX_RATING = 5;
export const DEFAULT_RATING = 5;

// File Upload Configuration
export const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
export const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
export const MAX_PORTFOLIO_IMAGES = 10;

// Notification Types
export const NOTIFICATION_TYPES = {
  booking_confirmed: {
    title: 'Booking Confirmed',
    icon: '✅'
  },
  booking_cancelled: {
    title: 'Booking Cancelled',
    icon: '❌'
  },
  payment_received: {
    title: 'Payment Received',
    icon: '💰'
  },
  new_review: {
    title: 'New Review',
    icon: '⭐'
  },
  profile_approved: {
    title: 'Profile Approved',
    icon: '🎉'
  },
  system_update: {
    title: 'System Update',
    icon: '🔔'
  }
};

// API Endpoints
export const API_ENDPOINTS = {
  auth: {
    login: '/api/auth/login',
    register: '/api/auth/register',
    logout: '/api/auth/logout',
    profile: '/api/auth/profile'
  },
  services: {
    list: '/api/services',
    create: '/api/services',
    update: '/api/services',
    delete: '/api/services'
  },
  bookings: {
    list: '/api/bookings',
    create: '/api/bookings',
    update: '/api/bookings',
    cancel: '/api/bookings/cancel'
  },
  payments: {
    create_intent: '/api/payments/create-intent',
    confirm: '/api/payments/confirm',
    webhook: '/api/payments/webhook'
  },
  reviews: {
    list: '/api/reviews',
    create: '/api/reviews',
    moderate: '/api/reviews/moderate'
  },
  search: {
    services: '/api/search/services',
    providers: '/api/search/providers'
  }
};

// Error Messages
export const ERROR_MESSAGES = {
  NETWORK_ERROR: 'Network error. Please check your connection.',
  UNAUTHORIZED: 'You are not authorized to perform this action.',
  VALIDATION_ERROR: 'Please check your input and try again.',
  SERVER_ERROR: 'Server error. Please try again later.',
  NOT_FOUND: 'The requested resource was not found.',
  BOOKING_CONFLICT: 'The selected time slot is no longer available.',
  PAYMENT_FAILED: 'Payment failed. Please try again.',
  FILE_TOO_LARGE: `File size must be less than ${MAX_FILE_SIZE / 1024 / 1024}MB`,
  INVALID_FILE_TYPE: 'Invalid file type. Please upload an image file.'
};

// Success Messages
export const SUCCESS_MESSAGES = {
  PROFILE_UPDATED: 'Profile updated successfully!',
  SERVICE_CREATED: 'Service created successfully!',
  BOOKING_CONFIRMED: 'Booking confirmed successfully!',
  PAYMENT_SUCCESSFUL: 'Payment completed successfully!',
  REVIEW_SUBMITTED: 'Review submitted successfully!',
  MESSAGE_SENT: 'Message sent successfully!'
};

// Local Storage Keys
export const STORAGE_KEYS = {
  USER_PREFERENCES: 'locallink_user_preferences',
  SEARCH_HISTORY: 'locallink_search_history',
  CART: 'locallink_cart',
  THEME: 'locallink_theme'
};

// Theme Configuration
export const THEME_CONFIG = {
  colors: {
    primary: '#3B82F6',
    secondary: '#10B981',
    accent: '#F59E0B',
    danger: '#EF4444',
    warning: '#F59E0B',
    success: '#10B981',
    info: '#3B82F6'
  }
};

// SEO Configuration
export const SEO_CONFIG = {
  defaultTitle: `${APP_NAME} - ${APP_DESCRIPTION}`,
  titleTemplate: `%s | ${APP_NAME}`,
  defaultDescription: APP_DESCRIPTION,
  siteUrl: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
  openGraph: {
    type: 'website',
    locale: 'en_US',
    siteName: APP_NAME
  },
  twitter: {
    handle: '@locallink',
    site: '@locallink',
    cardType: 'summary_large_image'
  }
};
