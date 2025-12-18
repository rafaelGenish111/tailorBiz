import { useQuery } from '@tanstack/react-query';
import { authAPI } from '../utils/api';

export const CURRENT_USER_QUERY_KEY = ['auth', 'me'];

export function useCurrentUserQuery() {
  return useQuery({
    queryKey: CURRENT_USER_QUERY_KEY,
    queryFn: () => authAPI.me().then((res) => res.data),
    retry: false,
  });
}

export function getCurrentUserFromQueryData(queryData) {
  return queryData?.data || null;
}

export function hasModuleAccess(user, moduleKey) {
  if (!user) return false;
  if (user.role === 'admin') return true;
  return Boolean(user.permissions?.[moduleKey]?.enabled);
}

export function hasAnyModuleAccess(user, moduleKeys) {
  if (!user) return false;
  if (user.role === 'admin') return true;
  if (!Array.isArray(moduleKeys)) return false;
  return moduleKeys.some((k) => Boolean(user.permissions?.[k]?.enabled));
}
