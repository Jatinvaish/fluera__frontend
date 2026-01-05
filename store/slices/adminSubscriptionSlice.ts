// store/slices/adminSubscriptionSlice.ts
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { SubscriptionService } from "@/lib/api/services/subscription.service";
import type { RootState } from "@/store/store";

interface AdminSubscriptionState {
  plans: any[];
  offers: any[];
  customPlans: any[];
  plansPagination: { page: number; pageSize: number; total: number; totalPages: number } | null;
  offersPagination: { page: number; pageSize: number; total: number; totalPages: number } | null;
  features: any[];
  featurePermissions: any[];
  activeSubscriptionsForSelect: any[];
  activeFeaturesForSelect: any[];  // ADD THIS
  isLoading: boolean;
  error: string | null;
}

// Replace your initialState with this:
const initialState: AdminSubscriptionState = {
  plans: [],
  offers: [],
  customPlans: [],
  plansPagination: null,
  offersPagination: null,
  features: [],
  featurePermissions: [],
  activeSubscriptionsForSelect: [],
  activeFeaturesForSelect: [],
  isLoading: false,
  error: null
};

// Plans
export const fetchAllPlans = createAsyncThunk(
  "adminSubscription/fetchAllPlans",
  async (params: { page?: number; pageSize?: number; sortBy?: string; sortOrder?: 'asc' | 'desc' } = {}, { rejectWithValue }) => {
    try {
      const response = await SubscriptionService.listPlans({ includeInactive: true, ...params });
      return response;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || "Failed to fetch plans");
    }
  }
);

export const createPlan = createAsyncThunk(
  "adminSubscription/createPlan",
  async (payload: any, { rejectWithValue }) => {
    try {
      const response = await SubscriptionService.createPlan(payload);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || "Failed to create plan");
    }
  }
);

export const updatePlan = createAsyncThunk(
  "adminSubscription/updatePlan",
  async ({ id, payload }: { id: number; payload: any }, { rejectWithValue }) => {
    try {
      const response = await SubscriptionService.updatePlan(id, payload);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || "Failed to update plan");
    }
  }
);

export const deletePlan = createAsyncThunk(
  "adminSubscription/deletePlan",
  async (id: number, { rejectWithValue }) => {
    try {
      await SubscriptionService.deletePlan(id);
      return id;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || "Failed to delete plan");
    }
  }
);
export const fetchActiveSubscriptionsForSelect = createAsyncThunk(
  "adminSubscription/fetchActiveSubscriptionsForSelect",
  async (_, { rejectWithValue }) => {
    try {
      const response = await SubscriptionService.getAllActiveSubscriptionsForSelect();
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || "Failed to fetch active subscriptions");
    }
  }
);
export const togglePlanStatus = createAsyncThunk(
  "adminSubscription/togglePlanStatus",
  async ({ id, isActive }: { id: number; isActive: boolean }, { rejectWithValue }) => {
    try {
      await SubscriptionService.togglePlanStatus(id, isActive);
      return { id, isActive };
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || "Failed to toggle plan status");
    }
  }
);

// Offers
export const fetchAllOffers = createAsyncThunk(
  "adminSubscription/fetchAllOffers",
  async (params: { page?: number; pageSize?: number; sortBy?: string; sortOrder?: 'asc' | 'desc' } = {}, { rejectWithValue }) => {
    try {
      const response = await SubscriptionService.getAvailableOffers(params);
      return response;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || "Failed to fetch offers");
    }
  }
);

export const createOffer = createAsyncThunk(
  "adminSubscription/createOffer",
  async (payload: any, { rejectWithValue }) => {
    try {
      const response = await SubscriptionService.createOffer(payload);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || "Failed to create offer");
    }
  }
);

export const updateOffer = createAsyncThunk(
  "adminSubscription/updateOffer",
  async ({ id, payload }: { id: number; payload: any }, { rejectWithValue }) => {
    try {
      const response = await SubscriptionService.updateOffer(id, payload);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || "Failed to update offer");
    }
  }
);

export const deleteOffer = createAsyncThunk(
  "adminSubscription/deleteOffer",
  async (id: number, { rejectWithValue }) => {
    try {
      await SubscriptionService.deleteOffer(id);
      return id;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || "Failed to delete offer");
    }
  }
);

