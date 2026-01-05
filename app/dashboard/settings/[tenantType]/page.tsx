"use client";

import { useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { toast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";
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
        await dispatch(updateCreatorProfile(profile)).unwrap();
      } else if (slug === "brand") {
        await dispatch(updateBrandProfile(profile)).unwrap();
      } else if (slug === "agency") {
        await dispatch(updateAgencyProfile(profile)).unwrap();
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
      <div className="flex items-center justify-center h-96">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Profile Settings</h1>
        <p className="text-muted-foreground">
          Manage your {slug} profile information
        </p>
      </div>

      {slug === "creator" && <CreatorProfileForm profile={profile} updateField={updateField} />}
      {slug === "brand" && <BrandProfileForm profile={profile} updateField={updateField} />}
      {slug === "agency" && <AgencyProfileForm profile={profile} updateField={updateField} />}

      <div className="mt-6 flex justify-end">
        <Button onClick={handleSave} disabled={saving}>
          {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Save Changes
        </Button>
      </div>
    </div>
  );
}

function CreatorProfileForm({ profile, updateField }: any) {
  return (
    <div className="space-y-6">
      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4">Basic Information</h2>
        <div className="grid gap-4">
          <div>
            <Label htmlFor="stageName">Stage Name</Label>
            <Input
              id="stageName"
              value={profile?.stage_name || ""}
              onChange={(e) => updateField("stageName", e.target.value)}
            />
          </div>
          <div>
            <Label htmlFor="bio">Bio</Label>
            <Textarea
              id="bio"
              value={profile?.bio || ""}
              onChange={(e) => updateField("bio", e.target.value)}
              rows={4}
            />
          </div>
          <div>
            <Label htmlFor="location">Location</Label>
            <Input
              id="location"
              value={profile?.location || ""}
              onChange={(e) => updateField("location", e.target.value)}
            />
          </div>
          <div>
            <Label htmlFor="gender">Gender</Label>
            <Input
              id="gender"
              value={profile?.gender || ""}
              onChange={(e) => updateField("gender", e.target.value)}
            />
          </div>
        </div>
      </Card>

      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4">Media</h2>
        <div className="grid gap-4">
          <div>
            <Label htmlFor="profileImageUrl">Profile Image URL</Label>
            <Input
              id="profileImageUrl"
              value={profile?.profile_image_url || ""}
              onChange={(e) => updateField("profileImageUrl", e.target.value)}
            />
          </div>
          <div>
            <Label htmlFor="coverImageUrl">Cover Image URL</Label>
            <Input
              id="coverImageUrl"
              value={profile?.cover_image_url || ""}
              onChange={(e) => updateField("coverImageUrl", e.target.value)}
            />
          </div>
        </div>
      </Card>

      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4">Availability</h2>
        <div>
          <Label htmlFor="availabilityStatus">Status</Label>
          <select
            id="availabilityStatus"
            className="w-full border rounded-md p-2"
            value={profile?.availability_status || "available"}
            onChange={(e) => updateField("availabilityStatus", e.target.value)}
          >
            <option value="available">Available</option>
            <option value="busy">Busy</option>
            <option value="unavailable">Unavailable</option>
          </select>
        </div>
      </Card>
    </div>
  );
}

function BrandProfileForm({ profile, updateField }: any) {
  return (
    <div className="space-y-6">
      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4">Company Information</h2>
        <div className="grid gap-4">
          <div>
            <Label htmlFor="websiteUrl">Website URL</Label>
            <Input
              id="websiteUrl"
              value={profile?.website_url || ""}
              onChange={(e) => updateField("websiteUrl", e.target.value)}
            />
          </div>
          <div>
            <Label htmlFor="industry">Industry</Label>
            <Input
              id="industry"
              value={profile?.industry || ""}
              onChange={(e) => updateField("industry", e.target.value)}
            />
          </div>
          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={profile?.description || ""}
              onChange={(e) => updateField("description", e.target.value)}
              rows={4}
            />
          </div>
        </div>
      </Card>

      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4">Brand Guidelines</h2>
        <div className="grid gap-4">
          <div>
            <Label htmlFor="brandGuidelinesUrl">Brand Guidelines URL</Label>
            <Input
              id="brandGuidelinesUrl"
              value={profile?.brand_guidelines_url || ""}
              onChange={(e) => updateField("brandGuidelinesUrl", e.target.value)}
            />
          </div>
          <div>
            <Label htmlFor="brandValues">Brand Values</Label>
            <Textarea
              id="brandValues"
              value={profile?.brand_values || ""}
              onChange={(e) => updateField("brandValues", e.target.value)}
              rows={3}
            />
          </div>
          <div>
            <Label htmlFor="targetDemographics">Target Demographics</Label>
            <Textarea
              id="targetDemographics"
              value={profile?.target_demographics || ""}
              onChange={(e) => updateField("targetDemographics", e.target.value)}
              rows={3}
            />
          </div>
        </div>
      </Card>

      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4">Campaign Settings</h2>
        <div className="grid gap-4">
          <div>
            <Label htmlFor="budgetRange">Budget Range</Label>
            <Input
              id="budgetRange"
              value={profile?.budget_range || ""}
              onChange={(e) => updateField("budgetRange", e.target.value)}
            />
          </div>
          <div>
            <Label htmlFor="campaignObjectives">Campaign Objectives</Label>
            <Textarea
              id="campaignObjectives"
              value={profile?.campaign_objectives || ""}
              onChange={(e) => updateField("campaignObjectives", e.target.value)}
              rows={3}
            />
          </div>
          <div className="flex items-center space-x-2">
            <Switch
              id="contentApprovalRequired"
              checked={profile?.content_approval_required || false}
              onCheckedChange={(checked) => updateField("contentApprovalRequired", checked)}
            />
            <Label htmlFor="contentApprovalRequired">Content Approval Required</Label>
          </div>
          <div className="flex items-center space-x-2">
            <Switch
              id="autoApproveCreators"
              checked={profile?.auto_approve_creators || false}
              onCheckedChange={(checked) => updateField("autoApproveCreators", checked)}
            />
            <Label htmlFor="autoApproveCreators">Auto-Approve Creators</Label>
          </div>
        </div>
      </Card>

      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4">Contact Information</h2>
        <div className="grid gap-4">
          <div>
            <Label htmlFor="primaryContactName">Primary Contact Name</Label>
            <Input
              id="primaryContactName"
              value={profile?.primary_contact_name || ""}
              onChange={(e) => updateField("primaryContactName", e.target.value)}
            />
          </div>
          <div>
            <Label htmlFor="primaryContactEmail">Primary Contact Email</Label>
            <Input
              id="primaryContactEmail"
              type="email"
              value={profile?.primary_contact_email || ""}
              onChange={(e) => updateField("primaryContactEmail", e.target.value)}
            />
          </div>
          <div>
            <Label htmlFor="primaryContactPhone">Primary Contact Phone</Label>
            <Input
              id="primaryContactPhone"
              value={profile?.primary_contact_phone || ""}
              onChange={(e) => updateField("primaryContactPhone", e.target.value)}
            />
          </div>
        </div>
      </Card>
    </div>
  );
}

function AgencyProfileForm({ profile, updateField }: any) {
  return (
    <div className="space-y-6">
      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4">Agency Information</h2>
        <div className="grid gap-4">
          <div>
            <Label htmlFor="agencyName">Agency Name</Label>
            <Input
              id="agencyName"
              value={profile?.agency_name || ""}
              onChange={(e) => updateField("agencyName", e.target.value)}
            />
          </div>
          <div>
            <Label htmlFor="websiteUrl">Website URL</Label>
            <Input
              id="websiteUrl"
              value={profile?.website_url || ""}
              onChange={(e) => updateField("websiteUrl", e.target.value)}
            />
          </div>
          <div>
            <Label htmlFor="registrationNumber">Registration Number</Label>
            <Input
              id="registrationNumber"
              value={profile?.registration_number || ""}
              onChange={(e) => updateField("registrationNumber", e.target.value)}
            />
          </div>
          <div>
            <Label htmlFor="industrySpecialization">Industry Specialization</Label>
            <Input
              id="industrySpecialization"
              value={profile?.industry_specialization || ""}
              onChange={(e) => updateField("industrySpecialization", e.target.value)}
            />
          </div>
          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={profile?.description || ""}
              onChange={(e) => updateField("description", e.target.value)}
              rows={4}
            />
          </div>
        </div>
      </Card>

      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4">Company Details</h2>
        <div className="grid gap-4">
          <div>
            <Label htmlFor="yearEstablished">Year Established</Label>
            <Input
              id="yearEstablished"
              type="number"
              value={profile?.year_established || ""}
              onChange={(e) => updateField("yearEstablished", parseInt(e.target.value))}
            />
          </div>
          <div>
            <Label htmlFor="companySize">Company Size</Label>
            <Input
              id="companySize"
              value={profile?.company_size || ""}
              onChange={(e) => updateField("companySize", e.target.value)}
            />
          </div>
          <div>
            <Label htmlFor="serviceOfferings">Service Offerings</Label>
            <Textarea
              id="serviceOfferings"
              value={profile?.service_offerings || ""}
              onChange={(e) => updateField("serviceOfferings", e.target.value)}
              rows={3}
            />
          </div>
          <div>
            <Label htmlFor="targetMarkets">Target Markets</Label>
            <Textarea
              id="targetMarkets"
              value={profile?.target_markets || ""}
              onChange={(e) => updateField("targetMarkets", e.target.value)}
              rows={3}
            />
          </div>
        </div>
      </Card>

      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4">Credentials</h2>
        <div className="grid gap-4">
          <div>
            <Label htmlFor="certifications">Certifications</Label>
            <Textarea
              id="certifications"
              value={profile?.certifications || ""}
              onChange={(e) => updateField("certifications", e.target.value)}
              rows={3}
            />
          </div>
          <div>
            <Label htmlFor="awards">Awards</Label>
            <Textarea
              id="awards"
              value={profile?.awards || ""}
              onChange={(e) => updateField("awards", e.target.value)}
              rows={3}
            />
          </div>
          <div>
            <Label htmlFor="caseStudiesUrl">Case Studies URL</Label>
            <Input
              id="caseStudiesUrl"
              value={profile?.case_studies_url || ""}
              onChange={(e) => updateField("caseStudiesUrl", e.target.value)}
            />
          </div>
        </div>
      </Card>

      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4">Contact & Billing</h2>
        <div className="grid gap-4">
          <div>
            <Label htmlFor="primaryContactName">Primary Contact Name</Label>
            <Input
              id="primaryContactName"
              value={profile?.primary_contact_name || ""}
              onChange={(e) => updateField("primaryContactName", e.target.value)}
            />
          </div>
          <div>
            <Label htmlFor="primaryContactEmail">Primary Contact Email</Label>
            <Input
              id="primaryContactEmail"
              type="email"
              value={profile?.primary_contact_email || ""}
              onChange={(e) => updateField("primaryContactEmail", e.target.value)}
            />
          </div>
          <div>
            <Label htmlFor="primaryContactPhone">Primary Contact Phone</Label>
            <Input
              id="primaryContactPhone"
              value={profile?.primary_contact_phone || ""}
              onChange={(e) => updateField("primaryContactPhone", e.target.value)}
            />
          </div>
          <div>
            <Label htmlFor="commissionRate">Commission Rate (%)</Label>
            <Input
              id="commissionRate"
              type="number"
              step="0.01"
              value={profile?.commission_rate || ""}
              onChange={(e) => updateField("commissionRate", parseFloat(e.target.value))}
            />
          </div>
        </div>
      </Card>
    </div>
  );
}
