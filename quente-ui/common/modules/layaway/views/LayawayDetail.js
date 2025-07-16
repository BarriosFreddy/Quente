import React, { useState, useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useParams, useNavigate } from 'react-router-dom';
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
  CFormInput,
  CFormSelect,
  CSpinner,
  CBadge,
  CAlert,
  CProgress,
  CTable,
  CTableHead,
  CTableBody,
  CTableRow,
  CTableHeaderCell,
  CTableDataCell
} from '@coreui/react';
import CIcon from '@coreui/icons-react';
import { cilPlus, cilArrowLeft } from '@coreui/icons';
import {
  getLayawayById,
  getLayawayPayments,
  addPayment,
  updateLayawayStatus
} from '../services/layaways.service';
import { formatCurrency, formatDate } from '@quente/common/utils';
import ConfirmDialog from '../../../shared/components/ConfirmDialog';
import CurrencyFormInput from '../../../shared/components/CurrencyFormInput';
import FormInput from '../../../shared/components/FormInput';

// Layaway statuses with colors and descriptions
const LAYAWAY_STATUSES = {
  ACTIVE: { label: 'ACTIVO', color: 'primary', description: 'El apartado está activo y pendiente de pagos.' },
  DELIVERED: { label: 'ENTREGADO', color: 'success', description: 'El apartado ha sido entregado al cliente.' },
  CANCELED: { label: 'CANCELADO', color: 'danger', description: 'El apartado ha sido cancelado.' }
};

