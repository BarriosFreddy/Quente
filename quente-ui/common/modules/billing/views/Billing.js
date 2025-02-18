import React, { useState, useEffect, useRef, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  CButton,
  CCard,
  CCardBody,
  CCol,
  CContainer,
  CFormInput,
  CFormSelect,
  CRow,
  CTable,
  CTableBody,
  CTableDataCell,
  CTableHead,
  CTableHeaderCell,
  CTableRow,
} from "@coreui/react";
import BillingForm from "./BillingForm";
import {
  formatCurrency,
  getDateAsString,
  getDateObject,
  getMainPrice,
  getMainPriceRatio,
} from "@quente/common/utils";
import {
  usePDF,
  Document,
  Page,
  Text,
  BlobProvider,
} from "@react-pdf/renderer";
import CIcon from "@coreui/icons-react";
import { cilTrash } from "@coreui/icons";
import PaymentComp from "./Payment";
import { saveBilling } from "../services/billings.service";
import { setSidebarUnfoldable } from "src/app.slice";
import { Helmet } from "react-helmet";
import { sendToast } from "@quente/common/shared/services/notification.service";
import { useDidUpdateControl } from "@quente/common/hooks/useDidUpdateControl";
import CONSTANTS from "../../../constants";
import ClientSearchComponent from "./../../../shared/components/client-search-component/ClientSearchComponent";
import CurrencyFormInput from "@quente/common/shared/components/CurrencyFormInput";
import { getAllItems } from "./../../inventory/services/items.service";
import BillingTemplate from "./print-templates/BillingTemplate";
const { REACT_APP_HELADERIA_BARCODE, REACT_APP_VARIEDAD_BARCODE } = process.env;
const itemsPricesInitialState = {
  [REACT_APP_HELADERIA_BARCODE]: "",
  [REACT_APP_VARIEDAD_BARCODE]: "",
};
const { REACT_APP_UI } = process.env;

console.log({ REACT_APP_UI });

const RESIZE_BREAKPOINT = 992;

