import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import {
  BrowserRouter as Router, Route,
  Routes,
} from "react-router-dom";
import Header from "./components/Header";
import PageLoading from "./components/PageLoading";
import CourseSelector from "./pages/CourseSelector";
import DegreeWizard from "./pages/DegreeWizard";
import GraphicalSelector from "./pages/GraphicalSelector";
import PageNotFound from "./pages/PageNotFound";
import ProgressionChecker from "./pages/ProgressionChecker";
import TermPlanner from "./pages/TermPlanner";
import "./App.less";
import "./config/axios";

const App = () => {
  const [loading, setLoading] = useState(true);
  const theme = useSelector((state) => state.theme);

  useEffect(() => {
    // initialise theme
    document.body.classList.add(theme);
    document.body.classList.remove(theme === "light" ? "dark" : "light");
  }, [theme]);

  return (
    <Router>
      {loading ? (
        <PageLoading setLoading={setLoading} />
      ) : (
        <Routes>
          <Route path="/degree-wizard" element={<DegreeWizard />} />
          <Route
            path="/course-selector"
            element={(
              <div>
                <Header />
                <CourseSelector />
              </div>
            )}
          />
          <Route
            path="/graphical-selector"
            element={(
              <div>
                <Header />
                <GraphicalSelector />
              </div>
            )}
          />
          <Route
            path="/term-planner"
            element={(
              <div>
                <Header />
                <TermPlanner />
              </div>
            )}
          />
          <Route
            path="/progression-checker"
            element={(
              <div>
                <Header />
                <ProgressionChecker />
              </div>
            )}
          />
          <Route
            path="*"
            element={(
              <div>
                <Header />
                <PageNotFound />
              </div>
            )}
          />
        </Routes>
      )}
    </Router>
  );
};

export default App;
