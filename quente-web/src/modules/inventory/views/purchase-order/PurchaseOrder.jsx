import React, { useState } from 'react'
import {
  CContainer,
  CCardBody,
  CCard,
  CCardTitle,
  CCardHeader,
  CButton,
  CRow,
  CCol,
} from '@coreui/react'
import { Helmet } from 'react-helmet'
import { useDispatch, useSelector } from 'react-redux'

import { useDidUpdateControl } from '../../../../hooks/useDidUpdateControl'

import { sendWarningToast, sendSuccessToast } from '../../../../shared/services/notification.service'
import {
  savePurchaseOrder,
  getPurchaseOrders,
  updatePurchaseOrder,
} from '../../services/purchase-orders.service'
import PurchaseOrderList from './PurchaseOrderList'
import { PDFViewer } from '@react-pdf/renderer'
import { PurchaseOrderForm } from './PurchaseOrderForm'
import PurchaseOrderTemplate from '../pdf-document/PurchaseOrderTemplate'

export const { CREATING, EDITING, LISTING, EXPORTING } = {
  CREATING: 'creating',
  EDITING: 'editing',
  LISTING: 'listing',
  EXPORTING: 'exporting',
}

const PurchaseOrder = () => {
  const dispatch = useDispatch()
  const measurementUnits = useSelector((state) => state.invEnumerations.invEnumeration)
  const saving = useSelector((state) => state.purchaseOrders.saving)
  const purchaseOrders = useSelector((state) => state.purchaseOrders.purchaseOrders)
  const saveSuccess = useSelector((state) => state.purchaseOrders.saveSuccess)
  const [purchaseOrder, setPurchaseOrder] = useState(null)
  const [orderState, setOrderState] = useState(CREATING)

  useDidUpdateControl(() => {
    if (saveSuccess) {
      sendSuccessToast(dispatch, {
        message: 'Guardado exitoso!',
      })
      return
    } else
      sendWarningToast(dispatch, {
        message: 'No se pudieron guardar los datos!',
      })
  }, saving)

  // INIT

  const handleSave = (purchaseOrder) => {
    if (purchaseOrder._id) {
      dispatch(updatePurchaseOrder(purchaseOrder))
      return
    }
    dispatch(savePurchaseOrder(purchaseOrder))
  }

  const handleList = () => {
    dispatch(getPurchaseOrders())
    setOrderState(LISTING)
  }

  const handleShow = (purchaseOrder) => {
    setPurchaseOrder(purchaseOrder)
    setOrderState(EDITING)
  }

  const handleExport = () => {
    setOrderState(EXPORTING)
  }

  const handleBack = () => {
    switch (orderState) {
      case EDITING:
        setOrderState(LISTING)
        break
      case LISTING:
        setOrderState(CREATING)
        break
      case EXPORTING:
        setOrderState(EDITING)
        break
      default:
        break
    }
  }

  return (
    <>
      <CContainer className="mt--6" fluid>
        <Helmet>
          <title>ORDENES DE COMPRA</title>
        </Helmet>
        <CCard className="mt-6 shadow border-10">
          <CCardHeader>
            <CCardTitle>
              <CRow>
                <CCol lg="3">ORDENES DE COMPRA</CCol>
                <CCol lg={{ offset: 7, span: 2 }} className="text-end">
                  {orderState === CREATING && (
                    <CButton color="link" onClick={handleList}>
                      HISTORIAL
                    </CButton>
                  )}
                  {orderState !== CREATING && (
                    <CButton color="link" onClick={handleBack}>
                      REGRESAR
                    </CButton>
                  )}
                </CCol>
              </CRow>
            </CCardTitle>
          </CCardHeader>
          <CCardBody>
            {[EDITING, CREATING].includes(orderState) && (
              <PurchaseOrderForm
                measurementUnits={measurementUnits}
                saving={saving}
                saveSuccess={saveSuccess}
                orderState={orderState}
                purchaseOrder={purchaseOrder}
                onSave={handleSave}
                onExport={handleExport}
              />
            )}
            {orderState === LISTING && (
              <PurchaseOrderList
                purchaseOrders={purchaseOrders}
                onShow={handleShow}
              ></PurchaseOrderList>
            )}
            {orderState === EXPORTING && (
              <PDFViewer width="100%" height="550px">
                <PurchaseOrderTemplate purchaseOrder={purchaseOrder} />
              </PDFViewer>
            )}
          </CCardBody>
        </CCard>
      </CContainer>
    </>
  )
}

export default PurchaseOrder

PurchaseOrder.propTypes = {}
