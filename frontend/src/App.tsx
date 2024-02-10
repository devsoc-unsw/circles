/* eslint-disable */
import React, { Suspense } from 'react';
import { QueryClient, QueryClientConfig, QueryClientProvider } from 'react-query';
import { useSelector } from 'react-redux';
import { BrowserRouter as Router, Navigate, Route, Routes, Link } from 'react-router-dom';
import { ThemeProvider } from 'styled-components';
import ErrorBoundary from 'components/ErrorBoundary';
import PageLoading from 'components/PageLoading';
import { inDev } from 'config/constants';
import type { RootState } from 'config/store';
import { App as AntdApp, ConfigProvider, theme as antdTheme } from 'antd';
import { darkTheme, GlobalStyles, lightTheme } from 'config/theme';
import './config/axios';
// stylesheets for antd library
import TokenPlayground from 'pages/TokenPlayground';
import RequireToken from 'components/Auth/RequireToken';
import LoginSuccess from 'pages/LoginSuccess';
import IdentityProvider from 'components/Auth/IdentityProvider';
import 'antd/dist/reset.css';
import Auth from 'pages/Auth/Auth';

// Lazy load in pages
const LandingPage = React.lazy(() => import('./pages/LandingPage'));
const CourseSelector = React.lazy(() => import('./pages/CourseSelector'));
const DegreeWizard = React.lazy(() => import('./pages/DegreeWizard'));
const GraphicalSelector = React.lazy(() => import('./pages/GraphicalSelector'));
const Page404 = React.lazy(() => import('./pages/Page404'));
const ProgressionChecker = React.lazy(() => import('./pages/ProgressionChecker'));
const TermPlanner = React.lazy(() => import('./pages/TermPlanner'));

const Dummy = () => {
  return <div>
    <Link to="/tokens">tokens</Link>
  </div>
}

const CLIENT_CONFIG: QueryClientConfig = { 
  defaultOptions: { 
    queries: { 
      refetchOnWindowFocus: false,
    } 
  } 
}

const App = () => {
  const { theme, token } = useSelector((state: RootState) => state.settings);

  const [queryClient] = React.useState(() => new QueryClient(CLIENT_CONFIG));

  return (
    <ConfigProvider theme={{
      token: {
        colorPrimary: '#51258f',
      },
      algorithm: theme === 'dark' ? antdTheme.darkAlgorithm: antdTheme.defaultAlgorithm,
      
    }}>
      <AntdApp>
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
                        !token ? (
                          <LandingPage />
                        ) : (
                          <Navigate to="/course-selector" replace />
                        )
                      }
                    />
                    {inDev && <Route path="/login/success/csesoc" element={<LoginSuccess />} />}
                    {inDev && <Route path="/login" element={<Auth />} />}
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
        </QueryClientProvider>
      </AntdApp>
    </ConfigProvider>
  );
};

export default App;
