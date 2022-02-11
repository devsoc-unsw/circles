import React from "react";
import circlesLogo from "../../images/circlesWithBg.svg";
import "./loading.less";
import { useHistory } from "react-router-dom";

function Loading({ setLoading }) {
  const history = useHistory();

  React.useEffect(() => {
    setTimeout(() => {
      setLoading(false);
      if (JSON.parse(localStorage.getItem("degree")) === null)
        history.push("/degree-wizard");
      else history.push("/course-selector");
    }, 750);
  }, []);

  return (
    <div className="loadingPage">
      <img src={circlesLogo} alt="" className="loadingLogo pulse" />
    </div>
  );
}

export default Loading;
