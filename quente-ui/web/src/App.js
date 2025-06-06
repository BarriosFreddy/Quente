import React, { useEffect } from 'react'
import { useDispatch } from 'react-redux'
import { RouterProvider, createBrowserRouter } from 'react-router-dom'
import './scss/style.scss'
import { getInfoUser } from '@quente/common/modules/core/services/auth.service'
import OfflineIndicator from './components/OfflineIndicator'

const loading = (
  <div className="pt-3 text-center">
    <div className="sk-spinner sk-spinner-pulse"></div>
  </div>
)

// Containers
const DefaultLayout = React.lazy(() => import('src/layout/DefaultLayout'))

// Pages
const LandingPage = React.lazy(() => import('@quente/common/pages/landing/LandingPage'))
const Login = React.lazy(() => import('@quente/common/pages/login/Login'))
const Register = React.lazy(() => import('@quente/common/pages/register/Register'))
//const Page404 = React.lazy(() => import('@quente/common/pages/page404/Page404'))
const Page500 = React.lazy(() => import('@quente/common/pages/page500/Page500'))

const App = () => {
  const dispatch = useDispatch()
  dispatch(getInfoUser())

  // Initialize the database and sync service when the app loads
  useEffect(() => {
    // Import services dynamically to avoid issues with SSR
    import('@quente/common/shared/services/DatabaseService').then((db) => {
      // Initialize database
      console.log('Database initialized')

      // Start sync service
      import('@quente/common/shared/services/SyncService').then((syncService) => {
        syncService.default.schedulePeriodicSync(30) // Sync every 5 minutes
        console.log('Sync service initialized')
      })
    })
  }, [])

  const router = createBrowserRouter([
    {
      path: '/',
      element: (
        <React.Suspense fallback={loading}>
          <LandingPage />
        </React.Suspense>
      ),
    },
    {
      path: '/login',
      element: (
        <React.Suspense fallback={loading}>
          <Login />
        </React.Suspense>
      ),
    },
    {
      path: '/register',
      element: (
        <React.Suspense fallback={loading}>
          <Register />
        </React.Suspense>
      ),
    },
    {
      path: '*',
      element: (
        <React.Suspense fallback={loading}>
          <DefaultLayout />
        </React.Suspense>
      ),
      errorElement: <Page500 />,
      /*     children: [{ path: 'dashboard', name: 'Dashboard', element: <Dashboard /> }], */
    },
  ])

  return (
    <>
      <OfflineIndicator />
      <RouterProvider router={router} />
    </>
  )
}

export default App
