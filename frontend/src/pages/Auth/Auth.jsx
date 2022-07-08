/* eslint-disable */
/* eslint no-console: "error" */

import React, { useState, useEffect } from "react";
import axiosRequest from "config/axios";
import jwt_decode from "jwt-decode";

// import MetaTags from "react-meta-tags";
import "./index.less";

const Auth = () => {

  const [userObject, setUserObject] = useState({});

  const handleCallbackResponse = (response) => {
    const jwt = response.credential;
    console.log(jwt_decode(jwt));
    // if (requestLogin(jwt).err) {
    //   console.log("failed: ", jwt)
    //   return;
    // }
    console.log("callBackResponse with jwt: ", jwt);
    setUserObject(jwt_decode(jwt));

    return jwt;
  };

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


  useEffect(() => {
    /* global google */
    google.accounts.id.initialize({
      client_id: "1017197944285-i4ov50aak72667j31tuieffd8o2vd5md.apps.googleusercontent.com",
      callback: handleCallbackResponse,
    });

    google.accounts.id.renderButton(
      document.getElementById("signInDiv"),
      { theme: "outline", size: "large" },
    );

    // recent acc prompt
    google.accounts.id.prompt();
  }, []);

  return (
    <div>
      <div id="signInDiv" />
    </div>
  );
};

export default Auth;
