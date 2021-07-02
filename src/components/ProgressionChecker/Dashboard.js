import React, { useEffect, useState } from "react";
import { Typography } from "antd";
import { useSpring, animated } from "react-spring";
import DegreeComponentCard from "./DegreeComponentCard";
import LiquidProgressChart from "./LiquidProgressChart";
import SkeletonDashboard from "./SkeletonDashboard";

const Dashboard = ({ loading, degree }) => {
  const { Title } = Typography;
  const currYear = new Date().getFullYear();

  const props = useSpring({
    from: { opacity: 0 },
    to: { opacity: 1 },
    reset: true,
    config: { tension: 80, friction: 60 },
  });

  return (
    <div className="container">
      {loading ? (
        <SkeletonDashboard />
      ) : (
        <animated.div className="centered" style={props}>
          <LiquidProgressChart
            completedUOC={degree["completed_UOC"]}
            totalUOC={degree["UOC"]}
          />
          <a
            href={`https://www.handbook.unsw.edu.au/undergraduate/programs/${currYear}/${degree["code"]}?year=${currYear}`}
            target="_blank"
            rel="noopener noreferrer"
            className="textLink"
          >
            <Title className="text textLink">{degree["name"]}</Title>
          </a>
          <div className="cards">
            {degree["concentrations"].map((concentration, index) => (
              <DegreeComponentCard
                key={index}
                title={concentration["name"]}
                subTitle={concentration["type"]}
                completedUOC={concentration["completed_UOC"]}
                totalUOC={concentration["UOC"]}
              />
            ))}
          </div>
        </animated.div>
      )}
    </div>
  );
};

export default Dashboard;
