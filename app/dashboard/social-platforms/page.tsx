'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import {
  fetchSupportedPlatforms,
  fetchConnectedAccounts,
  syncAccount,
  disconnectAccount,
  selectSupportedPlatforms,
  selectConnectedAccounts,
  selectPlatformLoading,
  selectAccountSyncing,
} from '@/store/slices/socialPlatformSlice';
import { selectUser } from '@/store/slices/authSlice';
import { fetchCreatorProfile } from '@/store/slices/profileSlice';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { 
  Youtube, Instagram, Twitter, Facebook, Twitch,
  RefreshCw, CheckCircle2, AlertCircle, Loader2,
  Users, FileText, ArrowLeft, Plus
} from 'lucide-react';
import { toast } from 'sonner';
import { SocialPlatformService } from '@/lib/api';
import { cn } from '@/lib/utils';
import { ManualAccountDialog } from '@/components/dialogbox/ManualAccountDialog';
import { ManualContentDialog } from '@/components/dialogbox/ManualContentDialog';

const PLATFORMS = [
  { id: 'youtube', name: 'YouTube', icon: Youtube, color: 'bg-red-500/10 text-red-500' },
  { id: 'facebook', name: 'Facebook', icon: Facebook, color: 'bg-blue-600/10 text-blue-600' },
  { id: 'twitch', name: 'Twitch', icon: Twitch, color: 'bg-purple-500/10 text-purple-500' },
  { 
    id: 'tiktok', 
    name: 'TikTok', 
    icon: () => (
      <svg viewBox="0 0 24 24" className="size-6" fill="currentColor">
        <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z"/>
      </svg>
    ),
    color: 'bg-gray-900/10 text-gray-900 dark:text-white'
  },
  { id: 'instagram', name: 'Instagram', icon: Instagram, color: 'bg-pink-500/10 text-pink-500' },
  { id: 'twitter', name: 'X (Twitter)', icon: Twitter, color: 'bg-blue-500/10 text-blue-500' },
];

