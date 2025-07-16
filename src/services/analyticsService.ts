import { 
  collection, 
  doc, 
  getDocs, 
  query, 
  where, 
  orderBy, 
  limit,
  Timestamp,
  aggregateQuery,
  sum,
  count,
  average
} from 'firebase/firestore';
import { db } from '@/lib/firebase';

export interface AnalyticsData {
  userMetrics: UserMetrics;
  bookingMetrics: BookingMetrics;
  revenueMetrics: RevenueMetrics;
  performanceMetrics: PerformanceMetrics;
  geographicMetrics: GeographicMetrics;
}

export interface UserMetrics {
  totalUsers: number;
  newUsers: number;
  activeUsers: number;
  userGrowthRate: number;
  userRetentionRate: number;
  usersByRole: Record<string, number>;
  usersByLocation: Array<{ location: string; count: number }>;
  userRegistrationTrend: Array<{ date: string; count: number }>;
}

export interface BookingMetrics {
  totalBookings: number;
  completedBookings: number;
  cancelledBookings: number;
  averageBookingValue: number;
  bookingCompletionRate: number;
  bookingsByCategory: Array<{ category: string; count: number; revenue: number }>;
  bookingTrend: Array<{ date: string; count: number; revenue: number }>;
  popularServices: Array<{ service: string; bookings: number; rating: number }>;
}

export interface RevenueMetrics {
  totalRevenue: number;
  monthlyRevenue: number;
  revenueGrowthRate: number;
  averageOrderValue: number;
  platformCommission: number;
  providerEarnings: number;
  revenueByCategory: Array<{ category: string; revenue: number; percentage: number }>;
  monthlyRevenueTrend: Array<{ month: string; revenue: number; growth: number }>;
}

export interface PerformanceMetrics {
  averageResponseTime: number;
  serviceQualityScore: number;
  customerSatisfactionScore: number;
  providerRatings: Array<{ providerId: string; rating: number; reviewCount: number }>;
  topPerformingProviders: Array<{ name: string; rating: number; bookings: number; revenue: number }>;
  serviceCompletionTime: Array<{ category: string; averageTime: number }>;
}

export interface GeographicMetrics {
  servicesByLocation: Array<{ city: string; state: string; serviceCount: number; revenue: number }>;
  popularLocations: Array<{ location: string; bookings: number; providers: number }>;
  expansionOpportunities: Array<{ location: string; demand: number; supply: number; score: number }>;
}

export class AnalyticsService {
  // Get comprehensive analytics data
  static async getAnalyticsData(
    startDate: Date,
    endDate: Date,
    filters?: {
      category?: string;
      location?: string;
      providerId?: string;
    }
  ): Promise<AnalyticsData> {
    try {
      const [
        userMetrics,
        bookingMetrics,
        revenueMetrics,
        performanceMetrics,
        geographicMetrics
      ] = await Promise.all([
        this.getUserMetrics(startDate, endDate, filters),
        this.getBookingMetrics(startDate, endDate, filters),
        this.getRevenueMetrics(startDate, endDate, filters),
        this.getPerformanceMetrics(startDate, endDate, filters),
        this.getGeographicMetrics(startDate, endDate, filters)
      ]);

      return {
        userMetrics,
        bookingMetrics,
        revenueMetrics,
        performanceMetrics,
        geographicMetrics
      };
    } catch (error) {
      console.error('Error fetching analytics data:', error);
      throw error;
    }
  }

  // Get user metrics
  static async getUserMetrics(
    startDate: Date,
    endDate: Date,
    filters?: any
  ): Promise<UserMetrics> {
    // Mock data for demo - in real app would query Firestore
    return {
      totalUsers: 1234,
      newUsers: 156,
      activeUsers: 892,
      userGrowthRate: 12.5,
      userRetentionRate: 78.3,
      usersByRole: {
        customer: 778,
        service_provider: 456,
        admin: 5
      },
      usersByLocation: [
        { location: 'New York, NY', count: 234 },
        { location: 'Los Angeles, CA', count: 189 },
        { location: 'Chicago, IL', count: 156 },
        { location: 'Houston, TX', count: 134 },
        { location: 'Phoenix, AZ', count: 98 }
      ],
      userRegistrationTrend: this.generateTrendData(startDate, endDate, 'users')
    };
  }

  // Get booking metrics
  static async getBookingMetrics(
    startDate: Date,
    endDate: Date,
    filters?: any
  ): Promise<BookingMetrics> {
    // Mock data for demo
    return {
      totalBookings: 2890,
      completedBookings: 2234,
      cancelledBookings: 345,
      averageBookingValue: 89.50,
      bookingCompletionRate: 77.3,
      bookingsByCategory: [
        { category: 'Home Services', count: 1245, revenue: 78900 },
        { category: 'Personal Services', count: 890, revenue: 45600 },
        { category: 'Professional Services', count: 567, revenue: 34500 },
        { category: 'Automotive', count: 188, revenue: 12300 }
      ],
      bookingTrend: this.generateTrendData(startDate, endDate, 'bookings'),
      popularServices: [
        { service: 'House Cleaning', bookings: 456, rating: 4.8 },
        { service: 'Plumbing Repair', bookings: 234, rating: 4.6 },
        { service: 'Personal Training', bookings: 189, rating: 4.9 },
        { service: 'Lawn Care', bookings: 167, rating: 4.5 },
        { service: 'Pet Sitting', bookings: 145, rating: 4.7 }
      ]
    };
  }

