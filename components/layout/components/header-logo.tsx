import { useEffect, useState } from "react";
import { Menu, PanelRight, Plus } from "lucide-react";
import { useLayout } from "./context";
import { Sheet, SheetBody, SheetContent, SheetHeader, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { SidebarPrimary } from "./sidebar-primary";
import { SidebarSecondary } from "./sidebar-secondary";
import { toAbsoluteUrl } from "@/lib/helpers";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { IfHasAccess } from "@/components/guards/if-has-access";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { selectCurrentTenant, fetchTenantMembers } from "@/store/slices/tenantSlice";
import { selectUser } from "@/store/slices/authSlice";
import { AddUserDialog } from "@/app/dashboard/access-control/users/add-user-dialog";
import { cn } from "@/lib/utils";
import { TenantSwitcher } from "./tenant-switcher";

export function HeaderLogo() {
  const pathname = usePathname();
  const dispatch = useAppDispatch();
  const { isMobile, sidebarToggle, showSecondarySidebar } = useLayout();
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [addUserDialogOpen, setAddUserDialogOpen] = useState(false);

  const currentUser = useAppSelector(selectUser);
  const currentTenant = useAppSelector(selectCurrentTenant);

  useEffect(() => {
    setIsSheetOpen(false);
  }, [pathname]);

  const handleUserAdded = () => {
    const tenantId = currentUser?.tenantId || currentTenant?.id;
    if (tenantId) {
      dispatch(fetchTenantMembers({tenantId:Number(tenantId)}));
    }
  };

  return (
    <>
      <div className={cn("flex items-center gap-2 lg:w-[var(--sidebar-width)]", showSecondarySidebar && "border-border border-e")}>
        <div className="flex w-full items-center">
          <div className="border-border px-1 bg-muted flex h-[var(--header-height-mobile)] w-[var(--sidebar-collapsed-width)] shrink-0 items-center justify-center border-0 lg:h-[var(--header-height)]">
            <Link href="/dashboard" className="flex items-center justify-center w-full h-full">
              <img
                src={toAbsoluteUrl("/fluera-logo.svg")}
                className="h-20 w-auto object-contain dark:hidden"
                alt="Fluera Logo"
              />
              <img
                src={toAbsoluteUrl("/fluera-logo.svg")}
                className="hidden h-20 w-auto object-contain dark:block"
                alt="Fluera Logo"
              />
            </Link>
          </div>

          <div className="ml-3 hidden lg:block">
            <TenantSwitcher />
          </div>

          {isMobile && (
            <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" mode="icon" size="sm" className="ms-3">
                  <Menu className="size-4" />
                </Button>
              </SheetTrigger>
              <SheetContent className="w-[280px] gap-0 p-0" side="left" close={false}>
                <SheetHeader className="space-y-0 p-0" />
                <SheetBody className="flex grow p-0">
                  <SidebarPrimary />
                  {showSecondarySidebar && <SidebarSecondary />}
                </SheetBody>
              </SheetContent>
            </Sheet>
          )}

          {showSecondarySidebar && (
            <div className="hidden w-full grow items-center justify-between gap-2.5 px-5 lg:flex">
              <Button
                mode="icon"
                variant="ghost"
                onClick={sidebarToggle}
                className="text-muted-foreground hover:text-foreground ml-auto">
                <PanelRight className="-rotate-180 opacity-100 in-data-[sidebar-open=false]:rotate-0" />
              </Button>
            </div>
          )}
        </div>
      </div>

      <AddUserDialog
        open={addUserDialogOpen}
        onOpenChange={setAddUserDialogOpen}
        onSuccess={handleUserAdded}
      />
    </>
  );
}
