import React from 'react'
import { Routes, Route, NavLink, useLocation } from 'react-router-dom'
import { CContainer, CRow, CCol, CNav, CNavItem, CNavLink } from '@coreui/react'
import OrganizationList from './OrganizationList'
import OrganizationForm from './OrganizationForm'
import UserAccountList from './UserAccountList'
import UserAccountForm from './UserAccountForm'

const AdminModule = () => {
  const location = useLocation()
  const path = location.pathname

  return (
    <CContainer lg>
      <CRow className="my-4">
        <CCol>
          <h4 className="mb-3">Administración</h4>
          <CNav variant="tabs" className="mb-4">
            <CNavItem>
              <CNavLink
                component={NavLink}
                to="/admin/organizaciones"
                active={path.includes('/organizaciones')}
              >
                Organizaciones
              </CNavLink>
            </CNavItem>
            <CNavItem>
              <CNavLink
                component={NavLink}
                to="/admin/usuarios"
                active={path.includes('/usuarios')}
              >
                Usuarios
              </CNavLink>
            </CNavItem>
          </CNav>

          <Routes>
            <Route path="organizaciones" element={<OrganizationList />} />
            <Route path="organizaciones/nueva" element={<OrganizationForm />} />
            <Route path="organizaciones/editar/:id" element={<OrganizationForm />} />
            <Route path="usuarios" element={<UserAccountList />} />
            <Route path="usuarios/nuevo" element={<UserAccountForm />} />
            <Route path="usuarios/editar/:id" element={<UserAccountForm />} />
          </Routes>
        </CCol>
      </CRow>
    </CContainer>
  )
}

export default AdminModule
