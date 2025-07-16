#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('🚀 LocalLink Pre-Deployment Checklist\n');

const checks = [];

// Check if required files exist
const requiredFiles = [
  'package.json',
  'next.config.ts',
  'vercel.json',
  '.env.example',
  'src/app/layout.tsx',
  'src/lib/firebase.ts',
];

console.log('📁 Checking required files...');
requiredFiles.forEach(file => {
  const exists = fs.existsSync(path.join(__dirname, '..', file));
  checks.push({ name: `${file} exists`, passed: exists });
  console.log(`${exists ? '✅' : '❌'} ${file}`);
});

// Check package.json scripts
console.log('\n📦 Checking package.json scripts...');
const packageJson = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'package.json'), 'utf8'));
const requiredScripts = ['build', 'start', 'lint'];

requiredScripts.forEach(script => {
  const exists = packageJson.scripts && packageJson.scripts[script];
  checks.push({ name: `${script} script exists`, passed: exists });
  console.log(`${exists ? '✅' : '❌'} ${script} script`);
});

// Check dependencies
console.log('\n📚 Checking critical dependencies...');
const criticalDeps = [
  'next',
  'react',
  'react-dom',
  'firebase',
  'tailwindcss',
  '@stripe/stripe-js',
  'stripe'
];

criticalDeps.forEach(dep => {
  const exists = packageJson.dependencies && packageJson.dependencies[dep];
  checks.push({ name: `${dep} dependency`, passed: exists });
  console.log(`${exists ? '✅' : '❌'} ${dep}`);
});

// Check environment variables template
console.log('\n🔐 Checking environment variables template...');
try {
  const envExample = fs.readFileSync(path.join(__dirname, '..', '.env.example'), 'utf8');
  const requiredEnvVars = [
    'NEXT_PUBLIC_FIREBASE_API_KEY',
    'NEXT_PUBLIC_FIREBASE_PROJECT_ID',
    'NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY',
    'STRIPE_SECRET_KEY',
    'NEXT_PUBLIC_APP_URL'
  ];

  requiredEnvVars.forEach(envVar => {
    const exists = envExample.includes(envVar);
    checks.push({ name: `${envVar} in .env.example`, passed: exists });
    console.log(`${exists ? '✅' : '❌'} ${envVar}`);
  });
} catch (error) {
  console.log('❌ .env.example file not readable');
  checks.push({ name: '.env.example readable', passed: false });
}

// Check API routes
console.log('\n🔌 Checking API routes...');
const apiRoutes = [
  'src/app/api/auth/profile/route.ts',
  'src/app/api/services/route.ts',
  'src/app/api/bookings/route.ts',
  'src/app/api/payments/create-intent/route.ts',
  'src/app/api/sitemap/route.ts',
  'src/app/api/robots/route.ts'
];

apiRoutes.forEach(route => {
  const exists = fs.existsSync(path.join(__dirname, '..', route));
  checks.push({ name: `API route ${route}`, passed: exists });
  console.log(`${exists ? '✅' : '❌'} ${route}`);
});

// Check Vercel configuration
console.log('\n⚡ Checking Vercel configuration...');
try {
  const vercelConfig = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'vercel.json'), 'utf8'));
  
  const hasEnvVars = vercelConfig.env && Object.keys(vercelConfig.env).length > 0;
  checks.push({ name: 'Vercel env vars configured', passed: hasEnvVars });
  console.log(`${hasEnvVars ? '✅' : '❌'} Environment variables in vercel.json`);
  
  const hasFunctions = vercelConfig.functions;
  checks.push({ name: 'Vercel functions configured', passed: hasFunctions });
  console.log(`${hasFunctions ? '✅' : '❌'} Functions configuration`);
  
  const hasHeaders = vercelConfig.headers && vercelConfig.headers.length > 0;
  checks.push({ name: 'Security headers configured', passed: hasHeaders });
  console.log(`${hasHeaders ? '✅' : '❌'} Security headers`);
} catch (error) {
  console.log('❌ vercel.json not readable or invalid JSON');
  checks.push({ name: 'vercel.json valid', passed: false });
}

// Check Next.js configuration
console.log('\n⚙️ Checking Next.js configuration...');
try {
  // Since it's a .ts file, we'll just check if it exists and has basic content
  const nextConfig = fs.readFileSync(path.join(__dirname, '..', 'next.config.ts'), 'utf8');
  
  const hasImageConfig = nextConfig.includes('images:');
  checks.push({ name: 'Image optimization configured', passed: hasImageConfig });
  console.log(`${hasImageConfig ? '✅' : '❌'} Image optimization`);
  
  const hasExperimental = nextConfig.includes('experimental:');
  checks.push({ name: 'Experimental features configured', passed: hasExperimental });
  console.log(`${hasExperimental ? '✅' : '❌'} Experimental features`);
} catch (error) {
  console.log('❌ next.config.ts not readable');
  checks.push({ name: 'next.config.ts readable', passed: false });
}

// Summary
console.log('\n📊 Summary:');
const passed = checks.filter(check => check.passed).length;
const total = checks.length;
const percentage = Math.round((passed / total) * 100);

console.log(`${passed}/${total} checks passed (${percentage}%)`);

if (percentage === 100) {
  console.log('\n🎉 All checks passed! Your project is ready for Vercel deployment.');
  console.log('\nNext steps:');
  console.log('1. Set up Firebase project and get configuration keys');
  console.log('2. Set up Stripe account and get API keys');
  console.log('3. Run: vercel --prod');
  console.log('4. Configure environment variables in Vercel dashboard');
  console.log('5. Update Firebase authorized domains');
} else if (percentage >= 80) {
  console.log('\n⚠️ Most checks passed, but some issues need attention.');
  console.log('\nFailed checks:');
  checks.filter(check => !check.passed).forEach(check => {
    console.log(`❌ ${check.name}`);
  });
} else {
  console.log('\n❌ Several critical issues found. Please fix before deploying.');
  console.log('\nFailed checks:');
  checks.filter(check => !check.passed).forEach(check => {
    console.log(`❌ ${check.name}`);
  });
}

console.log('\n📖 For detailed deployment instructions, see VERCEL_DEPLOYMENT.md');

process.exit(percentage === 100 ? 0 : 1);
