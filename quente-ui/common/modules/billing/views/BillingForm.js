import React, { useCallback, useEffect, useRef, useState } from "react";
import { PropTypes } from "prop-types";

import {
  CModal,
  CModalBody,
  CModalFooter,
  CModalHeader,
  CModalTitle,
  CRow,
  CCol,
  CContainer,
  CButton,
  CFormInput,
  CInputGroup,
  CTable,
  CTableHead,
  CTableRow,
  CTableHeaderCell,
  CTableBody,
  CTableDataCell,
  CBadge,
} from "@coreui/react";
import { formatCurrency, getMainPrice } from "@quente/common/utils";
import { useDispatch, useSelector } from "react-redux";
import { setItems } from "./../../inventory/reducers/items.reducer";
import { getItems } from "./../../inventory/services/items.service";
import CONSTANTS from "../../../constants";
import { useDidUpdate } from "./../../..//hooks/useDidUpdate";
import BarcodeScanner from "../../../components/BarcodeScanner";

const { ENTER_KEYCODE, TAB_KEYCODE } = CONSTANTS;

const BillingForm = (props) => {
  const dispatch = useDispatch();
  const items = useSelector((state) => state.items.items);
  const fetching = useSelector((state) => state.items.fetching);
  const [searchTerm, setSearchTerm] = useState("");
  const [modal, setModal] = useState(false);
  const toggle = () => setModal(!modal);
  const searchTermInput = useRef();

  const clear = useCallback(() => {
    dispatch(setItems([]));
    setSearchTerm("");
    searchTermInput.current.focus();
  }, [dispatch]);

  useEffect(() => {
    clear();
  }, [clear]);

  useDidUpdate(() => {
    if (items.length === 1) addItem(items[0]);
  }, [fetching]);

  // INIT

  const onChangeField = ({ target: { value } }) => {
    setSearchTerm(value);
  };

  const onKeyDownCodeField = async ({ keyCode }) => {
    if ([ENTER_KEYCODE, TAB_KEYCODE].includes(keyCode)) {
      search();
      setTimeout(() => {
        if (items.length === 1) addItem(items[0]);
      }, 500);
    }
  };

  const search = async (term) => {
    const termToSearch = term ?? searchTerm;
    if (!!termToSearch) {
      dispatch(
        getItems({ code: termToSearch, name: termToSearch, page: 1 }, false)
      );
    }
  };

  // eslinvideoReft-disable-next-line react-hooks/exhaustive-deps

  const addItem = (item) => {
    props.addItem(item);
    clear();
  };

  const getStock = (expirationControl) =>
    expirationControl
      ?.map(({ lotUnits }) => lotUnits)
      .reduce((acc, cur) => acc + cur, 0);

  const onShowItemsSmScreens = () => {
    props.onShowItemsSmScreens();
  };

  const handleDetectedBarcode = (code) => setSearchTerm(code);

  return (
    <>
      <CContainer fluid>
        <CRow>
          <CCol>
            <CInputGroup>
              <CFormInput
                ref={searchTermInput}
                type="text"
                autoComplete="off"
                name="searchTerm"
                placeholder="Buscar"
                value={searchTerm}
                onChange={(event) => onChangeField(event)}
                onKeyDown={(event) => onKeyDownCodeField(event)}
              />
              <CButton
                variant="outline"
                type="button"
                color="secondary"
                onClick={clear}
              >
                BORRAR
              </CButton>
            </CInputGroup>
          </CCol>
        </CRow>
        {props.isSmallScreen && props.hasSelectedItems && (
          <CRow>
            <CButton
              style={{ marginBottom: 10, marginTop: 10 }}
              variant="outline"
              type="button"
              color="primary"
              onClick={onShowItemsSmScreens}
            >
              ITEMS
            </CButton>
          </CRow>
        )}
        <BarcodeScanner onDetected={handleDetectedBarcode} />
        <CRow>
          <CCol>
            <CTable hover>
              <CTableHead>
                <CTableRow>
                  <CTableHeaderCell>Producto</CTableHeaderCell>
                  <CTableHeaderCell>Precio</CTableHeaderCell>
                  <CTableHeaderCell>Stock</CTableHeaderCell>
                </CTableRow>
              </CTableHead>
              <CTableBody>
                {items.map((item) => (
                  <CTableRow
                    key={item.code}
                    onClick={() => addItem(item)}
                    style={{ cursor: "pointer" }}
                  >
                    <CTableDataCell xs="12">
                      <CRow>
                        <CCol className="text-uppercase">{item.name}</CCol>
                      </CRow>
                      <CRow>
                        <CCol style={{ fontSize: 10 }}>{item.code}</CCol>
                      </CRow>
                    </CTableDataCell>
                    <CTableDataCell className="text-break">
                      {formatCurrency(getMainPrice(item.pricesRatio))}
                    </CTableDataCell>
                    <CTableDataCell xs="12">
                      <CBadge
                        color={
                          getStock(item.expirationControl) > 0
                            ? "success"
                            : "danger"
                        }
                        shape="rounded-pill"
                      >
                        {getStock(item.expirationControl)}
                      </CBadge>
                    </CTableDataCell>
                  </CTableRow>
                ))}
              </CTableBody>
            </CTable>
          </CCol>
        </CRow>
      </CContainer>
      <CModal visible={modal} onClose={() => setModal(false)}>
        <CModalHeader>
          <CModalTitle>Scanning</CModalTitle>
        </CModalHeader>
        <CModalBody>
          <div id="reader" width="600px" style={{ maxWidth: "750px" }}></div>
          {/* <video
            autoPlay
            style={{ height: 200, border: "1px solid" }}
            ref={videoRef}
          />
          <span>Result: {result}</span> */}
        </CModalBody>
        <CModalFooter>
          <CButton color="secondary" onClick={() => setModal(false)}>
            Close
          </CButton>
        </CModalFooter>
      </CModal>
    </>
  );
};

export default BillingForm;

BillingForm.propTypes = {
  addItem: PropTypes.func.isRequired,
};
