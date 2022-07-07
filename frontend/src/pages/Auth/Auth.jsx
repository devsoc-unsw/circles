import React from "react";
import MetaTags from "react-meta-tags";
import "./index.less";

const Auth = () => (
  <div>
    <MetaTags>
      <meta
        name="google-signin-client_id"
        content="696494854262-hlrt28hbdmq1imp99dafbkvcgo9b5ld0.apps.googleusercontent.com"
      />
    </MetaTags>
    <h1>SIGN IN </h1>
    <script src="https://apis.google.com/js/platform.js" async defer />
  </div>
);

export default Auth;
