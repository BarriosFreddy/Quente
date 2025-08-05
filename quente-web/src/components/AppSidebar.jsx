import React, { useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import {
  CSidebar,
  CSidebarBrand,
  CSidebarNav,
  CSidebarToggler,
  CSidebarFooter,
  CBadge,
} from "@coreui/react";
import { AppSidebarNav } from "./AppSidebarNav";
import SimpleBar from "simplebar-react";
import "simplebar/dist/simplebar.min.css";

// sidebar nav config
import navigation from "../_nav";
import { setSidebarShow, setSidebarUnfoldable } from "@/app.slice";
import { logout } from "@/modules/core/services/auth.service";
import { cilLockLocked } from "@coreui/icons";
import CIcon from "@coreui/icons-react";
const { VITE_APP_RENDER_GIT_COMMIT = "" } = import.meta.env;

const AppSidebar = () => {
  const dispatch = useDispatch();
  const { organization } = useSelector((state) => state.auth.infoUser) ?? {};
  const unfoldable = useSelector((state) => state.app.sidebarUnfoldable);
  const sidebarShow = useSelector((state) => state.app.sidebarShow);

  const handleLogout = () => dispatch(logout());

  return (
    <>
      <CSidebar
        position="fixed"
        unfoldable={unfoldable}
        visible={sidebarShow}
        onVisibleChange={(visible) => {
          dispatch(setSidebarShow(visible));
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
        <CSidebarFooter onClick={handleLogout} style={{ cursor: "pointer" }}>
          <CIcon icon={cilLockLocked} className="me-2" />
          Cerrar Sesión
        </CSidebarFooter>
        <CSidebarFooter>
          Build
          <CBadge color="info" className="ms-2">
            {VITE_APP_RENDER_GIT_COMMIT.substring(0, 6)}
          </CBadge>
        </CSidebarFooter>
        <CSidebarToggler
          className="d-none d-lg-flex"
          onClick={() => dispatch(setSidebarUnfoldable(!unfoldable))}
        />
      </CSidebar>
    </>
  );
};

export default React.memo(AppSidebar);
