'use client';

import { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { ColumnDef, getCoreRowModel, getFilteredRowModel, getPaginationRowModel, PaginationState, SortingState, useReactTable } from '@tanstack/react-table';
import { Plus, Search, X, Unlink, Menu, ChevronRight, Lock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardFooter, CardHeader, CardTable } from '@/components/ui/card';
import { DataGrid } from '@/components/ui/data-grid';
import { DataGridColumnHeader } from '@/components/ui/data-grid-column-header';
import { DataGridPagination } from '@/components/ui/data-grid-pagination';
import { DataGridTable } from '@/components/ui/data-grid-table';
import { Input } from '@/components/ui/input';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { IfHasAccess } from '@/components/guards/if-has-access';
import { ProtectedBreadcrumb } from '@/components/guards/protected-breadcrumb';
import { selectMenuPermissions, selectMenuPermissionsLoading, selectMenuPermissionsPagination, fetchMenuPermissions, unlinkMenuPermission } from '@/store/slices/menu-permissions.slice';
import { selectUser } from '@/store/slices/authSlice';
import { useMenuPermissions } from '@/hooks/use-menu-permissions';
import { canManageSystemResources } from '@/lib/rbac-utils';
import { LinkDialog } from './_components/LinkDialogBox';
interface MenuPermission {
  id: number;
  menu_key: string;
  permission_id: number;
  permission_key: string;
  resource?: string;
  action?: string;
  category?: string;
  is_required: boolean;
  is_system_permission: boolean;
  created_at: string;
}

const formatMenuKey = (menuKey: string): string => {
  return menuKey.split('.').map(part => part.charAt(0).toUpperCase() + part.slice(1)).join(' > ');
};

export default function MenuPermissionsPage() {
  const dispatch = useAppDispatch();
  const currentUser = useAppSelector(selectUser);
  const { accessibleMenus } = useMenuPermissions();

  const menuPermissions = useAppSelector(selectMenuPermissions);
  const isLoading = useAppSelector(selectMenuPermissionsLoading);
  const paginationMeta = useAppSelector(selectMenuPermissionsPagination);

  const [pagination, setPagination] = useState<PaginationState>({ pageIndex: 0, pageSize: 10 });
  const [sorting, setSorting] = useState<SortingState>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [linkDialogOpen, setLinkDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<MenuPermission | null>(null);

  const hasInitialized = useRef(false);
  const currentFetchParams = useRef<string>('');

  const fetchData = useCallback((params: { page: number; limit: number; search?: string; sortBy?: string; sortOrder?: string }) => {
    const paramsKey = JSON.stringify(params);
    if (currentFetchParams.current === paramsKey) return;
    currentFetchParams.current = paramsKey;
    dispatch(fetchMenuPermissions({ 
      page: params.page, 
      limit: params.limit, 
      search: params.search || undefined,
      sortBy: params.sortBy || 'created_at',
      sortOrder: (params.sortOrder || 'DESC').toUpperCase() as 'ASC' | 'DESC'
    }));
  }, [dispatch]);

  useEffect(() => {
    if (!hasInitialized.current) {
      hasInitialized.current = true;
      fetchData({ page: 1, limit: pagination.pageSize, search: undefined });
    }
  }, []);

  useEffect(() => {
    if (!hasInitialized.current || searchQuery) return;
    const sortBy = sorting[0]?.id || 'created_at';
    const sortOrder = sorting[0]?.desc ? 'DESC' : 'ASC';
    fetchData({ 
      page: pagination.pageIndex + 1, 
      limit: pagination.pageSize, 
      search: undefined,
      sortBy,
      sortOrder
    });
  }, [pagination.pageIndex, pagination.pageSize, JSON.stringify(sorting)]);

  const handleSearch = useCallback(() => {
    setSearchQuery(searchInput);
    setPagination(prev => ({ ...prev, pageIndex: 0 }));
    const sortBy = sorting[0]?.id || 'created_at';
    const sortOrder = sorting[0]?.desc ? 'DESC' : 'ASC';
    fetchData({ 
      page: 1, 
      limit: pagination.pageSize, 
      search: searchInput || undefined,
      sortBy,
      sortOrder
    });
  }, [searchInput, pagination.pageSize, sorting, fetchData]);

  const handleClearSearch = useCallback(() => {
    setSearchInput('');
    setSearchQuery('');
    setPagination(prev => ({ ...prev, pageIndex: 0 }));
    fetchData({ page: 1, limit: pagination.pageSize, search: undefined });
  }, [pagination.pageSize, fetchData]);

  const canUserUnlinkPermission = useCallback((mapping: MenuPermission): boolean => {
    if (!currentUser) return false;
    const userType = currentUser.userType || currentUser.user_type || '';
    if (canManageSystemResources(userType)) return true;
    if (mapping.is_system_permission) return false;
    if (!accessibleMenus.includes(mapping.menu_key)) return false;
    return true;
  }, [currentUser, accessibleMenus]);

  const handleUnlinkClick = (mapping: MenuPermission) => {
    if (!canUserUnlinkPermission(mapping)) {
      toast.error(mapping.is_system_permission ? 'Only system admins can unlink system permissions' : 'You do not have access to this menu');
      return;
    }
    setItemToDelete(mapping);
    setDeleteDialogOpen(true);
  };

  const handleUnlinkConfirm = async () => {
    if (!itemToDelete) return;
    try {
      await dispatch(unlinkMenuPermission({ menuKey: itemToDelete.menu_key, permissionId: itemToDelete.permission_id })).unwrap();
      toast.success('Menu permission unlinked successfully');
      setDeleteDialogOpen(false);
      setItemToDelete(null);
      fetchData({ page: pagination.pageIndex + 1, limit: pagination.pageSize, search: searchQuery || undefined });
    } catch (error: any) {
      toast.error(error?.message || 'Failed to unlink permission');
    }
  };

  const columns = useMemo<ColumnDef<MenuPermission>[]>(() => [
    {
      accessorKey: 'menu_key',
      id: 'menu_key',
      header: ({ column }) => <DataGridColumnHeader title="Menu Key" visibility={true} column={column} />,
      cell: ({ row }) => (
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded bg-primary/10">
            <Menu className="h-4 w-4 text-primary" />
          </div>
          <div>
            <div className="font-medium text-sm">{row.original.menu_key}</div>
            <div className="text-xs text-muted-foreground">{formatMenuKey(row.original.menu_key)}</div>
          </div>
        </div>
      ),
      enableSorting: true,
    },
    {
      accessorKey: 'permission_key',
      id: 'permission_name',
      header: ({ column }) => <DataGridColumnHeader title="Permission" visibility={true} column={column} />,
      cell: ({ row }) => (
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="font-medium text-sm">{row.original.permission_key}</span>
            {row.original.is_system_permission && (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger><Lock className="h-3 w-3 text-muted-foreground" /></TooltipTrigger>
                  <TooltipContent>System Permission</TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )}
          </div>
          {row.original.resource && row.original.action && (
            <div className="text-xs text-muted-foreground">{row.original.resource} → {row.original.action}</div>
          )}
        </div>
      ),
      enableSorting: true,
    },
    {
      accessorKey: 'category',
      id: 'category',
      header: ({ column }) => <DataGridColumnHeader title="Category" visibility={true} column={column} />,
      cell: ({ row }) => <Badge variant="secondary">{row.original.category || 'General'}</Badge>,
      enableSorting: true,
    },
    {
      accessorKey: 'is_required',
      id: 'is_required',
      header: ({ column }) => <DataGridColumnHeader title="Required" visibility={true} column={column} />,
      cell: ({ row }) => (
        <Badge variant={row.original.is_required ? 'primary' : 'outline'}>
          {row.original.is_required ? 'Required' : 'Optional'}
        </Badge>
      ),
      enableSorting: true,
    },
    {
      accessorKey: 'actions',
      header: '',
      cell: ({ row }) => {
        const canUnlink = canUserUnlinkPermission(row.original);
        return (
          <div className="flex items-center gap-2">
            <IfHasAccess menuKey="access-control.menu-permissions">
              {canUnlink ? (
                <Button mode="icon" variant="ghost" size="sm" onClick={() => handleUnlinkClick(row.original)}>
                  <Unlink className="h-4 w-4" />
                </Button>
              ) : (
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button mode="icon" variant="ghost" size="sm" disabled>
                        <Unlink className="h-4 w-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      {row.original.is_system_permission ? 'System admins only' : 'No access to menu'}
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              )}
            </IfHasAccess>
            <ChevronRight className="text-muted-foreground/70 size-3.5" />
          </div>
        );
      },
    },
  ], [canUserUnlinkPermission]);

  const table = useReactTable({
    columns,
    data: menuPermissions,
    state: { pagination, sorting },
    onPaginationChange: setPagination,
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    manualPagination: true,
    manualSorting: true,
    manualFiltering: true,
    pageCount: paginationMeta.totalPages,
  });

  return (
    <div className="flex flex-col gap-4">
      <ProtectedBreadcrumb
        items={[
          { label: 'Menu Permissions', menuKey: 'dashboard.access-control.menu-permissions', href: '/dashboard/access-control/menu-permissions', isCurrent: true },
        ]}
      />

      <DataGrid table={table} recordCount={paginationMeta.totalItems} isLoading={isLoading}>
        <Card className="py-4 gap-3">
          <CardHeader className="px-4 sm:px-4">
            <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-3">
              <div className="relative flex-1 max-w-md">
                <Search className="size-4 text-muted-foreground absolute start-3 top-1/2 -translate-y-1/2" />
                <Input
                  placeholder="Search menu permissions"
                  value={searchInput}
                  onChange={e => setSearchInput(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleSearch()}
                  className="ps-9 w-full"
                  disabled={isLoading}
                />
                {searchQuery && (
                  <Button
                    mode="icon"
                    variant="ghost"
                    size="sm"
                    className="absolute end-1 top-1/2 -translate-y-1/2 h-7 w-7"
                    onClick={handleClearSearch}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                )}
              </div>

              <div className="flex items-center gap-2">
                {searchInput !== searchQuery && (
                  <Button onClick={handleSearch} disabled={isLoading} variant="outline">
                    <Search className="h-4 w-4" />
                    Search
                  </Button>
                )}

                <IfHasAccess menuKey="access-control.menu-permissions">
                  <Button onClick={() => setLinkDialogOpen(true)} disabled={isLoading}>
                    <Plus className="h-4 w-4" />
                    Link Permission
                  </Button>
                </IfHasAccess>
              </div>
            </div>
          </CardHeader>

          <CardTable className="overflow-x-auto">
            <ScrollArea className="w-full">
              <DataGridTable />
              <ScrollBar orientation="horizontal" />
            </ScrollArea>
          </CardTable>

          <CardFooter className="px-4 sm:px-4">
            <DataGridPagination />
          </CardFooter>
        </Card>
      </DataGrid>

      <LinkDialog
        open={linkDialogOpen}
        onOpenChange={setLinkDialogOpen}
        onSuccess={() => {
          fetchData({ page: pagination.pageIndex + 1, limit: pagination.pageSize, search: searchQuery || undefined });
          setLinkDialogOpen(false);
        }}
      />

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Unlink Menu Permission</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to unlink <strong>{itemToDelete?.permission_key}</strong> from <strong>{itemToDelete?.menu_key}</strong>?
              <br /><br />
              This will remove the permission requirement for accessing this menu.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleUnlinkConfirm} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Unlink
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}