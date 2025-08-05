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
import { cilPlus, cilPencil, cilTrash, cilSearch } from '@coreui/icons'
import { fetchUserAccounts, deleteUserAccount } from '../../userAccountSlice'
import { fetchOrganizations } from '../../organizationSlice'

const UserAccountList = () => {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const [searchTerm, setSearchTerm] = useState('')
  const [deleteModalVisible, setDeleteModalVisible] = useState(false)
  const [userAccountToDelete, setUserAccountToDelete] = useState(null)

  const { userAccounts = [], loading, error } = useSelector((state) => state.userAccounts)
  const { organizations = [] } = useSelector((state) => state.organizations || {})

  useEffect(() => {
    dispatch(fetchUserAccounts())
    dispatch(fetchOrganizations())
  }, [dispatch])

  const handleCreateUserAccount = () => {
    navigate('/admin/usuarios/nuevo')
  }

  const handleEditUserAccount = (id) => {
    navigate(`/admin/usuarios/editar/${id}`)
  }

  const handleShowDeleteModal = (userAccount) => {
    setUserAccountToDelete(userAccount)
    setDeleteModalVisible(true)
  }

  const handleConfirmDelete = () => {
    if (userAccountToDelete) {
      dispatch(deleteUserAccount(userAccountToDelete._id))
      setDeleteModalVisible(false)
      setUserAccountToDelete(null)
    }
  }

  const handleCancelDelete = () => {
    setDeleteModalVisible(false)
    setUserAccountToDelete(null)
  }

  const filteredUserAccounts =
    userAccounts?.filter(
      (account) =>
        account.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        account.lastName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        account.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        account.dni?.toLowerCase().includes(searchTerm.toLowerCase()),
    ) || []

  const getOrganizationName = (orgId) => {
    if (!Array.isArray(organizations)) return '-'
    // Handle both cases: when organizationId is stored directly or when it's in an organization object
    const org = organizations.find(
      (org) => org._id === orgId || (orgId && orgId.toString() === org._id?.toString()),
    )
    return org ? org.name : '-'
  }

  const getRoleBadges = (roles) => {
    if (!roles || !roles.length) return <CBadge color="light">Sin roles</CBadge>
    // Map role codes to more friendly names
    const roleLabels = {
      USER: 'Usuario',
      ADMIN: 'Administrador',
      SUPER_ADMIN: 'Super Admin',
    }
    return roles.map((role, index) => {
      const label = roleLabels[role] || role
      return (
        <CBadge key={index} color="primary" className="me-1 mb-1">
          {label}
        </CBadge>
      )
    })
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
        <CButton color="primary" onClick={() => dispatch(fetchUserAccounts())}>
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
              <h5 className="mb-0">Administración de Usuarios</h5>
            </CCol>
            <CCol xs="auto">
              <CButton color="primary" onClick={handleCreateUserAccount}>
                <CIcon icon={cilPlus} className="me-2" />
                Nuevo Usuario
              </CButton>
            </CCol>
          </CRow>
        </CCardHeader>
        <CCardBody>
          <CRow className="mb-3">
            <CCol>
              <CFormInput
                placeholder="Buscar por nombre, correo o DNI..."
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
                <CTableHeaderCell>DNI</CTableHeaderCell>
                <CTableHeaderCell>Correo</CTableHeaderCell>
                <CTableHeaderCell>Organización</CTableHeaderCell>
                <CTableHeaderCell>Roles</CTableHeaderCell>
                <CTableHeaderCell>Acciones</CTableHeaderCell>
              </CTableRow>
            </CTableHead>
            <CTableBody>
              {filteredUserAccounts.length === 0 ? (
                <CTableRow>
                  <CTableDataCell colSpan={6} className="text-center">
                    No se encontraron usuarios
                  </CTableDataCell>
                </CTableRow>
              ) : (
                filteredUserAccounts.map((account) => (
                  <CTableRow key={account._id}>
                    <CTableDataCell>
                      {account.firstName} {account.lastName}
                    </CTableDataCell>
                    <CTableDataCell>
                      {account.dniType} {account.dni}
                    </CTableDataCell>
                    <CTableDataCell>{account.email}</CTableDataCell>
                    <CTableDataCell>{getOrganizationName(account.organizationId)}</CTableDataCell>
                    <CTableDataCell>{getRoleBadges(account.roles)}</CTableDataCell>
                    <CTableDataCell>
                      <CButton
                        color="primary"
                        size="sm"
                        variant="ghost"
                        onClick={() => handleEditUserAccount(account._id)}
                        className="me-2"
                      >
                        <CIcon icon={cilPencil} />
                      </CButton>
                      <CButton
                        color="danger"
                        size="sm"
                        variant="ghost"
                        onClick={() => handleShowDeleteModal(account)}
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
        aria-labelledby="delete-user-modal"
        alignment="center"
      >
        <CModalHeader closeButton>
          <CModalTitle id="delete-user-modal">Confirmar eliminación</CModalTitle>
        </CModalHeader>
        <CModalBody>
          {userAccountToDelete && (
            <p>
              {'¿Está seguro que desea eliminar la cuenta de usuario de '}
              <strong>
                {userAccountToDelete.firstName} {userAccountToDelete.lastName}
              </strong>
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

export default UserAccountList
