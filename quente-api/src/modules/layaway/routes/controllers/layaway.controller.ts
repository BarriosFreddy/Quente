import { Request, Response } from 'express';
import { container } from 'tsyringe';
import { LayawayService } from '../../services/layaway.service';
import { LayawayPaymentService } from '../../services/layaway-payment.service';
import { LayawayStatus } from '../../db/schemas/layaway.schema';
import { setTenantIdToService } from '../../../../helpers/util';

const layawayService = container.resolve(LayawayService);
const layawayPaymentService = container.resolve(LayawayPaymentService);


export const createLayaway = async (req: Request, res: Response) => {
  try {
    const layawayData = req.body;
    await setTenantIdToService(res, layawayPaymentService)
    const layaway = await setTenantIdToService(res, layawayService).create(layawayData);
    
    return res.status(201).json(layaway);
  } catch (error) {
    console.error('Error creating layaway:', error);
    return res.status(500).json({ 
      message: 'Error al crear el plan separe',
      error
    });
  }
};

export const getLayaways = async (req: Request, res: Response) => {
  try {
    // Parse the page parameter
    const page = req.query.page ? parseInt(req.query.page as string, 10) : 1;
    
    
    // Process filters from the query string format the frontend is using
    const processedFilters: any = {};
    
    // Extract all query parameters
    const queryParams = req.query as any;
    console.log(JSON.stringify({  queryParams: req.query }), queryParams.filters);
    
    // Handle regular search and pagination parameters
    if (queryParams.search) {
      processedFilters.search = queryParams.search as string;
    }
    
    // Process date range filters (format: filters[dateRange][fromDate])
    if (queryParams.filters?.dateRange?.fromDate || queryParams.filters?.dateRange?.toDate) {
      processedFilters.dateRange = {};
      
      if (queryParams.filters?.dateRange?.fromDate) {
        processedFilters.dateRange.fromDate = queryParams.filters.dateRange.fromDate as string;
      }
      
      if (queryParams.filters?.dateRange?.toDate) {
        processedFilters.dateRange.toDate = queryParams.filters.dateRange.toDate as string;
      }
    }
    
    // Process status filter (format: filters[status])
    if (queryParams.filters?.status) {
      processedFilters.status = queryParams.filters.status as string;
    }

    console.log(  JSON.stringify({ processedFilters }));
    
    // Call service with processed filters
    const result = await setTenantIdToService(res, layawayService).findAllWithFilters({ 
      page: page, 
      filters: processedFilters
    });
    
    return res.status(200).json(result);
  } catch (error) {
    console.error('Error fetching layaways:', error);
    return res.status(500).json({ 
      message: 'Error al obtener los planes separe',
      error
    });
  }
};

export const getLayawayById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const layaway = await setTenantIdToService(res, layawayService).findOne(id);
    
    if (!layaway) {
      return res.status(404).json({ 
        message: `Plan separe con ID ${id} no encontrado` 
      });
    }
    
    return res.status(200).json(layaway);
  } catch (error) {
    console.error(`Error fetching layaway ${req.params.id}:`, error);
    return res.status(500).json({ 
      message: 'Error al obtener el plan separe',
      error
    });
  }
};

export const addPayment = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const paymentData = req.body;
    
    const updatedLayaway = await setTenantIdToService(res, layawayService).addPayment(id, paymentData);
    
    return res.status(200).json(updatedLayaway);
  } catch (error) {
    console.error(`Error adding payment to layaway ${req.params.id}:`, error);
    return res.status(500).json({ 
      message: 'Error al agregar el pago',
      error
    });
  }
};

export const getLayawayPayments = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const payments = await setTenantIdToService(res, layawayPaymentService).findByLayawayId(id);
    
    return res.status(200).json(payments);
  } catch (error) {
    console.error(`Error fetching payments for layaway ${req.params.id}:`, error);
    return res.status(500).json({ 
      message: 'Error al obtener los pagos del plan separe',
      error
    });
  }
};

export const updateLayawayStatus = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { status, reason } = req.body;
    
    let updatedLayaway;
    
    // Handle different status updates
    switch (status) {
      case LayawayStatus.DELIVERED:
        updatedLayaway = await setTenantIdToService(res, layawayService).markAsDelivered(id);
        break;
      case LayawayStatus.CANCELED:
        if (!reason) {
          return res.status(400).json({ 
            message: 'Se requiere una razón para cancelar el plan separe' 
          });
        }
        updatedLayaway = await setTenantIdToService(res, layawayService).cancel(id, reason);
        break;
      default:
        return res.status(400).json({ 
          message: `Actualización de estado a ${status} no soportada` 
        });
    }
    
    return res.status(200).json(updatedLayaway);
  } catch (error) {
    console.error(`Error updating layaway ${req.params.id} status:`, error);
    return res.status(500).json({ 
      message: 'Error al actualizar el estado del plan separe',
      error
    });
  }
};
