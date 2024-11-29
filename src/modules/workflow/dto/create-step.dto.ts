import { StepTypes } from "./step-types";

export class CreateStepDto {
    id: string;
    type: StepTypes;
    logic?: () => Promise<void>;
    dependencies?: string[];
  }