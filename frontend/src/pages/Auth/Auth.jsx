/* eslint-disable */
/* eslint no-console: "error" */

import React, { useEffect } from "react";
// import MetaTags from "react-meta-tags";
import "./index.less";
import jwt_decode from "jwt-decode";

const Auth = () => {
  const handleCallbackResponse = (response) => {
    const jwt = response.credential;
    console.log("callBackResponse with jwt: ", jwt);
    const userObj = jwt_decode(jwt);
    console.log(userObj);
    return jwt;
  };

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
