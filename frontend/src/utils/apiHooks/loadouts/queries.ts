import { getUserActiveLoadout, getUserLoadouts } from 'utils/api/userApi';
import { createUserQueryHook } from '../hookHelpers';

// TODO fix the caching keys
export const useUserLoadouts = createUserQueryHook(() => ['loadouts'], getUserLoadouts);

export const useUserActiveLoadout = createUserQueryHook(
  () => ['loadouts', 'active'],
  getUserActiveLoadout
);
