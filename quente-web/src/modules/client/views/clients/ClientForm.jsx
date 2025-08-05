/* eslint-disable no-unused-vars */
import React, { useState, useEffect, useRef } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import PropTypes from 'prop-types'
import {
  CButton,
  CRow,
  CContainer,
  CCol,
  CFormInput,
  CForm,
  CFormSelect,
  CCardBody,
  CCard,
  CCardFooter,
} from '@coreui/react'
import { existByDNI } from '../../services/clients.service'
import FormInput from '../../../../shared/components/FormInput'
import { setExistsByDNI } from '../../reducers/clients.reducer'
import ConfirmDialog from '../../../../shared/components/ConfirmDialog';

const clientInitialState = {
  name: '',
  dniType: '',
  dni: '',
  email: '',
  phoneNumber: '',
  address: '',
}
const DNI_TYPES = [
  { label: 'CÉDULA', value: 'CC' },
  { label: 'PASAPORTE', value: 'P' },
]
function ClientForm(props) {
  const dispatch = useDispatch()
  const dniRegistered = useSelector((state) => state.clients.existsByDNI)
  const saving = useSelector((state) => state.clients.saving)
  const [client, setClient] = useState(clientInitialState)
  const [failedValidations, setFailedValidations] = useState({
    name: false,
    dniType: false,
    dni: false,
  })
  const confirmDialogRef = useRef()

  useEffect(() => {
    if (props.client) {
      let clientToSet = null
      if (props.copying) {
        clientToSet = {
          ...props.client,
          dni: '',
        }
        delete clientToSet._id
      } else clientToSet = props.client
      setClient(clientToSet)
    }
  }, [dispatch, props.client, props.copying])

  // INIT
  const oldDNI = props.client?.dni
  const validateDNIExistence = (dni) => {
    if (oldDNI !== dni) dispatch(existByDNI(dni))
  }

  const isValidForm = () => {
    const { name, dniType, dni } = {
      ...client,
    }
    const failedValidationsObj = { ...failedValidations }
    failedValidationsObj.dni = !dni
    failedValidationsObj.dniType = !dniType
    failedValidationsObj.name = !name
    setFailedValidations(failedValidationsObj)
    return Object.values(failedValidationsObj).every((validation) => validation === false)
  }

  const handleSave = async () => {
    if (isValidForm()) {
      props.onSave({
        ...client,
      })
      setClient(clientInitialState)
    }
  }

  const handleCancel = () => {
    confirmDialogRef.current.show(true)
  }

  const handleResponseCancel = (sureCancel) => {
    if (sureCancel) {
      props.onCancel()
      setClient(clientInitialState)
      dispatch(setExistsByDNI(false))
      return
    }
    confirmDialogRef.current.show(false)
  }

  const handleChangeField = ({ target: { name, value } }) => {
    setClient({
      ...client,
      [name]: value,
    })
    setFailedValidations({ ...failedValidations, [name]: !value })
    if (name === 'dni') validateDNIExistence(value)
  }

  return (
    <>
      <CContainer fluid>
        <CCard>
          <div className="py-1 d-lg-none">
            <CRow className="m-1">
              <CCol xs="3" lg={{ offset: 4, span: 4 }}>
                <CButton
                  size="sm"
                  variant="outline"
                  color="secondary"
                  onClick={() => handleCancel()}
                >
                  CANCELAR
                </CButton>
              </CCol>
              <CCol xs={{ offset: 5, span: 4 }}>
                <CButton size="sm" color="success" type="button" onClick={() => handleSave()}>
                  {props.client ? 'EDITAR' : 'GUARDAR'}
                </CButton>
              </CCol>
            </CRow>
          </div>
          <CCardBody>
            <CForm className="row g-3 needs-validation" noValidate>
              <CRow>
                <CCol xs="12" lg="4">
                  <FormInput
                    className="text-uppercase"
                    label="Nombre"
                    type="text"
                    uppercase="true"
                    name="name"
                    value={client.name}
                    feedbackInvalid="Campo obligatorio"
                    invalid={failedValidations.name}
                    required
                    onChange={(event) => handleChangeField(event)}
                  />
                </CCol>
                <CCol xs="12" lg="4">
                  <CFormSelect
                    size="sm"
                    label="Tipo de identificación"
                    name="dniType"
                    value={client.dniType}
                    required
                    feedbackInvalid="Campo obligatorio"
                    invalid={failedValidations.dniType}
                    onChange={(event) => handleChangeField(event)}
                    aria-label="Default select example"
                    options={['Seleccione...', ...DNI_TYPES]}
                  />
                </CCol>
                <CCol xs="12" lg="4">
                  <FormInput
                    className="text-uppercase"
                    label="Identificación"
                    type="text"
                    uppercase="true"
                    name="dni"
                    value={client.dni}
                    feedback={dniRegistered ? 'Identificación ya registrada' : 'Campo obligatorio'}
                    invalid={dniRegistered || failedValidations.dni}
                    required
                    onChange={(event) => handleChangeField(event)}
                  />
                </CCol>
              </CRow>
              <CRow>
                <CCol xs="12" lg="4">
                  <CFormInput
                    size="sm"
                    label="Correo electrónico"
                    type="email"
                    uppercase="true"
                    name="email"
                    value={client.email}
                    onChange={(event) => handleChangeField(event)}
                  />
                </CCol>
                <CCol xs="12" lg="4">
                  <FormInput
                    label="Celular"
                    type="tel"
                    min={1}
                    name="phoneNumber"
                    value={client.phoneNumber}
                    onChange={(event) => handleChangeField(event)}
                  />
                </CCol>
                <CCol xs="12" lg="4">
                  <FormInput
                    label="Dirección"
                    type="text"
                    name="address"
                    value={client.address}
                    onChange={(event) => handleChangeField(event)}
                  />
                </CCol>
              </CRow>
            </CForm>
          </CCardBody>
          <div className="d-none d-lg-block">
            <CRow className="m-1">
              <CCol className="text-center" lg={{ offset: 3, span: 3 }}>
                <CButton
                  size="sm"
                  color="success"
                  type="button"
                  disabled={saving}
                  onClick={() => handleSave()}
                >
                  {props.client && props.client?.id ? 'EDITAR' : 'GUARDAR'}
                </CButton>
              </CCol>
              <CCol className="text-center" lg="3">
                <CButton
                  size="sm"
                  variant="outline"
                  color="secondary"
                  onClick={() => handleCancel()}
                >
                  CANCELAR
                </CButton>
              </CCol>
            </CRow>
          </div>
        </CCard>
      </CContainer>
      <ConfirmDialog
        ref={confirmDialogRef}
        onResponse={handleResponseCancel}
        message="¿Estás seguro que quieres cancelar?"
      ></ConfirmDialog>
    </>
  )
}

export default ClientForm

ClientForm.propTypes = {
  onCancel: PropTypes.func.isRequired,
  onSave: PropTypes.func.isRequired,
  client: PropTypes.object,
  copying: PropTypes.bool,
  isPopup: PropTypes.bool,
}
