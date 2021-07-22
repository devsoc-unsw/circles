import React from "react";
import { useSelector } from "react-redux";
import { Menu, Layout, Typography } from "antd";
import ThemeToggle from "..ThemeToggle";
import circlesLogo from "../../images/circlesLogo";
import "./header.less"
export const Header = () => {
    const [current, setCurrent] = React.useState("progression");
    const userDegree = useSelector(store => store.degree);
    const handleClick = (e) => {
      setCurrent(e.key);
    };
    return (
        <Layout className="header">
          <div className="logo">
            <img alt="circles-logo" src={circlesLogo} width="40" height="40" />
            <Typography level={3} style={titleStyles}>
              Circles
            </Typography>
          </div>
          <div className='header-content'>
            { userDegree !== null && ( 
              <Menu
                theme="dark"
                onClick={handleClick}
                selectedKeys={[current]}
                mode="horizontal"
                style={menuStyles}
                >
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
            )} 
            <ThemeToggle />
          </div>
        </Layout>
    )
}