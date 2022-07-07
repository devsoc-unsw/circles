/* eslint-disable */
/* eslint no-console: "error" */

import React, { useEffect } from "react";
// import MetaTags from "react-meta-tags";
import "./index.less";

const Auth = () => {
  const handleCallbackResponse = (response) => {
    const jwt = response.credential;
    console.log(jwt);
    return jwt;
  };

  useEffect(() => {
    /* global google */
    google.accounts.id.initialize({
      clientId: "696494854262-hlrt28hbdmq1imp99dafbkvcgo9b5ld0.apps.googleusercontent.com",
      callback: handleCallbackResponse,
    });

    google.accounts.id.renderButton(
      document.getElementById("signInDiv"),
      { theme: "outline", size: "large" },
    );
  }, []);

  return (
    <div>
      <div id="signInDiv" />
    </div>
  );
};
  // const [reload, setReload] = useState(false);
  //
  // const refreshPage = () => {
  //   setReload(reload);
  // };
  //
  // return (
  //   <div>
  //     <MetaTags>
  //       <title>
  //         Circles Login
  //       </title>
  //       <meta
  //         name="google-signin-client_id"
  //         content="696494854262-hlrt28hbdmq1imp99dafbkvcgo9b5ld0.apps.googleusercontent.com"
  //       />
  //     </MetaTags>
  //     <h1> IN </h1>
  //     <div className="g-signin2" data-onsuccess="onSignIn" />
  //
  //     {/* Google Library */}
  //     <script src="https://apis.google.com/js/platform.js" async defer />
  //   </div>
  // );

export default Auth;
