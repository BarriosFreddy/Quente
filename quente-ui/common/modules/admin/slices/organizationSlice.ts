import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { Organization, OrganizationState } from '../../../shared/models/organization.model';
import { OrganizationService } from '../services/organization.service';

const initialState: OrganizationState = {
  organizations: [],
  selectedOrganization: null,
  loading: false,
  error: null
};

export const fetchOrganizations = createAsyncThunk(
  'organizations/fetchAll',
  async (_, { extra }) => {
    const { organizationService } = extra as { organizationService: OrganizationService };
    const response = await organizationService.getAll();
    if (!response.success) {
      throw new Error(response.error || 'Error al obtener organizaciones');
    }
    return response.data;
  }
);

export const fetchOrganizationById = createAsyncThunk(
  'organizations/fetchById',
  async (id: string, { extra }) => {
    const { organizationService } = extra as { organizationService: OrganizationService };
    const response = await organizationService.getById(id);
    if (!response.success) {
      throw new Error(response.error || 'Error al obtener organización');
    }
    return response.data;
  }
);

export const createOrganization = createAsyncThunk(
  'organizations/create',
  async (organization: Partial<Organization>, { extra }) => {
    const { organizationService } = extra as { organizationService: OrganizationService };
    const response = await organizationService.create(organization);
    if (!response.success) {
      throw new Error(response.error || 'Error al crear organización');
    }
    return response.data;
  }
);

export const updateOrganization = createAsyncThunk(
  'organizations/update',
  async ({ id, organization }: { id: string; organization: Partial<Organization> }, { extra }) => {
    const { organizationService } = extra as { organizationService: OrganizationService };
    const response = await organizationService.update(id, organization);
    if (!response.success) {
      throw new Error(response.error || 'Error al actualizar organización');
    }
    return response.data;
  }
);

export const activateOrganization = createAsyncThunk(
  'organizations/activate',
  async (id: string, { extra }) => {
    const { organizationService } = extra as { organizationService: OrganizationService };
    const response = await organizationService.activateOrganization(id);
    if (!response.success) {
      throw new Error(response.error || 'Error al activar organización');
    }
    return response.data;
  }
);

export const deactivateOrganization = createAsyncThunk(
  'organizations/deactivate',
  async (id: string, { extra }) => {
    const { organizationService } = extra as { organizationService: OrganizationService };
    const response = await organizationService.deactivateOrganization(id);
    if (!response.success) {
      throw new Error(response.error || 'Error al desactivar organización');
    }
    return response.data;
  }
);

const organizationSlice = createSlice({
  name: 'organizations',
  initialState,
  reducers: {
    setSelectedOrganization: (state, action: PayloadAction<Organization | null>) => {
      state.selectedOrganization = action.payload;
    },
    clearOrganizationError: (state) => {
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
      // Fetch all organizations
      .addCase(fetchOrganizations.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchOrganizations.fulfilled, (state, action) => {
        state.loading = false;
        state.organizations = action.payload;
      })
      .addCase(fetchOrganizations.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Error al obtener organizaciones';
      })
      
      // Fetch organization by ID
      .addCase(fetchOrganizationById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchOrganizationById.fulfilled, (state, action) => {
        state.loading = false;
        state.selectedOrganization = action.payload;
      })
      .addCase(fetchOrganizationById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Error al obtener organización';
      })
      
      // Create organization
      .addCase(createOrganization.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createOrganization.fulfilled, (state, action) => {
        state.loading = false;
        state.organizations.push(action.payload);
        state.selectedOrganization = action.payload;
      })
      .addCase(createOrganization.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Error al crear organización';
      })
      
      // Update organization
      .addCase(updateOrganization.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateOrganization.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.organizations.findIndex(org => org._id === action.payload._id);
        if (index !== -1) {
          state.organizations[index] = action.payload;
        }
        state.selectedOrganization = action.payload;
      })
      .addCase(updateOrganization.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Error al actualizar organización';
      })
      
      // Activate organization
      .addCase(activateOrganization.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(activateOrganization.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.organizations.findIndex(org => org._id === action.payload._id);
        if (index !== -1) {
          state.organizations[index] = action.payload;
        }
        if (state.selectedOrganization?._id === action.payload._id) {
          state.selectedOrganization = action.payload;
        }
      })
      .addCase(activateOrganization.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Error al activar organización';
      })
      
      // Deactivate organization
      .addCase(deactivateOrganization.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deactivateOrganization.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.organizations.findIndex(org => org._id === action.payload._id);
        if (index !== -1) {
          state.organizations[index] = action.payload;
        }
        if (state.selectedOrganization?._id === action.payload._id) {
          state.selectedOrganization = action.payload;
        }
      })
      .addCase(deactivateOrganization.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Error al desactivar organización';
      });
  }
});

export const { setSelectedOrganization, clearOrganizationError } = organizationSlice.actions;
export default organizationSlice.reducer;
