import { StepStatus } from './workflow.entity';

export class Step<TType extends { kind: string; [key: string]: any }> {
  id: string;
  type: TType;
  status: StepStatus = StepStatus.PENDING;
  dependencies: string[] = [];
  logic: () => Promise<void>;

  constructor(id: string, type: TType, logic: () => Promise<void>, dependencies: string[] = []) {
    this.id = id;
    this.type = type;
    this.logic = logic;
    this.dependencies = dependencies;
  }
}
