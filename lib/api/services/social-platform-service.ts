import { encryptedApiClient } from '../encrypted-client';
import { API_ENDPOINTS } from '../endpoints';

export interface SocialPlatform {
  id: string;
  name: string;
  icon: string;
  supportsMetrics: boolean;
  supportsRevenue: boolean;
  description: string;
}

export interface ConnectedAccount {
  id: number;
  platform: string;
  username: string;
  display_name: string;
  follower_count: number;
  profile_picture_url?: string;
  account_status: string;
  is_verified: boolean;
  connection_type: string;
  last_synced_at?: string;
  created_at: string;
  token_expires_at?: string;
  content_count: number;
  needsReconnect: boolean;
  isSyncing: boolean;
}

export interface PlatformStats {
  totals: {
    totalFollowers: number;
    totalContent: number;
    totalViews: number;
    totalEngagements: number;
    platformCount: number;
  };
  byPlatform: Array<{
    platform: string;
    follower_count: number;
    is_verified: boolean;
    total_content: number;
    total_views: number;
    total_likes: number;
    total_comments: number;
    total_shares: number;
    avg_engagement_rate: number;
  }>;
}

export class SocialPlatformService {
  static async getSupportedPlatforms() {
    const response = await encryptedApiClient.get(API_ENDPOINTS.SOCIAL_PLATFORMS.SUPPORTED);
    return response.data;
  }

  static connectPlatform(platform: string, creatorProfileId: number) {
    // Get token from cookies (same as axios interceptor)
    const getCookie = (name: string) => {
      if (typeof document === 'undefined') return null;
      const value = `; ${document.cookie}`;
      const parts = value.split(`; ${name}=`);
      if (parts.length === 2) return parts.pop()?.split(';').shift();
      return null;
    };

    const token = getCookie('accessToken');
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1';
    
    // Redirect to backend with authentication
    let redirectUrl = `${apiUrl}/social-platforms/connect/${platform}?creatorProfileId=${creatorProfileId}`;
    
    // Add token to URL if available for authentication
    if (token) {
      redirectUrl += `&token=${encodeURIComponent(token)}`;
    } else {
      console.warn('No accessToken found in cookies');
    }
    
    window.location.href = redirectUrl;
  }

  static async getConnectedAccounts(creatorProfileId: number) {
    const response = await encryptedApiClient.get(
      API_ENDPOINTS.SOCIAL_PLATFORMS.ACCOUNTS,
      { params: { creatorProfileId } }
    );
    return response.data;
  }

  static async syncAccount(accountId: number, fullSync: boolean = false) {
    const response = await encryptedApiClient.post(
      API_ENDPOINTS.SOCIAL_PLATFORMS.SYNC(accountId),
      null,
      { params: { fullSync: fullSync.toString() } }
    );
    return response.data;
  }

  static async disconnectAccount(accountId: number) {
    const response = await encryptedApiClient.delete(
      API_ENDPOINTS.SOCIAL_PLATFORMS.DISCONNECT(accountId)
    );
    return response.data;
  }

  static async getStats(creatorProfileId: number) {
    const response = await encryptedApiClient.get(
      API_ENDPOINTS.SOCIAL_PLATFORMS.STATS,
      { params: { creatorProfileId } }
    );
    return response.data;
  }

  static async reauthenticate(accountId: number) {
    const response = await encryptedApiClient.post(
      API_ENDPOINTS.SOCIAL_PLATFORMS.REAUTHENTICATE(accountId)
    );
    return response.data;
  }

  static async getAnalytics(accountId: number) {
    const response = await encryptedApiClient.get(
      API_ENDPOINTS.SOCIAL_PLATFORMS.ANALYTICS(accountId),
      { params: { accountId } }
    );
    return response.data;
  }

  static async createManualAccount(creatorProfileId: number, data: {
    platform: string;
    username: string;
    url?: string;
    followerCount?: number;
    followingCount?: number;
    postsCount?: number;
    engagementRate?: number;
    avgLikes?: number;
    avgComments?: number;
    avgShares?: number;
    avgViews?: number;
    isBusinessAccount?: boolean;
    isPrimary?: boolean;
  }) {
    const response = await encryptedApiClient.post(
      API_ENDPOINTS.SOCIAL_PLATFORMS.MANUAL.CREATE_ACCOUNT,
      data,
      { params: { creatorProfileId } }
    );
    return response.data;
  }

  static async updateManualAccount(accountId: number, data: {
    username?: string;
    profilePictureUrl?: string;
    followerCount?: number;
  }) {
    const response = await encryptedApiClient.put(
      API_ENDPOINTS.SOCIAL_PLATFORMS.MANUAL.UPDATE_ACCOUNT(accountId),
      data
    );
    return response.data;
  }

  static async createManualContent(accountId: number, data: {
    submission_id?: number;
    contentId: string;
    contentType: string;
    title?: string;
    description?: string;
    contentUrl: string;
    thumbnailUrl?: string;
    publishedAt: string;
    views?: number;
    likes?: number;
    comments?: number;
    shares?: number;
    saves?: number;
    reach?: number;
    impressions?: number;
    engagementRate?: number;
  }) {
    const response = await encryptedApiClient.post(
      API_ENDPOINTS.SOCIAL_PLATFORMS.MANUAL.CREATE_CONTENT(accountId),
      data
    );
    return response.data;
  }
}
