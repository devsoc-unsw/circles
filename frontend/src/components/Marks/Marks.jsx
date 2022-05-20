/* eslint-disable */

import React, { useState, useSelector }  from "react";
import KebabMenu from "../KebabMenu";
import { Typography } from "antd";

import "./index.less";

const Marks = ({ courseCode }) => {
  const { Text } = Typography;
  const { courses }= useSelector(state => state.planner);
  const { mark } = courses[courseCode];

  return (
    <div>
      <Text strong className="text">
        Mark: 
      </Text>
      <Text className="text marks-val">
        {(mark) ? mark : " N/A"}
      </Text>
    </div >
  )
};

export default Marks;
