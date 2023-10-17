import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { ArrowRightOutlined } from '@ant-design/icons';
import { Space } from 'antd';
import { checkTokenStatus, TokenStatus } from 'utils/api/auth';
import devsocLogo from 'assets/devsocLogo.svg';
import easySubTitle from 'assets/LandingPage/easySubtitle.svg';
import { RootState } from 'config/store';
import S from './styles';

const HeroContent = () => {
  // determine our next location
  const [nextPage, setNextPage] = useState<string>('/');
  const token = useSelector((state: RootState) => state.settings.token);
  useEffect(() => {
    const determineNextPage = async () => {
      // TODO: on very first load since storage hasnt yet finished setting up, will get undefined errors
      // const token = await getToken();
      const tokenStatus = await checkTokenStatus(token);
      switch (tokenStatus) {
        case TokenStatus.UNSET:
        case TokenStatus.INVALID:
          setNextPage('/login');
          break;
        case TokenStatus.NOTSETUP:
          setNextPage('/degree-wizard');
          break;
        case TokenStatus.VALID:
          setNextPage('/term-planner');
          break;
        default:
          break;
      }
    };
    determineNextPage();
  }, [token]);

  return (
    <S.HeroContent>
      <S.HeroTitle animate={{ x: [-60, 10, 0] }} transition={{ duration: 1, ease: 'easeInOut' }}>
        Degree planning made <S.HeroSubTitle src={easySubTitle} alt="Hero Subtitle" />
      </S.HeroTitle>
      <Link to={nextPage}>
        <S.HeroCTA
          initial={{ scale: 0.0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', stiffness: 400, damping: 10 }}
          whileHover={{ scale: 1.1 }}
        >
          START WITH CSESOC <Space size="large" />
          <ArrowRightOutlined style={{ strokeWidth: '5rem', stroke: '#9453e6' }} />
        </S.HeroCTA>
      </Link>
      <S.DevSocLogo
        src={devsocLogo}
        alt="DevSoc Logo"
        initial={{ opacity: 0, scale: 0.5, x: 100 }}
        animate={{ opacity: 1, scale: 1, x: 0 }}
        transition={{ duration: 1 }}
      />
    </S.HeroContent>
  );
};

export default HeroContent;
