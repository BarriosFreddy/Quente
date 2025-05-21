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
  CFormSelect,
  CInputGroup,
  CInputGroupText,
  CRow,
  CSpinner,
  CAlert,
  CFormCheck,
  CTooltip,
  CPopover,
} from '@coreui/react'
import CIcon from '@coreui/icons-react'
import { cilArrowLeft, cilReload, cilCopy } from '@coreui/icons'
import {
  createUserAccount,
  updateUserAccount,
  getUserAccountById,
  resetSelectedUserAccount,
  generateRandomPassword,
  resetPassword,
} from '../../userAccountSlice'
import { fetchOrganizations } from '../../organizationSlice'

const UserAccountForm = () => {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const { id } = useParams()
  const isEditMode = !!id

  const [formData, setFormData] = useState({
    dniType: 'CC',
    dni: '',
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    roles: ['USER'],
    phone: '',
    address: '',
    organizationId: '',
    birthdate: '',
  })
  const [errors, setErrors] = useState({})
  const [passwordVisible, setPasswordVisible] = useState(false)
  const [passwordCopied, setPasswordCopied] = useState(false)
  const availableRoles = [
    { value: 'USER', label: 'Usuario' },
    { value: 'ADMIN', label: 'Administrador' },
    { value: 'SUPER_ADMIN', label: 'Super Administrador' },
  ]

  const dniTypes = [
    { value: 'CC', label: 'Cédula de Ciudadanía' },
    { value: 'CE', label: 'Cédula de Extranjería' },
    { value: 'PA', label: 'Pasaporte' },
    { value: 'NIT', label: 'NIT' },
  ]

  const { loading, error, selectedUserAccount } = useSelector((state) => state.userAccounts)
  const { organizations = [] } = useSelector((state) => state.organizations || {})

  useEffect(() => {
    dispatch(fetchOrganizations())

    if (isEditMode) {
      dispatch(getUserAccountById(id))
    }

    return () => {
      dispatch(resetSelectedUserAccount())
    }
  }, [dispatch, id, isEditMode])

  useEffect(() => {
    if (isEditMode && selectedUserAccount) {
      const userData = { ...selectedUserAccount }

      // Format birthdate if it exists
      if (userData.birthdate) {
        userData.birthdate = new Date(userData.birthdate).toISOString().substring(0, 10)
      }

      // Handle organization properly
      if (userData.organization) {
        // If organization is stored as an object with _id
        userData.organizationId = userData.organization._id || userData.organization
        delete userData.organization
      } else if (userData.organizationId && typeof userData.organizationId === 'object') {
        // If organizationId is stored as an object
        userData.organizationId = userData.organizationId._id
      }

      // Ensure roles is always an array
      if (!userData.roles || !Array.isArray(userData.roles)) {
        userData.roles = ['USER']
      }

      setFormData(userData)
    } else if (!isEditMode) {
      // Generate random password for new users
      setFormData((prevData) => ({
        ...prevData,
        password: generateRandomPassword(),
      }))
    }
  }, [selectedUserAccount, isEditMode])

  const handleGeneratePassword = () => {
    setFormData({
      ...formData,
      password: generateRandomPassword(),
    })
    setPasswordCopied(false)
  }

  const togglePasswordVisibility = () => {
    setPasswordVisible(!passwordVisible)
  }

  const copyPasswordToClipboard = () => {
    navigator.clipboard.writeText(formData.password)
    setPasswordCopied(true)
    setTimeout(() => setPasswordCopied(false), 2000)
  }

  const handleCheckboxChange = (e) => {
    const { name, value, checked } = e.target
    setFormData((prevData) => {
      // Ensure prevData[name] is an array
      const currentValues = Array.isArray(prevData[name]) ? prevData[name] : []

      if (checked) {
        return {
          ...prevData,
          [name]: [...currentValues, value],
        }
      } else {
        return {
          ...prevData,
          [name]: currentValues.filter((item) => item !== value),
        }
      }
    })
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData({
      ...formData,
      [name]: value,
    })
    // Clear the error for this field
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: null,
      })
    }
  }

  const validateForm = () => {
    const newErrors = {}
    if (!formData.firstName) newErrors.firstName = 'El nombre es obligatorio'
    if (!formData.lastName) newErrors.lastName = 'El apellido es obligatorio'
    if (!formData.dniType) newErrors.dniType = 'El tipo de documento es obligatorio'
    if (!formData.dni) newErrors.dni = 'El número de documento es obligatorio'
    if (!formData.email) newErrors.email = 'El correo electrónico es obligatorio'
    if (!formData.password && !isEditMode)
      newErrors.password = 'La contraseña es obligatoria para nuevos usuarios'
    if (!formData.organizationId) newErrors.organizationId = 'La organización es obligatoria'
    if (formData.roles.length === 0) newErrors.roles = 'Debe seleccionar al menos un rol'

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (formData.email && !emailRegex.test(formData.email))
      newErrors.email = 'El correo electrónico no es válido'

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = (e) => {
    e.preventDefault()

    if (!validateForm()) {
      return
    }

    const userData = { ...formData }

    // Format birthdate if it exists
    if (userData.birthdate) {
      userData.birthdate = new Date(userData.birthdate)
    }

    // Ensure organization is properly set
    if (userData.organizationId) {
      // Make sure organizationId is a string, not an object
      if (typeof userData.organizationId === 'object' && userData.organizationId._id) {
        userData.organizationId = userData.organizationId._id
      }
    }

    // Ensure roles is always an array
    if (!userData.roles || !Array.isArray(userData.roles)) {
      userData.roles = ['USER']
    }

    // Always remove password and _id from the main user data
    const userPassword = userData.password
    delete userData.password

    if (isEditMode) {
      delete userData._id // MongoDB immutable field
      delete userData.createdAt // Should not be updated
      delete userData.__v // Mongoose version key
      delete userData.organizationId // Should use organization reference instead
    }

    if (isEditMode) {
      // First update the user data without password
      dispatch(updateUserAccount({ id, userAccount: userData }))
        .unwrap()
        .then(() => {
          // If password was provided, reset it in a separate call
          if (userPassword) {
            return dispatch(resetPassword({ id, password: userPassword })).unwrap()
          }
        })
        .then(() => {
          navigate('/admin/usuarios')
        })
        .catch((error) => {
          console.error('Error updating user:', error)
        })
    } else {
      // For new users, create the account first
      dispatch(createUserAccount(userData))
        .unwrap()
        .then((newUser) => {
          // Then set the password separately
          if (userPassword) {
            return dispatch(resetPassword({ id: newUser._id, password: userPassword })).unwrap()
          }
        })
        .then(() => {
          navigate('/admin/usuarios')
        })
        .catch((error) => {
          console.error('Error creating user:', error)
        })
    }
  }

  const handleCancel = () => {
    navigate('/admin/usuarios')
  }

  return (
    <CCard>
      <CCardHeader>
        <h5>{isEditMode ? 'Editar Usuario' : 'Nuevo Usuario'}</h5>
      </CCardHeader>
      <CCardBody>
        {loading && !formData ? (
          <div className="d-flex justify-content-center">
            <CSpinner />
          </div>
        ) : (
          <CForm onSubmit={handleSubmit}>
            {error && <CAlert color="danger">{error}</CAlert>}

            <CRow className="mb-3">
              <CCol md={6}>
                <CFormLabel>Organización</CFormLabel>
                <CFormSelect
                  id="organizationId"
                  name="organizationId"
                  value={formData.organizationId || ''}
                  onChange={handleChange}
                  aria-label="Organization"
                  aria-describedby="organization-helper"
                  invalid={!!errors.organizationId}
                >
                  <option value="">Seleccione una organización</option>
                  {organizations.map((org) => (
                    <option key={org._id} value={org._id}>
                      {org.name}
                    </option>
                  ))}
                </CFormSelect>
                {errors.organizationId && (
                  <div className="text-danger">{errors.organizationId}</div>
                )}
              </CCol>
            </CRow>

            <CRow className="mb-3">
              <CCol md={6}>
                <CFormLabel>Nombre</CFormLabel>
                <CFormInput
                  type="text"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleChange}
                  invalid={!!errors.firstName}
                />
                {errors.firstName && <div className="text-danger">{errors.firstName}</div>}
              </CCol>
              <CCol md={6}>
                <CFormLabel>Apellido</CFormLabel>
                <CFormInput
                  type="text"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleChange}
                  invalid={!!errors.lastName}
                />
                {errors.lastName && <div className="text-danger">{errors.lastName}</div>}
              </CCol>
            </CRow>

            <CRow className="mb-3">
              <CCol md={3}>
                <CFormLabel>Tipo de documento</CFormLabel>
                <CFormSelect
                  name="dniType"
                  value={formData.dniType}
                  onChange={handleChange}
                  invalid={!!errors.dniType}
                >
                  {dniTypes.map((type) => (
                    <option key={type.value} value={type.value}>
                      {type.label}
                    </option>
                  ))}
                </CFormSelect>
                {errors.dniType && <div className="text-danger">{errors.dniType}</div>}
              </CCol>
              <CCol md={3}>
                <CFormLabel>Número de documento</CFormLabel>
                <CFormInput
                  type="text"
                  name="dni"
                  value={formData.dni}
                  onChange={handleChange}
                  invalid={!!errors.dni}
                />
                {errors.dni && <div className="text-danger">{errors.dni}</div>}
              </CCol>
              <CCol md={6}>
                <CFormLabel>Fecha de nacimiento</CFormLabel>
                <CFormInput
                  type="date"
                  name="birthdate"
                  value={formData.birthdate || ''}
                  onChange={handleChange}
                />
              </CCol>
            </CRow>

            <CRow className="mb-3">
              <CCol md={6}>
                <CFormLabel>Teléfono</CFormLabel>
                <CFormInput
                  type="text"
                  name="phone"
                  value={formData.phone || ''}
                  onChange={handleChange}
                />
              </CCol>
              <CCol md={6}>
                <CFormLabel>Dirección</CFormLabel>
                <CFormInput
                  type="text"
                  name="address"
                  value={formData.address || ''}
                  onChange={handleChange}
                />
              </CCol>
            </CRow>

            <CRow className="mb-3">
              <CCol md={6}>
                <CFormLabel>Correo electrónico</CFormLabel>
                <CFormInput
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  invalid={!!errors.email}
                />
                {errors.email && <div className="text-danger">{errors.email}</div>}
              </CCol>
              <CCol md={6}>
                <CFormLabel>Contraseña {isEditMode && '(Dejar vacío para no cambiar)'}</CFormLabel>
                <CInputGroup>
                  <CFormInput
                    type={passwordVisible ? 'text' : 'password'}
                    name="password"
                    value={formData.password || ''}
                    onChange={handleChange}
                    invalid={!!errors.password}
                  />
                  <CInputGroupText onClick={togglePasswordVisibility} role="button">
                    {passwordVisible ? 'Ocultar' : 'Mostrar'}
                  </CInputGroupText>
                  <CTooltip content="Generar nueva contraseña" placement="top">
                    <CButton color="secondary" onClick={handleGeneratePassword}>
                      <CIcon icon={cilReload} />
                    </CButton>
                  </CTooltip>
                  <CPopover
                    content={passwordCopied ? 'Copiado!' : 'Copiar contraseña'}
                    placement="top"
                  >
                    <CButton color="secondary" onClick={copyPasswordToClipboard}>
                      <CIcon icon={cilCopy} />
                    </CButton>
                  </CPopover>
                </CInputGroup>
                {errors.password && <div className="text-danger">{errors.password}</div>}
              </CCol>
            </CRow>

            <CRow className="mb-3">
              <CCol md={12}>
                <CFormLabel>Roles</CFormLabel>
                <div className="d-flex gap-4">
                  {availableRoles.map((role) => (
                    <CFormCheck
                      key={role.value}
                      id={`role-${role.value}`}
                      name="roles"
                      value={role.value}
                      label={role.label}
                      checked={Array.isArray(formData.roles) && formData.roles.includes(role.value)}
                      onChange={handleCheckboxChange}
                    />
                  ))}
                </div>
                {errors.roles && <div className="text-danger">{errors.roles}</div>}
              </CCol>
            </CRow>
          </CForm>
        )}
      </CCardBody>
      <CCardFooter className="d-flex justify-content-between">
        <CButton color="secondary" onClick={handleCancel}>
          <CIcon icon={cilArrowLeft} className="me-2" />
          Cancelar
        </CButton>
        <CButton color="primary" onClick={handleSubmit} disabled={loading}>
          {loading ? <CSpinner size="sm" className="me-2" /> : null}
          {isEditMode ? 'Actualizar' : 'Crear'} Usuario
        </CButton>
      </CCardFooter>
    </CCard>
  )
}

export default UserAccountForm