function LayawayDetail() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { id } = useParams();

  // Redux state
  const layaway = useSelector((state) => state.layaways.layaway);
  const payments = useSelector((state) => state.layaways.payments);
  const fetching = useSelector((state) => state.layaways.fetching);
  const saving = useSelector((state) => state.layaways.saving);
  const addPaymentSuccess = useSelector((state) => state.layaways.addPaymentSuccess);
  const updateStatusSuccess = useSelector((state) => state.layaways.updateStatusSuccess);

  // Local state
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [newPayment, setNewPayment] = useState({ amount: '', description: '' });
  const [statusUpdate, setStatusUpdate] = useState({ status: '', reason: '' });
  const [paymentValidation, setPaymentValidation] = useState({ amount: false });
  const [statusValidation, setStatusValidation] = useState({ status: false });

  // Refs
  const confirmDialogRef = useRef();

  // Fetch layaway and payments data
  useEffect(() => {
    if (id) {
      dispatch(getLayawayById(id));
      dispatch(getLayawayPayments(id));
    }
  }, [dispatch, id]);

  // Reset payment form when modal is opened or when payment is successful
  useEffect(() => {
    if (addPaymentSuccess) {
      setShowPaymentModal(false);
      setNewPayment({ amount: '', description: '' });
    }
  }, [addPaymentSuccess]);

  // Reset status form when modal is opened or when status update is successful
  useEffect(() => {
    if (updateStatusSuccess) {
      setShowStatusModal(false);
      setStatusUpdate({ status: '', reason: '' });
    }
  }, [updateStatusSuccess]);

  // Calculate payment progress percentage
  const getPaymentProgress = () => {
    if (!layaway?.totalAmount || layaway.totalAmount === 0) return 0;
    return Math.round((layaway.paidAmount / layaway.totalAmount) * 100);
  };

  // Open payment modal
  const handleAddPayment = () => {
    setNewPayment({ amount: '', description: '' });
    setPaymentValidation({ amount: false });
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
    }
  };

  // Submit payment
  const submitPayment = () => {
    // Validate payment amount
    const amount = parseFloat(newPayment.amount);
    if (!amount || amount <= 0 || amount > layaway?.remainingAmount) {
      setPaymentValidation({ amount: true });
      return;
    }

    dispatch(addPayment(id, {
      amount,
      description: newPayment.description
    }));
  };

  // Open status update modal
  const handleUpdateStatus = () => {
    setStatusUpdate({ status: '', reason: '' });
    setStatusValidation({ status: false });
    setShowStatusModal(true);
  };

  // Handle status form changes
  const handleStatusChange = ({ target: { name, value } }) => {
    setStatusUpdate({ ...statusUpdate, [name]: value });
    if (name === 'status') {
      setStatusValidation({ ...statusValidation, status: !value });
    }
  };

  // Submit status update
  const submitStatusUpdate = () => {
    // Validate status
    if (!statusUpdate.status) {
      setStatusValidation({ status: true });
      return;
    }

    dispatch(updateLayawayStatus(id, statusUpdate));
  };

  // Handle cancel confirmation
  const handleConfirmCancel = () => {
    confirmDialogRef.current.show(true);
  };

  // Handle response from cancel confirmation dialog
  const handleResponseCancel = (confirm) => {
    if (confirm) {
      // Update status to CANCELED
      dispatch(updateLayawayStatus(id, { 
        status: 'CANCELED',
        reason: 'Cancelado por el usuario'
      }));
    }
    confirmDialogRef.current.show(false);
  };

  // Navigate back to layaways list
  const goBack = () => {
    navigate('/layaways');
  };

  // Check if layaway is fully paid
  const isFullyPaid = layaway?.remainingAmount === 0 && layaway?.totalAmount > 0;

  // Check if layaway can be delivered (fully paid and active)
  const canBeDelivered = isFullyPaid && layaway?.status === 'ACTIVE';

  // Check if layaway is active
  const isActive = layaway?.status === 'ACTIVE';

  // Determine whether to show the "Add Payment" button
  const showAddPaymentButton = isActive && !isFullyPaid;

  // Determine whether to show the "Mark as Delivered" button
  const showDeliverButton = canBeDelivered;

  return (
    <>
      <CContainer>
        {fetching ? (
          <div className="text-center my-5">
            <CSpinner />
          </div>
        ) : !layaway ? (
          <CAlert color="warning">No se encontró el apartado solicitado</CAlert>
        ) : (
          <>
            <CRow className="mb-3">
              <CCol className="d-flex align-items-center">
                <CButton 
                  color="link" 
                  className="p-0 me-3" 
                  onClick={goBack}
                >
                  <CIcon icon={cilArrowLeft} size="lg" />
                </CButton>
                <h2 className="mb-0">Detalles del Apartado</h2>
              </CCol>
              <CCol className="text-end">
                <CBadge 
                  color={LAYAWAY_STATUSES[layaway.status]?.color || 'secondary'} 
                  shape="rounded-pill"
                  size="lg"
                  className="px-3 py-2"
                >
                  {LAYAWAY_STATUSES[layaway.status]?.label || layaway.status}
                </CBadge>
              </CCol>
            </CRow>

            {/* Layaway Information */}
            <CCard className="shadow border-10 mb-4">
              <CCardHeader>
                <h4>Información del Apartado</h4>
              </CCardHeader>
              <CCardBody>
                <CRow>
                  <CCol md="6" className="mb-3">
                    <h5>Cliente</h5>
                    <p className="fs-5 mb-1">{layaway.customerName}</p>
                    {layaway.customerPhone && (
                      <p className="mb-1">Teléfono: {layaway.customerPhone}</p>
                    )}
                    {layaway.customerEmail && (
                      <p className="mb-1">Email: {layaway.customerEmail}</p>
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
                            <CTableDataCell>{item.quantity}</CTableDataCell>
                            <CTableDataCell>{formatCurrency(item.unitPrice)}</CTableDataCell>
                            <CTableDataCell>{formatCurrency(item.subtotal)}</CTableDataCell>
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
                      <div className="fw-bold text-center" style={{lineHeight: '30px'}}>
                        {getPaymentProgress()}%
                      </div>
                    </CProgress>
                    {isFullyPaid && (
                      <CAlert color="success" className="mt-3 mb-0">
                        ¡Este apartado está completamente pagado!
                      </CAlert>
                    )}
                  </CCol>
                </CRow>
              </CCardBody>
              <CCardFooter>
                <CRow>
                  <CCol className="text-end">
                    {isActive && (
                      <CButton
                        color="danger"
                        variant="outline"
                        onClick={handleConfirmCancel}
                        disabled={saving}
                        className="me-2"
                      >
                        Cancelar Apartado
                      </CButton>
                    )}
                    {showDeliverButton && (
                      <CButton
                        color="success"
                        onClick={() => {
                          setStatusUpdate({ status: 'DELIVERED', reason: '' });
                          dispatch(updateLayawayStatus(id, { status: 'DELIVERED' }));
                        }}
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
                      >
                        <CIcon icon={cilPlus} size="sm" className="me-1" /> Agregar Pago
                      </CButton>
                    )}
                  </CCol>
                </CRow>
              </CCardFooter>
            </CCard>

            {/* Payment History */}
            <CCard className="shadow border-10">
              <CCardHeader>
                <h4>Historial de Pagos</h4>
              </CCardHeader>
              <CCardBody>
                {payments?.length === 0 ? (
                  <CAlert color="info">
                    No hay pagos registrados para este apartado
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
              <CFormLabel>Descripción</CFormLabel>
              <FormInput
                type="textarea"
                rows="3"
                name="description"
                value={newPayment.description}
                onChange={handlePaymentChange}
                disabled={saving}
              />
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
        title="Cancelar Apartado"
        message="¿Está seguro que desea cancelar este apartado? Esta acción no se puede deshacer."
      />
    </>
  );
}

export default LayawayDetail;
