/* eslint-disable */
/* eslint no-console: "error" */

import React, { useState, useEffect } from 'react';
// import axiosRequest from "config/axios";
import jwt_decode from 'jwt-decode';
import { useDispatch, useSelector } from 'react-redux';
import type { RootState } from 'config/store';
import { setToken } from 'reducers/settingsSlice';

// import MetaTags from "react-meta-tags";
import "./index.less";
import PageTemplate from 'components/PageTemplate';
import { useLocation, useParams, useSearchParams } from 'react-router-dom';

const LoginSuccess = () => {
  const location = useLocation();
  const params = useParams();
  const [query, _] = useSearchParams();
  console.log(location);
  console.log(params);
  console.log(query);

  return (
    <PageTemplate>
      <div>
        '{query.get('code')}'
      </div>
    </PageTemplate>
  );
};

export default LoginSuccess;
