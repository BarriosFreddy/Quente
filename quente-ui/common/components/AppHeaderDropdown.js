import React, { useEffect } from 'react'
import {
  CBadge,
  CDropdown,
  CDropdownDivider,
  CDropdownHeader,
  CDropdownItem,
  CDropdownMenu,
  CDropdownToggle,
} from '@coreui/react'
import { cilAccountLogout, cilBell, cilEnvelopeOpen, cilSettings, cilUser } from '@coreui/icons'
import CIcon from '@coreui/icons-react'
import { useDispatch, useSelector } from 'react-redux'
import { logout } from '../modules/core/services/auth.service'

const { REACT_APP_RENDER_GIT_COMMIT = '' } = process.env
console.log({ REACT_APP_RENDER_GIT_COMMIT })

const AppHeaderDropdown = () => {
  const dispatch = useDispatch()

  const handleLogout = () => dispatch(logout())

  return (
    <CDropdown variant="nav-item">
      <CDropdownToggle placement="bottom-end" className="py-0" caret={false}>
        {/* <CAvatar size="md" /> */}
        <CIcon icon={cilUser} className="me-2" />
      </CDropdownToggle>
      <CDropdownMenu className="pt-0" placement="bottom-end">
        <CDropdownHeader className="bg-light fw-semibold py-2">Account</CDropdownHeader>
        <CDropdownItem href="#">
          <CIcon icon={cilUser} className="me-2" />
          Profile
        </CDropdownItem>
        <CDropdownItem href="#">
          <CIcon icon={cilEnvelopeOpen} className="me-2" />
          Messages
          <CBadge color="success" className="ms-2">
            42
          </CBadge>
        </CDropdownItem>
        <CDropdownHeader className="bg-light fw-semibold py-2">Settings</CDropdownHeader>

        <CDropdownItem href="#">
          <CIcon icon={cilSettings} className="me-2" />
          Settings
        </CDropdownItem>
        <CDropdownDivider />
        <CDropdownItem href="#">
          <CIcon icon={cilBell} className="me-2" />
          Build
          <CBadge color="info" className="ms-2">
            {REACT_APP_RENDER_GIT_COMMIT.substring(0, 6)}
          </CBadge>
        </CDropdownItem>
        <CDropdownItem onClick={handleLogout}>
          <CIcon icon={cilAccountLogout} className="me-2" />
          Cerrar sesión
        </CDropdownItem>
      </CDropdownMenu>
    </CDropdown>
  )
}

export default AppHeaderDropdown
