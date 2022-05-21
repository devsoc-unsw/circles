/* eslint-disable */

import React, { useState, useSelector }  from "react";
import KebabMenu from "../KebabMenu";
import { Typography } from "antd";

import "./index.less";

const Marks = ({ courseCode }) => {
  const { Text } = Typography;
  const theState = useSelector(state => state);
  console.log("Marks State is ", theState);
  // console.log("courses in mark", courses);
  // const { mark } = courses[courseCode];
  const mark = 100;

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
