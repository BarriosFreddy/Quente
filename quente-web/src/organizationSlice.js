import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { ApiService } from './ApiService'

// Organization service adapter
const organizationService = {
  getAll: async () => {
    try {
      const response = await ApiService.get('/organizations')
      return {
        data: response.data,
        success: true,
      }
    } catch (error) {
      console.error('Error fetching organizations:', error)
      return {
        success: false,
        error: 'Error al obtener organizaciones',
      }
    }
  },

  getById: async (id) => {
    try {
      const response = await ApiService.get(`/organizations/${id}`)
      return {
        data: response.data,
        success: true,
      }
    } catch (error) {
      console.error(`Error fetching organization with id ${id}:`, error)
      return {
        success: false,
        error: 'Error al obtener organización',
      }
    }
  },

  create: async (organization) => {
    try {
      const response = await ApiService.post('/organizations', organization)
      return {
        data: response.data,
        success: true,
      }
    } catch (error) {
      console.error('Error creating organization:', error)
      return {
        success: false,
        error: 'Error al crear organización',
      }
    }
  },

  update: async (id, organization) => {
    try {
      const response = await ApiService.put(`/organizations/${id}`, organization)
      return {
        data: response.data,
        success: true,
      }
    } catch (error) {
      console.error(`Error updating organization with id ${id}:`, error)
      return {
        success: false,
        error: 'Error al actualizar organización',
      }
    }
  },

  activateOrganization: async (id) => {
    try {
      const response = await ApiService.get(`/organizations/${id}/active`)
      return {
        data: response.data,
        success: true,
      }
    } catch (error) {
      console.error(`Error activating organization with id ${id}:`, error)
      return {
        success: false,
        error: 'Error al activar organización',
      }
    }
  },

  deactivateOrganization: async (id) => {
    try {
      const response = await ApiService.get(`/organizations/${id}/inactive`)
      return {
        data: response.data,
        success: true,
      }
    } catch (error) {
      console.error(`Error deactivating organization with id ${id}:`, error)
      return {
        success: false,
        error: 'Error al desactivar organización',
      }
    }
  },

  deleteOrganization: async (id) => {
    try {
      const response = await ApiService.delete(`/organizations/${id}`)
      return {
        success: response.status === 200,
      }
    } catch (error) {
      console.error(`Error deleting organization with id ${id}:`, error)
      return {
        success: false,
        error: 'Error al eliminar organización',
      }
    }
  },

  deployOrganization: async (id) => {
    try {
      const response = await ApiService.post(`/organizations/${id}/deploy`)
      return {
        data: response.data,
        success: true,
      }
    } catch (error) {
      console.error(`Error deploying organization with id ${id}:`, error)
      return {
        success: false,
        error: 'Error al desplegar organización',
      }
    }
  },
}

// Async thunks
export const fetchOrganizations = createAsyncThunk(
  'organizations/fetchAll',
  async (_, { rejectWithValue }) => {
    const response = await organizationService.getAll()
    if (!response.success) {
      return rejectWithValue(response.error || 'Error al obtener organizaciones')
    }
    return response.data
  },
)

export const fetchOrganizationById = createAsyncThunk(
  'organizations/fetchById',
  async (id, { rejectWithValue }) => {
    const response = await organizationService.getById(id)
    if (!response.success) {
      return rejectWithValue(response.error || 'Error al obtener organización')
    }
    return response.data
  },
)

export const createOrganization = createAsyncThunk(
  'organizations/create',
  async (organization, { rejectWithValue }) => {
    const response = await organizationService.create(organization)
    if (!response.success) {
      return rejectWithValue(response.error || 'Error al crear organización')
    }
    return response.data
  },
)

export const updateOrganization = createAsyncThunk(
  'organizations/update',
  async ({ id, organization }, { rejectWithValue }) => {
    const response = await organizationService.update(id, organization)
    if (!response.success) {
      return rejectWithValue(response.error || 'Error al actualizar organización')
    }
    return response.data
  },
)

export const activateOrganization = createAsyncThunk(
  'organizations/activate',
  async (id, { rejectWithValue }) => {
    const response = await organizationService.activateOrganization(id)
    if (!response.success) {
      return rejectWithValue(response.error || 'Error al activar organización')
    }
    return response.data
  },
)

