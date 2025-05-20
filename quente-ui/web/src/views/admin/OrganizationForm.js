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
} from '@coreui/react'
import CIcon from '@coreui/icons-react'
import { cilSave, cilX } from '@coreui/icons'
import {
  fetchOrganizationById,
  createOrganization,
  updateOrganization,
  clearOrganizationError,
} from '../../organizationSlice'

const OrganizationForm = () => {
  const { id } = useParams()
  const dispatch = useDispatch()
  const navigate = useNavigate()

  const { selectedOrganization, loading, error } = useSelector((state) => state.organizations)

  const [form, setForm] = useState({
    name: '',
    nit: '',
    address: '',
    city: '',
    country: '',
    phoneNumber: '',
  })

  const [validated, setValidated] = useState(false)

  useEffect(() => {
    if (id) {
      dispatch(fetchOrganizationById(id))
    } else {
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
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    const formElement = e.currentTarget

    setValidated(true)

    if (formElement.checkValidity() === false) {
      e.stopPropagation()
      return
    }

    if (id) {
      dispatch(updateOrganization({ id, organization: form })).then((result) => {
        if (!result.error) {
          navigate('/admin/organizaciones')
        }
      })
    } else {
      dispatch(createOrganization(form)).then((result) => {
        if (!result.error) {
          navigate('/admin/organizaciones')
        }
      })
    }
  }

  const handleCancel = () => {
    navigate('/admin/organizaciones')
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
              />
              <CFormFeedback invalid>Por favor ingrese un nombre</CFormFeedback>
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
