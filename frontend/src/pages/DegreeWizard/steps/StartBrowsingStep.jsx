import React from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import {
  Button, notification,
} from "antd";
import "./steps.less";

const openNotification = (msg) => {
  const args = {
    message: msg,
    duration: 2,
    className: "text helpNotif",
    placement: "bottomRight",
  };
  notification.error(args);
};

const StartBrowsingStep = () => {
  const navigate = useNavigate();
  const degree = useSelector((state) => state.degree);

  const saveUserSettings = () => {
    if (degree.programCode === "") {
      openNotification("Please select a degree");
    } else if (!degree.majors.length && !degree.minors.length) {
      openNotification("Please select a specialisation");
    } else {
      navigate("/course-selector");
    }
  };

  return (
    <div className="steps-root-container">
      <div className="steps-start-browsing-container">
        <Button
          className="steps-next-btn"
          type="primary"
          onClick={saveUserSettings}
        >
          Start browsing courses!
        </Button>
      </div>
    </div>
  );
};

export default StartBrowsingStep;
