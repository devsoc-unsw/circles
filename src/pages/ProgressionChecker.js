import React from "react";
import LiquidProgressChart from "../components/ProgressionChecker/LiquidProgressChart";
import { Button, Switch, Typography } from "antd";
import DegreeComponentCard from "../components/ProgressionChecker/DegreeComponentCard";

function ProgressionChecker() {
  const { Title, Text } = Typography;

  return (
    <div style={{ height: "100vh", display: "flex", justifyContent: "center" }}>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          flexDirection: "column",
          alignSelf: "center",
        }}
      >
        <LiquidProgressChart fillValue={0.6} completedUOC={60} totalUOC={200} />
        <Title
          className="text"
          style={{ marginBottom: "0.5em", marginTop: "0.8em" }}
        >
          Engineering (Hons) / Science
        </Title>
        <div
          style={{
            display: "flex",
            gap: "1em",
            marginTop: "1em",
          }}
        >
          <DegreeComponentCard
            title="Software Engineering"
            subTitle="Specialisation"
            completedUOC={60}
            totalUOC={200}
          />
          <DegreeComponentCard
            title="Bioinformatics"
            subTitle="Major"
            completedUOC={30}
            totalUOC={200}
          />
          <DegreeComponentCard
            title="Marine Science"
            subTitle="Minor"
            completedUOC={80}
            totalUOC={200}
          />
        </div>
      </div>
    </div>
  );
}

export default ProgressionChecker;
