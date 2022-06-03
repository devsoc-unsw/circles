import React, { useEffect, useState } from "react";
import {
  BrowserRouter as Router, Routes, Route,
} from "react-router-dom";
import { useSelector } from "react-redux";
import DegreeWizard from "./pages/DegreeWizard";
import CourseSelector from "./pages/CourseSelector";
import TermPlanner from "./pages/TermPlanner";
import ProgressionChecker from "./pages/ProgressionChecker";
import GraphicalSelector from "./pages/GraphicalSelector";
import "./App.less";
import PageLoading from "./components/PageLoading";
import "./axios";
import Header from "./components/Header";
import PageNotFound from "./pages/PageNotFound";

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
