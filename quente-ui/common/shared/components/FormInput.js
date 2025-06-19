import React from 'react'
import { CFormInput } from '@coreui/react'
import { PropTypes } from 'prop-types'
import { safelySetSelectionRange, transformInputValue } from '../../utils/inputHelpers'

const FormInput = React.forwardRef((props, ref) => {
  
  const handleChange = (event) => {
    const { target } = event
    const { value, selectionStart, selectionEnd } = target
    
    if (props.uppercase || props.lowercase) {
      target.value = transformInputValue({
        value,
        uppercase: props.uppercase,
        lowercase: props.lowercase
      })
      
      safelySetSelectionRange(target, selectionStart, selectionEnd)
    }
    
    props.onChange && props.onChange(event)
  }
  return <CFormInput {...props} ref={ref} size={props.size || 'sm'} onChange={handleChange} />
})

FormInput.displayName = 'FormInput'

export default FormInput

FormInput.propTypes = {
  size: PropTypes.string,
  onChange: PropTypes.func,
  uppercase: PropTypes.oneOfType([PropTypes.bool, PropTypes.node]),
  lowercase: PropTypes.oneOfType([PropTypes.bool, PropTypes.node]),
}
