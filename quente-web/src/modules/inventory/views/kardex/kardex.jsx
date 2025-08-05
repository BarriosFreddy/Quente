import React, { useEffect, useRef, useState } from 'react'
import {
  CTable,
  CTableBody,
  CTableRow,
  CTableDataCell,
  CTableHead,
  CTableHeaderCell,
  CFormInput,
  CContainer,
  CCardBody,
  CCard,
  CCardTitle,
  CCardHeader,
  CTableFoot,
  CButton,
  CFormSelect,
  CRow,
  CCol,
} from '@coreui/react'
import { Helmet } from 'react-helmet'
import { useDispatch, useSelector } from 'react-redux'
import { getItems } from '../../services/items.service'
import CONSTANTS from '../../../../constants'
import { useDidUpdateControl } from '../../../../hooks/useDidUpdateControl'
import { cilTrash } from '@coreui/icons'
import CIcon from '@coreui/icons-react'
import { sendWarningToast, sendSuccessToast } from '../../../../shared/services/notification.service'
import { saveAllKardexes } from '../../services/kardexes.service'
import { getDateObject } from '@/utils'
import CurrencyFormInput from '../../../../shared/components/CurrencyFormInput';

const initialKardex = {
  itemCode: '',
  itemId: '',
  itemName: '',
  itemDescription: '',
  itemCost: '',
  itemPrice: '',
  type: 'IN',
  units: '',
}

const { ENTER_KEYCODE, TAB_KEYCODE } = CONSTANTS

