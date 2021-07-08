import React, { useState } from "react";
import { BrowserRouter as Router, Switch, Route, Link } from "react-router-dom";
import { useSelector } from "react-redux";
import { Menu, Layout, Typography } from "antd";
import "./App.less";
import ThemeToggle from "./components/ThemeToggle";
import Home from "./pages/Home";
import CourseSelector from "./pages/CourseSelector/CourseSelector";
import DegreeSelector from "./pages/DegreeSelector/DegreeSelector";
import ProgressionChecker from "./pages/ProgressionChecker/main";
import TermPlanner from "./pages/TermPlanner/main";
import circlesLogo from "./images/circlesLogo.svg";

const { Header, Content } = Layout;

function App() {
  const [current, setCurrent] = useState("progression");

  const handleClick = (e) => {
    setCurrent(e.key);
  };

  const { Title } = Typography;
  return (
    <Router>
      <Header className="header">
        <img src={circlesLogo} width="40" height="40" />
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