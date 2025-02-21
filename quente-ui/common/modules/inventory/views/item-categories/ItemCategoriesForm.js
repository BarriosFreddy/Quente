import React, { useEffect, useRef, useState } from "react";
import PropTypes from "prop-types";
import {
  CButton,
  CRow,
  CContainer,
  CCol,
  CForm,
  CCard,
  CCardBody,
  CCardFooter,
} from "@coreui/react";
import { useDispatch, useSelector } from "react-redux";
import { validateCodeRegistered } from "../../../inventory/services/item-categories.service";
import { setCodeRegistered } from "../../../inventory/reducers/item-categories.reducer";
import ConfirmDialog from "./../../../../shared/components/ConfirmDialog";
import FormInput from "./../../../../shared/components/FormInput";

const categoryInitialState = {
  code: "",
  name: "",
  description: "",
};
const failedValidationsInitState = {
  code: false,
  name: false,
  description: false,
};

function ItemCategoriesForm(props) {
  const dispatch = useDispatch();
  const confirmDialogRef = useRef();
  const isCodeRegistered = useSelector(
    (state) => state.itemCategories.isCodeRegistered
  );
  const [itemCategory, setItemCategory] = useState(categoryInitialState);
  const [failedValidations, setFailedValidations] = useState(
    failedValidationsInitState
  );
  const oldCode = props.itemCategory?.code;

  useEffect(() => {
    props.itemCategory && setItemCategory(props.itemCategory);
  }, [props.itemCategory]);

  const validateCodeExistence = (code) => {
    if (oldCode !== code) dispatch(validateCodeRegistered(code));
  };

  const onChangeField = ({ target: { name, value } }) => {
    setItemCategory({
      ...itemCategory,
      [name]: value,
    });
    setFailedValidations({ ...failedValidations, [name]: !value });
    if (name === "code") validateCodeExistence(value);
  };

  const clearFieldsForm = () => {
    setItemCategory(categoryInitialState);
    dispatch(setCodeRegistered(false));
    setFailedValidations(failedValidationsInitState);
  };

  const isValidForm = () => {
    const { code, name, description } = {
      ...itemCategory,
    };
    const failedValidationsObj = { ...failedValidations };
    failedValidationsObj.code = !code || isCodeRegistered;
    failedValidationsObj.name = !name;
    failedValidationsObj.description = !description;
    setFailedValidations(failedValidationsObj);
    return Object.values(failedValidationsObj).every(
      (validation) => validation === false
    );
  };

  const handleSave = async () => {
    if (isValidForm()) {
      props.onSave({
        ...itemCategory,
      });
      clearFieldsForm();
    }
  };

  const handleCancel = () => {
    confirmDialogRef.current.show(true);
  };

  const handleResponseCancel = (sureCancel) => {
    sureCancel && props.onCancel();
    if (!sureCancel) {
      confirmDialogRef.current.show(false);
      clearFieldsForm();
    }
  };

  return (
    <>
      <CContainer fluid>
        <CCard>
          <CCardBody>
            <CForm className="row g-3 needs-validation" noValidate>
              <CRow className="mt-2">
                <CCol xs="12" lg="4">
                  <FormInput
                    label="Código"
                    type="text"
                    uppercase="true"
                    name="code"
                    value={itemCategory.code}
                    feedback={
                      isCodeRegistered
                        ? "El código ya se encuentra registrado"
                        : "Campo obligatorio"
                    }
                    invalid={isCodeRegistered || failedValidations.code}
                    required
                    onChange={(event) => onChangeField(event)}
                  />
                </CCol>
                <CCol xs="12" lg="4">
                  <FormInput
                    label="Nombre"
                    type="text"
                    uppercase="true"
                    name="name"
                    value={itemCategory.name}
                    feedbackInvalid="Campo obligatorio"
                    invalid={failedValidations.name}
                    required
                    onChange={(event) => onChangeField(event)}
                  />
                </CCol>
                <CCol xs="12" lg="4">
                  <FormInput
                    label="Descripción"
                    type="text"
                    uppercase="true"
                    name="description"
                    value={itemCategory.description}
                    feedbackInvalid="Campo obligatorio"
                    invalid={failedValidations.description}
                    required
                    onChange={(event) => onChangeField(event)}
                  />
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
                  onClick={() => handleSave()}
                >
                  {props.itemCategory ? "EDITAR" : "GUARDAR"}
                </CButton>
                &nbsp; &nbsp;
                <CButton
                  variant="outline"
                  color="secondary"
                  onClick={() => handleCancel()}
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
    </>
  );
}

export default ItemCategoriesForm;

ItemCategoriesForm.propTypes = {
  onCancel: PropTypes.func.isRequired,
  onSave: PropTypes.func.isRequired,
  itemCategory: PropTypes.object,
};
