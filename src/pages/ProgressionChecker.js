import React from "react";
import LiquidProgressChart from "../components/ProgressionChecker/LiquidProgressChart";
import { Button, Switch, Typography } from "antd";

function ProgressionChecker() {
  const { Title } = Typography;

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flexDirection: "column",
      }}
    >
      <LiquidProgressChart fillValue={0.6} />
      <Title className="text" style={{ marginBottom: "0.5em" }}>
        Engineering (Hons) / Science
      </Title>
    </div>
  );
}

export default ProgressionChecker;
