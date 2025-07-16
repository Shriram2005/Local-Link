# LocalLink Deployment Guide

This guide covers deploying LocalLink to various platforms and environments.

## Prerequisites

Before deploying, ensure you have:

- [ ] Firebase project set up
- [ ] Stripe account configured
- [ ] Google Maps API key
- [ ] Domain name (for production)
- [ ] SSL certificate (for production)

## Environment Variables

Create the following environment variables for your deployment:

### Required Variables

```env
# Firebase Configuration
NEXT_PUBLIC_FIREBASE_API_KEY=your_firebase_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id

# Stripe Configuration
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_...
STRIPE_SECRET_KEY=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Google Maps API
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your_google_maps_key

# App Configuration
NEXT_PUBLIC_APP_URL=https://yourdomain.com
NEXT_PUBLIC_APP_NAME=LocalLink

# Email Service
SENDGRID_API_KEY=your_sendgrid_key
FROM_EMAIL=noreply@yourdomain.com
```

### Optional Variables

```env
# Analytics
GOOGLE_ANALYTICS_ID=GA_MEASUREMENT_ID
HOTJAR_ID=your_hotjar_id

# Monitoring
SENTRY_DSN=your_sentry_dsn
SENTRY_ORG=your_sentry_org
SENTRY_PROJECT=your_sentry_project

# Redis (for caching)
REDIS_URL=redis://localhost:6379

# Database (if using additional DB)
DATABASE_URL=postgresql://user:password@localhost:5432/locallink
```

## Deployment Platforms

### 1. Vercel (Recommended)

Vercel provides the best experience for Next.js applications.

#### Step 1: Connect Repository
1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Click "New Project"
3. Import your GitHub repository
4. Select the `locallink` folder as root directory

#### Step 2: Configure Environment Variables
1. Go to Project Settings → Environment Variables
2. Add all required environment variables
3. Set different values for Preview and Production environments

#### Step 3: Configure Domains
1. Go to Project Settings → Domains
2. Add your custom domain
3. Configure DNS records as instructed

#### Step 4: Deploy
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy to preview
vercel

# Deploy to production
vercel --prod
```

### 2. Netlify

#### Step 1: Build Configuration
Create `netlify.toml`:

```toml
[build]
  command = "npm run build"
  publish = ".next"

[build.environment]
  NODE_VERSION = "18"

[[redirects]]
  from = "/api/*"
  to = "/.netlify/functions/:splat"
  status = 200

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

#### Step 2: Deploy
1. Connect GitHub repository to Netlify
2. Set build command: `npm run build`
3. Set publish directory: `.next`
4. Add environment variables
5. Deploy

### 3. AWS (Advanced)

#### Using AWS Amplify

1. **Install Amplify CLI**
```bash
npm install -g @aws-amplify/cli
amplify configure
```

2. **Initialize Amplify**
```bash
amplify init
```

3. **Add Hosting**
```bash
amplify add hosting
amplify publish
```

#### Using AWS ECS with Docker

1. **Build Docker Image**
```bash
docker build -t locallink .
```

2. **Push to ECR**
```bash
aws ecr get-login-password --region us-east-1 | docker login --username AWS --password-stdin 123456789012.dkr.ecr.us-east-1.amazonaws.com
docker tag locallink:latest 123456789012.dkr.ecr.us-east-1.amazonaws.com/locallink:latest
docker push 123456789012.dkr.ecr.us-east-1.amazonaws.com/locallink:latest
```

3. **Deploy to ECS**
Create ECS service with the Docker image.

### 4. Google Cloud Platform

#### Using Cloud Run

1. **Build and Deploy**
```bash
gcloud builds submit --tag gcr.io/PROJECT_ID/locallink
gcloud run deploy --image gcr.io/PROJECT_ID/locallink --platform managed
```

2. **Set Environment Variables**
```bash
gcloud run services update locallink \
  --set-env-vars="NEXT_PUBLIC_FIREBASE_API_KEY=your_key" \
  --platform managed
```

### 5. Self-Hosted (VPS/Dedicated Server)

#### Using PM2

1. **Install Dependencies**
```bash
# Install Node.js 18+
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install PM2
npm install -g pm2
```

2. **Deploy Application**
```bash
# Clone repository
git clone https://github.com/your-username/locallink.git
cd locallink

# Install dependencies
npm install

# Build application
npm run build

# Start with PM2
pm2 start ecosystem.config.js
```

