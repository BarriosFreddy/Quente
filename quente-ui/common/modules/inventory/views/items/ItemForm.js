/* eslint-disable no-unused-vars */
import React, { useState, useEffect, createRef, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import PropTypes from "prop-types";
import {
  CButton,
  CRow,
  CModal,
  CModalHeader,
  CModalBody,
  CModalFooter,
  CContainer,
  CCol,
  CFormInput,
  CForm,
  CFormSelect,
  CCardBody,
  CCardHeader,
  CCard,
  CCardFooter,
  CFormCheck,
} from "@coreui/react";
import { getItemCategories } from "../../services/item-categories.service";
import { existByCode } from "../../services/items.service";
import CurrencyFormInput from "../../../../shared/components/CurrencyFormInput";
import FormInput from "../../../../shared/components/FormInput";
import { getInvEnumerationByCode } from "../../services/inv-enumerations.service";
import CIcon from "@coreui/icons-react";
import { cilTrash } from "@coreui/icons";
import { getUUID } from "@quente/common/utils";
import { setExistsByCode } from "../../reducers/items.reducer";
import ConfirmDialog from "./../../../../shared/components/ConfirmDialog";

const DEFAULT_PRICE_RATIO_NAME = "Precio 1";

const initPriceRatioUUID = getUUID();
const itemInitialState = {
  name: "",
  code: "",
  description: "",
  categoryId: "",
  sku: "",
  reorderPoint: "",
  laboratory: "",
  pricesRatio: [
    {
      measurementUnit: "",
      price: "",
      cost: "",
      hash: initPriceRatioUUID,
      main: initPriceRatioUUID,
      multiplicity: "1",
      totalCost: "",
      quantityPerPackage: "1",
      label: DEFAULT_PRICE_RATIO_NAME, // Default label for the first price ratio
    },
  ],
  expirationControl: [
    {
      lotUnits: "",
      lot: "",
      expirationDate: "",
      id: getUUID(),
    },
  ],
};

function ItemForm(props) {
  const dispatch = useDispatch();
  const itemCategories = useSelector(
    (state) => state.itemCategories.itemCategories
  );
  const measurementUnits = useSelector(
    (state) => state.invEnumerations.invEnumeration
  );
  const codeRegistered = useSelector((state) => state.items.existsByCode);
  const saving = useSelector((state) => state.items.saving);
  const [item, setItem] = useState(itemInitialState);
  const [failedValidations, setFailedValidations] = useState({
    code: false,
    description: false,
    name: false,
    reorderPoint: false,
    categoryId: false,
  });
  const [modal, setModal] = useState(false);
  const confirmDialogRef = useRef();

  useEffect(() => {
    if (props.item) {
      let itemToSet = null;
      if (props.copying) {
        itemToSet = {
          ...props.item,
          code: "",
        };
        delete itemToSet._id;
      } else itemToSet = props.item;
      if (itemToSet.pricesRatio && itemToSet.pricesRatio.length === 1 && !itemToSet.pricesRatio[0].label) {
        itemToSet = {
          ...itemToSet,
          pricesRatio: [
            {
              ...itemToSet.pricesRatio[0],
              label: DEFAULT_PRICE_RATIO_NAME
            }
          ]
        }
      }
      setItem(itemToSet);
    }
    dispatch(getItemCategories({ parse: true }));
    dispatch(getInvEnumerationByCode("UDM"));
  }, [dispatch, props.item, props.copying]);

  // INIT
  const oldCode = props.item?.code;
  const toggle = () => setModal(!modal);
  const validateCodeExistence = (code) => {
    if (oldCode !== code) dispatch(existByCode(code));
  };

  const closeBtn = (
    <button className="close" onClick={toggle}>
      &times;
    </button>
  );

  const isValidForm = () => {
    const {
      name,
      code,
      description,
      categoryId,
      pricesRatio,
      expirationControl,
    } = {
      ...item,
    };
    const failedValidationsObj = { ...failedValidations };
    failedValidationsObj.code = !code || codeRegistered;
    failedValidationsObj.description = !description;
    failedValidationsObj.name = !name;
    failedValidationsObj.categoryId = !categoryId;

    pricesRatio?.forEach((priceRatio) => {
      failedValidationsObj["measurementUnit" + priceRatio.hash] =
        !priceRatio.measurementUnit;
      failedValidationsObj["price" + priceRatio.hash] =
        priceRatio.price <= 0 || Number.isNaN(+priceRatio.price);
      failedValidationsObj["cost" + priceRatio.hash] =
        priceRatio.cost <= 0 || Number.isNaN(+priceRatio.cost);
      failedValidationsObj["multiplicity" + priceRatio.hash] =
        !priceRatio.multiplicity || Number.isNaN(+priceRatio.multiplicity);

      // Add label validation
      if (item.pricesRatio.length >= 2) {
        failedValidationsObj["label" + priceRatio.hash] = !priceRatio.label;
      } else {
        // If label is not required (less than 2 price ratios), ensure its validation state regarding emptiness is false (valid)
        if (failedValidationsObj.hasOwnProperty("label" + priceRatio.hash)) {
          failedValidationsObj["label" + priceRatio.hash] = false;
        }
      }
    });

    expirationControl?.forEach((expControl) => {
      failedValidationsObj["lot" + expControl.id] = !expControl.lot;
      failedValidationsObj["lotUnits" + expControl.id] =
        expControl.lotUnits < 0 || Number.isNaN(+expControl.lotUnits);
      failedValidationsObj["expirationDate" + expControl.id] =
        !expControl.expirationDate;
    });
    setFailedValidations(failedValidationsObj);
    return Object.values(failedValidationsObj).every(
      (validation) => validation === false
    );
  };

  const save = async () => {
    if (isValidForm()) {
      const payload = {
        ...item,
      };
      // Explicitly remove syncStatus if it exists at the top level
      delete payload.syncStatus;
      props.onSave(payload);
      setItem(itemInitialState);
    }
  };

  const cancel = () => {
    confirmDialogRef.current.show(true);
  };

  const handleResponseCancel = (sureCancel) => {
    if (sureCancel) {
      props.onCancel();
      setItem(itemInitialState);
      dispatch(setExistsByCode(false));
      return;
    }
    confirmDialogRef.current.show(false);
  };

  const handleChangeField = ({ target: { name, value } }) => {
    setItem({
      ...item,
      [name]: value,
    });
    setFailedValidations({ ...failedValidations, [name]: !value });
    if (name === "code") validateCodeExistence(value);
  };

  const handleChangePricesRatio = (event, hash, index) => {
    const {
      target: { name, value },
    } = event;
    let pricesRatioArray = [...item.pricesRatio];
    if (name === "main") {
      pricesRatioArray = pricesRatioArray.map((priceRatio) => ({
        ...priceRatio,
        [name]: value,
      }));
      setItem({
        ...item,
        pricesRatio: pricesRatioArray,
      });
      return;
    }
    let priceRatioClone = pricesRatioArray.find(
      (priceRatio) => priceRatio.hash === hash
    );
    priceRatioClone = {
      ...priceRatioClone,
      [name]: value,
    };
    pricesRatioArray[index] = priceRatioClone;
    if (name === "totalCost" || name === "quantityPerPackage")
      pricesRatioArray[index].cost = getCostoPorUnidad(pricesRatioArray[index]);
    setItem({
      ...item,
      pricesRatio: pricesRatioArray,
    });
  };

  const handleAddPriceRatio = () => {
    const newItem = getNewItem();
    if ((item.pricesRatio ?? []).length === 0) {
      setItem({
        ...item,
        pricesRatio: [
          {
            ...newItem,
            label: DEFAULT_PRICE_RATIO_NAME, // Default label for the first price ratio
            main: newItem.hash,
          },
        ],
      });
      return;
    }
    if (item.pricesRatio?.length === 1) {
      setItem({
        ...item,
        pricesRatio: [
          {
            ...item.pricesRatio[0],
            main: item.pricesRatio[0].hash,
          },
          newItem,
        ],
      });
      return;
    }
    setItem({
      ...item,
      pricesRatio: [...(item.pricesRatio ?? []), newItem],
    });
  };

  const handleDeletePriceRatio = (hash) => {
    let pricesRatioClone = [...item.pricesRatio];
    const priceRatioToDelete = pricesRatioClone.find(
      (priceRatio) => priceRatio.hash === hash
    );
    const pricesRatioNew = pricesRatioClone.filter(
      (priceRatio) => priceRatio.hash !== hash
    );
    if (priceRatioToDelete.main === priceRatioToDelete.hash) {
      pricesRatioNew[0] = {
        ...pricesRatioNew[0],
        main: pricesRatioNew[0].hash,
      };
    }
    setItem({ ...item, pricesRatio: pricesRatioNew });
  };

  const handleChangeExpControl = (event, id, index) => {
    const {
      target: { name, value },
    } = event;
    let expControlArray = [...item.expirationControl];
    let expControlClone = expControlArray.find(
      (expControl) => expControl.id === id
    );
    expControlClone = {
      ...expControlClone,
      [name]: value,
    };
    expControlArray[index] = expControlClone;
    setItem({
      ...item,
      expirationControl: expControlArray,
    });
  };

  const handleAddExpirationControl = () => {
    const newExpirationControl = getNewExpirationControl();
    setItem({
      ...item,
      expirationControl: [
        ...(item.expirationControl ?? []),
        newExpirationControl,
      ],
    });
  };

  const handleDeleteExpirationControl = (id) => {
    let expirationControlClone = [...item.expirationControl];
    const expirationControlNew = expirationControlClone.filter(
      (priceRatio) => priceRatio.id !== id
    );
    setItem({ ...item, expirationControl: expirationControlNew });
  };

  function getNewItem() {
    return {
      measurementUnit: "",
      price: "",
      cost: "",
      hash: getUUID(),
      main: "",
      multiplicity: 1,
      totalCost: "",
      quantityPerPackage: "1",
      label: "", // Added label initialization
    };
  }

  function getNewExpirationControl() {
    return { lotUnits: "", lot: "", expirationDate: "", id: getUUID() };
  }

  const getPricePercentage = (price, cost) => {
    const pricePercentage = Math.round(((price - cost) * 100) / cost);
    return pricePercentage < 0 || isNaN(pricePercentage) ? 0 : pricePercentage;
  };

  const getCostoPorUnidad = ({ totalCost, quantityPerPackage }) =>
    totalCost / quantityPerPackage;

  return (
    <>
      <CContainer>
        <CCard>
          <CCardBody>
            <CForm className="row g-3 needs-validation" noValidate>
              <CRow>
                <CCol xs="12" lg="3">
                  <FormInput
                    label="Código único"
                    type="text"
                    uppercase="true"
                    name="code"
                    value={item.code}
                    feedback={
                      codeRegistered
                        ? "El código ya se encuentra registrado"
                        : "Campo obligatorio"
                    }
                    invalid={codeRegistered || failedValidations.code}
                    required
                    onChange={(event) => handleChangeField(event)}
                  />
                </CCol>
                <CCol xs="12" lg="3">
                  <FormInput
                    className="text-uppercase"
                    label="Nombre"
                    type="text"
                    uppercase="true"
                    name="name"
                    value={item.name}
                    feedbackInvalid="Campo obligatorio"
                    invalid={failedValidations.name}
                    required
                    onChange={(event) => handleChangeField(event)}
                  />
                </CCol>
                <CCol xs="12" lg="6">
                  <FormInput
                    className="text-uppercase"
                    label="Descripción"
                    type="text"
                    uppercase="true"
                    name="description"
                    value={item.description}
                    feedbackInvalid="Campo obligatorio"
                    invalid={failedValidations.description}
                    required
                    onChange={(event) => handleChangeField(event)}
                  />
                </CCol>
              </CRow>
              <CRow>
                <CCol xs="12" lg="3">
                  <CFormSelect
                    size="sm"
                    label="Categoria"
                    name="categoryId"
                    value={item.categoryId}
                    required
                    feedbackInvalid="Campo obligatorio"
                    invalid={failedValidations.categoryId}
                    onChange={(event) => handleChangeField(event)}
                    aria-label="Default select example"
                    options={["Seleccione la categoria", ...itemCategories]}
                  />
                </CCol>
                <CCol xs="12" lg="3">
                  <FormInput
                    label="Fabricante (Opcional)"
                    type="text"
                    uppercase="true"
                    name="laboratory"
                    value={item.laboratory}
                    onChange={(event) => handleChangeField(event)}
                  />
                </CCol>
                <CCol xs="12" lg="3">
                  <FormInput
                    label="Punto de recompra"
                    type="tel"
                    min={1}
                    name="reorderPoint"
                    value={item.reorderPoint}
                    invalid={failedValidations.reorderPoint}
                    feedbackInvalid="Campo obligatorio"
                    onChange={(event) => handleChangeField(event)}
                  />
                </CCol>
                <CCol xs="12" lg="3">
                  <FormInput
                    label="SKU (Opcional)"
                    type="text"
                    name="sku"
                    value={item.sku}
                    onChange={(event) => handleChangeField(event)}
                  />
                </CCol>
              </CRow>
              <CRow>
                <CCol md="12">
                  <CRow className="my-2">
                    <CCol xs="12" lg="12" className="fw-semibold">
                      Relación de precios
                    </CCol>
                  </CRow>
                  {item.pricesRatio?.map((priceRatio, index) => (
                    <CRow key={priceRatio.hash}>
                      <CCol xs="12" lg="2">
                        <CRow>
                          {item.pricesRatio?.length > 1 && (
                            <CCol xs="1" className="pt-4">
                              <CFormCheck
                                type="radio"
                                name="main"
                                value={priceRatio.hash}
                                checked={priceRatio.main === priceRatio.hash}
                                onChange={(event) =>
                                  handleChangePricesRatio(
                                    event,
                                    priceRatio.hash,
                                    index
                                  )
                                }
                              />
                            </CCol>
                          )}
                          <CCol
                            xs={{
                              offset: 0,
                              span: item.pricesRatio?.length > 1 ? 10 : 12,
                            }}
                          >
                            <CFormSelect
                              size="sm"
                              label="U. de medida"
                              name="measurementUnit"
                              value={priceRatio.measurementUnit}
                              required
                              feedbackInvalid="Campo obligatorio"
                              invalid={
                                failedValidations[
                                "measurementUnit" + priceRatio.hash
                                ]
                              }
                              onChange={(event) =>
                                handleChangePricesRatio(
                                  event,
                                  priceRatio.hash,
                                  index
                                )
                              }
                              aria-label="Default select example"
                              options={[
                                "Seleccione...",
                                ...(measurementUnits?.values ?? []),
                              ]}
                            />
                          </CCol>
                        </CRow>
                      </CCol>
                      <CCol xs="12" lg="2">
                        <FormInput
                          label="Nombre"
                          type="text"
                          name="label"
                          value={priceRatio.label}
                          feedbackInvalid="Campo obligatorio"
                          invalid={failedValidations["label" + priceRatio.hash]}
                          required={item.pricesRatio.length >= 2}
                          onChange={(event) =>
                            handleChangePricesRatio(
                              event,
                              priceRatio.hash,
                              index
                            )
                          }
                        />
                      </CCol>
                      <CCol xs="12" lg="2">
                        <CurrencyFormInput
                          size="sm"
                          label={`Precio ${getPricePercentage(
                            priceRatio.price,
                            priceRatio.cost
                          )}% ↑`}
                          type="tel"
                          name="price"
                          value={priceRatio.price}
                          feedbackInvalid="Campo obligatorio"
                          invalid={failedValidations["price" + priceRatio.hash]}
                          required
                          onChange={(event) =>
                            handleChangePricesRatio(
                              event,
                              priceRatio.hash,
                              index
                            )
                          }
                        />
                      </CCol>
                      <CCol xs="12" lg="2">
                        <CurrencyFormInput
                          label="Costo total"
                          type="tel"
                          name="totalCost"
                          value={priceRatio.totalCost}
                          feedbackInvalid="Campo obligatorio"
                          invalid={
                            failedValidations["totalCost" + priceRatio.hash]
                          }
                          onChange={(event) =>
                            handleChangePricesRatio(
                              event,
                              priceRatio.hash,
                              index
                            )
                          }
                        />
                      </CCol>
                      <CCol xs="12" lg="2">
                        <FormInput
                          label="Cantidad"
                          type="tel"
                          name="quantityPerPackage"
                          min={1}
                          value={priceRatio.quantityPerPackage}
                          feedbackInvalid="Campo obligatorio"
                          invalid={
                            failedValidations[
                            "quantityPerPackage" + priceRatio.hash
                            ]
                          }
                          onChange={(event) =>
                            handleChangePricesRatio(
                              event,
                              priceRatio.hash,
                              index
                            )
                          }
                        />
                      </CCol>
                      <CCol
                        xs="12"
                        lg="1"
                      >
                        <FormInput
                          label="Multiplo"
                          type="tel"
                          name="multiplicity"
                          min={1}
                          value={priceRatio.multiplicity}
                          feedbackInvalid="Campo obligatorio"
                          invalid={
                            failedValidations["multiplicity" + priceRatio.hash]
                          }
                          onChange={(event) =>
                            handleChangePricesRatio(
                              event,
                              priceRatio.hash,
                              index
                            )
                          }
                        />
                      </CCol>
                      {item.pricesRatio?.length > 1 && (
                        <CCol xs="12" lg="1">
                          <CButton
                            color="ligth"
                            className="mt-4"
                            onClick={() =>
                              handleDeletePriceRatio(priceRatio.hash)
                            }
                          >
                            <CIcon icon={cilTrash} size="sm" />
                          </CButton>
                        </CCol>
                      )}
                    </CRow>
                  ))}
                  <CRow className="my-2">
                    <CCol xs="12" lg="4">
                      <CButton
                        variant="outline"
                        color="success"
                        type="button"
                        onClick={handleAddPriceRatio}
                      >
                        AGREGAR RELACIÓN
                      </CButton>
                    </CCol>
                  </CRow>
                </CCol>
                <CCol md="12">
                  <CRow className="my-2">
                    <CCol xs="12" lg="12" className="fw-semibold">
                      Control de vencimiento
                    </CCol>
                  </CRow>
                  {item.expirationControl?.map((expControl, index) => (
                    <CRow key={index}>
                      <CCol
                        xs="12"
                        lg={{
                          offset: 0,
                          span: item.expirationControl?.length === 1 ? 4 : 3,
                        }}
                      >
                        <FormInput
                          label="Cantidad por lote"
                          type="tel"
                          name="lotUnits"
                          feedbackInvalid="Campo obligatorio"
                          invalid={
                            failedValidations["lotUnits" + expControl.id]
                          }
                          value={expControl.lotUnits}
                          onChange={(event) =>
                            handleChangeExpControl(event, expControl.id, index)
                          }
                        />
                      </CCol>
                      <CCol xs="12" lg="4">
                        <FormInput
                          className="text-uppercase"
                          label="Lote"
                          type="text"
                          uppercase="true"
                          name="lot"
                          feedbackInvalid="Campo obligatorio"
                          invalid={failedValidations["lot" + expControl.id]}
                          value={expControl.lot}
                          onChange={(event) =>
                            handleChangeExpControl(event, expControl.id, index)
                          }
                        />
                      </CCol>
                      <CCol xs="12" lg="4">
                        <CFormInput
                          size="sm"
                          label="Fecha de vencimiento"
                          type="date"
                          name="expirationDate"
                          feedbackInvalid="Campo obligatorio"
                          invalid={
                            failedValidations["expirationDate" + expControl.id]
                          }
                          value={expControl.expirationDate}
                          onChange={(event) =>
                            handleChangeExpControl(event, expControl.id, index)
                          }
                        />
                      </CCol>
                      {item.expirationControl?.length > 1 && (
                        <CCol xs="12" lg="1">
                          <CButton
                            color="ligth"
                            className="mt-4"
                            onClick={() =>
                              handleDeleteExpirationControl(expControl.id)
                            }
                          >
                            <CIcon icon={cilTrash} size="sm" />
                          </CButton>
                        </CCol>
                      )}
                    </CRow>
                  ))}
                  <CRow className="my-2">
                    <CCol xs="12" lg="4">
                      <CButton
                        variant="outline"
                        color="success"
                        type="button"
                        onClick={handleAddExpirationControl}
                      >
                        AGREGAR CONTROL
                      </CButton>
                    </CCol>
                  </CRow>
                </CCol>
              </CRow>
            </CForm>
          </CCardBody>
          <CCardFooter className="mt-2">
            <CRow className="mt-0">
              <CCol className="text-center" lg={{ offset: 4, span: 4 }}>
                <CButton
                  color="success"
                  type="button"
                  disabled={saving}
                  onClick={() => save()}
                >
                  {props.item && props.item?.id ? "EDITAR" : "GUARDAR"}
                </CButton>
                &nbsp; &nbsp;
                <CButton
                  variant="outline"
                  color="secondary"
                  onClick={() => cancel()}
                >
                  CANCELAR
                </CButton>
              </CCol>
            </CRow>
          </CCardFooter>
        </CCard>
      </CContainer>
      <ConfirmDialog
        ref={confirmDialogRef}
        onResponse={handleResponseCancel}
        message="¿Estás seguro que quieres cancelar?"
      ></ConfirmDialog>
      <CModal isOpen={modal} toggle={toggle}>
        <CModalHeader toggle={toggle} close={closeBtn}>
          Escaneando
        </CModalHeader>
        <CModalBody>
          <div id="reader" width="600px" style={{ maxWidth: "750px" }}></div>
        </CModalBody>
        <CModalFooter>
          <CButton color="secondary" onClick={toggle}>
            Cancelar
          </CButton>
        </CModalFooter>
      </CModal>
    </>
  );
}

export default ItemForm;

ItemForm.propTypes = {
  onCancel: PropTypes.func.isRequired,
  onSave: PropTypes.func.isRequired,
  item: PropTypes.object,
  copying: PropTypes.bool,
};
