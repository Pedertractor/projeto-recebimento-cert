export type FastifyValidationError = {
  validation: Array<{
    keyword: string;
    instancePath: string;
    message?: string;
  }>;
};
