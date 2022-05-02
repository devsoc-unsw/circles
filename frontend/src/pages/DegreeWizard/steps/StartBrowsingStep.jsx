import React from "react";
import {
  Button, notification,
} from "antd";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import "./steps.less";
import { saveDegree } from "../../../reducers/degreeSlice";

const openNotification = (msg) => {
  const args = {
    message: msg,
    duration: 2,
    className: "text helpNotif",
    placement: "topRight",
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
    } else if (degree.specialisation === "") {
      openNotification("Please select a specialisation");
    } else {
      dispatch(saveDegree());
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
