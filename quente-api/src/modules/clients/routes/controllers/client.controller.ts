import { Request, Response } from 'express';
import { container } from 'tsyringe';
import { ClientService } from '../../services/clients.service';
import ClientQuery from '../../db/models/client-query.interface';
import { Client } from '../../entities/Client';
import { setTenantIdToService } from '../../../../helpers/util';

const clientsService = container.resolve(ClientService);

class ClientsController {
  async findAll(req: Request<{}, {}, {}, ClientQuery>, res: Response) {
    const clients = await setTenantIdToService(res, clientsService).findAll(
      req.query,
    );
    res.status(200).send(clients);
  }
  async findOne(req: Request, res: Response) {
    const { id } = req.params;
    const client = await setTenantIdToService(res, clientsService).findOne(id);
    res.status(200).send(client);
  }
  async findByDNI(req: Request, res: Response) {
    const { dni } = req.params;
    const client = await setTenantIdToService(res, clientsService).findByDNI(
      dni,
    );
    res.status(200).send(client);
  }
  async existByDNI(req: Request, res: Response) {
    const { dni } = req.params;
    const client = !!(await setTenantIdToService(
      res,
      clientsService,
    ).existByDNI(dni));
    res.status(200).send(client);
  }
  async existByName(req: Request, res: Response) {
    const { name } = req.params;
    const client = !!(await setTenantIdToService(
      res,
      clientsService,
    ).existByName(name));
    res.status(200).send(client);
  }
  async save(req: Request, res: Response) {
    const client: Client = req.body;
    const savedClient = await setTenantIdToService(res, clientsService).save(
      client,
    );
    res.status(201).send(savedClient);
  }
  async saveAll(req: Request, res: Response) {
    const clients: Client[] = req.body;
    const result = await setTenantIdToService(res, clientsService).saveAll(
      clients,
    );
    res.status(201).send(result);
  }
  async update(req: Request, res: Response) {
    const { id } = req.params;
    const client: Client = req.body;
    const savedClient = await setTenantIdToService(res, clientsService).update(
      id,
      client,
    );
    savedClient
      ? res.status(201).send(savedClient)
      : res.status(400).send('Something went wrong');
  }
}

const clientController = new ClientsController();
export default clientController;
