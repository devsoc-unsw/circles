import { useCallback } from 'react';
import { QueryClient, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { getUserSettings, toggleShowMarks as toggleShowMarksApi } from 'utils/api/userApi';
import { useAppDispatch, useAppSelector } from 'hooks';
import {
  toggleLockedCourses as toggleLocked,
  toggleShowPastWarnings as togglePastWarnings,
  toggleTheme
} from 'reducers/settingsSlice';
import useToken from './useToken';

type Theme = 'light' | 'dark';

interface Settings {
  theme: Theme;
  showMarks: boolean;
  showLockedCourses: boolean;
  showPastWarnings: boolean;
  mutateTheme: (theme: Theme) => void;
  toggleShowMarks: () => void;
  toggleLockedCourses: () => void;
  toggleShowPastWarnings: () => void;
}

function useSettings(queryClient?: QueryClient): Settings {
  const localSettings = useAppSelector((state) => state.settings);
  const dispatch = useAppDispatch();

  const token = useToken({ allowUnset: true });
  const realQueryClient = useQueryClient(queryClient);
  const settingsQuery = useQuery(
    {
      queryKey: ['settings'],
      queryFn: () => getUserSettings(token!),
      placeholderData: { showMarks: false },
      enabled: !!token
    },
    queryClient
  );
  const userSettings = settingsQuery.data ?? {
    showMarks: false
  };

  const showMarksMutation = useMutation(
    {
      mutationFn: () => (token ? toggleShowMarksApi(token) : Promise.reject(new Error('No token'))),
      onSuccess: () => {
        realQueryClient.invalidateQueries({ queryKey: ['settings'] });
      },
      onError: (error) => {
        // eslint-disable-next-line no-console
        console.error('Error toggling show marks: ', error);
      }
    },
    queryClient
  );

  const mutateTheme = useCallback((theme: Theme) => dispatch(toggleTheme(theme)), [dispatch]);
  const toggleLockedCourses = useCallback(() => dispatch(toggleLocked()), [dispatch]);
  const toggleShowPastWarnings = useCallback(() => dispatch(togglePastWarnings()), [dispatch]);
  const toggleShowMarks = showMarksMutation.mutate;

  return {
    ...userSettings,
    ...localSettings,
    mutateTheme,
    toggleShowMarks,
    toggleLockedCourses,
    toggleShowPastWarnings
  };
}

export default useSettings;
