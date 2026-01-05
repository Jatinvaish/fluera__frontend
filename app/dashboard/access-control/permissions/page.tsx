// app/dashboard/access-control/permissions/page.tsx
'use client';

import { useState, useMemo, useEffect } from 'react';
import {
  ColumnDef,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  PaginationState,
  SortingState,
  useReactTable,
} from '@tanstack/react-table';
import { Plus, Search, X, Edit, Trash2, Key, ChevronRight } from 'lucide-react';
import { Permission } from '@/lib/api/services/rbac-service';
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
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { IfHasAccess } from '@/components/guards/if-has-access';
import { ProtectedBreadcrumb } from '@/components/guards/protected-breadcrumb';
import {
  fetchPermissions,
  deletePermission,
  selectPermissions,
  selectPermissionsLoading,
  selectPermissionsPagination,
} from '@/store/slices/permissions.slice';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
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
import CreatePermissionDialog from './_components/create-permission-dialog';

export default function PermissionsPage() {
  const dispatch = useAppDispatch();

  const permissions = useAppSelector(selectPermissions);
  const isLoading = useAppSelector(selectPermissionsLoading);
  const paginationMeta = useAppSelector(selectPermissionsPagination);

  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  });
  const [sorting, setSorting] = useState<SortingState>([{ id: 'created_at', desc: true }]);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [permissionToDelete, setPermissionToDelete] = useState<Permission | null>(null);
  const [inputValue, setInputValue] = useState(searchQuery);

  const handleSearch = () => {
    setSearchQuery(inputValue);
    setPagination({ ...pagination, pageIndex: 0 });
  };

  useEffect(() => {
    const sortBy = sorting[0]?.id || 'created_at';
    const sortOrder: 'ASC' | 'DESC' = sorting[0]?.desc ? 'DESC' : 'ASC';
    dispatch(fetchPermissions({
      page: pagination.pageIndex + 1,
      limit: pagination.pageSize,
      scope: 'all',
      category: categoryFilter === 'all' ? undefined : categoryFilter,
      search: searchQuery,
      sortBy,
      sortOrder,
    }));
  }, [dispatch, pagination.pageIndex, pagination.pageSize, searchQuery, categoryFilter, JSON.stringify(sorting)]);

  const handleDeleteClick = (permission: Permission) => {
    setPermissionToDelete(permission);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!permissionToDelete) return;

    try {
      await dispatch(deletePermission(permissionToDelete.id)).unwrap();
      toast.success('Permission deleted successfully');
      setDeleteDialogOpen(false);
      setPermissionToDelete(null);
    } catch (error: any) {
      toast.error(error || 'Failed to delete permission');
    }
  };

  const columns = useMemo<ColumnDef<Permission>[]>(
    () => [
      {
        accessorKey: 'permission_key',
        id: 'permission_key',
        header: ({ column }) => (
          <DataGridColumnHeader title="Permission" visibility={true} column={column} />
        ),
        cell: ({ row }) => {
          return (
            <div className="flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded bg-primary/10">
                <Key className="h-4 w-4 text-primary" />
              </div>
              <div>
                <div className="font-medium text-sm">{row.original.permission_key}</div>
                <div className="text-xs text-muted-foreground">
                  {row.original.resource}:{row.original.action}
                </div>
              </div>
            </div>
          );
        },
        enableSorting: true,
        enableHiding: false,
      },
      {
        accessorKey: 'description',
        id: 'description',
        header: ({ column }) => (
          <DataGridColumnHeader title="Description" visibility={true} column={column} />
        ),
        cell: ({ row }) => (
          <div className="text-sm text-muted-foreground max-w-md truncate">
            {row.original.description || '-'}
          </div>
        ),
        enableSorting: false,
        enableHiding: true,
      },
      {
        accessorKey: 'category',
        id: 'category',
        header: ({ column }) => (
          <DataGridColumnHeader title="Category" visibility={true} column={column} />
        ),
        cell: ({ row }) => (
          <Badge variant="secondary">{row.original.category || 'Uncategorized'}</Badge>
        ),
        enableSorting: true,
        enableHiding: true,
      },
      {
        accessorKey: 'is_system_permission',
        id: 'is_system_permission',
        header: ({ column }) => (
          <DataGridColumnHeader title="Type" visibility={true} column={column} />
        ),
        cell: ({ row }) => {
          const isSystem = row.original.is_system_permission;
          return (
            <Badge variant={isSystem ? 'primary' : 'outline'}>
              {isSystem ? 'System' : 'Custom'}
            </Badge>
          );
        },
        enableSorting: true,
        enableHiding: true,
      },
      {
        accessorKey: 'actions',
        header: '',
        cell: ({ row }) => (
          <div className="flex items-center gap-2" onClick={e => e.stopPropagation()}>
            <IfHasAccess menuKey="access-control.permissions.delete">
              <Button
                mode="icon"
                variant="ghost"
                size="sm"
                onClick={() => handleDeleteClick(row.original)}
                disabled={row.original.is_system_permission}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </IfHasAccess>
            <ChevronRight className="text-muted-foreground/70 size-3.5" />
          </div>
        ),
        enableSorting: false,
        enableHiding: false,
        enableResizing: false,
      },
    ],
    []
  );

  const [columnOrder, setColumnOrder] = useState<string[]>(
    columns.map(column => column.id as string)
  );

  const table = useReactTable({
    columns,
    data: permissions,
    pageCount: paginationMeta.totalPages,
    getRowId: (row: Permission) => row.id.toString(),
    state: { pagination, sorting, columnOrder },
    columnResizeMode: 'onChange',
    onColumnOrderChange: setColumnOrder,
    onPaginationChange: setPagination,
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    manualPagination: true,
    manualSorting: true,
    manualFiltering: true,
  });


  return (
    <div className="flex flex-col gap-4">
      <ProtectedBreadcrumb
        items={[
          {
            label: 'Permissions',
            menuKey: 'dashboard.access-control.permissions',
            href: '/dashboard/access-control/permissions',
            isCurrent: true,
          },
        ]}
      />

      <DataGrid
        table={table}
        recordCount={paginationMeta.totalItems}
        isLoading={isLoading}
        tableLayout={{
          columnsResizable: true,
          columnsPinnable: true,
          columnsMovable: true,
          columnsVisibility: true,
        }}
        tableClassNames={{ edgeCell: 'px-5' }}
      >
        <Card className="py-4 gap-3">
          <CardHeader className="px-4 sm:px-4">
            <div className="flex flex-col gap-4">
              <div className="relative w-full lg:flex-1">
                <Search className="size-4 text-muted-foreground absolute start-3 top-1/2 -translate-y-1/2" />
                <Input
                  placeholder="Search permissions"
                  value={inputValue}
                  onChange={e => setInputValue(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleSearch()}
                  disabled={isLoading}
                  className="ps-9 w-full sm:w-64"
                />
                {searchQuery.length > 0 && (
                  <Button
                    mode="icon"
                    variant="dim"
                    className="absolute end-1.5 top-1/2 -translate-y-1/2 h-6 w-6"
                    onClick={() => setSearchQuery('')}
                  >
                    <X />
                  </Button>
                )}
              </div>
              <Select value={categoryFilter} onValueChange={setCategoryFilter} disabled={isLoading}>
                <SelectTrigger className="w-full sm:w-36">
                  <SelectValue placeholder="Filter by category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  <SelectItem value="Access Control">Access Control</SelectItem>
                  <SelectItem value="User Management">User Management</SelectItem>
                  <SelectItem value="Content">Content</SelectItem>
                  <SelectItem value="Settings">Settings</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center justify-end">
              <IfHasAccess menuKey="access-control.permissions.create">
                <Button disabled={isLoading} onClick={() => setCreateDialogOpen(true)}>
                  <Plus />
                  Create Permission
                </Button>
              </IfHasAccess>
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

      <CreatePermissionDialog
        open={createDialogOpen}
        onOpenChange={setCreateDialogOpen}
        onSuccess={() => {
          dispatch(
            fetchPermissions({
              page: pagination.pageIndex + 1,
              limit: pagination.pageSize,
            })
          );
          setCreateDialogOpen(false);
        }}
      />

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Permission</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{permissionToDelete?.permission_key}"? This action
              cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}