import { useState, useEffect } from 'react';
import { Loader2, Plus, Save, Check, ChevronsUpDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { createFeature, updateFeature, fetchActiveSubscriptionsForSelect, selectActiveSubscriptionsForSelect } from '@/store/slices/adminSubscriptionSlice';

interface SubscriptionFeature {
  id: number;
  subscription_id: number;
  feature_price: number | null;
  restricted_to: string | null;
  name: string;
}

interface FeatureDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editingFeature: SubscriptionFeature | null;
  onSuccess: () => void;
}

export function FeatureDialog({ open, onOpenChange, editingFeature, onSuccess }: FeatureDialogProps) {
  const dispatch = useAppDispatch();
  const activeSubscriptions = useAppSelector(selectActiveSubscriptionsForSelect);
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [subscriptionOpen, setSubscriptionOpen] = useState(false);
  const [loadingSubscriptions, setLoadingSubscriptions] = useState(false);
  
  const [formData, setFormData] = useState({
    subscription_id: '',
    name: '',
    feature_price: '',
    restricted_to: '',
  });

  useEffect(() => {
    if (open && activeSubscriptions.length === 0) {
      loadSubscriptions();
    }
  }, [open]);

  useEffect(() => {
    if (editingFeature) {
      setFormData({
        subscription_id: editingFeature.subscription_id.toString(),
        name: editingFeature.name,
        feature_price: editingFeature.feature_price?.toString() || '',
        restricted_to: editingFeature.restricted_to || '',
      });
    } else {
      setFormData({
        subscription_id: '',
        name: '',
        feature_price: '',
        restricted_to: '',
      });
    }
  }, [editingFeature, open]);

  useEffect(() => {
    if (!open) {
      setSubscriptionOpen(false);
    }
  }, [open]);

  const loadSubscriptions = async () => {
    setLoadingSubscriptions(true);
    try {
      await dispatch(fetchActiveSubscriptionsForSelect()).unwrap();
    } catch (error: any) {
      toast.error('Failed to load subscriptions');
      console.error('Error loading subscriptions:', error);
    } finally {
      setLoadingSubscriptions(false);
    }
  };

  const handleSubmit = async () => {
    if (!formData.subscription_id || !formData.name) {
      toast.error('Please fill in all required fields');
      return;
    }

    setIsSubmitting(true);
    try {
      const payload: any = {
        subscription_id: parseInt(formData.subscription_id),
        name: formData.name,
        feature_price: formData.feature_price ? parseFloat(formData.feature_price) : undefined,
        restricted_to: formData.restricted_to || undefined,
      };

      if (editingFeature) {
        await dispatch(updateFeature({ ...payload, id: editingFeature.id })).unwrap();
        toast.success('Feature updated successfully');
      } else {
        await dispatch(createFeature(payload)).unwrap();
        toast.success('Feature created successfully');
      }

      onSuccess();
      onOpenChange(false);
    } catch (error: any) {
      toast.error(error?.message || `Failed to ${editingFeature ? 'update' : 'create'} feature`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!isSubmitting) {
      setTimeout(() => {
        setSubscriptionOpen(false);
      }, 0);
      onOpenChange(false);
    }
  };

  const handleSubscriptionOpenChange = (open: boolean) => {
    if (!isSubmitting) {
      setSubscriptionOpen(open);
    }
  };

  const selectedSubscription = activeSubscriptions.find(s => s.id.toString() === formData.subscription_id);

  return (
    <Dialog open={open} onOpenChange={handleClose} modal={true}>
      <DialogContent className="max-w-md" onInteractOutside={(e) => {
        if (subscriptionOpen) {
          e.preventDefault();
          setSubscriptionOpen(false);
        }
      }}>
        <DialogHeader>
          <DialogTitle>{editingFeature ? 'Edit Feature' : 'Create Feature'}</DialogTitle>
          <DialogDescription>
            {editingFeature ? 'Update the feature details' : 'Add a new subscription feature'}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="subscription">Subscription Plan *</Label>
            <Popover open={subscriptionOpen} onOpenChange={handleSubscriptionOpenChange} modal={true}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  role="combobox"
                  aria-expanded={subscriptionOpen}
                  className="w-full justify-between font-normal"
                  disabled={isSubmitting || loadingSubscriptions}
                  type="button"
                >
                  <span className="truncate">
                    {loadingSubscriptions ? "Loading subscriptions..." : selectedSubscription ? selectedSubscription.plan_name : "Select subscription"}
                  </span>
                  <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0" align="start">
                <Command>
                  <CommandInput placeholder="Search subscriptions..." />
                  <CommandList className="max-h-[280px]">
                    <CommandEmpty>No subscription found.</CommandEmpty>
                    <CommandGroup>
                      {activeSubscriptions.map((sub) => (
                        <CommandItem
                          key={sub.id}
                          value={`${sub.id}-${sub.plan_name}-${sub.plan_slug}`}
                          onSelect={() => {
                            setFormData(prev => ({ ...prev, subscription_id: sub.id.toString() }));
                            setSubscriptionOpen(false);
                          }}
                        >
                          <div className="flex flex-col flex-1 min-w-0 gap-1">
                            <span className="font-medium text-sm">{sub.plan_name}</span>
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="text-xs text-muted-foreground">{sub.plan_type}</span>
                              <span className="px-1.5 py-0.5 bg-secondary rounded text-xs">
                                {sub.plan_tier}
                              </span>
                            </div>
                          </div>
                          <Check
                            className={cn(
                              "ml-auto h-4 w-4 shrink-0",
                              formData.subscription_id === sub.id.toString() ? "opacity-100" : "opacity-0"
                            )}
                          />
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>
            <p className="text-xs text-muted-foreground">
              Select the subscription plan for this feature
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="name">Feature Name *</Label>
            <Input
              id="name"
              placeholder="Enter feature name"
              value={formData.name}
              onChange={e => setFormData(prev => ({ ...prev, name: e.target.value }))}
              disabled={isSubmitting}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="feature_price">Feature Price</Label>
            <Input
              id="feature_price"
              type="number"
              step="0.01"
              placeholder="Enter price (optional)"
              value={formData.feature_price}
              onChange={e => setFormData(prev => ({ ...prev, feature_price: e.target.value }))}
              disabled={isSubmitting}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="restricted_to">Restricted To</Label>
            <Input
              id="restricted_to"
              placeholder="e.g., premium, enterprise (optional)"
              value={formData.restricted_to}
              onChange={e => setFormData(prev => ({ ...prev, restricted_to: e.target.value }))}
              disabled={isSubmitting}
            />
          </div>
        </div>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={handleClose}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button
            type="button"
            onClick={handleSubmit}
            disabled={isSubmitting || !formData.subscription_id || !formData.name || loadingSubscriptions}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                {editingFeature ? 'Updating...' : 'Creating...'}
              </>
            ) : (
              <>
                {editingFeature ? <Save className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
                {editingFeature ? 'Update Feature' : 'Create Feature'}
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}