/* eslint-disable */

import React, { useSelector }  from "react-redux";
// import KebabMenu from "../KebabMenu";
import { Typography } from "antd";

import "./index.less";

const Marks = ({ courseCode }) => {
  const { Text } = Typography;
  console.log("going to select");
  const { mark } = useSelector((state) => state.planner.courses[courseCode]);

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
