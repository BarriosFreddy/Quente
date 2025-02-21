import React from "react";
import {
  CCard,
  CRow,
  CButton,
  CCardBody,
  CCol,
  CTable,
  CTableBody,
  CTableRow,
  CTableDataCell,
  CTableHead,
  CTableHeaderCell,
  CBadge,
  CTableFoot,
} from "@coreui/react";
import { formatCurrency, getMainPrice } from "@quente/common/utils";
import { PropTypes } from "prop-types";
import dayjs from "dayjs";
import CIcon from "@coreui/icons-react";
import { cilCopy, cilPencil } from "@coreui/icons";

const ItemList = ({
  items,
  fetching,
  page,
  onEdit,
  onCopy,
  onPrevPage,
  onNextPage,
}) => {
  const getExpirationDates = (expirationControl) =>
    expirationControl?.map(({ expirationDate, lotUnits }) => ({
      expirationDate,
      lotUnits,
    }));
  return (
    <>
      <div className="d-lg-none">
        {items?.map((item) => (
          <CCard
            key={item.code}
            style={{
              width: "auto",
              cursor: "pointer",
            }}
            className="my-2"
            onClick={() => onEdit(item)}
          >
            <CCardBody>
              <CRow className="g-0">
                <CCol xs="7">
                  <CRow>{item.name}</CRow>
                  <CRow>{item.code}</CRow>
                </CCol>
                <CCol xs="2" className="text-end">
                  {getExpirationDates(item.expirationControl)
                    ?.filter(({ lotUnits }) => lotUnits > 0)
                    .map(({ expirationDate, lotUnits }, index) => (
                      <CBadge
                        key={index}
                        color={
                          dayjs(expirationDate).diff(dayjs(), "days") > 90
                            ? dayjs(expirationDate).diff(dayjs(), "days") > 180
                              ? "success"
                              : "warning"
                            : "danger"
                        }
                        shape="rounded-pill"
                      >
                        {lotUnits}
                      </CBadge>
                    ))}
                </CCol>
                <CCol xs="3" className="text-end fw-bold">
                  {formatCurrency(getMainPrice(item?.pricesRatio))}
                </CCol>
              </CRow>
            </CCardBody>
          </CCard>
        ))}
        <CRow>
          <CCol className="py-1 text-center">Página {page}</CCol>
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
              <CTableHeaderCell scope="col">Nombre</CTableHeaderCell>
              <CTableHeaderCell scope="col">Código</CTableHeaderCell>
              <CTableHeaderCell scope="col">En Stock</CTableHeaderCell>
              <CTableHeaderCell scope="col">Precio</CTableHeaderCell>
              <CTableHeaderCell scope="col">Acciones</CTableHeaderCell>
            </CTableRow>
          </CTableHead>
          <CTableBody>
            {items?.map((item) => (
              <CTableRow key={item.code}>
                <CTableDataCell className="text-uppercase text-break">
                  {item.name}
                </CTableDataCell>
                <CTableDataCell>{item.code}</CTableDataCell>
                <CTableDataCell>
                  {getExpirationDates(item.expirationControl)
                    ?.filter(({ lotUnits }) => lotUnits > 0)
                    .map(({ expirationDate, lotUnits }, index) => (
                      <CBadge
                        key={index}
                        color={
                          dayjs(expirationDate).diff(dayjs(), "days") > 90
                            ? dayjs(expirationDate).diff(dayjs(), "days") > 180
                              ? "success"
                              : "warning"
                            : "danger"
                        }
                        shape="rounded-pill"
                      >
                        {lotUnits}
                      </CBadge>
                    ))}
                </CTableDataCell>
                <CTableDataCell>
                  {formatCurrency(getMainPrice(item?.pricesRatio))}
                </CTableDataCell>
                <CTableDataCell>
                  <CButton
                    size="sm"
                    variant="outline"
                    color="info"
                    disabled={fetching}
                    onClick={() => onEdit(item)}
                  >
                    <CIcon icon={cilPencil} size="sm" />
                    &nbsp; EDITAR
                  </CButton>
                  &nbsp;
                  <CButton
                    size="sm"
                    variant="outline"
                    color="secondary"
                    disabled={fetching}
                    onClick={() => onCopy(item)}
                  >
                    <CIcon icon={cilCopy} size="sm" />
                    &nbsp; COPIAR
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
};

export default ItemList;

ItemList.propTypes = {
  items: PropTypes.array.isRequired,
  page: PropTypes.number.isRequired,
  fetching: PropTypes.bool.isRequired,
  onEdit: PropTypes.func.isRequired,
  onCopy: PropTypes.func.isRequired,
  onPrevPage: PropTypes.func.isRequired,
  onNextPage: PropTypes.func.isRequired,
};
