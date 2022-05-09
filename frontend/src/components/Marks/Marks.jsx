/* eslint-disable */

import React, { useState, useSelector }  from "react";
import KebabMenuIcon from "../KebabMenuIcon";
import { Typography } from "antd";

import "./index.less";

const Marks = ({ mark, showMarks }) => {
  // ? toShow should be handled by the parent?

  // const [mark, setMark] = useState(91);
  // const mark = 100;
  // const course = useSelector((state) => state.courses.course);

  const { Text } = Typography;

  return (showMarks) ? (
    <div className="marks-cont">
      <Text strong className="text">
        Mark:
      </Text>
      <Text className="text marks-val">
        {(mark && showMarks) ? mark : "N/A"}
      </Text>

      <KebabMenuIcon />
    </div>
  ) : null;
};

export default Marks;
