import { Request, Response } from 'express';
import { container } from 'tsyringe';
import { Organization } from '../../entities/Organization';
import { OrganizationService } from '../../services/organization.service';
import { setTenantIdToService } from '../../../../helpers/util';
import { OrganizationStatus } from '../../entities/enums/organization-status';

const organizationsService = container.resolve(OrganizationService);

class OrganizationsController {
  async findAll(_req: Request, res: Response) {
    const organizations = await setTenantIdToService(
      res,
      organizationsService,
    ).findAll();
    res.status(200).send(organizations);
  }

  async findOne(req: Request, res: Response) {
    const { id } = req.params;
    const organization = await setTenantIdToService(
      res,
      organizationsService,
    ).findOne(id);
    res.status(200).send(organization);
  }

  async save(req: Request, res: Response) {
    const organization: Organization = req.body;
    const savedOrganization = await setTenantIdToService(
      res,
      organizationsService,
    ).save(organization);
    res.status(201).send(savedOrganization);
  }

  async update(req: Request, res: Response) {
    const { id } = req.params;
    const organization: Organization = req.body;
    const savedOrganization = await setTenantIdToService(
      res,
      organizationsService,
    ).update(id, organization);
    savedOrganization
      ? res.status(201).send(savedOrganization)
      : res.status(400).send('Something went wrong');
  }
  async active(req: Request, res: Response) {
    const { id } = req.params;
    const savedOrganization = await setTenantIdToService(
      res,
      organizationsService,
    ).update(id, <Organization>{
      status: OrganizationStatus.ACTIVE,
    });
    savedOrganization
      ? res.status(201).send(savedOrganization)
      : res.status(400).send('Something went wrong');
  }
  async inactive(req: Request, res: Response) {
    const { id } = req.params;
    const savedOrganization = await setTenantIdToService(
      res,
      organizationsService,
    ).update(id, <Organization>{
      status: OrganizationStatus.INACTIVE,
    });
    savedOrganization
      ? res.status(201).send(savedOrganization)
      : res.status(400).send('Something went wrong');
  }
}

const organizationController = new OrganizationsController();
export default organizationController;
