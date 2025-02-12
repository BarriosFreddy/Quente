import { ItemCategoryService } from '../../services/item-category.service';
import { Request, Response } from 'express';
import { container } from 'tsyringe';
import { ItemCategory } from '../../entities/ItemCategory';
import { setTenantIdToService } from '../../../../helpers/util';

const categoryService = container.resolve(ItemCategoryService);

interface RequestQuery {
  page?: number;
  name?: string;
  code?: string;
  parse?: string;
}

class ItemCategoryController {
  async findAll(req: Request<{}, {}, {}, RequestQuery>, res: Response) {
    let { parse, page = 1, name, code } = req.query;
    page = +page;
    const categories: ItemCategory[] = await setTenantIdToService(
      res,
      categoryService,
    ).findAll({ name, code, page });
    if (parse === 'true') {
      let itemCategoriesParse = categories.map(({ name, _id }) => {
        return {
          label: name,
          value: _id,
        };
      });
      res.status(200).send(itemCategoriesParse);
      return;
    }
    res.status(200).send(categories);
  }

  async findOne(req: Request, res: Response) {
    const { id } = req.params;
    const itemCategory = await setTenantIdToService(
      res,
      categoryService,
    ).findOne(id);
    res.status(200).send(itemCategory);
  }
  async existByCode(req: Request, res: Response) {
    const { code } = req.params;
    const itemCategory = !!(await setTenantIdToService(
      res,
      categoryService,
    ).existByCode(code));
    res.status(200).send(itemCategory);
  }
  async existByName(req: Request, res: Response) {
    const { name } = req.params;
    const itemCategory = !!(await setTenantIdToService(
      res,
      categoryService,
    ).existByName(name));
    res.status(200).send(itemCategory);
  }
  async save(req: Request, res: Response) {
    const itemCategory: ItemCategory = req.body;
    const savedCategory = await setTenantIdToService(res, categoryService).save(
      itemCategory,
    );
    res.status(201).send(savedCategory);
  }

  async update(req: Request, res: Response) {
    const { id } = req.params;
    const itemCategory: ItemCategory = req.body;
    const savedCategory = await setTenantIdToService(
      res,
      categoryService,
    ).update(id, itemCategory);
    savedCategory
      ? res.status(201).send(savedCategory)
      : res.status(400).send('Something went wrong');
  }
}

const itemCategoryController = new ItemCategoryController();
export default itemCategoryController;
