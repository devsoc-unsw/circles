/* eslint-disable */
/* eslint no-console: "error" */

import React, { useState, useEffect } from 'react';
// import axiosRequest from "config/axios";
import jwt_decode from 'jwt-decode';
import { useDispatch, useSelector } from 'react-redux';
import type { RootState } from 'config/store';
import { setToken } from 'reducers/settingsSlice';

// import MetaTags from "react-meta-tags";
import './index.less';
import PageTemplate from 'components/PageTemplate';
import Container from './Container';
import { inDev } from 'config/constants';
import S from './styles';
import axios from 'axios';
import { generateUserToken, userLogin, userLogout } from 'utils/api/userApi';

const Auth = () => {
  const [userObject, setUserObject] = useState({});
  const [dummyToken, setDummyToken] = useState('');
  const { settings } = useSelector((state: RootState) => state);
  const dispatch = useDispatch();

  // const requestLogin = async (c) => {
  //   const [data, err] = await axiosRequest("get", `/courses/getCourse/${c}`);
  //   if (!err) {
  //     console.log("successfull login return", data);
  //   }
  // };
  //
  // const requestLogin = async (token) => {
  //   const [data, err] = await axiosRequest(
  //     "post",
  //     `/auth/login`,
  //     { token },
  //   );
  //   return { data, err };
  // };

  const handleCallbackResponse = (response: any) => {
    const jwt = response.credential as string;
    dispatch(setToken(jwt));
    // Should not decode jwt yourself - just for testing

    console.log(settings);
    console.log(jwt_decode(jwt));
    console.log('callBackResponse with jwt: ', jwt);
    setUserObject(jwt_decode(jwt));

    return 0;
  };

  useEffect(() => {
    (window as any).google.accounts.id.initialize({
      client_id: '1017197944285-i4ov50aak72667j31tuieffd8o2vd5md.apps.googleusercontent.com',
      callback: handleCallbackResponse
    });

    (window as any).google.accounts.id.renderButton(document.getElementById('signInDiv'), {
      theme: 'outline',
      size: 'large'
    });

    // recent acc prompt
    if (Object.keys(userObject).length === 0) {
      (window as any).google.accounts.id.prompt();
    }
  }, []);
  interface Props {
    obj: any;
  }
  const JsonObject = ({ obj }: Props) => {
    return (
      <div className="json-obj">
        {'{'}
        {Array.from(Object.entries(obj)).map(([k, v]) => (
          <div className="json-obj-pair">
            <span className="tab-char"></span>
            <span className="json-obj-key">"{k}"</span>
            :<span className="tab-char" />
            <span className="json-obj-val">{v as string}</span>
          </div>
        ))}
        {'}'}
      </div>
    );
  };

  return (
    <PageTemplate showHeader={false}>
      <Container onLoginHandle={userLogin}/>
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
