import { CreateStepDto } from './create-step.dto';

export class CreateWorkflowDto {
  id: string;
  steps: CreateStepDto[];
}