3. **Configure Nginx**
```nginx
server {
    listen 80;
    server_name yourdomain.com;
    
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

## Database Setup

### Firebase Firestore

1. **Create Firestore Database**
   - Go to Firebase Console
   - Select your project
   - Go to Firestore Database
   - Create database in production mode

2. **Set Security Rules**
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users can read/write their own profile
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Services are readable by all, writable by owner
    match /services/{serviceId} {
      allow read: if true;
      allow write: if request.auth != null && 
        request.auth.uid == resource.data.providerId;
    }
    
    // Bookings are private to participants
    match /bookings/{bookingId} {
      allow read, write: if request.auth != null && 
        (request.auth.uid == resource.data.customerId || 
         request.auth.uid == resource.data.providerId);
    }
    
    // Reviews are readable by all, writable by booking customer
    match /reviews/{reviewId} {
      allow read: if true;
      allow write: if request.auth != null && 
        request.auth.uid == resource.data.customerId;
    }
    
    // Messages are private to conversation participants
    match /messages/{messageId} {
      allow read, write: if request.auth != null && 
        request.auth.uid in resource.data.participants;
    }
    
    // Admin-only collections
    match /analytics/{document=**} {
      allow read, write: if request.auth != null && 
        get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin';
    }
  }
}
```

3. **Create Indexes**
```javascript
// Composite indexes needed for queries
// These will be automatically suggested by Firestore when you run queries
```

## Payment Setup

### Stripe Configuration

1. **Create Stripe Account**
   - Go to [Stripe Dashboard](https://dashboard.stripe.com)
   - Complete account setup
   - Get API keys from Developers → API keys

2. **Configure Webhooks**
   - Go to Developers → Webhooks
   - Add endpoint: `https://yourdomain.com/api/webhooks/stripe`
   - Select events:
     - `payment_intent.succeeded`
     - `payment_intent.payment_failed`
     - `invoice.payment_succeeded`

3. **Test Payments**
   Use test card numbers:
   - Success: `4242424242424242`
   - Decline: `4000000000000002`

## Monitoring and Analytics

### 1. Application Monitoring

#### Sentry (Error Tracking)
```bash
npm install @sentry/nextjs
```

Add to `next.config.js`:
```javascript
const { withSentryConfig } = require('@sentry/nextjs');

module.exports = withSentryConfig(
  {
    // Your Next.js config
  },
  {
    silent: true,
    org: "your-org",
    project: "locallink",
  }
);
```

#### Vercel Analytics
```bash
npm install @vercel/analytics
```

### 2. Performance Monitoring

#### Google Analytics
Add to `_app.tsx`:
```javascript
import { Analytics } from '@vercel/analytics/react';

export default function App({ Component, pageProps }) {
  return (
    <>
      <Component {...pageProps} />
      <Analytics />
    </>
  );
}
```

### 3. Uptime Monitoring

Set up monitoring with:
- [Pingdom](https://pingdom.com)
- [UptimeRobot](https://uptimerobot.com)
- [StatusPage](https://statuspage.io)

## Security Checklist

- [ ] HTTPS enabled with valid SSL certificate
- [ ] Environment variables secured
- [ ] Firebase security rules configured
- [ ] API rate limiting enabled
- [ ] CORS properly configured
- [ ] Content Security Policy (CSP) headers
- [ ] Regular security updates
- [ ] Backup strategy implemented

## Performance Optimization

### 1. Caching Strategy

#### Redis Setup
```bash
# Install Redis
sudo apt install redis-server

# Configure Redis
sudo systemctl enable redis-server
sudo systemctl start redis-server
```

#### Next.js Caching
```javascript
// next.config.js
module.exports = {
  experimental: {
    isrRevalidate: 60, // ISR revalidation
  },
  images: {
    domains: ['your-domain.com'],
    formats: ['image/webp', 'image/avif'],
  },
};
```

### 2. CDN Configuration

#### Cloudflare Setup
1. Add your domain to Cloudflare
2. Update nameservers
3. Enable caching rules
4. Configure page rules

### 3. Database Optimization

#### Firestore Optimization
- Create composite indexes for complex queries
- Use pagination for large datasets
- Implement proper data structure
- Use subcollections for related data

## Backup and Recovery

### 1. Database Backup

#### Firestore Export
```bash
gcloud firestore export gs://your-backup-bucket/firestore-backup
```

#### Automated Backups
Set up Cloud Scheduler to run exports daily.

### 2. Code Backup

- Use Git with multiple remotes
- Regular repository backups
- Tag releases for easy rollback

## Troubleshooting

### Common Issues

1. **Build Failures**
   - Check Node.js version compatibility
   - Verify environment variables
   - Clear `.next` cache

2. **Authentication Issues**
   - Verify Firebase configuration
   - Check domain whitelist
   - Validate JWT tokens

3. **Payment Issues**
   - Verify Stripe webhook endpoints
   - Check API key permissions
   - Test with Stripe CLI

### Logs and Debugging

#### Vercel Logs
```bash
vercel logs
```

#### PM2 Logs
```bash
pm2 logs locallink
```

#### Firebase Logs
Check Firebase Console → Functions → Logs

## Support

For deployment support:
- Email: devops@yourdomain.com
- Slack: #deployment-support
- Documentation: https://docs.yourdomain.com/deployment
