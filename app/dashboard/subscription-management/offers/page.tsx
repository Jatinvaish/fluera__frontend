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
import { DateTimePicker } from "@/components/date-time-picker"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area"
import { Badge } from "@/components/ui/badge"
import { Loader2, Plus, Pencil, Trash2 } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog"
import { fetchAllOffers, createOffer, updateOffer, deleteOffer, toggleOfferStatus, selectAdminOffers, selectOffersPagination, selectAdminLoading, fetchAllPlans, selectAdminPlans } from "@/store/slices/adminSubscriptionSlice"
import type { AppDispatch } from "@/store/store"
import { toast } from "sonner"

export default function OffersManagementPage() {
  const dispatch = useDispatch<AppDispatch>()
  const offers = useSelector(selectAdminOffers)
  const pagination = useSelector(selectOffersPagination)
  const plans = useSelector(selectAdminPlans)
  const loading = useSelector(selectAdminLoading)
  const [isOpen, setIsOpen] = useState(false)
  const [editingOffer, setEditingOffer] = useState<any>(null)
  const [deleteId, setDeleteId] = useState<number | null>(null)
  const [pageIndex, setPageIndex] = useState(0)
  const [pageSize, setPageSize] = useState(10)
  const [sorting, setSorting] = useState<SortingState>([])

  const [formData, setFormData] = useState({
    offerCode: "",
    offerName: "",
    offerType: "percentage",
    discountPercent: "",
    discountAmount: "",
    trialExtensionDays: "",
    minPurchaseAmount: "",
    maxDiscountAmount: "",
    usageLimit: "",
    usagePerUserLimit: "",
    isFestivalOffer: false,
    festivalName: "",
    startDate: undefined as Date | undefined,
    endDate: undefined as Date | undefined,
    applicablePlans: [] as string[],
    applicableCycles: [] as string[],
  })

  useEffect(() => {
    const sortBy = sorting[0]?.id;
    const sortOrder = sorting[0]?.desc ? 'desc' : 'asc';
    dispatch(fetchAllOffers({ page: pageIndex + 1, pageSize, sortBy, sortOrder }));
    dispatch(fetchAllPlans({}));
  }, [dispatch, pageIndex, pageSize, sorting])

  const refreshOffers = () => {
    const sortBy = sorting[0]?.id;
    const sortOrder = sorting[0]?.desc ? 'desc' : 'asc';
    dispatch(fetchAllOffers({ page: pageIndex + 1, pageSize, sortBy, sortOrder }));
  }

  const resetForm = () => {
    setFormData({
      offerCode: "",
      offerName: "",
      offerType: "percentage",
      discountPercent: "",
      discountAmount: "",
      trialExtensionDays: "",
      minPurchaseAmount: "",
      maxDiscountAmount: "",
      usageLimit: "",
      usagePerUserLimit: "",
      isFestivalOffer: false,
      festivalName: "",
      startDate: undefined,
      endDate: undefined,
      applicablePlans: [],
      applicableCycles: [],
    })
    setEditingOffer(null)
  }

  const handleEdit = (offer: any) => {
    setEditingOffer(offer)
    setFormData({
      offerCode: offer.offer_code,
      offerName: offer.offer_name,
      offerType: offer.offer_type,
      discountPercent: offer.discount_percent?.toString() || "",
      discountAmount: offer.discount_amount?.toString() || "",
      trialExtensionDays: offer.trial_extension_days?.toString() || "",
      minPurchaseAmount: offer.min_purchase_amount?.toString() || "",
      maxDiscountAmount: offer.max_discount_amount?.toString() || "",
      usageLimit: offer.usage_limit?.toString() || "",
      usagePerUserLimit: offer.usage_per_user_limit?.toString() || "",
      isFestivalOffer: offer.is_festival_offer || false,
      festivalName: offer.festival_name || "",
      startDate: offer.start_date ? new Date(offer.start_date) : undefined,
      endDate: offer.end_date ? new Date(offer.end_date) : undefined,
      applicablePlans: [],
      applicableCycles: [],
    })
    setIsOpen(true)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Date validation
    if (formData.startDate && formData.endDate && formData.startDate >= formData.endDate) {
      toast.error("End date must be after start date")
      return
    }

    try {
      const payload: any = {
        offerCode: formData.offerCode,
        offerName: formData.offerName,
        offerType: formData.offerType,
        discountPercent: formData.discountPercent ? parseFloat(formData.discountPercent) : undefined,
        discountAmount: formData.discountAmount ? parseFloat(formData.discountAmount) : undefined,
        trialExtensionDays: formData.trialExtensionDays ? parseInt(formData.trialExtensionDays) : undefined,
        minPurchaseAmount: formData.minPurchaseAmount ? parseFloat(formData.minPurchaseAmount) : undefined,
        maxDiscountAmount: formData.maxDiscountAmount ? parseFloat(formData.maxDiscountAmount) : undefined,
        usageLimit: formData.usageLimit ? parseInt(formData.usageLimit) : undefined,
        usagePerUserLimit: formData.usagePerUserLimit ? parseInt(formData.usagePerUserLimit) : undefined,
        isFestivalOffer: formData.isFestivalOffer,
        festivalName: formData.festivalName || undefined,
        startDate: formData.startDate?.toISOString().split('T')[0],
        endDate: formData.endDate?.toISOString().split('T')[0],
        applicablePlans: formData.applicablePlans,
        applicableCycles: formData.applicableCycles,
      }

      if (editingOffer) {
        await dispatch(updateOffer({ id: editingOffer.id, payload })).unwrap()
        toast.success("Offer updated successfully")
      } else {
        await dispatch(createOffer(payload)).unwrap()
        toast.success("Offer created successfully")
      }

      setIsOpen(false)
      resetForm()
      refreshOffers()
    } catch (error: any) {
      toast.error(error || "Operation failed")
    }
  }

  const handleDelete = async () => {
    if (!deleteId) return
    try {
      await dispatch(deleteOffer(deleteId)).unwrap()
      toast.success("Offer deleted successfully")
      setDeleteId(null)
      refreshOffers()
    } catch (error: any) {
      toast.error(error || "Delete failed")
    }
  }

  const handleToggleStatus = async (id: number, currentStatus: boolean) => {
    try {
      await dispatch(toggleOfferStatus({ id, isActive: !currentStatus })).unwrap()
      toast.success(`Offer ${!currentStatus ? 'activated' : 'deactivated'} successfully`)
    } catch (error: any) {
      toast.error(error || "Failed to toggle status")
    }
  }

  const columns = useMemo<ColumnDef<any>[]>(() => [
    {
      accessorKey: "offer_code",
      header: ({ column }) => <DataGridColumnHeader title="Code" visibility={true} column={column} />,
      cell: ({ row }) => <div className="font-mono font-medium">{row.original.offer_code}</div>,
      enableSorting: true
    },
    {
      accessorKey: "offer_name",
      header: ({ column }) => <DataGridColumnHeader title="Name" visibility={true} column={column} />,
      cell: ({ row }) => <div>{row.original.offer_name}</div>,
      enableSorting: true
    },
    {
      accessorKey: "offer_type",
      header: ({ column }) => <DataGridColumnHeader title="Type" visibility={true} column={column} />,
      cell: ({ row }) => <Badge variant="outline">{row.original.offer_type}</Badge>,
      enableSorting: true
    },
    {
      accessorKey: "discount",
      header: "Discount",
      cell: ({ row }) => (
        <div>
          {row.original.discount_percent ? `${row.original.discount_percent}%` : row.original.discount_amount ? `$${row.original.discount_amount}` : `${row.original.trial_extension_days} days`}
        </div>
      ),
      enableSorting: false
    },
    {
      accessorKey: "usage",
      header: "Usage",
      cell: ({ row }) => <div>{row.original.usage_count || 0} / {row.original.usage_limit || "∞"}</div>,
      enableSorting: false
    },
    {
      accessorKey: "end_date",
      header: ({ column }) => <DataGridColumnHeader title="Valid Until" visibility={true} column={column} />,
      cell: ({ row }) => <div>{new Date(row.original.end_date).toLocaleDateString()}</div>,
      enableSorting: true
    },
    {
      accessorKey: "is_active",
      header: ({ column }) => <DataGridColumnHeader title="Status" visibility={true} column={column} />,
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <Switch 
            checked={row.original.is_active === 1 || row.original.is_active === true} 
            onCheckedChange={() => handleToggleStatus(row.original.id, row.original.is_active)}
          />
          <span className="text-sm">{row.original.is_active === 1 || row.original.is_active === true ? "Active" : "Inactive"}</span>
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
    data: offers || [],
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
                  <h1 className="text-3xl font-bold">Subscription Offers</h1>
                  <p className="text-muted-foreground mt-1">Manage promotional offers and discounts</p>
                </div>
                <Dialog open={isOpen} onOpenChange={(open) => { setIsOpen(open); if (!open) resetForm() }}>
                  <DialogTrigger asChild>
                    <Button><Plus className="h-4 w-4 mr-2" />Create Offer</Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                      <DialogTitle>{editingOffer ? "Edit Offer" : "Create Offer"}</DialogTitle>
                    </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <Field>
                  <FieldLabel>Offer Code *</FieldLabel>
                  <Input required value={formData.offerCode} onChange={(e) => setFormData({ ...formData, offerCode: e.target.value.toUpperCase() })} placeholder="SUMMER2024" />
                </Field>
                <Field>
                  <FieldLabel>Offer Name *</FieldLabel>
                  <Input required value={formData.offerName} onChange={(e) => setFormData({ ...formData, offerName: e.target.value })} placeholder="Summer Sale" />
                </Field>
              </div>

              <Field>
                <FieldLabel>Offer Type</FieldLabel>
                <Select value={formData.offerType} onValueChange={(value) => setFormData({ ...formData, offerType: value })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="percentage">Percentage Discount</SelectItem>
                    <SelectItem value="fixed">Fixed Amount</SelectItem>
                    <SelectItem value="trial_extension">Trial Extension</SelectItem>
                  </SelectContent>
                </Select>
              </Field>

              {formData.offerType === "percentage" && (
                <Field>
                  <FieldLabel>Discount Percentage *</FieldLabel>
                  <Input required type="number" step="0.01" max="100" value={formData.discountPercent} onChange={(e) => setFormData({ ...formData, discountPercent: e.target.value })} placeholder="20" />
                </Field>
              )}

              {formData.offerType === "fixed" && (
                <Field>
                  <FieldLabel>Discount Amount *</FieldLabel>
                  <Input required type="number" step="0.01" value={formData.discountAmount} onChange={(e) => setFormData({ ...formData, discountAmount: e.target.value })} placeholder="50.00" />
                </Field>
              )}

              {formData.offerType === "trial_extension" && (
                <Field>
                  <FieldLabel>Trial Extension Days *</FieldLabel>
                  <Input required type="number" value={formData.trialExtensionDays} onChange={(e) => setFormData({ ...formData, trialExtensionDays: e.target.value })} placeholder="30" />
                </Field>
              )}

              <div className="grid grid-cols-2 gap-4">
                <Field>
                  <FieldLabel>Min Purchase Amount</FieldLabel>
                  <Input type="number" step="0.01" value={formData.minPurchaseAmount} onChange={(e) => setFormData({ ...formData, minPurchaseAmount: e.target.value })} placeholder="100.00" />
                </Field>
                <Field>
                  <FieldLabel>Max Discount Amount</FieldLabel>
                  <Input type="number" step="0.01" value={formData.maxDiscountAmount} onChange={(e) => setFormData({ ...formData, maxDiscountAmount: e.target.value })} placeholder="500.00" />
                </Field>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <Field>
                  <FieldLabel>Total Usage Limit</FieldLabel>
                  <Input type="number" value={formData.usageLimit} onChange={(e) => setFormData({ ...formData, usageLimit: e.target.value })} placeholder="100" />
                </Field>
                <Field>
                  <FieldLabel>Per User Limit</FieldLabel>
                  <Input type="number" value={formData.usagePerUserLimit} onChange={(e) => setFormData({ ...formData, usagePerUserLimit: e.target.value })} placeholder="1" />
                </Field>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <Field>
                  <FieldLabel>Start Date *</FieldLabel>
                  <DateTimePicker date={formData.startDate} setDate={(date) => setFormData({ ...formData, startDate: date })} />
                </Field>
                <Field>
                  <FieldLabel>End Date *</FieldLabel>
                  <DateTimePicker date={formData.endDate} setDate={(date) => setFormData({ ...formData, endDate: date })} />
                </Field>
              </div>

              <Field>
                <div className="flex items-center justify-between">
                  <FieldLabel>Festival Offer</FieldLabel>
                  <Switch checked={formData.isFestivalOffer} onCheckedChange={(checked) => setFormData({ ...formData, isFestivalOffer: checked })} />
                </div>
                {formData.isFestivalOffer && (
                  <Input value={formData.festivalName} onChange={(e) => setFormData({ ...formData, festivalName: e.target.value })} placeholder="Festival Name" />
                )}
              </Field>

              <div className="flex justify-end gap-2 pt-4">
                <Button type="button" variant="outline" onClick={() => { setIsOpen(false); resetForm() }}>Cancel</Button>
                <Button type="submit" disabled={loading}>{loading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}{editingOffer ? "Update" : "Create"}</Button>
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
              <AlertDialogTitle>Delete Offer</AlertDialogTitle>
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
