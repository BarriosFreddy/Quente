import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { ApiService } from './ApiService'

// Service for user account related API calls
const userAccountService = {
  fetchUserAccounts: async () => {
    try {
      const response = await ApiService.get('/user-accounts')
      return {
        success: true,
        data: response.data,
      }
    } catch (error) {
      console.error('Error fetching user accounts:', error)
      return {
        success: false,
        error: 'Error al obtener cuentas de usuario',
      }
    }
  },

  getUserAccountById: async (id) => {
    try {
      const response = await ApiService.get(`/user-accounts/${id}`)
      return {
        success: true,
        data: response.data,
      }
    } catch (error) {
      console.error('Error fetching user account:', error)
      return {
        success: false,
        error: 'Error al obtener cuenta de usuario',
      }
    }
  },

  createUserAccount: async (userAccount) => {
    try {
      const response = await ApiService.post('/user-accounts', userAccount)
      return {
        success: true,
        data: response.data,
      }
    } catch (error) {
      console.error('Error creating user account:', error)
      return {
        success: false,
        error: 'Error al crear cuenta de usuario',
      }
    }
  },

  updateUserAccount: async (id, userAccount) => {
    try {
      const response = await ApiService.put(`/user-accounts/${id}`, userAccount)
      return {
        success: true,
        data: response.data,
      }
    } catch (error) {
      console.error('Error updating user account:', error)
      return {
        success: false,
        error: 'Error al actualizar cuenta de usuario',
      }
    }
  },

  deleteUserAccount: async (id) => {
    try {
      const response = await ApiService.delete(`/user-accounts/${id}`)
      return {
        success: response.status === 200,
      }
    } catch (error) {
      console.error(`Error deleting user account with id ${id}:`, error)
      return {
        success: false,
        error: 'Error al eliminar cuenta de usuario',
      }
    }
  },

  resetPassword: async (id, password) => {
    try {
      const response = await ApiService.put(`/user-accounts/${id}/reset-password`, { password })
      return {
        success: response.status === 200,
        data: response.data,
      }
    } catch (error) {
      console.error(`Error resetting password for user account with id ${id}:`, error)
      return {
        success: false,
        error: 'Error al restablecer contraseña',
      }
    }
  },
}

// Async thunks
export const fetchUserAccounts = createAsyncThunk(
  'userAccounts/fetchAll',
  async (_, { rejectWithValue }) => {
    const response = await userAccountService.fetchUserAccounts()
    if (!response.success) {
      return rejectWithValue(response.error)
    }
    return response.data
  },
)

export const getUserAccountById = createAsyncThunk(
  'userAccounts/getById',
  async (id, { rejectWithValue }) => {
    const response = await userAccountService.getUserAccountById(id)
    if (!response.success) {
      return rejectWithValue(response.error)
    }
    return response.data
  },
)

export const createUserAccount = createAsyncThunk(
  'userAccounts/create',
  async (userAccount, { rejectWithValue }) => {
    const response = await userAccountService.createUserAccount(userAccount)
    if (!response.success) {
      return rejectWithValue(response.error)
    }
    return response.data
  },
)

export const updateUserAccount = createAsyncThunk(
  'userAccounts/update',
  async ({ id, userAccount }, { rejectWithValue }) => {
    const response = await userAccountService.updateUserAccount(id, userAccount)
    if (!response.success) {
      return rejectWithValue(response.error)
    }
    return response.data
  },
)

export const deleteUserAccount = createAsyncThunk(
  'userAccounts/delete',
  async (id, { rejectWithValue }) => {
    const response = await userAccountService.deleteUserAccount(id)
    if (!response.success) {
      return rejectWithValue(response.error || 'Error al eliminar cuenta de usuario')
    }
    return id
  },
)

export const resetPassword = createAsyncThunk(
  'userAccounts/resetPassword',
  async ({ id, password }, { rejectWithValue }) => {
    const response = await userAccountService.resetPassword(id, password)
    if (!response.success) {
      return rejectWithValue(response.error || 'Error al restablecer contraseña')
    }
    return response.data
  },
)

// Generate a random password with letters, numbers, and special characters
export const generateRandomPassword = () => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()_+'
  let password = ''

  // Ensure at least one of each type of character
  password += chars.substring(0, 26).charAt(Math.floor(Math.random() * 26)) // uppercase
  password += chars.substring(26, 52).charAt(Math.floor(Math.random() * 26)) // lowercase
  password += chars.substring(52, 62).charAt(Math.floor(Math.random() * 10)) // number
  password += chars.substring(62).charAt(Math.floor(Math.random() * (chars.length - 62))) // special

  // Fill the rest of the password
  for (let i = 4; i < 10; i++) {
    password += chars.charAt(Math.floor(Math.random() * chars.length))
  }

  // Shuffle the password
  return password
    .split('')
    .sort(() => 0.5 - Math.random())
    .join('')
}

const initialState = {
  userAccounts: [],
  selectedUserAccount: null,
  loading: false,
  error: null,
}

const userAccountSlice = createSlice({
  name: 'userAccounts',
  initialState,
  reducers: {
    resetSelectedUserAccount: (state) => {
      state.selectedUserAccount = null
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch user accounts
      .addCase(fetchUserAccounts.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchUserAccounts.fulfilled, (state, action) => {
        state.loading = false
        state.userAccounts = action.payload
      })
      .addCase(fetchUserAccounts.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload || 'Error al obtener cuentas de usuario'
      })

      // Get user account by ID
      .addCase(getUserAccountById.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(getUserAccountById.fulfilled, (state, action) => {
        state.loading = false
        state.selectedUserAccount = action.payload
      })
      .addCase(getUserAccountById.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload || 'Error al obtener cuenta de usuario'
      })

      // Create user account
      .addCase(createUserAccount.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(createUserAccount.fulfilled, (state, action) => {
        state.loading = false
        state.userAccounts.push(action.payload)
      })
      .addCase(createUserAccount.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload || 'Error al crear cuenta de usuario'
      })

      // Update user account
      .addCase(updateUserAccount.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(updateUserAccount.fulfilled, (state, action) => {
        state.loading = false
        const index = state.userAccounts.findIndex((account) => account._id === action.payload._id)
        if (index !== -1) {
          state.userAccounts[index] = action.payload
        }
        state.selectedUserAccount = action.payload
      })
      .addCase(updateUserAccount.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload || 'Error al actualizar cuenta de usuario'
      })

      // Delete user account
      .addCase(deleteUserAccount.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(deleteUserAccount.fulfilled, (state, action) => {
        state.loading = false
        state.userAccounts = state.userAccounts.filter((account) => account._id !== action.payload)
        if (state.selectedUserAccount && state.selectedUserAccount._id === action.payload) {
          state.selectedUserAccount = null
        }
      })
      .addCase(deleteUserAccount.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload || 'Error al eliminar cuenta de usuario'
      })

      // Reset password
      .addCase(resetPassword.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(resetPassword.fulfilled, (state) => {
        state.loading = false
      })
      .addCase(resetPassword.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload || 'Error al restablecer contraseña'
      })
  },
})

export const { resetSelectedUserAccount } = userAccountSlice.actions

export default userAccountSlice.reducer