  // Get revenue metrics
  static async getRevenueMetrics(
    startDate: Date,
    endDate: Date,
    filters?: any
  ): Promise<RevenueMetrics> {
    // Mock data for demo
    const totalRevenue = 145678.50;
    const platformCommission = totalRevenue * 0.05;
    
    return {
      totalRevenue,
      monthlyRevenue: 18234.56,
      revenueGrowthRate: 22.1,
      averageOrderValue: 89.50,
      platformCommission,
      providerEarnings: totalRevenue - platformCommission,
      revenueByCategory: [
        { category: 'Home Services', revenue: 78900, percentage: 54.2 },
        { category: 'Personal Services', revenue: 45600, percentage: 31.3 },
        { category: 'Professional Services', revenue: 34500, percentage: 23.7 },
        { category: 'Automotive', revenue: 12300, percentage: 8.4 }
      ],
      monthlyRevenueTrend: [
        { month: 'Jan', revenue: 12456.78, growth: 15.2 },
        { month: 'Feb', revenue: 13789.45, growth: 10.7 },
        { month: 'Mar', revenue: 15234.67, growth: 10.5 },
        { month: 'Apr', revenue: 14567.89, growth: -4.4 },
        { month: 'May', revenue: 16789.12, growth: 15.3 },
        { month: 'Jun', revenue: 18234.56, growth: 8.6 }
      ]
    };
  }

  // Get performance metrics
  static async getPerformanceMetrics(
    startDate: Date,
    endDate: Date,
    filters?: any
  ): Promise<PerformanceMetrics> {
    // Mock data for demo
    return {
      averageResponseTime: 2.3, // hours
      serviceQualityScore: 4.6,
      customerSatisfactionScore: 4.4,
      providerRatings: [
        { providerId: 'provider1', rating: 4.9, reviewCount: 45 },
        { providerId: 'provider2', rating: 4.8, reviewCount: 32 },
        { providerId: 'provider3', rating: 4.7, reviewCount: 28 }
      ],
      topPerformingProviders: [
        { name: 'CleanPro Services', rating: 4.9, bookings: 156, revenue: 8900 },
        { name: 'Expert Plumbing', rating: 4.8, bookings: 134, revenue: 7650 },
        { name: 'FitLife Training', rating: 4.9, bookings: 98, revenue: 5670 },
        { name: 'Green Thumb Gardens', rating: 4.7, bookings: 87, revenue: 4320 },
        { name: 'Tech Support Pro', rating: 4.6, bookings: 76, revenue: 3890 }
      ],
      serviceCompletionTime: [
        { category: 'Home Services', averageTime: 2.5 },
        { category: 'Personal Services', averageTime: 1.2 },
        { category: 'Professional Services', averageTime: 3.1 },
        { category: 'Automotive', averageTime: 1.8 }
      ]
    };
  }

  // Get geographic metrics
  static async getGeographicMetrics(
    startDate: Date,
    endDate: Date,
    filters?: any
  ): Promise<GeographicMetrics> {
    // Mock data for demo
    return {
      servicesByLocation: [
        { city: 'New York', state: 'NY', serviceCount: 234, revenue: 23400 },
        { city: 'Los Angeles', state: 'CA', serviceCount: 189, revenue: 18900 },
        { city: 'Chicago', state: 'IL', serviceCount: 156, revenue: 15600 },
        { city: 'Houston', state: 'TX', serviceCount: 134, revenue: 13400 },
        { city: 'Phoenix', state: 'AZ', serviceCount: 98, revenue: 9800 }
      ],
      popularLocations: [
        { location: 'Manhattan, NY', bookings: 456, providers: 89 },
        { location: 'Beverly Hills, CA', bookings: 234, providers: 45 },
        { location: 'Downtown Chicago, IL', bookings: 189, providers: 67 },
        { location: 'River Oaks, TX', bookings: 167, providers: 34 },
        { location: 'Scottsdale, AZ', bookings: 145, providers: 28 }
      ],
      expansionOpportunities: [
        { location: 'Austin, TX', demand: 89, supply: 23, score: 8.5 },
        { location: 'Seattle, WA', demand: 76, supply: 34, score: 7.8 },
        { location: 'Denver, CO', demand: 65, supply: 19, score: 7.2 },
        { location: 'Atlanta, GA', demand: 58, supply: 25, score: 6.9 },
        { location: 'Portland, OR', demand: 45, supply: 18, score: 6.5 }
      ]
    };
  }

