import React from "react";
import { Tooltip, notification } from "antd";
import { IoIosEyeOff } from "react-icons/io";
import { useSelector, useDispatch } from "react-redux";
import { hideYear } from "../../reducers/plannerSlice";

const HideYearTooltip = ({ year }) => {
  const { hidden, numYears } = useSelector((state) => state.planner);
  const dispatch = useDispatch();

  const showCannotHideAllYearsNotification = () => {
    notification.open({
      type: "error",
      message: "Something's not right",
      description: "You cannot hide all years in your term planner",
      duration: 2,
    });
  };

  const handleHideYear = () => {
    const numHidden = Object.values(hidden).filter((h) => h).length;
    if (numHidden === numYears - 1) showCannotHideAllYearsNotification();
    else {
      dispatch(hideYear(year));
    }
  };

  return (
    <Tooltip title="Hide year">
      <div role="button" className="eye" onClick={handleHideYear}>
        <IoIosEyeOff />
      </div>
    </Tooltip>
  );
};

export default HideYearTooltip;
