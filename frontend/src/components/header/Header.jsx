import React from "react";
import { Link } from 'react-router-dom'
import { useSelector } from "react-redux";
import { Menu, Layout, Typography } from "antd";
import { PlannerCart } from '../plannerCart/PlannerCart'
import ThemeToggle from "../ThemeToggle";
import circlesLogo from "../../images/circlesLogo.svg"
import "./header.less"

const menuStyles = {
  backgroundColor: "inherit",
  marginLeft: "auto",
  marginRight: "2em",
};

const titleStyles = {
  marginLeft: "0.3em",
  marginBottom: "0",
};

const { Title } = Typography
const Header = () => {
    const userDegree = useSelector(store => store.degree);
    const [current, setCurrent] = React.useState(() => {
      const validPaths = new Set(['course-selector', 'progression-checker', 'degree-selector', 'term-planner']);
      const menuPath = window.location.pathname.split('/')[1]
      if (validPaths.has(menuPath)) return menuPath;
      return 'progression-checker'
    });
    return (
        <Layout className="header">
          <div className="logo">
            <img alt="circles-logo" src={circlesLogo} width="40" height="40" />
            <Title level={3} style={titleStyles}>
              Circles
            </Title>
          </div>
          <div className='header-content'>
            { userDegree !== null && ( 
              <Menu
                theme="dark"
                onClick={(e) => setCurrent(e.key)}
                selectedKeys={[current]}
                mode="horizontal"
                style={menuStyles}
                >
                  <Menu.Item key="course-selector">
                    <span>Course Selector</span>
                    <Link to="/course-selector" />
                  </Menu.Item>
                  <Menu.Item key="progression-checker">
                    <span>Progression Checker</span>
                    <Link to="/progression-checker"></Link>
                  </Menu.Item>
                  <Menu.Item key="term-planner">
                    <span>Term Planner</span>
                    <Link to="/term-planner" />
                  </Menu.Item>
              </Menu>
            )} 
            <PlannerCart/>
            <ThemeToggle />
          </div>
        </Layout>
    )
}


export default Header;