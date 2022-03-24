import React from "react";
import circlesLogo from "../../images/circlesWithBg.svg";
import "./loading.less";
import { useLocation, useNavigate } from "react-router-dom";

function Loading({ setLoading }) {
  const navigate = useNavigate();

  let location = useLocation();

  React.useEffect(() => {
    setTimeout(() => {
      setLoading(false);
      if (JSON.parse(localStorage.getItem("degree")) === null)
        navigate("/degree-wizard");
      else navigate(location.pathname);
    }, 750);
  }, []);

  return (
    <div className="loadingPage">
      <img src={circlesLogo} alt="" className="loadingLogo pulse" />
    </div>
  );
}

export default Loading;
