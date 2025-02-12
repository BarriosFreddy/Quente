export const CostPricePipeline = [
  {
    $project: {
      stock: 1,
      firstPriceRatio: {
        $slice: ['$pricesRatio', 1],
      },
    },
  },
  {
    $unwind: {
      path: '$firstPriceRatio',
    },
  },
  {
    $addFields: {
      costPerProduct: {
        $multiply: ['$stock', '$firstPriceRatio.cost'],
      },
      pricePerProduct: {
        $multiply: ['$stock', '$firstPriceRatio.price'],
      },
    },
  },
  {
    $group: {
      _id: null,
      totalCost: {
        $sum: '$costPerProduct',
      },
      totalPrice: {
        $sum: '$pricePerProduct',
      },
    },
  },
];
