'use client';

import React, { useState, useEffect } from 'react';
import { Share2, Copy, Gift, Users, DollarSign, Trophy, Check, ExternalLink } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import { ReferralService } from '@/services/referralService';
import { formatCurrency, formatDate, getErrorMessage } from '@/utils';

function ReferralsContent() {
  const { user } = useAuth();
  const [referralStats, setReferralStats] = useState<any>(null);
  const [leaderboard, setLeaderboard] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (user) {
      loadReferralData();
    }
  }, [user]);

  const loadReferralData = async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      
      // Load user's referral stats
      const stats = await ReferralService.getReferralStats(user.id);
      setReferralStats(stats);
      
      // Load leaderboard
      const leaderboardData = await ReferralService.getReferralLeaderboard();
      setLeaderboard(leaderboardData);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const createReferralCode = async () => {
    if (!user) return;
    
    try {
      await ReferralService.createReferralCode(
        user.id,
        user.role as 'customer' | 'service_provider'
      );
      
      // Reload data to show new code
      loadReferralData();
    } catch (err) {
      setError(getErrorMessage(err));
    }
  };

  const copyReferralLink = (code: string) => {
    const referralLink = `${window.location.origin}/auth/register?ref=${code}`;
    navigator.clipboard.writeText(referralLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const shareReferralCode = (code: string) => {
    const referralLink = `${window.location.origin}/auth/register?ref=${code}`;
    const shareText = `Join LocalLink and get $10 off your first booking! Use my referral code: ${code} or click: ${referralLink}`;
    
    if (navigator.share) {
      navigator.share({
        title: 'Join LocalLink',
        text: shareText,
        url: referralLink,
      });
    } else {
      // Fallback to copying to clipboard
      navigator.clipboard.writeText(shareText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Referral Program</h1>
            <p className="text-gray-600">
              Earn rewards by referring friends to LocalLink
            </p>
          </div>
          
          {referralStats?.referralCodes.length === 0 && (
            <Button onClick={createReferralCode}>
              <Gift className="h-4 w-4 mr-2" />
              Create Referral Code
            </Button>
          )}
        </div>

        {error && (
          <div className="bg-destructive/10 border border-destructive/20 text-destructive px-4 py-3 rounded-md text-sm">
            {error}
          </div>
        )}

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <Card key={i} className="animate-pulse">
                <CardHeader>
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                </CardHeader>
                <CardContent>
                  <div className="h-8 bg-gray-200 rounded w-1/2"></div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : referralStats && (
          <>
            {/* Referral Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Referrals</CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{referralStats.totalReferrals}</div>
                  <p className="text-xs text-muted-foreground">
                    {referralStats.completedReferrals} completed
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Pending Referrals</CardTitle>
                  <Gift className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{referralStats.pendingReferrals}</div>
                  <p className="text-xs text-muted-foreground">
                    Awaiting first booking
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Rewards</CardTitle>
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{formatCurrency(referralStats.totalRewards)}</div>
                  <p className="text-xs text-muted-foreground">
                    Lifetime earnings
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Available Rewards</CardTitle>
                  <Gift className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{formatCurrency(referralStats.availableRewards)}</div>
                  <p className="text-xs text-muted-foreground">
                    Ready to use
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Referral Codes */}
            <Card>
              <CardHeader>
                <CardTitle>Your Referral Codes</CardTitle>
                <CardDescription>
                  Share these codes with friends to earn rewards
                </CardDescription>
              </CardHeader>
              <CardContent>
                {referralStats.referralCodes.length === 0 ? (
                  <div className="text-center py-8">
                    <Gift className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No referral codes yet</h3>
                    <p className="text-gray-600 mb-4">Create your first referral code to start earning rewards</p>
                    <Button onClick={createReferralCode}>
                      Create Referral Code
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {referralStats.referralCodes.map((code: any) => (
                      <div key={code.id} className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex-1">
                          <div className="flex items-center space-x-3">
                            <code className="bg-gray-100 px-3 py-1 rounded font-mono text-lg">
                              {code.code}
                            </code>
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              code.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                            }`}>
                              {code.isActive ? 'Active' : 'Inactive'}
                            </span>
                          </div>
                          <div className="mt-2 text-sm text-gray-500">
                            Used {code.usageCount} times
                            {code.maxUsage && ` (max: ${code.maxUsage})`}
                            {code.expiresAt && ` • Expires ${formatDate(code.expiresAt.toDate(), 'PPP')}`}
                          </div>
                        </div>
                        
                        <div className="flex items-center space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => copyReferralLink(code.code)}
                          >
                            {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => shareReferralCode(code.code)}
                          >
                            <Share2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* How It Works */}
            <Card>
              <CardHeader>
                <CardTitle>How Referrals Work</CardTitle>
                <CardDescription>
                  Earn rewards for every friend you refer
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="text-center">
                    <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Share2 className="h-6 w-6 text-blue-600" />
                    </div>
                    <h3 className="font-medium mb-2">1. Share Your Code</h3>
                    <p className="text-sm text-gray-600">
                      Share your unique referral code with friends and family
                    </p>
                  </div>
                  
                  <div className="text-center">
                    <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Users className="h-6 w-6 text-green-600" />
                    </div>
                    <h3 className="font-medium mb-2">2. Friend Signs Up</h3>
                    <p className="text-sm text-gray-600">
                      Your friend creates an account using your referral code
                    </p>
                  </div>
                  
                  <div className="text-center">
                    <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Gift className="h-6 w-6 text-purple-600" />
                    </div>
                    <h3 className="font-medium mb-2">3. Both Get Rewards</h3>
                    <p className="text-sm text-gray-600">
                      You both receive credits when they make their first booking
                    </p>
                  </div>
                </div>
                
                <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                  <h4 className="font-medium text-blue-900 mb-2">Reward Structure</h4>
                  <ul className="text-sm text-blue-800 space-y-1">
                    <li>• You earn $10 credit for each successful customer referral</li>
                    <li>• You earn $25 credit for each successful service provider referral</li>
                    <li>• Your friend gets $10 off their first booking</li>
                    <li>• Credits never expire and can be used on any booking</li>
                  </ul>
                </div>
              </CardContent>
            </Card>

            {/* Leaderboard */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Trophy className="h-5 w-5 text-yellow-500" />
                  <span>Referral Leaderboard</span>
                </CardTitle>
                <CardDescription>
                  Top referrers this month
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {leaderboard.map((user, index) => (
                    <div key={user.userId} className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                          index === 0 ? 'bg-yellow-100 text-yellow-800' :
                          index === 1 ? 'bg-gray-100 text-gray-800' :
                          index === 2 ? 'bg-orange-100 text-orange-800' :
                          'bg-blue-100 text-blue-800'
                        }`}>
                          #{index + 1}
                        </div>
                        <div>
                          <p className="font-medium">{user.userName}</p>
                          <p className="text-sm text-gray-500">
                            {user.completedReferrals} completed referrals
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">{formatCurrency(user.totalRewards)}</p>
                        <p className="text-sm text-gray-500">{user.totalReferrals} total</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </DashboardLayout>
  );
}

export default function ReferralsPage() {
  return (
    <ProtectedRoute allowedRoles={['customer', 'service_provider']}>
      <ReferralsContent />
    </ProtectedRoute>
  );
}
