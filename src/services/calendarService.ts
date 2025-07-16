import { CalendarEvent, AvailabilitySlot, TimeSlot } from '@/types';

export class CalendarService {
  // Get provider availability for a date range
  static async getProviderAvailability(
    providerId: string,
    startDate: Date,
    endDate: Date
  ): Promise<AvailabilitySlot[]> {
    try {
      // Mock availability data for demo
      const mockAvailability: AvailabilitySlot[] = [];
      const currentDate = new Date(startDate);
      
      while (currentDate <= endDate) {
        const dayOfWeek = currentDate.getDay();
        
        // Skip Sundays for demo
        if (dayOfWeek !== 0) {
          // Generate time slots for each day
          const timeSlots: TimeSlot[] = [];
          
          // Morning slots (9 AM - 12 PM)
          for (let hour = 9; hour < 12; hour++) {
            timeSlots.push({
              startTime: `${hour.toString().padStart(2, '0')}:00`,
              endTime: `${hour + 1}:00`,
              isAvailable: Math.random() > 0.3, // 70% chance of being available
              isBooked: Math.random() < 0.2, // 20% chance of being booked
            });
          }
          
          // Afternoon slots (2 PM - 6 PM)
          for (let hour = 14; hour < 18; hour++) {
            timeSlots.push({
              startTime: `${hour.toString().padStart(2, '0')}:00`,
              endTime: `${hour + 1}:00`,
              isAvailable: Math.random() > 0.3,
              isBooked: Math.random() < 0.2,
            });
          }
          
          mockAvailability.push({
            date: new Date(currentDate),
            timeSlots,
            isAvailable: timeSlots.some(slot => slot.isAvailable),
          });
        }
        
        currentDate.setDate(currentDate.getDate() + 1);
      }
      
      return mockAvailability;
    } catch (error) {
      console.error('Error fetching provider availability:', error);
      return [];
    }
  }

  // Update provider availability
  static async updateProviderAvailability(
    providerId: string,
    availability: AvailabilitySlot[]
  ): Promise<boolean> {
    try {
      // In real app, would update Firestore
      console.log('Updating provider availability:', providerId, availability);
      return true;
    } catch (error) {
      console.error('Error updating provider availability:', error);
      return false;
    }
  }

  // Get calendar events for a user
  static async getCalendarEvents(
    userId: string,
    startDate: Date,
    endDate: Date
  ): Promise<CalendarEvent[]> {
    try {
      // Mock calendar events for demo
      const mockEvents: CalendarEvent[] = [
        {
          id: '1',
          title: 'House Cleaning - Sarah Johnson',
          description: 'Professional house cleaning service',
          startTime: new Date(Date.now() + 86400000), // Tomorrow
          endTime: new Date(Date.now() + 86400000 + 7200000), // Tomorrow + 2 hours
          type: 'booking',
          bookingId: 'booking1',
          customerId: 'customer1',
          providerId: userId,
          location: '123 Main St, City, State',
          status: 'confirmed',
        },
        {
          id: '2',
          title: 'Plumbing Repair - Mike Wilson',
          description: 'Kitchen sink repair',
          startTime: new Date(Date.now() + 172800000), // Day after tomorrow
          endTime: new Date(Date.now() + 172800000 + 3600000), // + 1 hour
          type: 'booking',
          bookingId: 'booking2',
          customerId: 'customer2',
          providerId: userId,
          location: '456 Oak Ave, City, State',
          status: 'confirmed',
        },
        {
          id: '3',
          title: 'Blocked Time',
          description: 'Personal appointment',
          startTime: new Date(Date.now() + 259200000), // 3 days from now
          endTime: new Date(Date.now() + 259200000 + 3600000), // + 1 hour
          type: 'blocked',
          status: 'confirmed',
        },
      ];
      
      return mockEvents.filter(event => 
        event.startTime >= startDate && event.startTime <= endDate
      );
    } catch (error) {
      console.error('Error fetching calendar events:', error);
      return [];
    }
  }

  // Create a calendar event
  static async createCalendarEvent(eventData: Omit<CalendarEvent, 'id'>): Promise<string> {
    try {
      // In real app, would create in Firestore and sync with external calendars
      console.log('Creating calendar event:', eventData);
      return `event-${Date.now()}`;
    } catch (error) {
      console.error('Error creating calendar event:', error);
      throw error;
    }
  }

  // Update a calendar event
  static async updateCalendarEvent(
    eventId: string,
    updates: Partial<CalendarEvent>
  ): Promise<boolean> {
    try {
      // In real app, would update Firestore and sync with external calendars
      console.log('Updating calendar event:', eventId, updates);
      return true;
    } catch (error) {
      console.error('Error updating calendar event:', error);
      return false;
    }
  }

  // Delete a calendar event
  static async deleteCalendarEvent(eventId: string): Promise<boolean> {
    try {
      // In real app, would delete from Firestore and sync with external calendars
      console.log('Deleting calendar event:', eventId);
      return true;
    } catch (error) {
      console.error('Error deleting calendar event:', error);
      return false;
    }
  }

  // Check for scheduling conflicts
  static async checkForConflicts(
    providerId: string,
    startTime: Date,
    endTime: Date,
    excludeEventId?: string
  ): Promise<CalendarEvent[]> {
    try {
      const events = await this.getCalendarEvents(
        providerId,
        new Date(startTime.getTime() - 86400000), // Check day before
        new Date(endTime.getTime() + 86400000) // Check day after
      );
      
      return events.filter(event => {
        if (excludeEventId && event.id === excludeEventId) return false;
        
        return (
          (startTime >= event.startTime && startTime < event.endTime) ||
          (endTime > event.startTime && endTime <= event.endTime) ||
          (startTime <= event.startTime && endTime >= event.endTime)
        );
      });
    } catch (error) {
      console.error('Error checking for conflicts:', error);
      return [];
    }
  }

