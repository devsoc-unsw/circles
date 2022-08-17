import { useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useLocation, useNavigate } from 'react-router-dom';
import type { RootState } from 'config/store';

const PageLoading = () => {
  const navigate = useNavigate();

  const degree = useSelector((state: RootState) => state.degree);

  const { pathname } = useLocation();
  // redirect index page to course selector
  const route = pathname === '/' ? '/course-selector' : pathname;

  useEffect(() => {
    // check if this is a first time user
    navigate(!degree.isComplete ? '/degree-wizard' : route, { replace: true });
  }, [degree.isComplete, navigate, route]);

  return null;
};

export default PageLoading;
