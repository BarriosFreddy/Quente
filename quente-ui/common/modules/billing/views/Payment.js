import React, { useEffect, useRef, useState } from 'react'
import { PropTypes } from 'prop-types'

import { CRow, CCol, CContainer, CFormSelect, CButton } from '@coreui/react'
import { formatCurrency } from '@quente/common/utils'
import CONSTANTS from '../../../constants'
import CurrencyFormInput from '@quente/common/shared/components/CurrencyFormInput'

const { ENTER_KEYCODE, TAB_KEYCODE } = CONSTANTS

const PaymentComp = (props) => {
  const [receivedAmount, setReceivedAmount] = useState(0)
  const [receivedAmountInvalid, setReceivedAmountInvalid] = useState(false)
  const [changeAmount, setChangeAmount] = useState(0)
  const receivedAmountInput = useRef()

  useEffect(() => {
    focusAndSelectReceivedInput()
  }, [])

  const onChangeField = ({ target: { value } }) => {
    setReceivedAmount(value)
    props.setReceivedAmount(value)
    calculateAmountChange(value)
  }

  // eslint-disable-next-line no-unused-vars
  const handleReceivedAmount = (amount) => {
    setReceivedAmount(amount)
    props.setReceivedAmount(amount)
    calculateAmountChange(amount)
    focusAndSelectReceivedInput()
  }

  const onKeyDownCodeField = async ({ keyCode }) => {
    if ([ENTER_KEYCODE, TAB_KEYCODE].includes(keyCode)) {
      props.cargeButtonRef && props.cargeButtonRef.current.focus()
    }
  }

  const calculateAmountChange = (received) => {
    const receivedMoney = received ?? receivedAmount
    setReceivedAmountInvalid(receivedMoney < props.total)
    setChangeAmount(receivedMoney - props.total)
  }

  function focusAndSelectReceivedInput() {
    receivedAmountInput.current.focus()
    receivedAmountInput.current.select()
  }

  const handleBack = () => {
    props.onBack && props.onBack()
  }

  return (
    <>
      <CContainer fluid>
        <CRow>
          <CCol>
            <CButton variant="outline" color="info" onClick={() => handleBack()}>
              REGRESAR
            </CButton>
          </CCol>
        </CRow>
        <CRow className="mt-4">
          <CCol lg="4" className="fs-5">
            MEDIO DE PAGO
          </CCol>
          <CCol lg="8">
            <CFormSelect name="paymentMethod" size="lg" required options={['EFECTIVO', 'NEQUI']} />
          </CCol>
        </CRow>
        <CRow className="mt-4">
          <CCol lg="4" className="fs-5">
            EFECTIVO
          </CCol>
          <CCol lg="8">
            <CurrencyFormInput
              ref={receivedAmountInput}
              data-testid="receivedAmountId"
              type="number"
              size="lg"
              name="receivedAmount"
              feedbackInvalid="El monto recibido no debe ser menor al total"
              invalid={receivedAmountInvalid}
              value={receivedAmount}
              onChange={(event) => onChangeField(event)}
              onKeyDown={(event) => onKeyDownCodeField(event)}
            />
          </CCol>
        </CRow>
        <CRow className="mt-4">
          <CCol lg="4" className="fs-5">
            CAMBIO
          </CCol>
          <CCol lg="8" className="align-self-end">
            <span className="fs-3">{formatCurrency(changeAmount)}</span>
          </CCol>
        </CRow>
      </CContainer>
    </>
  )
}

export default PaymentComp

PaymentComp.propTypes = {
  total: PropTypes.number,
  setReceivedAmount: PropTypes.func,
  cargeButtonRef: PropTypes.object,
  onBack: PropTypes.func,
}
