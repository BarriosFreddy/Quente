import { BranchOfficeService } from '../../services/branch-office.service';
import { Request, Response } from 'express';
import { container } from 'tsyringe';
import { BranchOffice } from '../../entities/BranchOffice';
import { setTenantIdToService } from '../../../../helpers/util';

const branchOfficeService = container.resolve(BranchOfficeService);

class BranchOfficesController {
  async findAll(_req: Request, res: Response) {
    const branchOffices = await setTenantIdToService(
      res,
      branchOfficeService,
    ).findAll();
    res.status(200).send(branchOffices);
  }

  async findOne(req: Request, res: Response) {
    const { id } = req.params;
    const branchOffice = await setTenantIdToService(
      res,
      branchOfficeService,
    ).findOne(id);
    res.status(200).send(branchOffice);
  }

  async save(req: Request, res: Response) {
    const branchOffice: BranchOffice = req.body;
    const savedBranchOffice = await setTenantIdToService(
      res,
      branchOfficeService,
    ).save(branchOffice);
    res.status(201).send(savedBranchOffice);
  }

  async update(req: Request, res: Response) {
    const { id } = req.params;
    const branchOffice: BranchOffice = req.body;
    const savedBranchOffice = await setTenantIdToService(
      res,
      branchOfficeService,
    ).update(id, branchOffice);
    savedBranchOffice
      ? res.status(201).send(savedBranchOffice)
      : res.status(400).send('Something went wrong');
  }
}

const branchOfficeController = new BranchOfficesController();
export default branchOfficeController;
