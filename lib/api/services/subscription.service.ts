// lib/api/services/subscription.service.ts

import { encryptedApiClient } from "../encrypted-client";
import { API_ENDPOINTS } from "../endpoints";

export interface CreatePlanPayload {
  planName: string;
  planSlug: string;
  planType: 'agency' | 'brand' | 'creator' | 'all';
  planTier?: 'free' | 'basic' | 'pro' | 'enterprise' | 'custom';
  isFree?: boolean;
  isDefault?: boolean;
  priceMonthly?: number;
  priceYearly?: number;
  currency?: string;
  billingCycle?: 'monthly' | 'yearly' | 'lifetime';
  trialDays?: number;
  maxStaff?: number;
  maxStorageGb?: number;
  maxCampaigns?: number;
  maxInvitations?: number;
  maxIntegrations?: number;
  maxCreators?: number;
  maxBrands?: number;
  maxFileSizeMb?: number;
  maxApiCallsPerDay?: number;
  features?: any;
  prioritySupport?: boolean;
  customBranding?: boolean;
  whiteLabel?: boolean;
  ssoEnabled?: boolean;
  sortOrder?: number;
}

export interface UpdatePlanPayload {
  planName?: string;
  isActive?: boolean;
  priceMonthly?: number;
  priceYearly?: number;
  maxStaff?: number;
  maxStorageGb?: number;
  maxCampaigns?: number;
  maxInvitations?: number;
  features?: any;
  prioritySupport?: boolean;
  customBranding?: boolean;
  whiteLabel?: boolean;
  ssoEnabled?: boolean;
}

export interface CreateCustomPlanPayload {
  tenantId: number;
  basePlanId?: number;
  customPlanName?: string;
  maxStaff?: number;
  maxStorageGb?: number;
  maxCampaigns?: number;
  maxInvitations?: number;
  maxCreators?: number;
  maxBrands?: number;
  maxIntegrations?: number;
  maxFileSizeMb?: number;
  maxApiCallsPerDay?: number;
  customPriceMonthly?: number;
  customPriceYearly?: number;
  currency?: string;
  customFeatures?: any;
  prioritySupport?: boolean;
  customBranding?: boolean;
  whiteLabel?: boolean;
  ssoEnabled?: boolean;
  expiresAt?: string;
  notes?: string;
}

export interface ChangeSubscriptionPayload {
  planId: number;
  billingCycle: 'monthly' | 'yearly' | 'lifetime';
  changeReason?: string;
  effectiveDate?: string;
  paymentData?: PaymentMethodPayload;
}

export interface PaymentMethodPayload {
  provider: 'stripe' | 'paypal' | 'razorpay' | 'googlepay';
  methodType: 'credit_card' | 'digital_wallet';
  paypalEmail?: string;
  cardNumber?: string;
  cardHolderName?: string;
  cardExpMonth?: number;
  cardExpYear?: number;
  cardCvv?: string;
  isDefault?: boolean;
  autoRenewEnabled?: boolean;
}

export interface CancelSubscriptionPayload {
  cancelReason: string;
  cancelImmediately?: boolean;
}

export interface ListPlansQuery {
  planTier?: 'free' | 'basic' | 'pro' | 'enterprise' | 'custom';
  includeInactive?: boolean;
  page?: number;
  pageSize?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface CreateFeaturePayload {
  subscription_id: number;
  feature_price?: number;
  restricted_to?: string;
  name: string;
}

export interface UpdateFeaturePayload {
  id: number;
  subscription_id?: number;
  feature_price?: number;
  restricted_to?: string;
  name?: string;
}

export interface ListFeaturesQuery {
  subscription_id?: number;
  name?: string;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'ASC' | 'DESC';
}

export interface CreateFeaturePermissionPayload {
  subscription_id: number;
  feature_id: number;
  permission_id: number[];
  permission_price?: number;
  restricted_to?: string;
  name: string;
}

export interface UpdateFeaturePermissionPayload {
  id: number;
  subscription_id?: number;
  feature_id?: number;
  permission_id?: number[];
  permission_price?: number;
  restricted_to?: string;
  name?: string;
}

export interface ListFeaturePermissionsQuery {
  subscription_id?: number;
  feature_id?: number;
  permission_id?: number;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'ASC' | 'DESC';
}
export interface SubscriptionPlanForSelect {
  id: number;
  plan_name: string;
  plan_slug: string;
  plan_type: string;
  plan_tier: string;
}
export interface FeatureForSelect {
  id: number;
  subscription_id: number;
  name: string;
  feature_price: number | null;
}


export class SubscriptionService {
  // Plans Management
  static async listPlans(query?: ListPlansQuery) {
    return encryptedApiClient.get(API_ENDPOINTS.SUBSCRIPTIONS.PLANS.LIST, { params: query });
  }

