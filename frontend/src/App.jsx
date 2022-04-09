import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Layout } from "antd";
import { FeedbackBtn } from "./components/feedbackBtn/FeedbackBtn";
import Header from "./components/header/Header";
import CourseSelector from "./pages/CourseSelector/main";
import DegreeWizard from "./pages/DegreeWizard/main";
import ProgressionChecker from "./pages/ProgressionChecker/main";
import TermPlanner from "./pages/TermPlanner/main";
import "./App.less";
import Loading from "./components/Loading/Loading";
import "./axios";

const { Content } = Layout;

const App = () => {
  const [loading, setLoading] = React.useState(true);

  // light mode is always on
  document.body.classList.add("light");

  return (
    <Router>
      {loading ? (
        <Loading setLoading={setLoading} />
      ) : (
        <Content className="app-root content">
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
          <FeedbackBtn />
        </Content>
      )}
    </Router>
  );
}

export default App;
