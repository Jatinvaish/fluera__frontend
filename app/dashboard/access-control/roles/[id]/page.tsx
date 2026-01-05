// app/dashboard/access-control/roles/[id]/page.tsx - BALANCED VERSION - PART 1
"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { Shield, Users, Key, Edit, Trash2, ArrowLeft, Copy, Lock, CheckCircle2, XCircle, Search, Loader2, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { fetchRoleById, deleteRole, selectCurrentRole, selectRolesLoading, clearCurrentRole, fetchRolePermissionsTree, selectPermissionsTree, bulkAssignRolePermissions } from "@/store/slices/roles.slice";
import { selectUser } from "@/store/slices/authSlice";
import { ProtectedBreadcrumb } from "@/components/guards/protected-breadcrumb";
import { IfHasAccess } from "@/components/guards/if-has-access";
import CloneRoleDialog from "../components/clone-role-dialog";
import { useMenuPermissions } from "@/hooks/use-menu-permissions";

const canManageSystemResources = (userType: string): boolean => {
  return userType === "super_admin" || userType === "saas_admin" || userType === "owner";
};

const RoleDetailsPage = () => {
  const params = useParams();
  const router = useRouter();
  const dispatch = useAppDispatch();
  const roleId = Number(params.id);
  const { canAccessMenu } = useMenuPermissions();
  const hasAccess = canAccessMenu('dashboard.access-control.roles.bulk-assign.access');
  const role = useAppSelector(selectCurrentRole);
  const permissionsTree = useAppSelector(selectPermissionsTree);
  const isLoading = useAppSelector(selectRolesLoading);
  const currentUser = useAppSelector(selectUser);

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [cloneDialogOpen, setCloneDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [activeTab, setActiveTab] = useState("overview");
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedCategories, setExpandedCategories] = useState<string[]>([]);
  const [permissionChanges, setPermissionChanges] = useState<Map<number, "I" | "D">>(new Map());
  const [isSaving, setIsSaving] = useState(false);

  const userType = currentUser?.userType || currentUser?.user_type || "";
  const isGlobalAdmin = canManageSystemResources(userType);
  const isSystemRole = role?.is_system_role || false;

  const canEdit = useMemo(() => {
    if (!role) return false;
    if (isGlobalAdmin) return true;
    if (isSystemRole) return false;
    return true;
  }, [role, isGlobalAdmin, isSystemRole]);

  const canDelete = useMemo(() => {
    if (!role) return false;
    if (isSystemRole) return false;
    if (isGlobalAdmin) return true;
    return true;
  }, [role, isSystemRole, isGlobalAdmin]);

  useEffect(() => {
    if (roleId && !isNaN(roleId)) {
      dispatch(fetchRoleById(roleId));
      dispatch(fetchRolePermissionsTree(roleId));
    }
    return () => {
      dispatch(clearCurrentRole());
    };
  }, [dispatch, roleId]);

  useEffect(() => {
    if (permissionsTree?.permissions_tree && permissionsTree.permissions_tree.length > 0 && expandedCategories.length === 0) {
      setExpandedCategories([permissionsTree.permissions_tree[0].category]);
    }
  }, [permissionsTree, expandedCategories.length]);

  useEffect(() => {
    if (hasAccess !== null && !hasAccess) {
      router.back();
    }
  }, [hasAccess, router]);

  const handleDeleteClick = () => {
    if (!canDelete) {
      toast.error("You do not have permission to delete this role");
      return;
    }
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!role) return;
    setIsDeleting(true);
    try {
      await dispatch(deleteRole(role.id)).unwrap();
      toast.success("Role deleted successfully");
      router.push("/dashboard/access-control/roles");
    } catch (error: any) {
      toast.error(error || "Failed to delete role");
    } finally {
      setIsDeleting(false);
    }
  };

  const handlePermissionToggle = useCallback((permissionId: number, currentlyChecked: boolean, isReadonly: boolean) => {
    if (isReadonly || (isSystemRole && !isGlobalAdmin)) {
      toast.error("You cannot modify this permission");
      return;
    }
    const newChanges = new Map(permissionChanges);
    const changeMode = currentlyChecked ? "D" : "I";
    if (newChanges.has(permissionId)) {
      newChanges.delete(permissionId);
    } else {
      newChanges.set(permissionId, changeMode);
    }
    setPermissionChanges(newChanges);
  }, [permissionChanges, isSystemRole, isGlobalAdmin]);

  const getEffectiveState = useCallback((permissionId: number, originalState: boolean) => {
    const change = permissionChanges.get(permissionId);
    if (change === "I") return true;
    if (change === "D") return false;
    return originalState;
  }, [permissionChanges]);

  const handleSavePermissions = async () => {
    if (!roleId || permissionChanges.size === 0) {
      toast.info("No changes to save");
      return;
    }
    if (isSystemRole && !isGlobalAdmin) {
      toast.error("System roles cannot be modified");
      return;
    }
    setIsSaving(true);
    try {
      const changes = Array.from(permissionChanges.entries()).map(([permissionId, mode]) => ({ mode, permissionId }));
      const result: any = await dispatch(bulkAssignRolePermissions({ roleId, changes })).unwrap();
      if (result?.filtered_out && result.filtered_out > 0) {
        toast.warning(`${result.filtered_out} changes were filtered (you don't have those permissions)`);
      } else {
        toast.success("Permissions updated successfully");
      }
      setPermissionChanges(new Map());
      dispatch(fetchRolePermissionsTree(roleId));
    } catch (error: any) {
      toast.error(error || "Failed to update permissions");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDiscardChanges = useCallback(() => {
    setPermissionChanges(new Map());
    toast.info("Changes discarded");
  }, []);

  const filteredTree = useMemo(() => {
    if (!permissionsTree?.permissions_tree) return [];
    if (!searchQuery) return permissionsTree.permissions_tree;
    return permissionsTree.permissions_tree.map((category) => {
      const filteredPerms = category.permissions.filter((perm) => {
        const q = searchQuery.toLowerCase();
        return perm.permission_key.toLowerCase().includes(q) || perm.resource.toLowerCase().includes(q) || perm.action.toLowerCase().includes(q) || (perm.description && perm.description.toLowerCase().includes(q));
      });
      return { ...category, permissions: filteredPerms };
    }).filter((cat) => cat.permissions.length > 0);
  }, [permissionsTree, searchQuery]);

  if (isLoading && !role) {
    return (
      <div className="flex flex-col gap-4">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-96" />
      </div>
    );
  }

  if (!role) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="text-center">
          <h3 className="text-lg font-semibold">Role not found</h3>
          <Button onClick={() => router.back()} variant="outline" className="mt-4">Go Back</Button>
        </div>
      </div>
    );
  }
  // app/dashboard/access-control/roles/[id]/page.tsx - BALANCED VERSION - PART 2
  // Continue from Part 1...

  return (
    <div className="flex flex-col gap-4">
      <ProtectedBreadcrumb items={[{ label: "Roles", menuKey: "dashboard.access-control.roles", href: "/dashboard/access-control/roles" }, { label: role.display_name || role.name, menuKey: "dashboard.access-control.roles", href: "", isCurrent: true }]} />

      {/* HEADER */}
      <div className="flex flex-col sm:flex-row items-start justify-between gap-3">
        <div className="flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            <h1 className="text-xl font-bold">{role.display_name || role.name}</h1>
            {isSystemRole && <Badge variant="primary">System</Badge>}
            {role.is_default && <Badge variant="outline">Default</Badge>}
          </div>
          <p className="text-muted-foreground text-sm mt-1">{role.description || "No description"}</p>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4 mr-1" />
            Back
          </Button>
          {canEdit && (
            <IfHasAccess menuKey="access-control.roles.edit">
              <Button variant="outline" size="sm" onClick={() => router.push(`/dashboard/access-control/roles/${roleId}/edit`)}>
                <Edit className="h-4 w-4 mr-1" />
                Edit
              </Button>
            </IfHasAccess>
          )}
          <Button variant="outline" size="sm" onClick={() => setCloneDialogOpen(true)}>
            <Copy className="h-4 w-4 mr-1" />
            Clone
          </Button>
          {canDelete && (
            <IfHasAccess menuKey="access-control.roles.delete">
              <Button variant="outline" size="sm" onClick={handleDeleteClick} className="text-destructive hover:text-destructive">
                <Trash2 className="h-4 w-4 mr-1" />
                Delete
              </Button>
            </IfHasAccess>
          )}
        </div>
      </div>

      {/* COMPACT STATS */}
      <div className="grid grid-cols-3 gap-3">
        <Card>
          <CardContent className="p-3">
            <div className="flex items-center gap-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10">
                <Users className="h-4 w-4 text-primary" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Users</p>
                <p className="text-lg font-bold">{role.users_count || 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-3">
            <div className="flex items-center gap-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10">
                <Key className="h-4 w-4 text-primary" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Permissions</p>
                <p className="text-lg font-bold">{role.permissions_count || 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-3">
            <div className="flex items-center gap-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10">
                <Shield className="h-4 w-4 text-primary" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Level</p>
                <p className="text-lg font-bold">{role.hierarchy_level || 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* TABS */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="permissions">
            Permissions
            {permissionChanges.size > 0 && <Badge variant="primary" className="ml-2">{permissionChanges.size}</Badge>}
          </TabsTrigger>
        </TabsList>

        {/* OVERVIEW TAB */}
        <TabsContent value="overview" className="space-y-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Role Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-xs text-muted-foreground">Role Name</Label>
                  <p className="text-sm font-medium mt-1">{role.name}</p>
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">Display Name</Label>
                  <p className="text-sm font-medium mt-1">{role.display_name || role.name}</p>
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">Hierarchy Level</Label>
                  <p className="text-sm font-medium mt-1">{role.hierarchy_level || 0}</p>
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">Type</Label>
                  <div className="mt-1">
                    <Badge variant={isSystemRole ? "primary" : "outline"}>{isSystemRole ? "System Role" : "Custom Role"}</Badge>
                  </div>
                </div>
                {role.created_at && (
                  <div>
                    <Label className="text-xs text-muted-foreground">Created At</Label>
                    <p className="text-sm font-medium mt-1">{new Date(role.created_at).toLocaleDateString()}</p>
                  </div>
                )}
                {role.updated_at && (
                  <div>
                    <Label className="text-xs text-muted-foreground">Updated At</Label>
                    <p className="text-sm font-medium mt-1">{new Date(role.updated_at).toLocaleDateString()}</p>
                  </div>
                )}
              </div>
              {role.description && (
                <div className="border-t pt-3">
                  <Label className="text-xs text-muted-foreground">Description</Label>
                  <p className="text-sm mt-1">{role.description}</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* PERMISSIONS TAB */}
        <TabsContent value="permissions" className="space-y-4">
          {isSystemRole && !isGlobalAdmin && (
            <Alert className="py-2.5">
              <Lock className="h-4 w-4" />
              <AlertDescription className="text-sm">System role - permissions locked (super admin only)</AlertDescription>
            </Alert>
          )}
          {!isGlobalAdmin && (
            <Alert className="py-2.5">
              <Info className="h-4 w-4" />
              <AlertDescription className="text-sm">You can only modify permissions you currently have</AlertDescription>
            </Alert>
          )}

          {permissionChanges.size > 0 && (
            <Card className="border-primary">
              <CardContent className="p-3">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <Badge variant="primary">{permissionChanges.size}</Badge>
                    <span className="text-sm font-medium">Unsaved changes</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" onClick={handleDiscardChanges} disabled={isSaving}>
                      <XCircle className="h-4 w-4 mr-1" />
                      Discard
                    </Button>
                    <Button size="sm" onClick={handleSavePermissions} disabled={isSaving}>
                      {isSaving ? <Loader2 className="h-4 w-4 mr-1 animate-spin" /> : <CheckCircle2 className="h-4 w-4 mr-1" />}
                      Save
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base">Permissions</CardTitle>
                {permissionsTree && (
                  <div className="flex items-center gap-3 text-sm">
                    <span className="text-primary font-semibold">{permissionsTree.summary.assigned_permissions}</span>
                    <span className="text-muted-foreground">/ {permissionsTree.summary.total_permissions}</span>
                  </div>
                )}
              </div>
            </CardHeader>
            <CardContent className="p-3 space-y-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input placeholder="Search permissions..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-9 h-9" />
              </div>

              {isLoading && !permissionsTree ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                </div>
              ) : permissionsTree && filteredTree.length > 0 ? (
                <Accordion type="multiple" value={expandedCategories} onValueChange={setExpandedCategories}>
                  {filteredTree.map((category) => {
                    const assignedCount = category.permissions.filter((p) => getEffectiveState(p.id, p.is_checked)).length;
                    return (
                      <AccordionItem key={category.category} value={category.category}>
                        <AccordionTrigger className="py-2.5 hover:no-underline">
                          <div className="flex items-center justify-between w-full pr-3">
                            <span className="text-sm font-medium">{category.category}</span>
                            <Badge variant="secondary">{assignedCount}/{category.permissions.length}</Badge>
                          </div>
                        </AccordionTrigger>
                        <AccordionContent>
                          <div className="space-y-2 pt-2">
                            {category.permissions.map((perm) => {
                              const effectiveState = getEffectiveState(perm.id, perm.is_checked);
                              const hasChange = permissionChanges.has(perm.id);
                              const isReadonly = perm.is_readonly || (isSystemRole && !isGlobalAdmin);
                              return (
                                <div key={perm.id} className={`flex items-start gap-2.5 rounded border p-2.5 ${hasChange ? "bg-primary/5 border-primary" : isReadonly ? "bg-muted/50 opacity-60" : "hover:bg-muted/50"}`}>
                                  <Checkbox className="mt-0.5" checked={effectiveState} onCheckedChange={() => handlePermissionToggle(perm.id, perm.is_checked, isReadonly)} disabled={isReadonly} />
                                  <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 flex-wrap">
                                      <span className={`text-sm font-medium ${isReadonly ? "text-muted-foreground" : ""}`}>{perm.resource}:{perm.action}</span>
                                      {hasChange && <Badge variant="primary" className="text-xs">{permissionChanges.get(perm.id) === "I" ? "Adding" : "Removing"}</Badge>}
                                      {isReadonly && <Lock className="h-3.5 w-3.5 text-muted-foreground" />}
                                      {perm.is_system_permission && <Badge variant="outline" className="text-xs">System</Badge>}
                                    </div>
                                    {perm.description && <p className="text-muted-foreground text-xs mt-1 leading-relaxed">{perm.description}</p>}
                                    {isReadonly && !isGlobalAdmin && <p className="text-xs text-amber-600 mt-1">🔒 Permission required</p>}
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </AccordionContent>
                      </AccordionItem>
                    );
                  })}
                </Accordion>
              ) : (
                <div className="text-center py-12">
                  <p className="text-muted-foreground text-sm">No permissions found</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Role</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{role.display_name || role.name}"? This action cannot be undone.
              {(role.users_count || 0) > 0 && <div className="text-destructive mt-2 font-medium">Warning: This role is assigned to {role.users_count} user(s).</div>}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteConfirm} disabled={isDeleting} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              {isDeleting ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <CloneRoleDialog open={cloneDialogOpen} onOpenChange={setCloneDialogOpen} sourceRole={role} onSuccess={() => { setCloneDialogOpen(false); toast.success("Role cloned successfully"); }} />
    </div>
  );
};

export default RoleDetailsPage;