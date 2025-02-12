import { PipelineStage } from "mongoose";

export interface QueryStrategy {
  buildAggregate(): PipelineStage[];
}
