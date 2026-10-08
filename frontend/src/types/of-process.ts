export type OfProcess = {
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

export type OfProcessStatus = 'completed' | 'in_progress' | 'pending';

export function getOfProcessStatus(process: OfProcess): OfProcessStatus {
  if (process.QTD > 0 && process.QTD_APT >= process.QTD) {
    return 'completed';
  }

  if (process.QTD_APT > 0) {
    return 'in_progress';
  }

  return 'pending';
}
