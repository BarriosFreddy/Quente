import { CFormInput } from '@coreui/react'
import React, { forwardRef, useEffect, useImperativeHandle, useRef, useState } from 'react'
import { PropTypes } from 'prop-types'
import { formatCurrency } from '@/utils/index'

const CurrencyFormInput = forwardRef(function CurrencyFormInput(props, ref) {
  const [innerValue, setInnerValue] = useState('')
  const inputRef = useRef()
  const { name, value } = props

  useEffect(() => {
    handleChange({ target: { name, value } })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value])

  useImperativeHandle(
    ref,
    () => {
      return {
        focus() {
          inputRef.current.focus()
        },
        select() {
          inputRef.current.select()
        },
      }
    },
    [],
  )

  const handleChange = (event) => {
    const {
      target: { name, value },
    } = event
    if (typeof value === 'string' && value.length === 0) {
      setInnerValue('')
      props.onChange && props.onChange({ ...event, target: { ...event.target, name, value: '' } })
      return
    }
    if (!value) return
    const valueClear = `${value}`.replace(/[\s$.]/gi, '')
    if (/^[\d]{0,}$/g.test(valueClear)) {
      setInnerValue(formatCurrency(valueClear))
      props.onChange &&
        props.onChange({ ...event, target: { ...event.target, name, value: +valueClear } })
    }
  }

  return (
    <CFormInput
      ref={inputRef}
      {...props}
      size={props.size || 'sm'}
      name={props.name}
      value={innerValue}
      type="text"
      onChange={handleChange}
    />
  )
})

export default CurrencyFormInput

CurrencyFormInput.propTypes = {
  size: PropTypes.string,
  onChange: PropTypes.func,
  name: PropTypes.string,
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
}
