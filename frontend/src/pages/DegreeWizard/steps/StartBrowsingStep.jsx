import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import {
  Button, notification,
} from "antd";
import { setIsComplete } from "reducers/degreeSlice";
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
  const dispatch = useDispatch();
  const degree = useSelector((state) => state.degree);

  const saveUserSettings = () => {
    if (degree.programCode === "") {
      openNotification("Please select a degree");
    } else if (!degree.specs.length) {
      openNotification("Please select a specialisation");
    } else {
      dispatch(setIsComplete(true));
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
