/* eslint-disable react/react-in-jsx-scope */
import { Navigate } from 'react-router-dom'
import { PropTypes } from 'prop-types'

const RequiredAuth = ({ children, isLoggedIn, redirectTo = '/login' }) => {
  return isLoggedIn ? children : <Navigate to={redirectTo} replace />
}

RequiredAuth.propTypes = {
  isLoggedIn: PropTypes.bool,
  redirectTo: PropTypes.string,
  children: PropTypes.oneOfType([PropTypes.arrayOf(PropTypes.node), PropTypes.node]).isRequired,
}

export default RequiredAuth
