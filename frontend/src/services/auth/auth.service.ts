import { httpClient, setWebCsrfToken } from '@/lib/http-client';
import type {
  ChangePasswordInput,
  ChangePasswordResponse,
  CsrfTokenResponse,
  LoginInput,
  LoginResponse,
  PublicUser,
} from '@/types/user';

export const webSessionQueryKey = ['auth', 'web-session'] as const;

export async function ensureWebCsrf(): Promise<void> {
  const { csrfToken } = await httpClient.get<CsrfTokenResponse>('/csrf');
  setWebCsrfToken(csrfToken);
}

export async function fetchWebSession(): Promise<PublicUser> {
  await ensureWebCsrf();
  return getCurrentUser();
}

export async function login(payload: LoginInput): Promise<LoginResponse> {
  await ensureWebCsrf();
  return httpClient.post<LoginResponse, LoginInput>('/users/login', payload);
}

export async function changePassword(
  userId: number,
  payload: ChangePasswordInput,
): Promise<ChangePasswordResponse> {
  return httpClient.patch<ChangePasswordResponse, ChangePasswordInput>(
    `/users/${userId}/password`,
    payload,
  );
}

export async function getCurrentUser(): Promise<PublicUser> {
  return httpClient.get<PublicUser>('/users/me');
}

export async function logout(): Promise<void> {
  await httpClient.post<void>('/users/logout');
  setWebCsrfToken(null);
}
