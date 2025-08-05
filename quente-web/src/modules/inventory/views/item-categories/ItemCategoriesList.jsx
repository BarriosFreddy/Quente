import React from "react";
import { PropTypes } from "prop-types";
import {
  CCard,
  CRow,
  CButton,
  CCardBody,
  CCol,
  CTable,
  CTableHead,
  CTableRow,
  CTableHeaderCell,
  CTableBody,
  CTableDataCell,
  CTableFoot,
} from "@coreui/react";

function ItemCategoriesList({
  itemCategories,
  fetching,
  page,
  onEdit,
  onPrevPage,
  onNextPage,
}) {
  return (
    <>
      <div className="d-lg-none">
        {itemCategories &&
          itemCategories.map((itemCategory, index) => (
            <CCard
              key={itemCategory.code}
              style={{
                width: "auto",
                cursor: "pointer",
              }}
              className="my-2"
              onClick={() => onEdit(itemCategory)}
            >
              <CRow className="g-0">
                <CCol xs={12}>
                  <CCardBody>
                    <CRow>
                      <CCol>{itemCategory.code}</CCol>
                      <CCol>{itemCategory.name}</CCol>
                    </CRow>
                  </CCardBody>
                </CCol>
              </CRow>
            </CCard>
          ))}
        <CRow className="py-1 text-center">
          <CCol>Página {page}</CCol>
        </CRow>
        <CRow>
          <CCol>
            <div className="d-grid col-12 mx-auto">
              <CButton
                type="button"
                variant="outline"
                color="secondary"
                disabled={fetching}
                onClick={onPrevPage}
              >
                ANTERIOR
              </CButton>
            </div>
          </CCol>
          <CCol>
            <div className="d-grid col-12 mx-auto">
              <CButton
                type="button"
                variant="outline"
                color="secondary"
                disabled={fetching}
                onClick={onNextPage}
              >
                SIGUIENTE
              </CButton>
            </div>
          </CCol>
        </CRow>
      </div>
      <div className="d-none d-lg-block">
        <CTable small hover>
          <CTableHead>
            <CTableRow>
              <CTableHeaderCell>Código</CTableHeaderCell>
              <CTableHeaderCell>Nombre</CTableHeaderCell>
              <CTableHeaderCell>Descripción</CTableHeaderCell>
              <CTableHeaderCell>&nbsp;</CTableHeaderCell>
            </CTableRow>
          </CTableHead>
          <CTableBody>
            {itemCategories &&
              itemCategories.map((itemCategory, index) => (
                <CTableRow key={index}>
                  <CTableDataCell xs="12" className="text-uppercase">
                    {itemCategory.code}
                  </CTableDataCell>
                  <CTableDataCell className="fs-6" xs="12">
                    {itemCategory.name}
                  </CTableDataCell>
                  <CTableDataCell xs="12" className="text-break">
                    {itemCategory.description}
                  </CTableDataCell>
                  <CTableDataCell xs="12">
                    <CButton
                      size="sm"
                      variant="outline"
                      color="info"
                      disabled={fetching}
                      onClick={() => onEdit(itemCategory)}
                    >
                      EDITAR
                    </CButton>
                  </CTableDataCell>
                </CTableRow>
              ))}
          </CTableBody>
          <CTableFoot>
            <CTableRow>
              <CTableDataCell colSpan={5} className="text-center">
                Página {page}
              </CTableDataCell>
            </CTableRow>
            <CTableRow className="mt-2">
              <CTableDataCell colSpan={5}>
                <CRow>
                  <CCol>
                    <div className="d-grid col-12 mx-auto">
                      <CButton
                        type="button"
                        variant="outline"
                        color="secondary"
                        disabled={fetching}
                        onClick={onPrevPage}
                      >
                        ANTERIOR
                      </CButton>
                    </div>
                  </CCol>
                  <CCol>
                    <div className="d-grid col-12 mx-auto">
                      <CButton
                        type="button"
                        variant="outline"
                        color="secondary"
                        disabled={fetching}
                        onClick={onNextPage}
                      >
                        SIGUIENTE
                      </CButton>
                    </div>
                  </CCol>
                </CRow>
              </CTableDataCell>
            </CTableRow>
          </CTableFoot>
        </CTable>
      </div>
    </>
  );
}

export default ItemCategoriesList;

ItemCategoriesList.propTypes = {
  itemCategories: PropTypes.array.isRequired,
  fetching: PropTypes.bool.isRequired,
  page: PropTypes.number.isRequired,
  onEdit: PropTypes.func.isRequired,
  onPrevPage: PropTypes.func.isRequired,
  onNextPage: PropTypes.func.isRequired,
};
