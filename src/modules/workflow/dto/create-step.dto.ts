import { StepTypes } from "./step-types";

export class CreateStepDto {
    id: string;
    type: StepTypes;
    dependencies?: string[];
  }