  static async getPlan(id: number) {
    return encryptedApiClient.get(API_ENDPOINTS.SUBSCRIPTIONS.PLANS.GET(id));
  }

  static async createPlan(payload: CreatePlanPayload) {
    return encryptedApiClient.post(API_ENDPOINTS.SUBSCRIPTIONS.PLANS.CREATE, payload);
  }

  static async updatePlan(id: number, payload: UpdatePlanPayload) {
    return encryptedApiClient.put(API_ENDPOINTS.SUBSCRIPTIONS.PLANS.UPDATE(id), payload);
  }

  static async togglePlanStatus(id: number, isActive: boolean) {
    return encryptedApiClient.put(`${API_ENDPOINTS.SUBSCRIPTIONS.PLANS.UPDATE(id)}/toggle-status`, { isActive });
  }

  static async deletePlan(id: number) {
    return encryptedApiClient.delete(API_ENDPOINTS.SUBSCRIPTIONS.PLANS.DELETE(id));
  }
  static async getAllActiveSubscriptionsForSelect() {
    return encryptedApiClient.post(API_ENDPOINTS.SUBSCRIPTIONS.PLANS.GET_ALL_ACTIVE_FOR_SELECT);
  }

  // Subscription Management
  static async getMySubscription() {
    return encryptedApiClient.get(API_ENDPOINTS.SUBSCRIPTIONS.MY_SUBSCRIPTION);
  }

  static async getTenantSubscription(tenantId: number) {
    return encryptedApiClient.get(API_ENDPOINTS.SUBSCRIPTIONS.TENANT_SUBSCRIPTION(tenantId));
  }

  static async changeSubscription(payload: ChangeSubscriptionPayload) {
    return encryptedApiClient.post(API_ENDPOINTS.SUBSCRIPTIONS.CHANGE, payload);
  }

  static async cancelSubscription(payload: CancelSubscriptionPayload) {
    return encryptedApiClient.post(API_ENDPOINTS.SUBSCRIPTIONS.CANCEL, payload);
  }

  static async reactivateSubscription() {
    return encryptedApiClient.post(API_ENDPOINTS.SUBSCRIPTIONS.REACTIVATE);
  }

  static async getSubscriptionHistory() {
    return encryptedApiClient.get(API_ENDPOINTS.SUBSCRIPTIONS.HISTORY);
  }

  // Limits & Features
  static async checkLimit(limitType: string) {
    return encryptedApiClient.post(API_ENDPOINTS.SUBSCRIPTIONS.CHECK_LIMIT, { limitType });
  }

  static async checkFeature(featureName: string) {
    return encryptedApiClient.post(API_ENDPOINTS.SUBSCRIPTIONS.CHECK_FEATURE, { featureName });
  }

  static async getSubscriptionStatus() {
    return encryptedApiClient.get(API_ENDPOINTS.SUBSCRIPTIONS.STATUS);
  }

  // Payment Methods
  static async getPaymentMethods() {
    return encryptedApiClient.get(API_ENDPOINTS.SUBSCRIPTIONS.PAYMENT_METHODS.LIST);
  }