const Kardex = () => {
  const dispatch = useDispatch()
  const items = useSelector((state) => state.items.items)
  const fetching = useSelector((state) => state.items.fetching)
  const saving = useSelector((state) => state.kardexes.saving)
  const saveSuccess = useSelector((state) => state.kardexes.saveSuccess)
  const [kardexes, setKardexes] = useState([])
  const [currentIndex, setCurrentIndex] = useState([])
  const inputNewRef = useRef()

  useEffect(() => {
    setKardexes([initialKardex])
  }, [])

  useDidUpdateControl(() => {
    fillKardexFields()
  }, fetching)

  useDidUpdateControl(() => {
    if (saveSuccess) {
      sendSuccessToast(dispatch, {
        message: 'Guardado exitoso!',
      })
      setKardexes([{ ...initialKardex }])
      return
    } else
      sendWarningToast(dispatch, {
        message: 'No se pudieron guardar los datos!',
      })
  }, saving)

  // INIT

  const onChangeField = ({ target: { name, value } }, kardex, index) => {
    setCurrentIndex(index)
    const kardexUpdated = {
      ...kardex,
      [name]: value,
    }
    const kardexesClone = replaceKardex(kardexUpdated, index)
    setKardexes(kardexesClone)
  }

  const handleNew = () => {
    setKardexes([...kardexes, initialKardex])
    setImmediate(() => inputNewRef && inputNewRef.current.focus())
  }

  const handleDelete = (index) => {
    let kardexesClone = [...kardexes]
    if (index >= 0) kardexesClone.splice(index, 1)
    setKardexes(kardexesClone)
  }

  const onKeyUpCodeField = ({ keyCode }, kardex) => {
    if ([ENTER_KEYCODE, TAB_KEYCODE].includes(keyCode)) searchByCode(kardex.itemCode)
  }

  const searchByCode = (code) => {
    if (!!code) dispatch(getItems({ code, page: 1, size: 1 }, false))
  }

  const handleSave = () => {
    if (validForm()) {
      const kardexEntities = transformToKardexEntities(kardexes)
      dispatch(saveAllKardexes(kardexEntities))
    }
  }

  function validForm() {
    let isOk = true
    if (kardexes.some((kardex) => kardex.itemName.trim() === '')) {
      sendWarningToast(dispatch, {
        message: `Hay registros no validos!`,
      })
      isOk = false
    }
    if (kardexes.some((kardex) => kardex.units <= 0)) {
      sendWarningToast(dispatch, {
        message: `Por favor ingrese las unidades faltantes`,
      })
      isOk = false
    }
    return isOk
  }

  function transformToKardexEntities(kardexes) {
    if (!Array.isArray(kardexes)) return kardexes
    return kardexes.map(({ itemCode, itemId, itemCost, itemPrice, type, units }) => ({
      itemCode,
      itemId,
      ...(type === 'IN' && { itemCost }),
      ...(type === 'IN' && { itemPrice }),
      type,
      units,
      createdAt: getDateObject(),
    }))
  }

  function replaceKardex(newKardex, index) {
    let kardexesClone = [...kardexes]
    if (index >= 0) kardexesClone.splice(index, 1, newKardex)
    return kardexesClone
  }

  function fillKardexFields() {
    if (items.length > 0) {
      const { _id, code, name, description, cost, price } = items[0]
      if (kardexes.some((kardex) => kardex.itemId === _id)) {
        sendWarningToast(dispatch, {
          message: `El item "${name}" ya está agregado!`,
        })
        return
      }

      const kardexesClone = replaceKardex(
        {
          itemCode: code,
          itemId: _id,
          itemName: name,
          itemDescription: description,
          type: 'IN',
          units: '',
          itemCost: cost,
          itemPrice: price,
        },
        currentIndex,
      )
      setKardexes(kardexesClone)
      return
    }
    sendWarningToast(dispatch, {
      message: `Item no encontrado`,
    })
  }

  return (
    <>
      <CContainer className="mt--6" fluid>
        <Helmet>
          <title>ENTRADAS Y SALIDAS</title>
        </Helmet>
        <CCard className="mt-6 shadow border-10">
          <CCardHeader>
            <CCardTitle>ENTRADAS Y SALIDAS</CCardTitle>
          </CCardHeader>
          <CCardBody>
            <CTable small hover>
              <CTableHead>
                <CTableRow>
                  <CTableHeaderCell>Código</CTableHeaderCell>
                  <CTableHeaderCell>Nombre</CTableHeaderCell>
                  <CTableHeaderCell>Unidades</CTableHeaderCell>
                  <CTableHeaderCell>E/S</CTableHeaderCell>
                  <CTableHeaderCell>Costo</CTableHeaderCell>
                  <CTableHeaderCell>Precio</CTableHeaderCell>
                  <CTableHeaderCell>&nbsp;</CTableHeaderCell>
                </CTableRow>
              </CTableHead>
              <CTableBody>
                {kardexes.map((kardex, index) => (
                  <CTableRow key={index}>
                    <CTableDataCell width={200}>
                      <CFormInput
                        ref={inputNewRef}
                        type="number"
                        formNoValidate
                        required
                        name="itemCode"
                        value={kardex.itemCode}
                        onChange={(event) => onChangeField(event, kardex, index)}
                        onKeyUp={(event) => onKeyUpCodeField(event, kardex)}
                      />
                    </CTableDataCell>
                    <CTableDataCell className="text-uppercase">
                      <CRow>
                        <CCol className="text-uppercase">{kardex.itemName}</CCol>
                      </CRow>
                      <CRow>
                        <CCol className="text-uppercase" style={{ fontSize: 10 }}>
                          {kardex.itemDescription}
                        </CCol>
                      </CRow>
                    </CTableDataCell>
                    <CTableDataCell width={150}>
                      <CFormInput
                        type="number"
                        formNoValidate
                        required
                        name="units"
                        value={kardex.units}
                        onChange={(event) => onChangeField(event, kardex, index)}
                      />
                    </CTableDataCell>
                    <CTableDataCell width={150}>
                      <CFormSelect
                        name="type"
                        value={kardex.type}
                        required
                        feedbackInvalid="Campo obligatorio"
                        onChange={(event) => onChangeField(event, kardex, index)}
                        options={[{ label: 'ENTRADA', value: 'IN' }]}
                      />
                    </CTableDataCell>
                    <CTableDataCell width={150}>
                      <CurrencyFormInput
                        type="number"
                        formNoValidate
                        required
                        name="itemCost"
                        disabled={kardex.type === 'OUT'}
                        value={kardex.itemCost}
                        onChange={(event) => onChangeField(event, kardex, index)}
                      />
                    </CTableDataCell>
                    <CTableDataCell width={150}>
                      <CurrencyFormInput
                        type="number"
                        formNoValidate
                        required
                        name="itemPrice"
                        disabled={kardex.type === 'OUT'}
                        value={kardex.itemPrice}
                        onChange={(event) => onChangeField(event, kardex, index)}
                      />
                    </CTableDataCell>
                    <CTableDataCell width={100}>
                      {kardexes.length > 1 && (
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
                  <CTableHeaderCell colSpan={12} className="text-center">
                    <CButton color="success" onClick={handleSave}>
                      GUARDAR
                    </CButton>
                  </CTableHeaderCell>
                </CTableRow>
              </CTableFoot>
            </CTable>
          </CCardBody>
        </CCard>
      </CContainer>
    </>
  )
}

export default Kardex

Kardex.propTypes = {}
