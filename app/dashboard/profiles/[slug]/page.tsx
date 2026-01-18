"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "@/hooks/use-toast";
import { Loader2, Share2 } from "lucide-react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
  fetchCreatorProfile,
  fetchBrandProfile,
  fetchAgencyProfile,
  updateCreatorProfile,
  updateBrandProfile,
  updateAgencyProfile,
  updateProfileField,
} from "@/store/slices/profileSlice";
import type { CreatorProfile, BrandProfile, AgencyProfile } from "@/lib/api";

export default function ProfileSettingsPage() {
  const params = useParams();
  const router = useRouter();
  const dispatch = useAppDispatch();
  const slug = params.slug as string;

  const { profile, loading, saving, error } = useAppSelector((state) => state.profile);

  useEffect(() => {
    loadProfile();
  }, [slug]);

  useEffect(() => {
    if (error) {
      toast({ title: "Error", description: error, variant: "destructive" });
    }
  }, [error]);

  const loadProfile = async () => {
    if (slug === "creator") {
      dispatch(fetchCreatorProfile());
    } else if (slug === "brand") {
      dispatch(fetchBrandProfile());
    } else if (slug === "agency") {
      dispatch(fetchAgencyProfile());
    } else {
      toast({ title: "Invalid tenant type", variant: "destructive" });
      router.push("/dashboard");
    }
  };

  const handleSave = async () => {
    if (!profile) return;

    try {
      if (slug === "creator") {
        await dispatch(updateCreatorProfile(profile as CreatorProfile)).unwrap();
      } else if (slug === "brand") {
        await dispatch(updateBrandProfile(profile as BrandProfile)).unwrap();
      } else if (slug === "agency") {
        await dispatch(updateAgencyProfile(profile as AgencyProfile)).unwrap();
      }
      toast({ title: "Profile updated successfully" });
    } catch (error: any) {
      toast({ title: "Error updating profile", description: error, variant: "destructive" });
    }
  };

  const updateField = (field: string, value: any) => {
    dispatch(updateProfileField({ field, value }));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="bg-background border-b">
        <div className="w-full px-4 py-3">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <h1 className="text-xl font-semibold">Profile Settings</h1>
            <div className="flex gap-2">
              {slug === "creator" && (
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => router.push('/dashboard/social-platforms')}
                >
                  <Share2 className="mr-2 h-4 w-4" />
                  Connect Social Platforms
                </Button>
              )}
              <Button variant="outline" size="sm" onClick={() => router.back()}>Cancel</Button>
              <Button size="sm" onClick={handleSave} disabled={saving}>
                {saving && <Loader2 className="mr-2 h-3 w-3 animate-spin" />}
                Save
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="w-full p-4">
        {slug === "creator" && <CreatorProfileForm profile={profile} updateField={updateField} />}
        {slug === "brand" && <BrandProfileForm profile={profile} updateField={updateField} />}
        {slug === "agency" && <AgencyProfileForm profile={profile} updateField={updateField} />}
      </div>
    </div>
  );
}

