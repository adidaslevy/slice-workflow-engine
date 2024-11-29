export type SendEmailStepType = {
    kind: 'SEND_EMAIL';
    email: string[];
    subject: string;
    content: string;
  };
  
  export type UpdateGrantStepType = {
    kind: 'UPDATE_GRANT';
    grantId: string;
    newStatus: string;
  };
  
  export type StepTypes = SendEmailStepType | UpdateGrantStepType;