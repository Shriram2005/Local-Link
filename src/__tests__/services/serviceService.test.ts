import { ServiceService } from '@/services/serviceService';
import { Service } from '@/types';

// Mock Firebase
jest.mock('@/lib/firebase', () => ({
  db: {},
  collection: jest.fn(),
  doc: jest.fn(),
  addDoc: jest.fn(),
  updateDoc: jest.fn(),
  deleteDoc: jest.fn(),
  getDocs: jest.fn(),
  getDoc: jest.fn(),
  query: jest.fn(),
  where: jest.fn(),
  orderBy: jest.fn(),
  limit: jest.fn(),
  Timestamp: {
    now: jest.fn(() => ({ toDate: () => new Date() })),
  },
}));

describe('ServiceService', () => {
  const mockService: Omit<Service, 'id' | 'createdAt' | 'updatedAt'> = {
    title: 'Test Service',
    description: 'Test service description',
    category: 'Home Services',
    subcategory: 'Cleaning',
    providerId: 'provider-123',
    price: 100,
    priceUnit: 'hour',
    duration: 2,
    location: {
      address: '123 Test St',
      city: 'Test City',
      state: 'TS',
      zipCode: '12345',
      coordinates: { lat: 40.7128, lng: -74.0060 },
    },
    serviceArea: 10,
    images: ['image1.jpg', 'image2.jpg'],
    tags: ['cleaning', 'professional'],
    isActive: true,
    rating: 0,
    reviewCount: 0,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('createService', () => {
    it('creates a service successfully', async () => {
      const mockDocRef = { id: 'service-123' };
      const { addDoc } = require('@/lib/firebase');
      addDoc.mockResolvedValue(mockDocRef);

      const serviceId = await ServiceService.createService(mockService);

      expect(serviceId).toBe('service-123');
      expect(addDoc).toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining({
          ...mockService,
          createdAt: expect.anything(),
          updatedAt: expect.anything(),
        })
      );
    });

    it('throws error when database is not initialized', async () => {
      const originalDb = require('@/lib/firebase').db;
      require('@/lib/firebase').db = null;

      await expect(ServiceService.createService(mockService))
        .rejects.toThrow('Database not initialized');

      require('@/lib/firebase').db = originalDb;
    });

    it('handles Firebase errors', async () => {
      const { addDoc } = require('@/lib/firebase');
      addDoc.mockRejectedValue(new Error('Firebase error'));

      await expect(ServiceService.createService(mockService))
        .rejects.toThrow('Firebase error');
    });
  });

  describe('getService', () => {
    it('retrieves a service successfully', async () => {
      const mockServiceData = {
        ...mockService,
        id: 'service-123',
        createdAt: { toDate: () => new Date() },
        updatedAt: { toDate: () => new Date() },
      };

      const { getDoc } = require('@/lib/firebase');
      getDoc.mockResolvedValue({
        exists: () => true,
        id: 'service-123',
        data: () => mockServiceData,
      });

      const service = await ServiceService.getService('service-123');

      expect(service).toEqual({
        id: 'service-123',
        ...mockServiceData,
      });
    });

    it('returns null for non-existent service', async () => {
      const { getDoc } = require('@/lib/firebase');
      getDoc.mockResolvedValue({
        exists: () => false,
      });

      const service = await ServiceService.getService('non-existent');

      expect(service).toBeNull();
    });
  });

  describe('updateService', () => {
    it('updates a service successfully', async () => {
      const { updateDoc } = require('@/lib/firebase');
      updateDoc.mockResolvedValue(undefined);

      const updates = { title: 'Updated Service Title' };
      await ServiceService.updateService('service-123', updates);

      expect(updateDoc).toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining({
          ...updates,
          updatedAt: expect.anything(),
        })
      );
    });
  });

  describe('deleteService', () => {
    it('deletes a service successfully', async () => {
      const { deleteDoc } = require('@/lib/firebase');
      deleteDoc.mockResolvedValue(undefined);

      await ServiceService.deleteService('service-123');

      expect(deleteDoc).toHaveBeenCalled();
    });
  });

  describe('searchServices', () => {
    it('searches services with filters', async () => {
      const mockServices = [
        { id: 'service-1', ...mockService },
        { id: 'service-2', ...mockService, title: 'Another Service' },
      ];

      const { getDocs } = require('@/lib/firebase');
      getDocs.mockResolvedValue({
        forEach: (callback: any) => {
          mockServices.forEach((service, index) => {
            callback({
              id: service.id,
              data: () => service,
            });
          });
        },
      });

      const filters = {
        category: 'Home Services',
        minPrice: 50,
        maxPrice: 150,
      };

      const results = await ServiceService.searchServices(filters);

      expect(results).toHaveLength(2);
      expect(results[0]).toEqual(expect.objectContaining({
        id: 'service-1',
        title: 'Test Service',
      }));
    });

    it('handles empty search results', async () => {
      const { getDocs } = require('@/lib/firebase');
      getDocs.mockResolvedValue({
        forEach: (callback: any) => {
          // No services
        },
      });

      const results = await ServiceService.searchServices({});

      expect(results).toHaveLength(0);
    });
  });

  describe('getProviderServices', () => {
    it('retrieves services for a provider', async () => {
      const mockServices = [
        { id: 'service-1', ...mockService },
        { id: 'service-2', ...mockService, title: 'Another Service' },
      ];

      const { getDocs } = require('@/lib/firebase');
      getDocs.mockResolvedValue({
        forEach: (callback: any) => {
          mockServices.forEach((service) => {
            callback({
              id: service.id,
              data: () => service,
            });
          });
        },
      });

      const services = await ServiceService.getProviderServices('provider-123');

      expect(services).toHaveLength(2);
      expect(services[0].providerId).toBe('provider-123');
    });
  });

  describe('toggleServiceStatus', () => {
    it('toggles service active status', async () => {
      const { getDoc, updateDoc } = require('@/lib/firebase');
      
      getDoc.mockResolvedValue({
        exists: () => true,
        data: () => ({ ...mockService, isActive: true }),
      });
      
      updateDoc.mockResolvedValue(undefined);

      await ServiceService.toggleServiceStatus('service-123');

      expect(updateDoc).toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining({
          isActive: false,
          updatedAt: expect.anything(),
        })
      );
    });

    it('throws error for non-existent service', async () => {
      const { getDoc } = require('@/lib/firebase');
      getDoc.mockResolvedValue({
        exists: () => false,
      });

      await expect(ServiceService.toggleServiceStatus('non-existent'))
        .rejects.toThrow('Service not found');
    });
  });

  describe('getServicesByCategory', () => {
    it('retrieves services by category', async () => {
      const mockServices = [
        { id: 'service-1', ...mockService, category: 'Home Services' },
        { id: 'service-2', ...mockService, category: 'Home Services' },
      ];

      const { getDocs } = require('@/lib/firebase');
      getDocs.mockResolvedValue({
        forEach: (callback: any) => {
          mockServices.forEach((service) => {
            callback({
              id: service.id,
              data: () => service,
            });
          });
        },
      });

      const services = await ServiceService.getServicesByCategory('Home Services');

      expect(services).toHaveLength(2);
      expect(services.every(s => s.category === 'Home Services')).toBe(true);
    });
  });

  describe('updateServiceRating', () => {
    it('updates service rating and review count', async () => {
      const { updateDoc } = require('@/lib/firebase');
      updateDoc.mockResolvedValue(undefined);

      await ServiceService.updateServiceRating('service-123', 4.5, 10);

      expect(updateDoc).toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining({
          rating: 4.5,
          reviewCount: 10,
          updatedAt: expect.anything(),
        })
      );
    });
  });
});
