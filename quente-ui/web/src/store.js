import { configureStore } from '@reduxjs/toolkit'
import { ApiService } from './ApiService'
import appReducer from './app.slice'
import authReducer from '@quente/common/modules/core/reducers/auth.reducer'
import billingReducer from '@quente/common/modules/billing/reducers/billings.reducer'
import dashboardReducer from '@quente/common/modules/billing/slices/dashboard.slice'
import layawayReducer from '@quente/common/modules/layaway/reducers/layaway.reducer'
import itemsReducer from '@quente/common/modules/inventory/reducers/items.reducer'
import itemCategoriesReducer from '@quente/common/modules/inventory/reducers/item-categories.reducer'
import storage from 'redux-persist/lib/storage'
import { persistReducer, persistStore } from 'redux-persist'
import kardexesReducer from '@quente/common/modules/inventory/reducers/kardexes.reducer'
import purchaseOrdersReducer from '@quente/common/modules/inventory/reducers/purchase-orders.reducer'
import invEnumerationsReducer from '@quente/common/modules/inventory/reducers/inv-enumerations.reducer'
import clientsReducer from '@quente/common/modules/client/reducers/clients.reducer'
import organizationsReducer from './organizationSlice'
import userAccountsReducer from './userAccountSlice'

const persistedBillingReducer = persistReducer(
  {
    key: 'billings',
    storage,
    whitelist: ['offline'],
  },
  billingReducer,
)
const persistedItemsReducer = persistReducer(
  {
    key: 'items',
    storage,
    whitelist: ['offline'],
  },
  itemsReducer,
)
const persistedAuthReducer = persistReducer(
  {
    key: 'auth',
    storage,
    whitelist: ['isLoggedIn', 'infoUser'],
  },
  authReducer,
)

// To use with combineReducers for several reducers
// const persistedReducer = persistReducer(persistConfig, rootReducer)

// Organization service class implementation
class OrganizationService {
  constructor(apiService) {
    this.apiService = apiService
  }

  // Implementation for organization service methods
  // These methods are now handled directly in the organizationSlice.js
}

// Initialize services
const createServices = () => {
  return {
    organizationService: new OrganizationService(ApiService),
  }
}

const store = configureStore({
  //devTools: process.env.NODE_ENV !== 'production',
  reducer: {
    app: appReducer,
    auth: persistedAuthReducer,
    billing: persistedBillingReducer,
    dashboard: dashboardReducer,
    items: persistedItemsReducer,
    itemCategories: itemCategoriesReducer,
    kardexes: kardexesReducer,
    purchaseOrders: purchaseOrdersReducer,
    invEnumerations: invEnumerationsReducer,
    clients: clientsReducer,
    organizations: organizationsReducer,
    userAccounts: userAccountsReducer,
    layaways: layawayReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      thunk: {
        extraArgument: {
          ...ApiService,
          ...createServices(),
        },
      },
    }),
})

export default store

export const persistor = persistStore(store)
