'use client';

import { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { ColumnDef, getCoreRowModel, getFilteredRowModel, getPaginationRowModel, PaginationState, SortingState, useReactTable } from '@tanstack/react-table';
import { Plus, Search, X, Edit, Trash2, ChevronRight, Shield } from 'lucide-react';
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
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { IfHasAccess } from '@/components/guards/if-has-access';
import { ProtectedBreadcrumb } from '@/components/guards/protected-breadcrumb';
import { selectAdminFeaturePermissions, selectAdminLoading, fetchAllFeaturePermissions, deleteFeaturePermission } from '@/store/slices/adminSubscriptionSlice';
import { FeaturePermissionDialog } from '@/components/dialogbox/FeaturePermissionDialog';

interface FeaturePermission {
  id: number;
  subscription_id: number;
  feature_id: number;
  permission_id: number;
  permission_price: number | null;
  restricted_to: string | null;
  name: string;
  feature_name: string;
  plan_name: string;
  permission_key: string;
  resource: string;
  action: string;
  permission_description: string;
  permission_category: string;
}

export default function FeaturePermissionsPage() {
  const dispatch = useAppDispatch();
  const featurePermissions = useAppSelector(selectAdminFeaturePermissions);
  const isLoading = useAppSelector(selectAdminLoading);

  const [pagination, setPagination] = useState<PaginationState>({ pageIndex: 0, pageSize: 10 });
  const [sorting, setSorting] = useState<SortingState>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<FeaturePermission | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<FeaturePermission | null>(null);

  const hasInitialized = useRef(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [currentLimit, setCurrentLimit] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);

  const fetchData = useCallback((params: { page: number; limit: number; subscription_id?: number; feature_id?: number; permission_id?: number; sortBy?: string; sortOrder?: 'ASC' | 'DESC' }) => {
    dispatch(fetchAllFeaturePermissions(params)).unwrap()
      .then((response: any) => {
        if (response?.meta) {
          setTotalPages(response.meta.totalPages || 1);
          setTotalItems(response.meta.totalItems || 0);
          setCurrentPage(response.meta.currentPage || 1);
          setCurrentLimit(response.meta.itemsPerPage || 10);
        }
      })
      .catch(() => {
        setTotalPages(1);
        setTotalItems(0);
      });
  }, [dispatch]);

  useEffect(() => {
    if (!hasInitialized.current) {
      hasInitialized.current = true;
      fetchData({ page: 1, limit: pagination.pageSize });
    }
  }, []);

  // Reset page index if it's out of bounds when totalPages changes
  useEffect(() => {
    if (pagination.pageIndex >= totalPages && totalPages > 0) {
      setPagination(prev => ({ ...prev, pageIndex: 0 }));
    }
  }, [totalPages, pagination.pageIndex]);

  useEffect(() => {
    if (!hasInitialized.current || searchQuery) return;
    const sortBy = sorting[0]?.id;
    const sortOrder = sorting[0]?.desc ? 'DESC' : 'ASC';
    fetchData({ page: pagination.pageIndex + 1, limit: pagination.pageSize, sortBy, sortOrder });
  }, [pagination.pageIndex, pagination.pageSize, sorting]);

  const handleSearch = useCallback(() => {
    setSearchQuery(searchInput);
    setPagination(prev => ({ ...prev, pageIndex: 0 }));
    fetchData({ page: 1, limit: pagination.pageSize });
  }, [searchInput, pagination.pageSize, fetchData]);

  const handleClearSearch = useCallback(() => {
    setSearchInput('');
    setSearchQuery('');
    setPagination(prev => ({ ...prev, pageIndex: 0 }));
    const sortBy = sorting[0]?.id;
    const sortOrder = sorting[0]?.desc ? 'DESC' : 'ASC';
    fetchData({ page: 1, limit: pagination.pageSize, sortBy, sortOrder });
  }, [pagination.pageSize, sorting, fetchData]);

  const handleCreate = () => {
    setEditingItem(null);
    setDialogOpen(true);
  };

  const handleEdit = (item: FeaturePermission) => {
    setEditingItem(item);
    setDialogOpen(true);
  };

  const handleDeleteClick = (item: FeaturePermission) => {
    setItemToDelete(item);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!itemToDelete) return;
    try {
      await dispatch(deleteFeaturePermission(itemToDelete.id)).unwrap();
      toast.success('Feature permission deleted successfully');
      setDeleteDialogOpen(false);
      setItemToDelete(null);
      fetchData({ page: pagination.pageIndex + 1, limit: pagination.pageSize });
    } catch (error: any) {
      toast.error(error?.message || 'Failed to delete feature permission');
    }
  };

  const columns = useMemo<ColumnDef<FeaturePermission>[]>(() => [
    {
      accessorKey: 'feature_name',
      header: ({ column }) => <DataGridColumnHeader title="Feature" visibility={true} column={column} />,
      cell: ({ row }) => (
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded bg-primary/10">
            <Shield className="h-4 w-4 text-primary" />
          </div>
          <div>
            <div className="font-medium text-sm">{row.original.feature_name}</div>
            <div className="text-xs text-muted-foreground">Plan: {row.original.plan_name}</div>
          </div>
        </div>
      ),
    },
    {
      accessorKey: 'permission_key',
      header: ({ column }) => <DataGridColumnHeader title="Permission" visibility={true} column={column} />,
      cell: ({ row }) => (
        <div className="space-y-1">
          <div className="font-medium text-sm">{row.original.permission_key}</div>
          <div className="text-xs text-muted-foreground">{row.original.resource} → {row.original.action}</div>
        </div>
      ),
    },
    {
      accessorKey: 'permission_category',
      header: ({ column }) => <DataGridColumnHeader title="Category" visibility={true} column={column} />,
      cell: ({ row }) => <Badge variant="secondary">{row.original.permission_category || 'General'}</Badge>,
    },
    {
      accessorKey: 'permission_price',
      header: ({ column }) => <DataGridColumnHeader title="Price" visibility={true} column={column} />,
      cell: ({ row }) => (
        <span className="text-sm font-medium">
          {row.original.permission_price ? `$${row.original.permission_price}` : 'Free'}
        </span>
      ),
    },
    {
      accessorKey: 'restricted_to',
      header: ({ column }) => <DataGridColumnHeader title="Restricted To" visibility={true} column={column} />,
      cell: ({ row }) => (
        row.original.restricted_to ? (
          <Badge variant="outline">{row.original.restricted_to}</Badge>
        ) : (
          <span className="text-xs text-muted-foreground">All</span>
        )
      ),
    },
    {
      accessorKey: 'actions',
      header: '',
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <IfHasAccess menuKey="dashboard.subscriptions.feature-permissions">
            <Button mode="icon" variant="ghost" size="sm" onClick={() => handleEdit(row.original)}>
              <Edit className="h-4 w-4" />
            </Button>
            <Button mode="icon" variant="ghost" size="sm" onClick={() => handleDeleteClick(row.original)}>
              <Trash2 className="h-4 w-4" />
            </Button>
          </IfHasAccess>
          <ChevronRight className="text-muted-foreground/70 size-3.5" />
        </div>
      ),
    },
  ], []);

  const table = useReactTable({
    columns,
    data: featurePermissions,
    state: { pagination, sorting },
    onPaginationChange: setPagination,
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    manualPagination: true,
    manualSorting: true,
    pageCount: totalPages,
  });

  return (
    <div className="flex flex-col gap-4">
      <ProtectedBreadcrumb
        items={[
          { label: 'Feature Permissions', menuKey: 'dashboard.subscriptions.feature-permissions', href: '/dashboard/subscriptions/feature-permissions', isCurrent: true },
        ]}
      />

      <DataGrid table={table} recordCount={totalItems} isLoading={isLoading}>
        <Card className="py-4 gap-3">
          <CardHeader className="px-4 sm:px-4">
            <div className="flex flex-col gap-4">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <h1 className="text-3xl font-bold">Feature Permissions</h1>
                  <p className="text-muted-foreground mt-1">Manage feature-specific permissions and access control</p>
                </div>
              </div>
              <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-3">
                <div className="relative flex-1 max-w-md">
                  <Search className="size-4 text-muted-foreground absolute start-3 top-1/2 -translate-y-1/2" />
                  <Input
                    placeholder="Search feature permissions"
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

                  <IfHasAccess menuKey="dashboard.subscriptions.feature-permissions">
                    <Button onClick={handleCreate} disabled={isLoading}>
                      <Plus className="h-4 w-4" />
                      Add Permission
                    </Button>
                  </IfHasAccess>
                </div>
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

      <FeaturePermissionDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        editingItem={editingItem}
        onSuccess={() => {
          fetchData({ page: pagination.pageIndex + 1, limit: pagination.pageSize });
          setDialogOpen(false);
        }}
      />

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Feature Permission</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete <strong>{itemToDelete?.name}</strong>?
              <br /><br />
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteConfirm} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}