'use client';

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
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { createManualContent, fetchConnectedAccounts } from '@/store/slices/socialPlatformSlice';

interface ManualContentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  accountId: number;
  platform: string;
  onSuccess: () => void;
}

interface ManualContentForm {
  submission_id?: string;
  contentId: string;
  contentType: string;
  contentUrl: string;
  publishedAt: string;
  views?: number;
  likes?: number;
  comments?: number;
  shares?: number;
  saves?: number;
  reach?: number;
  impressions?: number;
  engagementRate?: number;
}

const CONTENT_TYPES: Record<string, string[]> = {
  youtube: ['video', 'short', 'live'],
  instagram: ['post', 'reel', 'story', 'igtv'],
  tiktok: ['video'],
  twitter: ['tweet', 'thread'],
  facebook: ['post', 'video', 'story'],
  twitch: ['stream', 'clip', 'video'],
};

export function ManualContentDialog({
  open,
  onOpenChange,
  accountId,
  platform,
  onSuccess,
}: ManualContentDialogProps) {
  const dispatch = useAppDispatch();
  const loading = useAppSelector((state) => state.socialPlatform.loading);
  const { register, handleSubmit, setValue, reset, formState: { errors } } = useForm<ManualContentForm>();

  const contentTypes = CONTENT_TYPES[platform] || ['post', 'video'];

  const onSubmit = async (data: ManualContentForm) => {
    try {
      // Validate content type for platform
      if (!contentTypes.includes(data.contentType)) {
        toast.error(`Invalid content type for ${platform}`);
        return;
      }

      await dispatch(createManualContent({
        accountId,
        data: {
          submission_id: data.submission_id ? Number(data.submission_id) : undefined,
          contentId: data.contentId,
          contentType: data.contentType,
          contentUrl: data.contentUrl,
          publishedAt: new Date(data.publishedAt).toISOString(),
          views: data.views ? Number(data.views) : undefined,
          likes: data.likes ? Number(data.likes) : undefined,
          comments: data.comments ? Number(data.comments) : undefined,
          shares: data.shares ? Number(data.shares) : undefined,
          saves: data.saves ? Number(data.saves) : undefined,
          reach: data.reach ? Number(data.reach) : undefined,
          impressions: data.impressions ? Number(data.impressions) : undefined,
          engagementRate: data.engagementRate ? Number(data.engagementRate) : undefined,
        }
      })).unwrap();

      toast.success('Manual content added successfully');
      reset();
      onOpenChange(false);
      onSuccess();
    } catch (error: any) {
      toast.error(error || 'Failed to add manual content');
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add Manual Content</DialogTitle>
          <DialogDescription>
            Manually add content data for this account
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="submission_id">Submission ID (Optional)</Label>
            <Input
              id="submission_id"
              type="number"
              placeholder="Leave empty to auto-generate"
              {...register('submission_id')}
            />
            <p className="text-xs text-muted-foreground">If empty, a unique ID will be generated automatically</p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="contentId">Content ID *</Label>
            <Input
              id="contentId"
              placeholder="Unique content identifier"
              {...register('contentId', { required: 'Content ID is required' })}
            />
            {errors.contentId && (
              <p className="text-sm text-destructive">{errors.contentId.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="contentUrl">Content URL *</Label>
            <Input
              id="contentUrl"
              type="url"
              placeholder="https://..."
              {...register('contentUrl', { 
                required: 'Content URL is required',
                pattern: {
                  value: /^https?:\/\/.+/,
                  message: 'Please enter a valid URL starting with http:// or https://'
                }
              })}
            />
            {errors.contentUrl && (
              <p className="text-sm text-destructive">{errors.contentUrl.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="contentType">Content Type *</Label>
            <Select onValueChange={(value) => setValue('contentType', value)}>
              <SelectTrigger>
                <SelectValue placeholder="Select content type" />
              </SelectTrigger>
              <SelectContent>
                {contentTypes.map((type) => (
                  <SelectItem key={type} value={type}>
                    {type.charAt(0).toUpperCase() + type.slice(1)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="publishedAt">Published Date *</Label>
            <Input
              id="publishedAt"
              type="datetime-local"
              {...register('publishedAt', { required: 'Published date is required' })}
            />
            {errors.publishedAt && (
              <p className="text-sm text-destructive">{errors.publishedAt.message}</p>
            )}
          </div>

          <div className="border-t pt-4">
            <h4 className="text-sm font-semibold mb-3">Metrics (Optional)</h4>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="views">Views</Label>
                <Input
                  id="views"
                  type="number"
                  min="0"
                  placeholder="0"
                  {...register('views')}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="likes">Likes</Label>
                <Input
                  id="likes"
                  type="number"
                  min="0"
                  placeholder="0"
                  {...register('likes')}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="comments">Comments</Label>
                <Input
                  id="comments"
                  type="number"
                  min="0"
                  placeholder="0"
                  {...register('comments')}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="shares">Shares</Label>
                <Input
                  id="shares"
                  type="number"
                  min="0"
                  placeholder="0"
                  {...register('shares')}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="saves">Saves</Label>
                <Input
                  id="saves"
                  type="number"
                  min="0"
                  placeholder="0"
                  {...register('saves')}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="reach">Reach</Label>
                <Input
                  id="reach"
                  type="number"
                  min="0"
                  placeholder="0"
                  {...register('reach')}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="impressions">Impressions</Label>
                <Input
                  id="impressions"
                  type="number"
                  min="0"
                  placeholder="0"
                  {...register('impressions')}
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
              Add Content
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
