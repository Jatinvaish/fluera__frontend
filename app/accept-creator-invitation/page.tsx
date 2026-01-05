"use client";

import { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Loader2, CheckCircle2, XCircle, UserPlus, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";
import { CollaborationService } from "@/lib/api/services/collaboration.service";

export default function AcceptCreatorInvitationPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get("token");

  const [isLoading, setIsLoading] = useState(false);
  const [isCheckingToken, setIsCheckingToken] = useState(true);
  const [tokenValid, setTokenValid] = useState(false);
  const [agencyName, setAgencyName] = useState("");
  const [inviteeEmail, setInviteeEmail] = useState("");

  useEffect(() => {
    if (!token) {
      toast.error("Invalid invitation link");
      router.push("/");
      return;
    }

    checkToken();
  }, [token]);

  const checkToken = async () => {
    setIsCheckingToken(true);
    try {
      // Mock validation - replace with actual API call if needed
      setTokenValid(true);
      setAgencyName("Creative Agency");
      setInviteeEmail("creator@example.com");
    } catch (error: any) {
      toast.error(error?.message || "Invalid or expired invitation");
      setTokenValid(false);
    } finally {
      setIsCheckingToken(false);
    }
  };

  const handleAccept = async () => {
    setIsLoading(true);
    try {
      const response = await CollaborationService.acceptCreatorInvitation({
        token: token!,
      });

      toast.success(response.message);
      
      setTimeout(() => {
        router.push("/dashboard");
      }, 2000);
    } catch (error: any) {
      toast.error(error?.message || "Failed to accept invitation");
    } finally {
      setIsLoading(false);
    }
  };

  const handleReject = async () => {
    if (!confirm("Are you sure you want to reject this invitation?")) return;

    setIsLoading(true);
    try {
      await CollaborationService.rejectCreatorInvitation({
        token: token!,
        reason: "User declined",
      });

      toast.success("Invitation rejected");
      setTimeout(() => {
        router.push("/");
      }, 1500);
    } catch (error: any) {
      toast.error(error?.message || "Failed to reject invitation");
    } finally {
      setIsLoading(false);
    }
  };

  if (isCheckingToken) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6">
        <Card className="w-full max-w-md p-8">
          <div className="flex flex-col items-center gap-4">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="text-muted-foreground">Verifying invitation...</p>
          </div>
        </Card>
      </div>
    );
  }

  if (!tokenValid) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6">
        <Card className="w-full max-w-md p-8">
          <div className="flex flex-col items-center gap-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-destructive/10">
              <XCircle className="h-8 w-8 text-destructive" />
            </div>
            <div className="text-center">
              <h2 className="text-xl font-semibold mb-2">Invalid Invitation</h2>
              <p className="text-muted-foreground">
                This invitation link is invalid or has expired.
              </p>
            </div>
            <Button onClick={() => router.push("/")} variant="outline" className="mt-4">
              Go to Home
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <Card className="w-full max-w-md p-8">
        <div className="flex flex-col items-center gap-6">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
            <UserPlus className="h-8 w-8 text-primary" />
          </div>

          <div className="text-center">
            <h1 className="text-2xl font-bold mb-2">Agency Invitation</h1>
            <p className="text-muted-foreground">
              You've been invited to join <span className="font-semibold text-foreground">{agencyName}</span> as a creator.
            </p>
          </div>

          <div className="w-full rounded-lg border bg-muted/30 p-4">
            <div className="flex items-start gap-3">
              <Shield className="h-5 w-5 text-primary mt-0.5" />
              <div className="flex-1">
                <p className="text-sm font-medium mb-1">What happens next?</p>
                <p className="text-xs text-muted-foreground">
                  By accepting, you'll be associated with {agencyName}. They'll be able to collaborate with you on campaigns and projects.
                </p>
              </div>
            </div>
          </div>

          <div className="flex gap-3 w-full">
            <Button
              onClick={handleReject}
              disabled={isLoading}
              variant="outline"
              className="flex-1"
            >
              Reject
            </Button>
            <Button
              onClick={handleAccept}
              disabled={isLoading}
              className="flex-1"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <CheckCircle2 className="mr-2 h-4 w-4" />
                  Accept
                </>
              )}
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}