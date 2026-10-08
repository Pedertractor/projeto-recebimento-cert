export type EmployeeVerifyUnit = 'PEDERTRACTOR' | 'TRACTOR';

export type EmployeeInfoByCardResponse = {
  id: number;
  name: string;
  cardNumber: string;
  unit: EmployeeVerifyUnit;
  status?: boolean;
  Designation?: Array<{
    sector: { name: string; costCenter?: string };
    position: { name: string };
  }>;
};