export const deactivateOrganization = createAsyncThunk(
  'organizations/deactivate',
  async (id, { rejectWithValue }) => {
    const response = await organizationService.deactivateOrganization(id)
    if (!response.success) {
      return rejectWithValue(response.error || 'Error al desactivar organización')
    }
    return response.data
  },
)

export const deleteOrganization = createAsyncThunk(
  'organizations/delete',
  async (id, { rejectWithValue }) => {
    const response = await organizationService.deleteOrganization(id)
    if (!response.success) {
      return rejectWithValue(response.error || 'Error al eliminar organización')
    }
    return { id }
  },
)

export const deployOrganization = createAsyncThunk(
  'organizations/deploy',
  async (id, { rejectWithValue }) => {
    const response = await organizationService.deployOrganization(id)
    if (!response.success) {
      return rejectWithValue(response.error || 'Error al desplegar organización')
    }
    return response.data
  },
)

const initialState = {
  organizations: [],
  selectedOrganization: null,
  loading: false,
  error: null,
}

const organizationSlice = createSlice({
  name: 'organizations',
  initialState,
  reducers: {
    setSelectedOrganization: (state, action) => {
      state.selectedOrganization = action.payload
    },
    clearOrganizationError: (state) => {
      state.error = null
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch all organizations
      .addCase(fetchOrganizations.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchOrganizations.fulfilled, (state, action) => {
        state.loading = false
        state.organizations = action.payload
      })
      .addCase(fetchOrganizations.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload || 'Error al obtener organizaciones'
      })

      // Fetch organization by ID
      .addCase(fetchOrganizationById.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchOrganizationById.fulfilled, (state, action) => {
        state.loading = false
        state.selectedOrganization = action.payload
      })
      .addCase(fetchOrganizationById.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload || 'Error al obtener organización'
      })

      // Create organization
      .addCase(createOrganization.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(createOrganization.fulfilled, (state, action) => {
        state.loading = false
        state.organizations.push(action.payload)
        state.selectedOrganization = action.payload
      })
      .addCase(createOrganization.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload || 'Error al crear organización'
      })

      // Update organization
      .addCase(updateOrganization.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(updateOrganization.fulfilled, (state, action) => {
        state.loading = false
        const index = state.organizations.findIndex((org) => org._id === action.payload._id)
        if (index !== -1) {
          state.organizations[index] = action.payload
        }
        state.selectedOrganization = action.payload
      })
      .addCase(updateOrganization.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload || 'Error al actualizar organización'
      })

      // Activate organization
      .addCase(activateOrganization.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(activateOrganization.fulfilled, (state, action) => {
        state.loading = false
        const index = state.organizations.findIndex((org) => org._id === action.payload._id)
        if (index !== -1) {
          state.organizations[index] = action.payload
        }
        if (state.selectedOrganization?._id === action.payload._id) {
          state.selectedOrganization = action.payload
        }
      })
      .addCase(activateOrganization.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload || 'Error al activar organización'
      })

      // Deactivate organization
      .addCase(deactivateOrganization.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(deactivateOrganization.fulfilled, (state, action) => {
        state.loading = false
        const index = state.organizations.findIndex((org) => org._id === action.payload._id)
        if (index !== -1) {
          state.organizations[index] = action.payload
        }
        if (state.selectedOrganization?._id === action.payload._id) {
          state.selectedOrganization = action.payload
        }
      })
      .addCase(deactivateOrganization.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload || 'Error al desactivar organización'
      })

      // Delete organization
      .addCase(deleteOrganization.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(deleteOrganization.fulfilled, (state, action) => {
        state.loading = false
        state.organizations = state.organizations.filter((org) => org._id !== action.payload.id)
        if (state.selectedOrganization && state.selectedOrganization._id === action.payload.id) {
          state.selectedOrganization = null
        }
      })
      .addCase(deleteOrganization.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload || 'Error al eliminar organización'
      })

      // Deploy organization
      .addCase(deployOrganization.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(deployOrganization.fulfilled, (state, action) => {
        state.loading = false
        // Update the organization in the state with the new data
        const index = state.organizations.findIndex((org) => org._id === action.payload._id)
        if (index !== -1) {
          state.organizations[index] = action.payload
        }
        if (state.selectedOrganization && state.selectedOrganization._id === action.payload._id) {
          state.selectedOrganization = action.payload
        }
      })
      .addCase(deployOrganization.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload || 'Error al desplegar organización'
      })
  },
})

export const { setSelectedOrganization, clearOrganizationError } = organizationSlice.actions
export default organizationSlice.reducer
