import React from "react";
import { Tooltip } from "antd";
import { notification } from "antd";
import { IoIosEyeOff } from "react-icons/io";
import { useSelector, useDispatch } from "react-redux";
import { plannerActions } from "../../../actions/plannerActions";

function HideYearTooltip({ year }) {
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

  const hideYear = (year) => {
    let i = 0;
    for (const [key, value] of Object.entries(hidden)) if (value) i++;
    if (i === numYears - 1) showCannotHideAllYearsNotification();
    else {
      dispatch(plannerActions("HIDE_YEAR", year));
    }
  };

  return (
    <Tooltip title="Hide year">
      <div className="eye" onClick={() => hideYear(year)}>
        <IoIosEyeOff />
      </div>
    </Tooltip>
  );
}

export default HideYearTooltip;