function CreatorProfileForm({ profile, updateField }: any) {
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Creator Profile</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label htmlFor="stageName">Stage Name</Label>
            <Input
              id="stageName"
              value={profile?.stage_name || ""}
              onChange={(e) => updateField("stage_name", e.target.value)}
              maxLength={100}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="location">Location</Label>
            <Input
              id="location"
              value={profile?.location || ""}
              onChange={(e) => updateField("location", e.target.value)}
              maxLength={100}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="gender">Gender</Label>
            <Input
              id="gender"
              value={profile?.gender || ""}
              onChange={(e) => updateField("gender", e.target.value)}
              maxLength={50}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="dateOfBirth">Date of Birth</Label>
            <Input
              id="dateOfBirth"
              type="date"
              value={profile?.date_of_birth?.split('T')[0] || ""}
              onChange={(e) => updateField("date_of_birth", e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="availabilityStatus">Availability Status</Label>
            <Select
              value={profile?.availability_status || "available"}
              onValueChange={(value) => updateField("availability_status", value)}
            >
              <SelectTrigger id="availabilityStatus">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="available">Available</SelectItem>
                <SelectItem value="busy">Busy</SelectItem>
                <SelectItem value="unavailable">Unavailable</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <div className="space-y-2">
          <Label htmlFor="bio">Bio</Label>
          <Textarea
            id="bio"
            value={profile?.bio || ""}
            onChange={(e) => updateField("bio", e.target.value)}
            rows={3}
            maxLength={1000}
          />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="profileImageUrl">Profile Image URL</Label>
            <Input
              id="profileImageUrl"
              type="url"
              value={profile?.profile_image_url || ""}
              onChange={(e) => updateField("profile_image_url", e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="coverImageUrl">Cover Image URL</Label>
            <Input
              id="coverImageUrl"
              type="url"
              value={profile?.cover_image_url || ""}
              onChange={(e) => updateField("cover_image_url", e.target.value)}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function BrandProfileForm({ profile, updateField }: any) {
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Brand Profile</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label htmlFor="websiteUrl">Website URL</Label>
            <Input
              id="websiteUrl"
              type="url"
              value={profile?.website_url || ""}
              onChange={(e) => updateField("website_url", e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="industry">Industry</Label>
            <Input
              id="industry"
              value={profile?.industry || ""}
              onChange={(e) => updateField("industry", e.target.value)}
              maxLength={100}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="budgetRange">Budget Range</Label>
            <Input
              id="budgetRange"
              value={profile?.budget_range || ""}
              onChange={(e) => updateField("budget_range", e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="targetDemographics">Target Demographics</Label>
            <Input
              id="targetDemographics"
              value={profile?.target_demographics || ""}
              onChange={(e) => updateField("target_demographics", e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="brandValues">Brand Values</Label>
            <Input
              id="brandValues"
              value={profile?.brand_values || ""}
              onChange={(e) => updateField("brand_values", e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="paymentTerms">Payment Terms (days)</Label>
            <Input
              id="paymentTerms"
              type="number"
              min={0}
              value={profile?.payment_terms ?? ""}
              onChange={(e) => updateField("payment_terms", e.target.value ? parseInt(e.target.value) : null)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="preferredPaymentMethod">Preferred Payment Method</Label>
            <Input
              id="preferredPaymentMethod"
              value={profile?.preferred_payment_method || ""}
              onChange={(e) => updateField("preferred_payment_method", e.target.value)}
            />
          </div>
        </div>
        <div className="space-y-2">
          <Label htmlFor="description">Description</Label>
          <Textarea
            id="description"
            value={profile?.description || ""}
            onChange={(e) => updateField("description", e.target.value)}
            rows={3}
            maxLength={1000}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="campaignObjectives">Campaign Objectives</Label>
          <Textarea
            id="campaignObjectives"
            value={profile?.campaign_objectives || ""}
            onChange={(e) => updateField("campaign_objectives", e.target.value)}
            rows={2}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="contentRestrictions">Content Restrictions</Label>
          <Textarea
            id="contentRestrictions"
            value={profile?.content_restrictions || ""}
            onChange={(e) => updateField("content_restrictions", e.target.value)}
            rows={2}
          />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="brandGuidelinesUrl">Brand Guidelines URL</Label>
            <Input
              id="brandGuidelinesUrl"
              type="url"
              value={profile?.brand_guidelines_url || ""}
              onChange={(e) => updateField("brand_guidelines_url", e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="billingAddress">Billing Address</Label>
            <Input
              id="billingAddress"
              value={profile?.billing_address || ""}
              onChange={(e) => updateField("billing_address", e.target.value)}
            />
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label htmlFor="primaryContactName">Primary Contact Name</Label>
            <Input
              id="primaryContactName"
              value={profile?.primary_contact_name || ""}
              onChange={(e) => updateField("primary_contact_name", e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="primaryContactEmail">Primary Contact Email</Label>
            <Input
              id="primaryContactEmail"
              type="email"
              value={profile?.primary_contact_email || ""}
              onChange={(e) => updateField("primary_contact_email", e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="primaryContactPhone">Primary Contact Phone</Label>
            <Input
              id="primaryContactPhone"
              type="tel"
              value={profile?.primary_contact_phone || ""}
              onChange={(e) => updateField("primary_contact_phone", e.target.value)}
            />
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="flex items-center space-x-2">
            <Switch
              id="contentApprovalRequired"
              checked={profile?.content_approval_required ?? false}
              onCheckedChange={(checked) => updateField("content_approval_required", checked)}
            />
            <Label htmlFor="contentApprovalRequired">Content Approval Required</Label>
          </div>
          <div className="flex items-center space-x-2">
            <Switch
              id="autoApproveCreators"
              checked={profile?.auto_approve_creators ?? false}
              onCheckedChange={(checked) => updateField("auto_approve_creators", checked)}
            />
            <Label htmlFor="autoApproveCreators">Auto Approve Creators</Label>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function AgencyProfileForm({ profile, updateField }: any) {
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Agency Profile</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label htmlFor="agencyName">Agency Name</Label>
            <Input
              id="agencyName"
              value={profile?.agency_name || ""}
              onChange={(e) => updateField("agency_name", e.target.value)}
              maxLength={200}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="websiteUrl">Website URL</Label>
            <Input
              id="websiteUrl"
              type="url"
              value={profile?.website_url || ""}
              onChange={(e) => updateField("website_url", e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="registrationNumber">Registration Number</Label>
            <Input
              id="registrationNumber"
              value={profile?.registration_number || ""}
              onChange={(e) => updateField("registration_number", e.target.value)}
              maxLength={100}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="industrySpecialization">Industry Specialization</Label>
            <Input
              id="industrySpecialization"
              value={profile?.industry_specialization || ""}
              onChange={(e) => updateField("industry_specialization", e.target.value)}
              maxLength={200}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="yearEstablished">Year Established</Label>
            <Input
              id="yearEstablished"
              type="number"
              value={profile?.year_established ?? ""}
              onChange={(e) => updateField("year_established", e.target.value ? parseInt(e.target.value) : null)}
              min={1800}
              max={new Date().getFullYear()}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="companySize">Company Size</Label>
            <Input
              id="companySize"
              value={profile?.company_size || ""}
              onChange={(e) => updateField("company_size", e.target.value)}
              maxLength={50}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="commissionRate">Commission Rate (%)</Label>
            <Input
              id="commissionRate"
              type="number"
              value={profile?.commission_rate ?? ""}
              onChange={(e) => updateField("commission_rate", e.target.value ? parseInt(e.target.value) : null)}
              min={0}
              max={100}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="paymentTerms">Payment Terms (days)</Label>
            <Input
              id="paymentTerms"
              type="number"
              value={profile?.payment_terms ?? ""}
              onChange={(e) => updateField("payment_terms", e.target.value ? parseInt(e.target.value) : null)}
              min={0}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="preferredPaymentMethod">Preferred Payment Method</Label>
            <Input
              id="preferredPaymentMethod"
              value={profile?.preferred_payment_method || ""}
              onChange={(e) => updateField("preferred_payment_method", e.target.value)}
            />
          </div>
        </div>
        <div className="space-y-2">
          <Label htmlFor="description">Description</Label>
          <Textarea
            id="description"
            value={profile?.description || ""}
            onChange={(e) => updateField("description", e.target.value)}
            rows={3}
            maxLength={1000}
          />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="serviceOfferings">Service Offerings</Label>
            <Textarea
              id="serviceOfferings"
              value={profile?.service_offerings || ""}
              onChange={(e) => updateField("service_offerings", e.target.value)}
              rows={2}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="targetMarkets">Target Markets</Label>
            <Textarea
              id="targetMarkets"
              value={profile?.target_markets || ""}
              onChange={(e) => updateField("target_markets", e.target.value)}
              rows={2}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="clientPortfolio">Client Portfolio</Label>
            <Textarea
              id="clientPortfolio"
              value={profile?.client_portfolio || ""}
              onChange={(e) => updateField("client_portfolio", e.target.value)}
              rows={2}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="certifications">Certifications</Label>
            <Textarea
              id="certifications"
              value={profile?.certifications || ""}
              onChange={(e) => updateField("certifications", e.target.value)}
              rows={2}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="awards">Awards</Label>
            <Textarea
              id="awards"
              value={profile?.awards || ""}
              onChange={(e) => updateField("awards", e.target.value)}
              rows={2}
            />
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="caseStudiesUrl">Case Studies URL</Label>
            <Input
              id="caseStudiesUrl"
              type="url"
              value={profile?.case_studies_url || ""}
              onChange={(e) => updateField("case_studies_url", e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="billingAddress">Billing Address</Label>
            <Input
              id="billingAddress"
              value={profile?.billing_address || ""}
              onChange={(e) => updateField("billing_address", e.target.value)}
            />
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label htmlFor="primaryContactName">Primary Contact Name</Label>
            <Input
              id="primaryContactName"
              value={profile?.primary_contact_name || ""}
              onChange={(e) => updateField("primary_contact_name", e.target.value)}
              maxLength={100}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="primaryContactEmail">Primary Contact Email</Label>
            <Input
              id="primaryContactEmail"
              type="email"
              value={profile?.primary_contact_email || ""}
              onChange={(e) => updateField("primary_contact_email", e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="primaryContactPhone">Primary Contact Phone</Label>
            <Input
              id="primaryContactPhone"
              type="tel"
              value={profile?.primary_contact_phone || ""}
              onChange={(e) => updateField("primary_contact_phone", e.target.value)}
              maxLength={20}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
