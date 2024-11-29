import { Test, TestingModule } from '@nestjs/testing';
import { WorkflowEngineService } from './workflow-engine.service';
import { CreateWorkflowDto } from '../dto/create-workflow.dto';

describe('WorkflowEngineService', () => {
    let service: WorkflowEngineService;

    beforeEach(async () => {
      const module: TestingModule = await Test.createTestingModule({
        providers: [WorkflowEngineService],
      }).compile();

      service = module.get<WorkflowEngineService>(WorkflowEngineService);
    });

    it('should create a workflow and store it', () => {
        const workflowData: CreateWorkflowDto = {
            id: 'workflow1',
            steps: [
                {
                    id: 'step1',
                    type: { kind: 'SEND_EMAIL', email: ["test1@example.com", "test2@example.com"], subject: "About the grants!", content: "We successfuly granted you grants!" },
                    dependencies: ["step2"],
                },
                {
                    id: 'step2',
                    type: { kind: 'UPDATE_GRANT', grantId: "123", newStatus: 'ACTIVE'  },
                    dependencies: [],
                },
            ],
        };

        const workflow = service.createWorkflow(workflowData);
        expect(workflow).toBeDefined();
        expect(workflow.id).toBe('workflow1');
        expect(workflow.steps.size).toBe(2);
        expect(service['workflows'].get('workflow1')).toEqual(workflow);
    });

    it('should run a simple workflow with no dependencies', async () => {
        const workflowData: CreateWorkflowDto = {
            id: 'workflow2',
            steps: [
                {
                    id: 'step1',
                    type: { kind: 'SEND_EMAIL', email: ["test1@example.com", "test2@example.com"], subject: "About the grants!", content: "We successfuly granted you grants!" },
                    dependencies: [],
                },
            ],
        };

        service.createWorkflow(workflowData);

        const logSpy = jest.spyOn(console, 'log');
        await service.runWorkflow('workflow2');

        expect(logSpy).toHaveBeenCalledWith('Executing step: step1 of type SEND_EMAIL');
        expect(logSpy).toHaveBeenCalledWith('Step step1 completed successfully');
    });

    it('should handle dependencies between steps', async () => {
        const workflowData: CreateWorkflowDto = {
            id: 'workflow3',
            steps: [
                {
                    id: 'step1',
                    type: { kind: 'SEND_EMAIL', email: ["test1@example.com", "test2@example.com"], subject: "About the grants!", content: "We successfuly granted you grants!" },
                    dependencies: [],
                },
                {
                    id: 'step2',
                    type: { kind: 'UPDATE_GRANT', grantId: "123", newStatus: 'ACTIVE' },
                    dependencies: ['step1'],
                },
            ],
        };

        service.createWorkflow(workflowData);

        const logSpy = jest.spyOn(console, 'log');
        await service.runWorkflow('workflow3');

        expect(logSpy).toHaveBeenCalledWith('Executing step: step1 of type SEND_EMAIL');
        expect(logSpy).toHaveBeenCalledWith('Step step1 completed successfully');
        expect(logSpy).toHaveBeenCalledWith('Executing step: step2 of type UPDATE_GRANT');
        expect(logSpy).toHaveBeenCalledWith('Step step2 completed successfully');
  });

  it('should mark step as failed when logic throws an error', async () => {
      const workflowData: CreateWorkflowDto = {
          id: 'workflow4',
          steps: [
              {
                  id: 'step1',
                  type: { kind: 'SEND_EMAIL', email: ["test1@example.com", "test2@example.com"], subject: "About the grants!", content: "We successfuly granted you grants!" },
                  dependencies: [],
              },
              {
                  id: 'step2',
                  type: { kind: 'UPDATE_GRANT', grantId: "123", newStatus: 'ACTIVE' },
                  dependencies: ['step1'],
                  // Simulate failure
                  logic: async () => {
                      throw new Error('Simulated failure');
                  },
              },
          ],
      };

      service.createWorkflow(workflowData);

      const logSpy = jest.spyOn(console, 'error');
      await service.runWorkflow('workflow4');

      expect(logSpy).toHaveBeenCalledWith(expect.stringContaining('Step step2 failed: Simulated failure'));
  }, 2000);

  it('should throw an error if workflow ID does not exist', async () => {
      await expect(service.runWorkflow('nonexistent')).rejects.toThrow('Workflow with ID nonexistent not found');
  });

  it('should execute steps in parallel if there are no dependencies', async () => {
      const workflowData: CreateWorkflowDto = {
          id: 'workflow5',
          steps: [
              {
                  id: 'step1',
                  type: { kind: 'SEND_EMAIL', email: ["test1@example.com"], subject: "About the grants!", content: "We successfuly granted you grants!" },
                  dependencies: [],
              },
              {
                  id: 'step2',
                  type: { kind: 'SEND_EMAIL', email: ["test2@example.com"], subject: "About the grants!", content: "We successfuly granted you grants!" },
                  dependencies: [],
              },
          ],
      };

      service.createWorkflow(workflowData);

      const logSpy = jest.spyOn(console, 'log');
      await service.runWorkflow('workflow5');

      expect(logSpy).toHaveBeenCalledWith('Running step: step1');
      expect(logSpy).toHaveBeenCalledWith('Executing step: step1 of type SEND_EMAIL');
      expect(logSpy).toHaveBeenCalledWith('Step step1 completed successfully');

      expect(logSpy).toHaveBeenCalledWith('Running step: step2');
      expect(logSpy).toHaveBeenCalledWith('Executing step: step2 of type SEND_EMAIL');
      expect(logSpy).toHaveBeenCalledWith('Step step2 completed successfully');
  });

  it('should execute dependent steps after parallel steps are completed', async () => {
    const workflowData: CreateWorkflowDto = {
        id: 'workflow6',
        steps: [
            {
                id: 'step1',
                type: { kind: 'UPDATE_GRANT', grantId: "123", newStatus: "Holding" },
                dependencies: [],
            },
            {
                id: 'step2',
                type: { kind: 'UPDATE_GRANT', grantId: '456', newStatus: "PASSED" },
                dependencies: [],
            },
            {
                id: 'step3',
                type: { kind: 'SEND_EMAIL', email: ["test2@example.com"], subject: "About the grants!", content: "We successfuly granted you grants!"  },
                dependencies: ['step1', 'step2'],
            },
        ],
    };

    service.createWorkflow(workflowData);

    const logSpy = jest.spyOn(console, 'log');
    await service.runWorkflow('workflow6');

    // Parallel steps should execute independently
    expect(logSpy).toHaveBeenCalledWith('Executing step: step1 of type UPDATE_GRANT');
    expect(logSpy).toHaveBeenCalledWith('Executing step: step2 of type UPDATE_GRANT');
    expect(logSpy).toHaveBeenCalledWith('Executing step: step3 of type SEND_EMAIL');
    expect(logSpy).toHaveBeenCalledWith('Step step3 completed successfully');
});

it('should correctly handle a complex dependency tree', async () => {
    const workflowData: CreateWorkflowDto = {
        id: 'workflow7',
        steps: [
            {
                id: 'step1',
                type: { kind: "UPDATE_GRANT", grantId: "888", newStatus: "In Process" },
                dependencies: [],
            },
            {
                id: 'step2',
                type: { kind: "UPDATE_GRANT", grantId: "999", newStatus: "In Process" },
                dependencies: [],
            },
            {
                id: 'step3',
                type: { kind: 'SEND_EMAIL', email: ["test1@example.com", "test2@example.com"], subject: "About the grants!", content: "We successfuly process your grants!" },
                dependencies: ['step1', 'step2'],
            },
            {
                id: 'step4',
                type: { kind: "UPDATE_GRANT", grantId: "000", newStatus: "Saving Grand Grant" },
                dependencies: ['step3'],
            },
            {
                id: 'step5',
                type: { kind: 'SEND_EMAIL', email: ["test1@example.com", "test2@example.com"], subject: "About the grants!", content: "We successfuly granted you grand grants!" },
                dependencies: ['step4'],
            },
        ],
    };

    service.createWorkflow(workflowData);

    const logSpy = jest.spyOn(console, 'log');
    await service.runWorkflow('workflow7');

    // Step 1 and Step 2 should run in parallel
    expect(logSpy).toHaveBeenCalledWith('Executing step: step1 of type UPDATE_GRANT');
    expect(logSpy).toHaveBeenCalledWith('Executing step: step2 of type UPDATE_GRANT');

    // Step 3 should run after Step 1 and Step 2
    expect(logSpy).toHaveBeenCalledWith('Executing step: step3 of type SEND_EMAIL');

    // Step 4 should run after Step 3
    expect(logSpy).toHaveBeenCalledWith('Executing step: step4 of type UPDATE_GRANT');

    // Step 5 should run after Step 4
    expect(logSpy).toHaveBeenCalledWith('Executing step: step5 of type SEND_EMAIL');
  });

  it('should correctly mark steps as failed if logic throws an error', async () => {
    const workflowData: CreateWorkflowDto = {
        id: 'workflow10',
        steps: [
            {
                id: 'step1',
                type: { kind: 'SEND_EMAIL', email: ["test1@example.com", "test2@example.com"], subject: "About the grants!", content: "Startimg to process grants!" },
                dependencies: [],
            },
            {
                id: 'step2',
                type: { kind: 'UPDATE_GRANT', grantId: "1234", newStatus: "Fulfilled" },
                dependencies: ['step1'],
                logic: async () => {
                    throw new Error('Simulated error in step2');
                },
            },
            {
                id: 'step3',
                type: { kind: 'SEND_EMAIL', email: ["test1@example.com", "test2@example.com"], subject: "About the grants!", content: "Successfully processed grants!" },
                dependencies: ['step2'],
            },
        ],
    };

    service.createWorkflow(workflowData);

    const logSpy = jest.spyOn(console, 'error');
    const completedSteps = jest.spyOn(console, 'log');

    await service.runWorkflow('workflow10');

    // Step 2 should fail, preventing Step 3 from running
    expect(completedSteps).toHaveBeenCalledWith('Running step: step1');
    expect(completedSteps).toHaveBeenCalledWith('Executing step: step1 of type SEND_EMAIL');
    expect(completedSteps).toHaveBeenCalledWith('Step step1 completed successfully');
    expect(completedSteps).toHaveBeenCalledWith('Running step: step2');
    expect(logSpy).toHaveBeenCalledWith('Step step2 failed: Simulated failure');
    expect(logSpy).toHaveBeenCalledWith('Step step2 failed: Simulated error in step2');
    expect(completedSteps).toHaveBeenCalledWith('Skipping step step3 because dependency step2 failed.');
  });
});