  static async addPaymentMethod(payload: PaymentMethodPayload) {
    return encryptedApiClient.post(API_ENDPOINTS.SUBSCRIPTIONS.PAYMENT_METHODS.ADD, payload);
  }

  static async deletePaymentMethod(id: number) {
    return encryptedApiClient.delete(API_ENDPOINTS.SUBSCRIPTIONS.PAYMENT_METHODS.DELETE(id));
  }

  // Offers
  static async getAvailableOffers(params?: { page?: number; pageSize?: number; sortBy?: string; sortOrder?: 'asc' | 'desc' }) {
    return encryptedApiClient.get(API_ENDPOINTS.SUBSCRIPTIONS.OFFERS.LIST, { params });
  }

  static async getOfferById(id: number) {
    return encryptedApiClient.get(API_ENDPOINTS.SUBSCRIPTIONS.OFFERS.GET(id));
  }

  static async createOffer(payload: any) {
    return encryptedApiClient.post(API_ENDPOINTS.SUBSCRIPTIONS.OFFERS.CREATE, payload);
  }

  static async updateOffer(id: number, payload: any) {
    return encryptedApiClient.put(API_ENDPOINTS.SUBSCRIPTIONS.OFFERS.UPDATE(id), payload);
  }

  static async deleteOffer(id: number) {
    return encryptedApiClient.delete(API_ENDPOINTS.SUBSCRIPTIONS.OFFERS.DELETE(id));
  }

  static async applyOffer(offerCode: string) {
    return encryptedApiClient.post(API_ENDPOINTS.SUBSCRIPTIONS.OFFERS.APPLY, { offerCode });
  }

  static async listFeatures(query?: ListFeaturesQuery) {
    return encryptedApiClient.post(API_ENDPOINTS.SUBSCRIPTIONS.FEATURES.LIST, query);
  }

  static async getFeatureById(id: number) {
    return encryptedApiClient.post(API_ENDPOINTS.SUBSCRIPTIONS.FEATURES.GET_BY_ID, { id });
  }

  static async createFeature(payload: CreateFeaturePayload) {
    return encryptedApiClient.post(API_ENDPOINTS.SUBSCRIPTIONS.FEATURES.CREATE, payload);
  }

  static async updateFeature(payload: UpdateFeaturePayload) {
    return encryptedApiClient.post(API_ENDPOINTS.SUBSCRIPTIONS.FEATURES.UPDATE, payload);
  }

  static async deleteFeature(id: number) {
    return encryptedApiClient.post(API_ENDPOINTS.SUBSCRIPTIONS.FEATURES.DELETE, { id });
  }

  // Subscription Feature Permissions
  static async listFeaturePermissions(query?: ListFeaturePermissionsQuery) {
    return encryptedApiClient.post(API_ENDPOINTS.SUBSCRIPTIONS.FEATURE_PERMISSIONS.LIST, query);
  }

  static async getFeaturePermissionById(id: number) {
    return encryptedApiClient.post(API_ENDPOINTS.SUBSCRIPTIONS.FEATURE_PERMISSIONS.GET_BY_ID, { id });
  }

  static async createFeaturePermission(payload: CreateFeaturePermissionPayload) {
    return encryptedApiClient.post(API_ENDPOINTS.SUBSCRIPTIONS.FEATURE_PERMISSIONS.CREATE, payload);
  }

  static async updateFeaturePermission(payload: UpdateFeaturePermissionPayload) {
    return encryptedApiClient.post(API_ENDPOINTS.SUBSCRIPTIONS.FEATURE_PERMISSIONS.UPDATE, payload);
  }

  static async deleteFeaturePermission(id: number) {
    return encryptedApiClient.post(API_ENDPOINTS.SUBSCRIPTIONS.FEATURE_PERMISSIONS.DELETE, { id });
  }
  static async getAllActiveFeaturesForSelect() {
    return encryptedApiClient.post(API_ENDPOINTS.SUBSCRIPTIONS.FEATURES.GET_ALL_ACTIVE_FOR_SELECT);
  }
}