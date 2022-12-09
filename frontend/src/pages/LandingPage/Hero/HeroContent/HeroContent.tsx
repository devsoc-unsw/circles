import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRightOutlined } from '@ant-design/icons';
import cseLogo from 'assets/csesocLogo.png';
import easySubTitle from 'assets/LandingPage/easySubtitle.svg';
import S from './styles';

const HeroContent = () => (
  <S.HeroContent>
    <S.HeroTitle animate={{ x: [-60, 10, 0] }} transition={{ duration: 1, ease: 'easeInOut' }}>
      Degree planning made <S.HeroSubTitle src={easySubTitle} alt="Hero Subtitle" />
    </S.HeroTitle>
    <S.HeroCTA
      initial={{ scale: 0.0 }}
      animate={{ scale: 1 }}
      transition={{ type: 'spring', stiffness: 400, damping: 10 }}
      whileHover={{ scale: 1.1 }}
    >
      <Link to="/degree-wizard">START</Link>
      <ArrowRightOutlined style={{ strokeWidth: '5rem', stroke: '#9453e6' }} />
    </S.HeroCTA>
    <S.CSELogo
      src={cseLogo}
      alt="CSE Logo"
      initial={{ opacity: 0, scale: 0.5, x: 100 }}
      animate={{ opacity: 1, scale: 1, x: 0 }}
      transition={{ duration: 1 }}
    />
  </S.HeroContent>
);

export default HeroContent;
