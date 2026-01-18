'use client';

import { useEffect, useState } from 'react';
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
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
  Youtube, 
  Instagram, 
  Twitter, 
  Facebook,
  Twitch,
  RefreshCw,
  Unplug,
  CheckCircle2,
  AlertCircle,
  Loader2,
  TrendingUp,
  Users,
  FileText
} from 'lucide-react';
import { toast } from 'sonner';
import { SocialPlatformService } from '@/lib/api';
import { cn } from '@/lib/utils';

const platformIcons: Record<string, any> = {
  youtube: Youtube,
  instagram: Instagram,
  twitter: Twitter,
  facebook: Facebook,
  twitch: Twitch,
  tiktok: () => (
    <svg viewBox="0 0 24 24" className="size-5" fill="currentColor">
      <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z"/>
    </svg>
  ),
};

interface ConnectSocialPlatformsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  creatorProfileId: number;
}

export function ConnectSocialPlatformsDialog({
  open,
  onOpenChange,
  creatorProfileId,
}: ConnectSocialPlatformsDialogProps) {
  const dispatch = useAppDispatch();
  const user = useAppSelector(selectUser);
  const supportedPlatforms = useAppSelector(selectSupportedPlatforms);
  const connectedAccounts = useAppSelector(selectConnectedAccounts);
  const loading = useAppSelector(selectPlatformLoading);
  
  const userId = user?.id;
  const tenantId = (user as any)?.tenantId;
  const [disconnectingId, setDisconnectingId] = useState<number | null>(null);
  const [showDisconnectDialog, setShowDisconnectDialog] = useState(false);

  useEffect(() => {
    if (open) {
      dispatch(fetchSupportedPlatforms());
      dispatch(fetchConnectedAccounts(creatorProfileId));
    }
  }, [open, dispatch, creatorProfileId]);

  const handleConnect = (platformId: string) => {
    if (creatorProfileId && userId && tenantId) {
      SocialPlatformService.connectPlatform(platformId, creatorProfileId, userId, tenantId);
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

  const getPlatformIcon = (platformId: string) => {
    const Icon = platformIcons[platformId.toLowerCase()];
    return Icon ? <Icon className="size-5" /> : null;
  };

  const isConnected = (platformId: string) => {
    return connectedAccounts.some(acc => acc.platform === platformId);
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

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-4xl max-h-[90vh]">
          <DialogHeader>
            <DialogTitle>Connect Social Platforms</DialogTitle>
            <DialogDescription>
              Connect your social media accounts to track performance and analytics
            </DialogDescription>
          </DialogHeader>

          <ScrollArea className="h-[600px] pr-4">
            <div className="space-y-6">
              {/* Connected Accounts */}
              {connectedAccounts.length > 0 && (
                <div>
                  <h3 className="text-sm font-semibold mb-3">Connected Accounts</h3>
                  <div className="space-y-3">
                    {connectedAccounts.map((account) => {
                      const isSyncing = useAppSelector(selectAccountSyncing(account.id));
                      
                      return (
                        <div
                          key={account.id}
                          className={cn(
                            "flex items-center justify-between p-4 rounded-lg border",
                            "bg-card hover:bg-accent/50 transition-colors"
                          )}
                        >
                          <div className="flex items-center gap-4 flex-1">
                            <div className={cn(
                              "p-2 rounded-lg",
                              account.platform === 'youtube' && "bg-red-500/10 text-red-500",
                              account.platform === 'instagram' && "bg-pink-500/10 text-pink-500",
                              account.platform === 'twitter' && "bg-blue-500/10 text-blue-500",
                              account.platform === 'facebook' && "bg-blue-600/10 text-blue-600",
                              account.platform === 'tiktok' && "bg-gray-900/10 text-gray-900 dark:text-white",
                              account.platform === 'twitch' && "bg-purple-500/10 text-purple-500"
                            )}>
                              {getPlatformIcon(account.platform)}
                            </div>

                            <div className="flex-1">
                              <div className="flex items-center gap-2">
                                <p className="font-medium">{account.display_name}</p>
                                {account.is_verified && (
                                  <CheckCircle2 className="size-4 text-blue-500" />
                                )}
                              </div>
                              <p className="text-sm text-muted-foreground">@{account.username}</p>
                              
                              <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                                <div className="flex items-center gap-1">
                                  <Users className="size-3" />
                                  {formatNumber(account.follower_count)} followers
                                </div>
                                <div className="flex items-center gap-1">
                                  <FileText className="size-3" />
                                  {account.content_count} posts
                                </div>
                                <div>
                                  Last synced: {formatDate(account.last_synced_at)}
                                </div>
                              </div>
                            </div>

                            <div className="flex items-center gap-2">
                              {account.needsReconnect && (
                                <Badge variant="destructive" size="sm">
                                  <AlertCircle className="size-3 mr-1" />
                                  Reconnect
                                </Badge>
                              )}
                              {account.account_status === 'active' && !account.needsReconnect && (
                                <Badge variant="success" size="sm">
                                  <CheckCircle2 className="size-3 mr-1" />
                                  Active
                                </Badge>
                              )}
                            </div>
                          </div>

                          <div className="flex items-center gap-2 ml-4">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleSync(account.id)}
                              disabled={isSyncing}
                            >
                              {isSyncing ? (
                                <>
                                  <Loader2 className="size-4 mr-2 animate-spin" />
                                  Syncing...
                                </>
                              ) : (
                                <>
                                  <RefreshCw className="size-4 mr-2" />
                                  Sync
                                </>
                              )}
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                setDisconnectingId(account.id);
                                setShowDisconnectDialog(true);
                              }}
                            >
                              <Unplug className="size-4" />
                            </Button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {connectedAccounts.length > 0 && <Separator />}

              {/* Available Platforms */}
              <div>
                <h3 className="text-sm font-semibold mb-3">Available Platforms</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {supportedPlatforms.map((platform) => {
                    const connected = isConnected(platform.id);
                    
                    return (
                      <div
                        key={platform.id}
                        className={cn(
                          "p-4 rounded-lg border transition-all",
                          connected 
                            ? "bg-muted/50 border-muted" 
                            : "bg-card hover:bg-accent/50 hover:border-primary/50"
                        )}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex items-start gap-3 flex-1">
                            <div className={cn(
                              "p-2 rounded-lg",
                              platform.id === 'youtube' && "bg-red-500/10 text-red-500",
                              platform.id === 'instagram' && "bg-pink-500/10 text-pink-500",
                              platform.id === 'twitter' && "bg-blue-500/10 text-blue-500",
                              platform.id === 'facebook' && "bg-blue-600/10 text-blue-600",
                              platform.id === 'tiktok' && "bg-gray-900/10 text-gray-900 dark:text-white",
                              platform.id === 'twitch' && "bg-purple-500/10 text-purple-500"
                            )}>
                              {getPlatformIcon(platform.id)}
                            </div>
                            
                            <div className="flex-1">
                              <h4 className="font-medium">{platform.name}</h4>
                              <p className="text-xs text-muted-foreground mt-1">
                                {platform.description}
                              </p>
                              
                              <div className="flex items-center gap-2 mt-2">
                                {platform.supportsMetrics && (
                                  <Badge variant="outline" size="sm">
                                    <TrendingUp className="size-3 mr-1" />
                                    Analytics
                                  </Badge>
                                )}
                                {platform.supportsRevenue && (
                                  <Badge variant="outline" size="sm">
                                    Revenue
                                  </Badge>
                                )}
                              </div>
                            </div>
                          </div>

                          <Button
                            size="sm"
                            onClick={() => handleConnect(platform.id)}
                            disabled={connected || loading}
                          >
                            {connected ? 'Connected' : 'Connect'}
                          </Button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </ScrollArea>
        </DialogContent>
      </Dialog>

      {/* Disconnect Confirmation Dialog */}
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
    </>
  );
}
