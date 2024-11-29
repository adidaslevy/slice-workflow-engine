import { Test, TestingModule } from '@nestjs/testing';
import { WorkflowEngineServiceService } from './workflow-engine.service';

describe('WorkflowEngineServiceService', () => {
  let service: WorkflowEngineServiceService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [WorkflowEngineServiceService],
    }).compile();

    service = module.get<WorkflowEngineServiceService>(WorkflowEngineServiceService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