function Billing() {
  const dispatch = useDispatch();
  const saveSuccess = useSelector((state) => state.billing.saveSuccess);
  const saving = useSelector((state) => state.billing.saving);
  let [billingData, setBillingData] = useState(null);
  let [items, setItems] = useState([]);
  let [receivedAmount, setReceivedAmount] = useState(0);
  let [total, setTotal] = useState(0);
  let [itemUnits, setItemUnits] = useState({});
  let [itemPrices, setItemPrices] = useState(itemsPricesInitialState); //This is used for special beheavior related to global items
  let [paying, setPaying] = useState(false);
  const cargeButtonRef = useRef();
  const clientSearchComponentRef = useRef();
  const itemPricesRef = {
    [REACT_APP_HELADERIA_BARCODE]: useRef(),
    [REACT_APP_VARIEDAD_BARCODE]: useRef(),
  };
  const isReceivedLTTotal = receivedAmount < total;
  const hasNotItems = items.length <= 0;
  const keyBuffer = useMemo(() => new Set(), []);
  const [isSmallScreen, setIsSmallScreen] = useState(
    window.innerWidth < RESIZE_BREAKPOINT
  );
  const [showItemsSmScreens, setShowItemsSmScreens] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      setIsSmallScreen(window.innerWidth < RESIZE_BREAKPOINT);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    dispatch(getAllItems());
  }, []);

  useEffect(() => {
    dispatch(setSidebarUnfoldable(true));
  }, [dispatch]);
  useEffect(() => {
    document.addEventListener("keyup", ({ key }) => keyBuffer.delete(key));
    document.addEventListener("keydown", ({ key }) => keyBuffer.add(key));
  }, [keyBuffer]);
  useEffect(() => {
    document.addEventListener("keydown", () => {
      if (
        keyBuffer.has("Alt") &&
        keyBuffer.has("c") &&
        !paying &&
        items.length > 0
      )
        handleCharge();
    });
  }, [keyBuffer, paying, items]);
  useEffect(() => {
    document.addEventListener("keydown", () => {
      if (keyBuffer.has("Control") && keyBuffer.has("z") && paying)
        handleBack();
    });
  }, [keyBuffer, paying]);

  useDidUpdateControl(
    async () => {
      if (saveSuccess) {
        setItems([]);
        setReceivedAmount(0);
        setTotal(0);
        setItemUnits({});
        sendToast(dispatch, { message: "Guardado exitosamente!" });
        setPaying(false);
        setItemPrices(itemsPricesInitialState);
        !!REACT_APP_UI && (await window.electronAPI.printFile());
      } else {
        sendToast(dispatch, {
          message: "No se pudo guardar los datos",
          color: "danger",
        });
      }
    },
    saving,
    [saveSuccess]
  );

  // Init

  const addItem = async (item) => {
    let itemUnitsAdded = {};
    isAdded(item.code)
      ? (itemUnitsAdded[item.code] = itemUnits[item.code] + 1)
      : (itemUnitsAdded[item.code] = 1);
    itemUnitsAdded = { ...itemUnits, ...itemUnitsAdded };
    setItemUnits(itemUnitsAdded);
    const itemsAdded = [...items];
    if (!isAdded(item.code)) {
      const mainPriceRatio = getMainPriceRatio(item.pricesRatio);
      itemsAdded.unshift({
        ...item,
        price: getMainPrice(item.pricesRatio),
        measurementUnit: mainPriceRatio?.measurementUnit,
        multiplicity: mainPriceRatio?.multiplicity,
      });
    }
    setItems(itemsAdded);
    calculateTotal(itemsAdded, itemUnitsAdded);
    setImmediate(() => {
      if (item.code === REACT_APP_HELADERIA_BARCODE)
        itemPricesRef[REACT_APP_HELADERIA_BARCODE].current.focus();
      if (item.code === REACT_APP_VARIEDAD_BARCODE)
        itemPricesRef[REACT_APP_VARIEDAD_BARCODE].current.focus();
    });
  };

  const isAdded = (itemCode) => items.some(({ code }) => code === itemCode);

  const calculateTotal = (itemsAdded, itemUnitsAdded) => {
    const totalAmount = itemsAdded
      .map(({ price, code }) => price * itemUnitsAdded[code])
      .reduce((acc, value) => +acc + +value, 0);
    setTotal(totalAmount);
  };

  const deleteItem = (code) => {
    const itemsArray = Object.assign([], items);
    const itemUnitsAddedArray = Object.assign([], itemUnits);
    const itemIndex = itemsArray.findIndex((item) => item.code === code);
    delete itemUnitsAddedArray[code];
    if (itemIndex !== -1) itemsArray.splice(itemIndex, 1);
    setItems(itemsArray);
    setItemUnits(itemUnitsAddedArray);
    calculateTotal(itemsArray, itemUnitsAddedArray);
  };

  const handleChangeUnits = ({ target: { name, value } }) => {
    const itemUnitsAdded = { ...itemUnits, [name]: value };
    setItemUnits(itemUnitsAdded);
    calculateTotal(items, itemUnitsAdded);
  };
  const handleChangePrice = ({ target: { value } }, code) => {
    const itemToUpdate = items.find((item) => item.code === code);
    const remaingItems = items.filter((item) => item.code !== code);
    const itemsUpdated = [
      ...remaingItems,
      {
        ...itemToUpdate,
        price: value,
      },
    ];
    setItems(itemsUpdated);
    setItemPrices({
      ...itemPrices,
      [code]: value,
    });
    calculateTotal(itemsUpdated, itemUnits);
  };

  const handleChangeMeasurement = ({ target: { value } }, code) => {
    const itemToUpdate = items.find((item) => item.code === code);
    const remaingItems = items.filter((item) => item.code !== code);
    const { price, multiplicity } = itemToUpdate?.pricesRatio?.find(
      (priceRatio) => priceRatio.measurementUnit === value
    );
    const itemsUpdated = [
      ...remaingItems,
      {
        ...itemToUpdate,
        price,
        measurementUnit: value,
        multiplicity,
      },
    ];
    setItems(itemsUpdated);
    calculateTotal(itemsUpdated, itemUnits);
  };

  const handleCharge = (e) => {
    e.stopPropagation();
    setPaying(true);
    isSmallScreen && setShowItemsSmScreens(false)
  };

  const handleSave = async () => {
    console.log({
      client: clientSearchComponentRef.current?.getSelected()?._id,
    });
    if (isReceivedLTTotal) {
      sendToast(dispatch, {
        message: "Revisa el monto recibido y el total",
        color: "warning",
      });
      return;
    }
    if (hasNotItems) {
      sendToast(dispatch, {
        message: "No hay productos por facturar",
        color: "warning",
      });
      return;
    }
    const billingData = {
      createdAt: getDateObject(),
      receivedAmount,
      billAmount: total,
      items: getItemsData(),
      creationDate: getDateAsString(),
      clientId: clientSearchComponentRef.current?.getSelected()?._id,
    };
    setBillingData(billingData);
    !!REACT_APP_UI && (await window.electronAPI.setData(billingData));
    dispatch(saveBilling(billingData));
  };

  const getItemsData = () =>
    items.map(({ _id, name, code, price, measurementUnit, multiplicity }) => ({
      _id,
      name,
      code,
      price,
      units: itemUnits[code],
      measurementUnit,
      multiplicity,
    }));

  const hanndleReceivedAmount = (receivedAmount) =>
    setReceivedAmount(receivedAmount);
  const handleBack = () => setPaying(false);
  const handleShowItemsSmScreens = () => {
    setShowItemsSmScreens(!showItemsSmScreens);
  };
  const isEqualsTo = (code, ...compareTo) => compareTo.includes(code);
  const handleKeydownPrice = ({ keyCode }) => {
    if ([CONSTANTS.ENTER_KEYCODE, CONSTANTS.TAB_KEYCODE].includes(keyCode))
      cargeButtonRef.current.focus();
  };

  return (
    <>
      <CContainer fluid>
        <Helmet>
          <title>FACTURACIÓN</title>
        </Helmet>
        <CRow>
          {(!isSmallScreen || (isSmallScreen && showItemsSmScreens)) && (
            <CCol lg="6" style={{ padding: 0, margin: 0 }}>
              <CCard style={{ height: "74vh" }}>
                <CCardBody style={{ overflowY: "auto", fontSize: 14 }}>
                  <ClientSearchComponent ref={clientSearchComponentRef} />
                  {isSmallScreen && showItemsSmScreens && (
                    <CRow>
                      <CButton
                        style={{ marginBottom: 10, marginTop: 10 }}
                        variant="outline"
                        type="button"
                        color="primary"
                        onClick={handleShowItemsSmScreens}
                      >
                        REGRESAR
                      </CButton>
                    </CRow>
                  )}
                  <CTable small hover>
                    <CTableHead>
                      <CTableRow>
                        <CTableHeaderCell colSpan={6}>
                          Cantidad / Producto / Subtotal
                        </CTableHeaderCell>
                      </CTableRow>
                    </CTableHead>
                    <CTableBody>
                      {items.map(
                        ({
                          code,
                          name,
                          price,
                          pricesRatio,
                          measurementUnit,
                        }) => (
                          <CTableRow key={code}>
                            <CTableDataCell colSpan={2}>
                              <CRow>
                                <CCol
                                  style={{
                                    display: "flex",
                                    flexDirection: "row",
                                  }}
                                >
                                  {isEqualsTo(
                                    code,
                                    REACT_APP_HELADERIA_BARCODE,
                                    REACT_APP_VARIEDAD_BARCODE
                                  ) ? (
                                    itemUnits[code]
                                  ) : (
                                    <CFormInput
                                      style={{ maxWidth: 60 }}
                                      type="number"
                                      min={1}
                                      formNoValidate
                                      size="sm"
                                      name={code}
                                      value={itemUnits[code]}
                                      onChange={(event) =>
                                        handleChangeUnits(event)
                                      }
                                    />
                                  )}
                                  {pricesRatio.length > 1 && (
                                    <CFormSelect
                                      name="measurementUnit"
                                      value={measurementUnit}
                                      required
                                      size="sm"
                                      onChange={(event) =>
                                        handleChangeMeasurement(event, code)
                                      }
                                      options={[
                                        ...(pricesRatio?.map(
                                          ({ measurementUnit }) => ({
                                            label: measurementUnit,
                                            value: measurementUnit,
                                          })
                                        ) ?? []),
                                      ]}
                                    />
                                  )}
                                </CCol>
                              </CRow>
                            </CTableDataCell>
                            <CTableDataCell xs="12">{name}</CTableDataCell>
                            <CTableDataCell xs="12" className="text-break">
                              {isEqualsTo(
                                code,
                                REACT_APP_HELADERIA_BARCODE,
                                REACT_APP_VARIEDAD_BARCODE
                              ) ? (
                                <CurrencyFormInput
                                  ref={itemPricesRef[code]}
                                  min={1}
                                  formNoValidate
                                  type="number"
                                  size="sm"
                                  name={code}
                                  value={itemPrices[code]}
                                  onChange={(event) =>
                                    handleChangePrice(event, code)
                                  }
                                  onKeyDown={(event) =>
                                    handleKeydownPrice(event)
                                  }
                                />
                              ) : (
                                formatCurrency(price * itemUnits[code])
                              )}
                            </CTableDataCell>
                            <CTableDataCell
                              xs="12"
                              className="text-break text-end fw-semibold"
                            >
                              <CButton
                                size="sm"
                                color="ligth"
                                onClick={() => deleteItem(code)}
                              >
                                <CIcon icon={cilTrash} size="sm" />
                              </CButton>
                            </CTableDataCell>
                          </CTableRow>
                        )
                      )}
                    </CTableBody>
                  </CTable>
                </CCardBody>
              </CCard>
            </CCol>
          )}
          {(!isSmallScreen || (isSmallScreen && !showItemsSmScreens)) && (
            <CCol lg="6" style={{ padding: 0, margin: 0 }}>
              <CCard style={{ height: "74vh", overflowY: "auto" }}>
                <CCardBody>
                  {!paying && (
                    <BillingForm
                      addItem={addItem}
                      hasSelectedItems={items.length > 0}
                      isSmallScreen={isSmallScreen}
                      onShowItemsSmScreens={handleShowItemsSmScreens}
                    />
                  )}
                  {paying && (
                    <PaymentComp
                      cargeButtonRef={cargeButtonRef}
                      setReceivedAmount={hanndleReceivedAmount}
                      onBack={handleBack}
                      total={total}
                    />
                  )}
                </CCardBody>
              </CCard>
            </CCol>
          )}
        </CRow>
        <CRow className="align-items-end">
          <CCard>
            <CCardBody>
              <CRow className="mt-3">
                <CCol lg="5">
                  <div className="d-grid gap-2">
                    <CButton
                      ref={cargeButtonRef}
                      tabIndex={0}
                      type="button"
                      size="lg"
                      color={paying ? "success" : "primary"}
                      onClick={paying ? handleSave : handleCharge}
                      disabled={paying ? saving : hasNotItems}
                    >
                      {paying ? "FACTURAR" : "COBRAR (Alt + C)"}
                    </CButton>
                  </div>
                </CCol>
                <CCol lg="6" className="fs-1">
                  <span>POR COBRAR</span>&nbsp;
                  {formatCurrency(total)}
                </CCol>
              </CRow>
            </CCardBody>
          </CCard>
        </CRow>
      </CContainer>
    </>
  );
}

export default Billing;
