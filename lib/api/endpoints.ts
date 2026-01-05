// lib/api/endpoints.ts - COMPLETE & ALIGNED WITH BACKEND

export const API_ENDPOINTS = {
  // ==================== AUTH ====================
  AUTH: {
    REGISTER: "/auth/register",
    LOGIN: "/auth/login",
    LOGOUT: "/auth/logout",
    VERIFY_REGISTRATION: "/auth/verify-registration",
    RESEND_VERIFICATION: "/auth/resend-verification",
    REFRESH_TOKEN: "/auth/refresh",
    ME: "/auth/me",
    PASSWORD_RESET_REQUEST: "/auth/password-reset/request",
    PASSWORD_RESET_CONFIRM: "/auth/password-reset/confirm",
    CREATE_AGENCY: "/auth/create-agency",
    CREATE_BRAND: "/auth/create-brand",
    CREATE_CREATOR: "/auth/create-creator",
    SESSIONS: "/auth/sessions",
    INVITE_ACCEPT: "/auth/invitation/accept",
    INVITE_SEND: "/auth/invitation/send",
    INVITE_RESEND: "/auth/invitation/resend",
    INVITE_CANCEL: "/auth/invitation/cancel",
    SWITCH_TENANT: "/auth/switch-tenant"
  },

  // ==================== CHAT MESSAGES ====================
  CHAT: {
    // ✅ Messages - Aligned with chat.controller.ts
    MESSAGES: {
      SEND: "/chat/messages/send",
      LIST: "/chat/messages",
      EDIT: (id: number) => `/chat/messages/${id}`,
      DELETE: (id: number) => `/chat/messages/${id}`,
      PIN: "/chat/messages/pin",
      PINNED: "/chat/messages/pinned",
      FORWARD: "/chat/messages/forward",
      DETAILS: (messageId: number) => `/chat/messages/${messageId}/details`,
      ATTACHMENTS: (messageId: number) => `/chat/messages/${messageId}/attachments`,
      REACTIONS_LIST: (messageId: number) => `/chat/messages/${messageId}/reactions`,
      UPLOAD: "/chat/messages/upload",
      UPLOAD_MULTIPLE: "/chat/messages/upload-multiple",
      SEND_FILE: "/chat/messages/send-file", // ✅ NEW
      SEND_FILES: "/chat/messages/send-files",
      SEND_ATTACHMENT: "/chat/messages/send-attachment", // ✅ NEW
      FILE_DOWNLOAD: (attachmentId: number) => `/chat/messages/files/${attachmentId}/download`,
      FILE_DELETE: (attachmentId: number) => `/chat/messages/files/${attachmentId}`,
      PENDING_ATTACHMENTS: "/chat/attachments/pending" // ✅ NEW
    },

    // ✅ Reactions - Aligned with chat.controller.ts
    REACTIONS: {
      ADD: "/chat/messages/reaction",
      REMOVE: "/chat/messages/reaction/remove"
    },

    // ✅ Threads - Aligned with chat.controller.ts
    THREADS: {
      GET: (messageId: number) => `/chat/threads/${messageId}`,
      REPLY: (messageId: number) => `/chat/threads/${messageId}/reply`,
      ENHANCED: (messageId: number) => `/chat/threads/${messageId}/enhanced`
    },

    // ✅ Channels - Aligned with chat.controller.ts
    CHANNELS: {
      LIST: "/chat/channels",
      CREATE: "/chat/channels/create",
      GET: (id: number) => `/chat/channels/${id}`,
      UPDATE: (id: number) => `/chat/channels/${id}`,
      DELETE: (id: number) => `/chat/channels/${id}`,
      ARCHIVE: (id: number) => `/chat/channels/${id}/archive`,
      UNARCHIVE: (id: number) => `/chat/channels/${id}/unarchive`,
      LEAVE: (id: number) => `/chat/channels/${id}/leave`,
      PIN: (id: number) => `/chat/channels/${id}/pin`,
      MUTE: (id: number) => `/chat/channels/${id}/mute`,
      FILES: (id: number) => `/chat/channels/${id}/files`,
      MARK_ALL_READ: (id: number) => `/chat/channels/${id}/mark-all-read`, // ✅ NEW
    },

    // ✅ Channel Members - Aligned with chat.controller.ts
    MEMBERS: {
      LIST: (channelId: number) => `/chat/channels/${channelId}/members`,
      ADD: (channelId: number) => `/chat/channels/${channelId}/members`,
      REMOVE: (channelId: number, userId: number) =>
        `/chat/channels/${channelId}/members/${userId}`,
      UPDATE_ROLE: (channelId: number, userId: number) =>
        `/chat/channels/${channelId}/members/${userId}/role`
    },

    // ✅ Search - Aligned with chat.controller.ts
    SEARCH: "/chat/search",

    // ✅ Team - Aligned with chat.controller.ts
    TEAM: {
      MEMBERS: "/chat/team/members",
      AVAILABLE_MEMBERS: "/chat/team/available-members",
      START_CHAT: "/chat/team/start-chat"
    },

    // ✅ Presence - Aligned with chat.controller.ts
    PRESENCE: {
      ONLINE: "/chat/presence/online",
      OFFLINE: "/chat/presence/offline",
      ONLINE_USERS: "/chat/presence/online-users"
    },

    // ✅ Mentions - Aligned with chat.controller.ts
    MENTIONS: {
      LIST: "/chat/mentions",
      UNREAD_COUNT: "/chat/mentions/unread-count"
    },

    // ✅ Unread Count - Aligned with chat.controller.ts
    UNREAD: "/chat/unread",

    // ✅ Activities - Aligned with chat-activity.controller.ts
    ACTIVITIES: {
      CHANNEL: "/chat/activities/channel/:channelId", // Query param: channelId
      UNREAD: "/chat/activities/unread",
      MARK_READ: "/chat/activities/mark-read"
    },

    // ✅ Notifications - Aligned with chat-activity.controller.ts
    NOTIFICATIONS: {
      UNREAD_COUNT: "/chat/notifications/unread-count",
      LIST: "/chat/notifications",
      MARK_READ: "/chat/notifications/mark-read",
      PREFERENCES: "/chat/notifications/preferences"
    },

    // ✅ Collaboration - Aligned with collaboration.controller.ts
    COLLABORATION: {
      SEARCH_MEMBERS: "/collaboration/team/search"
    },

    // ✅ WebSocket Configuration
    WS: {
      URL: process.env.NEXT_PUBLIC_WS_URL || "http://localhost:3060",
      NAMESPACE: "/chat"
    }
  },

  // ==================== RBAC ====================
  RBAC: {
    ROLES: {
      LIST: "/rbac/roles/list",
      GET: "/rbac/roles/get",
      CREATE: "/rbac/roles/create",
      UPDATE: "/rbac/roles/update",
      DELETE: "/rbac/roles/delete",
      CLONE_ROLE: "/rbac/roles/clone",
    },
    PERMISSIONS: {
      LIST: "/rbac/permissions/list",
      GET: "/rbac/permissions/get",
      CREATE: "/rbac/permissions/create",
      DELETE: "/rbac/permissions/delete",
      ASSIGNABLE: "/rbac/permissions/assignable"
    },
    ROLE_PERMISSIONS: {
      TREE: "/rbac/roles/permissions/tree",
      ASSIGN: "/rbac/roles/permissions/assign",
      BULK_ASSIGN: "/rbac/roles/permissions/bulk-assign",
      REMOVE: "/rbac/roles/permissions/remove"
    },
    USER_ROLES: {
      LIST: "/rbac/users/roles/list",
      ASSIGN: "/rbac/users/roles/assign",
      REMOVE: "/rbac/users/roles/remove",
      EFFECTIVE_PERMISSIONS: "/rbac/users/permissions/effective"
    },
    MENU_PERMISSIONS: {
      LINK: "/rbac/menu-permissions/link",
      BULK_LINK: "/rbac/menu-permissions/bulk-link",
      UNLINK: "/rbac/menu-permissions/unlink",
      MENU_GET: "/rbac/menu-permissions/menu/get",
      LIST: "/rbac/menu-permissions/list",
      USER_ACCESS: "/rbac/menu-permissions/user-access",
      MY_ACCESS: "/rbac/menu-permissions/my-access",
      CHECK_ACCESS: "/rbac/menu-permissions/check-access"
    },
    RESOURCE_PERMISSIONS: {
      GRANT: "/rbac/resource-permissions/grant",
      REVOKE: "/rbac/resource-permissions/revoke",
      CHECK: "/rbac/resource-permissions/check",
      CHECK_BATCH: "/rbac/resource-permissions/check-batch",
      LIST: "/rbac/resource-permissions/list"
    },
    ROLE_LIMITS: {
      CREATE: "/rbac/role-limits/create",
      UPDATE: "/rbac/role-limits/update",
      GET: "/rbac/role-limits/get"
    },

  },

  // ==================== SYSTEM CONFIG ====================
  SYSTEM_CONFIG: {
    LIST: "/system-config",
    GET: (id: string) => `/system-config/${id}`,
    CREATE: "/system-config",
    UPDATE: (id: string) => `/system-config/${id}`,
    DELETE: (id: string) => `/system-config/${id}`
  },

  // ==================== TENANTS ====================
  TENANTS: {
    MY_TENANTS: "/tenants/my-tenants",
    GET: (id: string) => `/tenants/${id}`,
    UPDATE: (id: string) => `/tenants/${id}`,
    MEMBERS: (id: string) => `/tenants/${id}/members`,
    USAGE: (id: string) => `/tenants/${id}/usage`
  },

  // ==================== SUBSCRIPTIONS ====================
  SUBSCRIPTIONS: {
    PLANS: {
      LIST: "/subscriptions/plans",
      GET: (id: number) => `/subscriptions/plans/${id}`,
      CREATE: "/subscriptions/plans",
      UPDATE: (id: number) => `/subscriptions/plans/${id}`,
      DELETE: (id: number) => `/subscriptions/plans/${id}`,
      GET_ALL_ACTIVE_FOR_SELECT: "/subscriptions/plans/get-all-active-for-select"
    },

    MY_SUBSCRIPTION: "/subscriptions/my-subscription",
    TENANT_SUBSCRIPTION: (tenantId: number) => `/subscriptions/tenant/${tenantId}`,
    CHANGE: "/subscriptions/change",
    CANCEL: "/subscriptions/cancel",
    REACTIVATE: "/subscriptions/reactivate",
    HISTORY: "/subscriptions/history",
    CHECK_LIMIT: "/subscriptions/check-limit",
    CHECK_FEATURE: "/subscriptions/check-feature",
    STATUS: "/subscriptions/status",
    PAYMENT_METHODS: {
      LIST: "/subscriptions/payment-methods",
      ADD: "/subscriptions/payment-methods",
      DELETE: (id: number) => `/subscriptions/payment-methods/${id}`
    },
    OFFERS: {
      LIST: "/subscriptions/offers",
      GET: (id: number) => `/subscriptions/offers/${id}`,
      CREATE: "/subscriptions/offers",
      UPDATE: (id: number) => `/subscriptions/offers/${id}`,
      DELETE: (id: number) => `/subscriptions/offers/${id}`,
      GET_BY_CODE: (code: string) => `/subscriptions/offers/${code}`,
      USAGE_HISTORY: (id: number) => `/subscriptions/offers/${id}/usage`,
      VALIDATE: "/subscriptions/offers/validate",
      APPLY: "/subscriptions/offers/apply"
    },
    FEATURES: {
      CREATE: "/subscriptions/features/create",
      UPDATE: "/subscriptions/features/update",
      LIST: "/subscriptions/features/list",
      GET_BY_ID: "/subscriptions/features/get-by-id",
      DELETE: "/subscriptions/features/delete",
      GET_ALL_ACTIVE_FOR_SELECT: "/subscriptions/features/get-all-active-for-select"

    },
    FEATURE_PERMISSIONS: {
      CREATE: "/subscriptions/feature-permissions/create",
      UPDATE: "/subscriptions/feature-permissions/update",
      LIST: "/subscriptions/feature-permissions/list",
      GET_BY_ID: "/subscriptions/feature-permissions/get-by-id",
      DELETE: "/subscriptions/feature-permissions/delete"
    }
  },

  // ==================== PROFILES ====================
  PROFILES: {
    CREATOR: {
      GET: "/profiles/creator/get",
      UPDATE: "/profiles/creator/update"
    },
    BRAND: {
      GET: "/profiles/brand/get",
      UPDATE: "/profiles/brand/update"
    },
    AGENCY: {
      GET: "/profiles/agency/get",
      UPDATE: "/profiles/agency/update"
    }
  },
  COLLABORATION: {
    // Agency → Creator Invitations
    INVITE_CREATORS: "/collaboration/agency/send-creator-invitations",
    AGENCY_CREATORS: "/collaboration/agency/creators-list",

    // Creator → Accept/Reject Invitations
    CREATOR_ACCEPT: "/collaboration/agency/creator-accept-invitation",
    CREATOR_REJECT: "/collaboration/agency/creator-reject-invitation",

    // Brand → Collaboration Requests
    BRAND_SEND_COLLABORATION: "/collaboration/brand/send-collaboration-request",

    // ✅ NEW: Notifications
    NOTIFICATIONS_LIST: "/collaboration/notifications/list",
    NOTIFICATION_MARK_READ: "/collaboration/notifications/:id/mark-read",
  }
} as const;
