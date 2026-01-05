
// ==================== components/layout/sidebar-secondary.tsx ====================
import { SidebarSearch } from "./sidebar-search";
import { Badge } from "@/components/ui/badge";
import { usePathname, useRouter } from "next/navigation";
import { useState, useMemo, useEffect, useCallback, memo } from "react";
import { ChevronRight, ShieldAlertIcon, LockIcon } from "lucide-react";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { cn } from "@/lib/utils";
import { usePermissionContext } from "@/contexts/permission-context";
import { Skeleton } from "@/components/ui/skeleton";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { useLayout } from "./context";
import * as LucideIcons from "lucide-react";
import { MENU_STRUCTURE } from "@/lib/api/menu-structure";

const ICON_MAP: Record<string, any> = LucideIcons;

// Helper function to check if a path is active or a parent of active path
const isPathActiveOrParent = (itemPath: string, currentPath: string, children: any[]): boolean => {
  // Skip if item path is empty or invalid
  if (!itemPath || itemPath === '' || itemPath === '#') {
    // For items without path, check children
    if (children && children.length > 0) {
      return children.some((child: any) => 
        isPathActiveOrParent(child.path, currentPath, child.children || [])
      );
    }
    return false;
  }
  
  // Direct match
  if (currentPath === itemPath) return true;
  
  // Check if current path starts with item path (is a child route)
  if (currentPath.startsWith(itemPath + '/')) return true;
  
  // Check if any children are active
  if (children && children.length > 0) {
    return children.some((child: any) => 
      isPathActiveOrParent(child.path, currentPath, child.children || [])
    );
  }
  
  return false;
};

const MenuItem = memo(function MenuItem({ item, pathname, router, canAccessMenu, blockedMenus }: any) {
  const accessibleChildren = useMemo(() => {
    if (!item.children) return [];
    return item.children.filter((child: any) => {
      const hasAccess = canAccessMenu(child.key);
      const shouldShow = hasAccess || child.is_show_with_lock_if_no_access;
      return shouldShow;
    });
  }, [item.children, canAccessMenu]);

  const hasSubmenu = accessibleChildren.length > 0;
  
  // Check if this item or any of its children are active
  const isActiveOrParent = useMemo(() => 
    isPathActiveOrParent(item.path, pathname, accessibleChildren),
    [item.path, pathname, accessibleChildren]
  );

  // Initialize isOpen based on whether this menu contains the active route
  const [isOpen, setIsOpen] = useState(() => {
    if (!hasSubmenu) return false;
    
    // Check if any child path matches current pathname
    const hasActiveChild = accessibleChildren.some((child: any) => {
      if (pathname === child.path) return true;
      if (child.path && pathname.startsWith(child.path + '/')) return true;
      
      // Check nested children recursively
      if (child.children && child.children.length > 0) {
        return child.children.some((nested: any) => {
          if (pathname === nested.path) return true;
          if (nested.path && pathname.startsWith(nested.path + '/')) return true;
          return false;
        });
      }
      return false;
    });
    
    return hasActiveChild;
  });

  const isBlocked = useCallback((menuKey: string) => {
    return blockedMenus.some((blocked: any) => {
      const key = typeof blocked === 'string' ? blocked : blocked?.menu_key;
      return key === menuKey;
    });
  }, [blockedMenus]);

  const getBlockReason = useCallback((menuKey: string) => {
    const blocked = blockedMenus.find((b: any) => {
      const key = typeof b === 'string' ? b : b?.menu_key;
      return key === menuKey;
    });
    if (blocked && typeof blocked === 'object') {
      return blocked.block_reason || blocked.missing_permissions;
    }
    return null;
  }, [blockedMenus]);

  const isActive = pathname === item.path;
  const blocked = isBlocked(item.key);
  const blockReason = getBlockReason(item.key);
  const hasAccess = canAccessMenu(item.key);
  const shouldShow = hasAccess || item.is_show_with_lock_if_no_access;

  // Open parent menu if it contains the active route on mount or path change
  useEffect(() => {
    if (hasSubmenu) {
      // Check if any child path matches current pathname
      const hasActiveChild = accessibleChildren.some((child: any) => {
        if (pathname === child.path) return true;
        if (child.path && pathname.startsWith(child.path + '/')) return true;
        
        // Check nested children recursively
        if (child.children && child.children.length > 0) {
          return child.children.some((nested: any) => {
            if (pathname === nested.path) return true;
            if (nested.path && pathname.startsWith(nested.path + '/')) return true;
            return false;
          });
        }
        return false;
      });
      
      console.log('MenuItem:', item.title, 'hasActiveChild:', hasActiveChild, 'pathname:', pathname);
      
      if (hasActiveChild) {
        setIsOpen(true);
      }
    }
  }, [pathname, hasSubmenu, accessibleChildren, item.title]);

  const IconComponent = ICON_MAP[item.icon] || LucideIcons.Shield;

  const handleClick = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    if (blocked || !hasAccess) {
      router.push('/dashboard/errors/403');
      return;
    }
    if (hasSubmenu) {
      setIsOpen((prev:any) => !prev);
    } else {
      router.push(item.path);
    }
  }, [blocked, hasAccess, hasSubmenu, item.path, router]);

  if (!shouldShow) return null;

  if (hasSubmenu) {
    return (
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <CollapsibleTrigger asChild>
          <button 
            onClick={handleClick}
            className={cn(
              "flex w-full items-center gap-2 rounded-md px-2.5 py-2 text-sm font-normal transition-colors hover:bg-primary/10 hover:text-foreground text-foreground cursor-pointer",
              isActiveOrParent && "font-medium"
            )}
          >
            <IconComponent className="size-4 shrink-0" />
            <span className="flex-1 text-left">{item.title}</span>
            <ChevronRight className={cn("size-4 shrink-0 transition-transform duration-200", isOpen && "rotate-90")} />
          </button>
        </CollapsibleTrigger>
        <CollapsibleContent className="mt-1 space-y-1 pl-6">
          {accessibleChildren.map((subItem: any) => (
            <MenuItem
              key={subItem.key}
              item={subItem}
              pathname={pathname}
              router={router}
              canAccessMenu={canAccessMenu}
              blockedMenus={blockedMenus}
            />
          ))}
        </CollapsibleContent>
      </Collapsible>
    );
  }

  if (blocked || !hasAccess) {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <button
              disabled
              className={cn("flex w-full items-center gap-2 rounded-md px-2.5 py-2 text-sm font-normal transition-colors text-muted-foreground cursor-not-allowed opacity-50")}
            >
              <IconComponent className="size-4 shrink-0" />
              <span className="flex-1 text-left">{item.title}</span>
              <LockIcon className="size-3 shrink-0" />
            </button>
          </TooltipTrigger>
          <TooltipContent side="right" className="max-w-xs">
            <p className="font-semibold text-xs mb-1">Access Restricted</p>
            <p className="text-xs">{blockReason || 'Missing required permissions'}</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  return (
    <button
      onClick={handleClick}
      className={cn(
        "flex w-full items-center gap-2 rounded-md px-2.5 py-2 text-sm font-normal transition-colors hover:bg-primary/10 hover:text-foreground cursor-pointer",
        isActive ? "bg-primary/10 text-foreground font-medium" : "text-foreground"
      )}
    >
      <IconComponent className="size-4 shrink-0" />
      <span className="flex-1 text-left">{item.title}</span>
    </button>
  );
});

