import { Request, Response } from 'express';
import { container } from 'tsyringe';
import { setTenantIdToService } from '../../../../helpers/util';
import { DashboardService } from '../../services/dashboard.service';

const dashboardService = container.resolve(DashboardService);

class DashboardController {
  async getDashboardStats(req: Request, res: Response) {
    const { startDate = new Date().toISOString().split('T')[0] } = req.query;
    const dashboardStats = await setTenantIdToService(
      res,
      dashboardService,
    ).getDashboardStats(startDate as string);
    res.status(200).send(dashboardStats);
  }
}

const dashboardController = new DashboardController();
export default dashboardController;
