/* eslint-disable */
/* eslint no-console: "error" */

import React from 'react';
import PageTemplate from 'components/PageTemplate';
import Container from './Container';
import { inDev } from 'config/constants';
import S from './styles'
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { unsetIdentity } from 'reducers/identitySlice';

const Auth = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  return (
    <PageTemplate showHeader={false}>
      <Container />
      {inDev && (
        <S.TestButton onClick={() => { dispatch(unsetIdentity()); navigate('/'); }} >Logout</S.TestButton>
      )}
    </PageTemplate>
  );
};

export default Auth;
