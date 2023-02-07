import React, { Suspense } from 'react'
import { Navigate, Route, Routes } from 'react-router-dom'
import { CContainer, CSpinner } from '@coreui/react'

// routes config
import routes from '../routes'
import { useSelector } from 'react-redux'
import RequiredAuth from './RequireAuth'

const AppContent = () => {
  const isLoggedIn = useSelector((state) => state.isLoggedIn)
  return (
    <CContainer lg>
      <Suspense fallback={<CSpinner color="primary" />}>
        <Routes>
          {routes.map((route, idx) => {
            return (
              route.element && (
                <Route
                  key={idx}
                  path={route.path}
                  exact={route.exact}
                  name={route.name}
                  element={
                    <RequiredAuth isLoggedIn={isLoggedIn}>
                      <route.element />
                    </RequiredAuth>
                  }
                />
              )
            )
          })}
          <Route render path="/" element={<Navigate to="dashboard" replace />} />
        </Routes>
      </Suspense>
    </CContainer>
  )
}

export default React.memo(AppContent)
