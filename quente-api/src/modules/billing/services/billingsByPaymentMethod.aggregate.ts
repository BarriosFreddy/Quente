import { PipelineStage } from 'mongoose';

export const getBillingsByPaymentMethod = (startDate: number): PipelineStage[] => [
  {
    $match: {
      'createdAt.date': {
        $gte: startDate,
      },
    },
  },
  {
    $group: {
      _id: '$paymentMethod',
      count: {
        $sum: 1,
      },
      amount: {
        $sum: '$billAmount',
      },
    },
  },
  {
    $project: {
      _id: 0,
      method: '$_id',
      count: 1,
      amount: 1,
    },
  },
];
