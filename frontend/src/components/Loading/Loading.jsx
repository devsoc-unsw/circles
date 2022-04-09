import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import circlesLogo from "../../images/circlesWithBg.svg";
import "./loading.less";

const Loading = ({ setLoading }) => {
  const navigate = useNavigate();

  const location = useLocation();
  // redirect index page to course selector
  const route = location.pathname === "/" ? "course-selector" : location.pathname;

  React.useEffect(() => {
    setTimeout(() => {
      setLoading(false);
      // check if this is a first time user
      navigate(JSON.parse(localStorage.getItem("degree")) === null ? "/degree-wizard" : route);
    }, 750);
  });

  return (
    <div className="loadingPage">
      <img src={circlesLogo} alt="" className="loadingLogo pulse" />
    </div>
  );
};

export default Loading;
