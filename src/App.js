import React, { useState } from "react";
import { BrowserRouter as Router, Switch, Route, Link } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { updateDegree, resetDegree } from "./actions/updateDegree";
import { appendCourse, deleteCourse } from "./actions/updateCourses";
import { Menu, Layout } from "antd";
import "./App.less";
import ThemeToggle from "./components/ThemeToggle";
import Home from "./pages/Home";
import CourseSelector from "./pages/CourseSelector/CourseSelector";
import DegreeSelector from "./pages/DegreeSelector/DegreeSelector";
import TermPlanner from "./pages/TermPlanner/TermPlanner";
import ProgressionChecker from "./pages/ProgressionChecker/ProgressionChecker";

const { SubMenu } = Menu;
const { Header, Content } = Layout;

function App() {
  const [current, setCurrent] = useState("home");
  const theme = useSelector((state) => {
    return state.theme;
  });

  const handleClick = (e) => {
    console.log("click ", e);
    setCurrent(e.key);
  };

  return (
    <Router>
      <Header className="header">
        <Menu
          theme={theme}
          onClick={handleClick}
          selectedKeys={[current]}
          mode="horizontal"
          style={menuStyle}
        >
          <Menu.Item key="home" className="text">
            <span>Home </span>
            <Link to="/" />
          </Menu.Item>
          <Menu.Item key="degree" className="text">
            <span>Degree Selector </span>
            <Link to="/degree-selector" />
          </Menu.Item>
          <Menu.Item key="course" className="text">
            <span>Course Selector</span>
            <Link to="/course-selector" />
          </Menu.Item>
          <Menu.Item key="progression" className="text">
            <span>Progression Checker</span>
            <Link to="/progression-checker"></Link>
          </Menu.Item>
          <Menu.Item key="planner" className="text">
            <span>Term Planner</span>
            <Link to="/term-planner" />
          </Menu.Item>
        </Menu>
        <ThemeToggle />
      </Header>

      <Content className="content">
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
      </Content>
    </Router>
  );
}

const menuStyle = {
  backgroundColor: "inherit",
};

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
