import axios from 'axios';

import { env } from '../config/env.js';
import { AppError } from '../lib/errors.js';
import type { ExternalPartResponse } from '../types/external-part.types.js';
import { resolvePartImageUrl } from '../utils/resolve-part-image-url.js';

export class PartApiError extends AppError {
  constructor(message: string, statusCode = 502) {
    super(message, statusCode);
  }
}

export async function getPartByNumber(
  partNumber: string,
): Promise<ExternalPartResponse | null> {
  const trimmedNumber = partNumber.trim();

  if (!trimmedNumber) {
    return null;
  }

  try {
    const encodedNumber = encodeURIComponent(trimmedNumber);
    const response = await axios.get<ExternalPartResponse>(
      `${env.URL_VERIFY_EMPLOYEES}/part/number/${encodedNumber}`,
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

    return {
      ...response.data,
      images: response.data.images.map((image) => ({
        ...image,
        path: resolvePartImageUrl(image.path),
      })),
    };
  } catch (error) {
    if (axios.isAxiosError(error)) {
      if (error.response?.status === 404) {
        return null;
      }

      console.error(
        'Part API error:',
        error.code,
        error.message,
        error.response?.status,
        error.response?.data,
      );

      throw new PartApiError(
        'Não foi possível consultar a API de peças. Verifique a conexão e as variáveis de ambiente do backend.',
      );
    }

    console.error('Unexpected part API error:', error);
    throw new PartApiError('Falha inesperada ao consultar a API de peças.');
  }
}
