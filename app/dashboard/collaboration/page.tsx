"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { Plus, Search, X, Loader2, Send, CheckCircle2, XCircle, UserPlus, Upload, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardFooter, CardHeader, CardTable } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAppSelector } from "@/store/hooks";
import { selectUser } from "@/store/slices/authSlice";
import { CollaborationService, type CreatorInviteResult, type AgencyCreator } from "@/lib/api/services/collaboration.service";

export default function AgencyCreatorsPage() {
  const currentUser = useAppSelector(selectUser);

  const [creators, setCreators] = useState<AgencyCreator[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchInput, setSearchInput] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "pending" | "approved" | "rejected" | "all">("all");
  const [inviteDialogOpen, setInviteDialogOpen] = useState(false);
  const [emailsInput, setEmailsInput] = useState("");
  const [emailChips, setEmailChips] = useState<string[]>([]);
  const [roleId] = useState("5");
  const [inviteMessage] = useState("");
  const [isInviting, setIsInviting] = useState(false);
  const [inviteResults, setInviteResults] = useState<CreatorInviteResult[]>([]);
  const [showResults, setShowResults] = useState(false);

  const fetchCreators = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await CollaborationService.getAgencyCreators({
        status: statusFilter === "all" ? undefined : statusFilter as any
      });
      setCreators(response.data || []);
    } catch (error: any) {
      toast.error(error?.message || "Failed to load creators");
    } finally {
      setIsLoading(false);
    }
  }, [statusFilter]);


  useEffect(() => {
    fetchCreators();
  }, [fetchCreators]);

  const filteredCreators = useMemo(() => {
    if (!searchInput) return creators;
    const search = searchInput.toLowerCase();
    return creators.filter(
      (c) =>
        c.creator_name?.toLowerCase().includes(search) ||
        c.stage_name?.toLowerCase().includes(search)
    );
  }, [creators, searchInput]);

  const handleBulkInvite = async () => {
    const allEmails = [...emailChips];
    if (emailsInput.trim() && emailsInput.includes('@')) {
      allEmails.push(emailsInput.trim());
    }

    if (allEmails.length === 0) {
      toast.error("Please enter at least one email");
      return;
    }

    setIsInviting(true);
    try {
      const response = await CollaborationService.bulkInviteCreators({
        emails: allEmails.join(', '),
        roleId: Number(roleId),
        message: inviteMessage || undefined
      });

      setInviteResults(response.data.details);
      setShowResults(true);

      toast.success(
        `${response.data.successful} sent${response.data.alreadyExisted > 0 ? `, ${response.data.alreadyExisted} already existed` : ""
        }${response.data.failed > 0 ? `, ${response.data.failed} failed` : ""
        }`
      );

      fetchCreators();
    } catch (error: any) {
      toast.error(error?.message || "Failed to send invitations");
    } finally {
      setIsInviting(false);
    }
  };

  const handleCloseInviteDialog = () => {
    setInviteDialogOpen(false);
    setShowResults(false);
    setEmailsInput("");
    setEmailChips([]);
    setInviteResults([]);
  };

  const handleEmailInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;

    if (value.endsWith(',') || value.endsWith(' ')) {
      const email = value.slice(0, -1).trim();
      if (email && email.includes('@') && !emailChips.includes(email)) {
        setEmailChips([...emailChips, email]);
        setEmailsInput('');
      } else {
        setEmailsInput('');
      }
    } else {
      setEmailsInput(value);
    }
  };

  const handleEmailKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      const email = emailsInput.trim();
      if (email && email.includes('@') && !emailChips.includes(email)) {
        setEmailChips([...emailChips, email]);
        setEmailsInput('');
      }
    } else if (e.key === 'Backspace' && !emailsInput && emailChips.length > 0) {
      setEmailChips(emailChips.slice(0, -1));
    }
  };

  const removeEmailChip = (email: string) => {
    setEmailChips(emailChips.filter(e => e !== email));
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      const lines = text.split('\n');
      const emails = lines
        .map(line => line.split(',')[0].trim())
        .filter(email => email && email.includes('@'));

      const uniqueEmails = Array.from(new Set([...emailChips, ...emails]));
      setEmailChips(uniqueEmails);
      setEmailsInput(uniqueEmails.join(', '));
      toast.success(`${emails.length} email(s) loaded from CSV`);
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const downloadSampleCSV = () => {
    const sample = 'email\ncreator1@example.com\ncreator2@example.com\ncreator3@example.com';
    const blob = new Blob([sample], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'sample-emails.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  const getStatusBadge = (requestStatus: string, associationStatus: string | null) => {
    // Map request_status + association_status to display status
    if (requestStatus === "pending") {
      return <Badge className="bg-yellow-500/10 text-yellow-700 dark:text-yellow-400 border-0">Pending</Badge>;
    }
    if (requestStatus === "accepted" && associationStatus === "active") {
      return <Badge className="bg-green-500/10 text-green-700 dark:text-green-400 border-0">Approved</Badge>;
    }
    if (requestStatus === "rejected") {
      return <Badge className="bg-red-500/10 text-red-700 dark:text-red-400 border-0">Rejected</Badge>;
    }
    return <Badge variant="outline">{requestStatus}</Badge>;
  };

  return (
    <div className="flex flex-col gap-6 p-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Creator Network</h1>
        <Button onClick={() => setInviteDialogOpen(true)} className="gap-2">
          <UserPlus className="h-4 w-4" />
          Invite
        </Button>
      </div>

      <Card className="py-4 gap-3">
        <CardHeader className="px-4">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search creators..."
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                className="pl-9"
              />
              {searchInput && (
                <Button
                  mode="icon"
                  variant="ghost"
                  size="sm"
                  className="absolute right-1 top-1/2 -translate-y-1/2"
                  onClick={() => setSearchInput("")}>
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>

            <Select value={statusFilter} onValueChange={(v: any) => setStatusFilter(v)}>
              <SelectTrigger className="w-[140px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="approved">Approved</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>

        <CardTable>
          {isLoading ? (
            <div className="flex items-center justify-center py-16">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : filteredCreators.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16">
              <p className="text-muted-foreground mb-3">No creators found</p>
              <Button variant="dashed" onClick={() => setInviteDialogOpen(true)} className="gap-2">
                <UserPlus className="h-4 w-4" />
                Invite your first creator
              </Button>
            </div>
          ) : (
            <div className="divide-y divide-border/50">
              {filteredCreators.map((creator) => (
                <div key={creator.id} className="flex items-center justify-between p-4 hover:bg-muted/50 transition-colors">
                  <div className="flex items-center gap-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                      <span className="text-sm font-semibold text-primary">
                        {(creator.creator_name || creator.invitee_email)?.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div>
                      <p className="font-semibold">
                        {creator.creator_name || creator.invitee_email}
                      </p>
                      {creator.stage_name && (
                        <p className="text-sm text-muted-foreground">@{creator.stage_name}</p>
                      )}
                      {!creator.creator_tenant_id && (
                        <p className="text-xs text-muted-foreground italic">Pending onboarding</p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-6">
                    {creator.follower_count_total && (
                      <div className="text-right">
                        <p className="text-sm font-semibold">
                          {(creator.follower_count_total / 1000).toFixed(1)}K
                        </p>
                        <p className="text-xs text-muted-foreground">followers</p>
                      </div>
                    )}

                    {creator.active_collaborations > 0 && (
                      <Badge variant="outline" className="text-primary border-primary/20">
                        {creator.active_collaborations} active
                      </Badge>
                    )}

                    {getStatusBadge(creator.request_status, creator.association_status)}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardTable>
      </Card>

      <Dialog open={inviteDialogOpen} onOpenChange={handleCloseInviteDialog}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Invite Creators</DialogTitle>
          </DialogHeader>

          {!showResults ? (
            <div className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <Label className="text-sm font-medium">Email Addresses</Label>
                  <div className="flex gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={downloadSampleCSV}
                      className="h-7 text-xs gap-1">
                      <Download className="h-3 w-3" />
                      Sample
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => document.getElementById('csv-upload')?.click()}
                      className="h-7 text-xs gap-1">
                      <Upload className="h-3 w-3" />
                      Upload CSV
                    </Button>
                    <input
                      id="csv-upload"
                      type="file"
                      accept=".csv"
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                  </div>
                </div>
                <div className="border rounded-lg p-2 min-h-[100px] flex flex-wrap gap-2 items-start">
                  {emailChips.map((email, idx) => (
                    <Badge key={idx} variant="secondary" className="gap-1 pl-2 pr-1 h-7">
                      {email}
                      <Button
                        mode="icon"
                        variant="ghost"
                        size="sm"
                        className="h-4 w-4 p-0 hover:bg-transparent"
                        onClick={() => removeEmailChip(email)}>
                        <X className="h-3 w-3" />
                      </Button>
                    </Badge>
                  ))}
                  <Input
                    placeholder={emailChips.length === 0 ? "Type email and press comma or enter..." : "Add more..."}
                    value={emailsInput}
                    onChange={handleEmailInputChange}
                    onKeyDown={handleEmailKeyDown}
                    className="border-0 shadow-none focus-visible:ring-0 flex-1 min-w-[200px] h-7 px-1"
                  />
                </div>
                <p className="mt-2 text-xs text-muted-foreground">
                  Press comma, space, or enter to add email. Upload CSV for bulk import.
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="max-h-[350px] space-y-2 overflow-y-auto">
                {inviteResults.map((result, idx) => (
                  <div
                    key={idx}
                    className={`flex items-center justify-between rounded-lg border p-3 ${result.status === "success"
                      ? "border-green-500/20 bg-green-500/5"
                      : result.status === "already_existed"
                        ? "border-blue-500/20 bg-blue-500/5"
                        : "border-red-500/20 bg-red-500/5"
                      }`}>
                    <div className="flex items-center gap-2">
                      {result.status === "success" ? (
                        <CheckCircle2 className="h-4 w-4 text-green-600 dark:text-green-400" />
                      ) : result.status === "already_existed" ? (
                        <CheckCircle2 className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                      ) : (
                        <XCircle className="h-4 w-4 text-red-600 dark:text-red-400" />
                      )}
                      <span className="text-sm font-medium">{result.email}</span>
                    </div>
                    <p className="text-xs text-muted-foreground">{result.message}</p>
                  </div>
                ))}

              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={handleCloseInviteDialog}>
              {showResults ? "Close" : "Cancel"}
            </Button>
            {!showResults && (
              <Button onClick={handleBulkInvite} disabled={isInviting}>
                {isInviting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Sending...
                  </>
                ) : (
                  <>
                    <Send className="mr-2 h-4 w-4" />
                    Send
                  </>
                )}
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}