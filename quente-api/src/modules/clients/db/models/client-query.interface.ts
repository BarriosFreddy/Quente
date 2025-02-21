import { QueryI } from './query.interface';

export default interface ClientQueryI extends QueryI {
  name?: string;
  dni?: string;
}
