import React, { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate, useParams } from 'react-router-dom'
import {
  CButton,
  CCard,
  CCardBody,
  CCardFooter,
  CCardHeader,
  CCol,
  CForm,
  CFormInput,
  CFormLabel,
  CFormFeedback,
  CRow,
  CSpinner,
  CAlert,
} from '@coreui/react'
import CIcon from '@coreui/icons-react'
import { cilSave, cilX, cilCloudUpload } from '@coreui/icons'
import {
  fetchOrganizationById,
  createOrganization,
  updateOrganization,
  clearOrganizationError,
  deployOrganization,
  fetchOrganizations,
} from '../../organizationSlice'
import { OrganizationStatus } from '../../constants'

const OrganizationForm = () => {
  const { id } = useParams()
  const dispatch = useDispatch()
  const navigate = useNavigate()

  const { selectedOrganization, loading, error, organizations } = useSelector(
    (state) => state.organizations,
  )

  const [form, setForm] = useState({
    name: '',
    nit: '',
    address: '',
    city: '',
    country: '',
    phoneNumber: '',
  })

  const [validated, setValidated] = useState(false)
  const [nameExists, setNameExists] = useState(false)
  const [nameExistsMessage, setNameExistsMessage] = useState('')

  useEffect(() => {
    if (id) {
      dispatch(fetchOrganizationById(id))
    } else {
      // Load all organizations for validation when creating a new one
      dispatch(fetchOrganizations())
      dispatch(clearOrganizationError())
    }
  }, [dispatch, id])

  useEffect(() => {
    if (selectedOrganization && id) {
      setForm({
        name: selectedOrganization.name || '',
        nit: selectedOrganization.nit || '',
        address: selectedOrganization.address || '',
        city: selectedOrganization.city || '',
        country: selectedOrganization.country || '',
        phoneNumber: selectedOrganization.phoneNumber || '',
      })
    }
  }, [selectedOrganization, id])

  const handleChange = (e) => {
    const { name, value } = e.target
    setForm((prevForm) => ({
      ...prevForm,
      [name]: value,
    }))

    // Check for duplicate name when the name field changes
    if (name === 'name' && value.trim() !== '') {
      const trimmedValue = value.trim().toLowerCase()

      // Skip validation if editing an existing organization with the same name
      if (id && selectedOrganization && selectedOrganization.name.toLowerCase() === trimmedValue) {
        setNameExists(false)
        setNameExistsMessage('')
        return
      }

      // Check if name already exists in organizations
      const duplicateName = organizations?.some(
        (org) => org.name.toLowerCase() === trimmedValue && org._id !== id,
      )

      if (duplicateName) {
        setNameExists(true)
        setNameExistsMessage(`An organization named "${value}" already exists.`)
      } else {
        setNameExists(false)
        setNameExistsMessage('')
      }
    }
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    const formElement = e.currentTarget

    setValidated(true)

    if (formElement.checkValidity() === false || nameExists) {
      e.stopPropagation()
      return
    }

    if (id) {
      dispatch(updateOrganization({ id, organization: form }))
        .unwrap()
        .then(() => {
          navigate('/admin/organizaciones')
        })
        .catch((err) => {
          if (err?.code === 'DUPLICATE_NAME' || err?.code === 'DUPLICATE_KEY') {
            setNameExists(true)
            setNameExistsMessage(err.message || 'An organization with this name already exists.')
          }
        })
    } else {
      dispatch(createOrganization(form))
        .unwrap()
        .then(() => {
          navigate('/admin/organizaciones')
        })
        .catch((err) => {
          if (err?.code === 'DUPLICATE_NAME' || err?.code === 'DUPLICATE_KEY') {
            setNameExists(true)
            setNameExistsMessage(err.message || 'An organization with this name already exists.')
          }
        })
    }
  }

  const handleCancel = () => {
    navigate('/admin/organizaciones')
  }

  const handleDeploy = () => {
    if (!id || !selectedOrganization) return

    dispatch(deployOrganization(id))
      .unwrap()
      .then(() => {
        dispatch(fetchOrganizations())
        navigate('/admin/organizaciones')
      })
      .catch((error) => {
        console.error('Error deploying organization:', error)
        alert(`Error al desplegar la organización: ${error.message || 'Error desconocido'}`)
      })
  }

  if (loading && id) {
    return (
      <div className="d-flex justify-content-center mt-5">
        <CSpinner />
      </div>
    )
  }

  return (
    <CCard>
      <CCardHeader>
        <h5 className="mb-0">{id ? 'Editar Organización' : 'Nueva Organización'}</h5>
      </CCardHeader>
      <CForm noValidate validated={validated} onSubmit={handleSubmit}>
        <CCardBody>
          {error && (
            <div className="alert alert-danger" role="alert">
              {error}
            </div>
          )}

          <CRow className="mb-3">
            <CCol md={6}>
              <CFormLabel htmlFor="name">Nombre</CFormLabel>
              <CFormInput
                id="name"
                name="name"
                value={form.name}
                onChange={handleChange}
                required
                placeholder="Nombre de la organización"
                invalid={validated && (form.name === '' || nameExists)}
              />
              <CFormFeedback invalid>
                {nameExists ? nameExistsMessage : 'Por favor ingrese un nombre'}
              </CFormFeedback>
              {nameExists && !validated && (
                <CAlert color="warning" className="mt-2" size="sm">
                  {nameExistsMessage}
                </CAlert>
              )}
            </CCol>

            <CCol md={6}>
              <CFormLabel htmlFor="nit">NIT</CFormLabel>
              <CFormInput
                id="nit"
                name="nit"
                value={form.nit}
                onChange={handleChange}
                required
                placeholder="NIT de la organización"
              />
              <CFormFeedback invalid>Por favor ingrese un NIT válido</CFormFeedback>
            </CCol>
          </CRow>

          <CRow className="mb-3">
            <CCol md={12}>
              <CFormLabel htmlFor="address">Dirección</CFormLabel>
              <CFormInput
                id="address"
                name="address"
                value={form.address}
                onChange={handleChange}
                required
                placeholder="Dirección completa"
              />
              <CFormFeedback invalid>Por favor ingrese una dirección</CFormFeedback>
            </CCol>
          </CRow>

          <CRow className="mb-3">
            <CCol md={6}>
              <CFormLabel htmlFor="city">Ciudad</CFormLabel>
              <CFormInput
                id="city"
                name="city"
                value={form.city}
                onChange={handleChange}
                required
                placeholder="Ciudad"
              />
              <CFormFeedback invalid>Por favor ingrese una ciudad</CFormFeedback>
            </CCol>

            <CCol md={6}>
              <CFormLabel htmlFor="country">País</CFormLabel>
              <CFormInput
                id="country"
                name="country"
                value={form.country}
                onChange={handleChange}
                required
                placeholder="País"
              />
              <CFormFeedback invalid>Por favor ingrese un país</CFormFeedback>
            </CCol>
          </CRow>

          <CRow className="mb-3">
            <CCol md={6}>
              <CFormLabel htmlFor="phoneNumber">Teléfono</CFormLabel>
              <CFormInput
                id="phoneNumber"
                name="phoneNumber"
                value={form.phoneNumber}
                onChange={handleChange}
                required
                placeholder="Número de teléfono"
              />
              <CFormFeedback invalid>Por favor ingrese un número de teléfono</CFormFeedback>
            </CCol>
          </CRow>
        </CCardBody>

        <CCardFooter className="d-flex justify-content-end">
          <CButton color="danger" variant="outline" className="me-2" onClick={handleCancel}>
            <CIcon icon={cilX} className="me-2" />
            Cancelar
          </CButton>

          {/* Show Deploy button only for organizations with CREATING status */}
          {id &&
            selectedOrganization &&
            selectedOrganization.status === OrganizationStatus.CREATING && (
              <CButton
                color="success"
                variant="outline"
                className="me-2"
                onClick={handleDeploy}
                disabled={loading}
              >
                {loading ? (
                  <CSpinner size="sm" className="me-2" />
                ) : (
                  <CIcon icon={cilCloudUpload} className="me-2" />
                )}
                Desplegar
              </CButton>
            )}

          <CButton color="primary" type="submit" disabled={loading}>
            {loading ? (
              <CSpinner size="sm" className="me-2" />
            ) : (
              <CIcon icon={cilSave} className="me-2" />
            )}
            {id ? 'Actualizar' : 'Guardar'}
          </CButton>
        </CCardFooter>
      </CForm>
    </CCard>
  )
}

export default OrganizationForm
