import React from "react";
import LiquidProgressChart from "../components/ProgressionChecker/LiquidProgressChart";
import { Button, Switch, Typography } from "antd";
import DegreeComponentCard from "../components/ProgressionChecker/DegreeComponentCard";
import { useSpring, animated } from "react-spring";
function ProgressionChecker() {
  const { Title, Text } = Typography;
  const props = useSpring({
    to: { opacity: 1 },
    from: { opacity: 0 },
    delay: 200,
  });
  return (
    <div
      style={{
        height: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <animated.div className="centerCol" style={props}>
        <LiquidProgressChart fillValue={0.6} />
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
      </animated.div>
    </div>
  );
}

export default ProgressionChecker;
