import React, { useEffect } from "react";
import { useSelector } from "react-redux";
import { useLocation, useNavigate } from "react-router-dom";
import circlesLogo from "../../assets/circlesWithBg.svg";
import { initialState } from "../../reducers/degreeSlice";
import "./index.less";

const PageLoading = ({ setLoading }) => {
  const navigate = useNavigate();

  const degree = useSelector((state) => state.degree);

  const location = useLocation();
  // redirect index page to course selector
  const route = location.pathname === "/" ? "course-selector" : location.pathname;

  useEffect(() => {
    setTimeout(() => {
      // check if this is a first time user
      navigate(JSON.stringify(degree) === JSON.stringify(initialState) ? "/degree-wizard" : route);
      setLoading(false);
    }, 750);
  }, []);

  return (
    <div className="loadingPage">
      <img src={circlesLogo} alt="" className="loadingLogo pulse" />
    </div>
  );
};

export default PageLoading;
