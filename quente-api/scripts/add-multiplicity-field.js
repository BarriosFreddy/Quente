db.items.find().forEach((item) => {
  const _id = item._id;
  delete item._id;
  const { pricesRatio } = item;
  let pricesRatioNew = pricesRatio.map((priceRatio) => ({
    ...priceRatio,
    multiplicity: 1,
  }));
  db.items.updateOne(
    { _id },
    {
      $set: {
        ...item,
        pricesRatio: pricesRatioNew,
      },
    },
  );
});
