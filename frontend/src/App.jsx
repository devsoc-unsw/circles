import React, { useState } from "react";
import {
  BrowserRouter as Router, Routes, Route,
} from "react-router-dom";
import Header from "./components/header/Header";
import CourseSelector from "./pages/CourseSelector/main";
import DegreeWizard from "./pages/DegreeWizard/main";
import ProgressionChecker from "./pages/ProgressionChecker/main";
import TermPlanner from "./pages/TermPlanner/main";
import "./App.less";
import Loading from "./components/Loading/Loading";
import "./axios";

const App = () => {
  const [loading, setLoading] = useState(true);

  return (
    <Router>
      {loading ? (
        <Loading setLoading={setLoading} />
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
