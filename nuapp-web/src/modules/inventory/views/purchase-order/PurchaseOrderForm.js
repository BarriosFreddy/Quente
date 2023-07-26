import CIcon from '@coreui/icons-react'
import {
  CButton,
  CCol,
  CFormInput,
  CFormSelect,
  CRow,
  CTable,
  CTableBody,
  CTableDataCell,
  CTableFoot,
  CTableHead,
  CTableHeaderCell,
  CTableRow,
} from '@coreui/react'
import React, { useEffect, useRef, useState } from 'react'
import CONSTANTS from 'src/constants'
import { formatCurrency, getDateObject } from 'src/utils'
import { cilTrash } from '@coreui/icons'
import { PropTypes } from 'prop-types'
import { useDispatch, useSelector } from 'react-redux'
import { getItems } from '../../services/items.service'
import { useDidUpdateControl } from 'src/hooks/useDidUpdateControl'
import { sendWarningToast } from 'src/modules/shared/services/notification.service'
import { EDITING } from './PurchaseOrder'
const { ENTER_KEYCODE, TAB_KEYCODE } = CONSTANTS

const initialPurchaseOrderItems = {
  itemCode: '',
  itemId: '',
  itemName: '',
  itemDescription: '',
  itemCost: '',
  itemStock: '',
  itemMeasurementUnit: '',
  units: '',
}

