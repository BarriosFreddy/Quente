import { singleton, container } from 'tsyringe';
import { BillingService } from '../../billing/services/billing.service';
import { ItemService } from '../../inventory/services/item.service';
import { ItemCategoryService } from '../../inventory/services/item-category.service';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import { BaseService } from '../../../helpers/abstracts/base.service';

dayjs.extend(utc);

const billingService = container.resolve(BillingService);
const itemService = container.resolve(ItemService);
const itemCategoryService = container.resolve(ItemCategoryService);

@singleton()
export class DashboardService extends BaseService<undefined> {
  getModelName = () => 'Dashboard';
  getSchema = () => undefined;
  getCollectionName = () => undefined;

  constructor() {
    super();
  }

  /**
   * Get dashboard stats based on date range
   * @param startDate - Start date for filtering data
   * @returns Object with dashboard statistics
   */
  async getDashboardStats(startDate: string) {
    console.log('tenantId ', this.tenantId);
    billingService.setTenantId = this.tenantId;
    itemService.setTenantId = this.tenantId;
    itemCategoryService.setTenantId = this.tenantId;
    try {
      // Get data from different services in parallel for better performance
      const [billings, topSales, items, categories, numberOfBillings] =
        await Promise.all([
          billingService.findGreaterThanDate(startDate),
          billingService.findTopSalesItems(startDate),
          itemService.findAll({ page: 0, size: 0 }),
          itemCategoryService.findAll({ page: 0, size: 0 }),
          billingService.countSince(startDate),
        ]);

      // Calculate total revenue
      const totalRevenue = billings.reduce(
        (sum: number, billing: any) => sum + (billing.billAmount || 0),
        0,
      );

      // Calculate total inventory
      const totalItems = items.length;

      // Calculate current stock levels
      const currentStock = items.reduce((total: number, item: any) => {
        const stock =
          item.expirationControl?.reduce(
            (sum: number, control: any) => sum + (control.lotUnits || 0),
            0,
          ) || 0;
        return total + stock;
      }, 0);

      // Get stock levels by category
      const stockByCategory = await this.getStockByCategory(items, categories);

      // Get low stock items (items below reorder point)
      const lowStockItems = this.getLowStockItems(items, 10);

      return {
        totalRevenue,
        totalItems,
        currentStock,
        numberOfBillings,
        billingsByDay: billings,
        topSellingProducts: topSales,
        stockByCategory,
        lowStockItems,
      };
    } catch (error) {
      console.error('Error getting dashboard stats:', error);
      throw error;
    }
  }

  /**
   * Get stock levels grouped by category
   */
  private async getStockByCategory(items: any[], categories: any[]) {
    const categoryMap = new Map();

    // Initialize categories
    categories.forEach((category: any) => {
      categoryMap.set(category._id.toString(), {
        _id: category._id,
        name: category.name,
        stock: 0,
        itemCount: 0,
      });
    });

    // Calculate stock by category
    items.forEach((item: any) => {
      const categoryId = item.categoryId?.toString();
      if (categoryId && categoryMap.has(categoryId)) {
        const category = categoryMap.get(categoryId);
        const itemStock =
          item.expirationControl?.reduce(
            (sum: number, control: any) => sum + (control.lotUnits || 0),
            0,
          ) || 0;

        category.stock += itemStock;
        category.itemCount += 1;
      }
    });

    return Array.from(categoryMap.values());
  }

  /**
   * Get items that need to be restocked (below reorder point)
   */
  private getLowStockItems(items: any[], limit?: number) {
    return items
      .map((item: any) => {
        const currentStock =
          item.expirationControl?.reduce(
            (sum: number, control: any) => sum + (control.lotUnits || 0),
            0,
          ) || 0;
        const needsRestock = currentStock <= (item.reorderPoint || 0);

        return {
          _id: item._id,
          code: item.code,
          name: item.name,
          currentStock,
          reorderPoint: item.reorderPoint,
          needsRestock,
        };
      })
      .filter((item: any) => item.needsRestock)
      .sort((a: any, b: any) => a.currentStock - b.currentStock)
      .slice(0, limit); // Sort by lowest stock first
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  findOne(_id: string): Promise<null | undefined> {
    throw new Error('Method not implemented.');
  }
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  findAll(_filter: any): Promise<undefined[]> {
    throw new Error('Method not implemented.');
  }
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  save(_role: undefined): Promise<undefined> {
    throw new Error('Method not implemented.');
  }
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  update(_id: string, _role: undefined): Promise<null | undefined> {
    throw new Error('Method not implemented.');
  }
}
