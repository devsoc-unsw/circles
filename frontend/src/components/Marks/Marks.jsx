import React, { useSelector } from "react-redux";
import { Typography } from "antd";

import "./index.less";

const Marks = ({ courseCode }) => {
  const { Text } = Typography;
  const { mark } = useSelector((state) => state.planner.courses[courseCode]);

  return (
    <div>
      <Text strong className="text">
        Mark:
      </Text>
      <Text className="text marks-val">
        {(mark === null || mark === undefined || mark === "") ? "N/A" : mark}
      </Text>
    </div>
  );
};

export default Marks;
