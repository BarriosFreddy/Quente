import React, { useEffect, useState, Fragment } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import {
  CButton,
  CCard,
  CCardBody,
  CCardHeader,
  CCol,
  CRow,
  CSpinner,
  CTable,
  CTableBody,
  CTableDataCell,
  CTableHead,
  CTableHeaderCell,
  CTableRow,
  CFormInput,
  CBadge,
  CModal,
  CModalHeader,
  CModalTitle,
  CModalBody,
  CModalFooter,
} from '@coreui/react'
import CIcon from '@coreui/icons-react'
import { cilPlus, cilPencil, cilCheck, cilX, cilSearch, cilTrash } from '@coreui/icons'
import {
  fetchOrganizations,
  activateOrganization,
  deactivateOrganization,
  deleteOrganization,
} from '../../organizationSlice'

// Enum for organization status
const OrganizationStatus = {
  CREATING: 'CREATING',
  ACTIVE: 'ACTIVE',
  INACTIVE: 'INACTIVE',
}

const OrganizationList = () => {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const [searchTerm, setSearchTerm] = useState('')
  const [deleteModalVisible, setDeleteModalVisible] = useState(false)
  const [organizationToDelete, setOrganizationToDelete] = useState(null)

  const { organizations, loading, error } = useSelector((state) => state.organizations)

  useEffect(() => {
    dispatch(fetchOrganizations())
  }, [dispatch])

  const handleCreateOrganization = () => {
    navigate('/admin/organizaciones/nueva')
  }

  const handleEditOrganization = (id) => {
    navigate(`/admin/organizaciones/editar/${id}`)
  }

  const handleActivateOrganization = (id) => {
    dispatch(activateOrganization(id))
  }

  const handleDeactivateOrganization = (id) => {
    dispatch(deactivateOrganization(id))
  }

  const handleShowDeleteModal = (organization) => {
    setOrganizationToDelete(organization)
    setDeleteModalVisible(true)
  }

  const handleConfirmDelete = () => {
    if (organizationToDelete) {
      dispatch(deleteOrganization(organizationToDelete._id))
      setDeleteModalVisible(false)
      setOrganizationToDelete(null)
    }
  }

  const handleCancelDelete = () => {
    setDeleteModalVisible(false)
    setOrganizationToDelete(null)
  }

  const filteredOrganizations =
    organizations?.filter(
      (org) =>
        org.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        org.nit.toLowerCase().includes(searchTerm.toLowerCase()),
    ) || []

  const getStatusBadge = (status) => {
    switch (status) {
      case OrganizationStatus.ACTIVE:
        return <CBadge color="success">Activa</CBadge>
      case OrganizationStatus.INACTIVE:
        return <CBadge color="danger">Inactiva</CBadge>
      case OrganizationStatus.CREATING:
        return <CBadge color="warning">Creando</CBadge>
      default:
        return <CBadge color="info">Desconocido</CBadge>
    }
  }

  if (loading) {
    return (
      <div className="d-flex justify-content-center mt-5">
        <CSpinner />
      </div>
    )
  }

  if (error) {
    return (
      <div className="mt-3">
        <h6 className="text-danger">Error: {error}</h6>
        <CButton color="primary" onClick={() => dispatch(fetchOrganizations())}>
          Reintentar
        </CButton>
      </div>
    )
  }

  return (
    <Fragment>
      <CCard>
        <CCardHeader>
          <CRow className="align-items-center justify-content-between">
            <CCol>
              <h5 className="mb-0">Administración de Organizaciones</h5>
            </CCol>
            <CCol xs="auto">
              <CButton color="primary" onClick={handleCreateOrganization}>
                <CIcon icon={cilPlus} className="me-2" />
                Nueva Organización
              </CButton>
            </CCol>
          </CRow>
        </CCardHeader>
        <CCardBody>
          <CRow className="mb-3">
            <CCol>
              <CFormInput
                placeholder="Buscar por nombre o NIT..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                text
                prefix={<CIcon icon={cilSearch} />}
              />
            </CCol>
          </CRow>

          <CTable hover responsive>
            <CTableHead>
              <CTableRow>
                <CTableHeaderCell>Nombre</CTableHeaderCell>
                <CTableHeaderCell>NIT</CTableHeaderCell>
                <CTableHeaderCell>Ubicación</CTableHeaderCell>
                <CTableHeaderCell>Estado</CTableHeaderCell>
                <CTableHeaderCell>Acciones</CTableHeaderCell>
              </CTableRow>
            </CTableHead>
            <CTableBody>
              {filteredOrganizations.length === 0 ? (
                <CTableRow>
                  <CTableDataCell colSpan={5} className="text-center">
                    No se encontraron organizaciones
                  </CTableDataCell>
                </CTableRow>
              ) : (
                filteredOrganizations.map((org) => (
                  <CTableRow key={org._id}>
                    <CTableDataCell>{org.name}</CTableDataCell>
                    <CTableDataCell>{org.nit}</CTableDataCell>
                    <CTableDataCell>
                      {org.city && org.country ? `${org.city}, ${org.country}` : '-'}
                    </CTableDataCell>
                    <CTableDataCell>{getStatusBadge(org.status)}</CTableDataCell>
                    <CTableDataCell>
                      <CButton
                        color="primary"
                        size="sm"
                        variant="ghost"
                        onClick={() => handleEditOrganization(org._id)}
                        className="me-2"
                      >
                        <CIcon icon={cilPencil} />
                      </CButton>

                      {org.status === OrganizationStatus.ACTIVE ? (
                        <CButton
                          color="danger"
                          size="sm"
                          variant="ghost"
                          onClick={() => handleDeactivateOrganization(org._id)}
                          className="me-2"
                        >
                          <CIcon icon={cilX} />
                        </CButton>
                      ) : (
                        <CButton
                          color="success"
                          size="sm"
                          variant="ghost"
                          onClick={() => handleActivateOrganization(org._id)}
                          className="me-2"
                        >
                          <CIcon icon={cilCheck} />
                        </CButton>
                      )}
                      <CButton
                        color="danger"
                        size="sm"
                        variant="ghost"
                        onClick={() => handleShowDeleteModal(org)}
                      >
                        <CIcon icon={cilTrash} />
                      </CButton>
                    </CTableDataCell>
                  </CTableRow>
                ))
              )}
            </CTableBody>
          </CTable>
        </CCardBody>
      </CCard>

      {/* Delete Confirmation Modal */}
      <CModal
        visible={deleteModalVisible}
        onClose={handleCancelDelete}
        aria-labelledby="delete-organization-modal"
        alignment="center"
      >
        <CModalHeader closeButton>
          <CModalTitle id="delete-organization-modal">Confirmar eliminación</CModalTitle>
        </CModalHeader>
        <CModalBody>
          {organizationToDelete && (
            <p>
              {'¿Está seguro que desea eliminar la organización '}
              <strong>{organizationToDelete.name}</strong>
              {'?'}
              <br />
              Esta acción no se puede deshacer.
            </p>
          )}
        </CModalBody>
        <CModalFooter>
          <CButton color="secondary" onClick={handleCancelDelete}>
            Cancelar
          </CButton>
          <CButton color="danger" onClick={handleConfirmDelete}>
            Eliminar
          </CButton>
        </CModalFooter>
      </CModal>
    </Fragment>
  )
}

export default OrganizationList
