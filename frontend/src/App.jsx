import React from "react";
import { BrowserRouter as Router, Switch, Route } from "react-router-dom";
import { Layout, notification } from "antd";
import { FeedbackBtn } from "./components/feedbackBtn/FeedbackBtn";
import Header from "./components/header/Header";
import CourseSelector from "./pages/CourseSelector/main";
import DegreeWizard from "./pages/DegreeWizard/main";
import ProgressionChecker from "./pages/ProgressionChecker/main";
import TermPlanner from "./pages/TermPlanner/main";
import "./App.less";

const { Content } = Layout;

function App() {
  const openDisclaimer = () => {
    const args = {
      type: "warning",
      message: "Hey there!",
      description: "Circles is still in beta testing and not ready for use.",
      duration: 0,
      className: "text helpNotif",
    };
    notification.open(args);
  };

  React.useEffect(() => {
    openDisclaimer();
  }, []);
  return (
    <Router>
      <Header />
      <Content className="app-root content">
        <Switch>
          <Route exact path="/">
            <CourseSelector />
            {/* Change to term planner if user session active */}
          </Route>
          <Route path="/course-selector">
            <CourseSelector />
          </Route>
          <Route path="/term-planner">
            <TermPlanner />
          </Route>
          <Route path="/degree-wizard">
            <DegreeWizard />
          </Route>
          <Route path="/progression-checker">
            <ProgressionChecker />
          </Route>
        </Switch>
        <FeedbackBtn />
      </Content>
    </Router>
  );
}

export default App;
