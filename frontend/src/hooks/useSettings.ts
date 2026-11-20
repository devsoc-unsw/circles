import { useCallback } from 'react';
import { QueryClient, useQueryClient } from '@tanstack/react-query';
import { SettingsResponse } from 'types/userResponse';
import {
  useHideYearMutation,
  useShowYearsMutation,
  useToggleMarksMutation,
  useToggleShareCourseDataMutation,
  useUserSettings
} from 'utils/apiHooks/user';
import { useAppDispatch, useAppSelector } from 'hooks';
import {
  toggleLockedCourses as toggleLocked,
  toggleShowPastWarnings as togglePastWarnings,
  toggleTheme
} from 'reducers/settingsSlice';

type Theme = 'light' | 'dark';

export interface LocalSettings {
  theme: Theme;
  showLockedCourses: boolean;
  showPastWarnings: boolean;
}

export interface Settings extends LocalSettings, SettingsResponse {
  mutateTheme: (theme: Theme) => void;
  toggleShowMarks: () => void;
  toggleShareCourseData: () => void;
  hideYear: (yearIndex: number) => void;
  showYears: () => void;
  toggleLockedCourses: () => void;
  toggleShowPastWarnings: () => void;
}

const defaultUserSettings = {
  showMarks: false,
  hiddenYears: [],
  shareCourseData: true
};

function useSettings(queryClient?: QueryClient): Settings {
  const localSettings = useAppSelector((state) => state.settings);
  const dispatch = useAppDispatch();

  const realQueryClient = useQueryClient(queryClient);

  const settingsQuery = useUserSettings({
    allowUnsetToken: true,
    queryClient: realQueryClient,
    queryOptions: { placeholderData: defaultUserSettings }
  });
  const userSettings = settingsQuery.data ?? defaultUserSettings;

  const showMarksMutation = useToggleMarksMutation({
    allowUnsetToken: true,
    queryClient: realQueryClient
  });

  const shareCourseDataMutation = useToggleShareCourseDataMutation({
    allowUnsetToken: true,
    queryClient: realQueryClient,
    mutationOptions: {
      // The user's own plan just joined or left the counts
      onSuccess: () =>
        realQueryClient.invalidateQueries({
          predicate: (query) => query.queryKey[2] === 'popular-electives'
        })
    }
  });

  const hideYearMutation = useHideYearMutation({
    allowUnsetToken: true,
    queryClient: realQueryClient
  });

  const showYearsMutation = useShowYearsMutation({
    allowUnsetToken: true,
    queryClient: realQueryClient
  });

  const mutateTheme = useCallback((theme: Theme) => dispatch(toggleTheme(theme)), [dispatch]);
  const toggleLockedCourses = useCallback(() => dispatch(toggleLocked()), [dispatch]);
  const toggleShowPastWarnings = useCallback(() => dispatch(togglePastWarnings()), [dispatch]);
  const toggleShowMarks = showMarksMutation.mutate;
  const toggleShareCourseData = shareCourseDataMutation.mutate;
  const hideYear = hideYearMutation.mutate;
  const showYears = showYearsMutation.mutate;

  return {
    // Do not use the spread operator here, as it doesn't update after the mutation
    theme: localSettings.theme,
    showLockedCourses: localSettings.showLockedCourses,
    showPastWarnings: localSettings.showPastWarnings,
    showMarks: userSettings.showMarks,
    hiddenYears: userSettings.hiddenYears,
    // Older responses may omit the field; opt-out means missing = sharing
    shareCourseData: userSettings.shareCourseData ?? true,
    mutateTheme,
    toggleShowMarks,
    toggleShareCourseData,
    hideYear,
    showYears,
    toggleLockedCourses,
    toggleShowPastWarnings
  };
}

export default useSettings;
