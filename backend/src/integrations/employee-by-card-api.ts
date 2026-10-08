import axios from 'axios';

import { env } from '../config/env.js';
import { AppError } from '../lib/errors.js';
import type {
  EmployeeInfoByCardResponse,
  EmployeeVerifyUnit,
} from '../types/employee-info.types.js';

export class EmployeeApiError extends AppError {
  constructor(message: string, statusCode = 502) {
    super(message, statusCode);
  }
}

export async function infoByCardAndUnit(
  unit: EmployeeVerifyUnit,
  card: string,
): Promise<EmployeeInfoByCardResponse | null> {
  const trimmedCard = card.trim();

  try {
    const encodedCard = encodeURIComponent(trimmedCard);
    const response = await axios.get<EmployeeInfoByCardResponse>(
      `${env.URL_VERIFY_EMPLOYEES}/employee/get/${encodedCard}/${unit}`,
      {
        timeout: 5000,
        headers: {
          nameapplication: env.NAME_APPLICATION,
          key: env.KEY,
        },
        validateStatus: (status) => status === 200 || status === 404,
      },
    );

    if (response.status === 404) {
      return null;
    }

    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      if (error.response?.status === 404) {
        return null;
      }

      console.error(
        'Employee API error:',
        error.code,
        error.message,
        error.response?.status,
        error.response?.data,
      );

      throw new EmployeeApiError(
        'Não foi possível consultar a API de colaboradores. Verifique a conexão e as variáveis URL_VERIFY_EMPLOYEES, NAME_APPLICATION e KEY no backend.',
      );
    }

    console.error('Unexpected employee API error:', error);
    throw new EmployeeApiError(
      'Falha inesperada ao consultar a API de colaboradores.',
    );
  }
}
