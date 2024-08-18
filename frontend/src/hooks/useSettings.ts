import { useCallback } from 'react';
import { QueryClient, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  getUserSettings,
  hideYear as hideYearApi,
  showYears as showYearsApi,
  toggleShowMarks as toggleShowMarksApi
} from 'utils/api/userApi';
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
  hiddenYears: number[];
  mutateTheme: (theme: Theme) => void;
  toggleShowMarks: () => void;
  hideYear: (yearIndex: number) => void;
  showYears: () => void;
  toggleLockedCourses: () => void;
  toggleShowPastWarnings: () => void;
}

const defaultUserSettings = {
  showMarks: false,
  hiddenYears: []
};

function useSettings(queryClient?: QueryClient): Settings {
  const localSettings = useAppSelector((state) => state.settings);
  const dispatch = useAppDispatch();

  const token = useToken({ allowUnset: true });
  const realQueryClient = useQueryClient(queryClient);
  const settingsQuery = useQuery(
    {
      queryKey: ['settings'],
      queryFn: () => getUserSettings(token!),
      placeholderData: defaultUserSettings,
      enabled: !!token
    },
    queryClient
  );
  const userSettings = settingsQuery.data ?? defaultUserSettings;

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

  const hideYearMutation = useMutation(
    {
      mutationFn: (yearIndex: number) =>
        token ? hideYearApi(token, yearIndex) : Promise.reject(new Error('No token')),
      onSuccess: () => {
        realQueryClient.invalidateQueries({ queryKey: ['settings'] });
      },
      onError: (error) => {
        // eslint-disable-next-line no-console
        console.error('Error hiding year: ', error);
      }
    },
    queryClient
  );

  const showYearsMutation = useMutation(
    {
      mutationFn: () => (token ? showYearsApi(token) : Promise.reject(new Error('No token'))),
      onSuccess: () => {
        realQueryClient.invalidateQueries({ queryKey: ['settings'] });
      },
      onError: (error) => {
        // eslint-disable-next-line no-console
        console.error('Error showing years: ', error);
      }
    },
    queryClient
  );

  const mutateTheme = useCallback((theme: Theme) => dispatch(toggleTheme(theme)), [dispatch]);
  const toggleLockedCourses = useCallback(() => dispatch(toggleLocked()), [dispatch]);
  const toggleShowPastWarnings = useCallback(() => dispatch(togglePastWarnings()), [dispatch]);
  const toggleShowMarks = showMarksMutation.mutate;
  const hideYear = hideYearMutation.mutate;
  const showYears = showYearsMutation.mutate;

  return {
    ...userSettings,
    ...localSettings,
    mutateTheme,
    toggleShowMarks,
    hideYear,
    showYears,
    toggleLockedCourses,
    toggleShowPastWarnings
  };
}

export default useSettings;
