import { Module } from '@nestjs/common';
import { WorkflowController } from './workflow.controller';
import { WorkflowEngineService } from './services/workflow-engine.service';


@Module({
  controllers: [WorkflowController],
  providers: [WorkflowEngineService]
})
export class WorkflowModule {}
