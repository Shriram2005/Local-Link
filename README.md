# LocalLink - Local Services Marketplace

A comprehensive platform connecting customers with local service providers, built with Next.js 15, Firebase, and TypeScript.

## 🚀 Features

### Core Platform Features
- **Multi-role Authentication** - Customers, Service Providers, and Admins
- **Service Discovery** - Advanced search with location-based filtering
- **Real-time Booking System** - Calendar integration and instant confirmations
- **Payment Processing** - Stripe integration with commission handling
- **Review & Rating System** - Comprehensive feedback with moderation
- **Real-time Messaging** - In-app communication between users
- **Admin Dashboard** - Complete platform management and analytics

### Advanced Features
- **PWA Support** - Offline functionality and app-like experience
- **Notification System** - Email and push notifications
- **Referral Program** - Built-in affiliate system
- **Calendar Integration** - External calendar sync (Google, Outlook, Apple)
- **Analytics & Reporting** - Comprehensive business insights
- **SEO Optimized** - Blog system and structured data
- **Mobile Responsive** - Optimized for all devices

## 🛠 Tech Stack

- **Frontend**: Next.js 15, React 18, TypeScript
- **Styling**: Tailwind CSS, Lucide Icons
- **Backend**: Firebase (Auth, Firestore, Storage, Functions)
- **Payments**: Stripe
- **Maps**: Google Maps API
- **Testing**: Jest, React Testing Library
- **Deployment**: Vercel (recommended)

## 📋 Prerequisites

- Node.js 18+
- npm or yarn
- Firebase account
- Stripe account
- Google Maps API key

## 🚀 Quick Start

### 1. Install Dependencies
```bash
npm install
# or
yarn install
```

### 2. Environment Setup
Create a `.env.local` file in the root directory:

```env
# Firebase Configuration
NEXT_PUBLIC_FIREBASE_API_KEY=your_firebase_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id

# Stripe Configuration
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_SECRET_KEY=sk_test_...

# Google Maps API
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your_google_maps_key

# App Configuration
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 3. Run Development Server
```bash
npm run dev
# or
yarn dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## 📁 Project Structure

```
locallink/
├── src/
│   ├── app/                    # Next.js App Router pages
│   ├── components/            # Reusable components
│   ├── contexts/              # React contexts
│   ├── services/              # Business logic services
│   ├── types/                 # TypeScript type definitions
│   └── utils/                 # Utility functions
├── public/                    # Static assets
└── __tests__/                 # Test files
```

## 🧪 Testing

```bash
npm run test
npm run test:coverage
```

## 🚀 Deployment

Deploy to Vercel:
1. Connect GitHub repository
2. Add environment variables
3. Deploy automatically

Built with ❤️ by the LocalLink team
