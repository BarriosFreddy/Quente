import { lazy } from 'react'

const Clients = lazy(() => import('@/modules/client/views/clients/Clients'))
const Home = lazy(() => import('@/modules/core/views/home/Home'))
const Synchronizer = lazy(() =>
  import('@/modules/core/views/synchronizer/Synchronizer'),
)

const Dashboard = lazy(() => import('@/modules/billing/views/dashboard/Dashboard'))
const Billing = lazy(() => import('@/modules/billing/views/Billing'))
const BillingsHistorical = lazy(() =>
  import('@/modules/billing/views/BillingsHistorical'),
)

const Items = lazy(() => import('@/modules/inventory/views/items/Items'))
const ItemCategories = lazy(() =>
  import('@/modules/inventory/views/item-categories/ItemCategories'),
)
const DataLoader = lazy(() =>
  import('@/modules/inventory/views/data-loader/DataLoader'),
)
const Kardex = lazy(() => import('@/modules/inventory/views/kardex/kardex'))
const PurchaseOrder = lazy(() =>
  import('@/modules/inventory/views/purchase-order/PurchaseOrder'),
)
const Layaways = lazy(() => import('@/modules/layaway/views/Layaways'))

// Admin module components
const AdminModule = lazy(() => import('./views/admin/AdminModule'))

const routes = [
  { path: '/', exact: true, name: 'Home' },
  { path: '/home', name: 'Home', element: Home },
  { path: '/billing', name: 'Facturación', element: Billing },
  { path: '/billings', name: 'Historial de facturas', element: BillingsHistorical },
  { path: '/dashboard', name: 'Dashboard', element: Dashboard },
  { path: '/billing-synchronizer', name: 'Sinchronizer', element: Synchronizer },
  { path: '/inventory-items', name: 'Items', element: Items },
  { path: '/inventory-data-loader', name: 'Cargador de datos', element: DataLoader },
  { path: '/inventory-item-categories', name: 'Categorias de items', element: ItemCategories },
  { path: '/inventory-kardex', name: 'Kardex', element: Kardex },
  { path: '/inventory-purchase-orders', name: 'Purchase order', element: PurchaseOrder },
  { path: '/clients', name: 'Clients', element: Clients },
  { path: '/layaways', name: 'Layaways', element: Layaways },

  // Admin module routes
  { path: '/admin/*', name: 'Administración', element: AdminModule },
]

export default routes
