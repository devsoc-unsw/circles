import React, { Suspense } from 'react';
import { useSelector } from 'react-redux';
import { BrowserRouter as Router, Navigate, Route, Routes } from 'react-router-dom';
import { ThemeProvider } from 'styled-components';
import ErrorBoundary from 'components/ErrorBoundary';
import PageLoading from 'components/PageLoading';
import { inDev } from 'config/constants';
import type { RootState } from 'config/store';
import { darkTheme, GlobalStyles, lightTheme } from 'config/theme';
import './config/axios';
// stylesheets for antd library
import 'antd/dist/antd.less';

// Lazy load in pages
const LandingPage = React.lazy(() => import('./pages/LandingPage'));
const CourseSelector = React.lazy(() => import('./pages/CourseSelector'));
const DegreeWizard = React.lazy(() => import('./pages/DegreeWizard'));
const GraphicalSelector = React.lazy(() => import('./pages/GraphicalSelector'));
const Page404 = React.lazy(() => import('./pages/Page404'));
const ProgressionChecker = React.lazy(() => import('./pages/ProgressionChecker'));
const TermPlanner = React.lazy(() => import('./pages/TermPlanner'));
const Auth = React.lazy(() => import('./pages/Auth'));

const App = () => {
  const { theme } = useSelector((state: RootState) => state.settings);

  const degree = useSelector((state: RootState) => state.degree);

  return (
    <ThemeProvider theme={theme === 'light' ? lightTheme : darkTheme}>
      <GlobalStyles />
      <ErrorBoundary>
        <Suspense fallback={<PageLoading />}>
          <Router>
            <Routes>
              <Route
                path="/"
                element={
                  !degree.isComplete ? <LandingPage /> : <Navigate to="/course-selector" replace />
                }
              />
              <Route path="/degree-wizard" element={<DegreeWizard />} />
              <Route path="/course-selector" element={<CourseSelector />} />
              {inDev && <Route path="/graphical-selector" element={<GraphicalSelector />} />}
              <Route path="/term-planner" element={<TermPlanner />} />
              <Route path="/progression-checker" element={<ProgressionChecker />} />
              <Route path="*" element={<Page404 />} />
              {inDev && <Route path="/login" element={<Auth />} />}
            </Routes>
          </Router>
        </Suspense>
      </ErrorBoundary>
    </ThemeProvider>
  );
};

export default App;
