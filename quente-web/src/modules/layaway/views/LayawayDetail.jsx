import React, { useState, useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  CCard,
  CCardHeader,
  CContainer,
  CRow,
  CCol,
  CCardBody,
  CCardFooter,
  CButton,
  CModal,
  CModalHeader,
  CModalBody,
  CModalFooter,
  CFormLabel,
  CFormSelect,
  CSpinner,
  CAlert,
  CProgress,
  CTable,
  CTableHead,
  CTableBody,
  CTableRow,
  CTableHeaderCell,
  CTableDataCell,
  CBadge
} from '@coreui/react';
import CIcon from '@coreui/icons-react';
import { cilPlus, cilArrowLeft } from '@coreui/icons';
import {
  addPayment,
  updateLayawayStatus
} from '../services/layaways.service';
import { formatCurrency, formatDate } from '@/utils';
import ConfirmDialog from '../../../shared/components/ConfirmDialog';
import CurrencyFormInput from '../../../shared/components/CurrencyFormInput';
import { useDidUpdateControl } from '../../../hooks/useDidUpdateControl';

// Layaway statuses with colors and descriptions
const LAYAWAY_STATUSES = {
  ACTIVE: { label: 'ACTIVO', color: 'primary', description: 'El plan separe está activo y pendiente de pagos.' },
  CANCELED: { label: 'CANCELADO', color: 'danger', description: 'El plan separe ha sido cancelado.' },
  DELIVERED: { label: 'ENTREGADO', color: 'success', description: 'El plan separe ha sido entregado al cliente.' },
  COMPLETED: { label: 'COMPLETADO', color: 'success', description: 'El plan separe ha sido completado.' }
};

