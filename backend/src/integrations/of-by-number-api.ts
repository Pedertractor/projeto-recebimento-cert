import axios from 'axios';

import { env } from '../config/env.js';
import { AppError } from '../lib/errors.js';
import type { ExternalOfResponse, ExternalProcessResponse } from '../types/external-of.types.js';

export class OfApiError extends AppError {
  constructor(message: string, statusCode = 502) {
    super(message, statusCode);
  }
}

export async function getOfByNumber(
  ofNumber: string,
): Promise<ExternalOfResponse | null> {
  const trimmedNumber = ofNumber.trim();

  if (!trimmedNumber) {
    return null;
  }

  try {
    const encodedNumber = encodeURIComponent(trimmedNumber);
    const response = await axios.get<ExternalOfResponse>(
      `${env.URL_VERIFY_EMPLOYEES}/of/get/${encodedNumber}`,
      {
        timeout: 10000,
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
        'OF API error:',
        error.code,
        error.message,
        error.response?.status,
        error.response?.data,
      );

      throw new OfApiError(
        'Não foi possível consultar a API de OF. Verifique a conexão e as variáveis de ambiente do backend.',
      );
    }

    console.error('Unexpected OF API error:', error);
    throw new OfApiError('Falha inesperada ao consultar a API de OF.');
  }
}

export async function getProcessesByOfNumber(
  ofNumber: string,
): Promise<ExternalProcessResponse[]> {
  const trimmedNumber = ofNumber.trim();
  try {
    const encodedNumber = encodeURIComponent(trimmedNumber);
    const response = await axios.get<ExternalProcessResponse[]>(
      `${env.URL_VERIFY_EMPLOYEES}/of/processes/${encodedNumber}`,
      {
        timeout: 10000,
        headers: {
          nameapplication: env.NAME_APPLICATION,
          key: env.KEY,
        },
        validateStatus: (status) => status === 200 || status === 404,
      },
    );

    if (response.status === 404 || !response.data) {
      return [];
    }

    if(!Array.isArray(response.data)) {
      return [];
    }

    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
        if (error.response?.status === 404) {
          return [];
        }

      console.error(
        'OF API error:',
        error.code,
        error.message,
        error.response?.status,
        error.response?.data,
      );

      throw new OfApiError(
        'Não foi possível consultar a API de OF. Verifique a conexão e as variáveis de ambiente do backend.',
      );
    }
    console.error('Unexpected OF API error:', error);
    throw new OfApiError('Falha inesperada ao consultar a API de OF.');
  }
}
