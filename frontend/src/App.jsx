import React, { useState } from "react";
import {
  BrowserRouter as Router, Routes, Route,
} from "react-router-dom";
import CourseSelector from "./pages/CourseSelector/main";
import DegreeWizard from "./pages/DegreeWizard/main";
import ProgressionChecker from "./pages/ProgressionChecker/main";
import TermPlanner from "./pages/TermPlanner/main";
import "./App.less";
import PageLoading from "./components/PageLoading";
import "./axios";
import Header from "./components/Header";

const App = () => {
  const [loading, setLoading] = useState(true);

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
        </Routes>
      )}
    </Router>
  );
};

export default App;
