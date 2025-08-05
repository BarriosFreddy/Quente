import React from 'react'
import { PropTypes } from 'prop-types'
import CIcon from '@coreui/icons-react'
import { cilCopy, cilPencil } from '@coreui/icons'
import {
  CCard,
  CRow,
  CButton,
  CCardBody,
  CCol,
  CTable,
  CTableBody,
  CTableRow,
  CTableDataCell,
  CTableHead,
  CTableHeaderCell,
  CTableFoot,
} from '@coreui/react'

const ClientList = ({ clients, fetching, page, onEdit, onCopy, onPrevPage, onNextPage }) => {
  const getDNIFormatted = (client) => `[${client.dniType}] ${client.dni}`

  return (
    <>
      <div className="d-lg-none">
        {clients.map((client) => (
          <CCard
            key={client.code}
            style={{
              width: 'auto',
              cursor: 'pointer',
            }}
            className="my-2"
            onClick={() => onEdit(client)}
          >
            <CCardBody>
              <CRow className="g-0">
                <CCol xs="7">{client.name}</CCol>
                <CCol xs="7">{getDNIFormatted(client)}</CCol>
              </CRow>
            </CCardBody>
          </CCard>
        ))}
      </div>
      <div className="d-none d-lg-block">
        <CTable small hover>
          <CTableHead>
            <CTableRow>
              <CTableHeaderCell scope="col">Nombre</CTableHeaderCell>
              <CTableHeaderCell scope="col">Identificación</CTableHeaderCell>
              <CTableHeaderCell scope="col">Acciones</CTableHeaderCell>
            </CTableRow>
          </CTableHead>
          <CTableBody>
            {clients.map((client) => (
              <CTableRow key={client.code}>
                <CTableDataCell className="text-uppercase text-break">{client.name}</CTableDataCell>
                <CTableDataCell>{getDNIFormatted(client)}</CTableDataCell>
                <CTableDataCell>
                  <CButton
                    size="sm"
                    variant="outline"
                    color="info"
                    disabled={fetching}
                    onClick={() => onEdit(client)}
                  >
                    <CIcon icon={cilPencil} size="sm" />
                    &nbsp; EDITAR
                  </CButton>
                  &nbsp;
                  <CButton
                    size="sm"
                    variant="outline"
                    color="secondary"
                    disabled={fetching}
                    onClick={() => onCopy(client)}
                  >
                    <CIcon icon={cilCopy} size="sm" />
                    &nbsp; COPIAR
                  </CButton>
                </CTableDataCell>
              </CTableRow>
            ))}
          </CTableBody>
          <CTableFoot>
            <CTableRow>
              <CTableDataCell colSpan={5} className="text-center">
                Página {page}
              </CTableDataCell>
            </CTableRow>
            <CTableRow className="mt-2">
              <CTableDataCell colSpan={5}>
                <CRow>
                  <CCol>
                    <div className="d-grid col-12 mx-auto">
                      <CButton
                        type="button"
                        variant="outline"
                        color="secondary"
                        disabled={fetching}
                        onClick={onPrevPage}
                      >
                        ANTERIOR
                      </CButton>
                    </div>
                  </CCol>
                  <CCol>
                    <div className="d-grid col-12 mx-auto">
                      <CButton
                        type="button"
                        variant="outline"
                        color="secondary"
                        disabled={fetching}
                        onClick={onNextPage}
                      >
                        SIGUIENTE
                      </CButton>
                    </div>
                  </CCol>
                </CRow>
              </CTableDataCell>
            </CTableRow>
          </CTableFoot>
        </CTable>
      </div>
    </>
  )
}

export default ClientList

ClientList.propTypes = {
  clients: PropTypes.array.isRequired,
  page: PropTypes.number.isRequired,
  fetching: PropTypes.bool.isRequired,
  onEdit: PropTypes.func.isRequired,
  onCopy: PropTypes.func.isRequired,
  onPrevPage: PropTypes.func.isRequired,
  onNextPage: PropTypes.func.isRequired,
}
