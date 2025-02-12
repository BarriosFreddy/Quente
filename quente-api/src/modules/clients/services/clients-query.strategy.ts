import { PipelineStage } from 'mongoose';
import ClientQueryI from '../db/models/client-query.interface';
import { QueryStrategy } from './query-strategy';

export class ClientQueryStrategy implements QueryStrategy {
  constructor(private clientQuery: ClientQueryI) {}

  buildAggregate(): PipelineStage[] {
    let filters: any = {};
    let conditions = [];
    let { name, dni, page = 1, size = 10 } = this.clientQuery;

    name && conditions.push({ name: new RegExp(`${name}`, 'i') });
    dni && conditions.push({ dni: new RegExp(`${dni}`, 'i') });

    conditions.length > 0 && (filters = { ['$or']: conditions, ...filters });

    const aggregateFilters: PipelineStage[] = [
      { $match: filters },
      {
        $project: {
          name: 1,
          dniType: 1,
          dni: 1,
          address: 1,
          phoneNumber: 1,
          email: 1,
        },
      },
      { $skip: +size * (+page - 1) },
      { $limit: +size },
    ];

    return aggregateFilters;
  }
}
