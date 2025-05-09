import React, { useEffect } from 'react'
import { AppContent, AppHeader } from '../components/index'
import { useDispatch, useSelector } from 'react-redux'
import { getAllItems } from '@quente/common/modules/inventory/services/items.service'
import { ErrorBoundary } from 'react-error-boundary'
import AppSidebar from '@quente/common/components/AppSidebar'

const DefaultLayout = (props) => {
  const dispatch = useDispatch()
  const showHeader = useSelector((state) => state.app.showHeader)

  useEffect(() => {
    dispatch(getAllItems())
  }, [dispatch])

  return (
    <div>
      <ErrorBoundary fallback={<h1>Algo salió mal!</h1>}>
        <AppSidebar />
        <div className="wrapper d-flex flex-column min-vh-100 bg-light">
          {showHeader && <AppHeader />}
          <div className="body flex-grow-1">
            <AppContent />
          </div>
        </div>
      </ErrorBoundary>
    </div>
  )
}

export default DefaultLayout
