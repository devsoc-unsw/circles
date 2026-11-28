import { useCallback } from 'react';
import { QueryClient, useQueryClient } from '@tanstack/react-query';
import { SettingsResponse } from 'types/userResponse';
import {
  useHideYearMutation,
  useSetShareCourseDataMutation,
  useShowYearsMutation,
  useToggleMarksMutation,
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
  setShareCourseData: (value: boolean) => void;
  hideYear: (yearIndex: number) => void;
  showYears: () => void;
  toggleLockedCourses: () => void;
  toggleShowPastWarnings: () => void;
}

const defaultUserSettings = {
  showMarks: false,
  hiddenYears: [],
  shareCourseData: true,
  // true while loading, so the one-time notice never flashes before real data arrives
  shareNoticeSeen: true
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

  // Also refetches popular electives: the user's plan just joined or left the counts
  const shareCourseDataMutation = useSetShareCourseDataMutation({
    allowUnsetToken: true,
    queryClient: realQueryClient
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
  const setShareCourseData = shareCourseDataMutation.mutate;
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
    shareNoticeSeen: userSettings.shareNoticeSeen ?? true,
    mutateTheme,
    toggleShowMarks,
    setShareCourseData,
    hideYear,
    showYears,
    toggleLockedCourses,
    toggleShowPastWarnings
  };
}

export default useSettings;
