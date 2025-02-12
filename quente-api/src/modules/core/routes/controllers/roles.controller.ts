import { RoleService } from '../../services/roles.service';
import { Request, Response } from 'express';
import { container } from 'tsyringe';
import { Role } from '../../entities/Role';
import { setTenantIdToService } from '../../../../helpers/util';

const rolesService = container.resolve(RoleService);

class RolesController {
  async findAll(_req: Request, res: Response) {
    const roles = await setTenantIdToService(res, rolesService).findAll();
    res.status(200).send(roles);
  }

  async findOne(req: Request, res: Response) {
    const { id } = req.params;
    const role = await setTenantIdToService(res, rolesService).findOne(id);
    res.status(200).send(role);
  }

  async save(req: Request, res: Response) {
    const role: Role = req.body;
    const savedRole = await setTenantIdToService(res, rolesService).save(role);
    res.status(201).send(savedRole);
  }

  async update(req: Request, res: Response) {
    const { id } = req.params;
    const role: Role = req.body;
    const savedRole = await setTenantIdToService(res, rolesService).update(
      id,
      role,
    );
    savedRole
      ? res.status(201).send(savedRole)
      : res.status(400).send('Something went wrong');
  }
}

const roleController = new RolesController();
export default roleController;
