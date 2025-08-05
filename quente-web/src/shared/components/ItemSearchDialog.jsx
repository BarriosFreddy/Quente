import React, { forwardRef, useImperativeHandle, useState } from 'react'
import {
  CButton,
  CCol,
  CFormInput,
  CModal,
  CModalBody,
  CModalFooter,
  CModalHeader,
  CModalTitle,
  CRow,
  CTable,
  CTableBody,
  CTableDataCell,
  CTableRow,
} from '@coreui/react'
import { PropTypes } from 'prop-types'
import { useDispatch, useSelector } from 'react-redux'
import { getItems } from '../../modules/inventory/services/items.service'
import { setItems } from '../../modules/inventory/reducers/items.reducer'

const ItemSearchDialog = forwardRef(function ItemSearchDialog({ onResponse, onSelect }, ref) {
  const dispatch = useDispatch()
  const [visible, setVisible] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const items = useSelector((state) => state.items.items)

  useImperativeHandle(
    ref,
    () => {
      return {
        show(toggle) {
          setVisible(toggle)
        },
      }
    },
    [],
  )

  const handleChange = ({ target: { value } }) => {
    setSearchTerm(value)
    if (!!value) {
      dispatch(getItems({ name: value, page: 1 }))
    }
  }

  const handleCancel = () => {
    clear()
    setVisible(false)
  }

  const handleClose = () => {
    setVisible(false)
    clear()
  }

  const selectItem = (item) => {
    onSelect && onSelect(item)
    handleClose()
  }

  function clear() {
    setSearchTerm('')
    dispatch(setItems([]))
  }

  return (
    <>
      <CModal visible={visible} onClose={handleClose}>
        <CModalHeader onClose={handleClose}>
          <CModalTitle>Busqueda por nombre</CModalTitle>
        </CModalHeader>
        <CModalBody>
          <CRow>
            <CCol>
              <CFormInput
                type="text"
                formNoValidate
                required
                placeholder="Buscar..."
                value={searchTerm}
                onChange={handleChange}
              />
            </CCol>
          </CRow>
          <CRow>
            <CCol>
              <CTable hover>
                <CTableBody>
                  {items.map((item) => (
                    <CTableRow
                      key={item.code}
                      onClick={() => selectItem(item)}
                      style={{ cursor: 'pointer' }}
                    >
                      <CTableDataCell xs="12">
                        <CRow>
                          <CCol className="text-uppercase">{item.name}</CCol>
                        </CRow>
                        <CRow>
                          <CCol style={{ fontSize: 10 }}>{item.code}</CCol>
                        </CRow>
                      </CTableDataCell>
                    </CTableRow>
                  ))}
                </CTableBody>
              </CTable>
            </CCol>
          </CRow>
        </CModalBody>
        <CModalFooter>
          <CButton variant="outline" color="secondary" onClick={handleCancel}>
            Cancelar
          </CButton>
        </CModalFooter>
      </CModal>
    </>
  )
})

ItemSearchDialog.propTypes = {
  show: PropTypes.bool,
  onResponse: PropTypes.func,
  onSelect: PropTypes.func,
}

export default ItemSearchDialog
