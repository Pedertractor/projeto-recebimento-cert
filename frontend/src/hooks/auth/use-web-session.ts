import { useQuery } from '@tanstack/react-query';
import { fetchWebSession, webSessionQueryKey } from '@/services/auth/auth.service';

export function useWebSession() {
  return useQuery({
    queryKey: webSessionQueryKey,
    queryFn: fetchWebSession,
    staleTime: Number.POSITIVE_INFINITY,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    retry: false,
  });
}
