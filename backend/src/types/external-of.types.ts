export type ExternalOfResponse = {
  ofNumber: string;
  partCode: string;
  partNumber: string;
  date: string;
  quantity: number;
  originalQuantity: number;
  serialNumber: number | null;
  observation: string;
};

export type ExternalProcessResponse = {
  OF: number;
  OP: number;
  QTD: number;
  QTD_APT: number;
  employeeName: string | null;
  employeeCard: string | null;
  employeeUnit: string | null;
  employeeId: number | null;
  costCenter: string;
  nameSector: string | null;
};
