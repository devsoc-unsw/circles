import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import {
  BrowserRouter as Router, Route,
  Routes,
} from "react-router-dom";
import { ThemeProvider } from "styled-components";
import { darkTheme, GlobalStyles, lightTheme } from "config/theme";
import PageLoading from "./components/PageLoading";
import CourseSelector from "./pages/CourseSelector";
import DegreeWizard from "./pages/DegreeWizard";
import GraphicalSelector from "./pages/GraphicalSelector";
import PageNotFound from "./pages/PageNotFound";
import ProgressionChecker from "./pages/ProgressionChecker";
import TermPlanner from "./pages/TermPlanner";
import Auth from "./pages/Auth";
import "./App.less";
import "./config/axios";

const App = () => {
  const [loading, setLoading] = useState(true);
  const { theme } = useSelector((state) => state.settings);

  useEffect(() => {
    // initialise theme
    document.body.classList.add(theme);
    document.body.classList.remove(theme === "light" ? "dark" : "light");
  }, [theme]);

  return (
    <ThemeProvider theme={theme === "light" ? lightTheme : darkTheme}>
      <GlobalStyles />
      <Router>
        {loading ? (
          <PageLoading setLoading={setLoading} />
        ) : (
          <Routes>
            <Route path="/degree-wizard" element={<DegreeWizard />} />
            <Route
              path="/course-selector"
              element={<CourseSelector />}
            />
            <Route
              path="/graphical-selector"
              element={<GraphicalSelector />}
            />
            <Route
              path="/term-planner"
              element={<TermPlanner />}
            />
            <Route
              path="/progression-checker"
              element={<ProgressionChecker />}
            />
            <Route
              path="/login"
              element={<Auth/>}
            />
            <Route
              path="*"
              element={<PageNotFound />}
            />
          </Routes>
        )}
      </Router>
    </ThemeProvider>
  );
};

export default App;
