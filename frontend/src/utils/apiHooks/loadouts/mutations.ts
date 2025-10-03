import { createUserLoadout, deleteUserLoadout, switchUserLoadout } from 'utils/api/userApi';
import { createUserMutationHook } from '../hookHelpers';

// TODO fix the caching invalidation keys -> same with queries.ts
export const useCreateLoadoutMutation = createUserMutationHook([['loadouts']], createUserLoadout);

export const useDeleteLoadoutMutation = createUserMutationHook(
  [['loadouts'], ['planner'], ['courses']],
  deleteUserLoadout
);

export const useSwitchLoadoutMutation = createUserMutationHook(
  [['loadouts'], ['planner'], ['planner', 'courses']],
  switchUserLoadout
);
