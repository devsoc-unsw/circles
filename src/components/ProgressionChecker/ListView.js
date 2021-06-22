import React from "react";
import { Typography } from "antd";

function ListView({ title }) {
  const { Title } = Typography;
  return (
    <div
      style={{
        height: "100vh",
        padding: "2em",
      }}
      id={title}
    >
      <Title className="text">{title}</Title>
    </div>
  );
}

export default ListView;
