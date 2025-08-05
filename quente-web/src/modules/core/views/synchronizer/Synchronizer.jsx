import React from 'react'
import { useDispatch, useSelector } from 'react-redux'
import {
  CButton,
  CCard,
  CCardBody,
  CCardHeader,
  CCardTitle,
  CCol,
  CContainer,
  CRow,
} from '@coreui/react'
import { Helmet } from 'react-helmet'
import { useDidUpdateControl } from '../../../../hooks/useDidUpdateControl'
import { saveBillingBulk } from '../../../billing/services/billings.service';
import { saveBillingLocally } from '../../../billing/reducers/billings.reducer'

function Billing() {
  const billingsOffiline = useSelector((state) => state.billing.offline.billings)
  const saving = useSelector((state) => state.billing.saving)
  const dispatch = useDispatch()
  console.log({ billingsOffiline })

  useDidUpdateControl(() => {
    dispatch(saveBillingLocally([]))
  }, saving)

  const handleSynchronize = () => {
    dispatch(saveBillingBulk(billingsOffiline))
  }

  return (
    <>
      <CContainer className="mt--6" fluid>
        <Helmet>
          <title>SINCRONIZADOR</title>
        </Helmet>
        <CCard>
          <CCardHeader>
            <CCardTitle>SINCRONIZADOR</CCardTitle>
          </CCardHeader>
          <CCardBody>
            <CRow>
              <CCol className="text-uppercase">Facturas sin sincronizar</CCol>
              <CCol>{billingsOffiline && billingsOffiline.length}</CCol>
              <CCol>
                <CButton role="button" onClick={handleSynchronize} disabled={saving}>
                  Sincronizar
                </CButton>
              </CCol>
            </CRow>
          </CCardBody>
        </CCard>
      </CContainer>
    </>
  )
}

export default Billing
