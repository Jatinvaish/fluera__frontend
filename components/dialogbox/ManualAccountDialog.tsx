'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { createManualAccount, fetchConnectedAccounts } from '@/store/slices/socialPlatformSlice';

interface ManualAccountDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  creatorProfileId: number;
  onSuccess: () => void;
}

interface ManualAccountForm {
  platform: string;
  username: string;
  url?: string;
  followerCount?: number;
  followingCount?: number;
  postsCount?: number;
  engagementRate?: number;
  avgLikes?: number;
  avgComments?: number;
  avgShares?: number;
  avgViews?: number;
  isBusinessAccount: boolean;
  isPrimary: boolean;
}

const PLATFORMS = [
  { value: 'youtube', label: 'YouTube' },
  { value: 'instagram', label: 'Instagram' },
  { value: 'tiktok', label: 'TikTok' },
  { value: 'twitter', label: 'Twitter/X' },
  { value: 'facebook', label: 'Facebook' },
  { value: 'twitch', label: 'Twitch' },
];

export function ManualAccountDialog({
  open,
  onOpenChange,
  creatorProfileId,
  onSuccess,
}: ManualAccountDialogProps) {
  const dispatch = useAppDispatch();
  const loading = useAppSelector((state) => state.socialPlatform.loading);
  const { register, handleSubmit, watch, setValue, reset, formState: { errors } } = useForm<ManualAccountForm>({
    defaultValues: {
      isBusinessAccount: false,
      isPrimary: false,
    }
  });

  const isBusinessAccount = watch('isBusinessAccount');
  const isPrimary = watch('isPrimary');

  const onSubmit = async (data: ManualAccountForm) => {
    try {
      await dispatch(createManualAccount({
        creatorProfileId,
        data: {
          platform: data.platform,
          username: data.username,
          url: data.url || undefined,
          followerCount: data.followerCount ? Number(data.followerCount) : undefined,
          followingCount: data.followingCount ? Number(data.followingCount) : undefined,
          postsCount: data.postsCount ? Number(data.postsCount) : undefined,
          engagementRate: data.engagementRate ? Number(data.engagementRate) : undefined,
          avgLikes: data.avgLikes ? Number(data.avgLikes) : undefined,
          avgComments: data.avgComments ? Number(data.avgComments) : undefined,
          avgShares: data.avgShares ? Number(data.avgShares) : undefined,
          avgViews: data.avgViews ? Number(data.avgViews) : undefined,
          isBusinessAccount: data.isBusinessAccount,
          isPrimary: data.isPrimary,
        }
      })).unwrap();

      toast.success('Manual account added successfully');
      reset();
      onOpenChange(false);
      dispatch(fetchConnectedAccounts(creatorProfileId));
      onSuccess();
    } catch (error: any) {
      toast.error(error || 'Failed to add manual account');
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add Manual Social Account</DialogTitle>
          <DialogDescription>
            Manually add social media account data without connecting via OAuth
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="platform">Platform *</Label>
            <Select onValueChange={(value) => setValue('platform', value)}>
              <SelectTrigger>
                <SelectValue placeholder="Select platform" />
              </SelectTrigger>
              <SelectContent>
                {PLATFORMS.map((platform) => (
                  <SelectItem key={platform.value} value={platform.value}>
                    {platform.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="username">Username *</Label>
            <Input
              id="username"
              placeholder="@username"
              {...register('username', { required: 'Username is required' })}
            />
            {errors.username && (
              <p className="text-sm text-destructive">{errors.username.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="url">Profile URL</Label>
            <Input
              id="url"
              type="url"
              placeholder="https://..."
              {...register('url')}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="followerCount">Followers</Label>
              <Input
                id="followerCount"
                type="number"
                min="0"
                placeholder="0"
                {...register('followerCount')}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="followingCount">Following</Label>
              <Input
                id="followingCount"
                type="number"
                min="0"
                placeholder="0"
                {...register('followingCount')}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="postsCount">Posts Count</Label>
              <Input
                id="postsCount"
                type="number"
                min="0"
                placeholder="0"
                {...register('postsCount')}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="engagementRate">Engagement Rate (%)</Label>
              <Input
                id="engagementRate"
                type="number"
                step="0.01"
                min="0"
                max="999.99"
                placeholder="0.00"
                {...register('engagementRate')}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="avgLikes">Avg Likes</Label>
              <Input
                id="avgLikes"
                type="number"
                min="0"
                placeholder="0"
                {...register('avgLikes')}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="avgComments">Avg Comments</Label>
              <Input
                id="avgComments"
                type="number"
                min="0"
                placeholder="0"
                {...register('avgComments')}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="avgShares">Avg Shares</Label>
              <Input
                id="avgShares"
                type="number"
                min="0"
                placeholder="0"
                {...register('avgShares')}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="avgViews">Avg Views</Label>
              <Input
                id="avgViews"
                type="number"
                min="0"
                placeholder="0"
                {...register('avgViews')}
              />
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <Switch
                id="isBusinessAccount"
                checked={isBusinessAccount}
                onCheckedChange={(checked) => setValue('isBusinessAccount', checked)}
              />
              <Label htmlFor="isBusinessAccount">Business Account</Label>
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="isPrimary"
                checked={isPrimary}
                onCheckedChange={(checked) => setValue('isPrimary', checked)}
              />
              <Label htmlFor="isPrimary">Primary Account</Label>
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Add Account
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
