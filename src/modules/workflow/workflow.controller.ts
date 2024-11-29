import { Body, Controller, Param, Post } from '@nestjs/common';
import { WorkflowEngineService } from './services/workflow-engine.service';
import { CreateStepDto } from './dto/create-step.dto';
import { CreateWorkflowDto } from './dto/create-workflow.dto';

@Controller('workflow')
export class WorkflowController {
    constructor(private readonly workflowEngineService: WorkflowEngineService) {}

    @Post()
    async createWorkflow(@Body() createWorkflowDto: CreateWorkflowDto) {
        return this.workflowEngineService.createWorkflow(createWorkflowDto);
    }

    @Post(':id/run')
    async runWorkflow(@Param('id') id: string) {
        return this.workflowEngineService.runWorkflow(id);
    }
}
