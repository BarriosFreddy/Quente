import { PipelineStage } from 'mongoose';

export const getTopSalesItems = ({startDate, status}: {startDate: number, status?: Array<string | undefined>}): PipelineStage[] => [
  {
    $match: {
      'createdAt.date': {
        $gte: startDate,
      },
      status: { $in: status || [undefined] },
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
