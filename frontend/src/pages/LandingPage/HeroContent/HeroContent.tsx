import React from 'react';
import { ArrowRightOutlined } from '@ant-design/icons';
import cselogo from 'assets/cselogo.png';
import subTitle from 'assets/landingHero/easy.svg';
import S from './styles';

const HeroContent = () => (
  <S.HeroContent>
    <S.HeroTitle animate={{ x: [-60, 10, 0] }} transition={{ duration: 1, ease: 'easeInOut' }}>
      Degree planning made <S.HeroSubTitle src={subTitle} alt="Hero Subtitle" />
    </S.HeroTitle>
    <S.HeroCTA
      initial={{ scale: 0.0 }}
      animate={{ scale: 1 }}
      transition={{ type: 'spring', stiffness: 400, damping: 10 }}
      whileHover={{ scale: 1.1 }}
    >
      START
      <ArrowRightOutlined style={{ strokeWidth: '5rem', stroke: '#9453e6' }} />
    </S.HeroCTA>
    <S.CSELogo
      src={cselogo}
      alt="CSE Logo"
      initial={{ opacity: 0, scale: 0.5, x: 100 }}
      animate={{ opacity: 1, scale: 1, x: 0 }}
      transition={{ duration: 1 }}
    />
  </S.HeroContent>
);

export default HeroContent;
