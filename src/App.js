import React, { useState } from "react";
import {
  BrowserRouter as Router,
  Switch,
  Route,
  Link
} from 'react-router-dom';
import { useSelector, useDispatch } from "react-redux";
import { updateDegree, resetDegree } from "./actions/updateDegree";
import { appendCourse, deleteCourse } from "./actions/updateCourses";
import { Button, Menu } from "antd";
import { MailOutlined, AppstoreOutlined, SettingOutlined } from '@ant-design/icons';
import "./App.less";
import ThemeToggle from "./components/ThemeToggle";
import Home from './pages/Home';
import CourseSelector from "./pages/CourseSelector/CourseSelector";
import DegreeSelector from "./pages/DegreeSelector/main";
import TermPlanner from "./pages/TermPlanner/TermPlanner";
import ProgressionChecker from "./pages/ProgressionChecker/ProgressionChecker";

const { SubMenu } = Menu;

function App() {
  const [current, setCurrent] = useState('mail');
  // Note: You can access the state from any component since it is passed down from root!
  const degree = useSelector((state) => {
    return state.degree;
  });

  const dispatch = useDispatch();

  const handleClick = (e) => {
    console.log('click ', e);
    setCurrent(e.key);
  };

  return (
    <>
      <Router>
        <Menu onClick={handleClick} selectedKeys={[current]} mode="horizontal">
          <Menu.Item key="home">
            <Link to="/">Home</Link>
          </Menu.Item>
          <Menu.Item key="degree">
            <Link to="/degree-selector">Degree Selector</Link>
          </Menu.Item>
          <Menu.Item key="course">
            <Link to="/course-selector">Course Selector</Link>
          </Menu.Item>
          <Menu.Item key="progression">
            <Link to="/progression-checker">Progression Checker</Link>
          </Menu.Item>
          <Menu.Item key="planner">
            <Link to="/term-planner">Term Planner</Link>
          </Menu.Item>
          <Menu.Item key="toggle">
            <ThemeToggle />
          </Menu.Item>
        </Menu>
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

// How I imagine dispatch works
// dispatch(data) {
//   for (action in action) {
//     if data.type = action {
//       runReducer(data.params);
//     }
//   }
// }

// Click a button
// Run a function (Reducer)
// pass in action with information -> action.type  (Action)
// Run the function which has the same type as action.type ()
// Update the store (global store) with the next data
// When any value within the store changes, components which use this value will re-render

export default App;
