"use client"

import { useState, useEffect, useMemo } from "react"
import { useDispatch, useSelector } from "react-redux"
import { type ColumnDef, getCoreRowModel, type SortingState, useReactTable } from "@tanstack/react-table"
import { Button } from "@/components/ui/button"
import { Card, CardFooter, CardHeader, CardTable } from "@/components/ui/card"
import { DataGrid } from "@/components/ui/data-grid"
import { DataGridColumnHeader } from "@/components/ui/data-grid-column-header"
import { DataGridPagination } from "@/components/ui/data-grid-pagination"
import { DataGridTable } from "@/components/ui/data-grid-table"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Field, FieldLabel } from "@/components/ui/field"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area"
import { Badge } from "@/components/ui/badge"
import { Loader2, Plus, Pencil, Trash2 } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog"
import { fetchAllPlans, createPlan, updatePlan, deletePlan, togglePlanStatus, selectAdminPlans, selectPlansPagination, selectAdminLoading } from "@/store/slices/adminSubscriptionSlice"
import type { AppDispatch } from "@/store/store"
import { toast } from "sonner"

export default function PlansManagementPage() {
  const dispatch = useDispatch<AppDispatch>()
  const plans = useSelector(selectAdminPlans)
  const pagination = useSelector(selectPlansPagination)
  const loading = useSelector(selectAdminLoading)
  const [isOpen, setIsOpen] = useState(false)
  const [editingPlan, setEditingPlan] = useState<any>(null)
  const [deleteId, setDeleteId] = useState<number | null>(null)
  const [pageIndex, setPageIndex] = useState(0)
  const [pageSize, setPageSize] = useState(10)
  const [sorting, setSorting] = useState<SortingState>([])

  const [formData, setFormData] = useState({
    planName: "",
    planSlug: "",
    planType: "all",
    planTier: "basic",
    isFree: false,
    isDefault: false,
    priceMonthly: "",
    priceQuarterly: "",
    priceYearly: "",
    currency: "USD",
    trialDays: "0",
    maxStaff: "",
    maxStorageGb: "",
    maxCampaigns: "",
    maxInvitations: "",
    maxIntegrations: "",
    maxCreators: "",
    maxBrands: "",
    maxFileSizeMb: "",
    maxApiCallsPerDay: "",
    prioritySupport: false,
    customBranding: false,
    whiteLabel: false,
    ssoEnabled: false,
    sortOrder: "0",
  })

  useEffect(() => {
    const sortBy = sorting[0]?.id;
    const sortOrder = sorting[0]?.desc ? 'desc' : 'asc';
    console.log('Fetching plans with:', { page: pageIndex + 1, pageSize, sortBy, sortOrder });
    dispatch(fetchAllPlans({ page: pageIndex + 1, pageSize, sortBy, sortOrder }));
  }, [dispatch, pageIndex, pageSize, sorting])

  useEffect(() => {
    console.log('Pagination data:', pagination);
  }, [pagination])

  const refreshPlans = () => {
    const sortBy = sorting[0]?.id;
    const sortOrder = sorting[0]?.desc ? 'desc' : 'asc';
    dispatch(fetchAllPlans({ page: pageIndex + 1, pageSize, sortBy, sortOrder }));
  }

  const resetForm = () => {
    setFormData({
      planName: "",
      planSlug: "",
      planType: "all",
      planTier: "basic",
      isFree: false,
      isDefault: false,
      priceMonthly: "",
      priceQuarterly: "",
      priceYearly: "",
      currency: "USD",
      trialDays: "0",
      maxStaff: "",
      maxStorageGb: "",
      maxCampaigns: "",
      maxInvitations: "",
      maxIntegrations: "",
      maxCreators: "",
      maxBrands: "",
      maxFileSizeMb: "",
      maxApiCallsPerDay: "",
      prioritySupport: false,
      customBranding: false,
      whiteLabel: false,
      ssoEnabled: false,
      sortOrder: "0",
    })
    setEditingPlan(null)
  }

  const handleEdit = (plan: any) => {
    setEditingPlan(plan)
    setFormData({
      planName: plan.plan_name,
      planSlug: plan.plan_slug,
      planType: plan.plan_type,
      planTier: plan.plan_tier,
      isFree: plan.is_free,
      isDefault: plan.is_default,
      priceMonthly: plan.price_monthly?.toString() || "",
      priceQuarterly: plan.price_quarterly?.toString() || "",
      priceYearly: plan.price_yearly?.toString() || "",
      currency: plan.currency || "USD",
      trialDays: plan.trial_days?.toString() || "0",
      maxStaff: plan.max_staff?.toString() || "",
      maxStorageGb: plan.max_storage_gb?.toString() || "",
      maxCampaigns: plan.max_campaigns?.toString() || "",
      maxInvitations: plan.max_invitations?.toString() || "",
      maxIntegrations: plan.max_integrations?.toString() || "",
      maxCreators: plan.max_creators?.toString() || "",
      maxBrands: plan.max_brands?.toString() || "",
      maxFileSizeMb: plan.max_file_size_mb?.toString() || "",
      maxApiCallsPerDay: plan.max_api_calls_per_day?.toString() || "",
      prioritySupport: plan.priority_support || false,
      customBranding: plan.custom_branding || false,
      whiteLabel: plan.white_label || false,
      ssoEnabled: plan.sso_enabled || false,
      sortOrder: plan.sort_order?.toString() || "0",
    })
    setIsOpen(true)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      const payload: any = editingPlan ? {
        planName: formData.planName,
        priceMonthly: formData.priceMonthly ? parseFloat(formData.priceMonthly) : undefined,
        priceQuarterly: formData.priceQuarterly ? parseFloat(formData.priceQuarterly) : undefined,
        priceYearly: formData.priceYearly ? parseFloat(formData.priceYearly) : undefined,
        maxStaff: formData.maxStaff ? parseInt(formData.maxStaff) : undefined,
        maxStorageGb: formData.maxStorageGb ? parseInt(formData.maxStorageGb) : undefined,
        maxCampaigns: formData.maxCampaigns ? parseInt(formData.maxCampaigns) : undefined,
        maxInvitations: formData.maxInvitations ? parseInt(formData.maxInvitations) : undefined,
        prioritySupport: formData.prioritySupport,
        customBranding: formData.customBranding,
        whiteLabel: formData.whiteLabel,
        ssoEnabled: formData.ssoEnabled,
      } : {
        planName: formData.planName,
        planSlug: formData.planSlug,
        planType: formData.planType,
        planTier: formData.planTier,
        isFree: formData.isFree,
        isDefault: formData.isDefault,
        priceMonthly: formData.priceMonthly ? parseFloat(formData.priceMonthly) : undefined,
        priceQuarterly: formData.priceQuarterly ? parseFloat(formData.priceQuarterly) : undefined,
        priceYearly: formData.priceYearly ? parseFloat(formData.priceYearly) : undefined,
        currency: formData.currency,
        trialDays: parseInt(formData.trialDays),
        maxStaff: formData.maxStaff ? parseInt(formData.maxStaff) : undefined,
        maxStorageGb: formData.maxStorageGb ? parseInt(formData.maxStorageGb) : undefined,
        maxCampaigns: formData.maxCampaigns ? parseInt(formData.maxCampaigns) : undefined,
        maxInvitations: formData.maxInvitations ? parseInt(formData.maxInvitations) : undefined,
        maxIntegrations: formData.maxIntegrations ? parseInt(formData.maxIntegrations) : undefined,
        maxCreators: formData.maxCreators ? parseInt(formData.maxCreators) : undefined,
        maxBrands: formData.maxBrands ? parseInt(formData.maxBrands) : undefined,
        maxFileSizeMb: formData.maxFileSizeMb ? parseInt(formData.maxFileSizeMb) : undefined,
        maxApiCallsPerDay: formData.maxApiCallsPerDay ? parseInt(formData.maxApiCallsPerDay) : undefined,
        prioritySupport: formData.prioritySupport,
        customBranding: formData.customBranding,
        whiteLabel: formData.whiteLabel,
        ssoEnabled: formData.ssoEnabled,
        sortOrder: parseInt(formData.sortOrder),
      }

      if (editingPlan) {
        await dispatch(updatePlan({ id: editingPlan.id, payload })).unwrap()
        toast.success("Plan updated successfully")
      } else {
        await dispatch(createPlan(payload)).unwrap()
        toast.success("Plan created successfully")
      }

      setIsOpen(false)
      resetForm()
      refreshPlans()
    } catch (error: any) {
      toast.error(error || "Operation failed")
    }
  }

  const handleDelete = async () => {
    if (!deleteId) return
    try {
      await dispatch(deletePlan(deleteId)).unwrap()
      toast.success("Plan deleted successfully")
      setDeleteId(null)
    } catch (error: any) {
      toast.error(error || "Delete failed")
    }
  }

  const handleToggleStatus = async (id: number, currentStatus: boolean) => {
    try {
      await dispatch(togglePlanStatus({ id, isActive: !currentStatus })).unwrap()
      toast.success(`Plan ${!currentStatus ? 'activated' : 'deactivated'} successfully`)
    } catch (error: any) {
      toast.error(error || "Failed to toggle status")
    }
  }

  const columns = useMemo<ColumnDef<any>[]>(() => [
    {
      accessorKey: "plan_name",
      header: ({ column }) => <DataGridColumnHeader title="Name" visibility={true} column={column} />,
      cell: ({ row }) => <div className="font-medium">{row.original.plan_name}</div>,
      enableSorting: true
    },
    {
      accessorKey: "plan_type",
      header: ({ column }) => <DataGridColumnHeader title="Type" visibility={true} column={column} />,
      cell: ({ row }) => <div className="capitalize">{row.original.plan_type}</div>,
      enableSorting: true
    },
    {
      accessorKey: "plan_tier",
      header: ({ column }) => <DataGridColumnHeader title="Tier" visibility={true} column={column} />,
      cell: ({ row }) => <Badge variant="outline">{row.original.plan_tier}</Badge>,
      enableSorting: true
    },
    {
      accessorKey: "price_monthly",
      header: ({ column }) => <DataGridColumnHeader title="Monthly" visibility={true} column={column} />,
      cell: ({ row }) => <div>${row.original.price_monthly || 0}</div>,
      enableSorting: true
    },
    {
      accessorKey: "price_quarterly",
      header: ({ column }) => <DataGridColumnHeader title="Quarterly" visibility={true} column={column} />,
      cell: ({ row }) => <div>${row.original.price_quarterly || 0}</div>,
      enableSorting: true
    },
    {
      accessorKey: "price_yearly",
      header: ({ column }) => <DataGridColumnHeader title="Yearly" visibility={true} column={column} />,
      cell: ({ row }) => <div>${row.original.price_yearly || 0}</div>,
      enableSorting: true
    },
    {
      accessorKey: "is_active",
      header: ({ column }) => <DataGridColumnHeader title="Status" visibility={true} column={column} />,
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <Switch 
            checked={row.original.is_active} 
            onCheckedChange={() => handleToggleStatus(row.original.id, row.original.is_active)}
          />
          <span className="text-sm">{row.original.is_active ? "Active" : "Inactive"}</span>
        </div>
      ),
      enableSorting: true
    },
    {
      id: "actions",
      header: "",
      cell: ({ row }) => (
        <div className="flex gap-2">
          <Button size="sm" variant="ghost" onClick={() => handleEdit(row.original)}><Pencil className="h-4 w-4" /></Button>
          <Button size="sm" variant="ghost" onClick={() => setDeleteId(row.original.id)}><Trash2 className="h-4 w-4" /></Button>
        </div>
      ),
      enableSorting: false
    }
  ], [])

  const table = useReactTable({
    columns,
    data: plans || [],
    pageCount: pagination?.totalPages || -1,
    state: {
      pagination: { pageIndex, pageSize },
      sorting
    },
    onPaginationChange: (updater) => {
      if (typeof updater === 'function') {
        const newState = updater({ pageIndex, pageSize });
        setPageIndex(newState.pageIndex);
        setPageSize(newState.pageSize);
      } else {
        setPageIndex(updater.pageIndex);
        setPageSize(updater.pageSize);
      }
    },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    manualPagination: true,
    manualSorting: true
  })

  return (
    <div className="flex flex-col gap-4">
      <DataGrid table={table} recordCount={pagination?.total || 0} isLoading={loading}>
        <Card className="py-4 gap-3">
          <CardHeader className="px-4 sm:px-4">
            <div className="flex flex-col gap-4">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <h1 className="text-3xl font-bold">Subscription Plans</h1>
                  <p className="text-muted-foreground mt-1">Manage subscription plans</p>
                </div>
                <Dialog open={isOpen} onOpenChange={(open) => { setIsOpen(open); if (!open) resetForm() }}>
                  <DialogTrigger asChild>
                    <Button><Plus className="h-4 w-4 mr-2" />Create Plan</Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                      <DialogTitle>{editingPlan ? "Edit Plan" : "Create Plan"}</DialogTitle>
                    </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <Field>
                  <FieldLabel>Plan Name *</FieldLabel>
                  <Input required value={formData.planName} onChange={(e) => setFormData({ ...formData, planName: e.target.value })} />
                </Field>
                <Field>
                  <FieldLabel>Plan Slug *</FieldLabel>
                  <Input required value={formData.planSlug} onChange={(e) => setFormData({ ...formData, planSlug: e.target.value })} />
                </Field>
                <Field>
                  <FieldLabel>Plan Type</FieldLabel>
                  <Select value={formData.planType} onValueChange={(value) => setFormData({ ...formData, planType: value })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All</SelectItem>
                      <SelectItem value="agency">Agency</SelectItem>
                      <SelectItem value="brand">Brand</SelectItem>
                      <SelectItem value="creator">Creator</SelectItem>
                    </SelectContent>
                  </Select>
                </Field>
                <Field>
                  <FieldLabel>Plan Tier</FieldLabel>
                  <Select value={formData.planTier} onValueChange={(value) => setFormData({ ...formData, planTier: value })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="free">Free</SelectItem>
                      <SelectItem value="basic">Basic</SelectItem>
                      <SelectItem value="pro">Pro</SelectItem>
                      <SelectItem value="enterprise">Enterprise</SelectItem>
                    </SelectContent>
                  </Select>
                </Field>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <Field>
                  <FieldLabel>Monthly Price</FieldLabel>
                  <Input type="number" step="0.01" value={formData.priceMonthly} onChange={(e) => setFormData({ ...formData, priceMonthly: e.target.value })} />
                </Field>
                <Field>
                  <FieldLabel>Quarterly Price</FieldLabel>
                  <Input type="number" step="0.01" value={formData.priceQuarterly} onChange={(e) => setFormData({ ...formData, priceQuarterly: e.target.value })} />
                </Field>
                <Field>
                  <FieldLabel>Yearly Price</FieldLabel>
                  <Input type="number" step="0.01" value={formData.priceYearly} onChange={(e) => setFormData({ ...formData, priceYearly: e.target.value })} />
                </Field>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <Field>
                  <FieldLabel>Max Staff</FieldLabel>
                  <Input type="number" value={formData.maxStaff} onChange={(e) => setFormData({ ...formData, maxStaff: e.target.value })} />
                </Field>
                <Field>
                  <FieldLabel>Max Storage (GB)</FieldLabel>
                  <Input type="number" value={formData.maxStorageGb} onChange={(e) => setFormData({ ...formData, maxStorageGb: e.target.value })} />
                </Field>
                <Field>
                  <FieldLabel>Max Campaigns</FieldLabel>
                  <Input type="number" value={formData.maxCampaigns} onChange={(e) => setFormData({ ...formData, maxCampaigns: e.target.value })} />
                </Field>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <Field>
                  <div className="flex items-center justify-between">
                    <FieldLabel>Free Plan</FieldLabel>
                    <Switch checked={formData.isFree} onCheckedChange={(checked) => setFormData({ ...formData, isFree: checked })} />
                  </div>
                </Field>
                <Field>
                  <div className="flex items-center justify-between">
                    <FieldLabel>Priority Support</FieldLabel>
                    <Switch checked={formData.prioritySupport} onCheckedChange={(checked) => setFormData({ ...formData, prioritySupport: checked })} />
                  </div>
                </Field>
                <Field>
                  <div className="flex items-center justify-between">
                    <FieldLabel>Custom Branding</FieldLabel>
                    <Switch checked={formData.customBranding} onCheckedChange={(checked) => setFormData({ ...formData, customBranding: checked })} />
                  </div>
                </Field>
                <Field>
                  <div className="flex items-center justify-between">
                    <FieldLabel>White Label</FieldLabel>
                    <Switch checked={formData.whiteLabel} onCheckedChange={(checked) => setFormData({ ...formData, whiteLabel: checked })} />
                  </div>
                </Field>
              </div>

              <div className="flex justify-end gap-2 pt-4">
                <Button type="button" variant="outline" onClick={() => { setIsOpen(false); resetForm() }}>Cancel</Button>
                <Button type="submit" disabled={loading}>{loading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}{editingPlan ? "Update" : "Create"}</Button>
              </div>
            </form>
                    </DialogContent>
                  </Dialog>
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

        <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete Plan</AlertDialogTitle>
              <AlertDialogDescription>Are you sure? This action cannot be undone.</AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={handleDelete}>Delete</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    )
  }
