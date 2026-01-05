import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { ProfileService, type CreatorProfile, type BrandProfile, type AgencyProfile } from '@/lib/api';

type ProfileData = CreatorProfile | BrandProfile | AgencyProfile;

interface ProfileState {
  profile: ProfileData | null;
  loading: boolean;
  error: string | null;
  saving: boolean;
}

const initialState: ProfileState = {
  profile: null,
  loading: false,
  error: null,
  saving: false,
};

export const fetchCreatorProfile = createAsyncThunk(
  'profile/fetchCreator',
  async (_, { rejectWithValue }) => {
    try {
      const response = await ProfileService.getCreatorProfile();
      return response.data || response;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch profile');
    }
  }
);

export const updateCreatorProfile = createAsyncThunk(
  'profile/updateCreator',
  async (data: CreatorProfile, { rejectWithValue }) => {
    try {
      const response = await ProfileService.updateCreatorProfile(data);
      return response.data || response;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update profile');
    }
  }
);

export const fetchBrandProfile = createAsyncThunk(
  'profile/fetchBrand',
  async (_, { rejectWithValue }) => {
    try {
      const response = await ProfileService.getBrandProfile();
      return response.data || response;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch profile');
    }
  }
);

export const updateBrandProfile = createAsyncThunk(
  'profile/updateBrand',
  async (data: BrandProfile, { rejectWithValue }) => {
    try {
      const response = await ProfileService.updateBrandProfile(data);
      return response.data || response;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update profile');
    }
  }
);

export const fetchAgencyProfile = createAsyncThunk(
  'profile/fetchAgency',
  async (_, { rejectWithValue }) => {
    try {
      const response = await ProfileService.getAgencyProfile();
      return response.data || response;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch profile');
    }
  }
);

export const updateAgencyProfile = createAsyncThunk(
  'profile/updateAgency',
  async (data: AgencyProfile, { rejectWithValue }) => {
    try {
      const response = await ProfileService.updateAgencyProfile(data);
      return response.data || response;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update profile');
    }
  }
);

const profileSlice = createSlice({
  name: 'profile',
  initialState,
  reducers: {
    clearProfile: (state) => {
      state.profile = null;
      state.error = null;
    },
    updateProfileField: (state, action: PayloadAction<{ field: string; value: any }>) => {
      if (state.profile) {
        (state.profile as any)[action.payload.field] = action.payload.value;
      }
    },
  },
  extraReducers: (builder) => {
    // Fetch Creator
    builder.addCase(fetchCreatorProfile.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(fetchCreatorProfile.fulfilled, (state, action) => {
      state.loading = false;
      state.profile = action.payload;
    });
    builder.addCase(fetchCreatorProfile.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    });

    // Update Creator
    builder.addCase(updateCreatorProfile.pending, (state) => {
      state.saving = true;
      state.error = null;
    });
    builder.addCase(updateCreatorProfile.fulfilled, (state, action) => {
      state.saving = false;
      state.profile = action.payload;
    });
    builder.addCase(updateCreatorProfile.rejected, (state, action) => {
      state.saving = false;
      state.error = action.payload as string;
    });

    // Fetch Brand
    builder.addCase(fetchBrandProfile.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(fetchBrandProfile.fulfilled, (state, action) => {
      state.loading = false;
      state.profile = action.payload;
    });
    builder.addCase(fetchBrandProfile.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    });

    // Update Brand
    builder.addCase(updateBrandProfile.pending, (state) => {
      state.saving = true;
      state.error = null;
    });
    builder.addCase(updateBrandProfile.fulfilled, (state, action) => {
      state.saving = false;
      state.profile = action.payload;
    });
    builder.addCase(updateBrandProfile.rejected, (state, action) => {
      state.saving = false;
      state.error = action.payload as string;
    });

    // Fetch Agency
    builder.addCase(fetchAgencyProfile.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(fetchAgencyProfile.fulfilled, (state, action) => {
      state.loading = false;
      state.profile = action.payload;
    });
    builder.addCase(fetchAgencyProfile.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    });

    // Update Agency
    builder.addCase(updateAgencyProfile.pending, (state) => {
      state.saving = true;
      state.error = null;
    });
    builder.addCase(updateAgencyProfile.fulfilled, (state, action) => {
      state.saving = false;
      state.profile = action.payload;
    });
    builder.addCase(updateAgencyProfile.rejected, (state, action) => {
      state.saving = false;
      state.error = action.payload as string;
    });
  },
});

export const { clearProfile, updateProfileField } = profileSlice.actions;
export default profileSlice.reducer;
