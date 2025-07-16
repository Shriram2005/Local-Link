import { Timestamp } from 'firebase/firestore';

// User Types
export interface User {
  id: string;
  email: string;
  displayName: string;
  photoURL?: string;
  role: UserRole;
  phoneNumber?: string;
  address?: Address;
  isVerified: boolean;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export type UserRole = 'customer' | 'service_provider' | 'admin';

export interface Address {
  street: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  coordinates?: {
    lat: number;
    lng: number;
  };
}

// Service Provider Types
export interface ServiceProvider extends User {
  businessName: string;
  businessDescription: string;
  services: string[];
  serviceAreas: string[];
  portfolio: PortfolioItem[];
  availability: Availability;
  pricing: PricingInfo[];
  rating: number;
  reviewCount: number;
  isApproved: boolean;
  verificationBadges: VerificationBadge[];
}

export interface PortfolioItem {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  category: string;
  createdAt: Timestamp;
}

export interface Availability {
  schedule: WeeklySchedule;
  exceptions: DateException[];
  timeZone: string;
}

export interface WeeklySchedule {
  [key: string]: DaySchedule; // monday, tuesday, etc.
}

export interface DaySchedule {
  isAvailable: boolean;
  timeSlots: TimeSlot[];
}

export interface TimeSlot {
  startTime: string; // HH:MM format
  endTime: string;   // HH:MM format
}

export interface DateException {
  date: string; // YYYY-MM-DD format
  isAvailable: boolean;
  reason?: string;
}

export interface PricingInfo {
  serviceType: string;
  basePrice: number;
  unit: string; // 'hour', 'project', 'sqft', etc.
  description: string;
}

export type VerificationBadge = 'identity' | 'business' | 'insurance' | 'background_check';

// Service Types
export interface Service {
  id: string;
  providerId: string;
  title: string;
  description: string;
  category: ServiceCategory;
  subcategory: string;
  pricing: PricingInfo;
  duration: number; // in minutes
  location: ServiceLocation;
  images: string[];
  tags: string[];
  isActive: boolean;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export type ServiceCategory = 'home_services' | 'personal_services' | 'food_services' | 'other';

export type ServiceLocation = 'at_customer' | 'at_provider' | 'remote' | 'flexible';

// Booking Types
export interface Booking {
  id: string;
  customerId: string;
  providerId: string;
  serviceId: string;
  status: BookingStatus;
  scheduledDate: Timestamp;
  duration: number;
  location: Address;
  notes?: string;
  totalAmount: number;
  commissionAmount: number;
  paymentStatus: PaymentStatus;
  paymentIntentId?: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export type BookingStatus = 'pending' | 'confirmed' | 'in_progress' | 'completed' | 'cancelled';
export type PaymentStatus = 'pending' | 'paid' | 'failed' | 'refunded';

// Review Types
export interface Review {
  id: string;
  bookingId: string;
  customerId: string;
  providerId: string;
  rating: number; // 1-5
  comment: string;
  images?: string[];
  status: ReviewStatus;
  moderatedBy?: string;
  moderatedAt?: Timestamp;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export type ReviewStatus = 'pending' | 'approved' | 'rejected' | 'flagged';

// Message Types
export interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  content: string;
  type: 'text' | 'image' | 'file';
  isRead: boolean;
  isDeleted?: boolean;
  createdAt: Timestamp;
  updatedAt?: Timestamp;
}

export interface Conversation {
  id: string;
  participants: string[];
  bookingId?: string;
  lastMessage?: string;
  lastMessageAt?: Timestamp;
  unreadCount: Record<string, number>;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export type MessageType = 'text' | 'image' | 'file' | 'system';

// Notification Types
export interface Notification {
  id: string;
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  data?: Record<string, any>;
  status: NotificationStatus;
  pushEnabled: boolean;
  emailEnabled: boolean;
  readAt?: Timestamp;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export type NotificationType =
  | 'booking_request'
  | 'booking_confirmed'
  | 'booking_cancelled'
  | 'booking_completed'
  | 'review_received'
  | 'new_message'
  | 'payment_received'
  | 'payment_failed'
  | 'payout_processed'
  | 'system_update'
  | 'promotion';

export type NotificationStatus = 'unread' | 'read' | 'archived';

// Calendar Types
export interface CalendarEvent {
  id: string;
  title: string;
  description?: string;
  startTime: Date;
  endTime: Date;
  type: 'booking' | 'blocked' | 'personal';
  bookingId?: string;
  customerId?: string;
  providerId?: string;
  location?: string;
  status: 'confirmed' | 'pending' | 'cancelled';
  recurrence?: RecurrencePattern;
  reminders?: ReminderSettings[];
}

export interface AvailabilitySlot {
  date: Date;
  timeSlots: TimeSlot[];
  isAvailable: boolean;
}

export interface TimeSlot {
  startTime: string; // HH:MM format
  endTime: string; // HH:MM format
  isAvailable: boolean;
  isBooked: boolean;
  bookingId?: string;
}

export interface RecurrencePattern {
  type: 'daily' | 'weekly' | 'monthly' | 'yearly';
  interval: number;
  daysOfWeek?: number[]; // 0-6, Sunday-Saturday
  endDate?: Date;
  occurrences?: number;
}

export interface ReminderSettings {
  type: 'email' | 'sms' | 'push';
  minutesBefore: number;
}

// Search Types
export interface SearchFilters {
  category?: ServiceCategory;
  subcategory?: string;
  location?: {
    lat: number;
    lng: number;
    radius: number; // in kilometers
  };
  priceRange?: {
    min: number;
    max: number;
  };
  rating?: number;
  availability?: {
    date: string;
    timeSlot?: TimeSlot;
  };
  sortBy?: 'relevance' | 'price_low' | 'price_high' | 'rating' | 'distance';
}

export interface SearchResult {
  services: Service[];
  providers: ServiceProvider[];
  totalCount: number;
  hasMore: boolean;
}

// Analytics Types
export interface Analytics {
  totalBookings: number;
  totalRevenue: number;
  averageRating: number;
  topServices: string[];
  monthlyStats: MonthlyStats[];
}

export interface MonthlyStats {
  month: string;
  bookings: number;
  revenue: number;
  newCustomers: number;
  newProviders: number;
}



// API Response Types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

// Form Types
export interface LoginForm {
  email: string;
  password: string;
}

export interface RegisterForm {
  email: string;
  password: string;
  confirmPassword: string;
  displayName: string;
  role: UserRole;
  phoneNumber?: string;
}

export interface ServiceForm {
  title: string;
  description: string;
  category: ServiceCategory;
  subcategory: string;
  pricing: PricingInfo;
  duration: number;
  location: ServiceLocation;
  tags: string[];
}

export interface BookingForm {
  serviceId: string;
  scheduledDate: Date;
  duration: number;
  location: Address;
  notes?: string;
}
