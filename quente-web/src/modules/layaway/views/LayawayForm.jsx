import React, { useState, useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import PropTypes from 'prop-types';
import {
  CButton,
  CRow,
  CCol,
  CFormInput,
  CForm,
  CCardBody,
  CCardHeader,
  CCard,
  CCardFooter,
  CFormLabel,
  CAlert,
  CSpinner,
  CFormFeedback
} from '@coreui/react';
import CurrencyFormInput from '@/shared/components/CurrencyFormInput';
import FormInput from '@/shared/components/FormInput';
import { getMainPrice } from '@/utils';
import { formatCurrency } from '@/utils';
import CIcon from '@coreui/icons-react';
import { cilTrash } from '@coreui/icons';
import ClientSearchComponent from "@/shared/components/client-search-component/ClientSearchComponent";
import { sendWarningToast } from '@/shared/services/notification.service';
import ItemSearchComponent from '@/shared/components/item-search-component/ItemSearchComponent';


const layawayInitialState = {
  customerName: '',
  customerId: '',
  customerPhone: '',
  customerEmail: '',
  items: [],
  totalAmount: 0,
  initialPayment: 0,
  remainingAmount: 0,
  paidAmount: 0,
  paymentDueDate: '',
  notes: '',
  status: 'ACTIVE'
};

function LayawayForm(props) {
  const dispatch = useDispatch();
  const { name, id } = useSelector((state) => state.auth.infoUser) ?? {}
  const saving = useSelector((state) => state.layaways.saving);
  const [layaway, setLayaway] = useState(layawayInitialState);
  const [failedValidations, setFailedValidations] = useState({
    customerName: false,
    initialPayment: false,
    items: false
  });

  // Reference for client search component
  const clientSearchComponentRef = useRef();
  const itemSearchComponentRef = useRef()

  useEffect(() => {
    if (props.layaway) {
      setLayaway(props.layaway);
    } else {
      setLayaway(layawayInitialState);
    }
  }, [props.layaway]);

  // Helper to calculate totals
  const calculateTotals = (updatedLayaway) => {
    const items = updatedLayaway.items || [];
    const itemTotal = items.reduce((sum, item) => {
      const subtotal = (item.quantity || 0) * (parseFloat(item.unitPrice) || 0);
      return sum + subtotal;
    }, 0);

    const totalAmount = itemTotal;
    const initialPayment = parseFloat(updatedLayaway.initialPayment) || 0;
    const remainingAmount = Math.max(0, totalAmount - initialPayment);

    return {
      ...updatedLayaway,
      totalAmount,
      remainingAmount,
      paidAmount: initialPayment
    };
  };

  // Handle form field changes
  const handleChangeField = ({ target: { name, value } }) => {
    const updatedLayaway = { ...layaway, [name]: value };

    // Recalculate totals if initialPayment changes
    if (name === 'initialPayment') {
      const calculatedLayaway = calculateTotals(updatedLayaway);
      setLayaway(calculatedLayaway);
    } else {
      setLayaway(updatedLayaway);
    }

    // Clear validation error when field is filled
    setFailedValidations({ ...failedValidations, [name]: !value });
  };

  // Handle changes to items in the layaway
  const handleItemChange = (event, id, index) => {
    const { name, value } = event.target;
    const updatedItems = [...layaway.items];
    const updatedItem = { ...updatedItems[index], [name]: value };

    // Calculate item subtotal if quantity or unitPrice changes
    if (name === 'quantity' || name === 'unitPrice') {
      updatedItem.subtotal = (updatedItem.quantity || 0) * (parseFloat(updatedItem.unitPrice) || 0);
    }

    updatedItems[index] = updatedItem;

    // Update layaway with new items and recalculate totals
    const updatedLayaway = { ...layaway, items: updatedItems };
    const calculatedLayaway = calculateTotals(updatedLayaway);

    setLayaway(calculatedLayaway);
  };

  const isAdded = (itemCode) => layaway.items.some(({ code }) => code === itemCode);

  // Remove an item from the layaway
  const handleDeleteItem = (id) => {
    if (layaway.items.length <= 1) {
      return; // Prevent deleting the last item
    }

    const updatedItems = layaway.items.filter(item => item.id !== id);
    const updatedLayaway = { ...layaway, items: updatedItems };
    const calculatedLayaway = calculateTotals(updatedLayaway);

    setLayaway(calculatedLayaway);
  };

  // Validate form before submission
  const isValidForm = () => {
    const selectedClient = clientSearchComponentRef.current?.getSelected();
    console.log({ selectedClient });
    if (!selectedClient) {
      sendWarningToast(dispatch, { message: "Selecciona el cliente!" })
      return
    }

    // Format date in ISO 8601 format (YYYY-MM-DD)
    const date = layaway.paymentDueDate ? new Date(layaway.paymentDueDate) : null;
    if (!date) {
      sendWarningToast(dispatch, { message: "Ingrese la fecha del acuerdo" })
      return;
    }
    const failedValidationsObj = { ...failedValidations };

    // Validate customer information
    failedValidationsObj.customerName = !layaway.customerName;

    // Validate items
    let itemsValid = true;
    layaway.items.forEach((item, index) => {
      const itemNameKey = `itemName${index}`;
      const itemPriceKey = `itemPrice${index}`;

      failedValidationsObj[itemNameKey] = !item.name;
      failedValidationsObj[itemPriceKey] = !item.unitPrice || parseFloat(item.unitPrice) <= 0;

      if (!item.name || !item.unitPrice || parseFloat(item.unitPrice) <= 0) {
        itemsValid = false;
      }
    });

    failedValidationsObj.items = !itemsValid;

    // Validate payment information
    failedValidationsObj.initialPayment = layaway.initialPayment < 0;

    // Validate total amount
    failedValidationsObj.totalAmount = layaway.totalAmount <= 0;

    setFailedValidations(failedValidationsObj);

    // Check if all validations passed
    return Object.values(failedValidationsObj).every(validation => validation === false);
  };

  // Handle form submission
  const save = () => {
    if (isValidForm()) {
      const selectedClient = clientSearchComponentRef.current?.getSelected();

      let payload = {
        // Required fields according to backend validation
        totalAmount: parseFloat(layaway.totalAmount),
        initialPayment: parseFloat(layaway.initialPayment),
        expectedDeliveryDate: new Date(layaway.paymentDueDate),
        client: {
          id: selectedClient._id,
          name: selectedClient.name,
          email: layaway.customerEmail,
          phoneNumber: layaway.customerPhone
        },
        // Format items according to backend schema
        items: layaway.items.map(item => ({
          _id: "64643f01e21a9b579e003f50",
          code: "7703038020028",
          name: item.name,
          price: parseFloat(item.unitPrice),
          units: parseInt(item.quantity, 10),
        })),
        // Add creator information
        createdBy: {
          id,
          name
        },
        notes: layaway.notes || ''
      };

      // Save layaway
      props.onSave(payload);
    }
  };

  // Calculate if remaining amount is fully covered by initial payment
  const isFullyPaid = layaway.remainingAmount === 0 && layaway.totalAmount > 0;

  // Handle client selection
  const handleSelectClient = (client) => {
    if (!client) return;
    setLayaway({
      ...layaway,
      customerName: client.name,
      customerId: client._id,
      customerPhone: client.phoneNumber,
      customerEmail: client.email
    });
    // Clear validation error for customer name
    setFailedValidations({ ...failedValidations, customerName: false });
  };

  const handleSelectItem = (item) => {
    // Check if the item is already in the list
    if (isAdded(item.code)) {
      // If item exists, increase its quantity instead of adding a duplicate
      const updatedItems = layaway.items.map(existingItem => {
        if (existingItem.code === item.code) {
          const newQuantity = (parseInt(existingItem.quantity, 10) || 0) + 1;
          const newSubtotal = newQuantity * parseFloat(existingItem.unitPrice);
          return {
            ...existingItem,
            quantity: newQuantity,
            subtotal: newSubtotal
          };
        }
        return existingItem;
      });

      // Update layaway with updated items and recalculate totals
      const updatedLayaway = { ...layaway, items: updatedItems };
      const calculatedLayaway = calculateTotals(updatedLayaway);
      setLayaway(calculatedLayaway);
    } else {
      // If item is new, add it to the list
      const newItem = {
        id: Date.now().toString(), // Ensure each item has a unique ID
        code: item.code,
        name: item.name,
        quantity: 1,
        unitPrice: getMainPrice(item.pricesRatio),
        subtotal: getMainPrice(item.pricesRatio), // Initial subtotal is just the price
      };

      const updatedLayaway = {
        ...layaway,
        items: [...(layaway.items || []), newItem]
      };

      // Calculate totals after adding the new item
      const calculatedLayaway = calculateTotals(updatedLayaway);
      setLayaway(calculatedLayaway);
    }

    // Clear the item search component
    itemSearchComponentRef.current?.clear();
  }

  return (
    <>
      <CCard className="shadow border-10 mb-5">
        <CCardHeader>PLAN SEPARE</CCardHeader>
        <CCardBody>
          <CForm>
            {/* Customer Information */}
            <CRow className="mb-4">
              <CCol md="12">
                <h5>Información del Cliente</h5>
              </CCol>

              {/* Client Search Component */}
              <CCol md="12" className="mb-3">
                <ClientSearchComponent
                  ref={clientSearchComponentRef}
                  onSelect={handleSelectClient}/>
              </CCol>

              <CCol md="6" className="mb-3">
                <CFormLabel>Teléfono</CFormLabel>
                <FormInput
                  type="text"
                  name="customerPhone"
                  value={layaway.customerPhone}
                  onChange={handleChangeField}
                  disabled={true}
                />
              </CCol>
              <CCol md="6" className="mb-3">
                <CFormLabel>Correo Electrónico</CFormLabel>
                <FormInput
                  type="email"
                  name="customerEmail"
                  value={layaway.customerEmail}
                  onChange={handleChangeField}
                  disabled={true}
                />
              </CCol>
              <CCol md="6" className="mb-3">
                <CFormLabel>Fecha Límite de Pago</CFormLabel>
                <CFormInput
                  type="date"
                  name="paymentDueDate"
                  value={layaway.paymentDueDate}
                  onChange={(e) => handleChangeField(e)}
                  disabled={saving}
                />
              </CCol>
            </CRow>
            {/* Items */}
            <CRow className="mb-4">
              <CCol md="12" className="d-flex justify-content-between align-items-center mb-3">
                <h5>Artículos</h5>
              </CCol>
              <CCol md="12">
                <ItemSearchComponent
                  label="Seleccione el articulo"
                  ref={itemSearchComponentRef} onSelect={handleSelectItem} />
              </CCol>
              {/* Header row for items table */}
              <CCol md="12">
                <CRow className="border-bottom pb-2 mb-3 fw-bold">
                  <CCol md="4">Nombre*</CCol>
                  <CCol md="2">Cantidad*</CCol>
                  <CCol md="2">Precio Unitario*</CCol>
                  <CCol md="3">Subtotal</CCol>
                  <CCol md="1">Acciones</CCol>
                </CRow>
              </CCol>

              {/* Item rows */}
              {layaway.items.map((item, index) => (
                <CCol md="12" key={item.id}>
                  <CRow className="mb-3 align-items-center">
                    <CCol md="4">
                      <FormInput
                        type="text"
                        name="name"
                        value={item.name}
                        onChange={(e) => handleItemChange(e, item.id, index)}
                        invalid={failedValidations[`itemName${index}`]}
                        disabled
                      />
                    </CCol>
                    <CCol md="2">
                      <FormInput
                        type="number"
                        min="1"
                        name="quantity"
                        value={item.quantity}
                        onChange={(e) => handleItemChange(e, item.id, index)}
                        disabled={saving}
                      />
                    </CCol>
                    <CCol md="2">
                      <CurrencyFormInput
                        name="unitPrice"
                        value={item.unitPrice}
                        onChange={(e) => handleItemChange(e, item.id, index)}
                        invalid={failedValidations[`itemPrice${index}`]}
                        disabled={saving}
                      />
                    </CCol>
                    <CCol md="3">
                      <div className="form-control bg-light">
                        {formatCurrency(item.subtotal || 0)}
                      </div>
                    </CCol>
                    <CCol md="1">
                      <CButton
                        color="danger"
                        variant="outline"
                        size="sm"
                        onClick={() => handleDeleteItem(item.id)}
                        disabled={saving || layaway.items.length <= 1}
                      >
                        <CIcon icon={cilTrash} size="sm" />
                      </CButton>
                    </CCol>
                  </CRow>
                </CCol>
              ))}

              {failedValidations.items && (
                <CCol md="12" className="mb-3">
                  <CAlert color="danger" className="p-2">
                    Por favor complete la información de todos los artículos
                  </CAlert>
                </CCol>
              )}
            </CRow>

            {/* Payment Information */}
            <CRow className="mb-4">
              <CCol md="12">
                <h5>Información de Pago</h5>
              </CCol>
              <CCol md="4" className="mb-3">
                <CFormLabel>Pago Inicial*</CFormLabel>
                <CurrencyFormInput
                  name="initialPayment"
                  value={layaway.initialPayment}
                  onChange={handleChangeField}
                  invalid={failedValidations.initialPayment}
                  disabled={saving}
                />
                <CFormFeedback invalid>
                  El pago inicial no puede ser negativo
                </CFormFeedback>
              </CCol>
              <CCol md="4" className="mb-3">
                <CFormLabel>Monto Total</CFormLabel>
                <div className="form-control bg-light fw-bold">
                  {formatCurrency(layaway.totalAmount || 0)}
                </div>
              </CCol>
              <CCol md="4" className="mb-3">
                <CFormLabel>Saldo Restante</CFormLabel>
                <div className={`form-control bg-light fw-bold ${isFullyPaid ? 'text-success' : ''}`}>
                  {formatCurrency(layaway.remainingAmount || 0)}
                </div>
              </CCol>
            </CRow>

            {/* Additional Information */}
            <CRow className="mb-4">
              <CCol md="12">
                <h5>Información Adicional</h5>
              </CCol>
              <CCol md="12" className="mb-3">
                <CFormLabel>Notas</CFormLabel>
                <CFormInput
                  type="textarea"
                  rows="3"
                  name="notes"
                  value={layaway.notes}
                  onChange={handleChangeField}
                  disabled={saving}
                />
              </CCol>
            </CRow>

            {failedValidations.totalAmount && (
              <CRow className="mb-3">
                <CCol md="12">
                  <CAlert color="danger" className="p-2">
                    El monto total debe ser mayor a cero
                  </CAlert>
                </CCol>
              </CRow>
            )}

            {/* Form Summary */}
            <CRow className="mb-3">
              <CCol md="12">
                {isFullyPaid && (
                  <CAlert color="success" className="p-2">
                    ¡Este plan separe está completamente pagado!
                  </CAlert>
                )}
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
                onClick={save}
              >
                {saving ? (
                  <>
                    <CSpinner size="sm" className="me-2" />
                    Guardando...
                  </>
                ) : props.layaway && props.layaway?._id ? (
                  'ACTUALIZAR'
                ) : (
                  'GUARDAR'
                )}
              </CButton>
              &nbsp; &nbsp;
              <CButton
                variant="outline"
                color="secondary"
                onClick={props.onCancel}
              >
                CANCELAR
              </CButton>
            </CCol>
          </CRow>
        </CCardFooter>
      </CCard>
    </>

  );
}

export default LayawayForm;

LayawayForm.propTypes = {
  onCancel: PropTypes.func.isRequired,
  onSave: PropTypes.func.isRequired,
  layaway: PropTypes.object
};
