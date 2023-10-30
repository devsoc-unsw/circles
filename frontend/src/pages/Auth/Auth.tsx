/* eslint-disable */
/* eslint no-console: "error" */

import React from 'react';
import './index.less';
import PageTemplate from 'components/PageTemplate';
import Container from './Container';
import { inDev } from 'config/constants';
import S from './styles'
import { generateUserToken, userLogin, userLogout } from 'utils/api/userApi';

const Auth = () => {
  return (
    <PageTemplate showHeader={false}>
      <Container onLoginHandle={userLogin} />
      {inDev && (
        <>
          <S.TestButton onClick={() => generateUserToken(1)}>Set User #1</S.TestButton>
          <S.TestButton onClick={() => generateUserToken(2)}>Set User #2</S.TestButton>
          <S.TestButton onClick={() => generateUserToken(3)}>Set User #3</S.TestButton>
          <S.TestButton onClick={userLogout}>Logout</S.TestButton>
        </>
      )}
    </PageTemplate>
  );
};

export default Auth;
