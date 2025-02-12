db.items.find().forEach((item) => {
  const _id = item._id;
  delete item._id;
  const { stock } = item;
  db.items.updateOne(
    { _id },
    {
      $set: {
        ...item,
        sku: '',
        expirationControl: [
          {
            lotUnits: stock,
            expirationDate: '',
            lot: '',
          },
        ],
      },
    },
  );
});

// delete properties
db.items.updateMany(
  {},
  {
    $unset: {
      units: 1,
      cost: 1,
      price: 1,
      stock: 1,
      measurementUnit: 1,
      expirationDate: 1,
    },
  },
);
