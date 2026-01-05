"use client";

import { useEffect } from "react";
import { Check, ChevronsUpDown, Building2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { selectUser, switchTenant } from "@/store/slices/authSlice";
import { fetchMyTenants, selectTenants, selectTenantLoading } from "@/store/slices/tenantSlice";
import { toast } from "react-hot-toast";

export function TenantSwitcher() {
  const dispatch = useAppDispatch();
  const user = useAppSelector(selectUser);
  const tenants = useAppSelector(selectTenants);
  const loading = useAppSelector(selectTenantLoading);
  const currentTenantId = user?.tenantId;

  useEffect(() => {
    dispatch(fetchMyTenants());
  }, [dispatch]);

  const handleSwitchTenant = async (tenantId: number) => {
    if (tenantId === Number(currentTenantId)) return;

    try {
      await dispatch(switchTenant(tenantId)).unwrap();
      toast.success("Tenant switched successfully!");
      window.location.reload();
    } catch (error: any) {
      console.error("Error switching tenant:", error);
      toast.error(error || "Failed to switch tenant");
    }
  };

  const currentTenant = tenants.find((t) => {
    return t.id === Number(currentTenantId) || t.id.toString() === currentTenantId?.toString();
  });

  if (loading) return null;
  if (tenants.length <= 1) return null;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          className="h-9 justify-between gap-2 px-3"
        >
          <Building2 className="h-4 w-4 shrink-0 opacity-50" />
          <span className="truncate max-w-[120px]">
            {currentTenant?.name || "Select tenant"}
          </span>
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-[240px]">
        <DropdownMenuLabel>Switch Tenant</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {tenants.map((tenant) => (
          <DropdownMenuItem
            key={tenant.id}
            onClick={() => handleSwitchTenant(tenant.id)}
            className="cursor-pointer"
          >
            <div className="flex items-center justify-between w-full">
              <div className="flex flex-col">
                <span className="font-medium">{tenant.name}</span>
                {tenant.roleName && (
                  <span className="text-xs text-muted-foreground">
                    {tenant.roleName}
                  </span>
                )}
              </div>
              {tenant.id === Number(currentTenantId) && (
                <Check className="h-4 w-4 text-primary" />
              )}
            </div>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
