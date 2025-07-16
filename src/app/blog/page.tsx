import React from 'react';
import Link from 'next/link';
import { Calendar, User, ArrowRight, Search } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import { formatDate } from '@/utils';

// Mock blog posts data
const blogPosts = [
  {
    id: '1',
    title: 'How to Choose the Right Home Cleaning Service',
    excerpt: 'Finding a reliable home cleaning service can be challenging. Here are the key factors to consider when making your choice.',
    content: 'Full article content here...',
    author: 'Sarah Johnson',
    authorImage: null,
    publishedAt: new Date('2024-01-15'),
    category: 'Home Services',
    tags: ['cleaning', 'home', 'tips'],
    image: '/images/blog/cleaning-service.jpg',
    readTime: '5 min read',
    featured: true,
  },
  {
    id: '2',
    title: '10 Essential Questions to Ask Your Plumber',
    excerpt: 'Before hiring a plumber, make sure you ask these important questions to ensure you get quality service at a fair price.',
    content: 'Full article content here...',
    author: 'Mike Wilson',
    authorImage: null,
    publishedAt: new Date('2024-01-12'),
    category: 'Home Maintenance',
    tags: ['plumbing', 'maintenance', 'tips'],
    image: '/images/blog/plumber-questions.jpg',
    readTime: '7 min read',
    featured: false,
  },
  {
    id: '3',
    title: 'The Benefits of Regular Lawn Care Maintenance',
    excerpt: 'Discover why consistent lawn care is essential for a healthy, beautiful yard and how professional services can help.',
    content: 'Full article content here...',
    author: 'David Green',
    authorImage: null,
    publishedAt: new Date('2024-01-10'),
    category: 'Landscaping',
    tags: ['lawn care', 'landscaping', 'maintenance'],
    image: '/images/blog/lawn-care.jpg',
    readTime: '6 min read',
    featured: false,
  },
  {
    id: '4',
    title: 'Personal Training vs. Gym Membership: Which is Right for You?',
    excerpt: 'Explore the pros and cons of personal training versus traditional gym memberships to make the best choice for your fitness goals.',
    content: 'Full article content here...',
    author: 'Lisa Garcia',
    authorImage: null,
    publishedAt: new Date('2024-01-08'),
    category: 'Fitness',
    tags: ['fitness', 'personal training', 'health'],
    image: '/images/blog/personal-training.jpg',
    readTime: '8 min read',
    featured: false,
  },
  {
    id: '5',
    title: 'Spring Cleaning Checklist: Room by Room Guide',
    excerpt: 'Get your home ready for spring with this comprehensive cleaning checklist that covers every room in your house.',
    content: 'Full article content here...',
    author: 'Emily Davis',
    authorImage: null,
    publishedAt: new Date('2024-01-05'),
    category: 'Home Services',
    tags: ['cleaning', 'spring', 'checklist'],
    image: '/images/blog/spring-cleaning.jpg',
    readTime: '10 min read',
    featured: true,
  },
  {
    id: '6',
    title: 'How to Prepare Your Home for Professional Cleaning',
    excerpt: 'Make the most of your professional cleaning service with these simple preparation tips that ensure better results.',
    content: 'Full article content here...',
    author: 'John Smith',
    authorImage: null,
    publishedAt: new Date('2024-01-03'),
    category: 'Home Services',
    tags: ['cleaning', 'preparation', 'tips'],
    image: '/images/blog/cleaning-prep.jpg',
    readTime: '4 min read',
    featured: false,
  },
];

const categories = [
  'All',
  'Home Services',
  'Home Maintenance',
  'Landscaping',
  'Fitness',
  'Personal Care',
  'Professional Services',
];

