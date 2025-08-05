import React, { useState, useEffect, useRef } from 'react'
import { Helmet } from 'react-helmet'
import CIcon from '@coreui/icons-react'
import { useDispatch, useSelector } from 'react-redux'
import { cilPlus, cilSearch, cilTrash } from '@coreui/icons'
import {
  CCard,
  CCardHeader,
  CContainer,
  CRow,
  CButton,
  CCardBody,
  CCol,
  CInputGroup,
  CFormInput,
  CFormSelect,
  CFormLabel,
} from '@coreui/react'
import { getClients, saveClient, updateClient } from '../../services/clients.service'
import CONSTANTS from '../../../../constants'
import { sendToast } from '../../../../shared/services/notification.service'
import { useDidUpdateControl } from '../../../../hooks/useDidUpdateControl'
import ClientForm from './ClientForm'
import ClientList from './ClientList'
import { PropTypes } from 'prop-types'

const { ENTER_KEYCODE, TAB_KEYCODE } = CONSTANTS

const queryParamsInitial = {
  page: 1,
}

function Client(props) {
  const dispatch = useDispatch()
  const clients = useSelector((state) => state.clients.clients)
  const saveSuccess = useSelector((state) => state.clients.saveSuccess)
  const saving = useSelector((state) => state.clients.saving)
  const fetching = useSelector((state) => state.clients.fetching)
  const [searchTerm, setSearchTerm] = useState('')
  let [editing, setEditing] = useState(!!props.isPopup)
  let [copying, setCopying] = useState(false)
  let [client, setClient] = useState(null)
  const [showFilterSection, setShowFilterSection] = useState(false)
  const [queryParams, setQueryParams] = useState(queryParamsInitial)
  const searchInputRef = useRef()

  useEffect(() => {
    setSearchTerm('')
    dispatch(getClients({ page: 1 }))
  }, [dispatch])

  useDidUpdateControl(
    () => {
      if (saveSuccess) {
        sendToast(dispatch, { message: 'Guardado exitosamente!' })
        if (props.isPopup && props.onSave) props.onSave()
        !props.isPopup && setEditing(false)
        setClient(null)
        handleSearch({ page: queryParams.page })
      } else {
        sendToast(dispatch, { message: 'No se pudo guardar los datos', color: 'danger' })
      }
    },
    saving,
    [saveSuccess],
  )

  const handleSave = (client) => {
    if (client._id) dispatch(updateClient(client))
    else dispatch(saveClient(client))
  }

  const handleCancel = async () => {
    if (props.isPopup && props.onCancel) props.onCancel()
    setEditing(false)
  }

  const handlePrevPage = async () => {
    const newParams = { ...queryParams, page: queryParams.page === 1 ? 1 : queryParams.page - 1 }
    search(newParams)
  }

  const handleNextPage = async () => {
    const newParams = { ...queryParams, page: queryParams.page + 1 }
    search(newParams)
  }

  const onChangeField = ({ target: { value } }) => setSearchTerm(value)

  const onKeyDownCodeField = async ({ keyCode }) => {
    if ([ENTER_KEYCODE, TAB_KEYCODE].includes(keyCode)) handleSearch({ page: 1 })
  }

  const search = async (params = {}) => {
    setQueryParams(params)
    dispatch(getClients(params))
  }

  const handleSearch = (params = {}) => {
    const newParams = { ...params }
    if (!!searchTerm) {
      newParams.code = searchTerm.trim()
      newParams.name = searchTerm.trim()
    }
    search(newParams)
  }

  const handleEdit = (client) => {
    setEditing(true)
    setCopying(false)
    setClient(client)
  }

  const handleCopy = (client) => {
    setCopying(true)
    setEditing(true)
    setClient(client)
  }

  const handleNewClient = () => {
    setClient(null)
    setEditing(true)
    setCopying(false)
  }

  const handleClear = () => {
    setSearchTerm('')
    const params = { page: 1 }
    search(params)
    searchInputRef.current.focus()
  }

  const handleFilter = () => {
    setShowFilterSection(!showFilterSection)
  }

  const handleChangeFilters = ({ target: { name, value } }) => {
    const params = { ...queryParams, page: 1, [name]: value }
    search(params)
  }

  return (
    <>
      <CContainer>
        <Helmet>
          <title>CLIENTES</title>
        </Helmet>
        <CCard className="shadow border-10">
          <div className="d-none d-lg-block">
            <CCardHeader>
              {!editing && (
                <>
                  <CRow>
                    <CCol xs="2" lg="3">
                      CLIENTES &nbsp;
                      <CButton variant="outline" color="success" onClick={handleNewClient}>
                        <div className="d-none d-lg-block">NUEVO</div>
                        <div className="d-lg-none">
                          <CIcon icon={cilPlus} size="sm" />
                        </div>
                      </CButton>
                    </CCol>
                    <CCol xs="8" lg="5">
                      <CInputGroup>
                        <CFormInput
                          ref={searchInputRef}
                          type="text"
                          name="searchTerm"
                          placeholder="..."
                          value={searchTerm}
                          onChange={(event) => onChangeField(event)}
                          onKeyDown={(event) => onKeyDownCodeField(event)}
                        />
                        <CButton
                          type="button"
                          variant="outline"
                          color="primary"
                          onClick={() => handleSearch({ page: 1 })}
                        >
                          <div className="d-none d-lg-block">BUSCAR</div>
                          <div className="d-lg-none">
                            <CIcon icon={cilSearch} size="sm" />
                          </div>
                        </CButton>
                        <CButton
                          variant="outline"
                          type="button"
                          color="secondary"
                          onClick={handleClear}
                        >
                          <div className="d-none d-lg-block">BORRAR</div>
                          <div className="d-lg-none">
                            <CIcon icon={cilTrash} size="sm" />
                          </div>
                        </CButton>
                      </CInputGroup>
                    </CCol>
                    <CCol xs="2" lg="1">
                      <CButton color="link" onClick={handleFilter}>
                        Filtrar
                      </CButton>
                    </CCol>
                    {showFilterSection && (
                      <>
                        <CCol xs="2" lg="1" className="text-end">
                          <CFormLabel htmlFor="stock" className="col-form-label">
                            Stock
                          </CFormLabel>
                        </CCol>
                        <CCol xs="4" lg="2">
                          <CFormSelect
                            id="stock"
                            className="my-1"
                            value={queryParams.stock}
                            name="stock"
                            size="sm"
                            options={[
                              { label: 'TODOS', value: '' },
                              { label: 'DISPONIBLE', value: 'IS' },
                              { label: 'RECOMPRA', value: 'RP' },
                              { label: 'NO DISPONIBLE', value: 'WS' },
                            ]}
                            onChange={handleChangeFilters}
                          />
                        </CCol>
                      </>
                    )}
                  </CRow>
                </>
              )}
              {editing && (
                <div className="d-none d-lg-block">
                  {client ? (copying ? 'COPIANDO' : 'EDITANDO') : 'CREANDO'} CLIENTE
                </div>
              )}
            </CCardHeader>
          </div>
          <CCardBody>
            {!editing && (
              <ClientList
                clients={clients}
                page={queryParams.page}
                fetching={fetching}
                onEdit={handleEdit}
                onCopy={handleCopy}
                onPrevPage={handlePrevPage}
                onNextPage={handleNextPage}
              />
            )}
            {editing && (
              <ClientForm
                isPopup
                copying={copying}
                client={client}
                onSave={handleSave}
                onCancel={handleCancel}
              />
            )}
          </CCardBody>
        </CCard>
      </CContainer>
    </>
  )
}

Client.propTypes = {
  isPopup: PropTypes.bool,
  onCancel: PropTypes.func,
  onSave: PropTypes.func,
}

export default Client
