# LocalLink API Documentation

## Base URL
- **Development**: `http://localhost:3000/api`
- **Production**: `https://yourdomain.com/api`

## Authentication

All protected endpoints require a valid Firebase JWT token in the Authorization header:

```
Authorization: Bearer <firebase_jwt_token>
```

## Response Format

All API responses follow this format:

```json
{
  "success": true,
  "data": {},
  "message": "Success message",
  "error": null
}
```

Error responses:

```json
{
  "success": false,
  "data": null,
  "message": "Error message",
  "error": {
    "code": "ERROR_CODE",
    "details": "Detailed error information"
  }
}
```

## Endpoints

### Authentication

#### POST /api/auth/register
Register a new user account.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "password123",
  "displayName": "John Doe",
  "role": "customer",
  "businessName": "Business Name (for service providers)"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "user_id",
      "email": "user@example.com",
      "displayName": "John Doe",
      "role": "customer"
    },
    "token": "firebase_jwt_token"
  }
}
```

#### POST /api/auth/login
Authenticate user and get access token.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

#### POST /api/auth/logout
Logout user and invalidate token.

#### POST /api/auth/forgot-password
Send password reset email.

**Request Body:**
```json
{
  "email": "user@example.com"
}
```

### Services

#### GET /api/services
Get list of services with optional filtering.

**Query Parameters:**
- `category` (string): Filter by category
- `subcategory` (string): Filter by subcategory
- `location` (string): Filter by location
- `minPrice` (number): Minimum price filter
- `maxPrice` (number): Maximum price filter
- `rating` (number): Minimum rating filter
- `search` (string): Search in title and description
- `page` (number): Page number (default: 1)
- `limit` (number): Items per page (default: 20)

**Response:**
```json
{
  "success": true,
  "data": {
    "services": [
      {
        "id": "service_id",
        "title": "House Cleaning",
        "description": "Professional house cleaning service",
        "category": "Home Services",
        "subcategory": "Cleaning",
        "providerId": "provider_id",
        "price": 100,
        "priceUnit": "hour",
        "duration": 2,
        "location": {
          "address": "123 Main St",
          "city": "New York",
          "state": "NY",
          "zipCode": "10001"
        },
        "rating": 4.8,
        "reviewCount": 25,
        "images": ["image1.jpg", "image2.jpg"],
        "isActive": true,
        "createdAt": "2024-01-01T00:00:00Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 100,
      "pages": 5
    }
  }
}
```

#### GET /api/services/:id
Get service details by ID.

#### POST /api/services
Create a new service (Service Provider only).

**Request Body:**
```json
{
  "title": "House Cleaning",
  "description": "Professional house cleaning service",
  "category": "Home Services",
  "subcategory": "Cleaning",
  "price": 100,
  "priceUnit": "hour",
  "duration": 2,
  "location": {
    "address": "123 Main St",
    "city": "New York",
    "state": "NY",
    "zipCode": "10001"
  },
  "serviceArea": 10,
  "images": ["image1.jpg", "image2.jpg"],
  "tags": ["cleaning", "professional"]
}
```

#### PUT /api/services/:id
Update service (Service Provider only).

#### DELETE /api/services/:id
Delete service (Service Provider only).

### Bookings

#### GET /api/bookings
Get user's bookings.

**Query Parameters:**
- `status` (string): Filter by status
- `startDate` (string): Filter by start date
- `endDate` (string): Filter by end date

#### POST /api/bookings
Create a new booking.

**Request Body:**
```json
{
  "serviceId": "service_id",
  "providerId": "provider_id",
  "scheduledDate": "2024-01-15T10:00:00Z",
  "duration": 2,
  "location": {
    "address": "456 Oak Ave",
    "city": "New York",
    "state": "NY",
    "zipCode": "10002"
  },
  "notes": "Special instructions",
  "totalAmount": 200
}
```

#### PUT /api/bookings/:id
Update booking status.

**Request Body:**
```json
{
  "status": "confirmed",
  "notes": "Updated notes"
}
```

### Reviews

#### GET /api/reviews
Get reviews for a service or provider.

**Query Parameters:**
- `serviceId` (string): Get reviews for specific service
- `providerId` (string): Get reviews for specific provider

#### POST /api/reviews
Create a new review.

**Request Body:**
```json
{
  "bookingId": "booking_id",
  "serviceId": "service_id",
  "providerId": "provider_id",
  "rating": 5,
  "comment": "Excellent service!",
  "images": ["review_image.jpg"]
}
```

### Messages

#### GET /api/messages/conversations
Get user's conversations.

#### GET /api/messages/conversations/:id
Get messages in a conversation.

#### POST /api/messages
Send a new message.

**Request Body:**
```json
{
  "conversationId": "conversation_id",
  "content": "Hello, I have a question about your service",
  "type": "text"
}
```

### Payments

#### POST /api/payments/create-intent
Create payment intent for booking.

**Request Body:**
```json
{
  "bookingId": "booking_id",
  "amount": 20000,
  "currency": "usd"
}
```

#### POST /api/payments/confirm
Confirm payment.

**Request Body:**
```json
{
  "paymentIntentId": "pi_xxx",
  "paymentMethodId": "pm_xxx"
}
```

### Admin (Admin only)

#### GET /api/admin/users
Get all users with filtering options.

#### PUT /api/admin/users/:id
Update user status or role.

#### GET /api/admin/analytics
Get platform analytics data.

#### GET /api/admin/reports
Generate and download reports.

## Error Codes

- `AUTH_REQUIRED` - Authentication required
- `INVALID_TOKEN` - Invalid or expired token
- `FORBIDDEN` - Insufficient permissions
- `NOT_FOUND` - Resource not found
- `VALIDATION_ERROR` - Request validation failed
- `RATE_LIMIT_EXCEEDED` - Too many requests
- `INTERNAL_ERROR` - Internal server error

## Rate Limiting

API endpoints are rate limited:
- **Authenticated users**: 1000 requests per hour
- **Unauthenticated users**: 100 requests per hour
- **Admin endpoints**: 5000 requests per hour

Rate limit headers are included in responses:
```
X-RateLimit-Limit: 1000
X-RateLimit-Remaining: 999
X-RateLimit-Reset: 1640995200
```

## Webhooks

### Stripe Webhooks

#### POST /api/webhooks/stripe
Handle Stripe webhook events.

**Events:**
- `payment_intent.succeeded`
- `payment_intent.payment_failed`
- `invoice.payment_succeeded`

## SDKs and Libraries

### JavaScript/TypeScript
```bash
npm install @locallink/api-client
```

```javascript
import { LocalLinkAPI } from '@locallink/api-client';

const api = new LocalLinkAPI({
  baseURL: 'https://yourdomain.com/api',
  token: 'your_jwt_token'
});

const services = await api.services.list({
  category: 'Home Services',
  location: 'New York, NY'
});
```

## Testing

Use the following test credentials for development:

**Customer Account:**
- Email: `customer@test.com`
- Password: `test123`

**Service Provider Account:**
- Email: `provider@test.com`
- Password: `test123`

**Admin Account:**
- Email: `admin@test.com`
- Password: `test123`

## Support

For API support, contact:
- Email: api-support@yourdomain.com
- Documentation: https://docs.yourdomain.com
- Status Page: https://status.yourdomain.com
