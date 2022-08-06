import type { Dispatch, SetStateAction } from 'react';
import React, { useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useLocation, useNavigate } from 'react-router-dom';
import circlesLogo from 'assets/circlesWithBg.svg';
import { RootState } from 'config/store';
import S from './styles';

type Props = {
  setLoading: Dispatch<SetStateAction<boolean>>
};

const PageLoading = ({ setLoading }: Props) => {
  const navigate = useNavigate();

  const degree = useSelector((state: RootState) => state.degree);

  const { pathname } = useLocation();
  // redirect index page to course selector
  const route = pathname === '/' ? '/course-selector' : pathname;

  useEffect(() => {
    setTimeout(() => {
      // check if this is a first time user
      navigate(!degree.isComplete ? '/degree-wizard' : route);
      setLoading(false);
    }, 750);
  }, []);

  return (
    <S.PageWrapper>
      <S.LoadingLogo src={circlesLogo} alt="Circles Logo" />
    </S.PageWrapper>
  );
};

export default PageLoading;