  // Generate trend data for charts
  private static generateTrendData(
    startDate: Date,
    endDate: Date,
    type: 'users' | 'bookings' | 'revenue'
  ): Array<{ date: string; count?: number; revenue?: number }> {
    const data = [];
    const currentDate = new Date(startDate);
    
    while (currentDate <= endDate) {
      const baseValue = type === 'users' ? 15 : type === 'bookings' ? 45 : 2500;
      const randomVariation = Math.random() * 0.4 + 0.8; // 80% to 120% of base
      
      const entry: any = {
        date: currentDate.toISOString().split('T')[0]
      };
      
      if (type === 'revenue') {
        entry.revenue = Math.round(baseValue * randomVariation);
      } else {
        entry.count = Math.round(baseValue * randomVariation);
      }
      
      if (type === 'bookings') {
        entry.revenue = Math.round(entry.count * 89.50); // Average booking value
      }
      
      data.push(entry);
      currentDate.setDate(currentDate.getDate() + 1);
    }
    
    return data;
  }

  // Get real-time metrics
  static async getRealTimeMetrics(): Promise<{
    activeUsers: number;
    ongoingBookings: number;
    todayRevenue: number;
    systemHealth: 'healthy' | 'warning' | 'critical';
  }> {
    // Mock real-time data
    return {
      activeUsers: 234,
      ongoingBookings: 45,
      todayRevenue: 3456.78,
      systemHealth: 'healthy'
    };
  }

  // Get provider analytics
  static async getProviderAnalytics(providerId: string): Promise<{
    totalBookings: number;
    completedBookings: number;
    totalEarnings: number;
    averageRating: number;
    responseTime: number;
    completionRate: number;
    monthlyTrend: Array<{ month: string; bookings: number; earnings: number }>;
    topServices: Array<{ service: string; bookings: number; revenue: number }>;
  }> {
    // Mock provider-specific data
    return {
      totalBookings: 156,
      completedBookings: 142,
      totalEarnings: 8945.67,
      averageRating: 4.8,
      responseTime: 1.2, // hours
      completionRate: 91.0,
      monthlyTrend: [
        { month: 'Jan', bookings: 23, earnings: 1234.56 },
        { month: 'Feb', bookings: 28, earnings: 1456.78 },
        { month: 'Mar', bookings: 31, earnings: 1678.90 },
        { month: 'Apr', bookings: 26, earnings: 1345.67 },
        { month: 'May', bookings: 29, earnings: 1567.89 },
        { month: 'Jun', bookings: 19, earnings: 1661.87 }
      ],
      topServices: [
        { service: 'House Cleaning', bookings: 89, revenue: 5678.90 },
        { service: 'Deep Cleaning', bookings: 45, revenue: 2345.67 },
        { service: 'Office Cleaning', bookings: 22, revenue: 921.10 }
      ]
    };
  }

  // Export analytics data
  static async exportAnalyticsData(
    format: 'csv' | 'excel' | 'pdf',
    dataType: 'users' | 'bookings' | 'revenue' | 'all',
    startDate: Date,
    endDate: Date
  ): Promise<Blob> {
    try {
      const analyticsData = await this.getAnalyticsData(startDate, endDate);
      
      // In real app, would generate actual file
      const mockData = JSON.stringify(analyticsData, null, 2);
      return new Blob([mockData], { type: 'application/json' });
    } catch (error) {
      console.error('Error exporting analytics data:', error);
      throw error;
    }
  }

  // Get predictive analytics
  static async getPredictiveAnalytics(): Promise<{
    userGrowthPrediction: Array<{ month: string; predicted: number; confidence: number }>;
    revenueForecast: Array<{ month: string; predicted: number; confidence: number }>;
    demandPrediction: Array<{ category: string; predicted: number; trend: 'up' | 'down' | 'stable' }>;
    seasonalTrends: Array<{ period: string; factor: number; categories: string[] }>;
  }> {
    // Mock predictive data
    return {
      userGrowthPrediction: [
        { month: 'Jul', predicted: 1456, confidence: 85 },
        { month: 'Aug', predicted: 1623, confidence: 82 },
        { month: 'Sep', predicted: 1789, confidence: 78 },
        { month: 'Oct', predicted: 1934, confidence: 75 }
      ],
      revenueForecast: [
        { month: 'Jul', predicted: 19567.89, confidence: 88 },
        { month: 'Aug', predicted: 21234.56, confidence: 85 },
        { month: 'Sep', predicted: 23456.78, confidence: 81 },
        { month: 'Oct', predicted: 25678.90, confidence: 78 }
      ],
      demandPrediction: [
        { category: 'Home Services', predicted: 1567, trend: 'up' },
        { category: 'Personal Services', predicted: 1234, trend: 'stable' },
        { category: 'Professional Services', predicted: 890, trend: 'up' },
        { category: 'Automotive', predicted: 456, trend: 'down' }
      ],
      seasonalTrends: [
        { period: 'Summer', factor: 1.2, categories: ['Lawn Care', 'Pool Cleaning', 'AC Repair'] },
        { period: 'Fall', factor: 1.1, categories: ['House Cleaning', 'Gutter Cleaning'] },
        { period: 'Winter', factor: 0.9, categories: ['Snow Removal', 'Heating Repair'] },
        { period: 'Spring', factor: 1.3, categories: ['Landscaping', 'Home Renovation'] }
      ]
    };
  }
}
