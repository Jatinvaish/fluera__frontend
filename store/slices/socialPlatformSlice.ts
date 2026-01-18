import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { SocialPlatformService, type ConnectedAccount, type PlatformStats, type SocialPlatform } from '@/lib/api';
import type { RootState } from '@/store/store';

interface SocialPlatformState {
  supportedPlatforms: SocialPlatform[];
  connectedAccounts: ConnectedAccount[];
  stats: PlatformStats | null;
  loading: boolean;
  syncing: { [accountId: number]: boolean };
  error: string | null;
}

const initialState: SocialPlatformState = {
  supportedPlatforms: [],
  connectedAccounts: [],
  stats: null,
  loading: false,
  syncing: {},
  error: null,
};

export const fetchSupportedPlatforms = createAsyncThunk(
  'socialPlatform/fetchSupported',
  async (_, { rejectWithValue }) => {
    try {
      const response = await SocialPlatformService.getSupportedPlatforms();
      return response.platforms || [];
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch platforms');
    }
  }
);

export const fetchConnectedAccounts = createAsyncThunk(
  'socialPlatform/fetchConnected',
  async (creatorProfileId: number, { rejectWithValue }) => {
    try {
      const response = await SocialPlatformService.getConnectedAccounts(creatorProfileId);
      return response.accounts || [];
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch accounts');
    }
  }
);

export const syncAccount = createAsyncThunk(
  'socialPlatform/sync',
  async ({ accountId, fullSync }: { accountId: number; fullSync?: boolean }, { rejectWithValue }) => {
    try {
      const response = await SocialPlatformService.syncAccount(accountId, fullSync);
      return { accountId, ...response };
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to sync account');
    }
  }
);

export const disconnectAccount = createAsyncThunk(
  'socialPlatform/disconnect',
  async (accountId: number, { rejectWithValue }) => {
    try {
      await SocialPlatformService.disconnectAccount(accountId);
      return accountId;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to disconnect account');
    }
  }
);

export const fetchStats = createAsyncThunk(
  'socialPlatform/fetchStats',
  async (creatorProfileId: number, { rejectWithValue }) => {
    try {
      const response = await SocialPlatformService.getStats(creatorProfileId);
      return response;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch stats');
    }
  }
);

export const createManualAccount = createAsyncThunk(
  'socialPlatform/createManual',
  async ({ creatorProfileId, data }: { 
    creatorProfileId: number; 
    data: {
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
    }
  }, { rejectWithValue }) => {
    try {
      const response = await SocialPlatformService.createManualAccount(creatorProfileId, data);
      return response;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to create manual account');
    }
  }
);

export const createManualContent = createAsyncThunk(
  'socialPlatform/createManualContent',
  async ({ accountId, data }: {
    accountId: number;
    data: {
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
    }
  }, { rejectWithValue }) => {
    try {
      const response = await SocialPlatformService.createManualContent(accountId, data);
      return response;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to create manual content');
    }
  }
);

const socialPlatformSlice = createSlice({
  name: 'socialPlatform',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    setSyncing: (state, action: PayloadAction<{ accountId: number; syncing: boolean }>) => {
      state.syncing[action.payload.accountId] = action.payload.syncing;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Supported Platforms
      .addCase(fetchSupportedPlatforms.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchSupportedPlatforms.fulfilled, (state, action) => {
        state.loading = false;
        state.supportedPlatforms = action.payload;
      })
      .addCase(fetchSupportedPlatforms.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      // Fetch Connected Accounts
      .addCase(fetchConnectedAccounts.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchConnectedAccounts.fulfilled, (state, action) => {
        state.loading = false;
        state.connectedAccounts = action.payload;
      })
      .addCase(fetchConnectedAccounts.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      // Sync Account
      .addCase(syncAccount.pending, (state, action) => {
        state.syncing[action.meta.arg.accountId] = true;
        state.error = null;
      })
      .addCase(syncAccount.fulfilled, (state, action) => {
        state.syncing[action.payload.accountId] = false;
        const account = state.connectedAccounts.find(a => a.id === action.payload.accountId);
        if (account) {
          account.last_synced_at = new Date().toISOString();
        }
      })
      .addCase(syncAccount.rejected, (state, action) => {
        state.syncing[action.meta.arg.accountId] = false;
        state.error = action.payload as string;
      })

      // Disconnect Account
      .addCase(disconnectAccount.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(disconnectAccount.fulfilled, (state, action) => {
        state.loading = false;
        state.connectedAccounts = state.connectedAccounts.filter(a => a.id !== action.payload);
      })
      .addCase(disconnectAccount.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      // Fetch Stats
      .addCase(fetchStats.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchStats.fulfilled, (state, action) => {
        state.loading = false;
        state.stats = action.payload;
      })
      .addCase(fetchStats.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      // Create Manual Account
      .addCase(createManualAccount.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createManualAccount.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(createManualAccount.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      // Create Manual Content
      .addCase(createManualContent.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createManualContent.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(createManualContent.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearError, setSyncing } = socialPlatformSlice.actions;

export const selectSupportedPlatforms = (state: RootState) => state.socialPlatform.supportedPlatforms;
export const selectConnectedAccounts = (state: RootState) => state.socialPlatform.connectedAccounts;
export const selectPlatformStats = (state: RootState) => state.socialPlatform.stats;
export const selectPlatformLoading = (state: RootState) => state.socialPlatform.loading;
export const selectPlatformError = (state: RootState) => state.socialPlatform.error;
export const selectAccountSyncing = (accountId: number) => (state: RootState) => 
  state.socialPlatform.syncing[accountId] || false;

export default socialPlatformSlice.reducer;