  // Get next available time slot
  static async getNextAvailableSlot(
    providerId: string,
    duration: number, // in minutes
    preferredDate?: Date
  ): Promise<{ date: Date; startTime: string; endTime: string } | null> {
    try {
      const startDate = preferredDate || new Date();
      const endDate = new Date(startDate.getTime() + 30 * 86400000); // 30 days from start
      
      const availability = await this.getProviderAvailability(providerId, startDate, endDate);
      
      for (const dayAvailability of availability) {
        for (const slot of dayAvailability.timeSlots) {
          if (slot.isAvailable && !slot.isBooked) {
            const [startHour, startMinute] = slot.startTime.split(':').map(Number);
            const [endHour, endMinute] = slot.endTime.split(':').map(Number);
            
            const slotDuration = (endHour * 60 + endMinute) - (startHour * 60 + startMinute);
            
            if (slotDuration >= duration) {
              return {
                date: dayAvailability.date,
                startTime: slot.startTime,
                endTime: slot.endTime,
              };
            }
          }
        }
      }
      
      return null;
    } catch (error) {
      console.error('Error finding next available slot:', error);
      return null;
    }
  }

  // Sync with external calendar (Google Calendar, Outlook, etc.)
  static async syncWithExternalCalendar(
    userId: string,
    calendarType: 'google' | 'outlook' | 'apple',
    accessToken: string
  ): Promise<boolean> {
    try {
      // In real app, would integrate with calendar APIs
      console.log('Syncing with external calendar:', calendarType, userId);
      
      switch (calendarType) {
        case 'google':
          return await this.syncWithGoogleCalendar(userId, accessToken);
        case 'outlook':
          return await this.syncWithOutlookCalendar(userId, accessToken);
        case 'apple':
          return await this.syncWithAppleCalendar(userId, accessToken);
        default:
          return false;
      }
    } catch (error) {
      console.error('Error syncing with external calendar:', error);
      return false;
    }
  }

  // Google Calendar integration
  private static async syncWithGoogleCalendar(userId: string, accessToken: string): Promise<boolean> {
    try {
      // Mock Google Calendar API integration
      console.log('Syncing with Google Calendar for user:', userId);
      return true;
    } catch (error) {
      console.error('Error syncing with Google Calendar:', error);
      return false;
    }
  }

  // Outlook Calendar integration
  private static async syncWithOutlookCalendar(userId: string, accessToken: string): Promise<boolean> {
    try {
      // Mock Outlook Calendar API integration
      console.log('Syncing with Outlook Calendar for user:', userId);
      return true;
    } catch (error) {
      console.error('Error syncing with Outlook Calendar:', error);
      return false;
    }
  }

  // Apple Calendar integration
  private static async syncWithAppleCalendar(userId: string, accessToken: string): Promise<boolean> {
    try {
      // Mock Apple Calendar API integration
      console.log('Syncing with Apple Calendar for user:', userId);
      return true;
    } catch (error) {
      console.error('Error syncing with Apple Calendar:', error);
      return false;
    }
  }

  // Generate recurring availability
  static generateRecurringAvailability(
    startDate: Date,
    endDate: Date,
    pattern: {
      type: 'daily' | 'weekly' | 'monthly';
      interval: number; // every N days/weeks/months
      daysOfWeek?: number[]; // 0-6, Sunday-Saturday
      timeSlots: { startTime: string; endTime: string }[];
    }
  ): AvailabilitySlot[] {
    const availability: AvailabilitySlot[] = [];
    const currentDate = new Date(startDate);
    
    while (currentDate <= endDate) {
      let shouldInclude = false;
      
      switch (pattern.type) {
        case 'daily':
          shouldInclude = true;
          break;
        case 'weekly':
          shouldInclude = !pattern.daysOfWeek || pattern.daysOfWeek.includes(currentDate.getDay());
          break;
        case 'monthly':
          shouldInclude = currentDate.getDate() === startDate.getDate();
          break;
      }
      
      if (shouldInclude) {
        const timeSlots: TimeSlot[] = pattern.timeSlots.map(slot => ({
          ...slot,
          isAvailable: true,
          isBooked: false,
        }));
        
        availability.push({
          date: new Date(currentDate),
          timeSlots,
          isAvailable: true,
        });
      }
      
      // Increment date based on pattern
      switch (pattern.type) {
        case 'daily':
          currentDate.setDate(currentDate.getDate() + pattern.interval);
          break;
        case 'weekly':
          currentDate.setDate(currentDate.getDate() + 1);
          break;
        case 'monthly':
          currentDate.setMonth(currentDate.getMonth() + pattern.interval);
          break;
      }
    }
    
    return availability;
  }

  // Get calendar statistics
  static async getCalendarStats(userId: string): Promise<any> {
    try {
      const startDate = new Date();
      startDate.setDate(1); // First day of current month
      const endDate = new Date(startDate.getFullYear(), startDate.getMonth() + 1, 0); // Last day of current month
      
      const events = await this.getCalendarEvents(userId, startDate, endDate);
      
      return {
        totalEvents: events.length,
        bookings: events.filter(e => e.type === 'booking').length,
        blockedTime: events.filter(e => e.type === 'blocked').length,
        upcomingEvents: events.filter(e => e.startTime > new Date()).length,
        busyDays: new Set(events.map(e => e.startTime.toDateString())).size,
      };
    } catch (error) {
      console.error('Error getting calendar stats:', error);
      return {
        totalEvents: 0,
        bookings: 0,
        blockedTime: 0,
        upcomingEvents: 0,
        busyDays: 0,
      };
    }
  }
}
