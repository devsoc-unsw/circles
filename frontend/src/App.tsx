import React, { Suspense } from 'react';
import { useSelector } from 'react-redux';
import { BrowserRouter as Router, Navigate, Route, Routes } from 'react-router-dom';
import { ConfigProvider } from 'antd';
import { ThemeProvider } from 'styled-components';
import ErrorBoundary from 'components/ErrorBoundary';
import PageLoading from 'components/PageLoading';
import { inDev } from 'config/constants';
import type { RootState } from 'config/store';
import { darkTheme, GlobalStyles, lightTheme } from 'config/theme';
import LandingPage from 'pages/LandingPage';
import './config/axios';

// Lazy load in pages
const CourseSelector = React.lazy(() => import('./pages/CourseSelector'));
const DegreeWizard = React.lazy(() => import('./pages/DegreeWizard'));
const GraphicalSelector = React.lazy(() => import('./pages/GraphicalSelector'));
const Page404 = React.lazy(() => import('./pages/Page404'));
const ProgressionChecker = React.lazy(() => import('./pages/ProgressionChecker'));
const TermPlanner = React.lazy(() => import('./pages/TermPlanner'));

const App = () => {
  const { theme } = useSelector((state: RootState) => state.settings);

  const degree = useSelector((state: RootState) => state.degree);

  return (
    <ConfigProvider
      theme={{
        token: {
          colorPrimary: '#9254de' // purple-5
        }
      }}
    >
      <ThemeProvider theme={theme === 'light' ? lightTheme : darkTheme}>
        <GlobalStyles />
        <ErrorBoundary>
          <Suspense fallback={<PageLoading />}>
            <Router>
              <Routes>
                <Route
                  path="/"
                  element={
                    <Navigate
                      to={!degree.isComplete ? '/degree-wizard' : '/course-selector'}
                      replace
                    />
                  }
                />
                {inDev && <Route path="/landing-page" element={<LandingPage />} />}
                <Route path="/degree-wizard" element={<DegreeWizard />} />
                <Route path="/course-selector" element={<CourseSelector />} />
                {inDev && <Route path="/graphical-selector" element={<GraphicalSelector />} />}
                <Route path="/term-planner" element={<TermPlanner />} />
                <Route path="/progression-checker" element={<ProgressionChecker />} />
                <Route path="*" element={<Page404 />} />
              </Routes>
            </Router>
          </Suspense>
        </ErrorBoundary>
      </ThemeProvider>
    </ConfigProvider>
  );
};

export default App;
