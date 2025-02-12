db.items.updateMany(
  { stock: { $eq: null }, reorderPoint: { $eq: null }, cost: { $eq: null } },
  { $set: { stock: 0, reorderPoint: 0, cost: 0 } },
);
