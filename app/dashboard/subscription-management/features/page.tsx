'use client';

import { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { ColumnDef, getCoreRowModel, getFilteredRowModel, getPaginationRowModel, PaginationState, SortingState, useReactTable } from '@tanstack/react-table';
import { Plus, Search, X, Edit, Trash2, ChevronRight, Package } from 'lucide-react';
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
import { selectAdminFeatures, selectAdminLoading, fetchAllFeatures, deleteFeature } from '@/store/slices/adminSubscriptionSlice';
import { FeatureDialog } from '@/components/dialogbox/SubscriptionFeature';

interface SubscriptionFeature {
  id: number;
  subscription_id: number;
  feature_price: number | null;
  restricted_to: string | null;
  name: string;
  plan_name: string;
  permissions_count: number;
  created_at: string;
}

export default function SubscriptionFeaturesPage() {
  const dispatch = useAppDispatch();
  const features = useAppSelector(selectAdminFeatures);
  const isLoading = useAppSelector(selectAdminLoading);

  const [pagination, setPagination] = useState<PaginationState>({ pageIndex: 0, pageSize: 10 });
  const [sorting, setSorting] = useState<SortingState>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [featureDialogOpen, setFeatureDialogOpen] = useState(false);
  const [editingFeature, setEditingFeature] = useState<SubscriptionFeature | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<SubscriptionFeature | null>(null);

  const hasInitialized = useRef(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [currentLimit, setCurrentLimit] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);

  const fetchData = useCallback((params: { page: number; limit: number; name?: string; subscription_id?: number; sortBy?: string; sortOrder?: 'ASC' | 'DESC' }) => {
    dispatch(fetchAllFeatures(params)).unwrap()
      .then((response: any) => {
        if (response?.data?.meta) {
          setTotalPages(response.data.meta.totalPages || 1);
          setTotalItems(response.data.meta.totalItems || 0);
          setCurrentPage(response.data.meta.currentPage || 1);
          setCurrentLimit(response.data.meta.itemsPerPage || 10);
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
    const sortBy = sorting[0]?.id;
    const sortOrder = sorting[0]?.desc ? 'DESC' : 'ASC';
    fetchData({ page: 1, limit: pagination.pageSize, name: searchInput || undefined, sortBy, sortOrder });
  }, [searchInput, pagination.pageSize, sorting, fetchData]);

  const handleClearSearch = useCallback(() => {
    setSearchInput('');
    setSearchQuery('');
    setPagination(prev => ({ ...prev, pageIndex: 0 }));
    const sortBy = sorting[0]?.id;
    const sortOrder = sorting[0]?.desc ? 'DESC' : 'ASC';
    fetchData({ page: 1, limit: pagination.pageSize, sortBy, sortOrder });
  }, [pagination.pageSize, sorting, fetchData]);

  const handleCreate = () => {
    setEditingFeature(null);
    setFeatureDialogOpen(true);
  };

  const handleEdit = (feature: SubscriptionFeature) => {
    setEditingFeature(feature);
    setFeatureDialogOpen(true);
  };

  const handleDeleteClick = (feature: SubscriptionFeature) => {
    setItemToDelete(feature);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!itemToDelete) return;
    try {
      await dispatch(deleteFeature(itemToDelete.id)).unwrap();
      toast.success('Feature deleted successfully');
      setDeleteDialogOpen(false);
      setItemToDelete(null);
      fetchData({ page: pagination.pageIndex + 1, limit: pagination.pageSize, name: searchQuery || undefined });
    } catch (error: any) {
      toast.error(error?.message || 'Failed to delete feature');
    }
  };

  const columns = useMemo<ColumnDef<SubscriptionFeature>[]>(() => [
    {
      accessorKey: 'name',
      header: ({ column }) => <DataGridColumnHeader title="Feature Name" visibility={true} column={column} />,
      cell: ({ row }) => (
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded bg-primary/10">
            <Package className="h-4 w-4 text-primary" />
          </div>
          <div>
            <div className="font-medium text-sm">{row.original.name}</div>
            <div className="text-xs text-muted-foreground">ID: {row.original.id}</div>
          </div>
        </div>
      ),
    },
    {
      accessorKey: 'plan_name',
      header: ({ column }) => <DataGridColumnHeader title="Subscription Plan" visibility={true} column={column} />,
      cell: ({ row }) => <span className="text-sm">{row.original.plan_name}</span>,
    },
    {
      accessorKey: 'feature_price',
      header: ({ column }) => <DataGridColumnHeader title="Price" visibility={true} column={column} />,
      cell: ({ row }) => (
        <span className="text-sm font-medium">
          {row.original.feature_price ? `$${row.original.feature_price}` : 'Free'}
        </span>
      ),
    },
    {
      accessorKey: 'restricted_to',
      header: ({ column }) => <DataGridColumnHeader title="Access" visibility={true} column={column} />,
      cell: ({ row }) => (
        row.original.restricted_to ? (
          <Badge variant="secondary" className="text-xs">{row.original.restricted_to}</Badge>
        ) : (
          <span className="text-xs text-muted-foreground">All</span>
        )
      ),
    },
    {
      accessorKey: 'permissions_count',
      header: ({ column }) => <DataGridColumnHeader title="Perms" visibility={true} column={column} />,
      cell: ({ row }) => (
        <Badge variant="outline" className="text-xs">{row.original.permissions_count || 0}</Badge>
      ),
    },
    {
      accessorKey: 'actions',
      header: '',
      cell: ({ row }) => (
        <div className="flex items-center gap-1">
          <IfHasAccess menuKey="dashboard.subscriptions.features">
            <Button mode="icon" variant="ghost" size="sm" onClick={() => handleEdit(row.original)}>
              <Edit className="h-4 w-4" />
            </Button>
            <Button mode="icon" variant="ghost" size="sm" onClick={() => handleDeleteClick(row.original)}>
              <Trash2 className="h-4 w-4" />
            </Button>
          </IfHasAccess>
        </div>
      ),
    },
  ], []);

  const table = useReactTable({
    columns,
    data: features,
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
          { label: 'Subscription Features', menuKey: 'dashboard.subscriptions.features', href: '/dashboard/subscriptions/features', isCurrent: true },
        ]}
      />

      <DataGrid table={table} recordCount={totalItems} isLoading={isLoading}>
        <Card className="py-4 gap-3">
          <CardHeader className="px-4 sm:px-4">
            <div className="flex flex-col gap-4">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <h1 className="text-3xl font-bold">Subscription Features</h1>
                  <p className="text-muted-foreground mt-1">Manage subscription features and permissions</p>
                </div>
              </div>
              <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-3">
                <div className="relative flex-1 max-w-md">
                  <Search className="size-4 text-muted-foreground absolute start-3 top-1/2 -translate-y-1/2" />
                  <Input
                    placeholder="Search features"
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

                  <IfHasAccess menuKey="dashboard.subscriptions.features">
                    <Button onClick={handleCreate} disabled={isLoading}>
                      <Plus className="h-4 w-4" />
                      Add Feature
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

      <FeatureDialog
        open={featureDialogOpen}
        onOpenChange={setFeatureDialogOpen}
        editingFeature={editingFeature}
        onSuccess={() => {
          fetchData({ page: pagination.pageIndex + 1, limit: pagination.pageSize, name: searchQuery || undefined });
          setFeatureDialogOpen(false);
        }}
      />

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Feature</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete <strong>{itemToDelete?.name}</strong>?
              <br /><br />
              This will also remove all associated feature permissions. This action cannot be undone.
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