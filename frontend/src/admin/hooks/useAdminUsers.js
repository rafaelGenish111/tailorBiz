import { useQuery } from '@tanstack/react-query';
import { adminUsersAPI } from '../utils/api';

export function useAdminUsers() {
  return useQuery({
    queryKey: ['admin', 'users'],
    queryFn: () => adminUsersAPI.list().then((res) => res.data),
    retry: false,
  });
}