export default function BlogPage() {
  const [selectedCategory, setSelectedCategory] = React.useState('All');
  const [searchQuery, setSearchQuery] = React.useState('');

  const filteredPosts = blogPosts.filter(post => {
    const matchesCategory = selectedCategory === 'All' || post.category === selectedCategory;
    const matchesSearch = searchQuery === '' || 
      post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.excerpt.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    
    return matchesCategory && matchesSearch;
  });

  const featuredPosts = blogPosts.filter(post => post.featured);
  const recentPosts = blogPosts.slice(0, 3);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link href="/" className="text-xl font-bold text-primary">
              LocalLink
            </Link>
            <nav className="hidden md:flex space-x-8">
              <Link href="/" className="text-gray-600 hover:text-gray-900">
                Home
              </Link>
              <Link href="/services" className="text-gray-600 hover:text-gray-900">
                Services
              </Link>
              <Link href="/blog" className="text-gray-900 font-medium">
                Blog
              </Link>
              <Link href="/auth/login" className="text-gray-600 hover:text-gray-900">
                Login
              </Link>
            </nav>
          </div>
        </div>
      </div>

      {/* Hero Section */}
      <div className="bg-primary text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl font-bold mb-4">LocalLink Blog</h1>
          <p className="text-xl text-blue-100 mb-8">
            Tips, guides, and insights for local services
          </p>
          
          {/* Search */}
          <div className="max-w-md mx-auto">
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search articles..."
              leftIcon={<Search className="h-4 w-4" />}
              className="bg-white"
            />
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-3">
            {/* Category Filter */}
            <div className="mb-8">
              <div className="flex flex-wrap gap-2">
                {categories.map((category) => (
                  <button
                    key={category}
                    onClick={() => setSelectedCategory(category)}
                    className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                      selectedCategory === category
                        ? 'bg-primary text-white'
                        : 'bg-white text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    {category}
                  </button>
                ))}
              </div>
            </div>

            {/* Featured Posts */}
            {selectedCategory === 'All' && searchQuery === '' && (
              <div className="mb-12">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Featured Articles</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {featuredPosts.map((post) => (
                    <Card key={post.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                      <div className="aspect-video bg-gray-200 relative">
                        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                        <div className="absolute bottom-4 left-4 text-white">
                          <span className="bg-primary px-2 py-1 rounded text-xs font-medium">
                            {post.category}
                          </span>
                        </div>
                      </div>
                      <CardHeader>
                        <CardTitle className="line-clamp-2">{post.title}</CardTitle>
                        <CardDescription className="line-clamp-3">
                          {post.excerpt}
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                          <div className="flex items-center space-x-4">
                            <div className="flex items-center space-x-1">
                              <User className="h-4 w-4" />
                              <span>{post.author}</span>
                            </div>
                            <div className="flex items-center space-x-1">
                              <Calendar className="h-4 w-4" />
                              <span>{formatDate(post.publishedAt, 'MMM d, yyyy')}</span>
                            </div>
                          </div>
                          <span>{post.readTime}</span>
                        </div>
                        <Link href={`/blog/${post.id}`}>
                          <Button variant="outline" className="w-full">
                            Read More
                            <ArrowRight className="h-4 w-4 ml-2" />
                          </Button>
                        </Link>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}

            {/* All Posts */}
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-6">
                {selectedCategory === 'All' ? 'All Articles' : `${selectedCategory} Articles`}
              </h2>
              
              {filteredPosts.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-gray-500">No articles found matching your criteria.</p>
                </div>
              ) : (
                <div className="space-y-6">
                  {filteredPosts.map((post) => (
                    <Card key={post.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                      <div className="md:flex">
                        <div className="md:w-1/3 aspect-video md:aspect-square bg-gray-200 relative">
                          <div className="absolute top-4 left-4">
                            <span className="bg-primary text-white px-2 py-1 rounded text-xs font-medium">
                              {post.category}
                            </span>
                          </div>
                        </div>
                        <div className="md:w-2/3">
                          <CardHeader>
                            <CardTitle className="line-clamp-2">{post.title}</CardTitle>
                            <CardDescription className="line-clamp-3">
                              {post.excerpt}
                            </CardDescription>
                          </CardHeader>
                          <CardContent>
                            <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                              <div className="flex items-center space-x-4">
                                <div className="flex items-center space-x-1">
                                  <User className="h-4 w-4" />
                                  <span>{post.author}</span>
                                </div>
                                <div className="flex items-center space-x-1">
                                  <Calendar className="h-4 w-4" />
                                  <span>{formatDate(post.publishedAt, 'MMM d, yyyy')}</span>
                                </div>
                              </div>
                              <span>{post.readTime}</span>
                            </div>
                            
                            <div className="flex items-center justify-between">
                              <div className="flex flex-wrap gap-1">
                                {post.tags.slice(0, 3).map((tag) => (
                                  <span
                                    key={tag}
                                    className="bg-gray-100 text-gray-600 px-2 py-1 rounded text-xs"
                                  >
                                    #{tag}
                                  </span>
                                ))}
                              </div>
                              <Link href={`/blog/${post.id}`}>
                                <Button variant="outline" size="sm">
                                  Read More
                                  <ArrowRight className="h-4 w-4 ml-2" />
                                </Button>
                              </Link>
                            </div>
                          </CardContent>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-8">
            {/* Recent Posts */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Posts</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentPosts.map((post) => (
                    <div key={post.id} className="border-b border-gray-200 last:border-b-0 pb-4 last:pb-0">
                      <Link href={`/blog/${post.id}`} className="block hover:text-primary">
                        <h4 className="font-medium line-clamp-2 mb-2">{post.title}</h4>
                        <div className="flex items-center text-sm text-gray-500">
                          <Calendar className="h-3 w-3 mr-1" />
                          <span>{formatDate(post.publishedAt, 'MMM d')}</span>
                        </div>
                      </Link>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Newsletter Signup */}
            <Card>
              <CardHeader>
                <CardTitle>Stay Updated</CardTitle>
                <CardDescription>
                  Get the latest tips and insights delivered to your inbox
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <Input placeholder="Enter your email" type="email" />
                  <Button className="w-full">Subscribe</Button>
                  <p className="text-xs text-gray-500">
                    We respect your privacy. Unsubscribe at any time.
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Popular Tags */}
            <Card>
              <CardHeader>
                <CardTitle>Popular Tags</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {['cleaning', 'home', 'maintenance', 'tips', 'plumbing', 'landscaping', 'fitness', 'health'].map((tag) => (
                    <button
                      key={tag}
                      className="bg-gray-100 text-gray-600 px-3 py-1 rounded-full text-sm hover:bg-gray-200 transition-colors"
                    >
                      #{tag}
                    </button>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
