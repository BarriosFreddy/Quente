import { Request, Response } from 'express';
import { container } from 'tsyringe';
import { ItemService } from '../../services/item.service';
import ItemQuery from '../../db/models/item-query.interface';
import { Item } from '../../entities/Item';

const itemsService = container.resolve(ItemService);

class ItemsController {
  async findAll(req: Request<{}, {}, {}, ItemQuery>, res: Response) {
    const items = await itemsService.findAll(req.query);
    res.status(200).send(items);
  }
  async findOne(req: Request, res: Response) {
    const { id } = req.params;
    const item = await itemsService.findOne(id);
    res.status(200).send(item);
  }
  async existByCode(req: Request, res: Response) {
    const { code } = req.params;
    const item = !!(await itemsService.existByCode(code));
    res.status(200).send(item);
  }
  async existByName(req: Request, res: Response) {
    const { name } = req.params;
    const item = !!(await itemsService.existByName(name));
    res.status(200).send(item);
  }
  async save(req: Request, res: Response) {
    const item: Item = req.body;
    const savedItem = await itemsService.save(item);
    res.status(201).send(savedItem);
  }
  async saveAll(req: Request, res: Response) {
    const items: Item[] = req.body;
    const result = await itemsService.saveAll(items);
    res.status(201).send(result);
  }
  async update(req: Request, res: Response) {
    const { id } = req.params;
    const item: Item = req.body;
    const savedItem = await itemsService.update(id, item);
    savedItem
      ? res.status(201).send(savedItem)
      : res.status(400).send('Something went wrong');
  }
}

const itemController = new ItemsController();
export default itemController;
