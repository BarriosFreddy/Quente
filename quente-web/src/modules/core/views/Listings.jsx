import React from 'react'

import { CContainer, CRow, CCol, CListGroup, CListGroupItem } from '@coreui/react'

function Listings() {
  return (
    <>
      <CContainer className="mt--6" fluid>
        <CRow>
          <CCol>
            <CListGroup>
              <CListGroupItem component="a" href="/categories">
                Documento de identidad
              </CListGroupItem>
            </CListGroup>
          </CCol>
        </CRow>
      </CContainer>
    </>
  )
}

export default Listings