function LayawayDetail({ onBack }) {
  const { name, id } = useSelector((state) => state.auth.infoUser) ?? {}
  const dispatch = useDispatch();

  // Redux state
  const layaway = useSelector((state) => state.layaways.layaway);
  const payments = useSelector((state) => state.layaways.payments);
  const fetching = useSelector((state) => state.layaways.fetching);
  const saving = useSelector((state) => state.layaways.saving);
  const addPaymentSuccess = useSelector((state) => state.layaways.addPaymentSuccess);
  const updateStatusSuccess = useSelector((state) => state.layaways.updateStatusSuccess);
  const currentUser = useSelector((state) => state.auth.user);

  // Local state
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [newPayment, setNewPayment] = useState({ amount: '', paymentMethod: '' });
  const [statusUpdate, setStatusUpdate] = useState({ status: '', reason: '' });
  const [paymentValidation, setPaymentValidation] = useState({ amount: false, paymentMethod: false });
  const [statusValidation, setStatusValidation] = useState({ status: false });
  // Calculated variables
  // Check if layaway is fully paid
  const isFullyPaid = layaway?.remainingAmount === 0 && layaway?.totalAmount > 0;
  // Check if layaway can be delivered (fully paid and active)
  const canBeDelivered = isFullyPaid && layaway?.status === 'COMPLETED';
  // Check if layaway is active
  const isActive = layaway?.status === 'ACTIVE';
  // Determine whether to show the "Add Payment" button
  const showAddPaymentButton = isActive && !isFullyPaid;
  // Determine whether to show the "Mark as Delivered" button
  const showDeliverButton = canBeDelivered;
  // Refs
  const confirmDialogRef = useRef();

  // Reset payment form when modal is opened or when payment is successful
  useDidUpdateControl(
    async () => {
      if (addPaymentSuccess) {
        setShowPaymentModal(false);
        setNewPayment({ amount: '', paymentMethod: '' });
      } else {
        sendToast(dispatch, {
          message: "No se pudo guardar los datos",
          color: "danger",
        });
      }
    },
    saving,
    [addPaymentSuccess]
  );


  // Reset status form when modal is opened or when status update is successful
  useDidUpdateControl(
    async () => {
      if (updateStatusSuccess) {
        setShowStatusModal(false);
        setStatusUpdate({ status: '', reason: '' });
      }
    },
    saving,
    [updateStatusSuccess]
  );

  // Calculate payment progress percentage
  const getPaymentProgress = () => {
    if (!layaway?.totalAmount || layaway.totalAmount === 0) return 0;
    return Math.round((layaway.paidAmount / layaway.totalAmount) * 100);
  };

  // Open payment modal
  const handleAddPayment = () => {
    setNewPayment({ amount: '', paymentMethod: '' });
    setPaymentValidation({ amount: false, paymentMethod: false });
    setShowPaymentModal(true);
  };

  // Handle payment form changes
  const handlePaymentChange = ({ target: { name, value } }) => {
    setNewPayment({ ...newPayment, [name]: value });
    if (name === 'amount') {
      setPaymentValidation({
        ...paymentValidation,
        amount: !value || parseFloat(value) <= 0 || parseFloat(value) > layaway?.remainingAmount
      });
    } else if (name === 'paymentMethod') {
      setPaymentValidation({
        ...paymentValidation,
        paymentMethod: !value
      });
    }
  };

  // Submit payment
  const submitPayment = () => {
    // Validate payment amount and method
    const amount = parseFloat(newPayment.amount);
    const paymentMethod = newPayment.paymentMethod;

    const validation = {
      amount: !amount || amount <= 0 || amount > layaway?.remainingAmount,
      paymentMethod: !paymentMethod
    };

    if (validation.amount || validation.paymentMethod) {
      setPaymentValidation(validation);
      return;
    }

    dispatch(addPayment(layaway._id, {
      amount,
      paymentMethod,
      // Add creator information
      createdBy: {
        id,
        name
      }
    }));
  };

  // Handle cancel confirmation
  const handleConfirmCancel = () => {
    confirmDialogRef.current.show(true);
  };

  // Handle response from cancel confirmation dialog
  const handleResponseCancel = (confirm) => {
    if (confirm) {
      // Update status to CANCELED
      dispatch(updateLayawayStatus(layaway._id, {
        status: 'CANCELED',
        reason: 'Cancelado por el usuario'
      }));
    }
    confirmDialogRef.current.show(false);
  };

  const handleDeliver = () => {
    setStatusUpdate({ status: 'DELIVERED', reason: '' });
    dispatch(updateLayawayStatus(layaway._id, { status: 'DELIVERED' }));
  };

  return (
    <>
      <CContainer>
        {fetching ? (
          <div className="text-center my-5">
            <CSpinner />
          </div>
        ) : !layaway ? (
          <CAlert color="warning">No se encontró el plan separe solicitado</CAlert>
        ) : (
          <>
            <CCard className="shadow border-10 mb-4">
              <CCardHeader>
                <CRow>
                  <CCol>
                    <CButton
                      color="primary"
                      variant="outline"
                      onClick={onBack}
                    >
                      <CIcon icon={cilArrowLeft} size="sm" className="me-1" /> Volver
                    </CButton>
                  </CCol>
                  <CCol>
                    <h4>Información del plan separe</h4>
                  </CCol>
                  <CCol className="text-end">
                    {layaway && layaway.status && LAYAWAY_STATUSES[layaway.status] && (
                      <CBadge color={LAYAWAY_STATUSES[layaway.status].color}>
                        {LAYAWAY_STATUSES[layaway.status].label}
                      </CBadge>
                    )}
                  </CCol>
                </CRow>
              </CCardHeader>
              <CCardBody>
                <CRow>
                  <CCol md="6" className="mb-3">
                    <h5>Cliente</h5>
                    <p className="fs-5 mb-1">{layaway.client.name}</p>
                    {layaway.client.phoneNumber && (
                      <p className="mb-1">Teléfono: {layaway.client.phoneNumber}</p>
                    )}
                    {layaway.client.email && (
                      <p className="mb-1">Correo electrónico: {layaway.client.email}</p>
                    )}
                  </CCol>
                  <CCol md="6" className="mb-3">
                    <h5>Detalles</h5>
                    <p className="mb-1">Fecha de Creación: {formatDate(layaway.createdAt)}</p>
                    {layaway.paymentDueDate && (
                      <p className="mb-1">Fecha Límite de Pago: {formatDate(layaway.paymentDueDate)}</p>
                    )}
                    {layaway.notes && (
                      <p className="mb-1">Notas: {layaway.notes}</p>
                    )}
                  </CCol>
                </CRow>

                <CRow>
                  <CCol md="12" className="mb-3">
                    <h5>Artículos</h5>
                    <CTable small bordered hover className="mt-2">
                      <CTableHead>
                        <CTableRow>
                          <CTableHeaderCell>Nombre</CTableHeaderCell>
                          <CTableHeaderCell>Cantidad</CTableHeaderCell>
                          <CTableHeaderCell>Precio Unitario</CTableHeaderCell>
                          <CTableHeaderCell>Subtotal</CTableHeaderCell>
                        </CTableRow>
                      </CTableHead>
                      <CTableBody>
                        {layaway.items?.map((item, index) => (
                          <CTableRow key={index}>
                            <CTableDataCell>{item.name}</CTableDataCell>
                            <CTableDataCell>{item.units}</CTableDataCell>
                            <CTableDataCell>{formatCurrency(item.price)}</CTableDataCell>
                            <CTableDataCell>{formatCurrency(item.price * item.units)}</CTableDataCell>
                          </CTableRow>
                        ))}
                      </CTableBody>
                    </CTable>
                  </CCol>
                </CRow>

                <CRow className="mb-2">
                  <CCol md="4">
                    <div className="border rounded p-3">
                      <h5 className="mb-3">Monto Total</h5>
                      <div className="fs-3 fw-bold">{formatCurrency(layaway.totalAmount)}</div>
                    </div>
                  </CCol>
                  <CCol md="4">
                    <div className="border rounded p-3">
                      <h5 className="mb-3">Pagado</h5>
                      <div className="fs-3 fw-bold">{formatCurrency(layaway.paidAmount)}</div>
                    </div>
                  </CCol>
                  <CCol md="4">
                    <div className="border rounded p-3">
                      <h5 className="mb-3">Saldo Restante</h5>
                      <div className="fs-3 fw-bold">{formatCurrency(layaway.remainingAmount)}</div>
                    </div>
                  </CCol>
                </CRow>

                <CRow className="mt-4">
                  <CCol md="12">
                    <h5>Progreso de Pago</h5>
                    <CProgress value={getPaymentProgress()} className="mt-2" height={30}>
                      <div className="fw-bold text-center" style={{ lineHeight: '30px' }}>
                        {getPaymentProgress()}%
                      </div>
                    </CProgress>
                    {isFullyPaid && (
                      <CAlert color="success" className="mt-3 mb-0">
                        ¡Este plan separe está completamente pagado!
                      </CAlert>
                    )}
                  </CCol>
                </CRow>
              </CCardBody>
              <CCardFooter>
                <CRow>
                  <CCol className="text-end">
                    {showDeliverButton && (
                      <CButton
                        color="success"
                        onClick={handleDeliver}
                        disabled={saving}
                        className="me-2"
                      >
                        Marcar como Entregado
                      </CButton>
                    )}
                    {showAddPaymentButton && (
                      <CButton
                        color="primary"
                        onClick={handleAddPayment}
                        disabled={saving}
                        className="me-2"
                      >
                        <CIcon icon={cilPlus} size="sm" className="me-1" /> Agregar Pago
                      </CButton>
                    )}
                    {isActive && (
                      <CButton
                        color="danger"
                        variant="outline"
                        onClick={handleConfirmCancel}
                        disabled={saving}
                        className="me-2"
                      >
                        Cancelar plan separe
                      </CButton>
                    )}
                  </CCol>
                </CRow>
              </CCardFooter>
            </CCard>

            {/* Payment History */}
            <CCard className="shadow border-10 mb-4">
              <CCardHeader>
                <h4>Historial de Pagos</h4>
              </CCardHeader>
              <CCardBody>
                {payments?.length === 0 ? (
                  <CAlert color="info">
                    No hay pagos registrados para este plan separe
                  </CAlert>
                ) : (
                  <CTable striped bordered hover>
                    <CTableHead>
                      <CTableRow>
                        <CTableHeaderCell>Fecha</CTableHeaderCell>
                        <CTableHeaderCell>Monto</CTableHeaderCell>
                        <CTableHeaderCell>Descripción</CTableHeaderCell>
                      </CTableRow>
                    </CTableHead>
                    <CTableBody>
                      {payments?.map((payment, index) => (
                        <CTableRow key={index}>
                          <CTableDataCell>{formatDate(payment.createdAt)}</CTableDataCell>
                          <CTableDataCell>{formatCurrency(payment.amount)}</CTableDataCell>
                          <CTableDataCell>{payment.description || 'N/A'}</CTableDataCell>
                        </CTableRow>
                      ))}
                    </CTableBody>
                  </CTable>
                )}
              </CCardBody>
            </CCard>
          </>
        )}
      </CContainer>

      {/* Add Payment Modal */}
      <CModal visible={showPaymentModal} onClose={() => setShowPaymentModal(false)}>
        <CModalHeader>Agregar Pago</CModalHeader>
        <CModalBody>
          <CRow className="mb-3">
            <CCol md="12">
              <CFormLabel>Monto*</CFormLabel>
              <CurrencyFormInput
                name="amount"
                value={newPayment.amount}
                onChange={handlePaymentChange}
                invalid={paymentValidation.amount}
                disabled={saving}
              />
              {paymentValidation.amount && (
                <div className="invalid-feedback d-block">
                  {!newPayment.amount ? 'El monto es requerido' :
                    parseFloat(newPayment.amount) <= 0 ? 'El monto debe ser mayor a cero' :
                      'El monto no puede ser mayor al saldo restante'}
                </div>
              )}
            </CCol>
          </CRow>
          <CRow className="mb-3">
            <CCol md="12">
              <CFormLabel>Método de pago*</CFormLabel>
              <CFormSelect
                name="paymentMethod"
                value={newPayment.paymentMethod}
                onChange={handlePaymentChange}
                invalid={paymentValidation.paymentMethod}
                disabled={saving}
              >
                <option value="">Seleccionar método de pago</option>
                <option value="CASH">EFECTIVO</option>
                <option value="TRANSFER">TRANSFERENCIA</option>
              </CFormSelect>
              {paymentValidation.paymentMethod && (
                <div className="invalid-feedback d-block">
                  El método de pago es requerido
                </div>
              )}
            </CCol>
          </CRow>
        </CModalBody>
        <CModalFooter>
          <CButton
            color="secondary"
            onClick={() => setShowPaymentModal(false)}
            disabled={saving}
          >
            Cancelar
          </CButton>
          <CButton
            color="primary"
            onClick={submitPayment}
            disabled={saving}
          >
            {saving ? (
              <>
                <CSpinner size="sm" className="me-2" />
                Guardando...
              </>
            ) : (
              'Guardar Pago'
            )}
          </CButton>
        </CModalFooter>
      </CModal>

      {/* Confirm Cancel Dialog */}
      <ConfirmDialog
        ref={confirmDialogRef}
        onResponse={handleResponseCancel}
        title="Cancelar Plan Separe"
        message="¿Está seguro que desea cancelar este plan separe? Esta acción no se puede deshacer."
      />
    </>
  );
}

export default LayawayDetail;
