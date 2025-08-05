import {
  CButton,
  CTable,
  CTableBody,
  CTableDataCell,
  CTableHead,
  CTableHeaderCell,
  CTableRow,
} from '@coreui/react'
import React from 'react'
import { PropTypes } from 'prop-types'

const PurchaseOrderList = ({ purchaseOrders, onShow }) => {
  return (
    <CTable small hover>
      <CTableHead>
        <CTableRow>
          <CTableHeaderCell>Código</CTableHeaderCell>
          <CTableHeaderCell>Unidades</CTableHeaderCell>
          <CTableHeaderCell>&nbsp;</CTableHeaderCell>
        </CTableRow>
      </CTableHead>
      <CTableBody>
        {purchaseOrders.map((purchaseOrder, index) => (
          <CTableRow key={index}>
            <CTableDataCell width={200}>{purchaseOrder.code}</CTableDataCell>
            <CTableDataCell width={150}>{purchaseOrder.items?.length}</CTableDataCell>
            <CTableDataCell width={150}>
              <CButton color="info" onClick={() => onShow(purchaseOrder)}>
                VER
              </CButton>
            </CTableDataCell>
          </CTableRow>
        ))}
      </CTableBody>
      {/*       <CTableFoot>
        <CTableRow>
          <CTableHeaderCell colSpan={12} className="text-center">
            <CButton color="info">EXPORTAR PDF</CButton>
          </CTableHeaderCell>
        </CTableRow>
      </CTableFoot> */}
    </CTable>
  )
}
export default PurchaseOrderList

PurchaseOrderList.propTypes = {
  purchaseOrders: PropTypes.array,
  onShow: PropTypes.func,
}
