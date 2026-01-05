import { encryptedApiClient } from '../encrypted-client';
import { API_ENDPOINTS } from '../endpoints';

export interface CreatorProfile {
  stageName?: string;
  bio?: string;
  dateOfBirth?: string;
  gender?: string;
  profileImageUrl?: string;
  coverImageUrl?: string;
  location?: string;
  languages?: string[];
  categories?: string[];
  contentTypes?: string[];
  availabilityStatus?: string;
  preferredBrands?: string[];
  excludedBrands?: string[];
}

export interface BrandProfile {
  websiteUrl?: string;
  industry?: string;
  description?: string;
  brandGuidelinesUrl?: string;
  targetDemographics?: string;
  budgetRange?: string;
  campaignObjectives?: string;
  brandValues?: string;
  contentRestrictions?: string;
  primaryContactName?: string;
  primaryContactEmail?: string;
  primaryContactPhone?: string;
  billingAddress?: string;
  contentApprovalRequired?: boolean;
  autoApproveCreators?: boolean;
  blacklistedCreators?: string[];
  preferredCreators?: string[];
  paymentTerms?: number;
  preferredPaymentMethod?: string;
}

export interface AgencyProfile {
  agencyName?: string;
  websiteUrl?: string;
  registrationNumber?: string;
  industrySpecialization?: string;
  description?: string;
  yearEstablished?: number;
  companySize?: string;
  serviceOfferings?: string;
  targetMarkets?: string;
  clientPortfolio?: string;
  caseStudiesUrl?: string;
  certifications?: string;
  awards?: string;
  primaryContactName?: string;
  primaryContactEmail?: string;
  primaryContactPhone?: string;
  billingAddress?: string;
  paymentTerms?: number;
  preferredPaymentMethod?: string;
  commissionRate?: number;
}

const filterCreatorFields = (data: any): CreatorProfile => {
  return {
    stageName: data.stage_name,
    bio: data.bio,
    dateOfBirth: data.date_of_birth,
    gender: data.gender,
    profileImageUrl: data.profile_image_url,
    coverImageUrl: data.cover_image_url,
    location: data.location,
    languages: data.languages,
    categories: data.categories,
    contentTypes: data.content_types,
    availabilityStatus: data.availability_status,
    preferredBrands: data.preferred_brands,
    excludedBrands: data.excluded_brands,
  };
};

const filterBrandFields = (data: any): BrandProfile => {
  return {
    websiteUrl: data.website_url,
    industry: data.industry,
    description: data.description,
    brandGuidelinesUrl: data.brand_guidelines_url,
    targetDemographics: data.target_demographics,
    budgetRange: data.budget_range,
    campaignObjectives: data.campaign_objectives,
    brandValues: data.brand_values,
    contentRestrictions: data.content_restrictions,
    primaryContactName: data.primary_contact_name,
    primaryContactEmail: data.primary_contact_email,
    primaryContactPhone: data.primary_contact_phone,
    billingAddress: data.billing_address,
    contentApprovalRequired: data.content_approval_required,
    autoApproveCreators: data.auto_approve_creators,
    blacklistedCreators: data.blacklisted_creators,
    preferredCreators: data.preferred_creators,
    paymentTerms: data.payment_terms,
    preferredPaymentMethod: data.preferred_payment_method,
  };
};

const filterAgencyFields = (data: any): AgencyProfile => {
  return {
    agencyName: data.agency_name,
    websiteUrl: data.website_url,
    registrationNumber: data.registration_number,
    industrySpecialization: data.industry_specialization,
    description: data.description,
    yearEstablished: data.year_established,
    companySize: data.company_size,
    serviceOfferings: data.service_offerings,
    targetMarkets: data.target_markets,
    clientPortfolio: data.client_portfolio,
    caseStudiesUrl: data.case_studies_url,
    certifications: data.certifications,
    awards: data.awards,
    primaryContactName: data.primary_contact_name,
    primaryContactEmail: data.primary_contact_email,
    primaryContactPhone: data.primary_contact_phone,
    billingAddress: data.billing_address,
    paymentTerms: data.payment_terms,
    preferredPaymentMethod: data.preferred_payment_method,
    commissionRate: data.commission_rate,
  };
};

export class ProfileService {
  static async getCreatorProfile() {
    const response = await encryptedApiClient.post(API_ENDPOINTS.PROFILES.CREATOR.GET);
    return response.data;
  }

  static async updateCreatorProfile(data: any) {
    const filtered = filterCreatorFields(data);
    const response = await encryptedApiClient.post(API_ENDPOINTS.PROFILES.CREATOR.UPDATE, filtered);
    return response.data;
  }

  static async getBrandProfile() {
    const response = await encryptedApiClient.post(API_ENDPOINTS.PROFILES.BRAND.GET);
    return response.data;
  }

  static async updateBrandProfile(data: any) {
    const filtered = filterBrandFields(data);
    const response = await encryptedApiClient.post(API_ENDPOINTS.PROFILES.BRAND.UPDATE, filtered);
    return response.data;
  }

  static async getAgencyProfile() {
    const response = await encryptedApiClient.post(API_ENDPOINTS.PROFILES.AGENCY.GET);
    return response.data;
  }

  static async updateAgencyProfile(data: any) {
    const filtered = filterAgencyFields(data);
    const response = await encryptedApiClient.post(API_ENDPOINTS.PROFILES.AGENCY.UPDATE, filtered);
    return response.data;
  }
}
