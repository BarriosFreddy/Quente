import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import {
  CButton,
  CCard,
  CCardBody,
  CCardHeader,
  CCol,
  CContainer,
  CRow,
  CSpinner,
  CTable,
  CTableBody,
  CTableDataCell,
  CTableHead,
  CTableHeaderCell,
  CTableRow,
  CFormInput,
  CBadge
} from '@coreui/react';
import CIcon from '@coreui/icons-react';
import { cilPlus, cilPencil, cilCheck, cilX, cilSearch, cilTrash } from '@coreui/icons';
import { 
  fetchOrganizations,
  activateOrganization,
  deactivateOrganization
} from '../slices/organizationSlice';
import { Organization, OrganizationStatus } from '../../../shared/models/organization.model';
import { RootState } from '../../../store/store';

const OrganizationList: React.FC = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  
  const { organizations, loading, error } = useSelector((state: RootState) => state.organizations);
  
  useEffect(() => {
    dispatch(fetchOrganizations());
  }, [dispatch]);
  
  const handleCreateOrganization = () => {
    navigate('/admin/organizaciones/nueva');
  };
  
  const handleEditOrganization = (id: string) => {
    navigate(`/admin/organizaciones/editar/${id}`);
  };
  
  const handleActivateOrganization = (id: string) => {
    dispatch(activateOrganization(id));
  };
  
  const handleDeactivateOrganization = (id: string) => {
    dispatch(deactivateOrganization(id));
  };
  
  const filteredOrganizations = organizations.filter(org => 
    org.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    org.nit.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  const getStatusBadge = (status: OrganizationStatus) => {
    switch(status) {
      case OrganizationStatus.ACTIVE:
        return <CBadge color="success">Activa</CBadge>;
      case OrganizationStatus.INACTIVE:
        return <CBadge color="danger">Inactiva</CBadge>;
      case OrganizationStatus.CREATING:
        return <CBadge color="warning">Creando</CBadge>;
      default:
        return <CBadge color="info">Desconocido</CBadge>;
    }
  };
  
  if (loading) {
    return (
      <div className="d-flex justify-content-center mt-5">
        <CSpinner />
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="mt-3">
        <h6 className="text-danger">Error: {error}</h6>
        <CButton color="primary" onClick={() => dispatch(fetchOrganizations())}>
          Reintentar
        </CButton>
      </div>
    );
  }
  
  return (
    <CCard>
      <CCardHeader>
        <CRow className="align-items-center justify-content-between">
          <CCol>
            <h5 className="mb-0">Administración de Organizaciones</h5>
          </CCol>
          <CCol xs="auto">
            <CButton 
              color="primary"
              onClick={handleCreateOrganization}
            >
              <CIcon icon={cilPlus} className="me-2" />
              Nueva Organización
            </CButton>
          </CCol>
        </CRow>
      </CCardHeader>
      <CCardBody>
        <CRow className="mb-3">
          <CCol>
            <CFormInput
              placeholder="Buscar por nombre o NIT..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              startIcon={<CIcon icon={cilSearch} />}
            />
          </CCol>
        </CRow>
        
        <CTable hover responsive>
          <CTableHead>
            <CTableRow>
              <CTableHeaderCell>Nombre</CTableHeaderCell>
              <CTableHeaderCell>NIT</CTableHeaderCell>
              <CTableHeaderCell>Ubicación</CTableHeaderCell>
              <CTableHeaderCell>Estado</CTableHeaderCell>
              <CTableHeaderCell>Acciones</CTableHeaderCell>
            </CTableRow>
          </CTableHead>
          <CTableBody>
            {filteredOrganizations.length === 0 ? (
              <CTableRow>
                <CTableDataCell colSpan={5} className="text-center">
                  No se encontraron organizaciones
                </CTableDataCell>
              </CTableRow>
            ) : (
              filteredOrganizations.map((org) => (
                <CTableRow key={org._id}>
                  <CTableDataCell>{org.name}</CTableDataCell>
                  <CTableDataCell>{org.nit}</CTableDataCell>
                  <CTableDataCell>{`${org.city}, ${org.country}`}</CTableDataCell>
                  <CTableDataCell>{getStatusBadge(org.status)}</CTableDataCell>
                  <CTableDataCell>
                    <CButton 
                      color="primary"
                      size="sm"
                      variant="ghost"
                      onClick={() => handleEditOrganization(org._id)}
                      className="me-2"
                    >
                      <CIcon icon={cilPencil} />
                    </CButton>
                    
                    {org.status === OrganizationStatus.ACTIVE ? (
                      <CButton 
                        color="danger"
                        size="sm"
                        variant="ghost"
                        onClick={() => handleDeactivateOrganization(org._id)}
                      >
                        <CIcon icon={cilX} />
                      </CButton>
                    ) : (
                      <CButton 
                        color="success"
                        size="sm"
                        variant="ghost"
                        onClick={() => handleActivateOrganization(org._id)}
                      >
                        <CIcon icon={cilCheck} />
                      </CButton>
                    )}
                  </CTableDataCell>
                </CTableRow>
              ))
            )}
          </CTableBody>
        </CTable>
      </CCardBody>
    </CCard>
  );
};

export default OrganizationList;
