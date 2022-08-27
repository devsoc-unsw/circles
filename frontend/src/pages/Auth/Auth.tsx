/* eslint-disable */
/* eslint no-console: "error" */

import React, { useState, useEffect } from 'react';
// import axiosRequest from "config/axios";
import jwt_decode from 'jwt-decode';

// import MetaTags from "react-meta-tags";
import "./index.less";

const Auth = () => {
  const [userObject, setUserObject] = useState({})

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
    const jwt = response.credential;
    // Should not decode jwt yourself - just for testing
    console.log(jwt_decode(jwt));
    console.log("callBackResponse with jwt: ", jwt);
    setUserObject(jwt_decode(jwt));

    return 0;
  }

  useEffect(() => {
    (window as any).google.accounts.id.initialize({
      client_id: "1017197944285-i4ov50aak72667j31tuieffd8o2vd5md.apps.googleusercontent.com",
      callback: handleCallbackResponse,
    });

    (window as any).google.accounts.id.renderButton(
      document.getElementById("signInDiv"),
      { theme: "outline", size: "large" },
    );

    // recent acc prompt
    if (Object.keys(userObject).length === 0) {
      (window as any).google.accounts.id.prompt();
    }
  }, []);

  const LogoutButton = () => {
    const logout = () => {
      setUserObject({})
    };

    return (
      <div onClick={logout}>
        <h1> LOGOUT </h1>
      </div>
    );
  }
  interface Props {
    obj: any
  }
  const JsonObject = ({ obj }: Props) => {
    return (
      <div className="json-obj">
        {"{"}
          {
            Array.from(Object.entries(obj)).map(
              ([k, v]) => (
                <div className="json-obj-pair">
                  <span className="tab-char"></span>
                  <span className="json-obj-key">"{k}"</span>
                  :<span className="tab-char" />
                  <span className="json-obj-val">{v as string}</span>
                </div>
              )
            )
          }
        {"}"}
      </div>
    )
  }

  return (
    <div>
      {Object.keys(userObject).length === 0 ?
        (
          <div>
            <h1>NOT LOGGED IN</h1>
            <div id="signInDiv" />
          </div>
        )
        :
        (
          <div>
            <div> signed in </div>
            <div>
              <h2>Data:</h2>
              <JsonObject
                obj={userObject}
              />
            </div>
            <LogoutButton />
          </div>
        )
      }
    </div>
  );
};

export default Auth;
