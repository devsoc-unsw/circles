import React, { useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { useSelector } from 'react-redux';
import { useLocation, useNavigate } from 'react-router-dom';
import FeedbackButton from 'components/FeedbackButton';
import Header from 'components/Header';
import type { RootState } from 'config/store';

type Props = {
  children: React.ReactNode;
  showHeader?: boolean;
};

const PageTemplate = ({ children, showHeader = true }: Props) => {
  const navigate = useNavigate();

  const degree = useSelector((state: RootState) => state.degree);

  const { pathname } = useLocation();
  // redirect index page to course selector
  const route = pathname === '/' ? '/course-selector' : pathname;

  useEffect(() => {
    // check if this is a first time user
    navigate(!degree.isComplete ? '/degree-wizard' : route, { replace: true });
  }, [degree.isComplete, navigate, route]);

  return (
    <>
      <Helmet>
        <title>Circles</title>
        <meta name="description" content="Circles UNSW Degree Planner" />
        <meta name="keywords" content="circles, unsw, csesoc, degree, planner, course, plan" />
      </Helmet>
      {showHeader && <Header />}
      <div>
        {children}
        <FeedbackButton />
      </div>
    </>
  );
};

export default PageTemplate;
