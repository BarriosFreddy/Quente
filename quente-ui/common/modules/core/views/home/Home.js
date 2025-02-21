import React from "react";

import {
  CButton,
  CCard,
  CCardBody,
  CCardHeader,
  CCol,
  CHeaderNav,
  CNavItem,
  CNavLink,
  CProgress,
  CRow,
} from "@coreui/react";
import CIcon from "@coreui/icons-react";
import {
  cibGoogle,
  cibFacebook,
  cibLinkedin,
  cibTwitter,
  cilUser,
  cilUserFemale,
  cilDollar,
  cilInbox,
} from "@coreui/icons";
import { NavLink } from "react-router-dom";
import { Helmet } from "react-helmet";
import BillTemplate from "../../../billing/views/print-templates/BillTemplate";

const progressGroupExample1 = [
  { title: "Monday", value1: 34, value2: 78 },
  { title: "Tuesday", value1: 56, value2: 94 },
  { title: "Wednesday", value1: 12, value2: 67 },
  { title: "Thursday", value1: 43, value2: 91 },
  { title: "Friday", value1: 22, value2: 73 },
  { title: "Saturday", value1: 53, value2: 82 },
  { title: "Sunday", value1: 9, value2: 69 },
];

const progressGroupExample2 = [
  { title: "Male", icon: cilUser, value: 53 },
  { title: "Female", icon: cilUserFemale, value: 43 },
];

const progressGroupExample3 = [
  { title: "Organic Search", icon: cibGoogle, percent: 56, value: "191,235" },
  { title: "Facebook", icon: cibFacebook, percent: 15, value: "51,223" },
  { title: "Twitter", icon: cibTwitter, percent: 11, value: "37,564" },
  { title: "LinkedIn", icon: cibLinkedin, percent: 8, value: "27,319" },
];

const Home = () => {
  return (
    <>
      <CCard className="mb-4">
        <Helmet>
          <title>HOME</title>
        </Helmet>
        <CCardBody>
          <CHeaderNav className="d-md-flex me-auto">
            <CNavItem className="me-2">
              <CNavLink to="/billing" component={NavLink}>
                <CButton variant="outline" color="info">
                  <CIcon icon={cilDollar} /> Facturación
                </CButton>
              </CNavLink>
            </CNavItem>
            <CNavItem>
              <CNavLink to="/inventory-items" component={NavLink}>
                <CButton variant="outline" color="info">
                  <CIcon icon={cilInbox} /> Inventario
                </CButton>
              </CNavLink>
            </CNavItem>
          </CHeaderNav>
        </CCardBody>
      </CCard>
      <CRow>
        <CCol xs>
          <CCard className="mb-4">
            <CCardHeader>Traffic {" & "} Sales</CCardHeader>
            <CCardBody>
              <CRow>
                <CCol xs={12} md={6} xl={6}>
                  <CRow>
                    <CCol sm={6}>
                      <div className="border-start border-start-4 border-start-info py-1 px-3">
                        <div className="text-medium-emphasis small">
                          New Clients
                        </div>
                        <div className="fs-5 fw-semibold">9,123</div>
                      </div>
                    </CCol>
                    <CCol sm={6}>
                      <div className="border-start border-start-4 border-start-danger py-1 px-3 mb-3">
                        <div className="text-medium-emphasis small">
                          Recurring Clients
                        </div>
                        <div className="fs-5 fw-semibold">22,643</div>
                      </div>
                    </CCol>
                  </CRow>

                  <hr className="mt-0" />
                  {progressGroupExample1.map((item, index) => (
                    <div className="progress-group mb-4" key={index}>
                      <div className="progress-group-prepend">
                        <span className="text-medium-emphasis small">
                          {item.title}
                        </span>
                      </div>
                      <div className="progress-group-bars">
                        <CProgress thin color="info" value={item.value1} />
                        <CProgress thin color="danger" value={item.value2} />
                      </div>
                    </div>
                  ))}
                </CCol>

                <CCol xs={12} md={6} xl={6}>
                  <CRow>
                    <CCol sm={6}>
                      <div className="border-start border-start-4 border-start-warning py-1 px-3 mb-3">
                        <div className="text-medium-emphasis small">
                          Pageviews
                        </div>
                        <div className="fs-5 fw-semibold">78,623</div>
                      </div>
                    </CCol>
                    <CCol sm={6}>
                      <div className="border-start border-start-4 border-start-success py-1 px-3 mb-3">
                        <div className="text-medium-emphasis small">
                          Organic
                        </div>
                        <div className="fs-5 fw-semibold">49,123</div>
                      </div>
                    </CCol>
                  </CRow>

                  <hr className="mt-0" />

                  {/*      {progressGroupExample2.map((item, index) => (
                    <div className="progress-group mb-4" key={index}>
                      <div className="progress-group-header">
                        <CIcon className="me-2" icon={item.icon} size="lg" />
                        <span>{item.title}</span>
                        <span className="ms-auto fw-semibold">{item.value}%</span>
                      </div>
                      <div className="progress-group-bars">
                        <CProgress thin color="warning" value={item.value} />
                      </div>
                    </div>
                  ))} */}

                  <div className="mb-5"></div>

                  {/*     {progressGroupExample3.map((item, index) => (
                    <div className="progress-group" key={index}>
                      <div className="progress-group-header">
                        <CIcon className="me-2" icon={item.icon} size="lg" />
                        <span>{item.title}</span>
                        <span className="ms-auto fw-semibold">
                          {item.value}{' '}
                          <span className="text-medium-emphasis small">({item.percent}%)</span>
                        </span>
                      </div>
                      <div className="progress-group-bars">
                        <CProgress thin color="success" value={item.percent} />
                      </div>
                    </div>
                  ))} */}
                </CCol>
              </CRow>
            </CCardBody>
          </CCard>
        </CCol>
      </CRow>
    </>
  );
};

export default Home;
