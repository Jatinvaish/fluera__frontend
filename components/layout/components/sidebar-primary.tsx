import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { LogOut, LockIcon } from "lucide-react";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { usePathname, useRouter } from "next/navigation";
import { useLayout } from "./context";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { logout, selectUser } from "@/store/slices/authSlice";
import { usePermissionContext } from "@/contexts/permission-context";
import * as LucideIcons from "lucide-react";
import { MENU_STRUCTURE } from "@/lib/api/menu-structure";

const ICON_MAP: Record<string, any> = LucideIcons;

export function SidebarPrimary() {
  const pathname = usePathname();
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { activeSecondaryMenu, setActiveSecondaryMenu, setShowSecondarySidebar } = useLayout();
  const [selectedMenuItem, setSelectedMenuItem] = useState<any>(null);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const user = useAppSelector(selectUser);

  const { isLoading, canAccessMenu, isSystemAdmin, blockedMenus } = usePermissionContext();

  // Convert MENU_STRUCTURE to primary menu items
  const menuItems = MENU_STRUCTURE.filter((item) => item.is_primary_sidebar).map((item) => ({
    id: item.key,
    icon: ICON_MAP[item.icon] || LucideIcons.LayoutDashboard,
    tooltip: item.title,
    path: item.path,
    rootPath: item.path,
    showSecondarySidebar: Boolean(item.children && item.children.length > 0),
    menuKey: item.key,
    showWithLock: item.is_show_with_lock_if_no_access || false,
  }));


  useEffect(() => {
    menuItems.forEach((item) => {
      if (item.rootPath === pathname || (item.rootPath && pathname.includes(item.rootPath))) {
        setSelectedMenuItem(item);
        setActiveSecondaryMenu(item.id);
        setShowSecondarySidebar(item.showSecondarySidebar);
      }
    });
  }, [pathname, setActiveSecondaryMenu, setShowSecondarySidebar]);

  const isBlocked = (menuKey: string) => {
    return blockedMenus.some((blocked: any) => {
      const key = typeof blocked === "string" ? blocked : blocked?.menu_key;
      return key === menuKey;
    });
  };
  const handleMenuClick = (item: (typeof menuItems)[0]) => {
    if (isBlocked(item.menuKey)) {
      router.push("/dashboard/errors/403");
      return;
    }

    if (!canAccessMenu(item.menuKey)) {
      router.push("/dashboard/errors/403");
      return;
    }

    setSelectedMenuItem(item);
    setActiveSecondaryMenu(item.id);
    setShowSecondarySidebar(item.showSecondarySidebar);

    if (!item.showSecondarySidebar && item.path && item.path !== "#") {
      router.push(item.path);
    }
  };

  return (
    <div className="border-input bg-muted flex shrink-0 flex-col items-center justify-center gap-5 border-0 px-2.5 py-2.5 lg:w-[var(--sidebar-collapsed-width)]">
      <ScrollArea className="h-[calc(100vh-13rem)] w-full grow lg:h-[calc(100vh-5.5rem)]">
        <div className="flex shrink-0 grow flex-col items-center gap-1">
          {menuItems.map((item, index) => {
            const blocked = isBlocked(item.menuKey);
            const hasAccess = canAccessMenu(item.menuKey);
            const shouldShow = hasAccess || item.showWithLock;

            if (!shouldShow) return null;

            if (blocked || !hasAccess) {
              return (
                <Tooltip key={index}>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      mode="icon"
                      disabled
                      className={cn(
                        "relative size-10 shrink-0 cursor-not-allowed rounded-md opacity-50",
                        "hover:text-muted-foreground"
                      )}>
                      <item.icon className="size-5 shrink-0" />
                      <LockIcon className="text-destructive absolute right-0 bottom-0 size-3 shrink-0" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent side="right" className="max-w-xs">
                    <p className="mb-1 text-xs font-semibold">Access Restricted</p>
                  </TooltipContent>
                </Tooltip>
              );
            }

            return (
              <Tooltip key={index}>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    mode="icon"
                    onClick={() => handleMenuClick(item)}
                    {...(item.id === activeSecondaryMenu ? { "data-state": "open" } : {})}
                    className={cn(
                      "size-10 shrink-0 rounded-md cursor-pointer",
                      "data-[state=open]:bg-primary data-[state=open]:text-primary-foreground",
                      "hover:text-foreground"
                    )}>
                    <item.icon className="size-5 shrink-0" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="right">{item.tooltip}</TooltipContent>
              </Tooltip>
            );
          })}

        </div>
      </ScrollArea>
    </div>
  );
}