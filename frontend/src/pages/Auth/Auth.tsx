/* eslint-disable */
/* eslint no-console: "error" */

import React from 'react';
import './index.less';
import PageTemplate from 'components/PageTemplate';
import Container from './Container';
import { inDev } from 'config/constants';
import S from './styles'
import { GenerateUserToken, UserLogin, UserLogout } from 'utils/api/userApi';

const Auth = () => {
  return (
    <PageTemplate showHeader={false}>
      <Container onLoginHandle={UserLogin} />
      {inDev && (
        <>
          <S.TestButton onClick={() => GenerateUserToken(1)}>Set User #1</S.TestButton>
          <S.TestButton onClick={() => GenerateUserToken(2)}>Set User #2</S.TestButton>
          <S.TestButton onClick={() => GenerateUserToken(3)}>Set User #3</S.TestButton>
          <S.TestButton onClick={UserLogout}>Logout</S.TestButton>
        </>
      )}
    </PageTemplate>
  );
};

export default Auth;
