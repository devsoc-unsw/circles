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
      <Content className="content">
        <Switch>
          <Route exact path="/">
            <DegreeSelector />
            {/* Change to term planner if user session active */}
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

export default App;