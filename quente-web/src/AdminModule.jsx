import React from 'react'
import { Routes, Route } from 'react-router-dom'
import { CContainer, CRow, CCol } from '@coreui/react'
import OrganizationList from './OrganizationList'
import OrganizationForm from './OrganizationForm'

const AdminModule = () => {
  return (
    <CContainer lg>
      <CRow className="my-4">
        <CCol>
          <h4 className="mb-3">Administración</h4>

          <Routes>
            <Route path="organizaciones" element={<OrganizationList />} />
            <Route path="organizaciones/nueva" element={<OrganizationForm />} />
            <Route path="organizaciones/editar/:id" element={<OrganizationForm />} />
          </Routes>
        </CCol>
      </CRow>
    </CContainer>
  )
}

export default AdminModule
