import { StepTypes } from '../dto/step-types';
import { Step } from './step.entity';

export enum StepStatus {
  PENDING = 'PENDING',
  RUNNING = 'RUNNING',
  SUCCESS = 'SUCCESS',
  FAILED = 'FAILED',
  SKIPPED = 'SKIPPED'
}

export class Workflow {
  id: string;
  steps: Map<string, Step<StepTypes>>;

  constructor(id: string, steps: Step<StepTypes>[]) {
    this.id = id;
    this.steps = new Map(steps.map(step => [step.id, step]));
  }
}