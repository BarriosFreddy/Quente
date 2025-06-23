import { PipelineStage } from 'mongoose';

export const getStatsPipeline = ({startDate, status}: {startDate: number, status?: Array<string | undefined>}): PipelineStage[] => [
  {
    $match: {
      'createdAt.date': {
        $gte: startDate,
      },
      status: { $in: status || [undefined] },
    },
  },
  {
    $project: {
      createdAt: 1,
      billAmount: 1,
      code: 1,
    },
  },
  {
    $addFields: {
      createdAtAsDate: {
        $toDate: { $sum: ['$createdAt.date', '$createdAt.offset'] },
      },
    },
  },
  {
    $addFields: {
      createdAt: {
        $substr: ['$createdAtAsDate', 0, 10],
      },
    },
  },
  {
    $group: {
      _id: '$createdAt',
      billAmount: {
        $sum: '$billAmount',
      },
    },
  },
  {
    $addFields: {
      createdAt: {
        $toDate: '$_id',
      },
    },
  },
  {
    $sort: {
      createdAt: 1,
    },
  },
  {
    $project: {
      _id: 0,
      createdAt: '$_id',
      billAmount: 1,
    },
  },
];
