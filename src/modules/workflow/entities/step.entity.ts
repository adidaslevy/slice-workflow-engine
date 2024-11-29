import { StepStatus } from './workflow.entity';

export class Step<StepType> {
  id: string;
  type: StepType;
  status: StepStatus = StepStatus.PENDING;
  dependencies: string[] = [];
  logic: () => Promise<void>;

  constructor(id: string, type: StepType, logic: () => Promise<void>, dependencies: string[] = []) {
    this.id = id;
    this.type = type;
    this.logic = logic;
    this.dependencies = dependencies;
  }
}