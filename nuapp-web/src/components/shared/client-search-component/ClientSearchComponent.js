import React, { forwardRef, useEffect, useImperativeHandle, useRef, useState } from 'react'
import CIcon from '@coreui/icons-react'
import { cilPlus } from '@coreui/icons'
import './clientSearchComponent.css'
import { useDispatch, useSelector } from 'react-redux'
import {
  CButton,
  CCol,
  CFormInput,
  CFormLabel,
  CInputGroup,
  CRow,
  CTable,
  CTableBody,
  CTableDataCell,
  CTableRow,
  CModal,
  CModalBody,
} from '@coreui/react'

import { getClientByDNI, getClients } from 'src/modules/clients/services/clients.service'
import Client from 'src/modules/clients/views/clients/Clients'

const DEFAULT_CLIENT_DNI = '1111111111'

const ClientSearchComponent = forwardRef(function ClientSearchComponent(props, ref) {
  const dispatch = useDispatch()
  const clients = useSelector((state) => state.clients.clients)
  const defaultClient = useSelector((state) => state.clients.client)
  let [clientSelected, setClientSelected] = useState(null)
  const searchInputRef = useRef()
  const [showList, setShowList] = useState(false)
  const [isSearching, setIsSearching] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  let [showClientModal, setShowClientModal] = useState(false)

  useEffect(() => {
    dispatch(getClientByDNI(DEFAULT_CLIENT_DNI))
  }, [dispatch])
  useEffect(() => {
    setClientSelected(defaultClient)
  }, [defaultClient])

  useImperativeHandle(
    ref,
    () => {
      return {
        getSelected() {
          return clientSelected
        },
      }
    },
    [clientSelected],
  )

  const handleChangeInput = ({ target: { value } }) => {
    setSearchTerm(value)
    dispatch(getClients({ dni: value }))
  }

  const handleClickInput = () => {
    setShowList(true)
  }

  const handleFocusInput = handleClickInput

  const handleClickRow = (client) => {
    setIsSearching(false)
    setShowList(false)
    setClientSelected(client)
  }

  const handleClickLabel = () => {
    setIsSearching(true)
    setImmediate(() => {
      searchInputRef.current?.focus()
    })
    dispatch(getClients({ dni: searchTerm }))
  }

  const handleFocusLabel = handleClickLabel

  const getClientNameFormatted = (client) => `${client?.name || ''} (${client?.dni || ''})`

  const handleNewClient = () => {
    setShowClientModal(true)
  }

  const handleCancelNewClient = () => {
    setShowClientModal(false)
  }

  const handleSaveNewClient = () => {
    setShowClientModal(false)
  }

  return (
    <>
      <CRow>
        <CFormLabel htmlFor="searchInput" className="col-sm-2 col-form-label">
          Cliente:
        </CFormLabel>
        <CCol>
          <CInputGroup>
            {isSearching && (
              <CFormInput
                id="searchInput"
                ref={searchInputRef}
                type="text"
                formNoValidate
                size="sm"
                value={searchTerm}
                placeholder="Buscar cliente..."
                onChange={(event) => handleChangeInput(event)}
                onClick={handleClickInput}
                onFocus={handleFocusInput}
              />
            )}
            {!isSearching && (
              <CFormInput
                type="text"
                formNoValidate
                size="sm"
                value={getClientNameFormatted(clientSelected)}
                readOnly
                onClick={handleClickLabel}
                onFocus={handleFocusLabel}
              />
            )}
          </CInputGroup>
          {showList && (
            <div
              className="client-list"
              style={{ maxHeight: 150, width: searchInputRef.current?.offsetWidth || 200 }}
            >
              <CTable
                hover
                small
                borderless
                style={{
                  marginBottom: 0,
                }}
              >
                <CTableBody>
                  {clients.map((client, index) => (
                    <CTableRow
                      key={index}
                      active={clientSelected && clientSelected.dni === client.dni}
                      onClick={() => handleClickRow(client)}
                    >
                      <CTableDataCell>{getClientNameFormatted(client)}</CTableDataCell>
                    </CTableRow>
                  ))}
                  {clients.length <= 0 && 'Loading...'}
                </CTableBody>
              </CTable>
            </div>
          )}
        </CCol>
        <CCol lg="2">
          <CButton size="sm" color="success" onClick={handleNewClient}>
            <CIcon icon={cilPlus} size="sm" />
            NUEVO
          </CButton>
        </CCol>
      </CRow>
      <CModal
        size="lg"
        backdrop="static"
        visible={showClientModal}
        onClose={() => setShowClientModal(false)}
      >
        <CModalBody>
          <Client isPopup onCancel={handleCancelNewClient} onSave={handleSaveNewClient} />
        </CModalBody>
      </CModal>
    </>
  )
})

export default ClientSearchComponent
