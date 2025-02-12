// TODO worker to add pricesRatio property

db.items
  .find()
  .forEach((item) => {
    const _id = item._id;
    delete item._id;
    db.items.updateOne(
      { _id },
      {
        $set: {
          ...item,
          pricesRatio: [
            {
              measurementUnit: item.measurementUnit,
              price: item.price,
              cost: item.cost,
            },
          ],
        },
      },
    );
  });
