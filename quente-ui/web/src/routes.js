import { lazy } from 'react'

const Clients = lazy(() => import('@quente/common/modules/client/views/clients/Clients'))
const Home = lazy(() => import('@quente/common/modules/core/views/home/Home'))
const Synchronizer = lazy(() =>
  import('@quente/common/modules/core/views/synchronizer/Synchronizer'),
)

const Dashboard = lazy(() => import('@quente/common/modules/billing/views/dashboard/Dashboard'))
const Billing = lazy(() => import('@quente/common/modules/billing/views/Billing'))
const BillingsHistorical = lazy(() =>
  import('@quente/common/modules/billing/views/BillingsHistorical'),
)

const Items = lazy(() => import('@quente/common/modules/inventory/views/items/Items'))
const ItemCategories = lazy(() =>
  import('@quente/common/modules/inventory/views/item-categories/ItemCategories'),
)
const DataLoader = lazy(() =>
  import('@quente/common/modules/inventory/views/data-loader/DataLoader'),
)
const Kardex = lazy(() => import('@quente/common/modules/inventory/views/kardex/kardex'))
const PurchaseOrder = lazy(() =>
  import('@quente/common/modules/inventory/views/purchase-order/PurchaseOrder'),
)

// Admin module components
const AdminModule = lazy(() => import('./views/admin/AdminModule'))
const OrganizationList = lazy(() => import('./views/admin/OrganizationList'))
const OrganizationForm = lazy(() => import('./views/admin/OrganizationForm'))

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

  // Admin module routes
  { path: '/admin/*', name: 'Administración', element: AdminModule },
  { path: '/admin/organizaciones', name: 'Organizaciones', element: OrganizationList },
  { path: '/admin/organizaciones/nueva', name: 'Nueva Organización', element: OrganizationForm },
  {
    path: '/admin/organizaciones/editar/:id',
    name: 'Editar Organización',
    element: OrganizationForm,
  },
]

export default routes
