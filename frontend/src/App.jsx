import React from "react";
import { BrowserRouter as Router, Switch, Route } from "react-router-dom";
import { Layout } from "antd";
import Header from './components/header/Header'
import CourseSelector from "./pages/CourseSelector/main";
import DegreeSelector from "./pages/DegreeSelector/main";
import ProgressionChecker from "./pages/ProgressionChecker/main";
import TermPlanner from "./pages/TermPlanner/main";
import "./App.less";

const { Content } = Layout;

function App() {
  return (
    <Router>
      <Header />
      <Content className="content">
        <Switch>
          <Route exact path="/">
            <DegreeSelector />
            {/* Change to term planner if user session active */}
          </Route>
          <Route path="/course-selector/:id?">
            <CourseSelector />
          </Route>
          <Route path="/term-planner">
            <TermPlanner />
          </Route>
          <Route path="/degree-selector">
            <DegreeSelector />
          </Route>
          <Route path="/progression-checker">
            <ProgressionChecker />
          </Route>
        </Switch>
      </Content>
    </Router>
  );
}

export default App;