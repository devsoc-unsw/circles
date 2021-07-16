import React from "react";
import { BrowserRouter as Router, Switch, Route, Link } from "react-router-dom";
import { Menu, Layout, Typography } from "antd";
import { useDispatch } from "react-redux";
import { courseOptionsActions } from './actions/courseOptionsActions';
import { updateDegree } from './actions/updateDegree';
// import { plannerActions } from "./actions/plannerActions";
import ThemeToggle from "./components/ThemeToggle";
import CourseSelector from "./pages/CourseSelector/main";
import DegreeSelector from "./pages/DegreeSelector/main";
import ProgressionChecker from "./pages/ProgressionChecker/main";
import TermPlanner from "./pages/TermPlanner/main";
import circlesLogo from "./images/circlesLogo.svg";
import "./App.less";

const { Title } = Typography;
const { Header, Content } = Layout; 
function App() {
  // TODO: [BUG] Sometimes the path doesn't match up with the navbar selected when we enter via path.
  const dispatch = useDispatch();
  const [current, setCurrent] = React.useState("progression");
  React.useEffect(() => {

    const savedCourseOptions = window.localStorage.getItem('courseOptions') || null;
    if (savedCourseOptions) dispatch(courseOptionsActions('LOAD_PREV_STATE', savedCourseOptions));
    
    const savedDegree = window.localStorage.getItem('degree') || null;
    if (savedDegree) dispatch(updateDegree(savedDegree))
  
    // TODO: Need to be implemented
    // const savedPlanner = window.localStorage.getItem('planner') || null;
    // if (savedPlanner) dispatch(plannerActions('LOAD_PREV_STATE', savedPlanner); 
  
    // const savedUsername = window.localStorage.getItem('username') || null;
    // if (savedUsername) dispatch(userActions('LOAD_PREV_STATE', savedUsername));  
  }, [])

  const handleClick = (e) => {
    setCurrent(e.key);
  };

  return (
    <Router>
      <Header className="header">
        <img alt="circles-logo" src={circlesLogo} width="40" height="40" />
        <Title level={3} style={titleStyles}>
          Circles
        </Title>
        <Menu
          theme="dark"
          onClick={handleClick}
          selectedKeys={[current]}
          mode="horizontal"
          style={menuStyles}
        >
          <Menu.Item key="degree">
            <span>Degree Selector </span>
            <Link to="/degree-selector" />
          </Menu.Item>
          <Menu.Item key="course">
            <span>Course Selector</span>
            <Link to="/course-selector" />
          </Menu.Item>
          <Menu.Item key="progression">
            <span>Progression Checker</span>
            <Link to="/progression-checker"></Link>
          </Menu.Item>
          <Menu.Item key="planner">
            <span>Term Planner</span>
            <Link to="/term-planner" />
          </Menu.Item>
        </Menu>
        <ThemeToggle />
      </Header>

      <Content>
        <Switch>
          <Route exact path="/">
            <DegreeSelector />
            {/* Change to term planner if user session active */}
          </Route>
          <Route path="/course-selector/:courseCode?" >
            <CourseSelector />
          </Route>
          <Route path="/term-planner/">
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

const menuStyles = {
  backgroundColor: "inherit",
  marginLeft: "auto",
  marginRight: "2em",
};

const titleStyles = {
  marginLeft: "0.3em",
  marginBottom: "0",
};

export default App;