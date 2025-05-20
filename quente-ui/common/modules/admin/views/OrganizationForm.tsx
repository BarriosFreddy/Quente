import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";
import {
  CButton,
  CCard,
  CCardBody,
  CCardFooter,
  CCardHeader,
  CCol,
  CForm,
  CFormInput,
  CFormSelect,
  CFormText,
  CRow,
  CSpinner,
  CAlert,
} from "@coreui/react";
import {
  createOrganization,
  fetchOrganizationById,
  updateOrganization,
  setSelectedOrganization,
  clearOrganizationError,
} from "../slices/organizationSlice";
import {
  Organization,
  OrganizationStatus,
} from "../../../shared/models/organization.model";
import { RootState } from "../../../store/store";

const OrganizationForm: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const isEditMode = Boolean(id);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { selectedOrganization, loading, error } = useSelector(
    (state: RootState) => state.organizations
  );

  const [formValues, setFormValues] = useState<Partial<Organization>>({
    name: "",
    uid: "",
    nit: "",
    address: "",
    city: "",
    country: "",
    phoneNumber: "",
    status: OrganizationStatus.CREATING,
  });

  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    // Clear selected organization when component unmounts
    return () => {
      dispatch(setSelectedOrganization(null));
      dispatch(clearOrganizationError());
    };
  }, [dispatch]);

  useEffect(() => {
    if (isEditMode && id) {
      dispatch(fetchOrganizationById(id));
    }
  }, [dispatch, id, isEditMode]);

  useEffect(() => {
    if (selectedOrganization && isEditMode) {
      setFormValues({
        ...selectedOrganization,
      });
    }
  }, [selectedOrganization, isEditMode]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | { name?: string; value: unknown }>
  ) => {
    const { name, value } = e.target;
    setFormValues((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Clear error when user enters data
    if (formErrors[name]) {
      setFormErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};
    if (!formValues.name) errors.name = "El nombre es requerido";
    if (!formValues.uid) errors.uid = "El identificador único es requerido";
    if (!formValues.nit) errors.nit = "El NIT es requerido";
    if (!formValues.address) errors.address = "La dirección es requerida";
    if (!formValues.city) errors.city = "La ciudad es requerida";
    if (!formValues.country) errors.country = "El país es requerido";

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    try {
      if (isEditMode && id) {
        await dispatch(updateOrganization({ id, organization: formValues }));
      } else {
        await dispatch(createOrganization(formValues));
      }
      navigate("/admin/organizaciones");
    } catch (err) {
      console.error("Error submitting form:", err);
    }
  };

  if (loading && isEditMode) {
    return (
      <div className="d-flex justify-content-center mt-5">
        <CSpinner />
      </div>
    );
  }

  return (
    <CCard>
      <CCardHeader>
        <h5 className="mb-0">
          {isEditMode ? "Editar Organización" : "Nueva Organización"}
        </h5>
      </CCardHeader>

      <CCardBody>
        {error && (
          <CAlert color="danger" className="mb-3">
            {error}
          </CAlert>
        )}

        <CForm onSubmit={handleSubmit}>
          <CRow className="mb-3">
            <CCol md={6}>
              <CFormInput
                label="Nombre"
                name="name"
                value={formValues.name || ""}
                onChange={handleChange}
                invalid={Boolean(formErrors.name)}
                feedbackInvalid={formErrors.name}
                required
              />
            </CCol>
            <CCol md={6}>
              <CFormInput
                label="Identificador Único"
                name="uid"
                value={formValues.uid || ""}
                onChange={handleChange}
                invalid={Boolean(formErrors.uid)}
                feedbackInvalid={formErrors.uid}
                required
                disabled={isEditMode} // Cannot change UID in edit mode
              />
              {!formErrors.uid && (
                <CFormText>
                  Identificador único para la base de datos de la organización
                </CFormText>
              )}
            </CCol>
          </CRow>

          <CRow className="mb-3">
            <CCol md={6}>
              <CFormInput
                label="NIT"
                name="nit"
                value={formValues.nit || ""}
                onChange={handleChange}
                invalid={Boolean(formErrors.nit)}
                feedbackInvalid={formErrors.nit}
                required
              />
            </CCol>
            <CCol md={6}>
              <CFormInput
                label="Teléfono"
                name="phoneNumber"
                value={formValues.phoneNumber || ""}
                onChange={handleChange}
              />
            </CCol>
          </CRow>

          <CRow className="mb-3">
            <CCol xs={12}>
              <CFormInput
                label="Dirección"
                name="address"
                value={formValues.address || ""}
                onChange={handleChange}
                invalid={Boolean(formErrors.address)}
                feedbackInvalid={formErrors.address}
                required
              />
            </CCol>
          </CRow>

          <CRow className="mb-3">
            <CCol md={6}>
              <CFormInput
                label="Ciudad"
                name="city"
                value={formValues.city || ""}
                onChange={handleChange}
                invalid={Boolean(formErrors.city)}
                feedbackInvalid={formErrors.city}
                required
              />
            </CCol>
            <CCol md={6}>
              <CFormInput
                label="País"
                name="country"
                value={formValues.country || ""}
                onChange={handleChange}
                invalid={Boolean(formErrors.country)}
                feedbackInvalid={formErrors.country}
                required
              />
            </CCol>
          </CRow>

          {isEditMode && (
            <CRow className="mb-3">
              <CCol md={6}>
                <CFormSelect
                  label="Estado"
                  name="status"
                  value={formValues.status || OrganizationStatus.CREATING}
                  onChange={handleChange}
                >
                  <option value={OrganizationStatus.CREATING}>Creando</option>
                  <option value={OrganizationStatus.ACTIVE}>Activa</option>
                  <option value={OrganizationStatus.INACTIVE}>Inactiva</option>
                </CFormSelect>
              </CCol>
            </CRow>
          )}

          <CRow className="mb-3">
            <CCol md={6}>
              <CFormInput
                label="Logo URL"
                name="logoLink"
                value={formValues.logoLink || ""}
                onChange={handleChange}
              />
              <CFormText>URL de la imagen del logo (opcional)</CFormText>
            </CCol>
          </CRow>
        </CForm>
      </CCardBody>

      <CCardFooter className="d-flex justify-content-between">
        <CButton
          color="secondary"
          variant="outline"
          onClick={() => navigate("/admin/organizaciones")}
        >
          Cancelar
        </CButton>
        <CButton
          type="submit"
          color="primary"
          disabled={loading}
          onClick={handleSubmit}
        >
          {loading ? (
            <CSpinner size="sm" />
          ) : isEditMode ? (
            "Actualizar"
          ) : (
            "Crear"
          )}
        </CButton>
      </CCardFooter>
    </CCard>
  );
};

export default OrganizationForm;
