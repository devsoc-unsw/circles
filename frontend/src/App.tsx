/* eslint-disable */
import React, { Suspense } from 'react';
import { QueryClient, QueryClientProvider, useQueryClient } from 'react-query';
import { useSelector } from 'react-redux';
import { BrowserRouter as Router, Navigate, Route, Routes, Link } from 'react-router-dom';
import { ThemeProvider } from 'styled-components';
import ErrorBoundary from 'components/ErrorBoundary';
import PageLoading from 'components/PageLoading';
import { inDev } from 'config/constants';
import type { RootState } from 'config/store';
import { darkTheme, GlobalStyles, lightTheme } from 'config/theme';
import './config/axios';
// stylesheets for antd library
import 'antd/dist/antd.less';
import TokenPlayground from 'pages/TokenPlayground';
import RequireToken from 'components/Auth/RequireToken';
import LoginSuccess from 'pages/LoginSuccess';
import IdentityProvider from 'components/Auth/IdentityProvider';

// Lazy load in pages
const LandingPage = React.lazy(() => import('./pages/LandingPage'));
const CourseSelector = React.lazy(() => import('./pages/CourseSelector'));
const DegreeWizard = React.lazy(() => import('./pages/DegreeWizard'));
const GraphicalSelector = React.lazy(() => import('./pages/GraphicalSelector'));
const Page404 = React.lazy(() => import('./pages/Page404'));
const ProgressionChecker = React.lazy(() => import('./pages/ProgressionChecker'));
const TermPlanner = React.lazy(() => import('./pages/TermPlanner'));
const Auth = React.lazy(() => import('./pages/Auth'));

const Dummy = () => {
  return <div>
    <Link to="/tokens">tokens</Link>
  </div>
}

const App = () => {
  const { theme } = useSelector((state: RootState) => state.settings);

  const degree = useSelector((state: RootState) => state.degree);

  // const queryClient = useQueryClient();
  const queryClient: QueryClient = new QueryClient();

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider theme={theme === 'light' ? lightTheme : darkTheme}>
        <GlobalStyles />
        <ErrorBoundary>
          <Suspense fallback={<PageLoading />}>
            <Router>
              <Routes>
                <Route element={<IdentityProvider />}>
                  <Route path="/tokens" element={<TokenPlayground />} />
                  <Route element={<RequireToken />}>
                    <Route path="/token-required" element={<Dummy />} />
                  </Route>
                  <Route element={<RequireToken needSetup />}>
                    <Route path="/token-needsetup" element={<Dummy />} />
                  </Route>
                </Route>

                <Route
                  path="/"
                  element={
                    !degree.isComplete ? (
                      <LandingPage />
                    ) : (
                      <Navigate to="/course-selector" replace />
                    )
                  }
                />
                {inDev && <Route path="/login/success/csesoc" element={<LoginSuccess />} />}
                {inDev && <Route path="/login" element={<Auth />} />}
                {/* <Route element={<RequireToken />}> */}
                  <Route path="/degree-wizard" element={<DegreeWizard />} />
                {/* </Route> */}
                {/* <Route element={<RequireToken needSetup />}> */}
                  <Route path="/course-selector" element={<CourseSelector />} />
                  {inDev && <Route path="/graphical-selector" element={<GraphicalSelector />} />}
                  <Route path="/term-planner" element={<TermPlanner />} />
                  <Route path="/progression-checker" element={<ProgressionChecker />} />
                {/* </Route> */}
                <Route path="*" element={<Page404 />} />
              </Routes>
            </Router>
          </Suspense>
        </ErrorBoundary>
      </ThemeProvider>
    </QueryClientProvider>
  );
};

export default App;
