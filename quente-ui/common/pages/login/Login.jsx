import React, { useEffect } from "react";
import { useForm } from "react-hook-form";
import { useLocation } from "react-router-dom";
import {
  CAlert,
  CButton,
  CCard,
  CCardBody,
  CCardGroup,
  CCol,
  CContainer,
  CForm,
  CFormInput,
  CImage,
  CInputGroup,
  CInputGroupText,
  CRow,
} from "@coreui/react";
import CIcon from "@coreui/icons-react";
import { cilLockLocked, cilUser } from "@coreui/icons";
import { useDispatch, useSelector } from "react-redux";
import { login } from "@quente/common/modules/core/services/auth.service";
import { setLoading } from "@quente/common/modules/core/reducers/auth.reducer";
import { useNavigate } from "react-router-dom";
import Logo from "@quente/common/assets/images/logo.png";
const { REACT_APP_EMAIL_DEMO = "", REACT_APP_PASSWORD_DEMO = "" } = process.env;
const MODE_PROPERTY = "mode";
const DEMO_VALUE = "demo";

const Login = () => {
  const dispatch = useDispatch();
  const { search } = useLocation();

  const params = new URLSearchParams(search);
  const isDemo = params.get(MODE_PROPERTY) === DEMO_VALUE;
  console.log({ isDemo });

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
  } = useForm();
  const isLoggedIn = useSelector((state) => state.auth.isLoggedIn);
  const loginSuccess = useSelector((state) => state.auth.loginSuccess);
  const loading = useSelector((state) => state.auth.loading);
  const navigate = useNavigate();

  useEffect(() => {
    if (isLoggedIn) {
      navigate("/billing");
    }
  }, [isLoggedIn]);

  useEffect(() => () => dispatch(setLoading(false)), [dispatch]);

  const handleLogin = () => {
    handleSubmit((userAccountLogin) => {
      const password = btoa(userAccountLogin.password);
      dispatch(login({ ...userAccountLogin, password }));
    })();
  };

  const handleDemoLogin = () => {
    setValue("email", REACT_APP_EMAIL_DEMO);
    setValue("password", REACT_APP_PASSWORD_DEMO);
    handleLogin();
  };

  const onKeyDownLogin = ({ keyCode }) => keyCode === 13 && handleLogin();

  return (
    <div className="bg-light min-vh-100 d-flex flex-row align-items-center">
      <CContainer>
        <CRow className="justify-content-center">
          <CCol md={6}>
            <CImage
              className="mb-5"
              align="center"
              rounded
              src={Logo}
              width={150}
            />
            <CCardGroup>
              <CCard className="p-4">
                <CCardBody>
                  <CForm>
                    <h1>Iniciar sessión</h1>
                    <p className="text-medium-emphasis">
                      Ingresa tus credenciales para poder acceder
                    </p>
                    <CInputGroup className="mb-3">
                      <CInputGroupText>
                        <CIcon icon={cilUser} />
                      </CInputGroupText>
                      <CFormInput
                        type="text"
                        placeholder="Correo electrónico"
                        autoComplete="email"
                        invalid={!!errors.email}
                        {...register("email", { required: true })}
                      />
                    </CInputGroup>
                    <CInputGroup className="mb-4">
                      <CInputGroupText>
                        <CIcon icon={cilLockLocked} />
                      </CInputGroupText>
                      <CFormInput
                        type="password"
                        placeholder="Clave"
                        onKeyDown={onKeyDownLogin}
                        invalid={!!errors.password}
                        {...register("password", { required: true })}
                      />
                    </CInputGroup>
                    {!loginSuccess && (
                      <CAlert color="danger">
                        Correo electrónico y/o clave incorrecta
                      </CAlert>
                    )}
                    <CRow>
                      <CCol xs={12} className="text-right">
                        <CButton color="link" className="px-0">
                          ¿Olvidaste tu clave?
                        </CButton>
                      </CCol>
                    </CRow>
                    <br />
                    <CRow>
                      <CCol xs={12}>
                        <div className="d-grid">
                          <CButton
                            size="lg"
                            onClick={isDemo ? handleDemoLogin : handleLogin}
                            color="primary"
                            className="px-4 fw-bold"
                            disabled={loading}
                          >
                            {isDemo ? "ACCEDE AL DEMO" : "ACCEDER"}
                          </CButton>
                        </div>
                      </CCol>
                    </CRow>
                  </CForm>
                </CCardBody>
              </CCard>
            </CCardGroup>
          </CCol>
        </CRow>
      </CContainer>
    </div>
  );
};

export default Login;
