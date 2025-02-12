import { NextFunction, Request, Response } from 'express';
import { container } from 'tsyringe';
import { Privilege } from '../../modules/core/entities/enums/privileges';
import { ModuleService } from '../../modules/core/services/modules.service';
import { setTenantIdToService } from '../util';

const moduleService = container.resolve(ModuleService);

const roleValidation = (modulePrivilege: string) => {
  return async (_req: Request, res: Response, next: NextFunction) => {
    try {
      const [moduleCode, privilege] = modulePrivilege.split(':');

      const { infoUser } = res.locals;
      const module = await setTenantIdToService(res, moduleService).findByCode(
        moduleCode,
      );
      if (!module) throw new Error('module not found');
      if (!infoUser) throw new Error('infoUser not found');
      const { access } = module;
      if (!access) throw new Error('module does not have access configuration');
      const { roles } = infoUser;
      for (const accessData of access) {
        const {
          roleCode,
          canAccess,
          canCreate,
          canUpdate,
          canDelete,
          canExecute,
        } = accessData;
        const hasRole = roles.some((roleUser: string) => roleUser === roleCode);
        if (
          hasRole &&
          ((privilege === Privilege.ACCESS && canAccess) ||
            (privilege === Privilege.CREATE && canCreate) ||
            (privilege === Privilege.UPDATE && canUpdate) ||
            (privilege === Privilege.DELETE && canDelete) ||
            (privilege === Privilege.EXECUTE && canExecute))
        )
          return next();
      }

      res.status(403).send({ message: 'Not authorized' });
    } catch (e) {
      console.error(e);
      res.status(422).send(e);
    }
  };
};

export { roleValidation };
