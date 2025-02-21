import { Request, Response } from 'express';
import { container, singleton } from 'tsyringe';
import { InvEnumerationService } from '../../services/inv-enumeration.service';
import { InvEnumeration } from '../../entities/InvEnumeration';
import { setTenantIdToService } from '../../../../helpers/util';
const invEnumerationService = container.resolve(InvEnumerationService);

@singleton()
export default class InvEnumerationController {
  constructor() {}

  async save(req: Request, res: Response) {
    try {
      const invEnumeration: InvEnumeration = req.body;
      const invEnumerationSaved = await setTenantIdToService(
        res,
        invEnumerationService,
      ).save(invEnumeration);
      res.status(201).send(invEnumerationSaved);
    } catch (e) {
      console.error(e);
      res.status(500).send(e);
    }
  }

  async update(req: Request, res: Response) {
    const { id } = req.params;
    const invEnumeration: InvEnumeration = req.body;
    const invEnumerationSaved = await setTenantIdToService(
      res,
      invEnumerationService,
    ).update(id, invEnumeration);
    invEnumerationSaved
      ? res.status(201).send(invEnumerationSaved)
      : res.status(400).send('Something went wrong');
  }

  async findAll(req: Request, res: Response) {
    try {
      const { page = 1 } = req.params;
      const invEnumerations = await setTenantIdToService(
        res,
        invEnumerationService,
      ).findAll({ page });
      res.status(200).send(invEnumerations);
    } catch (e) {
      console.error(e);
      res.status(500).send(e);
    }
  }

  async findByCode(req: Request, res: Response) {
    try {
      const { code } = req.params;
      if (!code) {
        res.status(400).send({ message: 'Code must be in the request' });
        return;
      }
      if (typeof code === 'string') {
        const invEnumeration = await setTenantIdToService(
          res,
          invEnumerationService,
        ).findByCode(code);
        res.status(200).send(invEnumeration);
      }
    } catch (e) {
      console.error(e);
      res.status(500).send(e);
    }
  }
}
