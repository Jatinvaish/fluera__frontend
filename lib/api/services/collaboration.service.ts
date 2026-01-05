// ============================================
// lib/api/services/collaboration.service.ts
// ============================================
import { encryptedApiClient } from "../encrypted-client";
import { API_ENDPOINTS } from "../endpoints";

// ============================================
// PAYLOAD INTERFACES
// ============================================

export interface BulkInviteCreatorsPayload {
  emails: string; // Comma-separated
  roleId: number;
  message?: string;
}

export interface AcceptCreatorInvitationPayload {
  token: string;
}

export interface RejectCreatorInvitationPayload {
  token: string;
  reason?: string;
}

export interface GetAgencyCreatorsPayload {
  status?: "pending" | "approved" | "rejected" | "all";
}

export interface SendBrandCollaborationPayload {
  agencyTenantId: number;
  creatorTenantIds: number[]; // Multiple creators
  message?: string;
}

// ============================================
// RESPONSE INTERFACES
// ============================================

export interface CreatorInviteResult {
  email: string;
  status: "success" | "failed" | "already_existed";
  invitation_id: number | null;
  invitation_token: string | null;
  message: string;
}

export interface BulkInviteResponse {
  success: boolean;
  data: {
    total: number;
    successful: number;
    failed: number;
    alreadyExisted: number;
    details: CreatorInviteResult[];
  };
  message: string;
}

export interface AcceptInvitationResponse {
  success: boolean;
  message: string;
  data: {
    userId: number;
    creatorTenantId: number;
    agencyTenantId: number;
    agencyName: string;
  };
}

export interface AgencyCreator {
  id: number;
  creator_tenant_id: number | null;
  creator_name: string | null;
  stage_name: string | null;
  follower_count_total: number;
  engagement_rate_avg: number;
  request_status: string;
  association_status: string | null;
  requested_at: string;
  responded_at: string | null;
  associated_at: string | null;
  invitee_email: string;
  creator_full_name: string | null;
  active_collaborations: number;
}

export interface GetAgencyCreatorsResponse {
  success: boolean;
  data: AgencyCreator[];
}

export interface CollaborationRequestResult {
  id: number;
}

export interface SendBrandCollaborationResponse {
  success: boolean;
  message: string;
  data: CollaborationRequestResult[];
}
export interface Notification {
  id: number;
  tenant_id: number | null;
  event_type: string;
  channel: string;
  subject: string;
  message: string;
  data: {
    agencyTenantId?: number;
    agencyName?: string;
    inviterName?: string;
    invitationToken?: string;
    invitationLink?: string;
    creatorUserId?: number;
    creatorTenantId?: number;
    creatorName?: string;
  } | null;
  priority: string;
  status: string;
  read_at: string | null;
  created_at: string;
}

export interface NotificationsResponse {
  success: boolean;
  data: {
    notifications: Notification[];
    meta: {
      currentPage: number;
      itemsPerPage: number;
      totalItems: number;
      totalPages: number;
      unreadCount: number;
    };
  };
}

export interface GetNotificationsParams {
  status?: string;
  page?: number;
  limit?: number;
}

// ============================================
// COLLABORATION SERVICE
// ============================================

export class CollaborationService {
  // ============================================
  // AGENCY ENDPOINTS
  // ============================================

  /**
   * Agency: Bulk invite creators
   */
  static async bulkInviteCreators(payload: BulkInviteCreatorsPayload): Promise<BulkInviteResponse> {
    return encryptedApiClient.post(
      API_ENDPOINTS.COLLABORATION.INVITE_CREATORS,
      payload
    );
  }

  /**
   * Agency: Get creators list with filters
   */
  static async getAgencyCreators(params?: GetAgencyCreatorsPayload): Promise<GetAgencyCreatorsResponse> {
    return encryptedApiClient.post(
      API_ENDPOINTS.COLLABORATION.AGENCY_CREATORS,
      params || {}
    );
  }

  // ============================================
  // CREATOR ENDPOINTS
  // ============================================

  /**
   * Creator: Accept agency invitation
   */
  static async acceptCreatorInvitation(payload: AcceptCreatorInvitationPayload): Promise<AcceptInvitationResponse> {
    return encryptedApiClient.post(
      API_ENDPOINTS.COLLABORATION.CREATOR_ACCEPT,
      payload
    );
  }

  /**
   * Creator: Reject agency invitation
   */
  static async rejectCreatorInvitation(payload: RejectCreatorInvitationPayload) {
    return encryptedApiClient.post(
      API_ENDPOINTS.COLLABORATION.CREATOR_REJECT,
      payload
    );
  }

  // ============================================
  // BRAND ENDPOINTS
  // ============================================

  /**
   * Brand: Send collaboration request to agency + creators
   */
  static async sendBrandCollaboration(payload: SendBrandCollaborationPayload): Promise<SendBrandCollaborationResponse> {
    return encryptedApiClient.post(
      API_ENDPOINTS.COLLABORATION.BRAND_SEND_COLLABORATION,
      payload
    );
  }
  /**
  * Get notifications for current user
  */
  static async getNotifications(params?: GetNotificationsParams): Promise<NotificationsResponse> {
    const queryParams = new URLSearchParams();
    if (params?.status) queryParams.append('status', params.status);
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());

    const url = `${API_ENDPOINTS.COLLABORATION.NOTIFICATIONS_LIST}${queryParams.toString() ? `?${queryParams.toString()}` : ''
      }`;

    return encryptedApiClient.get(url);
  }

  /**
   * Mark notification as read
   */
  static async markNotificationRead(notificationId: number) {
    const url = API_ENDPOINTS.COLLABORATION.NOTIFICATION_MARK_READ.replace(
      ':id',
      notificationId.toString()
    );
    return encryptedApiClient.post(url, {});
  }
}