export default function ConnectSocialPlatformsPage() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const user = useAppSelector(selectUser);
  const { profile } = useAppSelector((state) => state.profile);
  const supportedPlatforms = useAppSelector(selectSupportedPlatforms);
  const connectedAccounts = useAppSelector(selectConnectedAccounts);
  const loading = useAppSelector(selectPlatformLoading);
  
  const [connectingPlatform, setConnectingPlatform] = useState<string | null>(null);
  const [showConsentDialog, setShowConsentDialog] = useState(false);
  const [disconnectingId, setDisconnectingId] = useState<number | null>(null);
  const [showDisconnectDialog, setShowDisconnectDialog] = useState(false);
  const [showManualAccountDialog, setShowManualAccountDialog] = useState(false);
  const [showManualContentDialog, setShowManualContentDialog] = useState(false);
  const [selectedAccountForContent, setSelectedAccountForContent] = useState<any>(null);

  const creatorProfileId = (profile as any)?.id;

  useEffect(() => {
    if (!profile && user) {
      dispatch(fetchCreatorProfile());
    }
  }, [dispatch, profile, user]);

  useEffect(() => {
    if (creatorProfileId) {
      dispatch(fetchSupportedPlatforms());
      dispatch(fetchConnectedAccounts(creatorProfileId));
    }
  }, [dispatch, creatorProfileId]);

  const handleSwitchChange = (platformId: string, checked: boolean) => {
    if (checked) {
      setConnectingPlatform(platformId);
      setShowConsentDialog(true);
    } else {
      const account = connectedAccounts.find(acc => acc.platform === platformId);
      if (account) {
        setDisconnectingId(account.id);
        setShowDisconnectDialog(true);
      }
    }
  };

  const handleConnect = () => {
    if (connectingPlatform && creatorProfileId) {
      SocialPlatformService.connectPlatform(connectingPlatform, creatorProfileId);
      setShowConsentDialog(false);
      setConnectingPlatform(null);
    }
  };

  const handleSync = async (accountId: number) => {
    try {
      await dispatch(syncAccount({ accountId })).unwrap();
      toast.success('Account synced successfully');
    } catch (error: any) {
      toast.error(error || 'Failed to sync account');
    }
  };

  const handleDisconnect = async () => {
    if (!disconnectingId) return;
    
    try {
      await dispatch(disconnectAccount(disconnectingId)).unwrap();
      toast.success('Account disconnected successfully');
      setShowDisconnectDialog(false);
      setDisconnectingId(null);
    } catch (error: any) {
      toast.error(error || 'Failed to disconnect account');
    }
  };

  const handleManualAccountSuccess = () => {
    if (creatorProfileId) {
      dispatch(fetchConnectedAccounts(creatorProfileId));
    }
  };

  const handleManualContentSuccess = () => {
    if (creatorProfileId) {
      dispatch(fetchConnectedAccounts(creatorProfileId));
    }
  };

  const getConnectedAccount = (platformId: string) => {
    return connectedAccounts.find(acc => acc.platform === platformId);
  };

  const formatNumber = (num: number) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Never';
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  if (loading && connectedAccounts.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <>
      <div className="min-h-screen bg-background">
        <div className="bg-background border-b">
          <div className="w-full px-4 py-4">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="icon" onClick={() => router.back()}>
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <div>
                <h1 className="text-2xl font-semibold">Social Platform Connections</h1>
                <p className="text-sm text-muted-foreground mt-1">
                  Manage your social media integrations for content tracking and analytics
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto p-6 space-y-6">
          <div className="flex justify-end">
            <Button onClick={() => setShowManualAccountDialog(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Add Manual Account
            </Button>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Available Platforms</CardTitle>
              <CardDescription>Enable platforms to connect and sync your creator content</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {PLATFORMS.map((platform) => {
                  const account = getConnectedAccount(platform.id);
                  const isConnected = !!account;
                  const Icon = platform.icon;
                  
                  return (
                    <Card key={platform.id} className={cn(
                      "transition-all",
                      isConnected && "border-primary/50 bg-primary/5"
                    )}>
                      <CardContent className="p-6">
                        <div className="flex items-start justify-between mb-4">
                          <div className={cn("p-3 rounded-lg", platform.color)}>
                            <Icon className="size-6" />
                          </div>
                          <Switch
                            checked={isConnected}
                            onCheckedChange={(checked) => handleSwitchChange(platform.id, checked)}
                            disabled={loading}
                          />
                        </div>
                        <div className="space-y-3">
                          <h3 className="font-semibold text-lg">{platform.name}</h3>
                          
                          {isConnected && account ? (
                            <>
                              <div className="space-y-2">
                                <div className="flex items-center gap-2">
                                  <p className="font-medium text-sm">{account.display_name}</p>
                                  {account.is_verified && (
                                    <CheckCircle2 className="size-4 text-blue-500" />
                                  )}
                                </div>
                                <p className="text-xs text-muted-foreground">@{account.username}</p>
                              </div>

                              <div className="grid grid-cols-2 gap-2 pt-2 border-t">
                                <div>
                                  <p className="text-xs text-muted-foreground">Followers</p>
                                  <p className="text-sm font-semibold">{formatNumber(account.follower_count)}</p>
                                </div>
                                <div>
                                  <p className="text-xs text-muted-foreground">Posts</p>
                                  <p className="text-sm font-semibold">{account.content_count}</p>
                                </div>
                              </div>

                              <div className="flex items-center gap-2 pt-2">
                                {account.needsReconnect ? (
                                  <Badge variant="destructive" size="sm" className="text-xs">
                                    <AlertCircle className="size-3 mr-1" />
                                    Reconnect Required
                                  </Badge>
                                ) : (
                                  <Badge variant="success" size="sm" className="text-xs">
                                    <CheckCircle2 className="size-3 mr-1" />
                                    Connected
                                  </Badge>
                                )}
                              </div>

                              <Button
                                variant="outline"
                                size="sm"
                                className="w-full mt-2"
                                onClick={() => handleSync(account.id)}
                                disabled={account.connection_type === 'manual'}
                              >
                                {account.connection_type === 'manual' ? (
                                  'Manual Account'
                                ) : (
                                  <>
                                    <RefreshCw className="size-4 mr-2" />
                                    Sync Now
                                  </>
                                )}
                              </Button>

                              {account.connection_type === 'manual' && (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="w-full mt-2"
                                  onClick={() => {
                                    setSelectedAccountForContent(account);
                                    setShowManualContentDialog(true);
                                  }}
                                >
                                  <Plus className="size-4 mr-2" />
                                  Add Content
                                </Button>
                              )}

                              <p className="text-xs text-muted-foreground text-center">
                                Last synced: {formatDate(account.last_synced_at)}
                              </p>
                            </>
                          ) : (
                            <p className="text-sm text-muted-foreground">
                              Enable to connect your {platform.name} account
                            </p>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <AlertDialog open={showConsentDialog} onOpenChange={setShowConsentDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Connect {connectingPlatform?.toUpperCase()}?</AlertDialogTitle>
            <AlertDialogDescription asChild>
              <div>
                You will be redirected to {connectingPlatform} to authorize Fluera to access your account data.
                We will collect:
                <ul className="list-disc list-inside mt-2 space-y-1">
                  <li>Profile information (name, username, followers)</li>
                  <li>Content data (posts, videos, engagement metrics)</li>
                  <li>Analytics and performance data</li>
                </ul>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setConnectingPlatform(null)}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction onClick={handleConnect}>
              Continue to {connectingPlatform}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={showDisconnectDialog} onOpenChange={setShowDisconnectDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Disconnect Account?</AlertDialogTitle>
            <AlertDialogDescription>
              This will disconnect your social media account. You can reconnect it anytime.
              Your historical data will be preserved.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setDisconnectingId(null)}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction onClick={handleDisconnect}>
              Disconnect
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <ManualAccountDialog
        open={showManualAccountDialog}
        onOpenChange={setShowManualAccountDialog}
        creatorProfileId={creatorProfileId}
        onSuccess={handleManualAccountSuccess}
      />

      {selectedAccountForContent && (
        <ManualContentDialog
          open={showManualContentDialog}
          onOpenChange={setShowManualContentDialog}
          accountId={selectedAccountForContent.id}
          platform={selectedAccountForContent.platform}
          onSuccess={handleManualContentSuccess}
        />
      )}
    </>
  );
}