export const PurchaseOrderForm = ({
  onSave,
  saving,
  saveSuccess,
  orderState,
  purchaseOrder,
  onExport,
}) => {
  const [currentIndex, setCurrentIndex] = useState([])
  const items = useSelector((state) => state.items.items)
  const fetching = useSelector((state) => state.items.fetching)
  const dispatch = useDispatch()
  const [purchaseOrderItems, setPurchaseOrderItems] = useState([])
  const inputNewRef = useRef()
  const code = '0000000001'

  useDidUpdateControl(() => {
    fillFields()
  }, fetching)

  useDidUpdateControl(() => {
    if (saveSuccess) {
    }
  }, saving)

  useEffect(() => {
    setPurchaseOrderItems([initialPurchaseOrderItems])
  }, [])

  useEffect(() => {
    if (purchaseOrder) setPurchaseOrderItems(transformEntitiesToItems(purchaseOrder.items))
  }, [purchaseOrder])

  // INIT

  const searchByCode = (code) => {
    if (!!code) dispatch(getItems({ code, page: 1, size: 1 }, false))
  }

  const onChangeField = ({ target: { name, value } }, purchaseOrder, index) => {
    setCurrentIndex(index)
    const purchaseOrderUpdated = {
      ...purchaseOrder,
      [name]: value,
    }
    const purchaseOrderesClone = replaceItem(purchaseOrderUpdated, index)
    setPurchaseOrderItems(purchaseOrderesClone)
  }

  const handleNew = () => {
    setPurchaseOrderItems([...purchaseOrderItems, initialPurchaseOrderItems])
    setImmediate(() => inputNewRef && inputNewRef.current.focus())
  }

  const handleDelete = (index) => {
    let purchaseOrderesClone = [...purchaseOrderItems]
    if (index >= 0) purchaseOrderesClone.splice(index, 1)
    setPurchaseOrderItems(purchaseOrderesClone)
  }

  const onKeyUpCodeField = ({ keyCode }, purchaseOrder) => {
    if ([ENTER_KEYCODE, TAB_KEYCODE].includes(keyCode)) searchByCode(purchaseOrder.itemCode)
  }

  const handleSave = () => {
    if (onSave && validForm()) {
      onSave({
        code,
        comments: '',
        items: transformItems(purchaseOrderItems),
        supplierId: '649b892cdfc56ae3c8d56d59',
        createdAt: getDateObject(),
      })
    }
  }

  function validForm() {
    let isOk = true
    if (purchaseOrderItems.some((purchaseOrderItem) => purchaseOrderItem.itemName.trim() === '')) {
      sendWarningToast(dispatch, {
        message: `Hay registros no validos!`,
      })
      isOk = false
    }
    if (purchaseOrderItems.some((purchaseOrderItem) => purchaseOrderItem.units <= 0)) {
      sendWarningToast(dispatch, {
        message: `Por favor ingrese las unidades faltantes`,
      })
      isOk = false
    }
    return isOk
  }

  function replaceItem(newKardex, index) {
    let purchaseOrderItemsClone = [...purchaseOrderItems]
    if (index >= 0) purchaseOrderItemsClone.splice(index, 1, newKardex)
    return purchaseOrderItemsClone
  }

  function fillFields() {
    if (items && items.length > 0) {
      const { _id, code, name, description, cost, stock } = items[0]
      if (purchaseOrderItems.some((purchaseOrderItem) => purchaseOrderItem.itemId === _id)) {
        sendWarningToast(dispatch, {
          message: `El item "${name}" ya está agregado!`,
        })
        return
      }

      const purchaseOrderItemsClone = replaceItem(
        {
          itemCode: code,
          itemId: _id,
          itemName: name,
          itemDescription: description,
          units: '',
          itemCost: cost,
          itemStock: stock,
        },
        currentIndex,
      )
      setPurchaseOrderItems(purchaseOrderItemsClone)
      return
    }
    sendWarningToast(dispatch, {
      message: `Item no encontrado`,
    })
  }

  function transformItems(purchaseOrders) {
    if (!Array.isArray(purchaseOrders)) return purchaseOrders
    return purchaseOrders.map(
      ({ itemName, itemCode, itemId, itemCost, itemStock, itemMeasurementUnit, units }) => ({
        code: itemCode,
        name: itemName,
        _id: itemId,
        cost: itemCost,
        stock: itemStock,
        units,
        measurementUnit: itemMeasurementUnit,
      }),
    )
  }

  function transformEntitiesToItems(items) {
    if (!Array.isArray(items)) return items
    return items.map(({ code, name, _id, cost, stock, measurementUnit, units }) => ({
      itemCode: code,
      itemId: _id,
      itemName: name,
      itemCost: cost,
      itemStock: stock,
      itemMeasurementUnit: measurementUnit,
      units: units,
    }))
  }

  return (
    <>
      <CRow className="mb-3">
        <CCol lg="2" className="fw-semibold">
          Código serial
        </CCol>
        <CCol lg="2">{code}</CCol>
        <CCol lg="2" className="fw-semibold">
          Proveedor
        </CCol>
        <CCol lg="2">Distrireal de la costa</CCol>
      </CRow>
      <CTable>
        <CTableHead>
          <CTableRow>
            <CTableHeaderCell>Código</CTableHeaderCell>
            <CTableHeaderCell>Nombre</CTableHeaderCell>
            <CTableHeaderCell>Stock</CTableHeaderCell>
            <CTableHeaderCell>Costo</CTableHeaderCell>
            <CTableHeaderCell>Unidades</CTableHeaderCell>
            <CTableHeaderCell>U. de medida</CTableHeaderCell>
            <CTableHeaderCell>&nbsp;</CTableHeaderCell>
          </CTableRow>
        </CTableHead>
        <CTableBody>
          {purchaseOrderItems.map((purchaseOrder, index) => (
            <CTableRow key={index}>
              <CTableDataCell width={200}>
                <CFormInput
                  ref={inputNewRef}
                  type="number"
                  formNoValidate
                  required
                  name="itemCode"
                  value={purchaseOrder.itemCode}
                  onChange={(event) => onChangeField(event, purchaseOrder, index)}
                  onKeyUp={(event) => onKeyUpCodeField(event, purchaseOrder)}
                />
              </CTableDataCell>
              <CTableDataCell className="text-uppercase">{purchaseOrder.itemName}</CTableDataCell>
              <CTableDataCell width={150}>{purchaseOrder.itemStock}</CTableDataCell>
              <CTableDataCell width={150}>{formatCurrency(purchaseOrder.itemCost)}</CTableDataCell>
              <CTableDataCell width={150}>
                <CFormInput
                  type="number"
                  formNoValidate
                  required
                  name="units"
                  value={purchaseOrder.units}
                  onChange={(event) => onChangeField(event, purchaseOrder, index)}
                />
              </CTableDataCell>
              <CTableDataCell width={150}>
                <CFormSelect
                  name="itemMeasurementUnit"
                  value={purchaseOrder.itemMeasurementUnit}
                  required
                  feedbackInvalid="Campo obligatorio"
                  onChange={(event) => onChangeField(event, purchaseOrder, index)}
                  options={[
                    { label: 'CAJA', value: 'CAJA' },
                    { label: 'TIRA', value: 'TIRA' },
                    { label: 'FRASCO', value: 'FRASCO' },
                    { label: 'AMPOLLA', value: 'AMPOLLA' },
                    { label: 'TABLETA', value: 'TABLETA' },
                    { label: 'BOLSA', value: 'BOLSA' },
                  ]}
                />
              </CTableDataCell>
              <CTableDataCell width={100}>
                {purchaseOrderItems.length > 1 && (
                  <CButton color="ligth" onClick={() => handleDelete(index)}>
                    <CIcon icon={cilTrash} size="sm" />
                  </CButton>
                )}
              </CTableDataCell>
            </CTableRow>
          ))}
          <CTableRow>
            <CTableHeaderCell colSpan={12}>
              <CButton variant="outline" color="info" onClick={handleNew}>
                NUEVO REGISTRO
              </CButton>
            </CTableHeaderCell>
          </CTableRow>
        </CTableBody>
        <CTableFoot>
          <CTableRow>
            <CTableHeaderCell colSpan={orderState === EDITING ? 5 : 7} className="text-center">
              <CButton color="success" onClick={handleSave}>
                {purchaseOrder ? 'EDITAR' : 'GUARDAR'}
              </CButton>
            </CTableHeaderCell>
            {orderState === EDITING && (
              <CTableHeaderCell colSpan={2} className="text-center">
                <CButton variant="outline" color="danger" onClick={onExport}>
                  EXPORTAR A PDF
                </CButton>
              </CTableHeaderCell>
            )}
          </CTableRow>
        </CTableFoot>
      </CTable>
    </>
  )
}

export default PurchaseOrderForm

PurchaseOrderForm.propTypes = {
  purchaseOrder: PropTypes.object,
  saving: PropTypes.bool,
  saveSuccess: PropTypes.bool,
  onSave: PropTypes.func,
  onExport: PropTypes.func,
  orderState: PropTypes.string,
}
