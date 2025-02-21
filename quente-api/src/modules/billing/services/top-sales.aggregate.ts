import { PipelineStage } from 'mongoose';

export const getTopSalesItems = (startDate: number): PipelineStage[] => [
  {
    $match: {
      'createdAt.date': {
        $gte: startDate,
      },
    },
  },
  {
    $unwind: {
      path: '$items',
    },
  },
  {
    $group: {
      _id: '$items.name',
      sales: {
        $sum: '$items.units',
      },
    },
  },
  {
    $sort: {
      sales: -1,
    },
  },
  {
    $limit: 10,
  },
  {
    $project: {
      _id: 0,
      name: '$_id',
      sales: 1,
    },
  },
];
