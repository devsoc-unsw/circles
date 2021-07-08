import React, { useState } from "react";
import {
  BrowserRouter as Router,
  Switch,
  Route,
  Link
} from 'react-router-dom';
import "./App.less";
// import ThemeToggle from "./components/ThemeToggle";
import Home from './pages/Home';
import CourseSelector from "./pages/CourseSelector/CourseSelector";
import DegreeSelector from "./pages/DegreeSelector/DegreeSelector";
import TermPlanner from "./pages/TermPlanner/TermPlanner";
import ProgressionChecker from "./pages/ProgressionChecker/main";

function App() {
  return (
    <>
      <Router>
        <Switch>
          <Route exact path="/">
            <Home />
          </Route>
          <Route path="/course-selector">
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
      </Router>
    </>
  );
}

export default App;
