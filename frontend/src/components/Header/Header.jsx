import React, { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { BarsOutlined } from "@ant-design/icons";
import {
  Button, Drawer,
  Menu, Typography,
} from "antd";
import circlesLogo from "assets/circlesLogo.svg";
import PlannerCart from "components/PlannerCart";
import ThemeToggle from "components/ThemeToggle";
import { inDev } from "config/constants";
import useMediaQuery from "hooks/useMediaQuery";
import DrawerContent from "./DrawerContent";
import S from "./styles";
import "./index.less";

const getCurrentPath = () => {
  const validPaths = new Set([
    "course-selector",
    "progression-checker",
    "degree-selector",
    "term-planner",
  ]);
  const menuPath = window.location.pathname.split("/")[1];

  if (validPaths.has(menuPath)) return menuPath;
  return null;
};

const { Title } = Typography;

const Header = () => {
  const isSmall = useMediaQuery("(max-width: 1000px)");
  const [showDrawer, setShowDrawer] = useState(false);
  const [current, setCurrent] = useState(getCurrentPath());
  const url = useLocation();

  useEffect(() => {
    setCurrent(getCurrentPath());
  }, [url]);

  return (
    <S.HeaderWrapper>
      <Link to="/degree-wizard">
        <S.LogoWrapper>
          <img alt="circles-logo" src={circlesLogo} width="40" height="40" />
          <Title
            level={3}
            style={{
              color: "white",
              marginLeft: "0.3em",
              marginBottom: "0",
            }}
          >
            Circles
          </Title>
        </S.LogoWrapper>
      </Link>
      {isSmall ? (
        <Button
          type="primary"
          onClick={() => setShowDrawer(true)}
          icon={<BarsOutlined style={{ color: "#fff", fontSize: "1.7em" }} />}
        />
      ) : (
        <S.HeaderContent>
          <Menu
            theme="dark"
            onClick={(e) => setCurrent(e.key)}
            selectedKeys={[current]}
            mode="horizontal"
            overflowedIndicator={null}
            style={{
              backgroundColor: "inherit",
            }}
          >
            <Menu.Item key="course-selector">
              <span>Course Selector</span>
              <Link to="/course-selector" />
            </Menu.Item>
            {
              inDev && (
                <Menu.Item key="graphical-selector">
                  <span>Graphical Selector</span>
                  <Link to="/graphical-selector" />
                </Menu.Item>
              )
            }
            <Menu.Item key="term-planner">
              <span>Term Planner</span>
              <Link to="/term-planner" />
            </Menu.Item>
            {
              inDev && (
                <Menu.Item key="progression-checker">
                  <span>Progression Checker</span>
                  <Link to="/progression-checker" />
                </Menu.Item>
              )
            }
          </Menu>
          <PlannerCart />
          {inDev && <ThemeToggle />}
        </S.HeaderContent>
      )}

      <Drawer
        onClose={() => setShowDrawer(false)}
        visible={showDrawer}
        className="flex-col"
      >
        <DrawerContent onCloseDrawer={() => setShowDrawer(false)} />
      </Drawer>
    </S.HeaderWrapper>
  );
};

export default Header;
