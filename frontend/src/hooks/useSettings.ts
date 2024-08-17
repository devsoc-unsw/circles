import { useCallback } from 'react';
import { useAppDispatch, useAppSelector } from 'hooks';
import {
  toggleLockedCourses as toggleLocked,
  toggleShowMarks as toggleMarks,
  toggleShowPastWarnings as togglePastWarnings,
  toggleTheme
} from 'reducers/settingsSlice';

interface Settings {
  theme: string;
  showMarks: boolean;
  showLockedCourses: boolean;
  showPastWarnings: boolean;
  mutateTheme: (theme: 'light' | 'dark') => void;
  toggleShowMarks: () => void;
  toggleLockedCourses: () => void;
  toggleShowPastWarnings: () => void;
}

function useSettings(): Settings {
  const settings = useAppSelector((state) => state.settings);
  const dispatch = useAppDispatch();

  const mutateTheme = useCallback(
    (theme: 'light' | 'dark') => dispatch(toggleTheme(theme)),
    [dispatch]
  );

  const toggleShowMarks = useCallback(() => dispatch(toggleMarks()), [dispatch]);
  const toggleLockedCourses = useCallback(() => dispatch(toggleLocked()), [dispatch]);
  const toggleShowPastWarnings = useCallback(() => dispatch(togglePastWarnings()), [dispatch]);

  return {
    ...settings,
    mutateTheme,
    toggleShowMarks,
    toggleLockedCourses,
    toggleShowPastWarnings
  };
}

export default useSettings;
