import React from "react";
import { Typography } from "antd";

const Marks = ({ mark }) => {
  const { Text } = Typography;
  return (
    <div>
      <Text strong className="text">Mark: </Text>
      <Text>
        {/* Marks can be strings (i.e. HD, CR) or a number (i.e. 90, 85) */}
        {(mark === null || mark === undefined || mark === "") ? "N/A" : mark}
      </Text>
    </div>
  );
};

export default Marks;
