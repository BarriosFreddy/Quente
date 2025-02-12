import mongoose from 'mongoose';
import { itemCategorySchema } from '../schemas/item-category.schema';


const ItemCategoryModel = mongoose.model('ItemCategories', itemCategorySchema, 'item-categories');
export default ItemCategoryModel;
