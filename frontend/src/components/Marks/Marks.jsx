import React from "react-redux";
// import KebabMenu from "../KebabMenu";
import { Typography } from "antd";
import "./index.less";

const Marks = ({ mark }) => {
  const { Text } = Typography;
  return (
    <div>
      <Text strong className="text">Mark: </Text>
      <Text className="text marks-val">
        {(mark === null || mark === undefined || mark === "") ? "N/A" : mark}
      </Text>
    </div>
  );
};

export default Marks;
