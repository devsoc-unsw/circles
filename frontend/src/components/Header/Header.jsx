import React, { useState } from "react";
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

const { Title } = Typography;

const Header = () => {
  const isSmall = useMediaQuery("(max-width: 1000px)");
  const [showDrawer, setShowDrawer] = useState(false);
  const { pathname } = useLocation();

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
          icon={<BarsOutlined style={{ color: "#fff", fontSize: "1.7rem" }} />}
        />
      ) : (
        <S.HeaderContent>
          <Menu
            theme="dark"
            selectedKeys={[pathname.split("/")[1]]}
            mode="horizontal"
            overflowedIndicator={null}
            style={{
              backgroundColor: "inherit",
            }}
          >
            <Menu.Item key="course-selector">
              <Link to="/course-selector">Course Selector</Link>
            </Menu.Item>
            {
              inDev && (
                <Menu.Item key="graphical-selector">
                  <Link to="/graphical-selector">Graphical Selector</Link>
                </Menu.Item>
              )
            }
            <Menu.Item key="term-planner">
              <Link to="/term-planner">Term Planner</Link>
            </Menu.Item>
            {
              inDev && (
                <Menu.Item key="progression-checker">
                  <Link to="/progression-checker">Progression Checker</Link>
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
