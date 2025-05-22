import React from 'react'
import { NavLink } from 'react-router-dom'
import { useSelector, useDispatch } from 'react-redux'
import {
  CContainer,
  CHeader,
  CHeaderBrand,
  CHeaderNav,
  CNavLink,
  CToaster,
  CToast,
  CToastBody,
  CToastClose,
  CHeaderToggler,
} from '@coreui/react'
import CIcon from '@coreui/icons-react'
import { cilChartLine, cilDollar, cilHistory, cilInbox, cilMenu } from '@coreui/icons'

import AppHeaderDropdown from '@quente/common/components/AppHeaderDropdown'
import { setShowToast, setSidebarShow } from 'src/app.slice'
import SyncStatus from './SyncStatus'

const AppHeader = () => {
  const dispatch = useDispatch()
  const { organization } = useSelector((state) => state.auth.infoUser) ?? {}
  const showToast = useSelector((state) => state.app.showToast)
  const sidebarShow = useSelector((state) => state.app.sidebarShow)
  const toastConfig = useSelector((state) => state.app.toastConfig)

  return (
    <CHeader position="sticky" className="mb-1">
      <CContainer>
        <CHeaderToggler className="ps-1" onClick={() => dispatch(setSidebarShow(!sidebarShow))}>
          <CIcon icon={cilMenu} size="lg" />
        </CHeaderToggler>
        <CHeaderBrand to="/" className="text-uppercase">
          {organization?.name}
        </CHeaderBrand>
        <div className="d-none d-md-block">
          <CHeaderNav>
            <CNavLink to="/billing" component={NavLink}>
              <CIcon icon={cilDollar} /> Facturación
            </CNavLink>
            <CNavLink to="/billings" component={NavLink}>
              <CIcon icon={cilHistory} /> Historial
            </CNavLink>
            <CNavLink to="/dashboard" component={NavLink}>
              <CIcon icon={cilChartLine} /> Panel de administración
            </CNavLink>
            <CNavLink to="/inventory-items" component={NavLink}>
              <CIcon icon={cilInbox} /> Inventario
            </CNavLink>
          </CHeaderNav>
        </div>
        <CHeaderNav className="ms-3">
          <AppHeaderDropdown />
        </CHeaderNav>
        <div className="sync-status-wrapper">
          <SyncStatus />
        </div>
      </CContainer>
      <CToaster placement="top-end">
        <CToast
          visible={showToast}
          color={toastConfig.color ?? 'info'}
          onClose={() => {
            dispatch(setShowToast(false))
          }}
          delay={toastConfig.delay ?? 5000}
        >
          <div className="d-flex">
            <CToastBody className="fs-6">{toastConfig.message ?? ''}</CToastBody>
            <CToastClose className="me-2 m-auto" />
          </div>
        </CToast>
      </CToaster>
    </CHeader>
  )
}

export default AppHeader
