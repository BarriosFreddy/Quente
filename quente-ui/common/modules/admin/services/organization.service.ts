import { AxiosInstance } from 'axios';
import { ApiResponse } from '../../../shared/models/api-response.model';
import { Organization } from '../../../shared/models/organization.model';

export class OrganizationService {
  constructor(private axiosInstance: AxiosInstance) {}

  async getAll(): Promise<ApiResponse<Organization[]>> {
    try {
      const response = await this.axiosInstance.get<Organization[]>('/organizations');
      return {
        data: response.data,
        success: true
      };
    } catch (error) {
      console.error('Error fetching organizations:', error);
      return {
        success: false,
        error: 'Error al obtener organizaciones'
      };
    }
  }

  async getById(id: string): Promise<ApiResponse<Organization>> {
    try {
      const response = await this.axiosInstance.get<Organization>(`/organizations/${id}`);
      return {
        data: response.data,
        success: true
      };
    } catch (error) {
      console.error(`Error fetching organization with id ${id}:`, error);
      return {
        success: false,
        error: 'Error al obtener organización'
      };
    }
  }

  async create(organization: Partial<Organization>): Promise<ApiResponse<Organization>> {
    try {
      const response = await this.axiosInstance.post<Organization>('/organizations', organization);
      return {
        data: response.data,
        success: true
      };
    } catch (error) {
      console.error('Error creating organization:', error);
      return {
        success: false,
        error: 'Error al crear organización'
      };
    }
  }

  async update(id: string, organization: Partial<Organization>): Promise<ApiResponse<Organization>> {
    try {
      const response = await this.axiosInstance.put<Organization>(`/organizations/${id}`, organization);
      return {
        data: response.data,
        success: true
      };
    } catch (error) {
      console.error(`Error updating organization with id ${id}:`, error);
      return {
        success: false,
        error: 'Error al actualizar organización'
      };
    }
  }

  async updateStatus(id: string, status: string): Promise<ApiResponse<Organization>> {
    try {
      const response = await this.axiosInstance.patch<Organization>(`/organizations/${id}/status`, { status });
      return {
        data: response.data,
        success: true
      };
    } catch (error) {
      console.error(`Error updating organization status with id ${id}:`, error);
      return {
        success: false,
        error: 'Error al actualizar estado de la organización'
      };
    }
  }

  async activateOrganization(id: string): Promise<ApiResponse<Organization>> {
    try {
      const response = await this.axiosInstance.get<Organization>(`/organizations/${id}/active`);
      return {
        data: response.data,
        success: true
      };
    } catch (error) {
      console.error(`Error activating organization with id ${id}:`, error);
      return {
        success: false,
        error: 'Error al activar organización'
      };
    }
  }

  async deactivateOrganization(id: string): Promise<ApiResponse<Organization>> {
    try {
      const response = await this.axiosInstance.get<Organization>(`/organizations/${id}/inactive`);
      return {
        data: response.data,
        success: true
      };
    } catch (error) {
      console.error(`Error deactivating organization with id ${id}:`, error);
      return {
        success: false,
        error: 'Error al desactivar organización'
      };
    }
  }
}
