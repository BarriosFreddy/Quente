import React, { useState, useEffect, useRef, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import isOnline from "is-online";
import {
  CCard,
  CCardFooter,
  CContainer,
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
  CCardHeader,
  CCollapse,
  CFormLabel,
  CFormInput,
  CFormSelect,
  CInputGroup,
  CInputGroupText,
} from "@coreui/react";
import { formatCurrency, formatDate } from "@/utils";
import { getBillings, updateBillingStatus, clearBillingsCache } from "../services/billings.service";
import BillingStatus from "../../../shared/enums/BillingStatus";
import { setBillings } from "../reducers/billings.reducer";
import { Helmet } from "react-helmet";
import CIcon from "@coreui/icons-react";
import { cilArrowLeft, cilPrint, cilTrash, cilZoom, cilFilter, cilFilterX } from "@coreui/icons";
import { PDFViewer } from "@react-pdf/renderer";
import BillingTemplate from "./print-templates/BillingTemplate";
import ConfirmDialog from "../../../shared/components/ConfirmDialog";
import { useDidUpdateControl } from "@/hooks/useDidUpdateControl";
import { sendToast } from "@/shared/services/notification.service";

export const { LISTING, DETAILING, PRINTING } = {
  LISTING: "L",
  DETAILING: "D",
  PRINTING: "P",
};

function BillingsHistorical() {
  const confirmDialogRef = useRef();
  const dispatch = useDispatch();
  // Get billings from Redux store with a default empty array for safety
  const billings = useSelector((state) => state.billing.billings || []);
  const { organization } = useSelector((state) => state.auth.infoUser) ?? {};
  const billingsOffline = useSelector(
    (state) => state.billing.offline.billings
  );
  const saving = useSelector((state) => state.billing.saving);
  const saveSuccess = useSelector((state) => state.billing.saveSuccess);
  const fetching = useSelector((state) => state.billing.fetching);
  
  // State management
  let [billing, setBilling] = useState(null);
  let [page, setPage] = useState(1);
  let [currentAction, setCurrentAction] = useState(LISTING);
  let [isUpdating, setIsUpdating] = useState(false);
  const [billingToCancel, setBillingToCancel] = useState(null);
  
  // Filter panel state
  const [filterVisible, setFilterVisible] = useState(false);
  const [filters, setFilters] = useState({
    fromDate: '',
    toDate: '',
    status: '',
    code: ''
  });
  
  // Active filters indicator
  const hasActiveFilters = useMemo(() => {
    return Object.values(filters).some(val => val !== '');
  }, [filters]);

  useDidUpdateControl(
    () => {
      if (saveSuccess) {
        sendToast(dispatch, { message: "Factura cancelada exitosamente!" });
        return
      }
      sendToast(dispatch, {
        message: "No se pudo cancelar la factura",
        color: "danger",
      });
    },
    saving,
    [saveSuccess]
  );
  // Handle filter changes
  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };
  
  // Apply filters
  const applyFilters = () => {
    setPage(1); // Reset to first page when filtering
    
    // Validate date range if both dates are provided
    if (filters.fromDate && filters.toDate) {
      // Use UTC dates for consistent comparison
      const fromDate = new Date(filters.fromDate);
      const toDate = new Date(filters.toDate);
      
      // Reset time part for date-only comparison
      fromDate.setUTCHours(0, 0, 0, 0);
      toDate.setUTCHours(0, 0, 0, 0);
      
      if (toDate < fromDate) {
        sendToast(dispatch, {
          message: "La fecha final debe ser mayor o igual a la fecha inicial",
          color: "danger",
        });
        return;
      }
    }
    
    // Ensure dates are in proper format with timezone handling
    const filterParams = {
      page: 1,
      status: filters.status || null,
      code: filters.code || null,
      // Only include date filters if they have values
      fromDate: filters.fromDate ? filters.fromDate : null, 
      toDate: filters.toDate ? filters.toDate : null,
      // Force cache refresh when applying filters
      useCache: false
    };
    
    dispatch(getBillings(filterParams));
  };
  
  // Clear all filters
  const clearFilters = () => {
    setFilters({
      fromDate: '',
      toDate: '',
      status: '',
      code: ''
    });
    setPage(1);
    clearBillingsCache(); // Clear the cache when resetting filters
    dispatch(getBillings({ page: 1 }));
  };
  
  // Toggle filter panel visibility
  const toggleFilterPanel = () => {
    setFilterVisible(!filterVisible);
  };
  
  // Load billings on component mount
  useEffect(() => {
    dispatch(getBillings());
  }, [dispatch]);

  useEffect(() => {
    (async () => {
      const isonline = await isOnline();
      if (!isonline) {
        dispatch(setBillings(billingsOffline));
      }
    })();
  }, [dispatch, billingsOffline]);

  // Helper function to create filter parameters for consistency
  const getFilterParams = (pageNum) => {
    return {
      page: pageNum,
      status: filters.status || null,
      code: filters.code || null,
      fromDate: filters.fromDate || null,
      toDate: filters.toDate || null
    };
  };

  const handlePrevPage = async () => {
    const newPage = page === 1 ? 1 : page - 1;
    setPage(newPage);
    dispatch(getBillings(getFilterParams(newPage)));
  };

  const handleNextPage = async () => {
    const newPage = page + 1;
    setPage(newPage);
    dispatch(getBillings(getFilterParams(newPage)));
  };

  const handleDetail = (billing) => {
    setBilling(billing);
    setCurrentAction(DETAILING);
  };

  const handlePrint = (billing) => {
    setBilling(billing);
    setCurrentAction(PRINTING);
  };

  const handleBack = () => {
    setBilling(null);
    setCurrentAction(LISTING);
  };


  const handleCancel = (billing) => {
    setBillingToCancel(billing);
    confirmDialogRef.current.show(true);
  };

  const handleResponseCancelBilling = async (sureCancel) => {
    if (sureCancel) {
      setIsUpdating(true);
      try {
        await dispatch(updateBillingStatus(billingToCancel._id, BillingStatus.CANCELED));

        // If we're in the detail view, update the current billing
        setBilling({ ...billingToCancel, status: BillingStatus.CANCELED });
        confirmDialogRef.current.show(false);
        dispatch(getBillings());
      } catch (error) {
        console.error('Error updating billing status:', error);
      } finally {
        setIsUpdating(false);
      }
    }
  };

  return (
    <>
      <CContainer>
        <Helmet>
          <title>HISTORIAL DE FACTURAS</title>
        </Helmet>
        <CCard className="shadow border-10">
          <CCardHeader>
            <CRow>
              <CCol xs="2" lg="3">
                {[DETAILING, PRINTING].includes(currentAction) && (
                  <CButton
                    variant="outline"
                    color="info"
                    onClick={() => handleBack()}
                  >
                    <div className="d-none d-lg-block">Regresar</div>
                    <div className="d-lg-none">
                      <CIcon icon={cilArrowLeft} size="sm" />
                    </div>
                  </CButton>
                )}
                
                {currentAction === LISTING && (
                  <CButton
                    variant="outline"
                    color={hasActiveFilters ? "success" : "info"}
                    onClick={toggleFilterPanel}
                  >
                    <div className="d-none d-lg-block">{filterVisible ? 'Ocultar Filtros' : 'Filtros'}</div>
                    <div className="d-lg-none">
                      <CIcon icon={filterVisible ? cilFilterX : cilFilter} size="sm" />
                    </div>
                  </CButton>
                )}
              </CCol>
              <CCol xs="8" lg="6" className="text-center">
                HISTORIAL
              </CCol>
              <CCol xs="2" lg="3" className="text-end">
                {[DETAILING].includes(currentAction) && (
                  <CButton
                    variant="outline"
                    color="secondary"
                    onClick={() => handlePrint(billing)}
                  >
                    <div className="d-none d-lg-block">Imprimir</div>
                    <div className="d-lg-none">
                      <CIcon icon={cilPrint} size="sm" />
                    </div>
                  </CButton>
                )}
                
                {currentAction === LISTING && hasActiveFilters && (
                  <CButton
                    variant="outline"
                    color="danger"
                    onClick={clearFilters}
                  >
                    <div className="d-none d-lg-block">Limpiar</div>
                    <div className="d-lg-none">
                      <CIcon icon={cilFilterX} size="sm" />
                    </div>
                  </CButton>
                )}
              </CCol>
            </CRow>
          </CCardHeader>
          <CCardBody>
            <CContainer className="mt--6" fluid>
              {/* Filter Panel - Collapsible */}
              {currentAction === LISTING && (
                <CCollapse visible={filterVisible}>
                  <CCard className="mb-4 shadow-sm border-0">
                    <CCardBody>
                      <h6 className="mb-3">Filtros de Búsqueda</h6>
                      <CRow className="g-3">
                        {/* Date Range Filter */}
                        <CCol xs="12" md="6" lg="3">
                          <CFormLabel>Desde</CFormLabel>
                          <CFormInput
                            type="date"
                            name="fromDate"
                            value={filters.fromDate}
                            onChange={handleFilterChange}
                          />
                        </CCol>
                        <CCol xs="12" md="6" lg="3">
                          <CFormLabel>Hasta</CFormLabel>
                          <CFormInput
                            type="date"
                            name="toDate"
                            value={filters.toDate}
                            onChange={handleFilterChange}
                          />
                        </CCol>
                        
                        {/* Status Filter */}
                        <CCol xs="12" md="6" lg="3">
                          <CFormLabel>Estado</CFormLabel>
                          <CFormSelect
                            name="status"
                            value={filters.status}
                            onChange={handleFilterChange}
                          >
                            <option value="">Todos</option>
                            <option value={BillingStatus.APPROVED}>Aprobado</option>
                            <option value={BillingStatus.CANCELED}>Cancelado</option>
                          </CFormSelect>
                        </CCol>
                        
                        {/* Code Filter */}
                        <CCol xs="12" md="6" lg="3">
                          <CFormLabel>Código</CFormLabel>
                          <CFormInput
                            type="text"
                            name="code"
                            value={filters.code}
                            onChange={handleFilterChange}
                            placeholder="Buscar por código"
                          />
                        </CCol>
                        
                        {/* Apply Filters Button */}
                        <CCol xs="12" className="d-flex justify-content-end mt-3">
                          <CButton 
                            color="primary" 
                            onClick={applyFilters}
                            disabled={fetching}
                          >
                            {fetching ? 'Aplicando...' : 'Aplicar Filtros'}
                          </CButton>
                        </CCol>
                      </CRow>
                    </CCardBody>
                  </CCard>
                </CCollapse>
              )}
              <CRow>
                {currentAction === LISTING && (
                  <CCol>
                    <>
                      <div className="d-lg-none">
                        {Array.isArray(billings) && billings.length > 0 ?
                          billings.map((billing, index) => (
                            <CCard
                              key={index}
                              style={{
                                width: "auto",
                                cursor: "pointer",
                              }}
                              className="my-2"
                              onClick={() => handleDetail(billing)}
                            >
                              <CCardBody>
                                <CRow className="g-0">
                                  <CCol xs="4">
                                    <h6>Fecha:</h6>
                                  </CCol>
                                  <CCol xs="8">
                                    <CRow>{formatDate(billing.createdAt)}</CRow>
                                    <CRow>{billing.code}</CRow>
                                    <CRow>
                                      Productos: {billing.items?.length}
                                    </CRow>
                                  </CCol>
                                  <CCol xs="8">
                                    {formatCurrency(billing.total)}
                                  </CCol>
                                </CRow>
                              </CCardBody>
                            </CCard>
                          ))
                          : 
                          <div className="text-center p-4">No hay facturas para mostrar</div>
                        }
                      </div>
                      <div className="d-none d-lg-block">
                        <CTable hover>
                          <CTableHead>
                            <CTableRow>
                              <CTableHeaderCell>Fecha</CTableHeaderCell>
                              <CTableHeaderCell>Código</CTableHeaderCell>
                              <CTableHeaderCell>
                                N° de productos
                              </CTableHeaderCell>
                              <CTableHeaderCell>Total</CTableHeaderCell>
                              <CTableHeaderCell>Estado</CTableHeaderCell>
                              <CTableHeaderCell>Acciones</CTableHeaderCell>
                            </CTableRow>
                          </CTableHead>
                          <CTableBody>
                            {Array.isArray(billings) && billings.length > 0 ? 
                              billings.map((billing, index) => (
                                <CTableRow key={index}>
                                  <CTableDataCell
                                    xs="12"
                                    className="text-uppercase"
                                  >
                                    {formatDate(billing.createdAt)}
                                  </CTableDataCell>
                                  <CTableDataCell className="fs-6">
                                    {billing.code
                                      ? billing.code
                                      : "No Disponible"}
                                  </CTableDataCell>
                                  <CTableDataCell>
                                    {billing.items?.length}
                                  </CTableDataCell>
                                  <CTableDataCell>
                                    {formatCurrency(billing.total || billing.billAmount)}
                                  </CTableDataCell>
                                  <CTableDataCell>
                                    {billing.status === BillingStatus.APPROVED ? (
                                      <span className="text-success">APROBADA</span>
                                    ) : (
                                      <span className="text-danger">CANCELADA</span>
                                    )}
                                  </CTableDataCell>
                                  <CTableDataCell>
                                    <CButton
                                      size="sm"
                                      variant="outline"
                                      color="info"
                                      onClick={() => handleDetail(billing)}
                                    >
                                      <CIcon icon={cilZoom} size="sm" />
                                      &nbsp; Detalle
                                    </CButton>
                                    &nbsp;
                                    <CButton
                                      size="sm"
                                      variant="outline"
                                      color="secondary"
                                      onClick={() => handlePrint(billing)}
                                    >
                                      <CIcon icon={cilPrint} size="sm" />
                                      &nbsp; Imprimir
                                    </CButton>
                                    &nbsp;
                                    {billing.status !== BillingStatus.CANCELED && (
                                      <CButton
                                        size="sm"
                                        variant="outline"
                                        color="danger"
                                        onClick={() => handleCancel(billing)}
                                        disabled={isUpdating || saving}
                                      >
                                        <CIcon icon={cilTrash} size="sm" />
                                        &nbsp; Cancelar
                                      </CButton>
                                    )}
                                  </CTableDataCell>
                                </CTableRow>
                              ))
                              : (
                                <CTableRow>
                                  <CTableDataCell colSpan="6" className="text-center p-4">
                                    No hay facturas para mostrar
                                  </CTableDataCell>
                                </CTableRow>
                              )
                            }
                          </CTableBody>
                        </CTable>
                      </div>

                      <CCardFooter className="py-4">
                        <CRow>
                          <CCol>
                            <div className="d-grid col-12 mx-auto">
                              <CButton
                                type="button"
                                variant="outline"
                                color="secondary"
                                onClick={handlePrevPage}
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
                                onClick={handleNextPage}
                              >
                                SIGUIENTE
                              </CButton>
                            </div>
                          </CCol>
                        </CRow>
                      </CCardFooter>
                    </>
                  </CCol>
                )}
                {currentAction === PRINTING && (
                  <>
                    <PDFViewer width="100%" height="550px">
                      <BillingTemplate
                        billing={billing}
                        organization={organization}
                      />
                    </PDFViewer>
                  </>
                )}
                {currentAction === DETAILING && (
                  <CCol>
                    <CTable small hover>
                      <CTableBody>
                        <CTableRow>
                          <CTableHeaderCell lg="2">Fecha</CTableHeaderCell>
                          <CTableDataCell>
                            {formatDate(billing.createdAt)}
                          </CTableDataCell>
                          <CTableHeaderCell lg="3">Código</CTableHeaderCell>
                          <CTableDataCell colSpan={2}>
                            {billing.code}
                          </CTableDataCell>
                        </CTableRow>
                        <CTableRow>
                          <CTableHeaderCell>Estado</CTableHeaderCell>
                          <CTableDataCell colSpan={4}>
                            {billing.status === BillingStatus.APPROVED ? (
                              <>
                                <span className="text-success">APROBADA</span>
                                {billing.status === BillingStatus.APPROVED && (
                                  <CButton
                                    size="sm"
                                    variant="outline"
                                    color="danger"
                                    onClick={() => handleCancel(billing)}
                                    disabled={isUpdating}
                                    className="ms-3"
                                  >
                                    <CIcon icon={cilTrash} size="sm" />
                                    &nbsp; Cancelar
                                  </CButton>
                                )}
                              </>
                            ) : (
                              <span className="text-danger">CANCELADA</span>
                            )}
                          </CTableDataCell>
                        </CTableRow>
                        <CTableRow>
                          <CTableHeaderCell colSpan={5}>Items</CTableHeaderCell>
                        </CTableRow>
                        {billing.items?.map(
                          (
                            { _id, name, units, price, measurementUnit },
                            index
                          ) => (
                            <CTableRow key={index}>
                              <CTableDataCell colSpan={2}>
                                {name}
                              </CTableDataCell>
                              <CTableDataCell colSpan={2}>
                                {units + " " + measurementUnit}
                              </CTableDataCell>
                              <CTableDataCell colSpan={2}>
                                {price}
                              </CTableDataCell>
                            </CTableRow>
                          )
                        )}
                        <CTableRow>
                          <CTableHeaderCell
                            className="text-end fs-4"
                            colSpan={5}
                          >
                            Total {formatCurrency(billing.billAmount)}
                          </CTableHeaderCell>
                        </CTableRow>
                      </CTableBody>
                    </CTable>
                  </CCol>
                )}
              </CRow>
            </CContainer>
          </CCardBody>
        </CCard>
      </CContainer>
      <ConfirmDialog
        ref={confirmDialogRef}
        onResponse={handleResponseCancelBilling}
        message="¿Estás seguro que quieres cancelar esta factura?"
      ></ConfirmDialog>
    </>
  );
}

export default BillingsHistorical;
