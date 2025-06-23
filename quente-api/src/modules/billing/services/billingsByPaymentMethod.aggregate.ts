import { PipelineStage } from 'mongoose';

export type BillingsByPaymentMethodProps = { startDate: number, status?: Array<string | undefined> }

export const getBillingsByPaymentMethod = ({ startDate, status }: BillingsByPaymentMethodProps): PipelineStage[] => [
  {
    $match: {
      'createdAt.date': {
        $gte: startDate,
      },
      status: { $in: status || [undefined] },
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
