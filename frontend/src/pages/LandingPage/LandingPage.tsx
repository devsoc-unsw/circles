import React from 'react';
import { ArrowRightOutlined } from '@ant-design/icons';
import circlesLogo from 'assets/circlesLogo.svg';
import cselogo from 'assets/cselogo.png';
import S from './styles';

const LandingPage = () => (
  <div>
    <S.BackgroundWrapper>
      <S.Background />
      <S.Background2 />
    </S.BackgroundWrapper>
    <S.Header
      animate={{ y: 0 }}
      initial={{ y: -40 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
    >
      <S.HeaderLogo src={circlesLogo} alt="Circles Logo" />
      <S.HeaderTitle>circles</S.HeaderTitle>
      <S.LoginButton>Sign in</S.LoginButton>
    </S.Header>
    <S.Wrapper>
      <S.HeroContent>
        <S.HeroTitle animate={{ x: [-60, 10, 0] }} transition={{ ease: 'easeOut' }}>
          Degree planning made <span>easy.</span>
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
      <S.LandingLogo
        src={circlesLogo}
        alt="Circles Logo"
        animate={{ y: 60 }}
        initial={{ y: -40 }}
        transition={{
          duration: 2,
          ease: 'easeInOut',
          yoyo: Infinity
        }}
      />
    </S.Wrapper>
  </div>
);

export default LandingPage;
