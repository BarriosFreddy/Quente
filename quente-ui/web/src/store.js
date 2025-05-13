import { configureStore } from '@reduxjs/toolkit'
import { ApiService } from './ApiService'
import appReducer from './app.slice'
import authReducer from '@quente/common/modules/core/reducers/auth.reducer'
import billingReducer from '@quente/common/modules/billing/reducers/billings.reducer'
import dashboardReducer from '@quente/common/modules/billing/slices/dashboard.slice'
import itemsReducer from '@quente/common/modules/inventory/reducers/items.reducer'
import itemCategoriesReducer from '@quente/common/modules/inventory/reducers/item-categories.reducer'
import storage from 'redux-persist/lib/storage'
import { persistReducer, persistStore } from 'redux-persist'
import kardexesReducer from '@quente/common/modules/inventory/reducers/kardexes.reducer'
import purchaseOrdersReducer from '@quente/common/modules/inventory/reducers/purchase-orders.reducer'
import invEnumerationsReducer from '@quente/common/modules/inventory/reducers/inv-enumerations.reducer'
import clientsReducer from '@quente/common/modules/client/reducers/clients.reducer'

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
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      thunk: {
        extraArgument: ApiService,
      },
    }),
})

export default store

export const persistor = persistStore(store)
