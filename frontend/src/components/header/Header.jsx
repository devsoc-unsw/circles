import React from "react";
import { Link } from "react-router-dom";
import { Menu, Layout, Typography, Button, Drawer } from "antd";
import { DrawerContent } from "./DrawerContent";
import { PlannerCart } from "../plannerCart/PlannerCart";
import ThemeToggle from "../ThemeToggle";
import { BarsOutlined } from "@ant-design/icons";
import useMediaQuery from "../../hooks/useMediaQuery";
import circlesLogo from "../../images/circlesLogo.svg";
import "./header.less";

const menuStyles = {
  backgroundColor: "inherit",
  marginLeft: "auto",
  marginRight: "2em",
};

const titleStyles = {
  color: "white",
  marginLeft: "0.3em",
  marginBottom: "0",
};

const { Title } = Typography;
const Header = () => {
  const isSmall = useMediaQuery("(max-width: 1400px)");
  const [showDrawer, setShowDrawer] = React.useState(false);
  const [current, setCurrent] = React.useState(() => {
    const validPaths = new Set([
      "course-selector",
      "progression-checker",
      "degree-selector",
      "term-planner",
    ]);
    const menuPath = window.location.pathname.split("/")[1];
    if (validPaths.has(menuPath)) return menuPath;
    return null;
  });

  return (
    <Layout className="header">
      <Link to="degree-wizard">
        <div className="logo">
          <img alt="circles-logo" src={circlesLogo} width="40" height="40" />
          <Title level={3} style={titleStyles}>
            Circles
          </Title>
        </div>
      </Link>

      {isSmall ? (
        <Button
          type="primary"
          onClick={() => setShowDrawer(true)}
          icon={<BarsOutlined style={{ color: "#fff", fontSize: "1.7em" }} />}
        />
      ) : (
        <div className="header-content">
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
            <Menu.Item key="term-planner">
              <span>Term Planner</span>
              <Link to="/term-planner" />
            </Menu.Item>
            <Menu.Item key="progression-checker">
              <span>Progression Checker</span>
              <Link to="/progression-checker"></Link>
            </Menu.Item>
          </Menu>
          <PlannerCart />
          <ThemeToggle />
        </div>
      )}

      <Drawer
        onClose={() => setShowDrawer(false)}
        visible={showDrawer}
        className={"flex-col"}
      >
        <DrawerContent onCloseDrawer={() => setShowDrawer(false)} />
      </Drawer>
    </Layout>
  );
};

export default Header;
