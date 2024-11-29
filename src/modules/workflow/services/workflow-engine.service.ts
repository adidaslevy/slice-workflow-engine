import { Injectable } from '@nestjs/common';
import { StepStatus, Workflow } from '../entities/workflow.entity';
import { Step } from '../entities/step.entity';
import { CreateWorkflowDto } from '../dto/create-workflow.dto';

@Injectable()
export class WorkflowEngineService {
    constructor() {}
    private workflows: Map<string, Workflow> = new Map();

    createWorkflow(workflowData: CreateWorkflowDto) {
        const workflowSteps = workflowData.steps.map(dto => {
            return new Step(
                dto.id,
                dto.type,
                async () => {
                    console.log(`Executing step: ${dto.id} of type ${dto.type.kind}`);
                }, // the logic
                dto.dependencies || [],
            );
        });
        const workflow = new Workflow(workflowData.id, workflowSteps);
        this.workflows.set(workflow.id, workflow);
        console.log(`Added workflow ${workflow.id}`);
        return workflow;
    }
    
    async runWorkflow(id: string): Promise<void> {
        const workflow = this.workflows.get(id);
        if (!workflow) throw new Error(`Workflow with ID ${id} not found`);

        const completedSteps = new Set<string>();

        const executeStep = async (step: Step<any>): Promise<void> => {
            if (step.status !== StepStatus.PENDING) {
                return;
            }

            for (const dependencyId of step.dependencies) {
                while (!completedSteps.has(dependencyId)) {
                    await new Promise(resolve => setTimeout(resolve, 10000));
                }
            }
            step.status = StepStatus.RUNNING;
            console.log(`Running step: ${step.id}`);
            try {
                await step.logic();
                step.status = StepStatus.SUCCESS;
                completedSteps.add(step.id);
                console.log(`Step ${step.id} completed successfully`);
            } catch (error) {
                step.status = StepStatus.FAILED;
                console.error(`Step ${step.id} failed: ${error.message}`);
            }
        };
    
        const promises = Array.from(workflow.steps.values()).map(executeStep);
        await Promise.all(promises);
    }
}