export const toggleOfferStatus = createAsyncThunk(
  "adminSubscription/toggleOfferStatus",
  async ({ id, isActive }: { id: number; isActive: boolean }, { rejectWithValue }) => {
    try {
      await SubscriptionService.updateOffer(id, { isActive });
      return { id, isActive };
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || "Failed to toggle offer status");
    }
  }
);

export const fetchAllFeatures = createAsyncThunk(
  "adminSubscription/fetchAllFeatures",
  async (query: any = {}, { rejectWithValue }) => {
    try {
      const response = await SubscriptionService.listFeatures(query);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || "Failed to fetch features");
    }
  }
);

export const createFeature = createAsyncThunk(
  "adminSubscription/createFeature",
  async (payload: any, { rejectWithValue }) => {
    try {
      const response = await SubscriptionService.createFeature(payload);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || "Failed to create feature");
    }
  }
);

export const updateFeature = createAsyncThunk(
  "adminSubscription/updateFeature",
  async (payload: any, { rejectWithValue }) => {
    try {
      const response = await SubscriptionService.updateFeature(payload);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || "Failed to update feature");
    }
  }
);

export const deleteFeature = createAsyncThunk(
  "adminSubscription/deleteFeature",
  async (id: number, { rejectWithValue }) => {
    try {
      await SubscriptionService.deleteFeature(id);
      return id;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || "Failed to delete feature");
    }
  }
);

// Feature Permissions
export const fetchAllFeaturePermissions = createAsyncThunk(
  "adminSubscription/fetchAllFeaturePermissions",
  async (query: any = {}, { rejectWithValue }) => {
    try {
      const response = await SubscriptionService.listFeaturePermissions(query);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || "Failed to fetch feature permissions");
    }
  }
);

export const createFeaturePermission = createAsyncThunk(
  "adminSubscription/createFeaturePermission",
  async (payload: any, { rejectWithValue }) => {
    try {
      const response = await SubscriptionService.createFeaturePermission(payload);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || "Failed to create feature permission");
    }
  }
);

export const updateFeaturePermission = createAsyncThunk(
  "adminSubscription/updateFeaturePermission",
  async (payload: any, { rejectWithValue }) => {
    try {
      const response = await SubscriptionService.updateFeaturePermission(payload);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || "Failed to update feature permission");
    }
  }
);

export const deleteFeaturePermission = createAsyncThunk(
  "adminSubscription/deleteFeaturePermission",
  async (id: number, { rejectWithValue }) => {
    try {
      await SubscriptionService.deleteFeaturePermission(id);
      return id;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || "Failed to delete feature permission");
    }
  }
);

export const fetchActiveFeaturesForSelect = createAsyncThunk(
  "adminSubscription/fetchActiveFeaturesForSelect",
  async (_, { rejectWithValue }) => {
    try {
      const response = await SubscriptionService.getAllActiveFeaturesForSelect();
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || "Failed to fetch active features");
    }
  }
);

