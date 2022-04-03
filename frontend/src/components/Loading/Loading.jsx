import React from "react";
import circlesLogo from "../../images/circlesWithBg.svg";
import "./loading.less";
import { useLocation, useNavigate } from "react-router-dom";

function Loading({ setLoading }) {
  const navigate = useNavigate();

  const location = useLocation();
  // redirect index page to course selector
  let route = location.pathname === "/" ? "course-selector" : location.pathname;

  React.useEffect(() => {
    setTimeout(() => {
      setLoading(false);
      if (JSON.parse(localStorage.getItem("degree")) === null)
        // first-time user
        navigate("/degree-wizard");
      else navigate(route);
    }, 750);
  }, []);

  return (
    <div className="loadingPage">
      <img src={circlesLogo} alt="" className="loadingLogo pulse" />
    </div>
  );
}

export default Loading;
