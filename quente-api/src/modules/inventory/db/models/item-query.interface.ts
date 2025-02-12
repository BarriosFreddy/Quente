import { QueryI } from "./query.interface";

export default interface ItemQueryI extends QueryI {
  name?: string;
  code?: string;
  stock?: string;
}
