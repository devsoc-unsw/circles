import React from "react";
import { Card, Progress, Typography } from "antd";
import { useSpring, animated } from "react-spring";
import DegreeComponentCard from "./DegreeComponentCard";
import LiquidProgressChart from "./LiquidProgressChart";

function Dashboard() {
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
        <LiquidProgressChart completedUOC={108} totalUOC={216} />
        <a
          href="https://www.handbook.unsw.edu.au/undergraduate/programs/2021/3767?year=2021"
          target="_blank"
          rel="noopener noreferrer"
          className="textLink"
        >
          <Title
            className="text textLink"
            style={{ marginBottom: "0.5em", marginTop: "0.8em" }}
          >
            Engineering (Hons) / Science
          </Title>
        </a>
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

export default Dashboard;
