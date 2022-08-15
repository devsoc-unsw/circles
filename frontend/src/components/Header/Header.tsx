import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import BarsOutlined from '@ant-design/icons/BarsOutlined';
import Button from 'antd/lib/button';
import Drawer from 'antd/lib/drawer';
import Menu from 'antd/lib/menu';
import Typography from 'antd/lib/typography';
import circlesLogo from 'assets/circlesLogo.svg';
import PlannerCart from 'components/PlannerCart';
import ThemeToggle from 'components/ThemeToggle';
import { inDev } from 'config/constants';
import useMediaQuery from 'hooks/useMediaQuery';
import DrawerContent from './DrawerContent';
import routes from './routes';
import S from './styles';

const { Title } = Typography;

const Header = () => {
  const isSmall = useMediaQuery('(max-width: 1000px)');
  const [showDrawer, setShowDrawer] = useState(false);
  const { pathname } = useLocation();
  const navigate = useNavigate();

  const smallHeader = (
    <S.HeaderContent>
      {inDev && <ThemeToggle />}
      <div style={{ margin: '10px' }}>
        <Button
          type="primary"
          size="large"
          onClick={() => setShowDrawer(true)}
          icon={<BarsOutlined style={{ color: '#fff', fontSize: '1.7rem' }} />}
        />
      </div>
    </S.HeaderContent>
  );

  const items = routes
    .filter((route) => !route.dev || inDev) // filter out in dev features if not in dev mode
    .map((route) => ({
      label: route.label,
      key: route.link,
    }));

  const largeHeader = (
    <S.HeaderContent>
      <Menu
        theme="dark"
        selectedKeys={[pathname]}
        mode="horizontal"
        overflowedIndicator={null}
        style={{
          backgroundColor: 'inherit',
        }}
        onClick={(e) => navigate(e.key)}
        items={items}
      />
      {inDev && <ThemeToggle />}
      <PlannerCart />
    </S.HeaderContent>
  );

  return (
    <S.HeaderWrapper>
      <Link to="/degree-wizard">
        <S.LogoWrapper>
          <img alt="circles-logo" src={circlesLogo} width="40" height="40" />
          <Title
            level={3}
            style={{
              color: 'white',
              marginLeft: '0.3em',
              marginBottom: '0',
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
      >
        <DrawerContent onCloseDrawer={() => setShowDrawer(false)} />
      </Drawer>
    </S.HeaderWrapper>
  );
};

export default Header;
