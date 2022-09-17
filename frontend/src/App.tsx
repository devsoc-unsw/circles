import React, { Suspense } from 'react';
import { useSelector } from 'react-redux';
import {
  BrowserRouter as Router, Route,
  Routes,
} from 'react-router-dom';
import { ThemeProvider } from 'styled-components';
import PageLoading from 'components/PageLoading';
import type { RootState } from 'config/store';
import { darkTheme, GlobalStyles, lightTheme } from 'config/theme';
import './App.less';
import './config/axios';
// stylesheets for antd library
import 'antd/dist/antd.less';

// Lazy load in pages
const ErrorBoundary = React.lazy(() => import('./components/ErrorBoundary'));
const CourseSelector = React.lazy(() => import('./pages/CourseSelector'));
const DegreeWizard = React.lazy(() => import('./pages/DegreeWizard'));
const GraphicalSelector = React.lazy(() => import('./pages/GraphicalSelector'));
const Page404 = React.lazy(() => import('./pages/Page404'));
const ProgressionChecker = React.lazy(() => import('./pages/ProgressionChecker'));
const TermPlanner = React.lazy(() => import('./pages/TermPlanner'));

const App = () => {
  const { theme } = useSelector((state: RootState) => state.settings);

  return (
    <ThemeProvider theme={theme === 'light' ? lightTheme : darkTheme}>
      <GlobalStyles />
      <Suspense fallback={<PageLoading />}>
        <ErrorBoundary>
          <Router>
            <Routes>
              <Route path="/degree-wizard" element={<DegreeWizard />} />
              <Route path="/course-selector" element={<CourseSelector />} />
              <Route path="/graphical-selector" element={<GraphicalSelector />} />
              <Route path="/term-planner" element={<TermPlanner />} />
              <Route path="/progression-checker" element={<ProgressionChecker />} />
              <Route path="*" element={<Page404 />} />
            </Routes>
          </Router>
        </ErrorBoundary>
      </Suspense>
    </ThemeProvider>
  );
};

export default App;
