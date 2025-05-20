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

  async delete(req: Request, res: Response) {
    const { id } = req.params;
    const result = await setTenantIdToService(res, organizationsService).delete(
      id,
    );
    result
      ? res.status(200).send({ success: true })
      : res
          .status(400)
          .send({ success: false, message: 'Failed to delete organization' });
  }

  async deploy(req: Request, res: Response) {
    const { id } = req.params;
    try {
      const result = await setTenantIdToService(
        res,
        organizationsService,
      ).deploy(id);
      return result
        ? res.status(200).send({ success: true })
        : res
            .status(400)
            .send({ success: false, message: 'Failed to deploy organization' });
    } catch (error) {
      console.error(`Error deploying organization with id ${id}:`, error);
      return res.status(500).send({
        success: false,
        message: 'Error interno al desplegar la organización',
      });
    }
  }
}

const organizationController = new OrganizationsController();
export default organizationController;
