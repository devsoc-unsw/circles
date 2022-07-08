import React, { useState } from "react";
import { BarsOutlined } from "@ant-design/icons";
import {
  Button, Drawer,
  Menu, Typography,
} from "antd";
import Link from "next/link";
import { useRouter } from "next/router";
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
  const { pathname } = useRouter();

  const smallHeader = (
    <S.HeaderContent>
      {inDev && <ThemeToggle />}
      <div style={{ margin: "10px" }}>
        <Button
          type="primary"
          size="large"
          onClick={() => setShowDrawer(true)}
          icon={<BarsOutlined style={{ color: "#fff", fontSize: "1.7rem" }} />}
        />
      </div>
    </S.HeaderContent>
  );

  const largeHeader = (
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
          <Link href="/course-selector">Course Selector</Link>
        </Menu.Item>
        {
          inDev && (
            <Menu.Item key="graphical-selector">
              <Link href="/graphical-selector">Graphical Selector</Link>
            </Menu.Item>
          )
        }
        <Menu.Item key="term-planner">
          <Link href="/term-planner">Term Planner</Link>
        </Menu.Item>
        {
          inDev && (
            <Menu.Item key="progression-checker">
              <Link href="/progression-checker">Progression Checker</Link>
            </Menu.Item>
          )
        }
      </Menu>
      {inDev && <ThemeToggle />}
      <PlannerCart />
    </S.HeaderContent>
  );

  return (
    <S.HeaderWrapper>
      <Link href="/degree-wizard">
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

      {isSmall ? smallHeader : largeHeader}

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