const adminSubscriptionSlice = createSlice({
  name: "adminSubscription",
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    resetAdminState: () => initialState
  },
  extraReducers: (builder) => {
    builder
      // ==================== Fetch Plans ====================
      .addCase(fetchAllPlans.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchAllPlans.fulfilled, (state, action) => {
        state.isLoading = false;
        state.plans = action.payload.data || [];
        state.plansPagination = action.payload.pagination || {
          page: 1,
          pageSize: state.plans.length,
          total: state.plans.length,
          totalPages: 1
        };
      })
      .addCase(fetchAllPlans.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // ==================== Create Plan ====================
      .addCase(createPlan.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(createPlan.fulfilled, (state) => {
        state.isLoading = false;
      })
      .addCase(createPlan.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // ==================== Update Plan ====================
      .addCase(updatePlan.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(updatePlan.fulfilled, (state) => {
        state.isLoading = false;
      })
      .addCase(updatePlan.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // ==================== Get Plans For select ====================
      .addCase(fetchActiveSubscriptionsForSelect.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchActiveSubscriptionsForSelect.fulfilled, (state, action) => {
        state.isLoading = false;
        state.activeSubscriptionsForSelect = action.payload.data || action.payload || [];
      })
      .addCase(fetchActiveSubscriptionsForSelect.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // ==================== Delete Plan ====================
      .addCase(deletePlan.fulfilled, (state, action) => {
        state.plans = state.plans.filter(p => p.id !== action.payload);
      })
      // Toggle Plan Status
      .addCase(togglePlanStatus.fulfilled, (state, action) => {
        const plan = state.plans.find(p => p.id === action.payload.id);
        if (plan) plan.is_active = action.payload.isActive;
      })
      // ==================== Fetch Offers ====================
      .addCase(fetchAllOffers.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchAllOffers.fulfilled, (state, action) => {
        state.isLoading = false;
        state.offers = action.payload.data || [];
        state.offersPagination = action.payload.pagination || {
          page: 1,
          pageSize: state.offers.length,
          total: state.offers.length,
          totalPages: 1
        };
      })
      .addCase(fetchAllOffers.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // ==================== Create Offer ====================
      .addCase(createOffer.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(createOffer.fulfilled, (state) => {
        state.isLoading = false;
      })
      .addCase(createOffer.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // ==================== Update Offer ====================
      .addCase(updateOffer.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(updateOffer.fulfilled, (state) => {
        state.isLoading = false;
      })
      .addCase(updateOffer.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // ==================== Delete Offer ====================
      .addCase(deleteOffer.fulfilled, (state, action) => {
        state.offers = state.offers.filter(o => o.id !== action.payload);
      })
      .addCase(toggleOfferStatus.fulfilled, (state, action) => {
        const offer = state.offers.find(o => o.id === action.payload.id);
        if (offer) offer.is_active = action.payload.isActive;
      })
      // ==================== Fetch Features ====================
      .addCase(fetchAllFeatures.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchAllFeatures.fulfilled, (state, action) => {
        state.isLoading = false;
        state.features = action.payload?.featuresList || [];
      })
      .addCase(fetchAllFeatures.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // ==================== Create Feature ====================
      .addCase(createFeature.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(createFeature.fulfilled, (state) => {
        state.isLoading = false;
      })
      .addCase(createFeature.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // ==================== Update Feature ====================
      .addCase(updateFeature.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(updateFeature.fulfilled, (state) => {
        state.isLoading = false;
      })
      .addCase(updateFeature.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // ==================== Delete Feature ====================
      .addCase(deleteFeature.fulfilled, (state, action) => {
        state.features = state.features.filter(f => f.id !== action.payload);
      })
      // ==================== Fetch Feature Permissions ====================
      .addCase(fetchAllFeaturePermissions.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchAllFeaturePermissions.fulfilled, (state, action) => {
        state.isLoading = false;
        state.featurePermissions = action.payload?.featurePermissionsList || [];
      })
      .addCase(fetchAllFeaturePermissions.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // ==================== Create Feature Permission ====================
      .addCase(createFeaturePermission.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(createFeaturePermission.fulfilled, (state) => {
        state.isLoading = false;
      })
      .addCase(createFeaturePermission.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // ==================== Update Feature Permission ====================
      .addCase(updateFeaturePermission.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(updateFeaturePermission.fulfilled, (state) => {
        state.isLoading = false;
      })
      .addCase(updateFeaturePermission.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // ==================== Delete Feature Permission ====================
      .addCase(deleteFeaturePermission.fulfilled, (state, action) => {
        state.featurePermissions = state.featurePermissions.filter(fp => fp.id !== action.payload);
      })
      .addCase(fetchActiveFeaturesForSelect.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchActiveFeaturesForSelect.fulfilled, (state, action) => {
        state.isLoading = false;
        state.activeFeaturesForSelect = action.payload.data || action.payload || [];
      })
      .addCase(fetchActiveFeaturesForSelect.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      
      
      ;
  }
});

export const { clearError, resetAdminState } = adminSubscriptionSlice.actions;

export const selectAdminPlans = (state: RootState) => state.adminSubscription.plans;
export const selectAdminOffers = (state: RootState) => state.adminSubscription.offers;
export const selectPlansPagination = (state: RootState) => state.adminSubscription.plansPagination;
export const selectOffersPagination = (state: RootState) => state.adminSubscription.offersPagination;
export const selectAdminLoading = (state: RootState) => state.adminSubscription.isLoading;
export const selectAdminError = (state: RootState) => state.adminSubscription.error;
export const selectAdminFeatures = (state: RootState) => state.adminSubscription.features;
export const selectAdminFeaturePermissions = (state: RootState) => state.adminSubscription.featurePermissions;
export const selectActiveSubscriptionsForSelect = (state: RootState) => state.adminSubscription.activeSubscriptionsForSelect;
export const selectActiveFeaturesForSelect = (state: RootState) => state.adminSubscription.activeFeaturesForSelect;


export default adminSubscriptionSlice.reducer;
