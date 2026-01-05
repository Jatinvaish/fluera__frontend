import { useState, useEffect } from 'react';
import { Loader2, Plus, Save, Check, ChevronsUpDown, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { createFeaturePermission, updateFeaturePermission, fetchActiveFeaturesForSelect, selectActiveFeaturesForSelect } from '@/store/slices/adminSubscriptionSlice';
import { RbacService } from '@/lib/api/services/rbac-service';
import { Badge } from '@/components/ui/badge';

interface Permission {
  id: number;
  permission_key: string;
  resource: string;
  action: string;
  description?: string;
  category?: string;
  is_system_permission: boolean;
}

interface FeaturePermission {
  id: number;
  subscription_id: number;
  feature_id: number;
  permission_id: number;
  permission_price: number | null;
  restricted_to: string | null;
}

interface FeaturePermissionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editingItem: FeaturePermission | null;
  onSuccess: () => void;
}

export function FeaturePermissionDialog({ open, onOpenChange, editingItem, onSuccess }: FeaturePermissionDialogProps) {
  const dispatch = useAppDispatch();
  const activeFeatures = useAppSelector(selectActiveFeaturesForSelect);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [featureOpen, setFeatureOpen] = useState(false);
  const [permissionOpen, setPermissionOpen] = useState(false);
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [loadingPermissions, setLoadingPermissions] = useState(false);
  const [loadingFeatures, setLoadingFeatures] = useState(false);

  const [formData, setFormData] = useState({
    subscription_id: '',
    feature_id: '',
    permission_ids: [] as string[],
    permission_price: '',
    restricted_to: '',
  });

  useEffect(() => {
    if (open) {
      if (permissions.length === 0) loadPermissions();
      if (activeFeatures.length === 0) loadFeatures();
    }
  }, [open]);

  useEffect(() => {
    if (editingItem) {
      setFormData({
        subscription_id: editingItem.subscription_id.toString(),
        feature_id: editingItem.feature_id.toString(),
        permission_ids: [editingItem.permission_id.toString()],
        permission_price: editingItem.permission_price?.toString() || '',
        restricted_to: editingItem.restricted_to || '',
      });
    } else {
      setFormData({
        subscription_id: '',
        feature_id: '',
        permission_ids: [],
        permission_price: '',
        restricted_to: '',
      });
    }
  }, [editingItem, open]);

  useEffect(() => {
    if (!open) {
      setFeatureOpen(false);
      setPermissionOpen(false);
    }
  }, [open]);

  const loadFeatures = async () => {
    setLoadingFeatures(true);
    try {
      await dispatch(fetchActiveFeaturesForSelect()).unwrap();
    } catch (error: any) {
      toast.error('Failed to load features');
    } finally {
      setLoadingFeatures(false);
    }
  };

  const loadPermissions = async () => {
    setLoadingPermissions(true);
    try {
      const response = await RbacService.getAllPermissions();
      const permissionsList = response.data?.permissionsList || response.data || response || [];
      setPermissions(permissionsList);
    } catch (error: any) {
      toast.error('Failed to load permissions');
    } finally {
      setLoadingPermissions(false);
    }
  };

  const handleFeatureSelect = (feature: any) => {
    setFormData(prev => ({
      ...prev,
      feature_id: feature.id.toString(),
      subscription_id: feature.subscription_id.toString(),
    }));
    setFeatureOpen(false);
  };

  const handlePermissionToggle = (permissionId: string) => {
    setFormData(prev => ({
      ...prev,
      permission_ids: prev.permission_ids.includes(permissionId)
        ? prev.permission_ids.filter(id => id !== permissionId)
        : [...prev.permission_ids, permissionId]
    }));
  };

  const handleRemovePermission = (permissionId: string) => {
    setFormData(prev => ({
      ...prev,
      permission_ids: prev.permission_ids.filter(id => id !== permissionId)
    }));
  };

  const handleSubmit = async () => {
    if (!formData.subscription_id || !formData.feature_id || formData.permission_ids.length === 0) {
      toast.error('Please select feature and at least one permission');
      return;
    }


    setIsSubmitting(true);
    try {
      const payload = {
        subscription_id: parseInt(formData.subscription_id),
        feature_id: parseInt(formData.feature_id),
        permission_ids: formData.permission_ids.map(id => parseInt(id)),
        permission_price: formData.permission_price ? parseFloat(formData.permission_price) : undefined,
        restricted_to: formData.restricted_to || undefined,
      };

      if (editingItem) {
        await dispatch(updateFeaturePermission({ ...payload, id: editingItem.id })).unwrap();
        toast.success(`${formData.permission_ids.length} permission${formData.permission_ids.length > 1 ? 's' : ''} updated`);
      } else {
        await dispatch(createFeaturePermission(payload)).unwrap();
        toast.success(`${formData.permission_ids.length} permission${formData.permission_ids.length > 1 ? 's' : ''} created`);
      }

      onSuccess();
      onOpenChange(false);
    } catch (error: any) {
      toast.error(error?.message || 'Operation failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  const selectedFeature = activeFeatures.find(f => f.id.toString() === formData.feature_id);
  const selectedPermissions = permissions.filter(p => formData.permission_ids.includes(p.id.toString()));

  return (
    <Dialog open={open} onOpenChange={!isSubmitting ? onOpenChange : undefined} modal={true}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>{editingItem ? 'Edit Permissions' : 'Create Permissions'}</DialogTitle>
          <DialogDescription>
            {editingItem ? 'Update permissions for this feature' : 'Add permissions to subscription feature'}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label>Feature *</Label>
            <Popover open={featureOpen} onOpenChange={setFeatureOpen} modal={true}>
              <PopoverTrigger asChild>
                <Button variant="outline" className="w-full justify-between font-normal" disabled={isSubmitting || loadingFeatures}>
                  <span className="truncate">{loadingFeatures ? "Loading..." : selectedFeature ? selectedFeature.name : "Select feature"}</span>
                  <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0">
                <Command>
                  <CommandInput placeholder="Search..." />
                  <CommandList className="max-h-[280px]">
                    <CommandEmpty>No feature found</CommandEmpty>
                    <CommandGroup>
                      {activeFeatures.map(f => (
                        <CommandItem key={f.id} onSelect={() => handleFeatureSelect(f)}>
                          <div className="flex flex-col flex-1 gap-1">
                            <span className="font-medium text-sm">{f.name}</span>
                            <span className="text-xs text-muted-foreground">{f.plan_name}</span>
                          </div>
                          <Check className={cn("ml-auto h-4 w-4", formData.feature_id === f.id.toString() ? "opacity-100" : "opacity-0")} />
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>
          </div>

          <div className="space-y-2">
            <Label>Permissions * ({formData.permission_ids.length} selected)</Label>
            <Popover open={permissionOpen} onOpenChange={setPermissionOpen} modal={true}>
              <PopoverTrigger asChild>
                <Button variant="outline" className="w-full justify-between font-normal" disabled={isSubmitting || loadingPermissions}>
                  <span className="truncate">{loadingPermissions ? "Loading..." : "Select permissions"}</span>
                  <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0">
                <Command>
                  <CommandInput placeholder="Search..." />
                  <CommandList className="max-h-[320px]">
                    <CommandEmpty>No permission found</CommandEmpty>
                    <CommandGroup>
                      {permissions.map(p => (
                        <CommandItem key={p.id} onSelect={() => handlePermissionToggle(p.id.toString())}>
                          <div className="flex flex-col flex-1 gap-1">
                            <span className="font-medium text-sm">{p.permission_key}</span>
                            <span className="text-xs text-muted-foreground">{p.resource} → {p.action}</span>
                          </div>
                          <Check className={cn("ml-auto h-4 w-4", formData.permission_ids.includes(p.id.toString()) ? "opacity-100" : "opacity-0")} />
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>

            {selectedPermissions.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {selectedPermissions.map(p => (
                  <Badge key={p.id} variant="secondary" className="gap-1">
                    {p.permission_key}
                    <X className="h-3 w-3 cursor-pointer" onClick={() => handleRemovePermission(p.id.toString())} />
                  </Badge>
                ))}
              </div>
            )}
          </div>


          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Price</Label>
              <Input
                type="number"
                step="0.01"
                placeholder="Optional"
                value={formData.permission_price}
                onChange={e => setFormData(prev => ({ ...prev, permission_price: e.target.value }))}
                disabled={isSubmitting}
              />
            </div>
            <div className="space-y-2">
              <Label>Restricted To</Label>
              <Input
                placeholder="Optional"
                value={formData.restricted_to}
                onChange={e => setFormData(prev => ({ ...prev, restricted_to: e.target.value }))}
                disabled={isSubmitting}
              />
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isSubmitting}>Cancel</Button>
          <Button onClick={handleSubmit} disabled={isSubmitting || !formData.feature_id || formData.permission_ids.length === 0}>
            {isSubmitting ? <><Loader2 className="h-4 w-4 animate-spin" />{editingItem ? 'Updating...' : 'Creating...'}</> : <>{editingItem ? <Save className="h-4 w-4" /> : <Plus className="h-4 w-4" />}{editingItem ? 'Update' : 'Create'}</>}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}