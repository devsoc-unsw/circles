import React from 'react';
import { Helmet } from 'react-helmet';
import { useSelector } from 'react-redux';
import { Navigate, useLocation } from 'react-router-dom';
import FeedbackButton from 'components/FeedbackButton';
import Header from 'components/Header';
import { RootState } from 'config/store';

type Props = {
  children: React.ReactNode;
  showHeader?: boolean;
};

const PageTemplate = ({ children, showHeader = true }: Props) => {
  const { pathname } = useLocation();
  const degree = useSelector((state: RootState) => state.degree);

  if (!degree.isComplete && pathname !== '/degree-wizard') return <Navigate to="/" replace />;

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
