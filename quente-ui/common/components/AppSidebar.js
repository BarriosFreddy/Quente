import React, { useEffect } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import {
  CSidebar,
  CSidebarBrand,
  CSidebarNav,
  CSidebarToggler,
  CSidebarFooter,
} from '@coreui/react'
import { AppSidebarNav } from './AppSidebarNav'
import SimpleBar from 'simplebar-react'
import 'simplebar/dist/simplebar.min.css'

// sidebar nav config
import navigation from '../_nav'
import { setSidebarShow, setSidebarUnfoldable } from 'src/app.slice'
import { logout } from '@quente/common/modules/core/services/auth.service'
import { cilLockLocked } from '@coreui/icons'
import CIcon from '@coreui/icons-react'

const AppSidebar = () => {
  const dispatch = useDispatch()
  const { organization } = useSelector((state) => state.auth.infoUser) ?? {}
  const unfoldable = useSelector((state) => state.app.sidebarUnfoldable)
  const sidebarShow = useSelector((state) => state.app.sidebarShow)

  const handleLogout = () => dispatch(logout())

  return (
    <>
      <CSidebar
        position="fixed"
        unfoldable={unfoldable}
        visible={sidebarShow}
        onVisibleChange={(visible) => {
          dispatch(setSidebarShow(visible))
        }}
      >
        <CSidebarBrand className="d-none d-md-flex" to="/">
          {!unfoldable && <h4>{organization?.name}</h4>}
        </CSidebarBrand>
        <CSidebarNav>
          <SimpleBar>
            <AppSidebarNav items={navigation} />
          </SimpleBar>
        </CSidebarNav>
        <CSidebarFooter onClick={handleLogout} style={{ cursor: 'pointer' }}>
          <CIcon icon={cilLockLocked} className="me-2" />
          Logout
        </CSidebarFooter>
        <CSidebarToggler
          className="d-none d-lg-flex"
          onClick={() => dispatch(setSidebarUnfoldable(!unfoldable))}
        />
      </CSidebar>
    </>
  )
}

export default React.memo(AppSidebar)
