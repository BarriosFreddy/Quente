import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
    CButton, CCard, CCardBody, CCardHeader, CCol, CFormInput, CFormLabel, CFormSelect, CInputGroup, CCollapse, CTable,
    CTableBody,
    CTableDataCell,
    CTableFoot,
    CTableHead,
    CTableHeaderCell,
    CTableRow,
    CBadge,
} from '@coreui/react';
import { formatCurrency, formatDate } from '@/utils';
import { sendWarningToast } from '@/shared/services/notification.service';
import { CRow } from '@coreui/react';
import PropTypes from 'prop-types';
import CIcon from '@coreui/icons-react';
import {
    cilPlus,
    cilFilter,
    cilSearch,
    cilTrash
} from '@coreui/icons';


// Initial query parameters for pagination and filters
const queryParamsInitial = {
    page: 1,
    limit: 10
};

// Layaway statuses with colors
const LAYAWAY_STATUSES = {
    ACTIVE: { label: "ACTIVO", color: "primary" },
    DELIVERED: { label: "ENTREGADO", color: "success" },
    CANCELED: { label: "CANCELADO", color: "danger" }
};

function LayawayList(props) {
    const dispatch = useDispatch();
    const [searchTerm, setSearchTerm] = useState("");
    const [showFilterSection, setShowFilterSection] = useState(false);
    const [queryParams, setQueryParams] = useState(queryParamsInitial);
    const [filters, setFilters] = useState({
        status: "",
        startDate: "",
        endDate: ""
    });

    // Redux state
    const layaways = useSelector((state) => state.layaways.layaways);
    const fetching = useSelector((state) => state.layaways.fetching);
    const pagination = useSelector((state) => state.layaways.pagination);

    // Fetch layaways on component mount
    useEffect(() => {
        setSearchTerm("");
    }, []);

    // Handle search input changes
    const onChangeField = ({ target: { value } }) => setSearchTerm(value);

    // Handle key press in search field
    const onKeyDownSearchField = async ({ keyCode }) => {
        if ([ENTER_KEYCODE, TAB_KEYCODE].includes(keyCode))
            props.onSearch({ page: 1 });
    };

    // Create new layaway
    const handleNewLayaway = () => {
        props.onNew();
    };

    // Edit layaway
    const handleEditLayaway = (id) => {
        props.onEdit(id);
    };

    // Handle filter changes
    const handleChangeFilters = ({ target: { name, value } }) => {
        const updatedFilters = { ...filters, [name]: value };
        
        // Validate date ranges
        if (name === 'endDate' && updatedFilters.startDate && new Date(value) < new Date(updatedFilters.startDate)) {
            // If end date is before start date, show error
            sendWarningToast(dispatch, {
                message: 'La fecha final debe ser mayor o igual a la fecha inicial',
            });
            return; // Don't update the state with invalid date
        }
        
        setFilters(updatedFilters);
    };

    // Apply all filters
    const applyFilters = () => {
        const newParams = { ...queryParams, page: 1 };

        if (filters.status) {
            newParams.status = filters.status;
        }

        // Format date parameters as dateRange object
        if (filters.startDate || filters.endDate) {
            newParams.dateRange = {};
            
            if (filters.startDate) {
                newParams.dateRange.fromDate = filters.startDate;
            }
            
            if (filters.endDate) {
                newParams.dateRange.toDate = filters.endDate;
            }
        }

        props.onSearch(newParams);
    };

    // Reset all filters
    const resetFilters = () => {
        setFilters({
            status: "",
            startDate: "",
            endDate: ""
        });
        props.onSearch({ page: 1 });
    };

    // Pagination handlers
    const handlePrevPage = () => {
        const newParams = {
            ...queryParams,
            page: queryParams.page === 1 ? 1 : queryParams.page - 1,
        };
        props.onSearch(newParams);
    };

    const handleNextPage = () => {
        const newParams = {
            ...queryParams,
            page: queryParams.page + 1
        };
        props.onSearch(newParams);
    };

    // Clear search term
    const handleClear = () => {
        setSearchTerm("");
        const params = { page: 1 };
        props.onSearch(params);
    };

    // Toggle filter section
    const handleFilter = () => {
        setShowFilterSection(!showFilterSection);
    };

    // Calculate payment progress percentage
    const getPaymentProgress = (layaway) => {
        if (!layaway.totalAmount || layaway.totalAmount === 0) return 0;
        return Math.round((layaway.paidAmount / layaway.totalAmount) * 100);
    };

    // Handle search button click
    const handleSearch = (params = {}) => {
        const newParams = { ...params };
        if (searchTerm.trim()) {
            newParams.search = searchTerm.trim();
        }
        props.onSearch(newParams);
    };

    return (
        <CCard className="shadow border-10">
            <CCardHeader>
                <CRow>
                    <CCol xs="2" lg="2">
                        <CButton
                            variant="outline"
                            color="success"
                            onClick={handleNewLayaway}
                        >
                            <div className="d-none d-lg-block">NUEVO</div>
                            <div className="d-lg-none">
                                <CIcon icon={cilPlus} size="sm" />
                            </div>
                        </CButton>
                    </CCol>
                    <CCol xs="8" lg="8">
                        <CInputGroup>
                            <CFormInput
                                type="text"
                                name="searchTerm"
                                placeholder="Buscar por cliente, número de plan separe..."
                                value={searchTerm}
                                onChange={onChangeField}
                                onKeyDown={onKeyDownSearchField}
                            />
                            <CButton
                                type="button"
                                variant="outline"
                                color="primary"
                                onClick={() => handleSearch({ page: 1 })}
                            >
                                <div className="d-none d-lg-block">BUSCAR</div>
                                <div className="d-lg-none">
                                    <CIcon icon={cilSearch} size="sm" />
                                </div>
                            </CButton>
                            <CButton
                                type="button"
                                variant="outline"
                                color="secondary"
                                onClick={handleClear}
                            >
                                <div className="d-none d-lg-block">LIMPIAR</div>
                                <div className="d-lg-none">
                                    <CIcon icon={cilTrash} size="sm" />
                                </div>
                            </CButton>
                        </CInputGroup>
                    </CCol>
                    <CCol xs="2" lg="2" className="text-end">
                        <CButton
                            type="button"
                            variant={showFilterSection ? "" : "outline"}
                            color="info"
                            onClick={handleFilter}
                        >
                            <div className="d-none d-lg-block">FILTROS</div>
                            <div className="d-lg-none">
                                <CIcon icon={cilFilter} size="sm" />
                            </div>
                        </CButton>
                    </CCol>
                </CRow>

                {/* Filter section */}
                <CCollapse visible={showFilterSection}>
                    <CCard className="mt-3 mb-0">
                        <CCardBody>
                            <CRow className="mb-3">
                                <CCol md="3">
                                    <CFormLabel>Estado</CFormLabel>
                                    <CFormSelect
                                        name="status"
                                        value={filters.status}
                                        onChange={handleChangeFilters}
                                    >
                                        <option value="">Todos</option>
                                        <option value="ACTIVE">Activo</option>
                                        <option value="DELIVERED">Entregado</option>
                                        <option value="CANCELED">Cancelado</option>
                                    </CFormSelect>
                                </CCol>
                                <CCol md="3">
                                    <CFormLabel>Fecha Inicio</CFormLabel>
                                    <CFormInput
                                        type="date"
                                        name="startDate"
                                        value={filters.startDate}
                                        onChange={handleChangeFilters}
                                    />
                                </CCol>
                                <CCol md="3">
                                    <CFormLabel>Fecha Fin</CFormLabel>
                                    <CFormInput
                                        type="date"
                                        name="endDate"
                                        value={filters.endDate}
                                        onChange={handleChangeFilters}
                                    />
                                </CCol>
                            </CRow>
                            <CRow className="mb-3">
                                <CCol md="9" className="d-flex align-items-end">
                                    <CButton
                                        type="button"
                                        color="primary"
                                        className="me-2"
                                        onClick={applyFilters}
                                    >
                                        Aplicar Filtros
                                    </CButton>
                                    <CButton
                                        type="button"
                                        variant="outline"
                                        color="secondary"
                                        onClick={resetFilters}
                                    >
                                        Restablecer
                                    </CButton>
                                </CCol>
                            </CRow>
                        </CCardBody>
                    </CCard>
                </CCollapse>
            </CCardHeader>

            <CCardBody>
                {/* Mobile view */}
                <div className="d-lg-none">
                    {layaways?.map((layaway) => (
                        <CCard
                            key={layaway._id}
                            style={{ width: "auto", cursor: "pointer" }}
                            className="my-2"
                            onClick={() => viewLayaway(layaway._id)}
                        >
                            <CCardBody>
                                <CRow className="g-0">
                                    <CCol xs="8">
                                        <CRow className="fw-bold">{layaway.client?.name}</CRow>
                                        <CRow>{formatDate(layaway.createdAt)}</CRow>
                                    </CCol>
                                    <CCol xs="4" className="text-end">
                                        <CBadge color={LAYAWAY_STATUSES[layaway.status]?.color || 'secondary'} shape="rounded-pill">
                                            {LAYAWAY_STATUSES[layaway.status]?.label || layaway.status}
                                        </CBadge>
                                        <div className="fw-bold mt-2">
                                            {formatCurrency(layaway.totalAmount)}
                                        </div>
                                    </CCol>
                                </CRow>
                                <CRow className="mt-2">
                                    <CCol>
                                        <small>Pagado: {formatCurrency(layaway.paidAmount)} ({getPaymentProgress(layaway)}%)</small>
                                        <div className="progress">
                                            <div
                                                className={`progress-bar bg-${getPaymentProgress(layaway) === 100 ? 'success' : 'primary'}`}
                                                role="progressbar"
                                                style={{ width: `${getPaymentProgress(layaway)}%` }}
                                                aria-valuenow={getPaymentProgress(layaway)}
                                                aria-valuemin="0"
                                                aria-valuemax="100"
                                            ></div>
                                        </div>
                                    </CCol>
                                </CRow>
                            </CCardBody>
                        </CCard>
                    ))}
                    <CRow>
                        <CCol className="py-1 text-center">Página {pagination?.currentPage || 1} de {pagination?.totalPages || 1}</CCol>
                    </CRow>
                    <CRow>
                        <CCol>
                            <div className="d-grid col-12 mx-auto">
                                <CButton
                                    type="button"
                                    variant="outline"
                                    color="secondary"
                                    disabled={fetching || pagination?.currentPage <= 1}
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
                                    disabled={fetching || pagination?.currentPage >= pagination?.totalPages}
                                    onClick={handleNextPage}
                                >
                                    SIGUIENTE
                                </CButton>
                            </div>
                        </CCol>
                    </CRow>
                </div>

                {/* Desktop view */}
                <div className="d-none d-lg-block">
                    <CTable hover>
                        <CTableHead>
                            <CTableRow>
                                <CTableHeaderCell scope="col">Cliente</CTableHeaderCell>
                                <CTableHeaderCell scope="col">Fecha</CTableHeaderCell>
                                <CTableHeaderCell scope="col">Monto Total</CTableHeaderCell>
                                <CTableHeaderCell scope="col">Pagado</CTableHeaderCell>
                                <CTableHeaderCell scope="col">Progreso</CTableHeaderCell>
                                <CTableHeaderCell scope="col">Estado</CTableHeaderCell>
                                <CTableHeaderCell scope="col">Acciones</CTableHeaderCell>
                            </CTableRow>
                        </CTableHead>
                        <CTableBody>
                            {layaways?.map((layaway) => (
                                <CTableRow key={layaway._id}>
                                    <CTableDataCell className="text-capitalize text-break">
                                        {layaway.client?.name}
                                    </CTableDataCell>
                                    <CTableDataCell>{formatDate(layaway.createdAt)}</CTableDataCell>
                                    <CTableDataCell>{formatCurrency(layaway.totalAmount)}</CTableDataCell>
                                    <CTableDataCell>{formatCurrency(layaway.paidAmount)}</CTableDataCell>
                                    <CTableDataCell>
                                        <div className="progress">
                                            <div
                                                className={`progress-bar bg-${getPaymentProgress(layaway) === 100 ? 'success' : 'primary'}`}
                                                role="progressbar"
                                                style={{ width: `${getPaymentProgress(layaway)}%` }}
                                                aria-valuenow={getPaymentProgress(layaway)}
                                                aria-valuemin="0"
                                                aria-valuemax="100"
                                            >
                                                {getPaymentProgress(layaway)}%
                                            </div>
                                        </div>
                                    </CTableDataCell>
                                    <CTableDataCell>
                                        <CBadge color={LAYAWAY_STATUSES[layaway.status]?.color || 'secondary'} shape="rounded-pill">
                                            {LAYAWAY_STATUSES[layaway.status]?.label || layaway.status}
                                        </CBadge>
                                    </CTableDataCell>
                                    <CTableDataCell>
                                        <CButton
                                            size="sm"
                                            variant="outline"
                                            color="info"
                                            onClick={() => props.onSelect(layaway._id)}
                                        >
                                            VER DETALLES
                                        </CButton>
                                    </CTableDataCell>
                                </CTableRow>
                            ))}
                        </CTableBody>
                        <CTableFoot>
                            <CTableRow>
                                <CTableDataCell colSpan={7} className="text-center">
                                    Página {pagination?.currentPage || 1} de {pagination?.totalPages || 1} |
                                    Total: {pagination?.totalDocs || 0} planes separe
                                </CTableDataCell>
                            </CTableRow>
                            <CTableRow className="mt-2">
                                <CTableDataCell colSpan={7}>
                                    <CRow>
                                        <CCol className="text-start">
                                            <CButton
                                                type="button"
                                                variant="outline"
                                                color="secondary"
                                                disabled={fetching || pagination?.currentPage <= 1}
                                                onClick={handlePrevPage}
                                            >
                                                ANTERIOR
                                            </CButton>
                                        </CCol>
                                        <CCol className="text-end">
                                            <CButton
                                                type="button"
                                                variant="outline"
                                                color="secondary"
                                                disabled={fetching || pagination?.currentPage >= pagination?.totalPages}
                                                onClick={handleNextPage}
                                            >
                                                SIGUIENTE
                                            </CButton>
                                        </CCol>
                                    </CRow>
                                </CTableDataCell>
                            </CTableRow>
                        </CTableFoot>
                    </CTable>
                </div>
            </CCardBody>
        </CCard>
    );
}

LayawayList.propTypes = {
    onNew: PropTypes.func.isRequired,
    onSelect: PropTypes.func.isRequired,
    onEdit: PropTypes.func.isRequired,
    onSearch: PropTypes.func.isRequired,
};

export default LayawayList;