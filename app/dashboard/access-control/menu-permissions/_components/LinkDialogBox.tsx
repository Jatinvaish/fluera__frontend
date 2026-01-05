import { useState, useEffect } from 'react';
import { Plus, Loader2, Check, ChevronsUpDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { useAppDispatch } from '@/store/hooks';
import { linkMenuPermission } from '@/store/slices/menu-permissions.slice';
import { RbacService } from '@/lib/api/services/rbac-service';

interface Permission {
  id: number;
  permission_key: string;
  resource: string;
  action: string;
  description?: string;
  category?: string;
  is_system_permission: boolean;
}

interface LinkDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

const AVAILABLE_MENU_KEYS = [
  'dashboard.access',
  'dashboard.access-control.access',
  'dashboard.access-control.roles.access',
  'dashboard.access-control.permissions.access',
  'dashboard.access-control.menu-permissions.access',
  'dashboard.access-control.users.access',
  'dashboard.access-control.roles.bulk-assign.access',
  'dashboard.subscriptions.access',
  'dashboard.subscriptions.plans.access',
  'dashboard.subscriptions.offers.access',
  'dashboard.subscriptions.features.access',
  'dashboard.subscriptions.features-permission.access',
  'dashboard.billing.access',
  'dashboard.billing.plans.access',
  'dashboard.billing.payment-methods.access',
  'dashboard.chat.access',
];

const formatMenuKey = (menuKey: string): string => {
  return menuKey.split('.').map(part => part.charAt(0).toUpperCase() + part.slice(1)).join(' > ');
};

export function LinkDialog({ open, onOpenChange, onSuccess }: LinkDialogProps) {
  const dispatch = useAppDispatch();
  const [menuKey, setMenuKey] = useState('');
  const [permissionId, setPermissionId] = useState('');
  const [isRequired, setIsRequired] = useState(true);
  const [isLinking, setIsLinking] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [permissionOpen, setPermissionOpen] = useState(false);
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [loadingPermissions, setLoadingPermissions] = useState(false);

  useEffect(() => {
    if (open && permissions.length === 0) {
      loadPermissions();
    }
  }, [open]);

  useEffect(() => {
    if (!open) {
      setMenuKey('');
      setPermissionId('');
      setIsRequired(true);
      setMenuOpen(false);
      setPermissionOpen(false);
    }
  }, [open]);

  const loadPermissions = async () => {
    setLoadingPermissions(true);
    try {
      const response = await RbacService.getAllPermissions();

      let permissionsList: Permission[];
      if (response.data?.permissionsList) {
        permissionsList = response.data.permissionsList;
      } else if (Array.isArray(response.data)) {
        permissionsList = response.data;
      } else if (Array.isArray(response)) {
        permissionsList = response;
      } else {
        permissionsList = [];
      }

      setPermissions(permissionsList);
    } catch (error: any) {
      toast.error('Failed to load permissions');
      console.error('Error loading permissions:', error);
    } finally {
      setLoadingPermissions(false);
    }
  };

  const handleSubmit = async () => {
    if (!menuKey || !permissionId) {
      toast.error('Please select both menu and permission');
      return;
    }

    setIsLinking(true);
    try {
      await dispatch(linkMenuPermission({
        menuKey,
        permissionId: Number(permissionId),
        isRequired
      })).unwrap();

      toast.success('Menu permission linked successfully');
      onSuccess();
      onOpenChange(false);
    } catch (error: any) {
      console.error('Error linking permission:', error);
      toast.error(error?.message || 'Failed to link permission');
    } finally {
      setIsLinking(false);
    }
  };

  const handleClose = () => {
    if (!isLinking) {
      // Force close all popovers before closing dialog
      setTimeout(() => {
        setMenuOpen(false);
        setPermissionOpen(false);
      }, 0);
      onOpenChange(false);
    }
  };

  const handleMenuOpenChange = (open: boolean) => {
    if (!isLinking) {
      setMenuOpen(open);
    }
  };

  const handlePermissionOpenChange = (open: boolean) => {
    if (!isLinking) {
      setPermissionOpen(open);
    }
  };

  const selectedMenu = AVAILABLE_MENU_KEYS.find(key => key === menuKey);
  const selectedPermission = permissions.find(p => p.id.toString() === permissionId);

  return (
    <Dialog open={open} onOpenChange={handleClose} modal={true}>
      <DialogContent className="max-w-2xl" onInteractOutside={(e) => {
        // Close popovers first before allowing dialog to close
        if (menuOpen || permissionOpen) {
          e.preventDefault();
          setMenuOpen(false);
          setPermissionOpen(false);
        }
      }}>
        <DialogHeader>
          <DialogTitle>Link Menu Permission</DialogTitle>
          <DialogDescription>
            Associate a permission with a menu item to control access
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="menu">Menu Key *</Label>
            <Popover open={menuOpen} onOpenChange={handleMenuOpenChange} modal={true}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  role="combobox"
                  aria-expanded={menuOpen}
                  className="w-full justify-between font-normal"
                  disabled={isLinking}
                  type="button"
                >
                  <span className="truncate">{selectedMenu ? formatMenuKey(selectedMenu) : "Select menu"}</span>
                  <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0" align="start">
                <Command>
                  <CommandInput placeholder="Search menus..." />
                  <CommandList className="max-h-[280px]">
                    <CommandEmpty>No menu found.</CommandEmpty>
                    <CommandGroup>
                      {AVAILABLE_MENU_KEYS.map((key) => (
                        <CommandItem
                          key={key}
                          value={key}
                          onSelect={(currentValue) => {
                            setMenuKey(currentValue);
                            setMenuOpen(false);
                          }}
                        >
                          <div className="flex flex-col flex-1 min-w-0">
                            <span className="font-medium text-sm">{formatMenuKey(key)}</span>
                            <span className="text-xs text-muted-foreground break-all">{key}</span>
                          </div>
                          <Check
                            className={cn(
                              "ml-auto h-4 w-4 shrink-0",
                              menuKey === key ? "opacity-100" : "opacity-0"
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
              Choose the menu item to link the permission to
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="permission">Permission *</Label>
            <Popover open={permissionOpen} onOpenChange={handlePermissionOpenChange} modal={true}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  role="combobox"
                  aria-expanded={permissionOpen}
                  className="w-full justify-between font-normal"
                  disabled={isLinking || loadingPermissions}
                  type="button"
                >
                  <span className="truncate">
                    {loadingPermissions ? "Loading permissions..." : selectedPermission ? selectedPermission.permission_key : "Select permission"}
                  </span>
                  <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0" align="start">
                <Command>
                  <CommandInput placeholder="Search permissions..." />
                  <CommandList className="max-h-[320px]">
                    <CommandEmpty>No permission found.</CommandEmpty>
                    <CommandGroup>
                      {permissions.map((p) => (
                        <CommandItem
                          key={p.id}
                          value={`${p.id}-${p.permission_key}-${p.resource}-${p.action}-${p.description || ''}`}
                          onSelect={() => {
                            setPermissionId(p.id.toString());
                            setPermissionOpen(false);
                          }}
                        >
                          <div className="flex flex-col flex-1 min-w-0 gap-1">
                            <span className="font-medium text-sm break-words">{p.permission_key}</span>
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="text-xs text-muted-foreground">{p.resource} → {p.action}</span>
                              {p.category && (
                                <span className="px-1.5 py-0.5 bg-secondary rounded text-xs whitespace-nowrap">
                                  {p.category}
                                </span>
                              )}
                            </div>
                            {p.description && (
                              <span className="text-xs text-muted-foreground break-words">
                                {p.description}
                              </span>
                            )}
                          </div>
                          <Check
                            className={cn(
                              "ml-auto h-4 w-4 shrink-0",
                              permissionId === p.id.toString() ? "opacity-100" : "opacity-0"
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
              Select the permission required to access this menu
            </p>
          </div>

          <div className="flex items-center justify-between pt-2 border-t">
            <div className="space-y-0.5">
              <Label htmlFor="required">Required Permission</Label>
              <p className="text-xs text-muted-foreground">
                If enabled, users must have this permission to access the menu
              </p>
            </div>
            <Switch
              id="required"
              checked={isRequired}
              onCheckedChange={setIsRequired}
              disabled={isLinking}
            />
          </div>
        </div>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={handleClose}
            disabled={isLinking}
          >
            Cancel
          </Button>
          <Button
            type="button"
            onClick={handleSubmit}
            disabled={isLinking || !menuKey || !permissionId || loadingPermissions}
          >
            {isLinking ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Linking...
              </>
            ) : (
              <>
                <Plus className="h-4 w-4" />
                Link Permission
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}