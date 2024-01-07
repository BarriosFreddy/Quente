import { configureStore } from '@reduxjs/toolkit'
import { ApiService } from './ApiService'
import appReducer from './app.slice'
import authReducer from './modules/core/reducers/auth.reducer'
import billingReducer from './modules/billing/reducers/billings.reducer'
import itemsReducer from './modules/inventory/reducers/items.reducer'
import itemCategoriesReducer from './modules/inventory/reducers/item-categories.reducer'
import storage from 'redux-persist/lib/storage'
import { persistReducer, persistStore } from 'redux-persist'
import kardexesReducer from './modules/inventory/reducers/kardexes.reducer'
import purchaseOrdersReducer from './modules/inventory/reducers/purchase-orders.reducer'
import invEnumerationsReducer from './modules/inventory/reducers/inv-enumerations.reducer'

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
    items: persistedItemsReducer,
    itemCategories: itemCategoriesReducer,
    kardexes: kardexesReducer,
    purchaseOrders: purchaseOrdersReducer,
    invEnumerations: invEnumerationsReducer,
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
