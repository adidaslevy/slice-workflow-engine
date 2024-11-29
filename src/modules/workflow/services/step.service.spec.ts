import { Test, TestingModule } from '@nestjs/testing';
import { StepServiceService } from './step.service';

describe('StepServiceService', () => {
  let service: StepServiceService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [StepServiceService],
    }).compile();

    service = module.get<StepServiceService>(StepServiceService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
