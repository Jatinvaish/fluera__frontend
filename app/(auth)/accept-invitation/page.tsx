// app/(auth)/accept-invitation/page.tsx
"use client";
import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormMessage } from "@/components/ui/form";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { acceptInvite, login, clearError } from "@/store/slices/authSlice";
import { Loader2, Eye, EyeOff, CheckCircle2, AlertCircle } from "lucide-react";
import { toast } from "react-hot-toast";
import { z } from "zod";
import { Label } from "@/components/ui/label";
import Cookies from "js-cookie";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3060/api/v1";

const acceptInviteSchema = z
  .object({
    firstName: z.string().min(2, "First name must be at least 2 characters"),
    lastName: z.string().min(2, "Last name must be at least 2 characters"),
    password: z.string().min(8, "Password must be at least 8 characters"),
    confirmPassword: z.string().min(8, "Please confirm your password")
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"]
  });

const signInSchema = z.object({
  password: z.string().min(1, "Password is required")
});

type AcceptInviteFormValues = z.infer<typeof acceptInviteSchema>;
type SignInFormValues = z.infer<typeof signInSchema>;

export default function AcceptInvitationPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [invitationDetails, setInvitationDetails] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [existingUser, setExistingUser] = useState(false);

  const dispatch = useAppDispatch();
  const { isLoading, error, isAuthenticated, user } = useAppSelector((state) => state.auth);

  const token = searchParams.get("token");

  const form = useForm<AcceptInviteFormValues>({
    resolver: zodResolver(acceptInviteSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      password: "",
      confirmPassword: ""
    }
  });

  const signInForm = useForm<SignInFormValues>({
    resolver: zodResolver(signInSchema),
    defaultValues: {
      password: ""
    }
  });

  useEffect(() => {
    const fetchInvitationDetails = async () => {
      if (!token) {
        toast.error("Invalid invitation link");
        router.push("/sign-in");
        return;
      }

      try {
        setLoading(true);
        const response = await fetch(`${API_URL}/auth/invitation/details?token=${token}`, {
          headers: {
            "Content-Type": "application/json"
          }
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || "Invalid or expired invitation");
        }

        const data = await response.json();
        setInvitationDetails(data.data);

        // Check if user already exists
        if (data.data.user_exists) {
          setExistingUser(true);
        }

        if (data.data.invitee_name) {
          const nameParts = data.data.invitee_name.split(" ");
          form.setValue("firstName", nameParts[0] || "");
          form.setValue("lastName", nameParts.slice(1).join(" ") || "");
        }
      } catch (err: any) {
        console.error("Failed to fetch invitation:", err);
        toast.error(err.message || "Failed to load invitation");
        setTimeout(() => router.push("/sign-in"), 2000);
      } finally {
        setLoading(false);
      }
    };

    fetchInvitationDetails();
  }, [token, router, form]);

  useEffect(() => {
    if (isAuthenticated && user) {
      toast.success("Account created successfully! Welcome aboard!");
      router.push("/");
    }
  }, [isAuthenticated, user, router]);

  useEffect(() => {
    if (error) {
      toast.error(error);
    }
  }, [error]);

  const onSignIn = async (data: SignInFormValues) => {
    if (!invitationDetails?.invitee_email || !token) {
      toast.error("Invalid invitation data");
      return;
    }

    try {
      dispatch(clearError());
      
      // Call the accept-existing endpoint
      const accessToken = Cookies.get("accessToken");
      const response = await fetch(`${API_URL}/auth/invitation/accept-existing`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          token,
          password: data.password,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to accept invitation");
      }

      const result = await response.json();

      Cookies.remove("user");
      Cookies.remove("accessToken");
      Cookies.remove("refreshToken");
      
      toast.success("Invitation accepted! Please sign in.");
      await new Promise((resolve) => setTimeout(resolve, 500));
      router.push("/sign-in");
    } catch (err: any) {
      console.error("❌ Sign in error:", err);
      toast.error(err.message || "Invalid password");
    }
  };

  const onSubmit = async (data: AcceptInviteFormValues) => {
    if (!token) {
      toast.error("Invalid invitation token");
      return;
    }

    try {
      dispatch(clearError());

      const response: any = await dispatch(
        acceptInvite({
          token,
          firstName: data.firstName,
          lastName: data.lastName,
          password: data.password
        })
      ).unwrap();

      const result = response.data || response;

      if (!result.user || !result.accessToken) {
        console.error("❌ Missing auth data in response:", { result });
        toast.error("Incomplete authentication data received");
        return;
      }

      const tenantId = result.user.tenantId;

      if (!tenantId) {
        console.error("❌ No tenantId in response:", result);
        toast.error("Tenant information missing from response");
        return;
      }

      const userData = {
        ...result.user,
        tenantId,
        onboardingRequired: false,
        onboardingCompleted: true
      };

      Cookies.remove("user");
      Cookies.remove("accessToken");
      Cookies.remove("refreshToken");
      
      toast.success("Invitation accepted! Please sign in.");
      await new Promise((resolve) => setTimeout(resolve, 500));
      router.push("/sign-in");
    } catch (err: any) {
      console.error("❌ Accept invitation error:", err);
      
      if (err.message?.includes("already exists") || err.message?.includes("already a member")) {
        setExistingUser(true);
        toast.error("You already have an account. Please sign in instead.");
      } else {
        toast.error(err.message || "Failed to accept invitation");
      }
    }
  };

  if (loading) {
    return (
      <div className="bg-background flex min-h-screen items-center justify-center">
        <Card className="bg-accent w-96 rounded-2xl border-0">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Loader2 className="text-primary mb-4 h-8 w-8 animate-spin" />
            <p className="text-muted-foreground text-sm">Loading invitation...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!invitationDetails) {
    return null;
  }

  return (
    <div className="flex items-center justify-center py-4 lg:h-screen">
      <Card className="bg-accent mx-auto w-96 rounded-2xl border-0">
        <CardHeader className="space-y-0.5 pb-2 text-center">
          <div className="mb-0 inline-flex items-center justify-center gap-2 pr-3">
            <img src="/fluera-logo.svg" alt="Fluera logo" className="h-9 w-30" />
          </div>
          <CardTitle className="mt-3 pt-0.5 text-2xl font-bold">Accept Invitation</CardTitle>
          <CardDescription className="pt-0 text-xs">
            {existingUser ? "Sign in to join" : "Complete your profile to join"} {invitationDetails.tenant_name}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="bg-primary/5 border-primary/20 mb-4 rounded-lg border p-3">
            <div className="flex items-start gap-2">
              <CheckCircle2 className="text-primary mt-0.5 h-5 w-5 flex-shrink-0" />
              <div className="min-w-0 flex-1">
                <p className="text-foreground text-sm font-medium">
                  You've been invited as{" "}
                  <span className="text-muted-foreground mt-0.5 text-xs break-words">
                    {invitationDetails.role_display_name || invitationDetails.role_name}
                  </span>
                </p>

                {invitationDetails.invitee_email && (
                  <p className="text-muted-foreground mt-1 text-xs break-all">
                    Email: {invitationDetails.invitee_email}
                  </p>
                )}
              </div>
            </div>
          </div>

          {existingUser ? (
            <Form {...signInForm}>
              <form onSubmit={signInForm.handleSubmit(onSignIn)}>
                <div className="grid gap-3">
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-2">
                    <div className="flex items-start gap-2">
                      <AlertCircle className="h-4 w-4 text-yellow-600 mt-0.5 flex-shrink-0" />
                      <p className="text-sm text-yellow-800">
                        You already have an account. Please sign in to accept this invitation.
                      </p>
                    </div>
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="signin-password">Password</Label>
                    <FormField
                      control={signInForm.control}
                      name="password"
                      render={({ field }) => (
                        <FormItem>
                          <FormControl>
                            <div className="relative">
                              <Input
                                id="signin-password"
                                type={showPassword ? "text" : "password"}
                                placeholder="Enter your password"
                                disabled={isLoading}
                                {...field}
                              />
                              <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute top-1/2 right-3 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                disabled={isLoading}>
                                {showPassword ? (
                                  <EyeOff className="h-4 w-4" />
                                ) : (
                                  <Eye className="h-4 w-4" />
                                )}
                              </button>
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <Button
                    type="submit"
                    className="mt-2 h-10 w-full text-sm font-semibold"
                    disabled={isLoading}>
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Signing in...
                      </>
                    ) : (
                      "Sign In & Accept Invitation"
                    )}
                  </Button>

                  <Button
                    type="button"
                    variant="ghost"
                    className="w-full"
                    onClick={() => setExistingUser(false)}>
                    Back to registration
                  </Button>
                </div>
              </form>
            </Form>
          ) : (
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)}>
                <div className="grid gap-3">
                  <div className="grid gap-2">
                    <Label htmlFor="firstName">First Name</Label>
                    <FormField
                      control={form.control}
                      name="firstName"
                      render={({ field }) => (
                        <FormItem>
                          <FormControl>
                            <Input
                              id="firstName"
                              placeholder="Enter your first name"
                              disabled={isLoading}
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="lastName">Last Name</Label>
                    <FormField
                      control={form.control}
                      name="lastName"
                      render={({ field }) => (
                        <FormItem>
                          <FormControl>
                            <Input
                              id="lastName"
                              placeholder="Enter your last name"
                              disabled={isLoading}
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="password">Password</Label>
                    <FormField
                      control={form.control}
                      name="password"
                      render={({ field }) => (
                        <FormItem>
                          <FormControl>
                            <div className="relative">
                              <Input
                                id="password"
                                type={showPassword ? "text" : "password"}
                                placeholder="Create a password (min. 8 characters)"
                                disabled={isLoading}
                                {...field}
                              />
                              <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute top-1/2 right-3 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                disabled={isLoading}>
                                {showPassword ? (
                                  <EyeOff className="h-4 w-4" />
                                ) : (
                                  <Eye className="h-4 w-4" />
                                )}
                              </button>
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="confirmPassword">Confirm Password</Label>
                    <FormField
                      control={form.control}
                      name="confirmPassword"
                      render={({ field }) => (
                        <FormItem>
                          <FormControl>
                            <div className="relative">
                              <Input
                                id="confirmPassword"
                                type={showConfirmPassword ? "text" : "password"}
                                placeholder="Confirm your password"
                                disabled={isLoading}
                                {...field}
                              />
                              <button
                                type="button"
                                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                className="absolute top-1/2 right-3 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                disabled={isLoading}>
                                {showConfirmPassword ? (
                                  <EyeOff className="h-4 w-4" />
                                ) : (
                                  <Eye className="h-4 w-4" />
                                )}
                              </button>
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <Button
                    type="submit"
                    className="mt-2 h-10 w-full text-sm font-semibold"
                    disabled={isLoading}>
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Creating account...
                      </>
                    ) : (
                      "Accept Invitation & Sign In"
                    )}
                  </Button>
                </div>
              </form>
            </Form>
          )}

          <div className="text-muted-foreground mt-4 text-center text-sm">
            Already have an account?{" "}
            <button 
              onClick={() => setExistingUser(true)}
              className="text-foreground hover:text-primary underline">
              Sign in
            </button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}