export function SidebarSecondary() {
  const pathname = usePathname();
  const router = useRouter();
  const { activeSecondaryMenu } = useLayout();
  const { isLoading, canAccessMenu, blockedMenus } = usePermissionContext();

  const currentMenuStructure = useMemo(() => {
    const activeMenu = MENU_STRUCTURE.find((menu) => menu.key === activeSecondaryMenu);
    console.log('📋 Secondary Sidebar - activeSecondaryMenu:', activeSecondaryMenu, '| found menu:', activeMenu?.title);
    if (!activeMenu || !activeMenu.children) return [];
    if (!canAccessMenu(activeMenu.key)) return [];
    return activeMenu.children;
  }, [activeSecondaryMenu, canAccessMenu]);

  const accessibleMenuStructure = useMemo(() => {
    if (isLoading) return [];

    return currentMenuStructure.map(menu => {
      const accessibleChildren = ((menu as any).children || []).filter((child: any) => {
        const hasAccess = canAccessMenu(child.key);
        const shouldShow = hasAccess || child.is_show_with_lock_if_no_access;
        return shouldShow;
      });

      const hasParentAccess = canAccessMenu(menu.key);
      const shouldShowParent = hasParentAccess || (menu as any).is_show_with_lock_if_no_access;

      if (shouldShowParent || accessibleChildren.length > 0) {
        return { ...menu, children: accessibleChildren };
      }
      return null;
    }).filter(Boolean);
  }, [isLoading, canAccessMenu, currentMenuStructure]);

  if (activeSecondaryMenu === 'dashboard.chat.access') {
    return null;
  }

  if (isLoading) {
    return (
      <div className="flex h-full flex-1 flex-col overflow-hidden">
        <div className="shrink-0 pt-2.5"><SidebarSearch /></div>
        <div className="flex-1 overflow-y-auto py-2.5">
          <div className="space-y-2 px-2.5">
            <Skeleton className="h-6 w-32 mb-4" />
            {[1, 2, 3, 4, 5].map(i => <Skeleton key={i} className="h-9 w-full" />)}
          </div>
        </div>
      </div>
    );
  }

  if (accessibleMenuStructure.length === 0) {
    return (
      <div className="flex h-full flex-1 flex-col overflow-hidden">
        <div className="shrink-0 pt-2.5"><SidebarSearch /></div>
        <div className="flex-1 overflow-y-auto py-2.5">
          <div className="flex flex-col items-center justify-center py-8 px-4 text-center">
            <ShieldAlertIcon className="size-12 text-muted-foreground mb-4" />
            <p className="text-sm text-muted-foreground mb-2">No accessible menus</p>
            <p className="text-xs text-muted-foreground">Contact administrator</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-full flex-1 flex-col overflow-hidden">
      <div className="shrink-0 pt-2.5"><SidebarSearch /></div>
      <div className="flex-1 overflow-y-auto py-2.5">
        <div className="space-y-1 px-2.5">
          <div className="space-y-1">
            {accessibleMenuStructure.map((item: any) => (
              <MenuItem
                key={item.key}
                item={item}
                pathname={pathname}
                router={router}
                canAccessMenu={canAccessMenu}
                blockedMenus={blockedMenus}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}